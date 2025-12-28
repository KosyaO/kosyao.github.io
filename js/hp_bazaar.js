import { setStatus, addHandlers, loadFromStorage, saveToStorage, createElement, addColumn, snakeToFlu } from './hp_common.js';
import { bazaarUpdate, bazaarDownload } from './bazaar.mjs';

let config = { };
let prices = { last_updated: 0, products: {} };
let selectedMenu;
let currentInterval;
let lsPrefix = 'hp_baz_';

const lang = (navigator.language || navigator.userLanguage);
const formatter = [0, 1, 2].map(num => new Intl.NumberFormat(lang.slice(0, 2), {maximumFractionDigits: num, minimumFractionDigits: num}));

function formatNumber(num, maximumFractionDigits=2, short_thousands = true) {
    let postfix = '';
    // if (num > 10e6) {
    //     num /= 1e6;
    //     postfix = 'M';
    // } else 
    if (short_thousands && num > 10000) { 
        num/= 1000; 
        postfix='k'; 
    }
    return (formatter[maximumFractionDigits] ?? formatter[2]).format(num) + postfix;
}

function getAlertColors(product, buy_price, sell_price) {
    const {low, high} = (config['Alerts'] ?? {})[product] ?? {};
    const color_map = {r: 'table-danger', g: 'table-success', d: ''};
    const color_buy = color_map[buy_price <= low ? 'r' : (buy_price >= high ? 'g' : 'd')];
    const color_sell = color_map[sell_price >= high ? 'r' : (sell_price <= low ? 'g' : 'd')];
    return {color_buy, color_sell};
}

function updateEstimation() {
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

    let tableData = [];
    for (let {income, contest, crops} of estimation) {
        crops.forEach(({crop, harvested, sale_crop, price, crop_income, color_buy}, idx) => {
            const newRow = createElement('tr');
            if (idx === 0) {
                newRow.appendChild(createElement('th', ['text-start'], {'scope': 'row', 'rowspan': crops.length}, contest));
                newRow.appendChild(createElement('td', [], {'rowspan': crops.length}, formatNumber(income, 0)));
            }
            addColumn(newRow, crop ?? contest);
            addColumn(newRow, formatNumber(harvested, 0, false));
            addColumn(newRow, snakeToFlu(sale_crop));
            addColumn(newRow, formatNumber(price, 1), [color_buy]);
            addColumn(newRow, formatNumber(crop_income, 1));
            tableData.push(newRow);
        });
    }
    document.getElementById('tEstimation').replaceChildren(...tableData);
}

function drawMarket() {
    let menuItems;
    for (let page of config['Pages'])
        if (page.name === selectedMenu) {
            menuItems = page.items;
            break;
        }
    if (menuItems === undefined) return;

    const tableData = [];
    for (let crop of menuItems) {
        const newRow = createElement('tr');
        tableData.push(newRow);
        if (crop[0] === '-') {
            let text = crop.slice(1);
            newRow.appendChild(createElement('th', ['text-center'], {'colspan': 8}, text === ''? '-': text));
            continue;
        } 
        const marketCrop = prices.products[crop];
        newRow.appendChild(createElement('th', ['text-start'], {'scope': 'row'}, snakeToFlu(crop)));
        if (!marketCrop) {
            newRow.appendChild(createElement('th', ['text-center'], {'colspan': 7}, 'not found in hypixel data'));
            continue;
        } 
        const {color_buy, color_sell} = getAlertColors(crop, marketCrop.buy_price, marketCrop.sell_price);
        addColumn(newRow, formatNumber(marketCrop.sell_price), [color_sell]);
        addColumn(newRow, formatNumber(marketCrop.sell_changes, 1) + ' %');
        addColumn(newRow, formatNumber(marketCrop.buy_price), [color_buy]);
        addColumn(newRow, formatNumber(marketCrop.buy_changes, 1) + ' %');
        addColumn(newRow, formatNumber(marketCrop.spread) + ' %');
        addColumn(newRow, formatNumber(marketCrop.sell_moving_week, 0));
        addColumn(newRow, formatNumber(marketCrop.buy_moving_week, 0));
    }
    document.getElementById('tBazaar').replaceChildren(...tableData);
}

function marketSchedule(error) {
    const updatedUnsuccessfully = error !== undefined;
    if (updatedUnsuccessfully) setStatus(error.message);
    if (currentInterval) clearInterval(currentInterval);
    currentInterval = setInterval(downloadMarket, updatedUnsuccessfully? 20000: 65000 );
}

function updateMarket(market) {
    if (!market.success) return marketSchedule({ message: 'Error loading market data' });
    marketSchedule();
    bazaarUpdate(market, prices);

    setStatus('Last updated: ' + new Date(market.lastUpdated).toLocaleString(lang) + ` (load time: ${market.load_time/1000} sec)`);
    saveToStorage(lsPrefix + 'prices', JSON.stringify(prices));
    updateEstimation();
    drawMarket();
}

function downloadMarket() {
    bazaarDownload().catch(marketSchedule).then(updateMarket);
}

function updateConfig(response) {
    if (!response) return;
    config = response;
    const pages = config['Pages'];

    // restore selected menu
    if (pages.every(elem => elem.name !== selectedMenu)) {
        selectedMenu = pages.length > 0? pages[0].name: '';
    }

    const elements = [];
    for (let page of pages) {
        const isActive = page.name === selectedMenu;
        const target = 'pills-' + (page.type ?? 'bazaar');

        const newLi = createElement('li', ['nav-item'], { 'role': 'presentation' });
        const newBt = createElement('button', ['nav-link', isActive? 'active': ''], { 
            'type': 'button', 
            'data-bs-toggle': 'pill', 
            'aria-selected': isActive, 
            'role': 'tab', 
            'data-bs-target': '#' + target, 
            'aria-controls': target
        }, page.name);
        newLi.appendChild(newBt);
        elements.push(newLi);
    }
    document.getElementById('nMarketMenu').replaceChildren(...elements);

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
    fetch('json/bazaar_monitored_new.json').then(res => res.json().then(updateConfig));
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
