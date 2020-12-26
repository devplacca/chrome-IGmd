function srcToFile(src){
	// convert url to blob / file object
    return fetch(src).then(res => {return res.blob()})
}

function showLoading(event) {
	event.target.style.cursor = 'progress'
	fetching = createElementFromString(`
		<p id="ig-down-fetching" class="fetching">
			Accessing url...
		</p>
	`)
	document.body.appendChild(fetching)
	return fetching
}

function clearLoading(event) {
	fetching.parentNode.removeChild(fetching)
	event.target.style.cursor = 'unset'
}

function createElementFromString (string) {
	const parser = new DOMParser();
	const parsedHtml = parser.parseFromString(string, 'text/html');
	return parsedHtml.body.firstElementChild;
}
