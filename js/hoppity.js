import { setStatus, addHandlers, createElement, loadFromStorage} from './hp_common.js';
function init() {
    addHandlers({
        'click_calc': calculateTime,
    })
    start();
}
function start () {
    const button = createElement('button', [], {}, "Calculate!");
    button.addEventListener('click', calculateTime);
    document.getElementById('tHoppity').replaceChildren(button);
}
function calculateTime() {
    let [hrs, mins] = new Date().toLocaleString('en-GB', {timeStyle: 'short'}).split(":");
    let toendHrs = document.getElementById("timeToEnd")?.value;
    const slots = document.getElementById("slot")?.value;
    const eggsCnt = document.getElementById("selEggsCnt")?.value;
    const filledEggs = document.getElementById("filledEggs")?.value;
    if (Number(mins) > 60) {
        toendHrs++;
    } 
    const endTime = createElement('label', ["form-label"], {}, `${(Number(hrs) + Number(toendHrs)) % 24}:55`);
    document.getElementById('Result').replaceChildren(endTime);
}
init();