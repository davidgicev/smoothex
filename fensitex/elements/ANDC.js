import {NDC} from './NDC.js'
import {regroup} from '../NDCParser.js'

function ANDC(parent, object) {
	NDC.call(this, parent, object)
	this.regroup(this.children)
}

ANDC.prototype = Object.create(NDC.prototype)

ANDC.prototype.regroup = function(elements) {

	this.children = elements
	
	let generated = []

	let groups = regroup(this.collapse(), true)

	let res = this.transformTokens(groups)
	
	this.children = this.addPadding(res)
	this.orientChildren()
}

ANDC.prototype.split = function(index) {

	let hit = this.elementAtCursor(index)

	// if(!hit.element.isCollapsible())
	// 	throw "ne e collapsible"

	let elIndex = this.findIndex(hit.element.id)

	let mid = hit.element.split(index-hit.cummulative)

	let first = new ANDC(this, this.children.slice(0, elIndex))
	let second = new ANDC(this, this.children.slice(elIndex + 1))

	first.insert(-1, mid[0])
	second.insert(0, mid[1])

	return [
		first,
		second
	]
}

ANDC.join = function(first, second) {

	let joined = [first.collapse(), second.collapse()].flat()

	let joinedNDC = new ANDC(first.parent, joined)

	return joinedNDC
}

ANDC.prototype.pop = function() {
	return new ANDC(this, this.children.pop())
}

ANDC.prototype.unravelElement = function(sourceID) {

	let elIndex = this.findIndex(sourceID)
	let el = this.children[elIndex]

	// unravel the Element

	if(el instanceof FunctionElement) {
		let innerNDC = el.content
		let contents = innerNDC.children
		el.content = new ANDC(this)
		this.children.splice(elIndex + 1, 0, ...contents)
	}

	if(el instanceof ExponentElement) {
		let innerNDC = el.base
		let contents = innerNDC.children
		el.base = new ANDC(this)
		this.children.splice(elIndex, 0, ...contents)
	}

	this.orientChildren()
}

export {ANDC}