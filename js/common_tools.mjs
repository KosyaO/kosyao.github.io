import fs from "fs/promises";
import { stringify } from "./stringifier.mjs";

export const globalAbort = new AbortController();

export async function fetchTimeout(url, headers = undefined, timeoutMs = 10000) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const signal = AbortSignal.any([controller.signal, globalAbort.signal]);
        const response = await fetch(url, { headers, signal });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        return await response.json();
    } finally {
        clearTimeout(timeout);
    }
}

export async function writeJsonToFile(fileName, data) {
    if (data?.file_changed !== undefined) data.file_changed = Date.now();
    const filePath = new URL(fileName, import.meta.url);
    const tmpPath = new URL(fileName + '.tmp', import.meta.url);
    try {
        await fs.writeFile(tmpPath, stringify(data), 'utf8');
        await fs.rename(tmpPath, filePath);
        if (data?.file_changed !== undefined) {
            const stat = await fs.stat(filePath);
            data.file_changed = stat.mtimeMs;
        }
    } catch (err) {
        console.log(`Error saving file "${fileName}":`, err);
    }
}

export async function readJsonFromFile(fileName, initial = {}) {
    let result = initial;
    const filePath = new URL(fileName, import.meta.url);
    try {
        const stat = await fs.stat(filePath);
        if (result.file_changed !== undefined && stat.mtimeMs <= result.file_changed) return result;
        const fileData = await fs.readFile(filePath, { encoding: 'utf8' });
        result = JSON.parse(fileData);
        if (result.file_changed !== undefined) result.file_changed = stat.mtimeMs;
    } catch (error) {
        console.log(`Error reading data from "${fileName}"`);
    }
    return result;
}

export function getSkyblockYear() {
    const SB_START = 1560275700000;
    const SB_YEAR_MS = 372 * 20 * 60000; // days per sb year, real minutes per sb year, ms per minute
    const elapsedMS = Date.now() - SB_START;
    return elapsedMS / SB_YEAR_MS;
}

