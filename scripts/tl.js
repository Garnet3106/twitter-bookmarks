var haveKeyEventsSet = false;


tlPageLoaded();


function tlPageLoaded() {
    addCSSLink();

    if(!haveKeyEventsSet) {
        getTLSection()
            .then((section) => {
                setBookmarkIconKeyEvents(section);
                haveKeyEventsSet = true;
            })
            .catch((err) => {
                console.log(`Couldn't get the TL section: ${err}`);
            });
    }
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

function setBookmarkIconKeyEvents(section) {
    let ctrlKeyDown = false;

    document.body.addEventListener('keydown', (event) => {
        if(ctrlKeyDown)
            return;

        if(!event.ctrlKey)
            return;

            console.log('down');
        console.log(ctrlKeyDown);
        console.log(event.ctrlKey)

        // let articleList = section.getElementsByTagName('article');

        // for(let i = 0; i < articleList.length; i++) {
        //     let article = articleList[i];

        //     addTweetBookmarkIcon(article);
        // }

        ctrlKeyDown = true;
    });

    document.body.addEventListener('keyup', (event) => {
        if(!ctrlKeyDown)
            return;

        if(event.ctrlKey)
            return;

            console.log('up');
        console.log(ctrlKeyDown);
        console.log(event.ctrlKey)

        // let icons = section.getElementsByClassName('tbm-tweet-bookmark-icon');

        // console.log(icons);
        // for(let i = 0; i < icons; i++)
        //     icons[i].parentNode.removeChild(icons[i]);

        ctrlKeyDown = false;
    });
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

    iconItem.addEventListener('click', onTweetBookmarkIconClick);

    let img = document.createElement('img');

    img.height = '15';
    img.src = chrome.runtime.getURL('data/section/bookmark.svg');
    img.width = '15';

    iconItem.appendChild(img);
    iconArea.appendChild(iconItem);
}

function onTweetBookmarkIconClick(event) {
    let target = event.target;

    if(target.tagName === 'IMG')
        target = target.parentNode;

    let list = document.createElement('div');

    list.className = 'tbm-tweet-bookmark-list';
    list.innerHTML = 'aa<div class="tbm-tweet-bookmark-list-item"><div class="tbm-tweet-bookmark-list-item-text">foldername</div></div>';

    target.parentNode.appendChild(list);

    event.preventDefault();
}
