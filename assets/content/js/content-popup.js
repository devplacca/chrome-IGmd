// instagram element class names
const [trgts, media, divs] = [
	['wpO6b ', '_8-yf5 '],
	{
		FFVAD: 'image/jpg',
		tWeCl: 'video/mp4'
	},
	['.KL4Bh', '._5wCQW']
]

let postPath;
let popupMenu;
let buttonInserted = false
const observerOptions = {
  childList: true,
  subtree: true
}

/*
	save event on every click. This helps grab the necessary
	information we need to create the download link
*/
document.addEventListener('click', event => {
	postPath = event.path
})

// this is custom event listener
document.addEventListener('popupmenu', () => {
	// temporarily stop monitoring changes in order to avoid getting stuck
	// in an infinite loop when we attempt to insert the download button
	observer.disconnect();
	if (!buttonInserted) {
		insertDownloadButton(popupMenu);
	}
})

// monitor changes/mutations in body element
// the purpose of monitoring to find out if the popup menu is in view or not
const observer = new MutationObserver(mutations => {
	for (mutation of mutations) {
		// perform this check in order to avoid inserting the download button multiple times
		const {previousSibling: sibling} = mutation;
		// console.log(sibling)
		if (sibling?.classList && !sibling.classList.contains('RnEpo')) {
			popupMenu = document.body.querySelector('.mt3GC');
			if (popupMenu) {
				buttonInserted = false;
				const customEvent = new Event('popupmenu', {
					bubbles: false,
					cancelable: true
				})
				document.dispatchEvent(customEvent)
				break
			}
		}
	}
});

observer.observe(document.body, observerOptions);


function insertDownloadButton(menu) {
	const downloadBtn = createElementFromString(`
		<button class="aOOlW   HoLwm " tabindex="0">
			Download
		</button>
	`);
	downloadBtn.onclick = event => downloadFile(event);
	// add button to popup menu
	menu.insertBefore(downloadBtn, menu.lastElementChild)
	buttonInserted = true;
	observer.observe(document.body, observerOptions); // resume monitoring
}


function downloadFile(event) {
	// const { parentNode } = event.currentTarget;
	// parentNode.parentNode.removeChild(parentNode); // close popup menu

	const loading = showLoading(event) // shows progress banner

	let article
	for (let parent of postPath) {
		if (parent.localName === 'article') {
			article = parent
			break
		}
	}

	const props = getDownloadProps(article);

	srcToFile(props.url)
	.then(blob => {
		// window['ig-down-fetching'].innerText = 'Downloading...';
		loading.innerText = 'Downloading'
		const downloadLink = createElementFromString(`
			<a
				href="${webkitURL.createObjectURL(blob)}"
				download="${props.filename}"
			></a>
		`)
		// const anchor = document.createElement('a');
		// anchor.download = props.name;
		// anchor.href = webkitURL.createObjectURL(blob);
		// anchor.click();
		downloadLink.click();

		clearLoading(event) // removes progress banner
	})
	.catch(err => alert(
		'Sorry! An unexpected error occured. ' +
		'Please check your internet connection and try again'
	))
	.finally(() => loading.parentNode.removeChild(loading))
}

function getDownloadProps(postArticleElm) {
	if (!postArticleElm) {
		return getPropsFromStory()
	} else {
		return getPropsFromArticle(postArticleElm)
	}
}

function getPropsFromStory () {
	const storyWrapper = window['react-root'].querySelector('section.szopg');
	const mediaWrapper = storyWrapper.querySelector('.qbCDp');
	let type;
	// first assume the media is a video and grab that...
	let url = (mediaWrapper.querySelector('video.y-yJ5')?.firstElementChild || {})?.src;
	if (!url) {
		// if assumption fails, the media is a definitely an image.
		url = mediaWrapper.querySelector('img.y-yJ5').src;
		type = 'image/jpg';
	} else {
		type = 'video/mp4';
	}
	const header = storyWrapper.querySelector('header.C1rPk');
	const username = header.querySelector('div.Rkqev').textContent;
	const filename = createFileName(url, mimeType, username)
	console.log({url, username, mimeType, filename});
	return {url, mimeType, filename};
}

function getPropsFromArticle (article) {
	for (let cls of divs) {
		media_div = article.querySelector(cls)
		mediaElm = media_div ? media_div.firstElementChild : null

		if (mediaElm) {
			const url = mediaElm.src;
			const mimeType = media[mediaElm.className];
			const filename = createFileName(
				url,
				mimeType,
				article.innerText.split('\n').shift(), // username
			);
			return { url, mimeType, filename };
		}
	}
};

function createFileName(url, mimeType, ...others) {
	url = url.split('=').pop().split('%').shift();
	mimeType = mimeType.split('/').pop();
	return `${others.join('&')}-${url}.${mimeType}`;
}
