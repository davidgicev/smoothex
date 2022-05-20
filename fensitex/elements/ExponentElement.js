import {ND, NDC, NumberElement, OperatorElement} from './elements.js'
import {VirtElement} from '../VirtElement.js'

function ExponentElement(parent, object, expo) { //object e osnovata

	this.parent = parent
	this.id = parent.idCounter++
	this.idCounter = parent.idCounter++
	this.dictionary = parent.dictionary
	this.base = null
	this.expo = null
	this.adopt(object, expo)
	this.isLinearLeft = true
	this.isLinearRight = false
}

ExponentElement.prototype.getChildren = function() {
	return [this.base, this.expo]
}

ExponentElement.prototype.orientChildren = function() {
	this.base.parent = this
	this.base.id = this.idCounter++
	this.base.dictionary = this.dictionary
	this.base.orientChildren()
	this.expo.parent = this
	this.expo.id = this.idCounter++
	this.expo.dictionary = this.dictionary
	this.expo.orientChildren()
}

ExponentElement.prototype.adopt = function(base, expo) {

	this.base = new NDC(this, base)

	if(expo instanceof VirtElement)
		this.expo = expo
	else
		this.expo = new VirtElement(this)

	this.orientChildren()
}

ExponentElement.prototype.getLastInput = function() {
	return this.expo
}

ExponentElement.prototype.getFirstInput = function() {
	return this.base
}

ExponentElement.prototype.handle = function(ref, event, sourceID) {

	this.setupCursorLower(ref)

	this.parent.handle(ref, event, this.id)
};

// povikana samo od subscriptot
ExponentElement.prototype.handleBackspace = function(ref, sourceID) {

	if(ref.activeElement.id == this.base.id) {
		this.setupCursorLower(ref)
		return this.parent.handleBackspace(ref, this.id)
	}

	// if(this.expo.cursorDistance()) {
	// 	return this.handleNav(ref, -1, this.id)
	// }

	this.setupCursorLower(ref)
	this.parent.collapseExponent(ref, this.id)
	return
}

ExponentElement.prototype.handleDel = function(ref, sourceID) {

	if(ref.activeElement.id == this.expo.id) {

		if(this.expo.cursorDistance() == 0) {
			this.setupCursorLower(ref)
			this.parent.collapseExponent(ref, this.id)
			return
		}

		this.setupCursorLower(ref)
		this.parent.handleNav(ref, 1, this.id)
		return
	}

	if(this.expo.cursorDistance() == 0)
		return this.parent.collapseExponent(ref, this.id)
	
	return this.expo.positionCursorStart(ref)
}

ExponentElement.prototype.cutEnd = function(ref) {
	this.positionCursorEnd(ref)	
	return
}

ExponentElement.prototype.cutStart = function(ref) {
	this.base.cutStart(ref)	
	return
}

ExponentElement.prototype.setupCursorLower = function(ref) {

	if(this.base.id != ref.activeElement.id) {
		ref.cursorPos += this.base.cursorDistance() + 1
	}
	ref.activeElement = this
}

ExponentElement.prototype.transitionCost = function() {
	return 0
}


// meant to be called by its children
ExponentElement.prototype.handleNav = function(ref, dir, sourceID) {

	this.setupCursorLower(ref)

	if(this.base.id == sourceID) {

		if(dir == -1) {
			this.parent.handleNav(ref, -1, this.id)
		}
		else {
			ref.cursorPos = 0
			this.expo.positionCursor(ref)
		}
	}
	else {
	
		if(dir == 1) {
			// ref.cursorPos += 1
			this.parent.handleNav(ref, 1, this.id)
		}
		else {
			// ref.cursorPos -= 1
			this.base.positionCursorEnd(ref)			
		}	
	}
}

ExponentElement.prototype.refreshActive = function(ref) {
	this.setupCursorLower(ref)
	this.parent.refreshActive(ref)
}

//to be called by parent
ExponentElement.prototype.cursorDistance = function() {
	return this.base.cursorDistance() + this.expo.cursorDistance() + 2
}

ExponentElement.prototype.positionCursorEnd = function(ref) {
	this.getLastInput().positionCursorEnd(ref)
}

ExponentElement.prototype.positionCursorStart = function(ref) {
	this.getFirstInput().positionCursorStart(ref)
}

ExponentElement.prototype.positionCursor = function(ref) {
	
	ref.activeElement = this

	let baseDist = this.base.cursorDistance()

	if(ref.cursorPos <= baseDist)
		return this.base.positionCursor(ref)

	ref.cursorPos -= baseDist + 1
	this.expo.positionCursor(ref)
}

ExponentElement.prototype.split = function(index) {
	
	let offset = this.base.cursorDistance()

	if(index <= offset) {

		let part = this.base.split(index)

		return [
			part[0],
			new ExponentElement(this, part[1].children, this.expo)
		]
	}

	return [this, new ND(this.parent)]
}

ExponentElement.prototype.isCollapsible = function() {
	return true
}

ExponentElement.prototype.collapse = function() {
	return [this.base.collapse(), new ExponentElement(this, null, this.expo)]
}

ExponentElement.prototype.duplicate = function() {
	return new ExponentElement(this, this.base.duplicate(), this.expo.duplicate())
}

ExponentElement.prototype.handleBrackets = function(ref, action, sourceID) {
	this.setupCursorLower(ref)
	return this.parent.handleBrackets(ref, action, this.id)
}

ExponentElement.prototype.collapseBrackets = function(ref, dir, sourceID) {
	this.setupCursorLower(ref)
	return this.parent.collapseBrackets(ref, dir, this.id)
}

ExponentElement.prototype.expandBrackets = function(ref, dir, sourceID) {
	this.setupCursorLower(ref)
	return this.parent.expandBrackets(ref, dir, this.id)
}

ExponentElement.prototype.render = function(ref) {

	let container = document.createElement("div")
	container.className = "ExponentElement"

	let base = this.base.render(ref)
	if(this.base.cursorDistance() == 0)
		base.classList.add("EmptyWarning")

	container.appendChild(base)

	let supContainer = document.createElement('div')
	supContainer.className = "ExponentExpoElement"


	let expo = this.expo.render(ref)
	if(this.expo.cursorDistance() == 0)
		expo.classList.add("EmptyWarning")

	supContainer.appendChild(expo)

	container.appendChild(supContainer)

	return container
}

ExponentElement.prototype.compile = function(strict) {
	if(strict) {
		if(this.base.cursorDistance() == 0)
			throw "Base of exponent can't be empty"
		if(this.expo.cursorDistance() == 0)
			throw "Exponent can't be empty"
	}
	return ' ( ' + this.base.compile(strict) + ' ) ^ ( ' + this.expo.compile(strict) + ' ) '
}

export {ExponentElement}