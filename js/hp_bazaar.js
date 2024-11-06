import { bazaarUpdate } from './bazaar.mjs';

let config = {};
let alerts = {};
let oldMarket = {};
let selectedMenu;
let currentInterval;
let updatedSuccessfully = true;
let lsPrefix = 'hp_baz_';
const alertMenu = 'Alerts';

const capitalize = word => word.slice(0, 1).toUpperCase() + word.slice(1);

function updateStatus(text) {
    const ctrl = document.getElementById('cStatus');
    text = text.replaceAll('\n','<br>').replaceAll(' ', '&nbsp;');
    ctrl.innerHTML = text;
}

function averagePrice(summary) {
    let cnt = 0, sum = 0;
    summary.slice(0, 3).map(item => { cnt += item.amount; sum += item.pricePerUnit * item.amount});
    return cnt ? sum / cnt : 0;
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

function drawMarket() {
    let tableData = "";
    let menuItems;
    if (selectedMenu === alertMenu) menuItems = config.Alerts.map(item => item.name);
    else menuItems = config.menu[selectedMenu];
    for (let crop of menuItems)
        if (crop[0] === '-') {
            tableData += `<tr><th colspan="8" class="text-center">${crop.slice(1)}</td></tr>`;
        } else {
            const product = crop.split('_').map(capitalize).join(' ');
            const marketCrop = oldMarket[crop];
            tableData += `<tr><th scope="row" class="text-start">${product}</th>`
            if (!marketCrop) 
                tableData += `<th colspan="7" class="text-center">not found in hypixel data</td></tr>`;
            else tableData += `<td${marketCrop.color_sell}>${formatNumber(marketCrop.sell_price)}</td>
                <td>${formatNumber(marketCrop.sell_changes, 1) + ' %'}</td>
                <td${marketCrop.color_buy}>${formatNumber(marketCrop.buy_price)}</td>
                <td>${formatNumber(marketCrop.buy_changes, 1) + ' %'}</td>
                <td>${formatNumber(marketCrop.spread) + ' %'}</td>
                <td>${formatNumber(marketCrop.buy_move, 0)}</td>
                <td>${formatNumber(marketCrop.move_changes, 0)}</td></tr>\n`
        }
    document.getElementById('tCrops').innerHTML = tableData;
}

function updateCrop(product, marketCrop) {
    if (product[0] === "-" || marketCrop === undefined) return;
    let sell_price, sell_changes, buy_price, buy_changes, spread, buy_move, move_changes;
    sell_price = averagePrice(marketCrop.sell_summary);
    const s_old = oldMarket[product]?.sell_price;
    sell_changes = s_old? (sell_price - s_old) / s_old * 100: 0;
    buy_price = averagePrice(marketCrop.buy_summary);
    const b_old = oldMarket[product]?.buy_price;
    buy_changes = b_old? (buy_price - b_old) / b_old * 100: 0;
    spread = buy_price? (buy_price - sell_price) / sell_price * 100 : 999;
    if (spread > 999.99) spread = 999.99;
    buy_move = marketCrop.quick_status.buyMovingWeek;
    move_changes = buy_move - (oldMarket[product]?.buy_move ?? buy_move);
    const {low, high} = alerts[product] ?? {};
    const color_map = {r: ' class="table-danger"', g: ' class="table-success"', d: ''};
    const color_buy = color_map[buy_price <= low ? 'r' : (buy_price >= high ? 'g' : 'd')];
    const color_sell = color_map[sell_price >= high ? 'r' : (sell_price <= low ? 'g' : 'd')];
    oldMarket[product] = {sell_price, sell_changes, buy_price, buy_changes, spread, buy_move, move_changes, color_buy, color_sell};
}

function marketSchedule(error) {
    updatedSuccessfully = error === undefined;
    if (error) updateStatus(error.message);
    if (currentInterval) clearInterval(currentInterval);
    currentInterval = setInterval(downloadMarket, updatedSuccessfully? 300000: 60000);
}

function updateMarket(market) {
    if (!market.success) return marketSchedule({ message: 'Error loading market data' });
    marketSchedule();
    const crops = new Set();
    for (let section in config.menu) 
        for (let crop of config.menu[section]) crops.add(crop);
    for (let alert of config.Alerts) crops.add(alert.name);

    for (let crop of crops) updateCrop(crop, market.products[crop.toUpperCase()]);

    const lang = navigator.language || navigator.userLanguage;
    updatedSuccessfully = true;
    updateStatus('Last updated: ' + new Date(market.lastUpdated).toLocaleString(lang) + ` (${market.lastUpdated})`);
    localStorage?.setItem?.(lsPrefix + 'oldMarket', JSON.stringify(oldMarket));
    drawMarket();
}

function downloadMarket() {
    const download = fetch('https://api.hypixel.net/skyblock/bazaar');
    download.catch(marketSchedule).then(res => res?.json().then(res => updateMarket(res)).catch(marketSchedule));
}

function formMenuItem(menu) {
    const isActive = menu === selectedMenu;
    const active = isActive ? ' active': '';
    return `<li class="nav-item" role="presentation"><button class="nav-link${active}" data-bs-toggle="pill" type="button" 
        aria-selected="${isActive}">${menu}</button>\n`;
}

function updateConfig(response) {
    if (!response) return;
    config = response;
    if (selectedMenu !== alertMenu && config.menu_order.indexOf(selectedMenu) < 0 && config.menu_order.length > 0) selectedMenu = config.menu_order[0];

    let menuTemp = ""
    for (let menu of config.menu_order) menuTemp += formMenuItem(menu);
    if (config.Alerts) {
        menuTemp += formMenuItem(alertMenu);
        alerts = {}
        for (let elem of config.Alerts) alerts[elem.name] = {low: elem.low, high: elem.high};
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
    // addHandlers();  because only one handler now
    document.getElementById('nMarketMenu').addEventListener('click', navClick);

    selectedMenu = localStorage?.getItem?.(lsPrefix + 'selectedMenu');
    const oldStr = localStorage?.getItem?.(lsPrefix + 'oldMarket');
    if (oldStr) oldMarket = JSON.parse(oldStr);
    const cfgStr = localStorage?.getItem?.(lsPrefix + 'config');
    if (cfgStr) {
        updateConfig(JSON.parse(cfgStr));
    }
    else fetch('json/bazaar_monitored.json').then(res => res.json().then(res => {
        localStorage?.setItem?.(lsPrefix + 'config', JSON.stringify(res));
        updateConfig(res);
    }))
}

init();
