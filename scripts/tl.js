var isIconShowed = false;
var iconElems = [];


tlPageLoaded();


function tlPageLoaded() {
    addCSSLink();

    getTLSection()
        .then((section) => {
            setBookmarkIconKeyEvents(section);
        })
        .catch((err) => {
            console.log(`Couldn't get the TL section: ${err}`);
        });
}

function getTLSection() {
    return new Promise((resolve, reject) => {
        let sectionIntervalCount = 0;
        const sectionIntervalLimit = 50;

        let sectionInterval = setInterval(() => {
            let sections = document.getElementsByTagName('section');

            if(sections.length > 2) {
                clearInterval(sectionInterval);
                resolve(sections[0]);
                return;
            } else {
                let articles = document.getElementsByTagName('article');

                if(articles.length > 0) {
                    clearInterval(sectionInterval);
                    resolve(sections[0]);
                    return;
                }
            }

            if(sectionIntervalCount === sectionIntervalLimit) {
                console.log('notfound');
                clearInterval(sectionInterval);
                reject('null: section (timeout)');
                return;
            }

            sectionIntervalCount += 1;
        }, 500);
    });
}

function setBookmarkIconKeyEvents(section) {
    document.body.onkeydown = (event) => {
        if(event.key !== 'Control')
            return;

        if(!isIconShowed) {
            let articleList = section.getElementsByTagName('article');

            for(let i = 0; i < articleList.length; i++) {
                let article = articleList[i];
                let iconItem = addTweetBookmarkIcon(article);

                if(iconItem === null)
                    continue;

                iconElems.push(iconItem);
            }

            isIconShowed = true;
        } else {
            for(let i = 0; i < iconElems.length; i++)
                iconElems[i].remove();

            iconElems = [];
            isIconShowed = false;
        }
    };
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
        return null;
    }

    let iconItem = document.createElement('div');

    iconItem.className = 'tbm-tweet-bookmark-icon';

    iconItem.addEventListener('click', onTweetBookmarkIconClick);

    let img = document.createElement('img');

    img.height = '15';
    img.src = chrome.runtime.getURL('data/section/bookmark.svg');
    img.width = '15';

    iconItem.appendChild(img);
    iconArea.appendChild(iconItem);

    return iconItem;
}

function removeAllTweetBookmarkIcons() {
    for(let i = 0; i < iconElems.length; i++) {
        if(iconElems[i] === null)
            continue;

        iconElems[i].parentNode.style.alignItems = 'flex-start';
        iconElems[i].remove();
    }

    isIconShowed = false;
}

function onTweetBookmarkIconClick(event) {
    let target = event.target;

    if(target.tagName === 'IMG')
        target = target.parentNode;

    let list = document.createElement('div');

    list.className = 'tbm-tweet-bookmark-list';
    list.innerHTML = '<div class="tbm-tweet-bookmark-list-item"><div class="tbm-tweet-bookmark-list-item-text">foldername</div></div>';

    target.parentNode.appendChild(list);

    removeAllTweetBookmarkIcons();

    event.preventDefault();
}
