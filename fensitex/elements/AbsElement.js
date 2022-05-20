import {ND, NDC, ParenthesesElement} from './elements.js'
import {VirtElement} from '../VirtElement.js'

function AbsElement(parent, object, action) {
	ParenthesesElement.call(this, parent, object, action)
}

AbsElement.prototype = Object.create(ParenthesesElement.prototype)

AbsElement.prototype.split = function(index) {
	index--;
	let pair = this.content.split(index)
	return [
		new AbsElement(this, pair[0]), 
		new AbsElement(this, pair[1])
		]
}

AbsElement.prototype.compile = function(strict) {
	if(strict && this.content.cursorDistance() == 0)
		throw "Contents of abs can't be empty"
	return ' abs ( ' + this.content.compile(strict) + ' ) '
}

AbsElement.prototype.render = function(ref) {

	let container = document.createElement("div")
	let classes = {
		'closed': 'AbsClosedElement',
		'open(' : 'AbsLeftClosedElement',
		'open)' : 'AbsRightClosedElement'
	}
	container.className = "AbsElement " + classes[this.status]

	let leftP = document.createElement("div")
	leftP.className = "AbsWLElement"

	let leftSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	leftSvg.setAttribute("viewBox", "0 0 300 200")
	leftSvg.setAttribute("preserveAspectRatio", "none")
	leftSvg.innerHTML = '<path d="m 36.5104 191.742 c -9.131 -14.204 -20.2916 -29.423 -26.3792 -45.6564 c -6.0875 -17.2482 -9.1312 -33.4821 -9.1312 -49.7146 c 0 -16.2327 3.0438 -32.4665 9.1312 -49.7146 c 6.0875 -16.2334 17.2481 -31.4522 26.3792 -45.6564 h 12.1751 c -19.2772 31.4525 -29.423 63.9183 -29.423 95.371 c 0 31.453 10.1458 63.918 29.423 95.371 z">'
	leftP.appendChild(leftSvg)

	container.appendChild(leftP)

	container.appendChild(this.content.render(ref))

	return container
}

export {AbsElement}