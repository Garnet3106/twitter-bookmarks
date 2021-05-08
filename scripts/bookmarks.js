bookmarkPageLoaded_bookmarksJS();

function bookmarkPageLoaded_bookmarksJS() {
    getBookmarkSection()
        .then((section) => {
            let itemWrapper = getBookmarkItemWrapper(section);

            if(itemWrapper === null)
                return;

            let indexSection = addBookmarkIndexSection(itemWrapper);
        })
        .catch((err) => {
            console.error(err);
        });
}

function getBookmarkSection() {
    return new Promise((resolve, reject) => {
        let sectionIntervalCount = 0;
        const sectionIntervalLimit = 10;

        let sectionInterval = setInterval(() => {
            let section = document.getElementsByTagName('section').item(0);

            if(section !== null) {
                clearInterval(sectionInterval);
                resolve(section);
                return;
            }

            if(sectionIntervalCount === sectionIntervalLimit) {
                clearInterval(sectionInterval);
                reject('null: section (timeout)');
                return;
            }

            sectionIntervalCount += 1;
        }, 500);
    });
}

function getBookmarkItemWrapper(section) {
    const itemWrapper_1 = section.getElementsByTagName('div').item(0);

    if(itemWrapper_1 === null) {
        console.error('null: item wrapper 1');
        return null;
    }

    const itemWrapper_2 = itemWrapper_1.getElementsByTagName('div').item(0);

    if(itemWrapper_2 === null) {
        console.error('null: item wrapper 2');
        return null;
    }

    return itemWrapper_2;
}

function addBookmarkIndexSection(itemWrapper) {
    let iframeID = 'tbmBookmarksIndexSection';

    if(document.getElementById(iframeID) !== null)
        return;

    // add iframe element

    let htmlFilePath = 'data/section/index.html';

    let iframe = document.createElement('iframe');

    iframe.id = iframeID;
    iframe.src = chrome.runtime.getURL(htmlFilePath);
    iframe.style = 'border: 0; height: 250.5px; width: 100%;';

    itemWrapper.insertBefore(iframe, itemWrapper.firstChild);

    readBookmarkList()
        .then((list) => {
            // alert(list.items);
        })
        .catch((path) => {
            console.error('file load failed: ' + path);
        });

    return iframe;
}

function readBookmarkList() {
    return new Promise((resolve, reject) => {
        let filePath = 'data/bookmarks.json';

        readLocalDataFile(filePath)
            .then((content) => {
                let list = new BookmarkList();
                list.load(content);
                // alert('content: ' + content);

                resolve(list);
            })
            .catch(() => {
                reject(filePath);
            });
    });
}

function readLocalDataFile(filePath) {
    return new Promise((resolve, reject) => {
        let chromePath = chrome.runtime.getURL(filePath);
        let xhr = new XMLHttpRequest();

        xhr.addEventListener('readystatechange', () => {
            if(xhr.readyState == XMLHttpRequest.DONE) {
                if(xhr.status != 200) {
                    reject();
                    return;
                }

                resolve(xhr.responseText);
            }
        });

        xhr.open('GET', chromePath, false);
        xhr.send();
        xhr.abort();
    });
}


var BookmarkList = class {
    constructor() {
        this.items = [];
    }

    addItem(item) {
        this.items.push(item);
    }

    findItemsByText(text) {}

    findItemsByTweetID() {}

    findItemsByUserID(userID) {}

    findMediaItems() {}

    load(rawJSON) {
        let json = null;

        try {
            json = JSON.parse(rawJSON);
        } catch(err) {
            console.error('bookmark data load failed: json parse error');
            return;
        }

        this.items = json.list;
    }
}


var BookmarkListItem = class {
    constructor(userID, userName, tweetID, timestamp, text, picURLs, videoURLs, isVote) {
        this.userID = userID;
        this.userName = userName;
        this.tweetID = tweetID;
        this.timestamp = timestamp;
        this.text = text;
        this.picURLs = picURLs;
        this.videoURLs = videoURLs;
        this.isVote = isVote;
    }
}
