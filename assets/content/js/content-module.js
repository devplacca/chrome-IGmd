function srcToFile(src){
	// convert url to blob / file object
   return fetch(src)
   	.then(res => {
   		return res.blob()
   	})
   	.catch(err => {
   		throw err
   	})
}

function showLoading(event) {
	event.target.style.cursor = 'progress'
	fetching = createElementFromString(`
		<p class="fetching">
			Accessing url...
		</p>
	`)
	document.body.appendChild(fetching)
	return fetching
}

function clearLoading(elm, event) {
	elm.parentNode.removeChild(elm)
	event.target.style.cursor = 'pointer'
}

function createElementFromString (string) {
	const parser = new DOMParser();
	const parsedHtml = parser.parseFromString(string, 'text/html');
	return parsedHtml.body.firstElementChild;
}

function createFileName(url, mimeType, ...others) {
	url = url ? url.split('=').pop().split('%').shift() : url;
	mimeType = mimeType.split('/').pop();
	return `${others.join('-')}-${url}.${mimeType}`;
}

String.prototype.toTitleCase = function () {
  return this[0].toUpperCase() + this.substring(1)
}
