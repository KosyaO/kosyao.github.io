export const prices_filter = {
    'Artifact of Control': { buy_cheaper: 2000000000, count: 3 },
    'Spirit Mask': { buy_cheaper: 120000000, count: 3 },
    'Dark Claymore': {}
};

export const analyzed = {
    'Dark Claymore': {
        enchants_exact: [
            'Critical VII',
            'Cleave VI',
            'First Strike V',
            'Ender Slayer VII',
            'Experience V',
            'Giant Killer VII',
            'Looting V',
            'Luck VII',
            'Prosecute VI',
            'Execute VI',
            'Scavenger V',
            'Sharpness VII',
            'Syphon V',
            'Thunderlord VII',
            'Venomous VI',
            'Vicious V'
        ],
        enchants_one: [
            'Divine Gift',
            'Chimera',
            'Soul Eater',
            'Smoldering'
        ],
        essence: { name: 'Wither Essence', count: [150, 450, 950, 1850, 3350] },
        stars: "✪➊➋➌➍➎"
    }
};

function translate_attribute_name(short_name) {
    return {
        'bf': 'Blazing Fortune',
        'dom': 'Dominance',
        'fe': 'Fishing Exp',
        'll': 'Lifeline',
        'mf': 'Magic Find ',
        'mp': 'Mana Pool',
        'mr': 'Mana Regen',
        'spd': 'Speed ',
        'vet': 'Veteran',
        'vit': 'Vitality '
    }[short_name.toLowerCase()] ?? short_name;
}

export function generate_piece_template(piece_name, lore_entries = [],
                                        attribute_sort = false, max_price = undefined) {
    const types = ['Fervor', 'Hollow', 'Crimson', 'Aurora', 'Terror'];
    let result = {};
    lore_entries = lore_entries.map(entry => translate_attribute_name(entry));
    for (let type of types) {
        result[type + ' ' + piece_name] = {lore_entries, max_price};
    }
    result.attribute_sort = attribute_sort;
    return result;
}

export function generate_piece_attribute(piece_name, attribute_name, max_price = undefined) {
    return generate_piece_template(piece_name, [translate_attribute_name(attribute_name)], true, max_price);
}

export function generate_equip_attribute(equip_name, attribute_name, max_price = undefined) {
    let result = {attribute_sort: true};
    result[equip_name] = {lore_entries: [translate_attribute_name(attribute_name)], max_price};
    return result;
}

export function generate_armor_template(armor_name, lore_entries = [],
                                        attribute_sort = false, max_price = undefined) {
    const pieces = ['Helmet', 'Chestplate', 'Leggings', 'Boots'];
    let result = {};
    lore_entries = lore_entries.map(entry => translate_attribute_name(entry));
    for (let item of pieces) {
        result[armor_name + ' ' + item] = {lore_entries, max_price};
    }
    result.attribute_sort = attribute_sort;
    return result;
}

export function generate_armor_attributes(lore_entries = [],
                                        attribute_sort = false, max_price = undefined) {
    const pieces = ['Chestplate', 'Leggings', 'Boots'];
    const types = ['Fervor', 'Hollow', 'Crimson', 'Aurora', 'Terror'];
    let result = {};
    lore_entries = lore_entries.map(entry => translate_attribute_name(entry));
    for (let piece of pieces)
        for (let type of types) {
            result[type + ' ' + piece] = {lore_entries, max_price};
        }
    result.attribute_sort = attribute_sort;
    return result;
}

export const templates = {
    kuudra_equip: {
        'Implosion Belt': {'lore_entries': ['Mana Regen', 'Mana Pool']},
        'Molten Cloak': {'lore_entries': ['Mana Pool', 'Mana Regen']},
        'Molten Necklace': {'lore_entries': ['Mana Pool', 'Mana Regen']},
        'Molten Belt': {'lore_entries': ['Mana Pool', 'Mana Regen']},
    },
    god_fishing_noob_set: {
        'Slug Boots': {'lore_entries': ['Blazing Fortune', 'Fishing Exp']},
        'Moogma Leggings': {'lore_entries': ['Blazing Fortune', 'Fishing Exp']},
        'Flaming Chestplate': {'lore_entries': ['Blazing Fortune', 'Fishing Exp']},
        'Taurus Helmet': {'lore_entries': ['Blazing Fortune', 'Fishing Exp']}
    },
    archer_armor: {
        'Terror Chestplate': {'lore_entries':['Lifeline', 'Mana Pool']},
        'Terror Leggings': {'lore_entries':['Lifeline', 'Mana Pool']},
        'Terror Boots': {'lore_entries':['Lifeline', 'Mana Pool']}
    },
    archer_balanced: {
        'Terror Chestplate': {'lore_entries':['Dominance', 'Vitality ']},
        'Terror Leggings': {'lore_entries':['Dominance', 'Vitality ']},
        'Terror Boots': {'lore_entries':['Dominance', 'Vitality ']}
    },
    mage_armor: {
        'Aurora Chestplate': {'lore_entries':['Mana Regen', 'Mana Pool']},
        'Aurora Leggings': {'lore_entries':['Mana Regen', 'Mana Pool']},
        'Aurora Boots': {'lore_entries':['Mana Regen', 'Mana Pool']}
    },
    mage_ender: {
        'Aurora Chestplate': {'lore_entries':['Mana Regen', 'Dominance']},
        'Aurora Leggings': {'lore_entries':['Mana Regen', 'Dominance']},
        'Aurora Boots': {'lore_entries':['Mana Regen', 'Dominance']}
    },
    demon_lord_armor: {
        'Crimson Chestplate': {'lore_entries':['Veteran', 'Vitality ']},
        'Crimson Leggings': {'lore_entries':['Veteran', 'Vitality ']},
        'Crimson Boots': {'lore_entries':['Veteran', 'Vitality ']}
    },
    slayer_dps: {
        'Crimson Chestplate': {'lore_entries':['Veteran', 'Dominance']},
        'Crimson Leggings': {'lore_entries':['Veteran', 'Dominance']},
        'Crimson Boots': {'lore_entries':['Veteran', 'Dominance']}
    },
    slayer_armor: {
        'Crimson Chestplate': {'lore_entries':['Veteran', 'Magic Find ']},
        'Crimson Leggings': {'lore_entries':['Veteran', 'Magic Find ']},
        'Crimson Boots': {'lore_entries':['Veteran', 'Magic Find ']}
    },
    archer_boots: {'Terror Boots': {'lore_entries':['Lifeline', 'Mana Pool']}},
    archer_equip: {
        'Lava Shell Necklace': {'lore_entries':['Lifeline', 'Mana Pool']},
        'Molten Cloak': {'lore_entries':['Lifeline', 'Mana Pool']},
        'Molten Belt': {'lore_entries':['Lifeline', 'Mana Pool']},
        'Molten Bracelet': {'lore_entries':['Lifeline', 'Mana Pool']}
    },
    mage_equip: {
        'Implosion Belt': {'lore_entries': ['Mana Pool', 'Mana Regen']},
        'Molten Cloak': {'lore_entries': ['Mana Pool', 'Mana Regen']},
        'Molten Necklace': {'lore_entries': ['Mana Pool', 'Mana Regen']},
        'Molten Bracelet': {'lore_entries': ['Mana Pool', 'Mana Regen']},
    },
    lava_shell: { 'Lava Shell Necklace': {'lore_entries':['Lifeline', 'Mana Pool']}},
    gauntlet_of_contagion: {'Gauntlet of Contagion': {'lore_entries':['Mana Regen', 'Mana Pool']}},
    gauntlet_of_dungeon: {'Gauntlet of Contagion': {'lore_entries':['Dominance', 'Speed ']}},
    mage_boots: {'Aurora Boots': {'lore_entries': ['Mana Pool', 'Mana Regen']}},
    mage_leggings: {'Aurora Leggings': {'lore_entries': ['Mana Pool', 'Mana Regen']}},
    mage_chestplate: {'Aurora Chestplate': {'lore_entries': ['Mana Pool', 'Mana Regen']}},
    magma_rod_trophy_fast: {'Magma Rod': {'lore_entries': ['Trophy Hunter', 'Fishing Speed ']}},
    magma_rod_trophy: {'Magma Rod': {'lore_entries': ['Trophy Hunter', 'Fisherman']}},
    magma_rod_creatures: {'Magma Rod': {'lore_entries': ['Double', 'Fishing Speed ']}},
    magma_rod_fs: generate_equip_attribute('Magma Rod', 'Fishing Speed '),
    hellfire_rod_trophy: {'Hellfire Rod': {'lore_entries': ['Trophy Hunter', 'Fisherman']}},
    hellfire_rod_trophy_fast: {'Hellfire Rod': {'lore_entries': ['Trophy Hunter', 'Fishing Speed ']}},
    hellfire_rod_creatures: {'Hellfire Rod': {'lore_entries': ['Double', 'Fishing Speed ']}},

    helmet_mana_regen: generate_piece_attribute('Helmet', 'MR'),
    helmet_lifeline: generate_piece_attribute('Helmet', 'LL'),
    helmet_mf: generate_piece_attribute('Helmet', 'MF'),
    helmet_mp: generate_piece_attribute('Helmet', 'MP'),
    helmet_mr: generate_piece_attribute('Helmet', 'MR'),
    helmet_ll: generate_piece_attribute('Helmet', 'LL'),
    chestplate_mana_pool: generate_piece_attribute('Chestplate', 'MP', 20000000),
    chestplate_mana_regen: generate_piece_attribute('Chestplate', 'MR'),
    chestplate_lifeline: generate_piece_attribute('Chestplate', 'LL'),
    chestplate_magic_find: generate_piece_attribute('Chestplate', 'MF'),
    chestplate_veteran: generate_piece_attribute('Chestplate', 'Vet', 20000000),
    chestplate_vitality: generate_piece_attribute('Chestplate', 'Vit', 10000000),
    chestplate_dominance: generate_piece_attribute('Chestplate', 'Dom', 10000000),
    leggings_mana_pool: generate_piece_attribute('Leggings', 'MP'),
    leggings_mana_regen: generate_piece_attribute('Leggings', 'MR'),
    leggings_lifeline: generate_piece_attribute('Leggings', 'LL', 10000000),
    leggings_magic_find: generate_piece_attribute('Leggings', 'MF'),
    leggings_veteran: generate_piece_attribute('Leggings', 'Vet', 10000000),
    leggings_vitality: generate_piece_attribute('Leggings', 'Vit', 10000000),
    leggings_dominance: generate_piece_attribute('Leggings', 'Dom', 10000000),
    boots_mana_pool: generate_piece_attribute('Boots', 'MP', 10000000),
    boots_veteran: generate_piece_attribute('Boots', 'Vet', 15000000),
    boots_dominance: generate_piece_attribute('Boots', 'Dom', 10000000),
    boots_vitality: generate_piece_attribute('Boots', 'Vit', 15000000),
    boots_mana_regen: generate_piece_attribute('Boots', 'MR'),
    boots_lifeline: generate_piece_attribute('Boots', 'LL'),
    boots_magic_find: generate_piece_attribute('Boots', 'MF', 15000000),

    magma_lord: generate_armor_template('Magma Lord', ['Blazing Fortune', 'Fishing Exp']),
    thunder_fe: generate_armor_template('Thunder', ['Fishing Exp'], true, 10000000),
    thunder_mf: generate_armor_template('Thunder', ['Blazing Fortune'], true, 10000000),
    hollow_wand: {'Hollow Wand': {'lore_entries': ['Blazing', 'Elite']}},

    molten_bracelet: {'Molten Bracelet': {'lore_entries':['Mana Regen', 'Mana Pool']}},
    molten_bracelet_archer: {'Molten Bracelet': {'lore_entries':['Lifeline', 'Mana Pool']}},
    molten_bracelet_archer_mr: {'Molten Bracelet': {'lore_entries':['Lifeline', 'Mana Regen']}},
    molten_bracelet_mp: generate_equip_attribute('Molten Bracelet','MP'),
    molten_bracelet_mr: generate_equip_attribute('Molten Bracelet','MR'),
    molten_bracelet_ll: generate_equip_attribute('Molten Bracelet','LL'),
    molten_cloak: {'Molten Cloak': {'lore_entries':['Mana Regen', 'Mana Pool']}},
    molten_cloak_archer: {'Molten Cloak': {'lore_entries':['Lifeline', 'Mana Pool']}},
    molten_cloak_mp: generate_equip_attribute('Molten Cloak','MP'),
    molten_cloak_mr: generate_equip_attribute('Molten Cloak','MR'),
    molten_cloak_ll: generate_equip_attribute('Molten Cloak','LL'),
    molten_belt_archer: {'Molten Belt': {'lore_entries':['Lifeline', 'Mana Pool']}},
    molten_belt_mp: generate_equip_attribute('Molten Belt','MP'),
    blaze_belt_demon: {'Blaze Belt': {'lore_entries':['Veteran', 'Vitality ']}},
    blaze_belt_veteran: generate_equip_attribute('Blaze Belt','Vet'),
    blaze_belt_vitality: generate_equip_attribute('Blaze Belt','Vit'),

    attribute_blazing: generate_equip_attribute('Attribute Shard','BF'),
    attribute_fishing: generate_equip_attribute('Attribute Shard','FE'),
    attribute_mana_pool: generate_equip_attribute('Attribute Shard','MP'),
    attribute_mana_regen: generate_equip_attribute('Attribute Shard','MR'),
    attribute_lifeline: generate_equip_attribute('Attribute Shard','LL'),
    attribute_double_hook: generate_equip_attribute('Attribute Shard','Double Hook'),
    attribute_ignition_mana_steal: { attribute_sort: true,
        'Attribute Shard': { all_together: false,
            'lore_entries': ['Ignition', 'Mana St']}},
    useful_attrs: {
        'Attribute Shard': { all_together: false,
            'lore_entries': ['Mana Regen', 'Mana Pool', 'Blazing Fortune', 'Fishing Exp']}
    },
    vitality_armor: generate_armor_attributes(['vit'], true, 10000000),
    dominance_armor: generate_armor_attributes(['dom'], true, 10000000),
    veteran_armor: generate_armor_attributes(['vet'], true, 10000000),
    mana_pool_armor: generate_armor_attributes(['mp'], true, 10000000),
    mana_regen_armor: generate_armor_attributes(['mr'], true, 10000000),
    pet_mole_100: { '[Lvl 100] Mole': {}},
    pet_slug_100: { '[Lvl 100] Slug': {}}
}

const roman_multipliers = {
    'I': 1, 'II': 2, 'III': 4, 'IV': 8, 'V': 16, 'VI': 16, 'VII': 32, 'VIII': 64, 'IX': 128, 'X': 256
};

export async function auctionDownload() {
    const result = [];
    let active = 0;
    let next = 0;

    async function task() {
        let page = next++;
        const start = Date.now();
        // console.time(`Page ${page}`);
        active++;
        const url = `https://api.hypixel.net/skyblock/auctions?page=${page}`;
        const response = await fetch(url);
        const answer = response.ok ? await response.json() : response;
        // console.timeEnd(`Page ${page}`);
        active--;
        result.push({'load_time': Date.now() - start, answer});
        return answer;
    }

    console.time('Load time');
    await new Promise((resolve, reject) => {
        let remain = 0;
        function start() {
            remain--;
            task().then(json => {
                if (remain < 0) {
                    remain += json['totalPages'];
                    console.log(`Loading auction, ${json['totalPages']} pages total...`);
                }
                if (remain > 0) {
                    start();
                }
                if (active === 0) {
                    resolve();
                }
            }).catch(reject);
        }
        for (let i = 0; i < 10; i++) {
            start();
        }
    });
    console.timeEnd('Load time');
    console.log(`Pages loaded: ${result.length}`);

    return result;
}

export function auctionFilter(data, filter) {
    const result = [];
    const counter = {};
    data.forEach(page => {
        if (page.answer.success) {
            for (let item of page.answer['auctions']) {
                const item_name = item['item_name'];
                let conditions;
                for (let search_name in filter) {
                    if (item_name.includes(search_name)) {
                        conditions = filter[search_name];
                        break;
                    }
                }
                if (conditions === undefined) continue;
                let cnt = counter[item_name];
                if (cnt === undefined) {
                    cnt = {found: 0, passed: 0};
                    counter[item_name] = cnt;
                }
                cnt.found += 1;
                const maxPrice = conditions.max_price;
                const allTogether = conditions.all_together ?? true;
                let topBid = item['highest_bid_amount'];
                if (topBid === 0) topBid = item['starting_bid'];
                if (maxPrice !== undefined && topBid > maxPrice) continue;
                const entries = [];
                const lore_entries = conditions.lore_entries ?? [];
                const item_lore = item['item_lore'];
                for (let entry of lore_entries) {
                    const p = item_lore.indexOf(entry);
                    if (p >= 0) {
                        const end = item_lore.indexOf('\n', p);
                        entries.push(item_lore.slice(p, end));
                    }
                }
                if (allTogether && entries.length < lore_entries.length ||
                    lore_entries.length > 0 && entries.length === 0) continue;
                cnt.passed += 1;

                let price_one = 0;
                if (filter.attribute_sort === true && entries.length > 0) {
                    const attribute = entries[0];
                    const p = attribute.indexOf(' ', lore_entries[0].length - 1) + 1;
                    if (p > 0) {
                        let end = attribute.indexOf(' ', p);
                        if (end === -1) { end = attribute.length; }
                        const roman = attribute.slice(p, end);
                        const multiplier = roman_multipliers[roman] ?? 1;
                        price_one = topBid / multiplier;
                    }
                }

                item.lore_entries = entries;
                item.top_bid = topBid;
                item.price_one = price_one;
                result.push(item);
            }
        }
    });

    return {counter, attribute_sort: filter.attribute_sort, result};
}

export function analyzeData(data, filter) {
    const prices = {};

    data.forEach(page => {
        if (page.answer.success) {
            for (let item of page.answer['auctions']) {
                const item_name = item['item_name'];
                for (let search_name in filter) {
                    if (item_name.includes(search_name)) {
                        const conditions = filter[search_name];
                        const maxPrice = conditions.max_price;
                        let topBid = item['highest_bid_amount'];
                        if (topBid === 0) topBid = item['starting_bid'];
                        if (maxPrice !== undefined && topBid > maxPrice) continue;
                        item.top_bid = topBid;
                        let price_item = prices[search_name];
                        if (price_item === undefined) {
                            price_item = { items: [] };
                            prices[search_name] = price_item;
                        }
                        price_item.items.push(item);
                        break;
                    }
                }
            }
        }
    });

    for (let price_item in prices) {
        prices[price_item].items.sort((a, b) => a.top_bid - b.top_bid);
    }

    return prices;
}

