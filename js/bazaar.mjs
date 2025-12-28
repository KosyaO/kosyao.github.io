import {fetchTimeout} from "./common_tools.mjs";

function round(float_number, digits = 0) {
    return parseFloat(float_number.toFixed(digits));
}

function topOrdersAverage(arr) {
    let count = 0;
    let sum = 0;
    arr.slice(0, 3).forEach((item) => {
        count += item['amount'];
        sum += item['pricePerUnit'] * item['amount'];
    })
    return round(count > 0 ? sum / count : 0, 1);
}

export function bazaarUpdate(bazaar, prices, goods = undefined) {
    const calcChanges = (newVal, oldVal) => oldVal === undefined ? 0 : (newVal - oldVal) * 100 / oldVal;
    const last_up = bazaar['lastUpdated'];
    prices['last_updated'] = last_up;
    if (goods === undefined) goods = Object.keys(bazaar['products']).map(name => name.toLowerCase());

    for (let good of goods) {
        const product = bazaar['products'][good.toUpperCase()];
        if (product !== undefined) {
            const qs = product['quick_status'];
            const status = prices.products[good] ?? {};

            status.last_updated = last_up;
            status.sell_price = topOrdersAverage(product['sell_summary']);
            status.buy_price = topOrdersAverage(product['buy_summary']);
            status.sell_moving_week = qs['sellMovingWeek'];
            status.buy_moving_week  = qs['buyMovingWeek'];
            const spread = status.sell_price? (status.buy_price - status.sell_price) / status.sell_price * 100 : 999.9;
            status.spread = round(spread > 999.9 ? 999.9 : spread, 1);

            if (last_up - (status.previous_update ?? 0) > 1200000) { // 20 min
                status.previous_update = last_up;
                const sell_changes = calcChanges(status.sell_price, status.previous_sell_price);
                const buy_changes = calcChanges(status.buy_price, status.previous_buy_price);
                status.previous_sell_price = status.sell_price;
                status.previous_buy_price = status.buy_price;
                status.sell_changes = round(sell_changes > 999 ? 999 : sell_changes, 2);
                status.buy_changes = round(buy_changes > 999 ? 999 : buy_changes, 2);
            }
            prices.products[good] = status;
        }
    }
}

export async function bazaarDownload() {
    const start = Date.now();
    const answer = await fetchTimeout('https://api.hypixel.net/skyblock/bazaar');
    answer.time_updated = Date.now();
    answer.load_time = answer.time_updated - start;
    return answer;
}