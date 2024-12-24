export function addHandlers(handlers) {
    for (let [kind, handler] of Object.entries(handlers)) {
        const elements = document.querySelectorAll(`*[evnt-${kind}]`);
        console.log(kind, elements);
        const [eventType] = kind.split('-',1);
        elements.forEach(element => element.addEventListener(eventType, handler));
    }
}

export function createElement(tagName, classList = [], attributes = {}, text = undefined) { 
    const newElem = document.createElement(tagName);
    for (let cls of classList) if (cls !== '') newElem.classList.add(cls);
    for (let [name, value] of Object.entries(attributes)) newElem.setAttribute(name, value);
    if (text !== undefined) newElem.appendChild(document.createTextNode(text));
    return newElem;
}

export const loadFromStorage = name => localStorage?.getItem?.(name);
export const saveToStorage = (name, value) => localStorage?.setItem?.(name, value);