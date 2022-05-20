import {NumberElement, OperatorElement, ND, NDC, SeparatorElement, ExponentElement, ParenthesesElement, AbsElement, FractionElement} from './elements/elements.js'
import {isAlphaNumeric, shouldSkip} from './helpers.js'
import {FensiInput} from './index.js'

function VirtElement(parent, elements, dictionary) {
	this.idCounter = 0
	this.parent = parent
	this.id = parent.idCounter++
	this.dictionary = dictionary || parent.dictionary
	this.children = []
	this.acceptable = (c) => {
			return (isAlphaNumeric(c) || "+-*/^()[].,_ ".includes(c))
		}
	this.adopt(elements)
}

VirtElement.prototype.getChildren = function() {
	return [...this.children]
}

VirtElement.prototype.orientChildren = function() {
	this.idCounter = 0
	for (let el of this.children) {
		el.parent = this
		el.id = this.idCounter++
		el.dictionary = this.dictionary
		!el.orientChildren || el.orientChildren()
	}
}

VirtElement.prototype.adopt = function(elements) {
	
	if(!elements) {
		this.children = [new NDC(this)]
		return
	}

	if(elements instanceof NDC)
		elements = [elements]

	for(let el of elements) {
		this.children.push(el)
	}

	this.orientChildren()
}

VirtElement.prototype.insert = function(elements, index) {
	this.children.splice(index, 0, ...elements)
	this.orientChildren()	
}

VirtElement.prototype.findIndex = function(id) {
	return this.children.findIndex(x => x.id == id)
};

VirtElement.prototype.removeChild = function(sourceID) {

	let elIndex = this.findIndex(sourceID)

	this.children.splice(elIndex, 1)
};

VirtElement.prototype.handle = function(ref, event, sourceID) {

	let elIndex = this.findIndex(sourceID)
	let char = event.key
	let src = this.children[elIndex]

	if(!this.acceptable(char)) {
		this.setupCursorLower(ref)
		this.parent.handle(ref, event, sourceID)
		return
	}

	if(" ".includes(char)) {

		let pair = src.split(ref.cursorPos)

		this.children.splice(elIndex, 1, 
			pair[0],
			new SeparatorElement(this, char),
			pair[1]
		)

		ref.cursorPos = 0

		pair[1].positionCursor(ref)
		
		this.orientChildren()
		return
	}	

	if("+-*,".includes(char)) {

		let pair = src.split(ref.cursorPos)

		this.children.splice(elIndex, 1, 
			pair[0],
			new OperatorElement(this, char),
			pair[1]
		)

		ref.cursorPos = 0

		pair[1].positionCursor(ref)
		
		this.orientChildren()
		return
	}

	if(char == "/") {

		let pair = src.split(ref.cursorPos)

		let left = pair[0].children.pop()

		if(left.cursorDistance() == 0 && pair[0].children.length > 1) {
			left = pair[0].children.pop()
		}

		pair[0].refresh()

		let fraction = new FractionElement(this, [left])

		this.children.splice(elIndex, 1, 
			pair[0],
			fraction,
			pair[1]
		)

		this.orientChildren()
		fraction.positionCursorEnd(ref)		
		return
	}

	if(char == "(" || char == ")") {
		this.handleBrackets(ref, "open"+char, sourceID)
		return
	}

	if(char == '|')
		return this.handleBrackets(ref, 'open(', sourceID)

}

VirtElement.prototype.handleBrackets = function(ref, action, sourceID) {

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
	let pType = (src instanceof AbsElement) ? AbsElement : ParenthesesElement
	
	if(action == "open(") {
		let pair = src.split(ref.cursorPos)
		let right = this.children.splice(elIndex+1, this.children.length)
		let toWrap = [pair[1], ...right]
		let content = new VirtElement(this, toWrap)
		let p = new pType(this, content, action)
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
		let content = new VirtElement(this, left)
		let p = new pType(this, content, action)
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

		pair[0] = NDC.join(pair[0], secondPC.shift())

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

		pair[1] = NDC.join(firstPC.pop(), pair[1])

		this.children.splice(elIndex, 1, ...firstPC, pair[1])
		this.orientChildren()
		this.positionCursor(ref)
		return
	}
}

//meant to be called by its children
VirtElement.prototype.handleNav = function(ref, dir, sourceID) {

	this.setupCursorLower(ref)

	let elIndex = this.findIndex(sourceID)

	if(elIndex == 0 && dir == -1) {
		return this.parent.handleNav(ref, dir, this.id)
	}
	else if(elIndex == this.children.length-1 && dir == 1) {
		return this.parent.handleNav(ref, dir, this.id)
	}

	if(shouldSkip(this.children[elIndex+dir])) {
		elIndex += dir
	}

	let el = this.children[elIndex + dir]
	if(dir == -1)
		el.positionCursorEnd(ref)
	else {
		el.positionCursorStart(ref)
	}
}

VirtElement.prototype.handleBackspace = function(ref, sourceID) {

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
			NDC.join(this.children[elIndex-2], this.children[elIndex-1])
		)

		this.children[elIndex-2].positionCursor(ref)
		this.orientChildren()
	}
	else {
		this.handleNav(ref, -1, sourceID)
	}
}

VirtElement.prototype.handleDel = function(ref, sourceID) {

	let elIndex = this.findIndex(sourceID)

	if(elIndex == this.children.length-1) {
		this.setupCursorLower(ref)
		this.parent.handleDel(ref, this.id)
		return
	}

	let el = this.children[elIndex+1]

	if(shouldSkip(el)) {

		this.children.splice(elIndex+1, 1)
	
		// ref.cursorPos += this.children[elIndex-2].cursorDistance()

		this.children.splice(elIndex, 2, 
			NDC.join(this.children[elIndex], this.children[elIndex+1])
		)

		this.children[elIndex].positionCursor(ref)
		this.orientChildren()
	}
	else {
		this.handleNav(ref, 1, sourceID)
	}
}

VirtElement.prototype.collapseFraction = function(ref, sourceID) {

	let elIndex = this.findIndex(sourceID)
	let fraction = this.children[elIndex]

	this.setupCursorLower(ref)
	ref.cursorPos -= 2

	this.children.splice(elIndex-1, 3,
		this.children[elIndex-1],
		...fraction.num.children,
		...fraction.den.children,
		this.children[elIndex+1]
	)

	this.refresh()
	this.positionCursor(ref)
}

VirtElement.prototype.collapseRoot = function(ref, sourceID) {

	let elIndex = this.findIndex(sourceID)
	let root = this.children[elIndex]

	this.setupCursorLower(ref)
	ref.cursorPos -= root.fixed ? 1 : (root.ind.cursorDistance() + 2)

	this.children.splice(elIndex-1, 3,
		this.children[elIndex-1],
		...root.rad.children,
		this.children[elIndex+1]
	)

	this.refresh()
	this.positionCursor(ref)
}

VirtElement.prototype.collapseBrackets = function(ref, dir, sourceID) {

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

	first = NDC.join(
		new NDC(this, bef), contents.shift()
	)

	// join the edge NDCs with the neighbouring NDCs
	if(contents.length) {
	
		last  = NDC.join(
			contents.pop(), new NDC(this, aft)
		)
	
		this.children.splice(elIndex, 1, first, ...contents, last)
	}
	else {

		last = new NDC(this, aft)
	
		let joined = NDC.join(first, last)

		this.children.splice(elIndex, 1, joined)
	}

	this.orientChildren()
	ref.cursorPos += offset - 1
	this.positionCursor(ref)
}

VirtElement.prototype.expandBrackets = function(ref, dir, sourceID) {

	let ndc = ref.activeElement
	let elIndex = this.findIndex(ndc.id)
	// index of parentheses
	let pElement = ndc.elementAtCursor(ref.cursorPos).element
	let vOffset = this.cursorDistance(elIndex - 1)
	let index = ndc.findIndex(pElement.id)

	if(dir == -1) {
		let pContents = pElement.content.children
		let last = pContents.shift()
		last.insert(0, ndc.children.splice(0, index))
		pContents.unshift(last)
		pContents.splice(0, 0, 
			...this.children.splice(0, elIndex)
		)
		pElement.status = "open)"
		ndc.refresh()
		ref.cursorPos += vOffset
		this.positionCursor(ref)

	}
	else {
		let pContents = pElement.content.children
		let last = pContents.pop()
		last.insert(-1, ndc.children.splice(index + 1, ndc.children.length))
		pContents.push(last)
		pContents.splice(pContents.length, 0, 
			...this.children.splice(elIndex + 1, this.children.length)
		)
		pElement.status = "open("
		ndc.refresh()
		ndc.positionCursor(ref)
	}

	
}

VirtElement.prototype.elementAtCursor = function(index) {

	if(index == 0)
		return {
			element: this.children[0],
			cummulative: 0
		}

	let cummulative = 0

	let c;

	for(let element of this.children) {

		c = element.cursorDistance()

		if(shouldSkip(element)) {
			cummulative += c
			continue
		}

		if((index == cummulative + c) && !element.isLinearLeft) {
			cummulative += c
			continue
		}

		if(cummulative <= index &&
		   index <= cummulative+c){ 

			return {
				element: element,
				cummulative: cummulative
			}
		}

		cummulative += c
	}

	return {
		element: this.children[this.children.length-1],
		cummulative: cummulative - c
	}
}

VirtElement.prototype.refresh = function() {
	let l = this.children.length
	for(let i=0; i<l-1; i++) {
		if((this.children[i] instanceof NDC) && (this.children[i+1] instanceof NDC)) {
			this.children.splice(i, 2, NDC.join(this.children[i], this.children[i+1]))
			i--;
		}
	}
	this.orientChildren()
}


VirtElement.prototype.split = function(index) {

	let hit = this.elementAtCursor(index)

	let elIndex = this.findIndex(hit.element.id)

	let mid = hit.element.split(index-hit.cummulative)

	let first  = [...this.children.slice(0, elIndex), mid[0]]
	let second = [mid[1], ...this.children.slice(elIndex+1)]

	return [
		new VirtElement(this.parent, first),
		new VirtElement(this.parent, second)
	]
}

VirtElement.prototype.collapse = function() {
	return [this]
}

VirtElement.prototype.duplicate = function() {
	return new VirtElement(this, this.children.map(c => {
		return c.duplicate()
	}))
}

VirtElement.prototype.cursorDistance = function(index) {
	
	if(index === undefined)
		index = this.children.length-1

	let counter = 0;
	
	for(let i=0; i<=index; i++) {
		counter += this.children[i].cursorDistance()
	}
	return counter
}

//for making the cursor's position absolute
//with respect to the VirtElement
VirtElement.prototype.setupCursorLower = function(ref) {
	ref.cursorPos += this.cursorDistance(
		this.findIndex(ref.activeElement.id)-1
	)
	ref.activeElement = this
}

VirtElement.prototype.positionCursor = function(ref) {
	
	let total = this.cursorDistance()

	if(ref.cursorPos < 0 || ref.cursorPos > total) {
		throw "out of bounds"
		return
	}

	if(ref.cursorPos == total) {
		return this.positionCursorEnd(ref)
	}

	let hit = this.elementAtCursor(ref.cursorPos)

	ref.cursorPos -= hit.cummulative
	hit.element.positionCursor(ref)
}

VirtElement.prototype.positionCursorEnd = function(ref) {
	this.getLastInput().positionCursorEnd(ref)
}

VirtElement.prototype.positionCursorStart = function(ref) {
	this.getFirstInput().positionCursorStart(ref)
}

VirtElement.prototype.render = function(ref) {

	let base = document.createElement("div")
	base.className = "VirtElement"

	for(let child of this.children) {
		base.appendChild(child.render(ref))
	}

	return base
}

VirtElement.prototype.getLastInput = function() {
	return this.children[this.children.length-1].getLastInput();
}

VirtElement.prototype.getFirstInput = function() {
	return this.children[0].getFirstInput();
}

VirtElement.prototype.compile = function(strict) {
	return this.children
					.map(c => c.compile(strict))
					.join(' ');
}

export {VirtElement}