// instagram element class names
const [trgts, media, divs] = [
	['wpO6b ', '_8-yf5 '],
	{
		FFVAD: 'image/jpg',
		tWeCl: 'video/mp4'
	},
	['._5wCQW', '.KL4Bh']
]

let postPath;
let popupMenu;
let postType;
let buttonInserted = false
const observerOptions = {
  childList: true,
  subtree: true
}

/*
	save event on every click. This helps grab the necessary
	information we need to create the download link
*/
document.addEventListener('click', ({target, path}) => {
	const {classList} = target;
	if (['_8-yf5', 'Igw0E'].some(cn => classList.contains(cn))) {
		postPath = path;
		postType = 'article';
	} else if (classList.contains('u-__7')) {
		postType = 'story';
	} else {
		return
	}
})

// this is custom event listener
document.addEventListener('popupmenu', () => {
	/*
		temporarily stop monitoring changes in order to avoid getting stuck
		in an infinite loop when an attempt is made to insert the download button
	*/
	observer.disconnect();
	if (!buttonInserted) {
		insertDownloadButton(popupMenu);
	}
})

/*
	monitor changes/mutations in body element
	the purpose of monitoring to find out if the popup menu is in view or not
*/
const observer = new MutationObserver(mutations => {
	for (mutation of mutations) {
		// perform this check in order to avoid inserting the download button multiple times
		const addedNode = (mutation.addedNodes || {})[0];
		if (addedNode && addedNode.classList?.contains('RnEpo')) {
			popupMenu = addedNode.querySelector('.mt3GC');
			if (popupMenu) { // popup menu is in view
				buttonInserted = false;
				const popupEvent = new Event('popupmenu', {
					bubbles: false,
					cancelable: true
				})
				document.dispatchEvent(popupEvent);
				return;
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


async function downloadFile(event) {
	// const { parentNode } = event.currentTarget;
	// parentNode.parentNode.removeChild(parentNode); // close popup menu

	const indicator = showLoading(event); // shows progress banner
	const props = getDownloadProps();
	/*
	const [type, ext] = props.mimeType.split('/');
	const fileHandle = await window.showSaveFilePicker({
		excludeAcceptAllOption: true,
		types: [{
			description: `Media, ${type.toTitleCase()}`,
			accept: {
				[props.mimeType]: ['.' + ext]
			}
		}],
	})
	console.log(fileHandle)
	return
	*/

	srcToFile(props.url)
	.then(blob => {
		indicator.innerText = 'Downloading...';
		const downloadLink = document.createElement('a');
		downloadLink.download = props.filename;
		downloadLink.href = webkitURL.createObjectURL(blob);
		downloadLink.click();
	})
	.catch(err => {
		console.log(err);
		alert('Sorry! An unexpected error occured. This is probably a problem with Instagram')
	})
	.finally(() => clearLoading(indicator, event))
}

function getDownloadProps() {
	switch (postType) {
		case 'article':
			return getPropsFromArticle()
		case 'story':
			return getPropsFromStory()
	}
}

function getPropsFromStory () {
	const storyWrapper = window['react-root'].querySelector('section.szopg');
	const mediaWrapper = storyWrapper.querySelector('.qbCDp');
	let mimeType;
	// first assume the media is a video and grab that...
	let url = (mediaWrapper.querySelector('video.y-yJ5')?.firstElementChild || {})?.src;
	if (!url) {
		// if assumption fails, the media is a definitely an image.
		url = mediaWrapper.querySelector('img.y-yJ5').src;
		mimeType = 'image/jpg';
	} else {
		mimeType = 'video/mp4';
	}
	const username = storyWrapper.querySelector('div.Rkqev').textContent;
	const filename = createFileName(url, mimeType, username);
	console.log({url, username, mimeType, filename});
	return {url, mimeType, filename};
}

function getPropsFromArticle () {
	// let article
	for (let parent of postPath) {
		if (parent.localName === 'article') {
			let url, mimeType;
			const username = parent.innerText.split('\n').shift();
			// check if article contains a list of posts and
			// get the properties from the right list item
			if (parent.querySelector('li.Ckrof')) {
				parent = getParentFromMultiple(parent);
			}
			for (let cls of divs) {
				mediaContainer = parent.querySelector(cls);
				mediaElm = mediaContainer?.firstElementChild;
				if (mediaElm) {
					url = mediaElm.src;
					mimeType = media[mediaElm.className];
					break
				}
			}
			const filename = createFileName(
				url,
				mimeType,
				username
			);
			console.log({url, mimeType, filename});
			return { url, mimeType, filename };
		}
	}
}

function getParentFromMultiple (ancestor) {
	const container = ancestor.querySelector('div.ekfSF');
	const {x: containerX} = container.getBoundingClientRect();
	for (post of ancestor.querySelector('ul.vi798').children) {
		const {x: postX} = post.getBoundingClientRect();
		if (containerX === postX) {
			return post
		}
	}
}
