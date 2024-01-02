let config;
let selectedMenu;
let oldMarket = {};

const capitalize = word => word.slice(0, 1).toUpperCase() + word.slice(1);

function updateStatus(text) {
    const ctrl = document.getElementById('cStatus');
    text = text.replaceAll('\n','<br>').replaceAll(' ', '&nbsp;');
    ctrl.innerHTML = text;
}


function updateMarket(market) {
    if (!market.success) return updateStatus('Error loading market data');
    let tableData = "";
    for (crop of config.menu[selectedMenu]) {
        let product, sell_price, sell_changes, buy_price, buy_changes, spread, buy_move, move_changes;
        product = crop.split('_').map(capitalize).join(' ');
        tableData += `<tr><th scope="row">${product}</th><td>${sell_price}</td>
        <td>+0.0%</td><td>buy_price</td><td>-0.1%</td><td>12.2%</td><td>4 367.2k</td><td>9 199</td></tr>\n`
        oldMarket[product] = {sell_price, sell_changes, buy_price, buy_changes, spread, buy_move, move_changes};
    }
    document.getElementById('tCrops').innerHTML = tableData;
}

function downloadMarket() {
    fetch('https://api.hypixel.net/skyblock/bazaar').then(res => res.json().then(res => updateMarket(res)));
}

function updateConfig(response) {
    if (!response) return;
    config = response;
    if (config.menu_order.indexOf(selectedMenu) < 0 && config.menu_order.length > 0) selectedMenu = config.menu_order[0];
    let menuTemp = ""
    for (let menu of config.menu_order) {
        const isActive = menu == selectedMenu;
        const active = menu == selectedMenu ? ' active': '';
        menuTemp += `<li class="nav-item" role="presentation"><button class="nav-link${active}" data-bs-toggle="pill" type="button" 
        aria-selected="${isActive}" onclick="navClick(this);">${menu}</button>\n`;
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
    updateStatus(selectedMenu + ' clicked');
    downloadMarket();
}