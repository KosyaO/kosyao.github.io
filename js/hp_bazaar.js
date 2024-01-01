let bzConfig = null;

function updateStatus(text) {
    const ctrl = document.getElementById('cStatus');
    ctrl.innerHTML = text;
}

function updateConfig(response) {
    bzConfig = response;
    if (!bzConfig) {

    };
}

function init() {
    updateStatus("This is text!");
    let request = new XMLHttpRequest();
    request.open("GET", 'json/bazaar_monitored.json');
    request.responseType = "json";
    request.send();
    request.onload = () => updateConfig(request.response);
}

function navClick(item) {
    updateStatus(item.textContent + ' clicked');
}