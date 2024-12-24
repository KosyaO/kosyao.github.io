import { createElement } from './hp_common.js';

var tabTrigger;
var tooltipList;

function selectTab() {
    tabTrigger.show(); 
}

function initTooltips() {
    const triggers = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltipList = [...triggers].map(trigger => new bootstrap.Tooltip(trigger));
}

function createMenuOld(menu) {
    let menuTemp = '';
    for (let page of menu) {
        const isActive = page === 'home';
        const target = page === 'settings'? 'settings': 'home';
        menuTemp += `<li class="nav-item" role="presentation">`+
            `<button class="nav-link${isActive ? ' active': ''}" type="button" data-bs-toggle="tab" aria-selected="${isActive}"` + 
            `role="tab" data-bs-target="#${target}" aria-controls="${target}">${page}</button></li>\n`;
    }
    document.getElementById('myTab').innerHTML = menuTemp;
}

function createMenu(menu) {
    const elements = [];
    for (let page of menu) {
        const isActive = page === 'home';
        const target = page === 'settings'? 'settings': 'home';

        const newLi = createElement('li', ['nav-item'], { 'role': 'presentation'});
        const newBt = createElement('button', ['nav-link', isActive? 'active': ''], { 
            'type': 'button', 
            'data-bs-toggle': 'tab', 
            'aria-selected': isActive, 
            'role': 'tab', 
            'data-bs-target': '#' + target, 
            'aria-controls': target
        });
        newBt.appendChild(document.createTextNode(page));
        newLi.appendChild(newBt);
        elements.push(newLi);
    }
    document.getElementById('myTab').replaceChildren(...elements);
}

function init() {
    // form nav section
    createMenu(['home', 'profile', 'messages', 'settings', 'jop']);
    // init tab trigger
    const triggerEl = document.querySelector('#myTab button[data-bs-target="#settings"]');
    tabTrigger = new bootstrap.Tab(triggerEl);
    // selectTab();
}

document.getElementById('selBtn').addEventListener('click', selectTab);

init();
initTooltips();
