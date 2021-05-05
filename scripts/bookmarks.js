bookmarkPageLoaded();

function bookmarkPageLoaded() {
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
    let sectionID = 'tbmBookmarksIndexSection';

    if(document.getElementById(sectionID) !== null)
        return;

    let sectionHtml = getBookmarkIndexSectionHTML();

    const section = document.createElement('section');

    section.id = sectionID;
    section.innerHTML = sectionHtml;

    itemWrapper.insertBefore(section, itemWrapper.firstChild);

    getBookmarkData()
        .then((content) => {
            alert(content);
        })
        .catch((path) => {
            console.error('file load failed: ' + path);
        });

    return section;
}

function getBookmarkIndexSectionHTML() {
    return `
<style>
    div.tbm-bookmarks-index {
        align-items: center;
        border-bottom: 0.5px solid #ccc3;
        display: flex;
        height: 250px;
        justify-content: center;
        width: 100%;
    }

    div.tbm-bookmarks-index-wrapper {
        align-items: center;
        display: flex;
        height: calc(100% - 40px);
        justify-content: space-around;
        margin: 20px;
        width: calc(100% - 40px);
    }

    div.tbm-bookmarks-index-operation {
        align-content: space-around;
        display: flex;
        flex-wrap: wrap;
        height: 100%;
        width: 50px;
    }

    svg.tbm-bookmarks-index-operation-item {
        border-radius: 50%;
        cursor: pointer;
        height: 50px;
        width: 50px;
    }

    svg.tbm-bookmarks-index-operation-item:hover {
        background-color: #192734;
    }

    div.tbm-bookmarks-index-list {
        background-color: #192734;
        border-radius: 15px;
        height: 100%;
        overflow-x: hidden;
        overflow-y: scroll;
        width: calc(100% - 200px);
    }

    div.tbm-bookmarks-index-list::-webkit-scrollbar {
        display: none;
    }

    div.tbm-bookmarks-index-list-item {
        align-items: center;
        border-bottom: 1px solid #ccc3;
        cursor: pointer;
        display: flex;
        height: 40px;
        justify-content: center;
        width: 100%;
    }

    div.tbm-bookmarks-index-list-item:last-child {
        border-bottom: none;
    }

    div.tbm-bookmarks-index-list-item:hover div.tbm-bookmarks-index-list-item-text {
        text-decoration: underline;
    }

    div.tbm-bookmarks-index-list-item-text {
        font-family: sans-serif;
        color: #fff;
        font-size: 15px;
    }
</style>
<div id="tbmBookmarksIndex" class="tbm-bookmarks-index">
    <div class="tbm-bookmarks-index-wrapper">
        <div id="" class="tbm-bookmarks-index-operation">
            <svg class="tbm-bookmarks-index-operation-item" id="tbmBookmarksIndexOpeItem_add" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                <defs>
                    <style>
                        .ee6baea6-184e-474d-b401-862b6470f79a {
                        fill: #fff;
                        }
                        .b4529539-b627-4034-999e-9fed05c10639 {
                        fill: none;
                        }
                    </style>
                </defs>
                <rect class="ee6baea6-184e-474d-b401-862b6470f79a" x="106" y="246" width="300" height="20" rx="10"/>
                <rect class="ee6baea6-184e-474d-b401-862b6470f79a" x="106" y="246" width="300" height="20" rx="10" transform="translate(0 512) rotate(-90)"/>
                <rect class="b4529539-b627-4034-999e-9fed05c10639" width="512" height="512"/>
            </svg>
            <svg class="tbm-bookmarks-index-operation-item" id="tbmBookmarksIndexOpeItem_edit" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <style>
                        .b49f986a-9534-4e37-a9b1-8afdda4c3c8a {
                        fill: none;
                        }

                        .bf710e3f-fef8-4c95-8515-42181283c86d {
                        fill: #fff;
                        }
                    </style>
                </defs>
                <rect class="b49f986a-9534-4e37-a9b1-8afdda4c3c8a" width="512" height="512"/>
                <rect class="bf710e3f-fef8-4c95-8515-42181283c86d" x="106" y="169.56" width="300" height="20" rx="10"/>
                <rect class="bf710e3f-fef8-4c95-8515-42181283c86d" x="181" y="99.56" width="150" height="20" rx="10"/>
                <rect class="bf710e3f-fef8-4c95-8515-42181283c86d" x="133.52" y="133.86" width="90" height="20" rx="10" transform="translate(-17.72 262.41) rotate(-70)"/>
                <rect class="bf710e3f-fef8-4c95-8515-42181283c86d" x="288.39" y="133.21" width="90" height="20" rx="10" transform="translate(312.84 505.48) rotate(-110)"/>
                <rect class="bf710e3f-fef8-4c95-8515-42181283c86d" x="176.05" y="403.25" width="159.8" height="20" rx="10"/>
                <rect class="bf710e3f-fef8-4c95-8515-42181283c86d" x="41" y="290" width="250" height="20" rx="10" transform="translate(-100.62 515.57) rotate(-100)"/>
                <rect class="bf710e3f-fef8-4c95-8515-42181283c86d" x="221" y="290" width="250" height="20" rx="10" transform="translate(-9.52 588.65) rotate(-80)"/>
                <rect class="bf710e3f-fef8-4c95-8515-42181283c86d" x="176" y="279.56" width="100" height="20" rx="10" transform="translate(-63.56 515.56) rotate(-90)"/>
                <rect class="bf710e3f-fef8-4c95-8515-42181283c86d" x="236" y="279.56" width="100" height="20" rx="10" transform="translate(-3.56 575.56) rotate(-90)"/>
            </svg>
            <svg class="tbm-bookmarks-index-operation-item" id="tbmBookmarksIndexOpeItem_rem" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <style>
                        .b090a15f-9079-458e-a711-4cc698c6a6de {
                        fill: #fff;
                        }

                        .e9eb52ea-7106-4e04-acfc-0aa2b59c3125 {
                        fill: none;
                        }
                    </style>
                </defs>
                <rect class="b090a15f-9079-458e-a711-4cc698c6a6de" x="323.14" y="129.07" width="100" height="20" rx="10" transform="translate(207.62 -223.12) rotate(45)"/>
                <rect class="e9eb52ea-7106-4e04-acfc-0aa2b59c3125" width="512" height="512"/>
                <rect class="b090a15f-9079-458e-a711-4cc698c6a6de" x="152.43" y="256.35" width="300" height="20" rx="10" transform="translate(-99.76 291.86) rotate(-45)"/>
                <rect class="b090a15f-9079-458e-a711-4cc698c6a6de" x="94.48" y="198.39" width="300" height="20" rx="10" transform="translate(-75.75 233.91) rotate(-45)"/>
                <rect class="b090a15f-9079-458e-a711-4cc698c6a6de" x="68.09" y="344.53" width="120" height="20" rx="10" transform="translate(505.05 356.22) rotate(110.12)"/>
                <rect class="b090a15f-9079-458e-a711-4cc698c6a6de" x="96.99" y="373.99" width="120" height="20" rx="10" transform="translate(445.63 681.94) rotate(158.15)"/>
            </svg>
        </div>
        <div id="" class="tbm-bookmarks-index-list">
            <div id="" class="tbm-bookmarks-index-list-item">
                <div id="" class="tbm-bookmarks-index-list-item-text">
                    item
                </div>
            </div>
            <div id="" class="tbm-bookmarks-index-list-item">
                <div id="" class="tbm-bookmarks-index-list-item-text">
                    item
                </div>
            </div>
            <div id="" class="tbm-bookmarks-index-list-item">
                <div id="" class="tbm-bookmarks-index-list-item-text">
                    item
                </div>
            </div>
            <div id="" class="tbm-bookmarks-index-list-item">
                <div id="" class="tbm-bookmarks-index-list-item-text">
                    item
                </div>
            </div>
            <div id="" class="tbm-bookmarks-index-list-item">
                <div id="" class="tbm-bookmarks-index-list-item-text">
                    item
                </div>
            </div>
            <div id="" class="tbm-bookmarks-index-list-item">
                <div id="" class="tbm-bookmarks-index-list-item-text">
                    item
                </div>
            </div>
        </div>
        <div id="" class="tbm-bookmarks-index-operation">
            <svg class="tbm-bookmarks-index-operation-item" id="tbmBookmarksIndexOpeItem_up" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                <defs>
                    <style>
                    .ba11c43f-7664-417b-9120-9e729a88ce34 {
                        fill: none;
                    }

                    .b12e00ef-12a3-44aa-ab16-a7ed76c00204 {
                        fill: #fff;
                    }
                    </style>
                </defs>
                <rect class="ba11c43f-7664-417b-9120-9e729a88ce34" width="512" height="512"/>
                <rect class="b12e00ef-12a3-44aa-ab16-a7ed76c00204" x="73.5" y="246" width="250" height="20" rx="10" transform="translate(-122.45 299.91) rotate(-60)"/>
                <rect class="b12e00ef-12a3-44aa-ab16-a7ed76c00204" x="188.5" y="246" width="250" height="20" rx="10" transform="translate(378.45 -143.5) rotate(60)"/>
            </svg>
            <svg class="tbm-bookmarks-index-operation-item" id="tbmBookmarksIndexOpeItem_down" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                <defs>
                    <style>
                    .f7d5dcfe-7c2a-4635-a635-22b3877cc50a {
                        fill: none;
                    }

                    .a2a1c972-9d77-431a-aaf3-598004c1f529 {
                        fill: #fff;
                    }
                    </style>
                </defs>
                <rect class="f7d5dcfe-7c2a-4635-a635-22b3877cc50a" width="512" height="512"/>
                <rect class="a2a1c972-9d77-431a-aaf3-598004c1f529" x="188.5" y="246" width="250" height="20" rx="10" transform="translate(691.95 112.5) rotate(120)"/>
                <rect class="a2a1c972-9d77-431a-aaf3-598004c1f529" x="73.5" y="246" width="250" height="20" rx="10" transform="translate(76.05 555.91) rotate(-120)"/>
            </svg>
        </div>
    </div>
</div>
`;
}

function getBookmarkData() {
    return new Promise((resolve, reject) => {
        let filePath = 'bookmarks.txt';

        chrome.runtime.getPackageDirectoryEntry((dirEntry) => {
            dirEntry.getFile(filePath).file((file) => {
                let reader = new FileReader();

                reader.addEventListener('load', (event) => {
                    resolve(event.result);
                });

                reader.addEventListener('error', () => {
                    reject(filePath);
                });

                reader.readAsText(file);
            }, () => {
                reject(filePath);
            });
        });
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
