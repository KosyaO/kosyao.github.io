import { addHandlers, loadFromStorage, saveToStorage } from './hp_common.js';
const prefix = "hoppity_";
let endTime;

function updateEndTime() {
    const timeStr = endTime?.toLocaleString('en-GB', {dateStyle: "short", timeStyle: "short"});
    document.getElementById('edEndTime').value = timeStr;
}

function updateTimeEnd() {
    if (endTime === undefined) return;
    let timeToEnd = endTime - new Date();
    const hrs = Math.trunc(timeToEnd / 3600000);
    const mins = Math.trunc((timeToEnd - hrs * 3600000) / 60000);
    const secs = Math.trunc((timeToEnd - hrs * 3600000 - mins * 60000) / 1000);
    const txt = `${hrs}:${mins}:${secs}`;
    document.getElementById("lbTimeToEnd").textContent = txt;
}

function calculateTime() {
    let toendHrs = Number(document.getElementById("timeToEnd").value);
    const slots = document.getElementById("edSlots").value;
    const eggsCnt = document.getElementById("selEggsCnt").value;
    const filledEggs = document.getElementById("edFilledEggs").value;
    endTime = new Date();
    if (endTime.getMinutes() > 55) toendHrs++;
    endTime.setHours(endTime.getHours() + toendHrs, 55);
    saveToStorage(prefix + 'endTime', endTime);
    updateEndTime();
}

function init() {
    addHandlers({
        'click-calc': calculateTime,
    });
    const timeStr = loadFromStorage(prefix + 'endTime');
    if (timeStr !== null) endTime = new Date(timeStr);
    updateEndTime();
    setInterval(updateTimeEnd, 1000);
}

init();