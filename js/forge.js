import { setStatus, addHandlers, loadFromStorage, createElement } from './hp_common.js';
let config;
let selectedMenu;

const lsPrefix = 'hp_frg_'


function updateConfig(response) {
    config = response;
    if (config.pages.every(elem => elem.name !== selectedMenu)) {
        selectedMenu = config.pages.length > 0? config.pages[0].name: '';
    }
    const elements = [];
    for (const page of config.pages) {
        const newRow = createElement('ul', ["nav-item"], { role: "presentation" });
        elements.push(newRow);
        const isActive = selectedMenu === page.name;
        const newBtn = createElement('button', ['nav-link', isActive? 'active' : ''], {
            "data-bs-toggle": "pill",
            "type": "button",
            "aria-selected": isActive
        }, page.name);
        newRow.appendChild(newBtn);
    }
    // document.getElementById('nForgeMenu').replaceChildren(...elements);
}

function ShowStats() {

}

function reloadCfg() {
    fetch('json/forge.json').then(res => res.json().then(updateConfig));
}

function clickNav(item) {
    selectedMenu = item.delegateTarget.textContent;
    saveToStorage(lsPrefix + 'selected_menu', selectedMenu);
    ShowStats();
}

function init() {
    addHandlers({
        'click-reloadcfg': reloadCfg,
        'click-navigation': clickNav
    })
    selectedMenu = loadFromStorage(lsPrefix + "selected_menu");
    reloadCfg();
}

init();