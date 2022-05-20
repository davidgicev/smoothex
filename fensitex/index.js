import {VirtElement} from './VirtElement.js'
import {HtmlElement} from './HtmlElement.js'
import {AssignmentElement} from './AssignmentElement.js'
import {refreshFields} from '../FieldManager.js'
import {ParenthesesElement, NDC, VariableElement} from './elements/elements.js'

function FensiInput(parent, dictionary) {
	this.dictionary = dictionary
	this.parent = parent
	this.VirtElement = new AssignmentElement(this)
	this.HtmlElement = new HtmlElement(this)
}

FensiInput.prototype.focus = function() {
	this.HtmlElement.focus();
}

FensiInput.prototype.blur = function() {
	this.HtmlElement.blur();
}

FensiInput.prototype.handleNav = function(ref, dir, sourceID) {
	ref.cursorPos = Math.min(Math.max(0, ref.cursorPos), this.VirtElement.cursorDistance())
	this.VirtElement.positionCursor(ref)
}

FensiInput.prototype.handle = function(ref, event, sourceID) {

	this.VirtElement.positionCursor(ref)

	if(event.keyCode === 13) { // enter
		this.parent.submit()
		return
	}

	this.parent.handle(ref, event, sourceID)
	return
}

FensiInput.prototype.handleBackspace = function(ref, event, sourceID) {
	this.parent.handleDelete(ref)
}

FensiInput.prototype.render = function() {
	return this.HtmlElement.render()
}

FensiInput.prototype.compile = function(strict) {
	return this.VirtElement.compile(strict)
}

FensiInput.prototype.getOccurrences = function() {
	
	let res = []
	let local = []
	let stack = []

	let v = this.VirtElement
	let explicit = !v.left || !v.isLocked()

	if(v.left && v.isLocked()) {
		stack.push(v.left)
	}

	stack.push(v.right)

	while(stack) {
		let el = stack.pop()
		if(el instanceof VariableElement) {
			let value = el.toString()
			if(!res.find(t => t == value))
				res.push(value)
			continue
		}
		if(!el.getChildren)
			continue
		stack.push(...el.getChildren())
	}

	return res
}

FensiInput.prototype.getDefinand = function() {
	let v = this.VirtElement

	if(!v.left || !v.isLocked())
		return

	let definand = v.left.compile()?.trim()

	if(!definand)
        return

    let pIndex = definand.indexOf("(")
    let obj = {
        name: null,
        args: null
    };
    if(pIndex == -1) {
        obj.name = definand;
        obj.type = 'variable'
    }
    else {
        obj.name = definand.substring(0, pIndex).trim()
        let argsTxt = definand.substring(pIndex + 1, definand.length - 1)
        obj.args = argsTxt.split(",").map(a => ({
        	name: a.trim(),
        	type: 'variable',
        	local: true
        }))
        obj.type = 'function'
    }

    return obj
}

FensiInput.prototype.updateFunctionName = function(name) {
	
	let v = this.VirtElement;

	let parentheses = new ParenthesesElement(
		v, 
		new VirtElement(v, new NDC(v, "x"))
	)

	let left = new VirtElement(v, new NDC(v, [new VariableElement(v, ...name.split("_")), parentheses]))

	v.left = left;

	v.lockLeft()
	v.refreshLocal()
	refreshFields()
	this.VirtElement.positionCursorEnd(this.HtmlElement)
	this.render()
}

FensiInput.prototype.updateVariableValue = function(value) {
	let v = this.VirtElement;
	v.right = new VirtElement(v, new NDC(v, value.toString()))
	v.right.orientChildren()
	this.render()
}

FensiInput.prototype.refresh = function() {
	let v = this.VirtElement
	v.refreshLocal()
	this.render()
}

export {FensiInput}