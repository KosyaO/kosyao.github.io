import { auctionDownload, auctionFilter, translate_attribute_name, 
    generate_armor_template, generate_piece_template, templates } from './auction.mjs';

let searchProcessed = false;
let auctionData = { time_updated: 0 };

function fillTable(filtered, max_items = 999) {
    let found_total = 0, passed_total = 0;
    for (let item_name in filtered.counter) {
        let {found, passed} = filtered.counter[item_name];
        found_total += found;
        passed_total += passed;
    }
    
    let tableData = "";
    const ctrl = document.getElementById('perOneCol');
    
    if (filtered.attribute_sort === true) {
        filtered.result.sort((a, b) => a.price_one - b.price_one);
        ctrl.classList.remove('d-none');
    } else {
        filtered.result.sort((a, b) => a.top_bid - b.top_bid);
        ctrl.classList.add('d-none');
    }
    const intl = new Intl.NumberFormat('en',{minimumFractionDigits: 1, maximumFractionDigits: 1});
    let printed = 0;
    for (let item of filtered.result) {
        const item_name = item['item_name'].slice(0, 30);
        const top_bid = intl.format(item.top_bid);
        const per_one = intl.format(item.price_one);
        const item_lore = item.lore_entries.map(elem => elem.replace('✖', '').trim()).join(', ');
        const bin = item['bin'] ? '' : 'No';
        tableData += `<tr><th scope="row">${item_name}</th><td class="text-end">${top_bid}</td>
          <td class="text-end${filtered.attribute_sort? "": " d-none"}">${per_one}</td>
          <td>${bin}</td><td>${item_lore}</td></tr>`;
        if (++printed >= max_items) break;
    }
    document.getElementById('tResults').innerHTML = tableData;
    return {passed_total, found_total};
}

function setStatus(text) {
    const status = document.getElementById('cStatus'); 
    status.innerHTML = text;
}

async function auctionSearch(filter) {
    if (searchProcessed) {
        setStatus('The search has already been run.');
        return;
    }
    searchProcessed = true;
    try {
        const need_update = Date.now() - auctionData.time_updated > 30000;
        if (need_update) {
            setStatus('Downloading data...');
            auctionData = await auctionDownload(state => 
                setStatus(`Downloading auction (${state.loaded}/${state.total ?? '?'} pages loaded)...`)
            );
        }
        setStatus('Processing data...');
        const filtered = auctionFilter(auctionData, filter);
        const {passed_total, found_total} = fillTable(filtered);
        const load_time = need_update ? auctionData.load_time/1000 + ' sec' : 'cache';
        setStatus(`Search completed, filtered ${passed_total} items from ${found_total}, Load time: ${load_time}`);
    } catch (error) {
        setStatus(`Loading error: ${error}`);
    }
    searchProcessed = false;
}

function searchBtn() {
    let filter = {};
    const template = document.getElementById('itemTemplate').value;
    if (template === "") {
        const itemName = document.getElementById('itemName').value;
        const attributeSearch = document.getElementById('attributeSearch').checked;
        const part = document.getElementById('tOption2');
        const name = document.getElementById('tOption3');
        const attr1 = document.getElementById('attribute1');
        const attr2 = document.getElementById('attribute2');
        const attributes = [];
        if (attributeSearch && attr1.value === "") {
            setStatus('You must select attribute for attribute search');
            return;
        }
        if (attr1.value !== "") attributes.push(translate_attribute_name(attr1.value));
        if (!attr2.hasAttribute('disabled') && attr2.value !== "") attributes.push(translate_attribute_name(attr2.value));

        if (name.checked) {
            filter = generate_armor_template(itemName, attributes, attributeSearch);
        } else if (part.checked) {
            filter = generate_piece_template(itemName, attributes, attributeSearch);
        } else {
            filter[itemName] = { 'lore_entries': attributes };
            filter.attribute_sort = attributeSearch;
        }
    } else filter = templates[template];
    console.log(filter);
    auctionSearch(filter).then(()=> console.log('Search completed'));
}

function setDisabled(ctrlName, value) {
    const ctrl = document.getElementById(ctrlName);
    if (value) ctrl.setAttribute('disabled', 'true')
        else ctrl.removeAttribute('disabled');
}

function setVisible(ctrlName, value) {
    const ctrl = document.getElementById(ctrlName);
    if (value) ctrl.classList.remove('d-none')
        else ctrl.classList.add('d-none');
}

function clearBtn() {
    document.getElementById('attribute1').value = '';
    document.getElementById('attribute2').value = '';
}

function templateSelect(event) {
    setVisible('pnlParams', event.target.value === "");
}

function armorChanged() {
    const name = document.getElementById('armorName');
    const part = document.getElementById('partName');
    const nameValue = name.hasAttribute('disabled') ? '' : name.value;
    const partValue = part.hasAttribute('disabled') ? '' : part.value;
    document.getElementById('itemName').value = (nameValue + ' ' + partValue).trim();
}

function namePress(event) {
    if (event.key === "Enter") {
        searchBtn();
    }
}

function optionChanged(element) {
    const attributeSearch = document.getElementById('attributeSearch').checked;
    const tmpPart = document.getElementById('tOption2').checked;
    const tmpName = document.getElementById('tOption3').checked;
    setDisabled('attribute2', attributeSearch);
    setDisabled('armorName', tmpPart);
    setDisabled('partName', tmpName);
    setDisabled('itemName', tmpPart && attributeSearch);
    if (element.target.id !== 'attributeSearch') armorChanged(element);
}

function init() {
    const handlers = {
        'click-search': searchBtn,
        'click-clear': clearBtn,
        'change-armor': armorChanged,
        'keydown-name': namePress,
        'change-template': templateSelect,
        'change-option': optionChanged
    }
    
    for (let [kind, handler] of Object.entries(handlers)) {
        const elements = document.querySelectorAll(`*[evnt-${kind}]`);
        console.log(kind, elements);
        const [eventType] = kind.split('-',1);
        elements.forEach(element => element.addEventListener(eventType, handler));
    }
}

init();

