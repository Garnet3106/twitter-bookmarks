chrome.tabs.query({
    lastFocusedWindow: true
}, (tabs) => {
    executeScripts(tabs[0].url);
});

chrome.tabs.onUpdated.addListener((tabID, info, tab) => {
    if(info.status === 'complete')
        // イベントハンドラが重複 + 競合しないように tl.js を無視する
        executeScripts(tab.url);
});


function executeScripts(url) {
    if(url.startsWith('https://twitter.com/i/bookmarks')) {
        chrome.tabs.executeScript(null, {
            file: './scripts/bookmarks.js'
        }, () => {});
    }

    if(url.startsWith('https://twitter.com')) {
        chrome.tabs.executeScript(null, {
            file: './scripts/tl.js'
        }, () => {});
    }
}
