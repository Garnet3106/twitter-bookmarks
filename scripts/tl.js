tlPageLoaded();


function tlPageLoaded() {
    addCSSLink();

    getTLSection()
        .then((section) => {
            setInterval(() => {
                scanTLTweet(section);
            }, 500);
        })
        .catch((err) => {
            console.log(`Couldn't get the TL section: ${err}`);
        });
}

function getTLSection() {
    return new Promise((resolve, reject) => {
        let sectionIntervalCount = 0;
        const sectionIntervalLimit = 10;

        let sectionInterval = setInterval(() => {
            let sections = document.getElementsByTagName('section');

            if(sections.length !== 0) {
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

function scanTLTweet(section) {
    let articleList = section.getElementsByTagName('article');
    let articleAttrName = 'tbmscanned';

    for(let i = 0; i < articleList.length; i++) {
        let article = articleList[i];

        if(article.hasAttribute(articleAttrName))
            continue;

        addTweetBookmarkIcon(article);

        article.setAttribute(articleAttrName, '');
    }
}

function getTweetIconArea(article) {
    let defaultIcons = article.getElementsByTagName('svg');
    let iconArea = defaultIcons[defaultIcons.length - 1];

    for(let i = 0; i < 5; i++) {
        if(iconArea === undefined)
            return null;

        iconArea = iconArea.parentNode;
    }

    return iconArea;
}

function addCSSLink() {
    let linkID = 'tbmTweetStyle'

    if(document.getElementById(linkID) !== null)
        return;

    let link = document.createElement('link');

    link.href = chrome.runtime.getURL('./data/section/tweet.css');
    link.id = linkID;
    link.rel = 'stylesheet';

    document.head.appendChild(link);
}

function addTweetBookmarkIcon(article) {
    let iconArea = getTweetIconArea(article);

    if(iconArea === null) {
        console.error('Couldn\'t load default tweet icons.');
        return;
    }

    let iconItem = document.createElement('div');

    iconItem.className = 'tbm-tweet-bookmark-icon';

    let img = document.createElement('img');

    img.height = '15';
    img.src = chrome.runtime.getURL('data/section/bookmark.svg');
    img.width = '15';

    iconItem.appendChild(img);
    iconArea.appendChild(iconItem);
}
