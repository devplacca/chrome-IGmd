const media_type = {
	_9AhH0: 'image',
	_5wCQW: 'video',
	fXIG0: 'video', 
	tWeCl: 'video',
}

const media_cls = {
	video: 'tWeCl', 
	image: 'FFVAD'
}

let fetching

document.addEventListener('click', function(event) {
	// remove context menu if it previously exists...
	removeContextMenu()

	if (event.ctrlKey) {
		// then check if click event occured on a media element...
		path = event.path
		while (path) {
			target = path.shift()
			if (target && target.className in media_type) {
				// console.log('Still in listener but before assignment', target)
				event.target = target
				// console.log('Still in listener', event.target)
				break
			}
		}
		// then create a new menu if it does
		displayContextMenu(event)
	}
})

// document.addEventListener('scroll', removeContextMenu)
document.addEventListener('keydown', ev => {
	if (ev.code === 'Escape')  removeContextMenu()
})

function clearLoading(event) {
	fetching.parentNode.removeChild(fetching)
	event.target.style.cursor = 'default'
}

function displayContextMenu(event) {
	showLoading(event) 
	// get media link and create download context menu
	const menu = document.createElement('div')
	menu.classList.add('context-menu')
	// position context menu 
	menu.style.top = event.pageY + 'px'
	menu.style.left = event.pageX + 'px'
	setTimeout(() => {
		// insert elements into document
		getDownloadElement(event).then(res => {
			setTimeout(() => {
				menu.appendChild(res)
				document.body.appendChild(menu)
				clearLoading(event)

			}, 800)
		})
	}, 900)
}

function getDownloadElement(event) {
	const opts = getProperties(
		event.target, 
		media_type[event.target.className]
	) 
	fetching.innerText = 'Converting media file...'
	// get downloadable file...
	return srcToFile(
		opts.src, 
		opts.filename, 
		opts.mimetype
	).then(file => {
		fetching.innerText = 'Preparing download link...'
		// then create download link (anchor tag)
		let fsize = (file.size / 1e3).toFixed(1)
		const anchor = new DOMParser().parseFromString(
			`
			<a 
				href="${webkitURL.createObjectURL(file)}" 
				id="download" 
				download="${opts.filename}"
			>
				Download 
				<em id="size">
					${fsize >= 1e3 ? (fsize / 1e3).toFixed(1) + ' MB' : fsize + ' KB'}
				</em>
				<span id="cancel">&times;</span>
			</a>
			`, 'text/html'
		).body.firstElementChild
		
		return anchor
	})
}

function getProperties(target_elm, type) {
	const cls = media_cls[type]
	const elem = target_elm.parentNode.querySelector('.' + cls)
	let opts = {
		src: elem.src,
		filename: elem.src.split('=').pop(), 
		mimetype: type === 'image' ? 'image/jpeg' : elem.getAttribute('type')
	}
	opts.filename += `.${opts.mimetype.split('/').pop()}`

	return opts
}

function removeContextMenu() {
	const prev_menu = document.querySelector('.context-menu')
	if (prev_menu) {
		prev_menu.parentNode.removeChild(prev_menu)
	}
}

function showLoading(event) {
	event.target.style.cursor = 'progress'
	fetching = document.createElement('p')
	fetching.classList.add('fetching')
	fetching.innerText = 'Accessing url...'
	document.body.appendChild(fetching)
}

function srcToFile(src, fileName, mimeType){
	// convert url to blob / file object
    return (
    	fetch(src)
    	.then( res => { return res.arrayBuffer() } )
        .then( buf => { return new File([buf], fileName, {type:mimeType}) } )
    )
}
