chrome.storage.onChanged.addListener(function (changes,  _namespace) {
    for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
        if (key === 'login') {
            if (newValue) {
                chrome.action.setBadgeText({ text: '1'});
            } else {
                chrome.action.setBadgeText({ text: ''});
            }
        }
    }
});

(() => {
    let sifre = null;

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.type === "ANA_SIFRE_KAYDET") {
            sifre = request.sifre;
        } else if (request.type === "ANA_SIFRE_GETIR") {
            sendResponse({ sifre });
        }
    });
})();