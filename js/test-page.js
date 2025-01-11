import {createElement, addColumn} from './hp_common.js';

let fadeNext;
let fadePeriod;
let fadeCollapse;
let fadeCount = 0;

function doCollapse() {
    if (fadeCount === 0) return;
    if (fadeCollapse) {
        fadeNext.classList.add('d-none')
        fadeNext = fadeNext.previousSibling;
    } else {
        fadeNext = fadeNext.nextSibling;
        fadeNext.classList.remove('d-none');
    }
    if (fadeCount-- > 0) setTimeout(doCollapse, fadePeriod);
}

function rowClick(item) {
    if (fadeCount !== 0) return;
    fadeNext = item.currentTarget;
    fadeCollapse = !(fadeNext.getAttribute('s-collapsed') === 'true');
    fadeNext.setAttribute('s-collapsed', fadeCollapse);
    fadeCount = Number(fadeNext.getAttribute('evnt-click-row'));
    fadePeriod = 80 / fadeCount;
    if (fadeCollapse) {
        for (let i = 0; i < fadeCount; i++) fadeNext = fadeNext.nextSibling;
    }
    setTimeout(doCollapse, fadePeriod);
}

function createTable(sections_count, elems_count) {
    const tableData = []
    while (sections_count-- > 0) {
        const newRow = createElement('tr', ['table-info'], { 'evnt-click-row': elems_count });
        tableData.push(newRow);
        newRow.addEventListener('click', rowClick);
        newRow.appendChild(createElement('th', ['text-start'], {}, 'Elements - ' + elems_count))
        addColumn(newRow, 'Value 1-' + sections_count);
        addColumn(newRow, 'Value 2-' + sections_count);
        for (let i = 0; i < elems_count; i++) {
            const newRow = createElement('tr', []);
            tableData.push(newRow);
            newRow.appendChild(createElement('th', ['text-start'], {}, 'Sub elem ' + i))
            addColumn(newRow, 'Value1-' + sections_count + '-' + i);
            addColumn(newRow, 'Value2-' + sections_count + '-' + i);
        }
        elems_count++;
    }
    document.getElementById('tCollapsable').replaceChildren(...tableData);
}

function init() {
    createTable(3, 2);
}

init();

