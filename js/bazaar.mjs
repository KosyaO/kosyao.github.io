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
            const status = { sell_moving_week: qs['sellMovingWeek'], buy_moving_week: qs['buyMovingWeek'] };
            const oldData = prices[good] ?? {};
            const oldSell = oldData['sell_price'];
            const oldBuy = oldData['buy_price'];
            const sell_changed = oldSell === undefined ? 0 : (status.sell_price - oldSell) * 100 / oldSell;
            const buy_changed = oldBuy === undefined ? 0 : (status.buy_price - oldBuy) * 100 / oldBuy;
            status.sell_price = topOrdersAverage(product['sell_summary']);
            status.buy_price = topOrdersAverage(product['buy_summary']);
            status.sell_changed = sell_changed > 999 ? 999 : sell_changed;
            status.buy_changed = buy_changed > 999 ? 999 : buy_changed;
            status.buy_moving_changes = status.buy_moving_week - (oldData.buy_moving_week ?? 0);
            status['last_updated'] = last_up;
            prices.products[good] = status;
        }
    }
}
