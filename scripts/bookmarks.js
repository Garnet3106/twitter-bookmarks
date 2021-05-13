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
        return this.saveModifyingFolder(folder.id);
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
                    if(Object.keys(folderIDs['folderIDs']).length === 0) {
                        resolve();
                        return;
                    }

                    ChromeStorage.getJSON(folderIDs['folderIDs'])
                        .then((folders) => {
                            Object.keys(folders).forEach((folderID) => {
                                this.folderMap[folderID] = BookmarkFolder.getByAssoc(folders[folderID]);
                            });

                            resolve();
                        })
                        .catch((err) => {
                            reject(`Couldn't load bookmark folders: ${err}`);
                        });
                })
                .catch((err) => {
                    // folderIDs 値が読み込めない場合はフォルダが存在しない状態として扱う
                    resolve();
                });
        });
    }

    removeFolder(folderID) {
        delete this.folderMap[folderID];
        return this.saveRemovingFolder(folderID);
    }

    replaceFolder(newFolderData) {
        this.folderMap[newFolderData.id] = newFolderData;
        return this.saveModifyingFolder(newFolderData.id);
    }

    // 追加, 編集操作の保存
    saveModifyingFolder(folderID) {
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

    // 削除操作の保存
    saveRemovingFolder(folderID) {
        return new Promise((resolve, reject) => {
            let pairs = {};
            pairs['folderIDs'] = Object.keys(this.folderMap);

            ChromeStorage.setJSON(pairs)
                .then(() => {
                    ChromeStorage.remove(folderID, () => {
                        if(chrome.runtime.lastError !== undefined) {
                            reject(chrome.runtime.lastError);
                            return;
                        }

                        resolve();
                    });
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

    edit(name, password) {
        this.name = name;
        this.password = password;
    }

    static getByAssoc(assoc) {
        return new BookmarkFolder(assoc.id, assoc.name, assoc.password, assoc.createdAt, assoc.items);
    }

    static getTimestamp() {
        return Math.floor(Date.now() / 1000);
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


bookmarkPageLoaded();


function bookmarkPageLoaded() {
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

    newItem.addEventListener('click', onFolderItemClick);

    list.insertBefore(newItem, list.firstChild);

    return newItem;
}

function editBookmarkSectionListItem(folderID, folderName) {
    let item = document.getElementById('tbmBookmarksIndexListItem_' + folderID);

    if(item === null)
        return;

    let itemText = item.getElementsByClassName('tbm-bookmarks-index-list-item-text')[0];
    itemText.innerText = folderName;
}

function removeBookmarkSectionListItem(folderID) {
    let item = document.getElementById('tbmBookmarksIndexListItem_' + folderID);

    if(item === null)
        return;

    item.remove();
}

function getBookmarkSection() {
    return new Promise((resolve, reject) => {
        let sectionIntervalCount = 0;
        const sectionIntervalLimit = 10;

        let sectionInterval = setInterval(() => {
            let sections = document.getElementsByTagName('section');

            if(sections.length > 2) {
                clearInterval(sectionInterval);
                resolve(sections[0]);
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

        // add ope icon

        let addOpeIcon = document.getElementById('tbmBookmarksIndexOpeItem_add');

        addOpeIcon.addEventListener('click', onAddOpeIconClick);

        // edit ope icon

        let editOpeIcon = document.getElementById('tbmBookmarksIndexOpeItem_edit');

        editOpeIcon.addEventListener('click', onEditOpeIconClick);

        // rem ope icon

        let remOpeIcon = document.getElementById('tbmBookmarksIndexOpeItem_rem');

        remOpeIcon.addEventListener('click', onRemOpeIconClick);

        // folder items

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

    bookmarkList.addFolder(folder)
        .then(() => {
            console.log(`Folder ${folder.id} has been added.`);

            let newItem = addBookmarkSectionListItem(folder.id, folder.name);
            selectBookmarkSectionListItem(newItem);
        })
        .catch((err) => {
            console.error(err);
        });
}

function onEditOpeIconClick() {
    if(selectedFolderID === '') {
        alert('フォルダが選択されていません。');
        return;
    }

    let data = getNewFolderData();

    let newFolderData = bookmarkList.folderMap[selectedFolderID];
    newFolderData.edit(data.name, data.password);

    bookmarkList.replaceFolder(newFolderData)
        .then(() => {
            console.log(`Folder ${newFolderData.id} has been modified.`);

            editBookmarkSectionListItem(newFolderData.id, newFolderData.name);
        })
        .catch((err) => {
            console.error(err);
        });
}

function onRemOpeIconClick() {
    if(selectedFolderID === '') {
        alert('フォルダが選択されていません。');
        return;
    }

    if(!confirm('本当に削除しますか？'))
        return;

    bookmarkList.removeFolder(selectedFolderID)
        .then(() => {
            removeBookmarkSectionListItem(selectedFolderID);
            selectedFolderID = '';

            alert('フォルダが削除されました。');
        })
        .catch((err) => {
            alert('フォルダの削除に失敗しました。');
        });
}

function getNewFolderData() {
    let name = prompt('フォルダ名を入力してください。', '新しいフォルダ');
    let password = '';

    if(name === null)
        return null;

    if(name === '') {
        return getNewFolderData();
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
