var tabTrigger;
var tooltipList;

function selectTab() {
    tabTrigger.show(); 
}

function initTooltips() {
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
}

function init() {
    // form nav section
    let menuTemp = '';
    for (let page of ['home', 'profile', 'messages', 'settings', 'jop']) {
        const isActive = page === 'home';
        const active = isActive ? ' active': '';
        const name = page === 'settings'? 'settings': 'home';
        menuTemp += `<li class="nav-item" role="presentation">`+
            `<button class="nav-link${active}" data-bs-toggle="tab" type="button" aria-selected="${isActive}"` + 
            `role="tab" data-bs-target="#${name}" aria-controls="${name}">${page}</button></li>\n`;
    }
    document.getElementById('myTab').innerHTML = menuTemp;
    // init tab trigger
    const triggerEl = document.querySelector('#myTab button[data-bs-target="#settings"]');
    tabTrigger = new bootstrap.Tab(triggerEl);

    // selectTab();
}

document.getElementById('selBtn').addEventListener('click', selectTab);

init();
initTooltips();
