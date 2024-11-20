import { auctionDownload, calculatePrices, real_templates, bazaar_items } from './auction.mjs';
import { bazaarDownload, bazaarUpdate } from './bazaar.mjs'

let searchProcessed = false;
let auctionData  = { time_updated: 0 };
let bazaarData   = { time_updated: 0 };
let bazaarPrices = { last_updated: 0, products: {} };

function setStatus(text) {
    const status = document.getElementById('cStatus'); 
    status.innerHTML = text;
}

function fillTable(filtered, max_items = 999) {
    const intl = new Intl.NumberFormat('en',{minimumFractionDigits: 1, maximumFractionDigits: 1});
    let tableData = "";
    let printed = 0;
    for (let item of filtered) {
        const item_name = item['item_name'].slice(0, 30);
        const bin = item['bin'] ? '' : 'No';
        const top_bid = intl.format(item.top_bid);
        const real_price = intl.format(item.real_price/1e6) + 'M';
        const profit = intl.format(item.profit/1e6) + 'M';
        const profit_color = item.profit > 0? 'table-success': 'table-danger';
        const enchants_price = intl.format(item.ench_price/1e6) + 'M';
        const star_price = intl.format(item.star_price/1e6) + 'M';
        const scrolls_price = intl.format(item.scrolls_price/1e6) + 'M';
        tableData += `<tr class="text-end"><th scope="row" class="text-start">${item_name}</th>
            <td>${bin}</td><td>${top_bid}</td><td>${real_price}</td><td class="${profit_color}">${profit}</td>
            <td>${enchants_price}</td><td>${star_price}</td><td>${scrolls_price}</td></tr>`;
        if (++printed >= max_items) break;
    }
    document.getElementById('tResults').innerHTML = tableData;
    return printed
}

async function auctionSearch(filter) {
    if (searchProcessed) {
        setStatus('Search already ran');
        return;
    }
    searchProcessed = true;
    try {
        const need_update = Date.now() - bazaarData.time_updated > 10000;
        if (need_update) {
            setStatus('Downloading auction...');
            auctionData = await auctionDownload();
            setStatus('Downloading bazaar...');
            bazaarData = await bazaarDownload();
            const goods = bazaar_items.concat([filter.essence.code]);
            bazaarUpdate(goods, bazaarData, bazaarPrices);
        }
        setStatus('Processing data...');

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
    const filter = real_templates[template];
    auctionSearch(filter).then(()=> console.log('Search completed'));
}

function init() {
    const handlers = {
        'click-search': searchBtn,
    }
    
    for (let [kind, handler] of Object.entries(handlers)) {
        const elements = document.querySelectorAll(`*[evnt-${kind}]`);
        console.log(elements);
        const [eventType] = kind.split('-',1);
        elements.forEach(element => element.addEventListener(eventType, handler));
    }
}

init();

