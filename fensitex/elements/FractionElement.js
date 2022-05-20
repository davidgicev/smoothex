import {ND, NDC, NumberElement, OperatorElement} from './elements.js'
import {VirtElement} from '../VirtElement.js'

function FractionElement(parent, pnum, pden) {

	this.parent = parent
	this.id = parent.idCounter++
	this.idCounter = parent.idCounter++
	this.dictionary = parent.dictionary
	this.num = null
	this.den = null
	this.adopt(pnum, pden)
	this.isLinearLeft = false
	this.isLinearRight = false
}

FractionElement.prototype.getChildren = function() {
	return [this.num, this.den]
}

FractionElement.prototype.orientChildren = function() {
	this.num.parent = this
	this.num.id = this.idCounter++
	this.num.dictionary = this.dictionary
	this.num.orientChildren()
	this.den.parent = this
	this.den.id = this.idCounter++
	this.den.dictionary = this.dictionary
	this.den.orientChildren()
}

FractionElement.prototype.adopt = function(pnum, pden) {

	if(pnum instanceof VirtElement)
		this.num = pnum
	else
		this.num = new VirtElement(this, new NDC(this, pnum))
	if(pden instanceof VirtElement)
		this.den = pden
	else
		this.den = new VirtElement(this, new NDC(this, pden))

	this.orientChildren()
}

FractionElement.prototype.getLastInput = function() {
	return this.den
}

FractionElement.prototype.getFirstInput = function() {
	return this.num
}

FractionElement.prototype.handle = function(ref, event, sourceID) {

	if(event.keyCode === 38) { //up

		if(this.den.id == ref.activeElement.id) {
			let denDist = this.den.cursorDistance()
			let dist = denDist/2 - ref.cursorPos
			let numDist = this.num.cursorDistance()
			let offset = numDist/2 - dist
			offset = Math.max(0, Math.sign(offset)*Math.floor(Math.abs(offset)))
			ref.cursorPos = Math.min(numDist, offset)
			this.num.positionCursor(ref)
			return
		}
	}

	if(event.keyCode === 40) {	//down

		if(this.num.id == ref.activeElement.id) {
			let numDist = this.num.cursorDistance()
			let dist = numDist/2 - ref.cursorPos
			let denDist = this.den.cursorDistance()
			let offset = denDist/2 - dist	
			offset = Math.max(0, Math.sign(offset)*Math.ceil(Math.abs(offset)))
			ref.cursorPos = Math.min(denDist, offset)
			this.den.positionCursor(ref)
			return
		}
	}

	this.setupCursorLower(ref)

	this.parent.handle(ref, event, this.id)
};

FractionElement.prototype.handleBackspace = function(ref, sourceID) {

	if(ref.activeElement.id == this.num.id) {
		this.setupCursorLower(ref)
		return this.parent.handleNav(ref, -1, this.id)
	}

	this.setupCursorLower(ref)
	this.parent.collapseFraction(ref, this.id)
	return
}

FractionElement.prototype.handleDel = function(ref, sourceID) {

	if(ref.activeElement.id == this.den.id) {
		this.setupCursorLower(ref)
		return this.parent.handleNav(ref, 1, this.id)
	}

	this.setupCursorLower(ref)
	ref.cursorPos += 1
	this.parent.collapseFraction(ref, this.id)
	return
}

FractionElement.prototype.cutEnd = function(ref) {
	this.positionCursorEnd(ref)	
	return
}

FractionElement.prototype.cutStart = function(ref) {
	this.positionCursorStart(ref)	
	return
}

FractionElement.prototype.setupCursorLower = function(ref) {

	ref.cursorPos += 1

	if(this.num.id != ref.activeElement.id) {
		ref.cursorPos += this.num.cursorDistance() + 1
	}
	ref.activeElement = this
}

FractionElement.prototype.transitionCost = function() {
	return 1
}


// meant to be called by its children
FractionElement.prototype.handleNav = function(ref, dir, sourceID) {

	this.setupCursorLower(ref)

	if(this.num.id == sourceID) {

		if(dir == -1) {
			this.parent.handleNav(ref, -1, this.id)
		}
		else {
			ref.cursorPos = 0
			this.den.positionCursor(ref)
		}
	}
	else {
		if(dir == 1) {
			// ref.cursorPos += 1
			this.parent.handleNav(ref, 1, this.id)
		}
		else {
			// ref.cursorPos -= 1
			this.num.positionCursorEnd(ref)			
		}	
	}
}

//to be called by its parent
FractionElement.prototype.cursorDistance = function() {
	return this.num.cursorDistance() + this.den.cursorDistance() + 3
}

FractionElement.prototype.positionCursorEnd = function(ref) {
	this.getLastInput().positionCursorEnd(ref)
}

FractionElement.prototype.positionCursorStart = function(ref) {
	this.getFirstInput().positionCursorStart(ref)
}

FractionElement.prototype.positionCursor = function(ref) {
	
	ref.activeElement = this
	ref.cursorPos -= 1

	let numDist = this.num.cursorDistance()

	if(ref.cursorPos <= numDist)
		return this.num.positionCursor(ref)

	ref.cursorPos -= numDist + 1
	this.den.positionCursor(ref)
}

FractionElement.prototype.split = function(index) {

	throw "se osmeluvash?"
	
	let offset = this.base.cursorDistance()

	if(index <= offset) {

		let part = this.base.split(index)

		return [
			new ND(this, part[0].collapse()),
			new ExponentElement(this, part[1].collapse(), this.expo)
		]
	}

	return [this, new ND(this.parent)]
}

FractionElement.prototype.isCollapsible = function() {
	return false
}


FractionElement.prototype.collapse = function() {
	return [this]
}

FractionElement.prototype.duplicate = function() {
	return new FractionElement(this, this.num.duplicate(), this.den.duplicate())
}

FractionElement.prototype.render = function(ref) {

	let container = document.createElement("div")
	container.className = "FractionElement"


	let numContainer = document.createElement('div')
	let num = this.num.render(ref)
	if(this.num.cursorDistance() == 0)
		num.classList.add("EmptyWarning")

	numContainer.appendChild(num)

	let denContainer = document.createElement('div')
	let den = this.den.render(ref)
	if(this.den.cursorDistance() == 0)
		den.classList.add("EmptyWarning")

	denContainer.appendChild(den)

	container.appendChild(numContainer)
	container.appendChild(denContainer)
	container.appendChild(document.createElement("span"))

	return container
}

FractionElement.prototype.compile = function(strict) {
	if(strict) {
		if(this.num.cursorDistance() == 0)
			throw "Numerator can't be empty"
		if(this.den.cursorDistance() == 0)
			throw "Denominator can't be empty"
	}
	return ' ( ( ' + this.num.compile(strict) + ' ) / ( ' + this.den.compile(strict) + ' ) ) '
}

export {FractionElement}