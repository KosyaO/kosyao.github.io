import { readFile } from 'node:fs/promises';

function stringifyValue(value) {
    if (value === undefined) return 'undefined';
    if (value === null) return 'null';
    if (typeof value === 'string') return '"' + value + '"';
    return value.toString();
}

export function stringify(obj, spacing = 2, offset = 0) {
    // simple value
    if (obj === null || typeof obj !== 'object') return stringifyValue(obj);
    // one line array or object
    const elCount = Array.isArray(obj) ? obj.length : Object.values(obj).filter(item => item !== undefined).length;
    if (elCount < 6 && Object.values(obj).every(value => value === null || typeof value !== 'object')) {
        // plain array
        if (Array.isArray(obj)) {
            return '[' + obj.map(item => stringifyValue(item)).join(', ') + ']';
        }
        // plain object
        const resArr = [];
        for (let [key, value] of Object.entries(obj)) {
            if (value !== undefined) resArr.push(`"${key}": ` + stringifyValue(value));
        }
        return '{' + resArr.join(', ') + '}';
    }
    
    const prefix = ''.padEnd(spacing + offset);
    const resArr = [];
    if (Array.isArray(obj)) {
        // multiline array
        for (let value of obj) {
            if (value === null || typeof value !== 'object') {
                resArr.push(prefix + stringifyValue(value));
            } else {
                resArr.push(prefix + stringify(value, spacing, offset + spacing));
            }
        }
        return '[\n' + resArr.join(',\n') + '\n' + ''.padEnd(offset) + ' ]';
    }
    // multiline object
    for (let [key, value] of Object.entries(obj)) {
        if (value === undefined) continue;
        const start = prefix + `"${key}": `;
        if (value === null || typeof value !== 'object') {
            resArr.push(start + stringifyValue(value));
        } else {
            resArr.push(start + stringify(value, spacing, offset + spacing));
        }
    }
    return '{\n' + resArr.join(',\n') + '\n' + ''.padEnd(offset) + '}';
}

export async function stringify_test() {
    const path = new URL('../kosyao.github.io/json/forge.json', import.meta.url);
    const data = await readFile(path, { encoding: 'utf8' });
    const parsed = JSON.parse(data);
    // const obj = {id: 1, und: undefined, text: 'asd', nuu: null, boo: true, obj: {a: 3, b: 5, c:6, d: [1, 3], e: 8, f: undefined, g: 9}, flo: 3.3, jop: 2};
    // const arr = [1, 'asd', null, true, 3.3, [5, ["123", "456"],6], "jop"];
    // console.log(JSON.stringify(obj, null, 2));
    const str = stringify(parsed);
    console.log(str);
    const back = JSON.parse(str);
    console.log(back);
}