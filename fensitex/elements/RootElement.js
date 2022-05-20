import {ND, NDC, NumberElement, OperatorElement} from './elements.js'
import {VirtElement} from '../VirtElement.js'

// use pind = 2 for a fixed sqrt
function RootElement(parent, pind, prad) {

	this.parent = parent
	this.id = parent.idCounter++
	this.idCounter = parent.idCounter++
	this.dictionary = parent.dictionary
	this.ind = null
	this.rad = null
	this.fixed = pind === 2
	this.adopt(pind, prad)
	this.isLinearLeft = false
	this.isLinearRight = false
}

RootElement.prototype.getChildren = function() {
	if(!this.fixed)
		return [this.ind, this.rad]
	return [this.rad]
}

RootElement.prototype.orientChildren = function() {
	this.rad.parent = this
	this.rad.id = this.idCounter++
	this.rad.dictionary = this.dictionary
	this.rad.orientChildren()
	if(!this.fixed) {
		this.ind.parent = this
		this.ind.id = this.idCounter++
		this.ind.dictionary = this.dictionary
		this.ind.orientChildren()
	}
}

RootElement.prototype.adopt = function(pind, prad) {
	
	if(prad instanceof VirtElement)
		this.rad = prad
	else
		this.rad = new VirtElement(this, prad)

	if(!this.fixed) {
		if(pind instanceof VirtElement)
			this.ind = pind
		else
			this.ind = new VirtElement(this, pind)
	}

	this.orientChildren()
}

RootElement.prototype.getLastInput = function() {
	return this.rad.getLastInput()
}

RootElement.prototype.getFirstInput = function() {
	return (this.fixed ? this.rad : this.ind).getFirstInput()
}

RootElement.prototype.handle = function(ref, event, sourceID) {

	this.setupCursorLower(ref)

	this.parent.handle(ref, event, this.id)
};

RootElement.prototype.handleBackspace = function(ref, sourceID) {

	if(!this.fixed && ref.activeElement.id == this.ind.id) {
		this.setupCursorLower(ref)
		return this.parent.handleNav(ref, -1, this.id)
	}

	this.setupCursorLower(ref)
	this.parent.collapseRoot(ref, this.id)
	return
}

RootElement.prototype.handleDel = function(ref, sourceID) {

	this.setupCursorLower(ref)
	ref.cursorPos += 1
	this.parent.collapseRoot(ref, this.id)
	return
}

RootElement.prototype.cutEnd = function(ref) {
	this.positionCursorEnd(ref)	
	return
}

RootElement.prototype.cutStart = function(ref) {
	if(this.fixed) {
		this.parent.collapseRoot(ref, this.id)
		return
	}
	this.positionCursorStart(ref)	
	return
}

RootElement.prototype.setupCursorLower = function(ref) {

	ref.cursorPos += 1

	if(!this.fixed) {

		if(this.ind.id != ref.activeElement.id) {
			ref.cursorPos += this.ind.cursorDistance() + 1
		}
	}

	ref.activeElement = this
}

RootElement.prototype.transitionCost = function() {
	return 1
}

// meant to be called by its children
RootElement.prototype.handleNav = function(ref, dir, sourceID) {

	this.setupCursorLower(ref)

	if(!this.fixed && this.ind.id == sourceID) {
		if(dir == -1) {
			this.parent.handleNav(ref, -1, this.id)
		}
		else {
			ref.cursorPos = 0
			this.rad.positionCursor(ref)
		}
	}
	else {
		if(dir == 1) {
			this.parent.handleNav(ref, 1, this.id)
		}
		else {
			if(this.fixed)
				return this.parent.handleNav(ref, -1, this.id)
			this.ind.positionCursorEnd(ref)			
		}	
	}
}

//to be called by its parent
RootElement.prototype.cursorDistance = function() {
	return (!this.fixed ? this.ind.cursorDistance() : -1) + this.rad.cursorDistance() + 3
}

RootElement.prototype.positionCursorEnd = function(ref) {
	this.getLastInput().positionCursorEnd(ref)
}

RootElement.prototype.positionCursorStart = function(ref) {
	this.getFirstInput().positionCursorStart(ref)
}

RootElement.prototype.positionCursor = function(ref) {
	
	ref.activeElement = this
	ref.cursorPos -= 1

	if(!this.fixed) {
		let indDist = this.ind.cursorDistance()

		if(ref.cursorPos <= indDist)
			return this.ind.positionCursor(ref)	
	
		ref.cursorPos -= indDist + 1
	}
	
	this.rad.positionCursor(ref)
}

RootElement.prototype.split = function(index) {
	throw "se osmeluvash?"
}

RootElement.prototype.isCollapsible = function() {
	return false
}

RootElement.prototype.collapse = function() {
	return [this]
}

RootElement.prototype.duplicate = function() {
	if(this.fixed)
		return new RootElement(this, 2, this.rad)
	return new RootElement(this, this.ind.duplicate(), this.rad.duplicate())
}

/*

		Root Div
		|
		|--Stepen Div (RootIndexElement)
		|	|
		|	Stepen Span
		|
		|
		|--Content Div (RootRadixElement)
		|	|
		|	First Div
		|		|
		|		|--SVG Wrapper (RootSWElement)
		|		|	|
		|		|	SVG
		|		|
		|  		|--Content (Content)

*/

RootElement.prototype.render = function(ref) {

	let stepenDiv  = document.createElement("div")
	stepenDiv.className = "RootIndexElement"
	if(!this.fixed) {
		let indRendered = this.ind.render(ref)
		if(this.ind.cursorDistance() == 0)
			indRendered.classList.add("EmptyWarning")
		stepenDiv.appendChild(indRendered)
	}
	
	let contentDiv = document.createElement("div")
	contentDiv.className = "RootRadixElement"
	let firstDiv = document.createElement("div")
	let korenWrapper = document.createElement("div")
	korenWrapper.className = "RootSWElement"
	let korenSimbol = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	korenSimbol.setAttribute("viewBox", "0 0 32 54")
	korenSimbol.setAttribute("preserveAspectRatio", "none")
	korenSimbol.innerHTML = '<path d="M0 33 L7 27 L12.5 47 L13 47 L30 0 L32 0 L13 54 L11 54 L4.5 31 L0 33"></path>'
	let content = document.createElement("div")
	content.className = "Content"
	let radRendered = this.rad.render(ref)
	if(this.rad.cursorDistance() == 0)
		radRendered.classList.add("EmptyWarning")
	content.appendChild(radRendered)
	korenWrapper.appendChild(korenSimbol)
	firstDiv.appendChild(korenWrapper)
	firstDiv.appendChild(content)
	contentDiv.appendChild(firstDiv)

	let wrapper = document.createElement("div")
	wrapper.appendChild(stepenDiv)
	wrapper.appendChild(contentDiv)
	wrapper.className = "RootElement"

	return wrapper
}

RootElement.prototype.compile = function(strict) {
	if(strict) {
		if(!this.fixed && this.ind.cursorDistance() == 0)
			throw "Root index can't be empty"
		if(this.rad.cursorDistance() == 0)
			throw "Contents of root (radicand) can't be empty"
	}
	if(!this.fixed)
		return ' \\nthroot ( ' + this.ind.compile(strict) + ' , ' + this.rad.compile(strict) + ' ) '
	return ' \\sqrt ( ' + this.rad.compile(strict) + ' ) '
}

export {RootElement}