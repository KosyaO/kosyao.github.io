import { addHandlers, loadFromStorage, saveToStorage } from './hp_common.js';
const prefix = "hoppity_";
let endTime, hitmanCd;

const timezone_offset = new Date().getTimezoneOffset() * 60;

const secondsToStr = time => new Date(time + timezone_offset).toLocaleString('en-GB', {timeStyle: "medium"});

function updateTimeEnd() {
    if (endTime === undefined) return;
    let timeToEnd = endTime * 1000 - Date.now();
    if (timeToEnd < 0) timeToEnd = 0;
    document.getElementById("lbEndTime").textContent = secondsToStr(timeToEnd);
}

function setEventEnd() {
    let hours_left = Number(document.getElementById("timeToEnd").value);
    const current_time = Math.trunc(Date.now() / 1000);
    endTime = Math.trunc(current_time / 3600 + hours_left + (current_time % 3600 >= 3300)) * 3600 + 3300
    saveToStorage(prefix + 'endTime', endTime);
}

function setHitmanCooldown() {

}

function init() {
    addHandlers({
        'click-setend': setEventEnd,
        'click-sethitman': setHitmanCooldown
    });
    const timeStr = loadFromStorage(prefix + 'endTime');
    if (timeStr !== null) endTime = Number(timeStr);
    setInterval(updateTimeEnd, 1000);
}

init();