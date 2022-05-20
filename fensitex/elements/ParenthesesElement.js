import {ND, NDC, NumberElement, OperatorElement} from './elements.js'
import {VirtElement} from '../VirtElement.js'

function ParenthesesElement(parent, object, action) {

	this.parent = parent
	this.id = parent.idCounter++
	this.idCounter = parent.idCounter++
	this.dictionary = parent.dictionary
	this.content = null
	this.status = action || "closed"
	this.adopt(object)
	this.isLinearLeft = false
	this.isLinearRight = false
}

ParenthesesElement.prototype.getChildren = function() {
	return [this.content]
}

ParenthesesElement.prototype.orientChildren = function() {
	this.content.parent = this
	this.content.dictionary = this.dictionary
	this.content.orientChildren()
}

ParenthesesElement.prototype.adopt = function(object) {
	
	if(!object) {
		this.content = new VirtElement(this)
		this.orientChildren()
		return
	}

	if(object instanceof VirtElement) {
		this.content = new VirtElement(this, object.children)
		this.orientChildren()
		return
	}

	throw "mozhda lista e idk"
}

ParenthesesElement.prototype.getLastInput = function() {
	return this.content.getLastInput()
}

ParenthesesElement.prototype.getFirstInput = function() {
	return this.content.getFirstInput()
}

ParenthesesElement.prototype.handle = function(ref, event, sourceID) {

	this.setupCursorLower(ref)

	this.parent.handle(ref, event, this.id)
};


ParenthesesElement.prototype.handleBackspace = function(ref, sourceID) {
	this.setupCursorLower(ref)
	if(this.status == "open(")
		return this.parent.collapseBrackets(ref, -1, this.id)
	else
		return this.parent.expandBrackets(ref, -1, this.id)
	return this.parent.handleNav(ref, -1, this.id)
}

ParenthesesElement.prototype.handleDel = function(ref, sourceID) {
	this.setupCursorLower(ref)
	if(this.status == "open)")
		return this.parent.collapseBrackets(ref, 1, this.id)
	else
		return this.parent.expandBrackets(ref, 1, this.id)
	return this.parent.handleNav(ref, 1, this.id)
}

ParenthesesElement.prototype.handleBrackets = function(ref, action, sourceID) {
	this.setupCursorLower(ref)
	this.parent.handleBrackets(ref, action, this.id)
}

ParenthesesElement.prototype.cutEnd = function(ref) {
	this.setupCursorLower(ref)
	ref.cursorPos -= 2;
	if(this.status == "open)")
		return this.parent.collapseBrackets(ref, 1, this.id)
	this.parent.expandBrackets(ref, 1, this.id)
	return
}

ParenthesesElement.prototype.cutStart = function(ref) {
	this.setupCursorLower(ref)
	if(this.status == "open(")
		return this.parent.collapseBrackets(ref, -1, this.id)
	this.parent.expandBrackets(ref, -1, this.id)
	return
}

ParenthesesElement.prototype.setupCursorLower = function(ref) {
	ref.cursorPos++;
	ref.activeElement = this
}

ParenthesesElement.prototype.transitionCost = function() {
	return 1
}


// meant to be called by its children
ParenthesesElement.prototype.handleNav = function(ref, dir, sourceID) {

	if(dir == -1 && this.status == 'open)') {
		this.setupCursorLower(ref)
		this.parent.handleBrackets(ref, "close(", this.id)
		return
	}

	if(dir == 1 && this.status == 'open(') {
		this.setupCursorLower(ref)
		this.parent.handleBrackets(ref, "close)", this.id)
		return
	}

	this.setupCursorLower(ref)
	this.parent.handleNav(ref, dir, this.id)
}

//to be called by its parent
ParenthesesElement.prototype.cursorDistance = function() {
	return this.content.cursorDistance()+2
}

ParenthesesElement.prototype.positionCursorEnd = function(ref) {
	this.getLastInput().positionCursorEnd(ref)
}

ParenthesesElement.prototype.positionCursor = function(ref) {
	ref.cursorPos--;
	ref.activeElement = this
	this.content.positionCursor(ref)
}

ParenthesesElement.prototype.positionCursorStart = function(ref) {
	this.getFirstInput().positionCursorStart(ref)
}

ParenthesesElement.prototype.split = function(index) {
	index--;
	let pair = this.content.split(index)
	return [
		new ParenthesesElement(this, pair[0]), 
		new ParenthesesElement(this, pair[1])
		]
}

ParenthesesElement.prototype.isCollapsible = function() {
	return false
}


ParenthesesElement.prototype.collapse = function() {
	return [this]
}

ParenthesesElement.prototype.duplicate = function() {
	return new ParenthesesElement(this, this.content.duplicate(), this.status)
}

ParenthesesElement.prototype.render = function(ref) {

	let container = document.createElement("div")
	let classes = {
		'closed': 'ParenthesesClosedElement',
		'open(' : 'ParenthesesLeftClosedElement',
		'open)' : 'ParenthesesRightClosedElement'
	}
	container.className = "ParenthesesElement " + classes[this.status]

	let leftP = document.createElement("div")
	leftP.className = "ParenthesesWLElement"

	let rightP = document.createElement("div")
	rightP.className = "ParenthesesWRElement"

	let leftSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	leftSvg.setAttribute("viewBox", "0 0 47 188")
	leftSvg.setAttribute("preserveAspectRatio", "none")
	leftSvg.innerHTML = '<path d="M 35,188 C 26,174 15,159 9,143 3,126 0,110 0,94 0,78 3,62 9,45 15,29 26,14 35,0 H 47 C 28,31 18,63 18,94 c 0,31 10,63 29,94 z" />'

	let rightSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	rightSvg.setAttribute("viewBox", "0 0 47 188")
	rightSvg.setAttribute("preserveAspectRatio", "none")
	rightSvg.innerHTML = '<path d="m 12,188 c 9,-14 20,-29 26,-45 6,-17 9,-33 9,-49 0,-16 -3,-32 -9,-49 -6,-16 -17,-31 -26,-45 h -12 c 19,31 29,63 29,94 0,31 -10,63 -29,94 z" />'

	leftP.appendChild(leftSvg)
	container.appendChild(leftP)

	let contentWrapper = document.createElement('div')
	contentWrapper.className = "ParenthesesCWElement"
	contentWrapper.appendChild(this.content.render(ref))
	container.appendChild(contentWrapper)

	rightP.appendChild(rightSvg)
	container.appendChild(rightP)

	return container
}

ParenthesesElement.prototype.compile = function(strict) {
	if(strict) {
		if(this.content.cursorDistance() == 0)
			throw "Parentheses can't be empty"
	}
	return ' ( ' + this.content.compile(strict) + ' ) '
}

export {ParenthesesElement}

//