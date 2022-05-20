import {VirtElement} from '../VirtElement.js'
import {NumberElement, VariableElement} from './elements.js'
import {isAlphaNumeric} from '../helpers.js'
import {tokenizeString} from '../helpers.js'


function ND(parent, object) {

	this.parent = parent
	this.id = parent.idCounter++
	this.content = object || ""
	this.isLinearLeft = true
	this.isLinearRight = true
}

ND.prototype.getLastInput = function() {
	return this
}

ND.prototype.getFirstInput = function() {
	return this
}

ND.prototype.handle = function(event, ref) {

	//skip these
	if(event.keyCode === 16 || event.keyCode === 17) {
		return
	}

	if(event.ctrlKey || event.altKey)
		return

	event.preventDefault()

	//navigation

	if(event.keyCode === 37) {		//left
		if(ref.cursorPos == 0) {
			this.parent.handleNav(ref, -1, this.id)
			return
		}
		ref.cursorPos--;
		return
	}
	if(event.keyCode === 39) {		//right
		if(ref.cursorPos == this.content.length) {
			this.parent.handleNav(ref,  1, this.id)
			return
		}
		ref.cursorPos++;
		return
	}
	if(event.keyCode === 38 ||
	   event.keyCode === 40) {		//up/down

		return this.parent.handle(ref, event, this.id);
	}

	if(event.keyCode === 8) { 		//backspace

		if(ref.cursorPos == 0) {
			return this.parent.handleBackspace(ref, this.id)
		}

		ref.cursorPos--;

		this.content = this.content.substring(0, ref.cursorPos) +
					   this.content.substring(ref.cursorPos+1)


		this.parent.refreshActive(ref)

		return
	}

	if(event.keyCode === 46) { 		//delete

		if(ref.cursorPos == this.content.length) {
			return this.parent.handleDel(ref, this.id)
		}

		this.content = this.content.substring(0, ref.cursorPos) +
					   this.content.substring(ref.cursorPos+1)


		this.parent.refreshActive(ref)

		return
	}

	if(isAlphaNumeric(event.key)) {

		this.content = this.content.substring(0, ref.cursorPos) 
					 + event.key + this.content.substring(ref.cursorPos)
		ref.cursorPos++;
		this.parent.refreshActive(ref)
		return
	}

	this.parent.handle(ref, event, this.id)
};

ND.prototype.cutEnd = function(ref) {
	this.content = this.content.slice(0, -1)
	this.positionCursorEnd(ref)
	this.parent.refreshActive(ref)
}

ND.prototype.cutStart = function(ref) {
	this.content = this.content.slice(1)
	this.positionCursorStart(ref)
	this.parent.refreshActive(ref)
}

ND.prototype.cursorDistance = function() {
	return this.content.length
}

ND.prototype.positionCursor = function(ref) {
	ref.activeElement = this
}

ND.prototype.positionCursorEnd = function(ref) {
	ref.activeElement = this
	ref.cursorPos = this.content.length
}

ND.prototype.positionCursorStart = function(ref) {
	ref.activeElement = this
	ref.cursorPos = 0
}

ND.prototype.split = function(index) {
	return [
		new ND(this.parent, this.content.slice(0, index)), 
		new ND(this.parent, this.content.slice(index))
	]
}

ND.prototype.isCollapsible = function() {
	return true
}

ND.prototype.collapse = function() {
	return this.content
}

ND.prototype.duplicate = function() {
	return new ND(this, this.content)
}

ND.prototype.transitionCost = function() {
	return 0
}

ND.prototype.render = function(ref) {
	let container = document.createElement("div")
	container.className = "ND"
	container.style.position = 'unset'

	let text = document.createElement("span")
	text.textContent = this.content

	if(ref.activeElement === this) {
		container.appendChild(ref.generateCursor(text))
	}
	else
		container.appendChild(text)

	return container
}

ND.prototype.compile = function() {
	let textContent = this.content
	if(textContent == 'π') {
		textContent = 'pi'
	}
	return textContent
}

export {ND}