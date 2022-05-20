import {VirtElement} from '../VirtElement.js'
import {ND, SubscriptElement} from './elements.js'

function VariableElement(parent, object, subscript) {
	
	this.parent = parent
	this.idCounter = parent.idCounter++
	this.content = new ND(this, object)
	this.id = parent.idCounter++
	this.subscript = subscript != null ? new SubscriptElement(this, subscript) : null
	this.isLinearLeft = true
}

Object.defineProperty(VariableElement.prototype, 'isLinearRight', {
	get: function() {
		return !this.subscript
	}
})

VariableElement.prototype.orientChildren = function() {
	this.content.parent = this
	this.content.id = this.idCounter++
	if(this.subscript) {
		this.subscript.parent = this
		this.subscript.id = this.idCounter++		
	}
}

VariableElement.prototype.getLastInput = function() {
	return (this.subscript || this.content).getLastInput()
}

VariableElement.prototype.getFirstInput = function() {
	return this.content.getFirstInput()
}

VariableElement.prototype.handle = function(ref, event, sourceID) {

	this.setupCursorLower(ref)

	this.parent.handle(ref, event, this.id)
};

VariableElement.prototype.handleBackspace = function(ref, sourceID) {

	if(ref.activeElement.id == this.content.id) {
		this.setupCursorLower(ref)
		return this.parent.handleBackspace(ref, this.id)
	}

	// if(this.subscript.cursorDistance() > 2) {
	// 	return this.handleNav(ref, -1, sourceID)
	// }

	if(!this.subscript)
		return

	ref.activeElement = this.content
	ref.cursorPos = this.content.cursorDistance()
	this.content.content += this.subscript.content
	this.subscript = null
	this.refreshActive(ref)

	return
}

VariableElement.prototype.handleDel = function(ref, sourceID) {

	if(this.subscript && ref.activeElement.id == this.subscript.id) {
		return this.handleNav(ref, 1, sourceID)
	}

	if(!this.subscript) {
		this.setupCursorLower(ref)
		return this.parent.handleDel(ref, this.id)
	}

	ref.activeElement = this.content
	ref.cursorPos = this.content.cursorDistance()
	this.content.content += this.subscript.content
	this.subscript = null
	this.refreshActive(ref)

	return
}

VariableElement.prototype.cutEnd = function(ref) {
	if(this.subscript) {
		this.positionCursorEnd(ref)
		return
	}
	this.content.cutEnd(ref)
}

VariableElement.prototype.cutStart = function(ref) {

	if(this.content.cursorDistance())
		return this.content.cutEnd(ref)

	if(!this.subscript)
		return
	
	if(this.subscript.cursorDistance() > 2) {
		this.positionCursorStart(ref)
		return
	}

	// this.subscript = null
	// ref.activeElement = this.content
	// ref.cursorPos = this.content.cursorDistance()
	// this.refreshActive(ref)
}

VariableElement.prototype.setupCursorLower = function(ref) {

	if(this.content.id != ref.activeElement.id) {
		ref.cursorPos += this.content.cursorDistance() + 1
	}
	ref.activeElement = this
}

VariableElement.prototype.transitionCost = function() {
	return 0
}

// meant to be called by its children
VariableElement.prototype.handleNav = function(ref, dir, sourceID) {

	this.setupCursorLower(ref)

	if(this.content.id == sourceID) {

		if(dir == -1) {
			this.parent.handleNav(ref, -1, this.id)
		}
		else {
			if(!this.subscript) {
				return this.parent.handleNav(ref, 1, this.id)
			}
			ref.cursorPos = 0
			this.subscript.positionCursor(ref)			
		}
	}
	else {
	
		if(dir == 1) {
			// ref.cursorPos += 1
			this.parent.handleNav(ref, 1, this.id)
		}
		else {
			this.content.positionCursorEnd(ref)			
		}	
	}
}

VariableElement.prototype.refreshActive = function(ref) {
	this.setupCursorLower(ref)
	this.parent.refreshActive(ref)
}

//to be called by parent
VariableElement.prototype.cursorDistance = function() {
	return this.content.cursorDistance() + (this.subscript ? this.subscript.cursorDistance() : 0)
}

VariableElement.prototype.positionCursorEnd = function(ref) {
	this.getLastInput().positionCursorEnd(ref)
}

VariableElement.prototype.positionCursorStart = function(ref) {
	this.getFirstInput().positionCursorEnd(ref)
}

VariableElement.prototype.positionCursor = function(ref) {
	
	if(ref.cursorPos < 0 || ref.cursorPos > this.cursorDistance()) {
		throw "out of bounds"
		return
	}

	ref.activeElement = this

	let contentDist = this.content.cursorDistance()

	if(!this.subscript || ref.cursorPos <= contentDist)
		return this.content.positionCursor(ref)

	ref.cursorPos -= contentDist + 1
	this.subscript.positionCursor(ref)
}

VariableElement.prototype.split = function(index) {
	
	let offset = this.content.cursorDistance()

	if(!this.subscript) {

		let part = this.content.split(index)

		return [
			new VariableElement(this, part[0].collapse()),
			new VariableElement(this, part[1].collapse())
		]
	}

	if(index <= offset) {

		let part = this.content.split(index)

		return [
			new VariableElement(this, part[0].collapse()),
			new VariableElement(this, part[1].collapse(), this.subscript.content)
		]
	}

	offset = index - offset - 1
	let pair = this.subscript.split(offset)
	let content = this.content.collapse()

	return [
		new VariableElement(this, content, pair[0].collapse() || null),
		new VariableElement(this, "",      pair[1].collapse() || null)
	]
}

VariableElement.prototype.isCollapsible = function() {
	return true
}


VariableElement.prototype.collapse = function() {
	if(this.subscript)
		return [this.content.collapse(), this.subscript.collapse()]
	return [this.content.collapse()]
}

VariableElement.prototype.duplicate = function() {
	return new VariableElement(this, this.content.content, this.subscript?.content)
}

VariableElement.prototype.render = function(ref) {

	let container = document.createElement("div")
	container.className = "VariableElement"

	let content = this.content.render(ref)

	if(this.content.cursorDistance() == 0)
		content.classList.add("EmptyWarning")

	container.appendChild(content)

	if(!this.subscript)
		return container
	
	let subscript = this.subscript.render(ref)

	if(this.subscript.content.trim().length == 0)
		subscript.classList.add("EmptyWarning")

	container.appendChild(subscript)

	return container
}

VariableElement.prototype.toString = function() {
	return this.content.collapse() + (this.subscript ? "_"+this.subscript.content : "")
}

VariableElement.prototype.compile = function(strict) {
	if(strict) {
		if(this.content.cursorDistance() == 0) {
			if(this.subscript)
				throw "There is a floating subscript"
		}
		if(this.subscript && this.subscript.content.trim().length == 0) {
			throw "Empty subscript"
		}
	}
	return this.content.collapse(strict) + (this.subscript ? "_"+this.subscript.content : "")
}

export {VariableElement}