import { addHandlers, loadFromStorage, saveToStorage, stringify } from './hp_common.js';

let storagePath, backPath;
let verifiedContent;
let saveModal;

function getConfig() {
    const conf_str = loadFromStorage(storagePath);
    const config = JSON.parse(conf_str);
    if (storagePath === 'hp_frg_config') {
        config.pages.forEach(page => page.elements.forEach(element => element.idx = undefined));
        for (let [item_id, recipe] of Object.entries(config.recipes)) {
            recipe.craft_price = undefined;
            recipe.result_craft_time = undefined;
            recipe.buy_price = undefined;
            recipe.sell_price = undefined;
            recipe.components.forEach(component => {
                component.buy_price = undefined;
                component.sell_price = undefined;
                component.craft_price = undefined;
                component.result_craft_time = undefined;
                component.result_price = undefined;
                component.percent = undefined;
            });
        }
    }
    document.getElementById('edConfigJson').value = stringify(config, 4);
}

function clickClose() {
    window.location.assign(backPath);
}

function clickSave() {
    if (verifiedContent === undefined) return;
    saveToStorage(storagePath, verifiedContent);
    clickClose();
}

function clickConfirm() {
    try {
        const config = JSON.parse(document.getElementById('edConfigJson').value);
        verifiedContent = JSON.stringify(config);
        document.getElementById('pnlError').classList.add('d-none');
        saveModal.show();
    } catch (error) {
        document.getElementById('spErrorText').textContent = error;
        document.getElementById('pnlError').classList.remove('d-none');
    }
}

function init() {
    saveModal = new bootstrap.Modal(document.getElementById('saveChanges'));
    const params = new URLSearchParams(window.location.search);
    if (params.has('forge')) {
        storagePath = 'hp_frg_config';
        backPath = 'forge.html';
    } else if (params.has('attrs')) {
        storagePath = 'hp_attr_config';
        backPath = 'attributes.html';
    }

    addHandlers({
        'click-cancel': clickClose,
        'click-confirm': clickConfirm,
        'click-save': clickSave
    });
    getConfig();
    const freeSpace = window.innerHeight - document.getElementById('pnlJson').offsetHeight - document.getElementById('btnDescr').offsetHeight - 2;
    const edText = document.getElementById('edConfigJson');
    if (freeSpace > 0) edText.style.height = `${edText.offsetHeight + freeSpace}px`;
}

init();