function topOrdersAverage(arr) {
    let count = 0;
    let sum = 0;
    arr.slice(0, 3).forEach((item) => {
        count += item['amount'];
        sum += item['pricePerUnit'] * item['amount'];
    })
    return count > 0 ? sum / count : 0;
}

export async function bazaarUpdate(goods, bazaar, prices) {
    const last_up = bazaar['lastUpdated'];
    prices['last_updated'] = last_up;

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
            status.spread = status.buy_price? (status.buy_price - status.sell_price) / status.sell_price * 100 : 999;
            if (status.spread > 999.99) status.spread = 999.99;

            if (last_up - (status.previous_update ?? 0) > 1200000) { // 20 min
                status.previous_update = last_up;
                const oldSell = status.previous_sell_price;
                const oldBuy = status.previous_buy_price;
                const sell_changes = oldSell === undefined ? 0 : (status.sell_price - oldSell) * 100 / oldSell;
                const buy_changes = oldBuy === undefined ? 0 : (status.buy_price - oldBuy) * 100 / oldBuy;
                status.previous_sell_price = status.sell_price;
                status.previous_buy_price = status.buy_price;
                status.sell_changes = sell_changes > 999 ? 999 : sell_changes;
                status.buy_changes = buy_changes > 999 ? 999 : buy_changes;
            }
            prices.products[good] = status;
        }
    }
}

export async function bazaarDownload() {
    const start = Date.now();
    const response = await fetch('https://api.hypixel.net/skyblock/bazaar');
    const answer = response.ok ? await response.json() : response;
    answer.load_time = Date.now() - start;
    return answer;
}