chrome.tabs.query({
    lastFocusedWindow: true
}, (tabs) => {
    setTimeout(() => {
        executeScripts(tabs[0].url);
    }, 5000);
});

chrome.tabs.onUpdated.addListener((tabID, info, tab) => {
    if(info.status === 'complete')
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
