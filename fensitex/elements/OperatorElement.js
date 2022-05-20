import {VirtElement} from '../VirtElement.js'
import {} from './elements.js'

function OperatorElement(parent, object) {
	
	this.parent = parent
	this.content = null
	this.id = parent.idCounter++

	if(object && "+-*,".includes(object))
		this.content = object
}

OperatorElement.prototype.getLastInput = function() {
	let prev = this.parent.findIndex(this.id)-1
	return this.parent.children[prev].getLastInput()
}

OperatorElement.prototype.getFirstInput = function() {
	let next = this.parent.findIndex(this.id)+1
	return this.parent.children[next].getFirstInput()
}

OperatorElement.prototype.handle = function(event, ref) {

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

OperatorElement.prototype.cursorDistance = function() {
	return this.content.length
}

OperatorElement.prototype.isCollapsible = function() {
	return false
}

OperatorElement.prototype.duplicate = function() {
	return new OperatorElement(this, this.content)
}

OperatorElement.prototype.render = function(ref) {

	let element = document.createElement("span")
	element.className = "OperatorElement"
	
	let symbol = this.content

	if(symbol == '*') 
		symbol = '\u{22C5}'

	if(symbol == '-')
		symbol = '\u{2013}'

	element.textContent = symbol

	return element
}

OperatorElement.prototype.compile = function() {
	return this.content
}

export {OperatorElement}