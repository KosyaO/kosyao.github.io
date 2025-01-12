import { addHandlers, loadFromStorage, saveToStorage } from './hp_common.js';

function calculateTime() {
    const date = new Date();
    let toendHrs = Number(document.getElementById("timeToEnd").value);
    const slots = document.getElementById("edSlots").value;
    const eggsCnt = document.getElementById("selEggsCnt").value;
    const filledEggs = document.getElementById("edFilledEggs").value;
    if (date.getMinutes() > 55) toendHrs++;
    document.getElementById('Result').textContent = `${(date.getHours() + toendHrs) % 24}:55`;
}

function init() {
    addHandlers({
        'click-calc': calculateTime,
    });
}


init();