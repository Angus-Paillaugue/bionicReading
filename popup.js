document.addEventListener('DOMContentLoaded', function() {
    var status_input = document.getElementById('status');
    status_input.addEventListener('change', function(e) {
        e.currentTarget.checked;
        chrome.storage.local.set({ "status": e.currentTarget.checked });
        reloadTab();
    });
    chrome.storage.local.get(["status"], function(status){
        if(status.status){
            status_input.checked = true;
        }
    });
});

function reloadTab() {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, ([tab]) => {
        chrome.tabs.reload(tab.id);
    });
}