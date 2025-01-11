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
    let [toendHrs, toendMins] = document.getElementById("timeToEnd")?.value.split(".");
    toendMins = 0.6 * Number(toendMins) ?? '0';
    const slots = document.getElementById("slots")?.value;
    const eggsCnt = document.getElementById("selEggsCnt")?.value;
    const filledEggs = document.getElementById("filledEggs")?.value;
    if (Number(mins) + Number(toendMins) > 60) {
        toendHrs++;
    } 
    toendMins = '55';
    const endTime = createElement('label', ["form-label"], {}, `${(Number(hrs) + Number(toendHrs)) % 24}:${Number(toendMins)}`);
    document.getElementById('Result').replaceChildren(endTime);
}
init();