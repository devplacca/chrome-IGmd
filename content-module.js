function srcToFile(src, fileName, mimeType){
	// convert url to blob / file object
    return (
    	fetch(src)
    	.then( res => { return res.blob() } )
        // .then( buf => { return new File([buf], fileName, {type:mimeType}) } )
    )
}

function showLoading(event) {
	event.target.style.cursor = 'progress'
	fetching = document.createElement('p')
	fetching.classList.add('fetching')
	fetching.innerText = 'Accessing url...'
	document.body.appendChild(fetching)
}

function clearLoading(event) {
	fetching.parentNode.removeChild(fetching)
	event.target.style.cursor = 'unset'
}
