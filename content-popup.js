// instagram element class names
const [trgts, media, divs] = [
	['wpO6b ', '_8-yf5 '],
	{
		FFVAD: 'image/jpg',
		tWeCl: 'video/mp4'
	},
	['.KL4Bh', '._5wCQW']
]

document.addEventListener(
	'click',
	// add a delay to ensure that the popup menu is ready before inserting button
	// might take a few retries to work
	// TODO: make insertion seamless and instant
	ev => setTimeout(() => insertDownloadLink(ev), 30)
)

function insertDownloadLink({target, path}) {
	const { className } = target

	if (trgts.includes(className.baseVal || className)) {
		const [popup, download_btn] = [
			document.querySelector('.mt3GC'),
			// create download button for popup menu
			new DOMParser().parseFromString(
				`<button
					id="pop-download-opt"
					class="aOOlW   HoLwm "
					tabindex="0"
				>Download</button>`,
				'text/html'
			).body.firstElementChild
		]
		// add button to popup menu
		popup.insertBefore(
			download_btn,
			popup.lastElementChild
		)

		download_btn.onclick = e => downloadFile(e, path)
	}
}


function downloadFile(event, path) {
	showLoading(event) // shows progress banner

	for (let parent of path) {
		if (parent.localName === 'article') {
			break
		}
	}

	const { url, type, name } = getDownloadProps(parent)

	srcToFile(url, name, type)
	.then(blob => {
		const anchor = document.createElement('a')
		anchor.download = name
		anchor.href = webkitURL.createObjectURL(blob)
		anchor.click()

		clearLoading(event) // removes progress banner
	})
}

function getDownloadProps(elm) {
	let url, type, name

	for (let cls of divs) {
		media_div = elm.querySelector(cls)
		media_elm = media_div ? media_div.firstElementChild : null

		if (media_elm) {
			url = media_elm.src
			type = media[media_elm.className]
			name = `${
				// gets account name from which the media file is being retrieved
				elm.innerText.split('\n').shift()
			}-${
				url.split('=').pop()
			}.${
				type.split('/').pop()
			}`

			return { url, type, name }
		}
	}
}
