import {VirtElement} from '../VirtElement.js'
import {ND, VariableElement, NDC} from './elements.js'

function FunctionElement(parent, object, argument) {
	
	this.parent = parent
	this.idCounter = parent.idCounter++
	this.identifier = null
	this.id = parent.idCounter++
	this.dictionary = parent.dictionary
	this.content = new NDC(this, argument)
	this.isLinearLeft  = true
	this.isLinearRight = true
	this.adoptIdentifier(object)
}

FunctionElement.prototype.getChildren = function() {
	return [this.identifier, this.content]
}

FunctionElement.prototype.orientChildren = function() {
	this.identifier.parent = this
	this.identifier.id = this.idCounter++
	this.identifier.dictionary = this.dictionary
	this.identifier.orientChildren()
	this.content.parent = this
	this.content.id = this.idCounter++
	this.content.dictionary = this.dictionary
	this.content.orientChildren()
}

FunctionElement.prototype.adoptIdentifier = function(object) {
	if(typeof object == 'string') {
		this.identifier = new VariableElement(this, ...object.split("_"))
		return
	}

	if(object instanceof VariableElement) {
		this.identifier = object
		this.orientChildren()
		return
	}
}

FunctionElement.prototype.getLastInput = function() {
	// if(this.content.cursorDistance() == 0)
	// 	return this.identifier.getLastInput()
	return this.content.getLastInput()
}

FunctionElement.prototype.getFirstInput = function() {
	return this.identifier.getFirstInput()
}

FunctionElement.prototype.handle = function(ref, event, sourceID) {

	this.setupCursorLower(ref)

	this.parent.handle(ref, event, this.id)
};

FunctionElement.prototype.refreshActive = function(ref) {
	this.setupCursorLower(ref)
	this.parent.refreshActive(ref)
}

FunctionElement.prototype.handleBackspace = function(ref, sourceID) {


	if(ref.activeElement.id == this.content.id) {
		return this.identifier.cutEnd(ref)
	}

	this.setupCursorLower(ref)
	this.parent.handleBackspace(ref, this.id)

	return
}

FunctionElement.prototype.handleDel = function(ref, sourceID) {


	if(ref.activeElement.id == this.identifier.id) {
		return this.identifier.cutStart(ref)
	}

	this.setupCursorLower(ref)
	this.parent.handleDel(ref, this.id)

	return
}

FunctionElement.prototype.cutEnd = function(ref) {
	if(this.content.cursorDistance()) {
		this.content.cutEnd(ref)
		return
	}
	this.identifier.cutEnd(ref)
}


FunctionElement.prototype.cutStart = function(ref) {
	if(this.identifier.cursorDistance()) {
		this.identifier.cutStart(ref)
		return
	}
	this.content.cutEnd(ref)	
	return
}

FunctionElement.prototype.setupCursorLower = function(ref) {

	if(this.identifier.id != ref.activeElement.id) {
		ref.cursorPos += this.identifier.cursorDistance()
	}
	ref.activeElement = this
}

FunctionElement.prototype.transitionCost = function() {
	return 0
}

// meant to be called by its children
FunctionElement.prototype.handleNav = function(ref, dir, sourceID) {

	if(this.content.id == sourceID) {

		if(dir == -1) {
			ref.cursorPos = this.identifier.cursorDistance() - 1
			this.identifier.positionCursor(ref)
		}
		else {
			this.setupCursorLower(ref)
			this.parent.handleNav(ref, 1, this.id)			
		}
	}
	else {
		if(dir == 1) {
			this.content.positionCursorStart(ref)
		}
		else {
			this.setupCursorLower(ref)
			this.parent.handleNav(ref, -1, this.id)		
		}	
	}
}

FunctionElement.prototype.handleBrackets = function(ref, action, sourceID) {
	this.setupCursorLower(ref)
	return this.parent.handleBrackets(ref, action, this.id)
}

FunctionElement.prototype.collapseBrackets = function(ref, dir, sourceID) {
	this.setupCursorLower(ref)
	return this.parent.collapseBrackets(ref, dir, this.id)
}

FunctionElement.prototype.expandBrackets = function(ref, dir, sourceID) {
	this.setupCursorLower(ref)
	return this.parent.expandBrackets(ref, dir, this.id)
}

//to be called by parent
FunctionElement.prototype.cursorDistance = function() {
	return this.identifier.cursorDistance() + this.content.cursorDistance()
}

FunctionElement.prototype.positionCursorEnd = function(ref) {
	this.getLastInput().positionCursorEnd(ref)
}

FunctionElement.prototype.positionCursorStart = function(ref) {
	this.getFirstInput().positionCursorEnd(ref)
}

FunctionElement.prototype.positionCursor = function(ref) {

	if(ref.cursorPos < 0 || ref.cursorPos > this.cursorDistance()) {
		throw "out of bounds"
		return
	}

	ref.activeElement = this

	let identifierDist = this.identifier.cursorDistance()

	if(ref.cursorPos < identifierDist)
		return this.identifier.positionCursor(ref)

	ref.cursorPos -= identifierDist
	this.content.positionCursor(ref)
}

FunctionElement.prototype.split = function(index) {
	
	let offset = this.identifier.cursorDistance()

	if(index <= offset) {

		let part = this.identifier.split(index)

		return [
			part[0],			
			new NDC(this, [part[1], this.content])
		]
	}

	offset = index - offset
	let pair = this.content.split(offset)

	return [
		new FunctionElement(this, this.identifier, pair[0].children),
		pair[1]
	]
}

FunctionElement.prototype.isCollapsible = function() {
	return true
}


FunctionElement.prototype.collapse = function() {
	return [this.identifier.collapse(), this.content.collapse()]
}

FunctionElement.prototype.duplicate = function() {
	return new FunctionElement(this, this.identifier?.duplicate(), this.content.duplicate())
}

FunctionElement.prototype.render = function(ref) {

	let container = document.createElement("div")
	container.className = "FunctionElement"

	container.appendChild(this.identifier.render(ref))

	let content = this.content.render(ref)

	if(this.content.cursorDistance() == 0)
		content.classList.add("EmptyWarning")

	container.appendChild(content)

	return container
}

FunctionElement.prototype.compile = function(strict) {
	if(strict) {
		if(this.content.cursorDistance() == 0)
			throw `No arguments provided to function ${this.identifier.toString()}`
	}
	return this.identifier.compile(strict) + ' ' + this.content.compile(strict) + ' '
}

export {FunctionElement}