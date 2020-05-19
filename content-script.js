const media_type = {
	_9AhH0: 'image',
	_5wCQW: 'video'
	fXIG0: 'video', 
}

const media_cls = {
	video: 'tWeCl', 
	image: 'FFVAD'
}

document.addEventListener('click', function(event) {
	// remove context menu if it previously exists...
	removeContextMenu()

	if (event.ctrlKey) {
		// then check if click event occured on a media element...
		if (event.target.className in media_type) {
			// then create a new menu if it does
			displayContextMenu(event)
		}
	}
})

document.addEventListener('scroll', removeContextMenu)

function removeContextMenu() {
	const prev_menu = document.querySelector('.context-menu')
	if (prev_menu) {
		prev_menu.parentNode.removeChild(prev_menu)
	}

}

function displayContextMenu(event) {
	// get media link and create download context menu
	const menu = document.createElement('div')
	menu.classList.add('context-menu')
	// position context menu 
	menu.style.top = event.pageY + 'px'
	menu.style.left = event.pageX + 'px'
	// insert elements into document
	getDownloadElement(event).then(res => {
		menu.appendChild(res)
		document.body.appendChild(menu)
	})
}

function getDownloadElement(event) {
	const opts = getProperties(
		event.target, 
		media_type[event.target.className]
	) 
	// get downloadable file...
	return srcToFile(
		opts.src, 
		opts.filename, 
		opts.mimetype
	).then(file => {
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
				<em id="size">${fsize >= 1e3 ? (fsize / 1e3).toFixed(1) + ' MB' : fsize + ' KB'}</em>
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

function srcToFile(src, fileName, mimeType){
	// convert url to blob / file object
    return (
    	fetch(src)
    	.then( res => { return res.arrayBuffer() } )
        .then( buf => { return new File([buf], fileName, {type:mimeType}) } )
    )
}
