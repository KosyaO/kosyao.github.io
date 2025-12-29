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

export function getSkyblockYear() {
    const SB_START = 1560275700000;
    const SB_YEAR_MS = 372 * 20 * 60000; // days per sb year, real minutes per sb year, ms per minute
    const elapsedMS = Date.now() - SB_START;
    return elapsedMS / SB_YEAR_MS;
}

