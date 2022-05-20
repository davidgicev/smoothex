import {NumberElement, OperatorElement, ND, NDC, SeparatorElement, ExponentElement, ParenthesesElement} from './elements/elements.js'
import {VirtElement} from './VirtElement.js'
import {ANDC} from './elements/elements.js'

function AVirtElement(parent, elements) {
	VirtElement.call(this, parent, elements)
}

AVirtElement.prototype = Object.create(VirtElement.prototype)

AVirtElement.prototype.adopt = function(elements) {
	
	if(!elements) {
		this.children = [new ANDC(this)]
		return
	}

	if(elements instanceof ANDC)
		elements = [elements]

	for(let el of elements) {
		this.children.push(el)
	}

	this.orientChildren()
}


AVirtElement.prototype.handleBrackets = function(ref, action, sourceID) {

	if(this.parent instanceof ParenthesesElement) { //ili FunctionElement

		if(action.includes("close") && this.parent.status.slice(-1) != action.slice(-1)) {
			//first close this one
		}
		else if(!['closed', action].includes(this.parent.status)) {
			this.setupCursorLower(ref)
			return this.parent.handleBrackets(ref, "close"+action.slice(-1), this.id)	
		}
	}

	let elIndex = this.findIndex(sourceID)
	let char = event.key
	let src = this.children[elIndex]
	
	if(action == "open(") {
		let pair = src.split(ref.cursorPos)
		let right = this.children.splice(elIndex+1, this.children.length)
		let toWrap = [pair[1], ...right]
		let content = new AVirtElement(this, toWrap)
		let p = new ParenthesesElement(this, content, action)
		pair[0].insert(-1, [p])
		this.children[elIndex] = pair[0]
		ref.cursorPos = 1
		p.positionCursor(ref)
		this.orientChildren()
		return
	}

	if(action == "open)") {
		let pair = src.split(ref.cursorPos)
		let left = this.children.splice(0, elIndex)
		left.push(pair[0])
		let content = new AVirtElement(this, left)
		let p = new ParenthesesElement(this, content, action)
		pair[1].insert(0, [p])
		this.children[0] = pair[1]
		ref.cursorPos = p.cursorDistance()
		this.positionCursor(ref)
		this.orientChildren()
		return
	}

	if(action == 'close)') {
		let pair = src.split(ref.cursorPos)

		// contents of second parentheses element
		let secondPC = pair[1].children[1].content.children

		pair[0] = ANDC.join(pair[0], secondPC.shift())

		this.children.splice(elIndex, 1, pair[0], ...secondPC)
		ref.cursorPos++
		pair[0].positionCursor(ref)
		this.orientChildren()
		return
	}

	if(action == 'close(') {
		let pair = src.split(ref.cursorPos)

		// contents of first parentheses element
		let firstPC = pair[0].children[1].content.children

		pair[1] = ANDC.join(firstPC.pop(), pair[1])

		this.children.splice(elIndex, 1, ...firstPC, pair[1])
		this.orientChildren()
		this.positionCursor(ref)
		return
	}
}

AVirtElement.prototype.handleBackspace = function(ref, sourceID) {

	let elIndex = this.findIndex(sourceID)

	if(elIndex == 0) {
		this.setupCursorLower(ref)
		this.parent.handleBackspace(ref, this.id)
		return
	}

	let el = this.children[elIndex-1]

	if(shouldSkip(el)) {

		this.children.splice(elIndex-1, 1)
	
		ref.cursorPos += this.children[elIndex-2].cursorDistance()

		this.children.splice(elIndex-2, 2, 
			ANDC.join(this.children[elIndex-2], this.children[elIndex-1])
		)

		this.children[elIndex-2].positionCursor(ref)
		this.orientChildren()
	}
	else {
		this.handleNav(ref, -1, sourceID)
	}
}


AVirtElement.prototype.collapseBrackets = function(ref, dir, sourceID) {

	let elIndex = this.findIndex(sourceID)
	let ndc = this.children[elIndex]
	
	// index of parentheses
	let element = ndc.elementAtCursor(ref.cursorPos).element
	let index = ndc.findIndex(element.id)

	let contents = ndc.children[index].content.children

	let bef = ndc.children.slice(0, index)
	let aft = ndc.children.slice(index+1)

	let offset = this.cursorDistance(elIndex - 1)

	let first, last;

	first = ANDC.join(
		new NDC(this, bef), contents.shift()
	)

	// join the edge NDCs with the neighbouring NDCs
	if(contents.length) {
	
		last  = ANDC.join(
			contents.pop(), new ANDC(this, aft)
		)
	
		this.children.splice(elIndex, 1, first, ...contents, last)
	}
	else {

		last = new ANDC(this, aft)
	
		let joined = ANDC.join(first, last)

		this.children.splice(elIndex, 1, joined)
	}

	this.orientChildren()
	ref.cursorPos += offset - 1
	this.positionCursor(ref)
}

export {AVirtElement}