import { setStatus, addHandlers, loadFromStorage, saveToStorage, createElement, createTooltip,
    addColumn, formatNumber, snakeToFlu, shortThousands, setShortThousands } from './hp_common.js';

import { bazaarDownload, bazaarUpdate } from './bazaar.mjs'
let config = { shards: {} };
let prices = { last_updated: 0, products: {} };

const lsPrefix = 'hp_attr_';
const lang = (navigator.language || navigator.userLanguage);

function saveConfig() {
    saveToStorage(lsPrefix + 'config', JSON.stringify(config));
}

function updateConfig(response) {
    config = response;
    saveConfig();
}

function reloadCfg() {
    fetch('json/attributes.json').then(res => res.json().then(updateConfig));
}

function init() {
    addHandlers({
        'click-reloadcfg': reloadCfg
    })
    const conf_str = loadFromStorage(lsPrefix + 'config');
    if (conf_str) updateConfig(JSON.parse(conf_str));
    else reloadCfg();
}

init();