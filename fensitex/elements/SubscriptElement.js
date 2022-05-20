import {VirtElement} from '../VirtElement.js'
import {ND} from './elements.js'
import {isAlphaNumeric} from '../helpers.js'

function SubscriptElement(parent, object) {
	
	this.parent = parent
	this.content = ''
	this.adopt(object)
	this.id = parent.idCounter++
}

SubscriptElement.prototype.adopt = function(object) {
	if(typeof object == "string") {
		this.content = object
	}
	else if(object instanceof ND) {
		this.content = object.content
	}

}

SubscriptElement.prototype.getLastInput = function() {
	return this
}

SubscriptElement.prototype.getFirstInput = function() {
	return this
}

SubscriptElement.prototype.handle = function(event, ref) {

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

		if(ref.cursorPos == 0)
			return this.parent.handleBackspace(ref, this.id)

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

SubscriptElement.prototype.cursorDistance = function() {
	return this.content.length + 2
}

SubscriptElement.prototype.positionCursorEnd = function(ref) {
	ref.activeElement = this
	ref.cursorPos = this.content.length
}

SubscriptElement.prototype.positionCursor = function(ref) {
	ref.activeElement = this
}

SubscriptElement.prototype.positionCursorStart = function(ref) {
	ref.activeElement = this
	ref.cursorPos = 0
}

SubscriptElement.prototype.split = function(index) {
	return [
		new ND(this.parent, this.content.slice(0, index)), 
		new ND(this.parent, this.content.slice(index))
	]
}

SubscriptElement.prototype.isCollapsible = function() {
	return false
}


SubscriptElement.prototype.collapse = function() {
	return [this]
}

SubscriptElement.prototype.duplicate = function() {
	return new SubscriptElement(this, this.content)
}

SubscriptElement.prototype.render = function(ref) {
	let container = document.createElement("div")
	container.className = "SubscriptElement"
	
	let text = document.createElement("span")
	text.textContent = this.content

	if(ref.activeElement === this)
		container.appendChild(ref.generateCursor(text))
	else
		container.appendChild(text)

	return container
}

export {SubscriptElement}