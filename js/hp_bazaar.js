let config;
let selectedMenu;
let oldMarket = {};
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

function updateCrop(product, marketCrop) {
    if (product[0] == "-") return;
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
    const {low, high} = config.alerts_dict[product] ?? {};
    const color_map = {r: ' class="table-danger"', g: ' class="table-success"', d: ''};
    const color_buy = color_map[buy_price <= low ? 'r' : (buy_price >= high ? 'g' : 'd')];
    const color_sell = color_map[sell_price >= high ? 'r' : (sell_price <= low ? 'g' : 'd')];
    oldMarket[product] = {sell_price, sell_changes, buy_price, buy_changes, spread, buy_move, move_changes, color_buy, color_sell};
}

function drawMarket() {
    let tableData = "";
    let menuItems;
    if (selectedMenu == alertMenu) menuItems = config.Alerts.map(item => item.name);
    else menuItems = config.menu[selectedMenu];
    for (crop of menuItems) 
        if (crop[0] == '-') {
            tableData += `<tr><th colspan="8" class="text-center">${crop.slice(1)}</td></tr>`;
        } else {
            const marketCrop = oldMarket[crop];
            if (!marketCrop) continue;
            let product = crop.split('_').map(capitalize).join(' ');
            tableData += `<tr><th scope="row" class="text-start">${product}</th>
                <td${marketCrop.color_sell}>${formatNumber(marketCrop.sell_price)}</td>
                <td>${formatNumber(marketCrop.sell_changes, 1) + ' %'}</td>
                <td${marketCrop.color_buy}>${formatNumber(marketCrop.buy_price)}</td>
                <td>${formatNumber(marketCrop.buy_changes, 1) + ' %'}</td>
                <td>${formatNumber(marketCrop.spread) + ' %'}</td>
                <td>${formatNumber(marketCrop.buy_move, 0)}</td>
                <td>${formatNumber(marketCrop.move_changes, 0)}</td></tr>\n`
        }
    document.getElementById('tCrops').innerHTML = tableData;
}


function updateMarket(market) {
    if (!market.success) return updateStatus('Error loading market data');
    const crops = new Set();
    for (let section in config.menu) 
        for (let crop of config.menu[section]) crops.add(crop);
    for (let alert of config.Alerts) crops.add(alert.name);

    for (let crop of crops) updateCrop(crop, market.products[crop.toUpperCase()]);

    const lang = navigator.language || navigator.userLanguage;
    updateStatus('Last updated: ' + new Date(market.lastUpdated).toLocaleString(lang) + ` (${market.lastUpdated})`);
    updatedSuccessfully = true;
    drawMarket();
}

function downloadMarket() {
    fetch('https://api.hypixel.net/skyblock/bazaar').then(res => res.json().then(res => updateMarket(res)));
    if (currentInterval) clearInterval(currentInterval);
    currentInterval = setInterval(downloadMarket, updatedSuccessfully? 300000: 60000);
}

function formMenuItem(menu) {
    const isActive = menu == selectedMenu;
    const active = menu == selectedMenu ? ' active': '';
    return `<li class="nav-item" role="presentation"><button class="nav-link${active}" data-bs-toggle="pill" type="button" 
        aria-selected="${isActive}" onclick="navClick(this);">${menu}</button>\n`;
}

function updateConfig(response) {
    if (!response) return;
    config = response;
    if (selectedMenu != alertMenu && config.menu_order.indexOf(selectedMenu) < 0 && config.menu_order.length > 0) selectedMenu = config.menu_order[0];

    let menuTemp = ""
    for (let menu of config.menu_order) menuTemp += formMenuItem(menu);
    if (config.Alerts) {
        menuTemp += formMenuItem(alertMenu);
        config.alerts_dict = {}
        for (let elem of config.Alerts) config.alerts_dict[elem.name] = {low: elem.low, high: elem.high};
    }   

    document.getElementById('nMarketMenu').innerHTML = menuTemp;
    downloadMarket();
    // updateStatus(JSON.stringify(bzConfig, null, 2));
}

function init() {
    selectedMenu = localStorage?.getItem?.(lsPrefix + 'selectedMenu');
    fetch('json/bazaar_monitored.json').then(res => res.json().then(res => updateConfig(res)))
}

function navClick(item) {
    selectedMenu = item.textContent;
    localStorage?.setItem?.(lsPrefix + 'selectedMenu', selectedMenu);
    drawMarket();
} 