function init() {
    document.getElementById('cWelcome').innerHTML = "This is text!"
}

function navClick(item) {
    const ctrl = document.getElementById('cWelcome');
    ctrl.innerHTML = item.text + ' clicked'
}