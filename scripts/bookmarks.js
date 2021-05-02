bookmarkPageLoaded();

function bookmarkPageLoaded() {
    getBookmarkSection()
        .then((section) => {
            let itemWrapper = getBookmarkItemWrapper(section);

            if(itemWrapper === null)
                return;

            let indexElem = addBookmarkIndex(itemWrapper);
        })
        .catch(() => {
            console.log('null: section (timeout)');
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

            if(sectionIntervalCount == sectionIntervalLimit) {
                clearInterval(sectionInterval);
                reject();
                return;
            }

            sectionIntervalCount += 1;
        }, 500);
    });
}

function getBookmarkItemWrapper(section) {
    const itemWrapper_1 = section.getElementsByTagName('div').item(0);

    if(itemWrapper_1 === null) {
        console.log('null: item wrapper 1');
        return null;
    }

    const itemWrapper_2 = itemWrapper_1.getElementsByTagName('div').item(0);

    if(itemWrapper_2 === null) {
        console.log('null: item wrapper 2');
        return null;
    }

    return itemWrapper_2;
}

function addBookmarkIndex(itemWrapper) {
    if(document.getElementById('tbmBookmarksIndex') !== null)
        return;

    setCSSStyle();

    const indexElem = document.createElement('div');

    itemWrapper.insertBefore(indexElem, itemWrapper.firstChild);

    return indexElem;
}

function setCSSStyle() {
    if(document.getElementById('tbmCSSStyle') !== null)
        return;

    const cssStyleElem = document.createElement('style');

    cssStyleElem.id = 'tbmCSSStyle';

    cssStyleElem.innerHTML = `
        
    `;

    document.head.insertBefore(cssStyleElem, document.head.lastChild);
}
