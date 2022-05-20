import {VirtElement} from '../VirtElement.js'
import {} from './elements.js'

function SeparatorElement(parent, object) {
	
	this.parent = parent
	this.content = " "
	this.id = parent.idCounter++
}

SeparatorElement.prototype.getLastInput = function() {
	let prev = this.parent.findIndex(this.id)-1
	return this.parent.children[prev].getLastInput()
}

SeparatorElement.prototype.getFirstInput = function() {
	let next = this.parent.findIndex(this.id)+1
	return this.parent.children[next].getFirstInput()
}

SeparatorElement.prototype.handle = function(event, ref) {

	throw "girl, mu"
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
		}
		ref.cursorPos--;
		return
	}
	if(event.keyCode === 39) {		//right
		if(ref.cursorPos == this.content.length)
			this.parent.handleNav(ref,  1, this.id)
		ref.cursorPos++;
		return
	}
	if(event.keyCode === 38 ||
	   event.keyCode === 40) {		//up/down

		return this.parent.handle(ref, event, this.id);
	}
};

SeparatorElement.prototype.render = function(ref) {

	let element = document.createElement("span")
	element.className = "SeparatorElement"
	element.textContent = this.content

	return element
}

SeparatorElement.prototype.compile = function(ref) {
	return ""
}

SeparatorElement.prototype.isCollapsible = function() {
	return false
}

SeparatorElement.prototype.duplicate = function() {
	return new SeparatorElement(this)
}

SeparatorElement.prototype.cursorDistance = function() {
	return this.content.length
}

export {SeparatorElement}