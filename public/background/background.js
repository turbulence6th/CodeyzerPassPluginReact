// @ts-ignore
chrome.storage.onChanged.addListener(function (/** @type {any} */ changes, /** @type {any} */ _namespace) {
    for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
        if (key === 'login') {
            if (newValue) {
                // @ts-ignore
                chrome.action.setBadgeText({ text: '1'});
            } else {
                // @ts-ignore
                chrome.action.setBadgeText({ text: ''});
            }
        }
    }
});