import {NumberElement, OperatorElement, ND, VariableElement, SeparatorElement, SubscriptElement, ExponentElement, ParenthesesElement, FractionElement, RootElement, FunctionElement} from './elements.js'
import {isAlphaNumeric, tokenizeString} from '../helpers.js'
import {regroup} from '../NDCParser.js'

//constructor works with a list of elements
function NDC(parent, object) {
	this.idCounter = 0
	this.parent = parent
	this.id = parent.idCounter++
	this.dictionary = parent.dictionary
	this.children = null
	this.adopt(object)
	this.acceptable = (c) => {
		return (isAlphaNumeric(c) || "_^/#".includes(c))
	}
	this.isLinearLeft = true
	this.isLinearRight = true
}

NDC.prototype.getChildren = function() {
	return [...this.children]
}

NDC.prototype.orientChildren = function() {
	this.idCounter = 0
	for (let el of this.children) {
		el.parent = this
		el.id = this.idCounter++
		el.dictionary = this.dictionary
		!el.orientChildren || el.orientChildren()
	}
}

NDC.prototype.findIndex = function(id) {
	return this.children.findIndex(x => x.id == id)
};

NDC.prototype.removeChild = function(sourceID) {

	let elIndex = this.findIndex(sourceID)

	this.children.splice(elIndex, 1)
};

NDC.prototype.adopt = function(object) {

	if(!object || object.length === 0) {
		this.children = [new ND(this)]
		return
	}

	if(typeof object == "string") {
		this.regroup(object)
		return
	}

	if(object instanceof NDC)
		object = [object]

	if(object.some(
		o => ((typeof o == "string") || (o instanceof NDC))
		)) {
		
		this.regroup(object)
		return
	}

	this.children = this.addPadding(object)
	this.orientChildren()
};

NDC.prototype.insert = function(elIndex, elements) {
	
	if(elIndex == -1)
		elIndex = this.children.length

	if(!(elements.constructor === Array))
		elements = [elements]

	this.children.splice(elIndex, 0, ...elements)

	this.refresh()
};


NDC.prototype.handle = function(ref, event, sourceID) {

	let elIndex = this.findIndex(sourceID)
	let char = event.key
	let src = this.children[elIndex]

	if(!this.acceptable(char)) {
		this.setupCursorLower(ref)
		this.parent.handle(ref, event, this.id)
		return
	}

	if(char == "_") {
		let pair = src.split(ref.cursorPos)
		let toAdd;

		ref.cursorPos++;
		toAdd = [
			pair[0],
			new VariableElement(this, "", ""),
			pair[1]
		]

		this.setupCursorLower(ref)
		this.children.splice(elIndex, 1, ...toAdd)
		this.refresh()
		this.positionCursor(ref)
		return
	}

	if(char == "^") {
		let pair = src.split(ref.cursorPos)
		this.setupCursorLower(ref)
		let exp = new ExponentElement(this, pair[0].collapse())
		this.children.splice(elIndex, 1, 
			exp,
			pair[1]
		)
		ref.cursorPos++;
		this.refresh()
		this.positionCursor(ref)
		return
	}

	if(char == "/") {
		this.setupCursorLower(ref)
		this.parent.handle(ref, event, this.id)
		return
		let pair = src.split(ref.cursorPos)
		if(!pair[0].cursorDistance() && elIndex) {
			elIndex--;
			pair = [this.children[elIndex], pair[1]]
			this.children.splice(elIndex, 1)
		}

		let frac = new FractionElement(this, [pair[0]])
		this.children.splice(elIndex, 1, 
			frac,
			pair[1]
		)
		this.refresh()
		if(pair[0].cursorDistance() == 0)
			frac.positionCursorStart(ref);
		else
			frac.positionCursorEnd(ref);
		return
	}

	src.content = src.content.substring(0, ref.cursorPos) 
				 + event.key + src.content.substring(ref.cursorPos)

	ref.cursorPos++;

	this.refreshActive(ref)
}

NDC.prototype.duplicate = function() {
	return new NDC(this, this.children.map(c => {
		return c.duplicate()
	}))
}


// CAUTION: this can mess up the NDC's children
NDC.prototype.split = function(index) {

	let hit = this.elementAtCursor(index)

	// if(!hit.element.isCollapsible())
	// 	throw "ne e collapsible"

	let elIndex = this.findIndex(hit.element.id)

	let mid = hit.element.split(index-hit.cummulative)

	let first = new NDC(this, this.children.slice(0, elIndex))
	let second = new NDC(this, this.children.slice(elIndex + 1))

	first.insert(-1, mid[0])
	second.insert(0, mid[1])

	return [
		first,
		second
	]
}

NDC.join = function(first, second, parent) {

	parent = first?.parent || second?.parent || parent

	if(!first && !second)
		return new NDC(parent)

	if(!first)
		return new NDC(parent, second.collapse().flat())

	if(!second)
		return new NDC(parent, first.collapse().flat())

	let joined = [first.collapse(), second.collapse()].flat()

	let joinedNDC = new NDC(first.parent, joined)

	return joinedNDC
}

NDC.prototype.pop = function() {
	return new NDC(this, this.children.pop())
}

NDC.prototype.handleNav = function(ref, dir, sourceID) {

	let elIndex = this.findIndex(sourceID)
	this.setupCursorLower(ref)

	if(elIndex == 0 && dir == -1) {
		return this.parent.handleNav(ref, dir, this.id)
	}
	else if(elIndex == this.children.length-1 && dir == 1) {
		return this.parent.handleNav(ref, dir, this.id)
	}
	let el = this.children[elIndex + dir]
	ref.cursorPos += dir
	if(dir == -1) {
		ref.cursorPos -= this.cursorDistance(elIndex+dir-1)
		el.positionCursor(ref)
	}
	else {
		ref.cursorPos -= this.cursorDistance(elIndex+dir-1)
		el.positionCursor(ref)
	}
}

NDC.prototype.unravelElement = function(sourceID) {

	let elIndex = this.findIndex(sourceID)
	let el = this.children[elIndex]

	// unravel the Element

	if(el instanceof FunctionElement) {
		let innerNDC = el.content
		let contents = innerNDC.children
		el.content = new NDC(this)
		this.children.splice(elIndex + 1, 0, ...contents)
	}

	if(el instanceof ExponentElement) {
		let innerNDC = el.base
		let contents = innerNDC.children
		el.base = new NDC(this)
		this.children.splice(elIndex, 0, ...contents)
	}

	this.orientChildren()
}

NDC.prototype.collapseBrackets = function(ref, dir, sourceID) {

	let elIndex = this.findIndex(sourceID)
	let el = this.children[elIndex]

	if(el instanceof ParenthesesElement) {
		this.setupCursorLower(ref)
		return this.parent.collapseBrackets(ref, dir, this.id)
	}

	this.setupCursorLower(ref)
	this.unravelElement(sourceID)
	this.parent.collapseBrackets(ref, dir, this.id)
}

NDC.prototype.expandBrackets = function(ref, dir, sourceID) {
	let elIndex = this.findIndex(sourceID)
	let el = this.children[elIndex]

	if(el instanceof ParenthesesElement) {
		this.setupCursorLower(ref)
		return this.parent.expandBrackets(ref, dir, this.id)
	}

	this.setupCursorLower(ref)
	this.unravelElement(sourceID)
	this.parent.expandBrackets(ref, dir, this.id)
}

NDC.prototype.handleBackspace = function(ref, sourceID) {

	let elIndex = this.findIndex(sourceID)

	if(elIndex == 0) {
		this.setupCursorLower(ref)
		this.parent.handleBackspace(ref, this.id)
		return
	}

	let prev = this.children[elIndex-1]
	ref.cursorPos = prev.cursorDistance()
	prev.cutEnd(ref)
	return
}

NDC.prototype.handleDel = function(ref, sourceID) {

	let elIndex = this.findIndex(sourceID)

	if(elIndex == this.children.length-1) {
		this.setupCursorLower(ref)
		this.parent.handleDel(ref, this.id)
		return
	}

	let next = this.children[elIndex+1]
	next.cutStart(ref)
	return
}

NDC.prototype.handleBrackets = function(ref, action, sourceID) {
	let elIndex = this.findIndex(sourceID)
	let el = this.children[elIndex]

	if(el instanceof ParenthesesElement) {
		this.setupCursorLower(ref)
		return this.parent.handleBrackets(ref, action, this.id)
	}

	this.setupCursorLower(ref)
	this.unravelElement(sourceID)
	this.parent.handleBrackets(ref, action, this.id)
}

NDC.prototype.cursorDistance = function(index) {
	
	if(index === undefined)
		index = this.children.length-1

	let counter = 0;

	for(let i=0; i<=index; i++) {
		counter += this.children[i].cursorDistance()
	}
	return counter
}

NDC.prototype.refresh = function() {
	this.regroup(this.children)
	this.orientChildren()
}

//meant to be used by it's children
//the child that calls it must be attached
NDC.prototype.refreshActive = function(ref) {

	this.setupCursorLower(ref)
	
	if(this.parent.refreshActive) {
		this.parent.refreshActive(ref)
	}
	else {
		this.refresh()
		this.positionCursor(ref)
	}

}

//for making the cursor's position absolute
//with respect to the NDC
NDC.prototype.setupCursorLower = function(ref) {
	if(this.findIndex(ref.activeElement.id) == -1) {
		throw "ooh"
	}
	ref.cursorPos += this.cursorDistance(
		this.findIndex(ref.activeElement.id)-1
	)
	ref.activeElement = this
}

NDC.prototype.positionCursorEnd = function(ref) {
	this.getLastInput().positionCursorEnd(ref)
}

NDC.prototype.positionCursorStart = function(ref) {
	this.getFirstInput().positionCursorStart(ref)
}

//must be in bounds
NDC.prototype.positionCursor = function(ref) {
	
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

NDC.prototype.elementAtCursor = function(index) {

	if(index == 0)
		return {
			element: this.children[0],
			cummulative: 0
		}

	let cummulative = 0

	let c;
	let l = this.children.length

	for(let i=0; i<l; i++) {

		let element = this.children[i]
		
		c = element.cursorDistance()


		if(index == cummulative+c && !element.isLinearRight) {
			cummulative += c
			continue
		}

		if(cummulative <= index && index <= cummulative+c) {
			return {
				element: element,
				cummulative: cummulative
			}
		}

		cummulative += c		
	}

	return {
		element: this.children[l-1],
		cummulative: cummulative - c
	}
}

NDC.prototype.collapseExponent = function(ref, sourceID) {

	let elIndex = this.findIndex(sourceID)
	let el = this.children[elIndex]

	ref.cursorPos = this.cursorDistance(elIndex-1)
	ref.cursorPos += el.base.cursorDistance()
	this.children.splice(elIndex, 1, ...el.base.children, ...el.expo.children)
	this.refresh()
	this.orientChildren()
	this.positionCursor(ref)
}

NDC.prototype.collapseFraction = function(ref, sourceID) {
	let elIndex = this.findIndex(sourceID)
	let el = this.children[elIndex]

	ref.cursorPos = this.cursorDistance(elIndex-1)
	ref.cursorPos += el.num.cursorDistance()

	this.children.splice(elIndex, 1, ...el.num.children, ...el.den.children)
	this.refresh()
	this.orientChildren()
	this.positionCursor(ref)
}

NDC.prototype.collapseRoot = function(ref, sourceID) {
	let elIndex = this.findIndex(sourceID)
	let el = this.children[elIndex]

	ref.cursorPos = this.cursorDistance(elIndex-1)

	this.children.splice(elIndex, 1, ...el.rad.children)
	this.refresh()
	this.orientChildren()
	this.positionCursor(ref)
}

NDC.prototype.replaceActive = function(ref, elements, sourceID) {

	this.setupCursorLower(ref)

	let elIndex = this.findIndex(sourceID)

	this.children.splice(elIndex, 1, ...elements)

	this.refresh()
	this.positionCursor(ref)
}

NDC.prototype.replace = function(elIndex, elements) {

	if(elIndex == -1)
		elIndex = this.children.length-1

	this.children.splice(elIndex, 1, ...elements)

	this.refresh()
}

NDC.prototype.regroup = function(elements) {

	this.children = elements
	
	let generated = []

	let groups = regroup(this.collapse(), this.dictionary)

	let res = this.transformTokens(groups)
	
	this.children = this.addPadding(res)
	this.orientChildren()
}

NDC.prototype.transformTokens = function(elements) {

	let res = []
	let dict = {NumberElement, VariableElement, ND, ExponentElement, FunctionElement, RootElement}

	for (let el of elements) {

		if(el.type == 'expression') {
			res.push(el.params)
			continue
		}

		let Type = dict[el.type]
		if(Type === FunctionElement) {
			el.params = [
				el.params[0],
				this.transformTokens(el.params[1])
			]
		}
		if(Type === ExponentElement) {
			el.params = [
				this.transformTokens(el.params[0]),
				el.params[1]
			]
		}
		res.push(new Type(this, ...el.params))
	}

	return res
}

NDC.prototype.addPadding = function(generated) {

	let final = []

	if(generated.length == 0)
		return [new ND(this)]

	if(!generated[0].isLinearLeft)
		final.push(new ND(this))

	if(generated.length == 1) {
		let el = generated.shift()
		final.push(el)
		if(!el.isLinearRight)
			final.push(new ND(this))
		return final
	}

	while (generated.length > 1) {

		let el1 = generated.shift()
		let el2 = generated[0]

		if(!el1.isLinearRight && !el2.isLinearLeft) {
			final.push(el1)
			final.push(new ND(this))
			continue
		}

		final.push(el1)		
	}

	let el = generated.shift()
	final.push(el)
	if(!el.isLinearRight) 
		final.push(new ND(this))

	return final
}

NDC.prototype.isCollapsible = function() {
	return true
}

NDC.prototype.collapse = function() {
	let res = []

	for(let el of this.children) {
		
		if(!el.isCollapsible || !el.isCollapsible()) {
			res.push(el)
		}
		else {
			res.push(el.collapse())
		}
	}

	res = res.flat(2)

	for(let i=0; i<res.length-1; i++) {
		
		if(typeof res[i] == "string" &&
		   typeof res[i+1] == "string") {

			res[i] += res.splice(i+1, 1)
			i--
		}
	}

	return res
}

NDC.prototype.separate = function(parsed) {

	let elements = []

	let tokens = tokenizeString(parsed)

	if(tokens.length == 0) {
		let el = new ND(this)
		if(ref)
			el.positionCursor(ref)
		return [el]
	}

	for(let i=0; i<tokens.length; i++) {

		let token = tokens[i]
		let el;
		
		if(token.type == 'function') {
			let el = new FunctionElement(
				this,
				token.content,
				new NDC(this, this.content.substring(token.end)),
			)
			elements.push(el)
			break
		}
		else if(token.type == 'variable') {
			el = new VariableElement(
				this,
				token.content,
				token.subscript
			)
			elements.push(el)
		}
		else if(token.type == 'number') {
			el = new NumberElement(
				this,
				token.content,
			)
			elements.push(el)
		}
		else {
			el = new ND(
				this,
				token.content,
			)
			elements.push(el)
		}
	}	

	let last = elements[elements.length-1]

	if(last.subscript) {
		elements.push(new ND(this))
	}

	return elements
}

NDC.prototype.render = function(ref) {

	let base = document.createElement("div")
	base.className = "NDC"

	for(let child of this.children) {
		base.appendChild(child.render(ref))
	}

	return base
}

NDC.prototype.compile = function(strict) {

	return this.children
				.map(c => c.compile(strict))
				.filter(s => s.length > 0)
				.join(" ");
}

NDC.prototype.getLastInput = function() {
	return this.children[this.children.length-1].getLastInput();
}

NDC.prototype.getFirstInput = function() {
	return this.children[0].getFirstInput();
}

export {NDC}