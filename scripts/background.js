chrome.tabs.onUpdated.addListener((tabID, info, tab) => {
    if(info.status === 'complete' && tab.url.startsWith('https://twitter.com/i/bookmarks')) {
        chrome.tabs.executeScript(null, {
            file: './scripts/bookmarks.js'
        }, () => {});
    }
});
