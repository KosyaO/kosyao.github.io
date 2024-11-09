import { bazaarUpdate } from './bazaar.mjs';

let config = {};
let prices = { last_updated: 0, products: {} };
let selectedMenu;
let currentInterval;
let lsPrefix = 'hp_baz_';

const capitalize = word => word.slice(0, 1).toUpperCase() + word.slice(1);

function updateStatus(text) {
    const ctrl = document.getElementById('cStatus');
    text = text.replaceAll('\n','<br>').replaceAll(' ', '&nbsp;');
    ctrl.innerHTML = text;
}

function formatNumber(num, maximumFractionDigits=2) {
    let postfix = '';
    const lang = (navigator.language || navigator.userLanguage).slice(0, 2);
    if (num > 10000) { 
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
            const product = crop.split('_').map(capitalize).join(' ');
            const marketCrop = prices.products[crop];
            tableData += `<tr><th scope="row" class="text-start">${product}</th>`
            if (!marketCrop) 
                tableData += `<th colspan="7" class="text-center">not found in hypixel data</td></tr>`;
            else {
                const {color_buy, color_sell} = getAlertColors(crop, marketCrop.buy_price, marketCrop.sell_price);
                tableData += `<td${color_sell}>${formatNumber(marketCrop.sell_price)}</td>
                    <td>${formatNumber(marketCrop.sell_changed, 1) + ' %'}</td>
                    <td${color_buy}>${formatNumber(marketCrop.buy_price)}</td>
                    <td>${formatNumber(marketCrop.buy_changed, 1) + ' %'}</td>
                    <td>${formatNumber(marketCrop.spread) + ' %'}</td>
                    <td>${formatNumber(marketCrop.buy_moving_week, 0)}</td>
                    <td>${formatNumber(marketCrop.buy_moving_changes, 0)}</td></tr>\n`
            }
        }
    document.getElementById('tCrops').innerHTML = tableData;
}

function marketSchedule(error) {
    const updatedUnsuccessfully = error !== undefined;
    if (updatedUnsuccessfully) updateStatus(error.message);
    if (currentInterval) clearInterval(currentInterval);
    currentInterval = setInterval(downloadMarket, updatedUnsuccessfully? 60000: 300000 );
}

function updateMarket(market) {
    if (!market.success) return marketSchedule({ message: 'Error loading market data' });
    marketSchedule();
    bazaarUpdate(config.goods, market, prices);

    const lang = navigator.language || navigator.userLanguage;
    updateStatus('Last updated: ' + new Date(market.lastUpdated).toLocaleString(lang) + ` (${market.lastUpdated})`);
    localStorage?.setItem?.(lsPrefix + 'prices', JSON.stringify(prices));
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
        menuTemp += `<li class="nav-item" role="presentation"><button class="nav-link${active}" data-bs-toggle="pill"` + 
                    ` type="button" aria-selected="${isActive}">${page.name}</button></li>\n`;
        if ((page.type ?? 'bazaar') === 'bazaar') page.items.forEach(config.goods.add, config.goods);
    }

    document.getElementById('nMarketMenu').innerHTML = menuTemp;
    downloadMarket();
}

function navClick(item) {
    selectedMenu = item.delegateTarget.textContent;
    localStorage?.setItem?.(lsPrefix + 'selectedMenu', selectedMenu);
    drawMarket();
}

function addHandlers() {
    const handlers = {
        'click-navigation': navClick,
    };
    
    for (let [kind, handler] of Object.entries(handlers)) {
        const elements = document.querySelectorAll(`*[evnt-${kind}]`);
        console.log(elements);
        const [eventType] = kind.split('-',1);
        elements.forEach(element => element.addEventListener(eventType, handler));
    }
}

function init() {
    // addHandlers();  commented because only one handler now
    document.getElementById('nMarketMenu').addEventListener('click', navClick);

    selectedMenu = localStorage?.getItem?.(lsPrefix + 'selectedMenu');
    const oldStr = localStorage?.getItem?.(lsPrefix + 'prices');
    if (oldStr) prices = JSON.parse(oldStr);
    const cfgStr = localStorage?.getItem?.(lsPrefix + 'config');
    if (cfgStr !== null) {
        updateConfig(JSON.parse(cfgStr));
    }
    else fetch('json/bazaar_monitored_new.json').then(res => res.json().then(res => {
        localStorage?.setItem?.(lsPrefix + 'config', JSON.stringify(res));
        updateConfig(res);
    }))
}

init();
