// instagram element class names
const trgts = ['wpO6b ', '_8-yf5 ']
const media = {
	'img._aagt': 'image/jpg', // post image
	'video._ab1d': 'video/mp4', // post video
	'img._aa63._ac51': 'image/jpg', // story image
	'video._aa63._ac3u > source': 'video/mp4', // story video
}
// const divs = ['._aagt', '.KL4Bh']
const popupMenuContainerClassName = 'h4m39qi9'
const popupMenuClassName = '._a9-z'
const popupMenuButtonClassName = '_a9-- _a9_1'
const popupMenuTriggerButtonClassName = '_abl-'
const storyContainerClassName = '_ac0a'

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
	// find the element that triggered the popup menu when clicked
	const { classList } = target;
	if (!classList) return

	const postMatches = [
		popupMenuTriggerButtonClassName,
		'_abm0',
		'_ab8w',
		'_ab6-'
	].some(cn =>
		classList.contains(cn) || target.localName === 'circle'
	)
	if (postMatches) {
		postPath = path;
		postType = 'article';
	}
	if (document.body.querySelector(`section.${storyContainerClassName}`)) {
		postType = 'story'
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
	for (const mutation of mutations) {
		// perform this check in order to avoid inserting the download button multiple times
		const addedNode = (mutation.addedNodes || {})[0];
		if (!addedNode?.classList?.length) continue

		if (addedNode.classList.contains(popupMenuContainerClassName)) {
			popupMenu = addedNode.querySelector(popupMenuClassName);

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
		<button class="${popupMenuButtonClassName}" tabindex="0">
			Download
		</button>
	`);
	downloadBtn.onclick = event => downloadFile(event);
	menu.insertBefore(downloadBtn, menu.lastElementChild) // add button to popup menu
	buttonInserted = true;
	observer.observe(document.body, observerOptions); // resume monitoring
}


async function downloadFile(event) {
	// const { parentNode } = event.currentTarget;
	// parentNode.parentNode.removeChild(parentNode); // close popup menu

	const props = getDownloadProps();
	if (!props.url) return

	const indicator = showLoading(event); // shows progress banner
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
		downloadLink.setAttribute('download', props.filename);
		downloadLink.setAttribute('href', webkitURL.createObjectURL(blob));
		console.log({blob, downloadLink})
		downloadLink.click();
	})
	.catch(err => {
		console.error(err);
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
	const storyContainer = document.body.querySelector(`section.${storyContainerClassName}`);
	// const mediaWrapper = storyContainer.querySelector('.qbCDp');
	let mimeType, url, filename;
	for (const selector of Object.keys(media)) {
		const storyMedia = storyContainer.querySelector(selector)

		if (storyMedia) {
			const username = storyContainer.querySelector('div._ac0q').textContent;
			url = storyMedia.src
			mimeType = media[selector]
			filename = createFileName(
				url,
				mimeType,
				username
			);
			break
		}
	}

	return { url, mimeType, filename };
}

function getPropsFromArticle () {
	// let article
	for (let parent of postPath) {
		if (parent.localName !== 'article') continue

		let url, mimeType;
		// const username = parent.innerText.split('\n').shift();
		// check if article contains a list of posts and
		// get the properties from the right list item
		if (parent.querySelector('li._acaz')) {
			parent = getParentFromSlides(parent);
		}

		for (const selector of Object.keys(media)) {
			mediaElm = parent.querySelector(selector);

			if (mediaElm) {
				url = mediaElm.src;
				mimeType = media[selector];
				break
			}
		}

		const descriptionElem = parent.querySelector('._ab8x._ab94._ab99') || parent.querySelector('._a9zr')
		// const filename = createFileName(
		// 	'',
		// 	mimeType,
		// 	// username,
		// 	descriptionElem.innerText.split('\n\n')[0].split('\n').slice(0, 10).join(' ')
		// );
		return {
			url,
			mimeType,
			filename: `${
				descriptionElem.innerText.split('\n\n')[0].split('\n').slice(0, 10).join(' ')
			}.${
				mimeType.split('/').pop()
			}`
		};
	}
}

function getParentFromSlides (ancestor) {
	const container = ancestor.querySelector('div._aao_');
	const { x: containerX } = container.getBoundingClientRect();
	for (post of ancestor.querySelector('ul._acay').children) {
		const { x: postX } = post.getBoundingClientRect();
		if (containerX === postX) {
			return post
		}
	}
}
