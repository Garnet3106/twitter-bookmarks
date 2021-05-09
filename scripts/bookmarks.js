var ChromeStorage = class {
    static clear(callback = () => {}) {
        chrome.storage.local.clear(callback);
    }

    static get(keys, callback) {
        chrome.storage.local.get(keys, callback);
    }

    static getJSON(keys, jsonKey = 'data') {
        return new Promise((resolve, reject) => {
            chrome.storage.local.get(keys, (values) => {
                if(chrome.runtime.lastError !== undefined) {
                    reject(chrome.runtime.lastError);
                    return;
                }

                if(Object.keys(values).length == 0) {
                    reject('undefined storage key');
                    return;
                }

                let jsonValues = {};

                Object.keys(values).forEach((key) => {
                    let json = null;

                    try {
                        json = JSON.parse(values[key]);
                    } catch(err) {
                        reject('json parsing error');
                        return;
                    }

                    if(!(jsonKey in json)) {
                        reject('unknown json key');
                        return;
                    }

                    jsonValues[key] = json[jsonKey];
                });

                resolve(jsonValues);
            });
        });
    }

    static remove(key, callback = () => {}) {
        chrome.storage.local.remove(key, callback);
    }

    static set(pairs, callback = () => {}) {
        chrome.storage.local.set(pairs, callback);
    }

    static setJSON(pairs, jsonKey = 'data') {
        return new Promise((resolve, reject) => {
            Object.keys(pairs).forEach((key) => {
                try {
                    let data = {};
                    data[jsonKey] = pairs[key];

                    let rawJSON = JSON.stringify(data);
                    pairs[key] = rawJSON;
                } catch(err) {
                    reject('json stringifying error');
                }
            });

            chrome.storage.local.set(pairs, () => {
                if(chrome.runtime.lastError !== undefined) {
                    reject(chrome.runtime.lastError);
                    return;
                }

                resolve();
            });
        });
    }
}


var BookmarkList = class {
    constructor() {
        this.folderMap = {};
    }

    addFolder(folder) {
        this.folderMap[folder.id] = folder;
    }

    findItemsByText(text) {}

    findItemsByTweetID() {}

    findItemsByUserID(userID) {}

    findMediaItems() {}

    static generateRandomID() {
        return Math.random().toString(32).substring(2);
    }

    load() {
        return new Promise((resolve, reject) => {
            ChromeStorage.getJSON('folderIDs')
                .then((folderIDs) => {
                    ChromeStorage.getJSON(folderIDs['folderIDs'])
                        .then((folders) => {
                            console.log('Storage data has been loaded from the storage:');
                            console.log(folderIDs);
                            console.log(folders);

                            this.folderMap = folders;
                            resolve();
                        })
                        .catch((err) => {
                            reject(`Couldn't load bookmark folders: ${err}`);
                        });
                })
                .catch((err) => {
                    reject(`Couldn't load bookmark folders: ${err}`);
                });
        });
    }

    save(folderID) {
        return new Promise((resolve, reject) => {
            let pairs = {};

            if(!(folderID in this.folderMap)) {
                reject(`Couldn't save folder: folder ${folderID} not found`);
                return;
            }

            pairs['folderIDs'] = Object.keys(this.folderMap);
            pairs[folderID] = this.folderMap[folderID];

            ChromeStorage.setJSON(pairs)
                .then(() => {
                    resolve();
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }
}


var BookmarkFolder = class {
    constructor(id, name, createdAt, items) {
        this.id = id;
        this.name = name;
        this.createdAt = createdAt;
        this.items = items;
    }

    static createNew(name) {
        return new BookmarkFolder(BookmarkList.generateRandomID(), name, BookmarkFolder.getTimestamp(), []);
    }

    static getTimestamp() {
        return Math.floor(Date.now() / 1000);
    }

    remove() {
        ChromeStorage.remove(this.folderID)
            .then(() => {
                console.log(`Folder ${this.folderID} has been removed.`)
            });
    }
}


var BookmarkListItem = class {
    constructor(addedAt, userID, userName, tweetID, tweetedAt, text, picURLs, videoURLs, isVote) {
        this.addedAt = addedAt;
        this.userID = userID;
        this.userName = userName;
        this.tweetID = tweetID;
        this.tweetedAt = tweetedAt;
        this.text = text;
        this.picURLs = picURLs;
        this.videoURLs = videoURLs;
        this.isVote = isVote;
    }

    static createNew(userID, userName, tweetID, tweetedAt, text, picURLs, videoURLs, isVote) {
        return new BookmarkListItem(BookmarkList.generateRandomID(), userID, userName, tweetID, tweetedAt, text, picURLs, videoURLs, isVote);
    }
}


bookmarkPageLoaded_bookmarksJS();


function bookmarkPageLoaded_bookmarksJS() {
    // ブックマークデータを取得

    // ChromeStorage.clear();

    let bookmarkList = new BookmarkList();

    bookmarkList.load()
        .then(() => {
            console.log('loaded folders');
            console.log(bookmarkList);

            let folder = BookmarkFolder.createNew('foldername');

            console.log('new folder');
            console.log(folder);

            bookmarkList.addFolder(folder);

            console.log('after added');
            console.log(bookmarkList);

            bookmarkList.save(folder.id)
                .then(() => {
                    console.log(`Folder ${folder.id} has saved.`);
                })
                .catch((err) => {
                    console.error(err);
                });
        })
        .catch((err) => {
            console.error(err);
        });

    // ブックマーク一覧のフレームを追加

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

    return iframe;
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
