import { setStatus, addHandlers, loadFromStorage, saveToStorage, createElement, createTooltip,
    addColumn, formatNumber, snakeToFlu, shortThousands, setShortThousands } from './hp_common.js';
import { bazaarDownload, bazaarUpdate } from './bazaar.mjs'

let config = { shards: {} };
let market = { last_updated: 0, products: {} };
let crafts = {};
let tooltipList = [];
let marketUpdateTime = 0, marketUpdating = false, marketUpdateInterval = 300000;

const lsPrefix = 'hp_attr_';

function calcShard(shardId) {

}

function updateCraft() {
    Object.values(crafts).forEach(craft => craft.obtain_price = undefined);
    Object.keys(config.shards).forEach(shardId => calcShard(shardId));
}

function saveConfig() {
    saveToStorage(lsPrefix + 'config', JSON.stringify(config));
}

function updateConfig(response) {
    config = response;
    saveConfig();
    updateCraft();
}

function reloadCfg() {
    fetch('json/attributes.json').then(res => res.json().then(updateConfig));
}

function priceUpdate(data) {
    bazaarUpdate(undefined, data, market);
    saveToStorage('hypixel_market', JSON.stringify(market));
    marketUpdating = false;
    setStatus('Last updated: ' + new Date(data.time_updated).toLocaleString(navigator.language) + ` (load time: ${data.load_time/1000} sec)`);
    updateCraft();
}

function maintainMarket() {
    if (marketUpdating || marketUpdateTime > Date.now()) return;
    setStatus('Updating market data...');
    marketUpdating = true;
    marketUpdateTime = Date.now() + marketUpdateInterval;
    bazaarDownload().then(priceUpdate).catch(error => {
        marketUpdating = false;
        setStatus(error.message);
        marketUpdateTime = Date.now() + 60000;
    });
}

function init() {
    addHandlers({
        'click-reloadcfg': reloadCfg
    });
    let data_str = loadFromStorage(lsPrefix + 'config');
    if (data_str) updateConfig(JSON.parse(data_str));
    else reloadCfg();
    data_str = loadFromStorage('hypixel_market');
    if (data_str) market = JSON.parse(data_str);
    marketUpdateTime = market.last_updated + marketUpdateInterval;
    setInterval(maintainMarket, 500);
}

init();