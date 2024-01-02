let config;
let selectedMenu;
let oldMarket = {};
let currentInterval;
let updatedSuccessfully = true;
const alertMenu = 'Alert';

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

function formatNumber(num, digits=2) {
    if (num > 1000) return (num / 1000).toFixed(digits) + 'k';
    return num.toFixed(digits);
}


function updateMarket(market) {
    if (!market.success) return updateStatus('Error loading market data');
    let tableData = "";
    let menuItems;
    if (selectedMenu == alertMenu) menuItems = config.Alerts.map(item => item.name);
    else menuItems = config.menu[selectedMenu];
    for (crop of menuItems) 
        if (crop[0] == '-') {
            tableData += `<tr><th colspan="8" class="text-center">${crop.slice(1)}</td></tr>`;
        } else {
            let product, sell_price, sell_changes, buy_price, buy_changes, spread, buy_move, move_changes;
            product = crop.split('_').map(capitalize).join(' ');
            const marketCrop = market.products[crop.toUpperCase()];
            if (!marketCrop) continue;
            sell_price = averagePrice(marketCrop.sell_summary);
            const s_old = oldMarket[product]?.sell_price ?? 0;
            sell_changes = s_old? (sell_price - s_old) / s_old * 100: 0;
            buy_price = averagePrice(marketCrop.buy_summary);
            const b_old = oldMarket[product]?.buy_price ?? 0;
            buy_changes = b_old? (buy_price - b_old) / b_old * 100: 0;
            spread = buy_price? (buy_price - sell_price) / sell_price * 100 : 999;
            if (spread > 999.99) spread = 999.99;
            buy_move = marketCrop.quick_status.buyMovingWeek;
            move_changes = buy_move - (oldMarket[product]?.buy_move ?? buy_move);

            tableData += `<tr><th scope="row" class="text-start">${product}</th>
                <td>${formatNumber(sell_price)}</td>
                <td>${formatNumber(sell_changes, 1) + ' %'}</td>
                <td>${formatNumber(buy_price)}</td>
                <td>${formatNumber(buy_changes, 1) + ' %'}</td>
                <td>${formatNumber(spread) + ' %'}</td>
                <td>${formatNumber(buy_move, 0)}</td>
                <td>${formatNumber(move_changes, 0)}</td></tr>\n`
            oldMarket[product] = {sell_price, sell_changes, buy_price, buy_changes, spread, buy_move, move_changes};
        }
    document.getElementById('tCrops').innerHTML = tableData;
    updateStatus('Last updated: ' + market.lastUpdated);
    updatedSuccessfully = true;
}

function downloadMarket() {
    fetch('https://api.hypixel.net/skyblock/bazaar').then(res => res.json().then(res => updateMarket(res)));
    if (currentInterval) clearInterval(currentInterval);
    currentInterval = setInterval(downloadMarket, updatedSuccessfully? 20000: 6000);
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
    if (config.menu_order.indexOf(selectedMenu) < 0 && config.menu_order.length > 0) selectedMenu = config.menu_order[0];

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
    updateStatus("This is text!");
    fetch('json/bazaar_monitored.json').then(res => res.json().then(res => updateConfig(res)))
    // let request = new XMLHttpRequest();
    // request.open("GET", 'json/bazaar_monitored.json');
    // request.responseType = "json";
    // request.send();
    // request.onload = () => updateConfig(request.response);
}

function navClick(item) {
    selectedMenu = item.textContent;
    downloadMarket();
}