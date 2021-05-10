tlPageLoaded();


function tlPageLoaded() {
    let tweetObserver = new MutationObserver(onTLSectionChange);

    getTLSection()
        .then((section) => {
            tweetObserver.observe(section, {
                characterData: true,
                childList: true,
                subtree: true
            });

            // setInterval(() => {
            //     console.log(document.getElementsByTagName('article').length)
            // }, 1000);
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

function onTLSectionChange(event) {
    let target = event[0].target;

    if(Object.prototype.toString.call(target) !== "[object HTMLDivElement]")
        return;

    let articleList = target.getElementsByTagName('article');
    let articleAttrName = 'tbmscanned';

    if(articleList.length === 0)
        return;

    for(let i = 0; i < articleList.length; i++) {
        let article = articleList[i];

        if(article.hasAttribute(articleAttrName))
            return;

        addTweetBookmarkIcon(article);

        article.setAttribute(articleAttrName, '');
    }
}

function getTweetIconArea(article) {
    let iconArea = article.getElementsByTagName('svg')[4];

    for(let i = 0; i < 5; i++)
        iconArea = iconArea.parentNode;

    return iconArea;
}

function addTweetBookmarkIcon(article) {
    let iconArea = getTweetIconArea(article);

    let iconItem = document.createElement('div');

    iconItem.className = 'tbm-tweet-bookmark-icon';

    let img = document.createElement('img');

    img.height = '15';
    img.src = chrome.runtime.getURL('data/section/bookmark.svg');
    img.width = '15';

    iconItem.appendChild(img);
    iconArea.appendChild(iconItem);
}
