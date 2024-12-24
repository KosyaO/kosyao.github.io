import { addHandlers, loadFromStorage, saveToStorage } from './hp_common.js';
import { bazaarUpdate } from './bazaar.mjs';

let config = {};
let prices = { last_updated: 0, products: {} };
let selectedMenu;
let currentInterval;
let lsPrefix = 'hp_baz_';

const capitalize = word => word.slice(0, 1).toUpperCase() + word.slice(1);
const snakeToFlu = word => word.split('_').map(capitalize).join(' ');

function updateStatus(text) {
    const ctrl = document.getElementById('cStatus');
    text = text.replaceAll('\n','<br>').replaceAll(' ', '&nbsp;');
    ctrl.innerHTML = text;
}

function formatNumber(num, maximumFractionDigits=2, short_thousands = true) {
    let postfix = '';
    const lang = (navigator.language || navigator.userLanguage).slice(0, 2);
    // if (num > 10e6) {
    //     num /= 1e6;
    //     postfix = 'M';
    // } else 
    if (short_thousands && num > 10000) { 
        num/= 1000; 
        postfix='k'; 
    }
    return new Intl.NumberFormat(lang, {maximumFractionDigits, minimumFractionDigits: maximumFractionDigits}).format(num) + postfix;
}

function getAlertColors(product, buy_price, sell_price) {
    const {low, high} = (config['Alerts'] ?? {})[product] ?? {};
    const color_map = {r: ' class="table-danger"', g: ' class="table-success"', d: ''};
    const color_buy = color_map[buy_price <= low ? 'r' : (buy_price >= high ? 'g' : 'd')];
    const color_sell = color_map[sell_price >= high ? 'r' : (sell_price <= low ? 'g' : 'd')];
    return {color_buy, color_sell};
}

function updateEstimation() {
    let tableData = "";
    const estimation = [];
    for (let [contest, data] of Object.entries(config['Estimation'] ?? {})) {
        let income = 0;
        const crops = [];
        for (let {crop, harvested, sale_crop, ratio, npc_cost, add_cost} of data) {
            const marketCrop = prices.products[sale_crop] ?? {};
            const price = Math.max(marketCrop.buy_price ?? 0, npc_cost ?? 0);
            const {color_buy} = getAlertColors(sale_crop, marketCrop.buy_price, marketCrop.sell_price);
            const crop_income = harvested / ratio * (price - (add_cost ?? 0));
            income += crop_income;
            crops.push({crop, harvested, sale_crop, price, crop_income, color_buy});
        }
        estimation.push({income, contest, crops});
    }
    estimation.sort((a, b) => b.income - a.income);
    
    for (let {income, contest, crops} of estimation) {
        let firstLine = true;
        for (let {crop, harvested, sale_crop, price, crop_income, color_buy} of crops) {
            tableData += '<tr>';
            if (firstLine) {
                tableData += `<th scope="row" rowspan="${crops.length}" class="text-start">${contest}</th>`+
                             `<td rowspan="${crops.length}">${formatNumber(income, 0)}</td>`;
            }
            tableData += `<td>${crop ?? contest}</td>
                          <td>${formatNumber(harvested, 0, false)}</td>
                          <td>${snakeToFlu(sale_crop)}</td>
                          <td${color_buy}>${formatNumber(price, 1)}</td>
                          <td>${formatNumber(crop_income, 1)}</td>`;
            tableData += '</tr>\n';
            firstLine = false;
        }
    }
    document.getElementById('tEstimation').innerHTML = tableData;
}

function drawMarket() {
    let tableData = "";
    let menuItems;
    for (let page of config['Pages'])
        if (page.name === selectedMenu) {
            menuItems = page.items;
            break;
        }
    if (menuItems === undefined) return;

    for (let crop of menuItems)
        if (crop[0] === '-') {
            let text = crop.slice(1);
            if (text === '') text = '&nbsp;'
            tableData += `<tr><th colspan="8" class="text-center">${text}</td></tr>`;
        } else {
            const product = snakeToFlu(crop);
            const marketCrop = prices.products[crop];
            tableData += `<tr><th scope="row" class="text-start">${product}</th>`
            if (!marketCrop) 
                tableData += `<th colspan="7" class="text-center">not found in hypixel data</th></tr>`;
            else {
                const {color_buy, color_sell} = getAlertColors(crop, marketCrop.buy_price, marketCrop.sell_price);
                tableData += `<td${color_sell}>${formatNumber(marketCrop.sell_price)}</td>
                    <td>${formatNumber(marketCrop.sell_changes, 1) + ' %'}</td>
                    <td${color_buy}>${formatNumber(marketCrop.buy_price)}</td>
                    <td>${formatNumber(marketCrop.buy_changes, 1) + ' %'}</td>
                    <td>${formatNumber(marketCrop.spread) + ' %'}</td>
                    <td>${formatNumber(marketCrop.sell_moving_week, 0)}</td>
                    <td>${formatNumber(marketCrop.buy_moving_week, 0)}</td></tr>\n`
            }
        }
    document.getElementById('tBazaar').innerHTML = tableData;
}

function marketSchedule(error) {
    const updatedUnsuccessfully = error !== undefined;
    if (updatedUnsuccessfully) updateStatus(error.message);
    if (currentInterval) clearInterval(currentInterval);
    currentInterval = setInterval(downloadMarket, updatedUnsuccessfully? 20000: 65000 );
}

function updateMarket(market) {
    if (!market.success) return marketSchedule({ message: 'Error loading market data' });
    marketSchedule();
    bazaarUpdate(config.goods, market, prices);

    const lang = navigator.language || navigator.userLanguage;
    updateStatus('Last updated: ' + new Date(market.lastUpdated).toLocaleString(lang) + ` (${market.lastUpdated})`);
    saveToStorage(lsPrefix + 'prices', JSON.stringify(prices));
    updateEstimation();
    drawMarket();
}

function downloadMarket() {
    const download = fetch('https://api.hypixel.net/skyblock/bazaar');
    download.catch(marketSchedule).then(res => res?.json().then(res => updateMarket(res)).catch(marketSchedule));
}

function updateConfig(response) {
    if (!response) return;
    config = response;
    const pages = config['Pages'];

    // restore selected menu
    if (pages.every(elem => elem.name !== selectedMenu)) {
        selectedMenu = pages.length > 0? pages[0].name: '';
    }

    let menuTemp = ""
    config.goods = new Set(config['Hidden'] ?? []);
    for (let page of pages) {
        const isActive = page.name === selectedMenu;
        const active = isActive ? ' active': '';
        const pageType = page.type ?? 'bazaar';
        menuTemp += `<li class="nav-item" role="presentation">`+
            `<button class="nav-link${active}" data-bs-toggle="pill" type="button" aria-selected="${isActive}"` + 
            `role="tab" data-bs-target="#pills-${pageType}" aria-controls="pills-${pageType}">${page.name}</button></li>\n`;
        if (pageType === 'bazaar') page.items.forEach(config.goods.add, config.goods);
    }

    document.getElementById('nMarketMenu').innerHTML = menuTemp;
    downloadMarket();
    if (selectedMenu === 'Estimation') {
        document.getElementById('pills-bazaar').classList.remove('show', 'active');
        document.getElementById('pills-estimation').classList.add('show', 'active');
    }   
}

function navClick(item) {
    selectedMenu = item.delegateTarget.textContent;
    saveToStorage(lsPrefix + 'selectedMenu', selectedMenu);
    drawMarket();
}

function reloadConfig() {
    fetch('json/bazaar_monitored_new.json').then(res => res.json().then(res => updateConfig(res)));
}

function init() {
    addHandlers({
        'click-navigation': navClick,
        'click-reloadcfg': reloadConfig
    });

    selectedMenu = loadFromStorage(lsPrefix + 'selectedMenu');
    const oldStr = loadFromStorage(lsPrefix + 'prices');
    if (oldStr) prices = JSON.parse(oldStr);
    reloadConfig();
}

init();
