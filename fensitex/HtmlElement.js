import {VirtElement} from './VirtElement.js'
import {NDC} from './elements/NDC.js'
import {AutoCompleteElement} from './AutoCompleteElement.js'
import {AssignmentElement} from './AssignmentElement.js'
import {refreshFields} from '../FieldManager.js'

function HtmlElement(parent) {
	this.parent = parent
	this.autoComplete = new AutoCompleteElement(this)
	this.rendered = null;
	this.fakeInput = null;
	this.activeElement = null;
	this.cursorPos = null;
	this.shift = false
	this.control = false
	this.initialize();
}

HtmlElement.prototype.initialize = function() {
	let element = document.createElement("input")
	element.className = "fakeInput"
	let handler = this.handler.bind(this)
	element.addEventListener("keydown", handler)
	element.addEventListener("blur", (event) => {
		this.parent.parent.input.blur()
	})
	this.fakeInput = element

	let container = document.createElement("div")
	container.className = "rendered"
	container.appendChild(element)
	container.appendChild(this.parent.VirtElement.render(this))
	container.addEventListener('click', (event) => {
		this.parent.parent.focus(event)
	})
	this.rendered = container
}

HtmlElement.prototype.render = function() {
	let rendered = this.parent.VirtElement.render(this)
	this.clearHtml()
	this.rendered.appendChild(rendered)
	return this.rendered
};

HtmlElement.prototype.handler = function(event) {

	if(!this.autoComplete.handlePre(event)) {
		this.activeElement.handle(event, this)
		if(!this.activeElement)
			return
		// this.autoComplete.refresh()
	}

	this.autoComplete.handlePost(event)
	

	this.globalizeCursor()

	let vElement = this.parent.VirtElement

	vElement.refreshLock()
	vElement.positionCursor(this)
	this.render()

	refreshFields(this.parent)
}

HtmlElement.prototype.globalizeCursor = function() {
	let el = this.activeElement
	if(!el)
		return
	while(!(this.activeElement instanceof AssignmentElement)) {
		// fix this later
		el = el.parent
		el.setupCursorLower(this)
	}
	return this
}

HtmlElement.prototype.focus = function() {
	this.fakeInput.focus()
	this.parent.VirtElement.positionCursorEnd(this)
	this.render()
}

HtmlElement.prototype.blur = function() {
	this.fakeInput.blur()
	this.activeElement = null
	this.cursorPos = null
	this.rendered
	this.render()
	let domAC = document.getElementById("autoComplete");
	domAC.firstElementChild && domAC.removeChild(domAC.firstElementChild);
}

HtmlElement.prototype.clearHtml = function() {
	let ref = this.rendered.children[1]
	if(!ref)
		return
	ref.parentElement.removeChild(ref)
}

HtmlElement.prototype.generateCursor = function(span) {

	let wrapper = document.createElement("div")
	wrapper.className = "activeElement"

	let cursor = document.createElement("div")
	cursor.className = "Cursor"
	
	let content = span.textContent;
	let span2 = span.cloneNode()
	span .textContent = content.substring(0, this.cursorPos)
	span.className += " LeftOfCursor"
	span2.textContent = content.substring(this.cursorPos)
	span2.className += " RightOfCursor"

	wrapper.appendChild(span)
	wrapper.appendChild(cursor)
	wrapper.appendChild(span2)

	this.renderAutoComplete(cursor)

	return wrapper
}

HtmlElement.prototype.renderAutoComplete = async function (el) {
	
	await new Promise(resolve => setTimeout(resolve, 0))

	let dims = el.getBoundingClientRect()
	if(!dims) {
		return
	}

	this.autoMoveInputWindow(dims)

	let AC = this.autoComplete.render()
	let domAC = document.getElementById("autoComplete");

	domAC.firstElementChild && domAC.removeChild(domAC.firstElementChild);


	if(!AC)
		return

	AC.style.top = dims.top + dims.height + 'px'
	AC.style.left = dims.left + 'px'	

	domAC.appendChild(AC)
}

HtmlElement.prototype.autoMoveInputWindow = function(dims) {

	let inputDims = this.rendered.getBoundingClientRect()

	let scrollWidth = this.rendered.scrollWidth
	let scrollLeft  = this.rendered.scrollLeft
	let thresh  = inputDims.width*0.2

	let offset = dims.left - inputDims.left

	if(offset < thresh) {
		offset = -(thresh - offset)
	}
	else if(offset > inputDims.width - thresh) {
		offset = offset - (inputDims.width - thresh)
	}
	else
		return

	this.rendered.scrollLeft += offset
}

HtmlElement.prototype.renderError = function (message) {
	
	let dims = this.rendered.getBoundingClientRect()
	if(!dims) {
		return
	}

	let domError = document.getElementById("errorField");

	domError.firstElementChild.children[2].textContent = message

	domError.style.top  =  dims.top + 'px'
	domError.style.display = 'flex'
}

HtmlElement.prototype.clearError = function() {	
	let domError = document.getElementById("errorField");
	domError.style.display = 'none'
}


export {HtmlElement}