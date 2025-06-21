import {addColumn, addHandlers, createElement, loadFromStorage, saveToStorage} from './hp_common.js';
const prefix = "hoppity_";
let endTime, hitmanTime;
let calcResult;

const timezone_offset = new Date().getTimezoneOffset() * 60000;
const msToStr = time => new Date(time).toLocaleString('en-GB', {timeStyle: "medium"});
const strToSeconds = (str) => str.split(':').reduce((prev, curr) => prev * 60 + Number(curr), 0);
const egg_spawn = ['00:50', '06:40', '12:30', '20:50', '26:40', '32:30', '40:50', '46:40', '52:30'].map(strToSeconds);

function updateTimeLabel(time, name) {
    if (time === undefined) return;
    let timeToEnd = time - Date.now();
    if (timeToEnd < 0) timeToEnd = 0;
    document.getElementById(name).textContent = msToStr(timeToEnd + timezone_offset);
}

function updateTimeEnd() {
    updateTimeLabel(endTime, 'lbEndTimeCounter');
    updateTimeLabel(hitmanTime, 'lbHitmanCd');
    document.getElementById('lbEndTime').textContent = endTime === undefined ? '' : msToStr(endTime);
}

function setEventEnd() {
    let hours_left = Number(document.getElementById("hoursToEnd").value);
    const current_time = Math.trunc(Date.now() / 100000); // time in seconds / 100
    endTime = Math.trunc(current_time / 36 + hours_left + (current_time % 36 >= 33)) * 3600000 + 3300000
    saveToStorage(prefix + 'endTime', endTime);
}

function changeEdit(event) {
    const ctrl = event.target;
    saveToStorage(prefix + ctrl.id, ctrl.value);
}

function loadControl(name, defValue) {
    document.getElementById(name).value = loadFromStorage(prefix + name) ?? defValue;
}

function setHitmanCooldown() {
    hitmanTime = Date.now();
    hitmanTime += 1000 * strToSeconds(document.getElementById('hitmanCooldown').value);
    saveToStorage(prefix + 'hitmanTime', hitmanTime);
}

function clickAdd(event) {
    let add_time = 3600000;
    if (event.ctrlKey) {
        add_time *= 10;
        event?.preventDefault();
    }
    if (event.shiftKey) {
        add_time /= 3;
        event?.preventDefault();
    }
    const ctrl = event.target;
    if (ctrl.text.at(0) === '+') hitmanTime += add_time;
    else hitmanTime -= add_time;
    saveToStorage(prefix + 'hitmanTime', hitmanTime);
}

function nearestSpawn(current_time) {
    const curHour = Math.trunc(current_time / 3600);
    const curMinSec = current_time % 3600;
    let nearest_spawn = 0;
    while (nearest_spawn < egg_spawn.length && curMinSec >= egg_spawn[nearest_spawn]) nearest_spawn++;
    return (curHour + (nearest_spawn === egg_spawn.length)) * 3600 + egg_spawn[nearest_spawn % egg_spawn.length];
}

function simulateHoppity({current_time, time_limit, hitman_eggs, eggs_on_map, hitman_cooldown,
                         max_hitman_slots}, collect_first = 0) {
    const getHitmanSlots = () => max_hitman_slots - hitman_eggs - Math.ceil(hitman_cooldown / 1200);
    let total_accumulated = 0, total_collected = 0;
    let actions = [];
    let isTimeLimit;

    actions.push({action: 'Start', start_time: current_time, hitman_eggs, hitman_slots: getHitmanSlots(), hitman_cooldown})
    while (hitman_eggs < max_hitman_slots) {
        let nearest_spawn = nearestSpawn(current_time);
        isTimeLimit = time_limit !== undefined && nearest_spawn >= time_limit;
        if (isTimeLimit) break;
        hitman_cooldown = Math.max(0, hitman_cooldown - nearest_spawn + current_time);
        const hitman_slots = getHitmanSlots();
        const action = {start_time: nearest_spawn, hitman_eggs, hitman_slots, hitman_cooldown};
        if (collect_first > 0) {
            action.action = 'Collect';
            collect_first--;
            total_collected++;
        } else {
            if (eggs_on_map < 6 || hitman_slots > 0) {
                total_accumulated++;
                if (eggs_on_map < 6) {
                    action.action = 'Spawned on map';
                    eggs_on_map++
                }
                else {
                    action.action = 'Accumulate';
                    hitman_eggs++;
                }
            } else {
                action.action = 'Collect';
                total_collected++;
            }
        }
        current_time = nearest_spawn;
        actions.push(action);
    }
    actions.push({ action: 'Finish' + (isTimeLimit? ' (time limit)': ''), start_time: current_time,
        hitman_eggs, hitman_slots: getHitmanSlots(), hitman_cooldown });
    return {total_accumulated, total_collected, actions};
}

function drawResults() {
    if (calcResult === undefined) return;
    const compact = document.getElementById('cbCompact').checked;
    let actions = [];
    for (const action of calcResult.actions) {
        action.end_time = undefined;
        action.count = undefined;
        if (compact && actions.length > 0 && actions.at(-1).action === action.action) {
            actions.at(-1).end_time = action.start_time;
            actions.at(-1).count = 1 + (actions.at(-1).count ?? 1);
        } else actions.push(action);
    }
    const tableData = [];
    for (const item of actions) {
        const newRow = createElement('tr');
        tableData.push(newRow);
        let time_point = msToStr(item.start_time * 1000);
        if (item.end_time !== undefined) {
            time_point += ' - ' + msToStr(item.end_time * 1000);
        }
        const action = item.action + (item.count === undefined ? '' : ' x ' + item.count);
        addColumn(newRow, time_point);
        addColumn(newRow, action, ['text-start']);
        addColumn(newRow, item.hitman_eggs);
        addColumn(newRow, item.hitman_slots);
        addColumn(newRow, msToStr(item.hitman_cooldown * 1000 + timezone_offset));
    }
    document.getElementById('tResults').replaceChildren(...tableData);
}

function calcHoppity() {
    const params = {
        current_time: Math.trunc(Date.now() / 1000),
        time_limit: endTime === undefined ? undefined : Math.trunc(endTime / 1000),
        hitman_eggs: Number(document.getElementById("filledEggs").value),
        eggs_on_map: Number(document.getElementById("selEggsCnt").value),
        hitman_cooldown: (hitmanTime === undefined) ? 0 : Math.max(0, Math.trunc((hitmanTime - Date.now()) / 1000)),
        max_hitman_slots: Number(document.getElementById("maxHitmanSlots").value)
    }
    calcResult = simulateHoppity(params);
    if (document.getElementById('cbCollectFirst').checked) calcResult = simulateHoppity(params, calcResult.total_collected);
    drawResults();
}

function changeCompact() {
    saveToStorage(prefix + 'cbCompact', document.getElementById('cbCompact').checked);
    drawResults();
}

function changeCollect() {
    saveToStorage(prefix + 'cbCollectFirst', document.getElementById('cbCollectFirst').checked);
}

function init() {
    addHandlers({
        'click-set-end': setEventEnd,
        'click-set-hitman': setHitmanCooldown,
        'click-add': clickAdd,
        'change-edit': changeEdit,
        'click-calc': calcHoppity,
        'change-compact': changeCompact,
        'change-collect': changeCollect
    });
    loadControl('hoursToEnd', '5');
    loadControl('hitmanCooldown', '5:15:00');
    loadControl('selEggsCnt', '0');
    loadControl('filledEggs', '0');
    loadControl('maxHitmanSlots', '28');
    document.getElementById('cbCollectFirst').checked =
        'true' === (loadFromStorage(prefix + 'cbCollectFirst') ?? 'false');
    document.getElementById('cbCompact').checked =
        'true' === (loadFromStorage(prefix + 'cbCompact') ?? 'true');

    const endTimeStr = loadFromStorage(prefix + 'endTime');
    if (endTimeStr !== null) endTime = Number(endTimeStr);
    const hitmanStr = loadFromStorage(prefix + 'hitmanTime');
    if (hitmanStr !== null) hitmanTime = Number(hitmanStr);
    setInterval(updateTimeEnd, 1000);
}

init();