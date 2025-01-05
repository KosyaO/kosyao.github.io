import { formatNumber, setStatus, addHandlers, createElement, createTooltip, addColumn } from './hp_common.js';
import { auctionDownload, calculatePrices, real_templates, bazaar_items } from './auction.mjs';
import { bazaarDownload, bazaarUpdate } from './bazaar.mjs'

let searchProcessed = false;
let auctionData  = { time_updated: 0 };
let bazaarData   = { time_updated: 0 };
let bazaarPrices = { last_updated: 0, products: {} };
let tooltipList = [];

function fillTable(filtered, max_items = 999) {
    let tableData = [];
    let printed = 0;
    tooltipList.forEach(tooltip => tooltip.hide());
    tooltipList.length = 0;
    for (let item of filtered) {
        const entries = Object.entries(item.price_entries).sort((a, b) => b[1] - a[1]);
        const tooltip = entries.map(elem => `<b>${elem[0]}</b>: ${formatNumber(elem[1]/1e6)}M`).join('<br/>');

        const newRow = createElement('tr', ['text-end']);
        newRow.appendChild(createElement('th', ['text-start'], {'scope': 'row'}, item['item_name'].slice(0, 30)));

        addColumn(newRow, item['bin'] ? '' : 'No');
        addColumn(newRow, formatNumber(item.top_bid));
        const tooltipElem = createTooltip('td', tooltip, [], formatNumber(item.real_price/1e6) + 'M');
        newRow.appendChild(tooltipElem);
        tooltipList.push(new bootstrap.Tooltip(tooltipElem));
        addColumn(newRow, formatNumber(item.profit/1e6) + 'M', [item.profit > 0? 'table-success': 'table-danger']);
        addColumn(newRow, formatNumber(item.ench_price/1e6) + 'M');
        addColumn(newRow, formatNumber(item.star_price/1e6) + 'M');
        addColumn(newRow, formatNumber(item.scrolls_price/1e6) + 'M');
        tableData.push(newRow);
        if (++printed >= max_items) break;
    }
    document.getElementById('tResults').replaceChildren(...tableData);
    return printed;
}

async function auctionSearch(filter) {
    if (searchProcessed) {
        setStatus('The search has already been run.');
        return;
    }
    searchProcessed = true;
    const outdatedCtrl = document.getElementById('pOutdated');
    try {
        const need_update = Date.now() - bazaarData.time_updated > 30000;
        if (need_update) {
            if (auctionData.time_updated > 0 && bazaarPrices.last_updated > 0) {
                outdatedCtrl.classList.remove('d-none');
                fillTable(calculatePrices(auctionData, bazaarPrices, filter));
            }

            setStatus('Downloading auction...');
            auctionData = await auctionDownload(state => 
                setStatus(`Downloading auction (${state.loaded}/${state.total ?? '?'} pages loaded)...`)
            );
            setStatus('Downloading bazaar...');
            bazaarData = await bazaarDownload();
            bazaarUpdate(bazaar_items, bazaarData, bazaarPrices);
        }
        setStatus('Processing data...');
        outdatedCtrl.classList.add('d-none');

        const filtered = calculatePrices(auctionData, bazaarPrices, filter);
        fillTable(filtered);
        const load_time = need_update ? `auction - ${auctionData.load_time/1000} sec, bazaar - ${bazaarData.load_time/1000}` : 'cache';
        setStatus(`Search completed, ${filtered.length} items found, Load time: ${load_time}`);
    } catch (error) {
        setStatus(`Loading error: ${error}`);
    }
    searchProcessed = false;
}

function searchBtn() {
    const template = document.getElementById('searchTemplate').value;
    auctionSearch(real_templates[template]).then(()=> console.log('Search completed'));
}

function reloadConfig() {

}

function init() {
    addHandlers({
        'click-search': searchBtn,
        'click-reloadcfg': reloadConfig
    });

    const options = Object.keys(real_templates).map(item_code => 
        createElement('option', [], {'value': item_code}, real_templates[item_code].item_name));
    document.getElementById('searchTemplate').replaceChildren(...options);
}

init();
