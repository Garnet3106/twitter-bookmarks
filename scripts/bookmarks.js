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
    constructor(id, name, password, createdAt, items) {
        this.id = id;
        this.name = name;
        this.password = password;
        this.createdAt = createdAt;
        this.items = items;
    }

    static createNew(name, password) {
        return new BookmarkFolder(BookmarkList.generateRandomID(), name, password, BookmarkFolder.getTimestamp(), []);
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


var bookmarkList = new BookmarkList();
var selectedFolderID = '';


bookmarkPageLoaded_bookmarksJS();


function bookmarkPageLoaded_bookmarksJS() {
    // ブックマークデータをロード

    // ChromeStorage.clear();

    bookmarkList.load()
        .then(() => {
            console.log('Bookmark data has been loaded:');
            console.log(bookmarkList.folderMap);

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
        })
        .catch((err) => {
            console.error(err);
        });
}

function addBookmarkSectionListItem(folderID, folderName) {
    let list = document.getElementById('tbmBookmarksIndexList');
    let newItem = document.createElement('div');

    newItem.className = 'tbm-bookmarks-index-list-item';
    newItem.id = 'tbmBookmarksIndexListItem_' + folderID;
    newItem.innerHTML = `<div class="tbm-bookmarks-index-list-item-text">${folderName}</div>`

    list.insertBefore(newItem, list.firstChild);

    return newItem;
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
    let sectionID = 'tbmBookmarksIndexSection';

    if(document.getElementById(sectionID) !== null)
        return;

    // add section element

    let htmlFilePath = 'data/section/index.html';
    let styleFilePath = 'data/section/style.css';

    let section = document.createElement('section');

    section.id = sectionID;
    section.style = 'height: 250.5px; overflow-y: hidden; width: 100%;';

    readLocalDataFile(htmlFilePath)
        .then((content) => {
            let styleCode = `<link rel="stylesheet" href="${chrome.runtime.getURL(styleFilePath)}">`;

            section.innerHTML = styleCode + content;

            itemWrapper.insertBefore(section, itemWrapper.firstChild);

            initBookmarkIndexSection(section);
        })
        .catch(() => {
            console.error('Failed to load HTML data.');
        });

    return section;
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

function selectBookmarkSectionListItem(elem) {
    if(selectedFolderID !== '') {
        let items = elem.parentNode.childNodes;

        for(let i = 0; i < items.length; i++) {
            if(items[i].className === 'tbm-bookmarks-index-list-item')
                items[i].style.backgroundColor = '#192734';
        }
    }

    elem.style.backgroundColor = '#fff3';

    let folderID = elem.id.substring('tbmBookmarksIndexListItem_'.length);
    selectedFolderID = folderID;

    console.log(`Folder ${folderID} has been selected.`);
}


/* ブクマリストのアイコン操作 */


function initBookmarkIndexSection(section) {
    setTimeout(() => {
        Object.keys(bookmarkList.folderMap).forEach((key) => {
            let item = bookmarkList.folderMap[key];
            addBookmarkSectionListItem(item.id, item.name);
        });

        let addOpeIcon = document.getElementById('tbmBookmarksIndexOpeItem_add');

        addOpeIcon.addEventListener('click', onAddOpeIconClick);

        let folderItems = document.getElementsByClassName('tbm-bookmarks-index-list-item');

        for(let i = 0; i < folderItems.length; i++)
            folderItems[i].addEventListener('click', onFolderItemClick);
    }, 1000);
}

function onAddOpeIconClick() {
    let data = getNewFolderData();

    if(data === null) {
        console.log('Creating new folder has been canceled.');
        return;
    }

    let folder = BookmarkFolder.createNew(data.name, data.password);

    bookmarkList.addFolder(folder);

    bookmarkList.save(folder.id)
        .then(() => {
            console.log(`Folder ${folder.id} has saved.`);

            let newItem = addBookmarkSectionListItem(folder.id, folder.name);
            selectBookmarkSectionListItem(newItem);
        })
        .catch((err) => {
            console.error(err);
        });
}

function getNewFolderData() {
    let name = prompt('フォルダ名を入力してください。', '新しいフォルダ');
    let password = '';

    if(name === null)
        return null;

    if(name === '') {
        getNewFolderData();
        return null;
    }

    if(confirm('パスワードを設定しますか？'))
        password = prompt('パスワードを入力してください。\n\n※ パスワードはセキュリティ保護を受けません ※');

    if(password === null)
        password = '';

    return {
        name: name,
        password: password
    };
}

function onFolderItemClick(event) {
    let target = event.target;

    if(target.className == 'tbm-bookmarks-index-list-item-text')
        target = target.parentNode;

    selectBookmarkSectionListItem(target);
}
