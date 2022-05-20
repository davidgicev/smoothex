import {VirtElement} from '../VirtElement.js'
import {ND} from './elements.js'

function NumberElement(parent, object) {
	
	this.parent = parent
	this.content = null
	this.id = parent.idCounter++

	if(!isNaN(object))
		this.content = object

	this.isLinearLeft = true
	this.isLinearRight = true
}

NumberElement.prototype.getLastInput = function() {
	return this
}

NumberElement.prototype.getFirstInput = function() {
	return this
}

NumberElement.prototype.handle = function(event, ref) {

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

	if(!isNaN(event.key) && event.key != " ") {
		this.content = this.content.substring(0, ref.cursorPos) 
					 + event.key + this.content.substring(ref.cursorPos)
		ref.cursorPos++;
		this.parent.refreshActive(ref)

		return
	}

	this.parent.handle(ref, event, this.id)
};

NumberElement.prototype.cutEnd = function(ref) {
	this.content = this.content.slice(0, -1)
	this.positionCursorEnd(ref)
	this.parent.refreshActive(ref)
}

NumberElement.prototype.cutStart = function(ref) {
	this.content = this.content.slice(1)
	this.positionCursorStart(ref)
	this.parent.refreshActive(ref)
}

NumberElement.prototype.cursorDistance = function() {
	return this.content.length
}

NumberElement.prototype.positionCursorEnd = function(ref) {
	ref.activeElement = this
	ref.cursorPos = this.content.length
}

NumberElement.prototype.positionCursorStart = function(ref) {
	ref.activeElement = this
	ref.cursorPos = 0
}

NumberElement.prototype.positionCursor = function(ref) {
	ref.activeElement = this
}

NumberElement.prototype.split = function(index) {
	return [
		new ND(this.parent, this.content.slice(0, index)), 
		new ND(this.parent, this.content.slice(index))
	]
}

NumberElement.prototype.isCollapsible = function() {
	return true
}

NumberElement.prototype.collapse = function() {
	return this.content
}

NumberElement.prototype.duplicate = function() {
	return new NumberElement(this, this.content)
}

NumberElement.prototype.transitionCost = function() {
	return 0
}

NumberElement.prototype.render = function(ref) {
	let container = document.createElement("div")
	container.className = "NumberElement"
	
	let text = document.createElement("span")
	text.textContent = this.content

	if(ref.activeElement === this)
		container.appendChild(ref.generateCursor(text))
	else
		container.appendChild(text)

	return container
}

NumberElement.prototype.compile = function() {
	return this.content
}

export {NumberElement}