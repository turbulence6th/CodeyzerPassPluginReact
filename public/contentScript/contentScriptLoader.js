(async () => {
    // @ts-ignore
    const src = chrome.runtime.getURL("/contentScript/contentScript.js");
    await import(src);
})();