import {VirtElement} from './VirtElement.js'
import {AVirtElement} from './AVirtElement.js'
import {NDC, ND, ParenthesesElement, AbsElement, ANDC, VariableElement, OperatorElement, SubscriptElement, NumberElement} from './elements/elements.js'
import {Trie, Forest} from './trieHelper.js'

function AssignmentElement(parent, left, right) {
	this.parent = parent
	this.id = 0
	this.idCounter = 0
	this.dictionary = parent.dictionary
	this.left = null
	this.right = null
	this.adopt(left, right)
}

AssignmentElement.prototype.getChildren = function() {
	return [this.left, this.right]
}

AssignmentElement.prototype.orientChildren = function() {
	if(this.left) {
		this.left.parent = this
		this.left.id = this.idCounter++
		this.left.dictionary = this.dictionary
		this.left.orientChildren()
	}

	this.right.parent = this
	this.right.id = this.idCounter++
	this.right.dictionary = this.dictionary
	this.right.orientChildren()

}

AssignmentElement.prototype.adopt = function(left, right) {
	if(left instanceof VirtElement)
		this.left = left
	else if(left)
		this.left = new VirtElement(this)
	if(right instanceof VirtElement)
		this.right = right
	else
		this.right = new VirtElement(this)

	this.orientChildren()
}

AssignmentElement.prototype.positionCursorEnd = function(ref) {
	this.getLastInput().positionCursorEnd(ref)
}

AssignmentElement.prototype.positionCursorStart = function(ref) {
	this.getFirstInput().positionCursorStart(ref)
}

AssignmentElement.prototype.getFirstInput = function() {
	return this.left || this.right;
}

AssignmentElement.prototype.getLastInput = function() {
	return this.right;
}

AssignmentElement.prototype.handle = function(ref, event, sourceID) {

	if(event.keyCode === 187) { // =
		if(this.left) {
			ref.activeElement.positionCursor(ref)
			return
		}

		let [left, right] = this.right.split(ref.cursorPos)

		this.left = left
		this.right = right
		this.orientChildren()
		this.refreshLock()
		this.right.positionCursorStart(ref)
		return
	}

	this.setupCursorLower(ref)
	this.parent.handle(ref, event, this.id)
};

AssignmentElement.prototype.refreshLock = function(ref) {
	if(!this.left)
		return

	if(this.canLockLeft()) {
		if(this.left.dictionary.isEmpty()) {
			this.refreshLocal()
			return
		}
		this.lockLeft()
		return true
	}
	else if(this.left.dictionary.isEmpty()) {
		this.unlockLeft()
		return true		
	}
}

AssignmentElement.prototype.refreshLocal = function() {
	
	let string = this.left ? this.left.compile() : ""
	string = string.replace(/\s/g, '');
	let index = string.indexOf('(')
	
	if(index == -1)
		string = ""
	else
		string = string.substring(index + 1, string.indexOf(")"))

	this.dictionary = this.dictionary.duplicate(['builtin', 'global'])

	let args = string.split(",").filter(s => s.length > 0)
	this.dictionary.set('local', args.map(a => {
		return {
			name: a,
			type: 'variable',
			content: a
		}
	}))

	this.orientChildren()

	if(this.left) {
		this.left.dictionary = new Forest([])
		this.left.orientChildren()
	}

	// doesn't unlock it - it just refreshes the NDCs
	
	unlockRecurse(this.right)
}

AssignmentElement.prototype.canLockLeft = function() {
	
	if(this.left.children.length != 1)
		return

	let ndc = this.left.children[0]

	if(!(ndc instanceof NDC))
		return

	if(ndc.children.some(c => c instanceof NumberElement))
		return

	let children = ndc.collapse()

	if(typeof children[0] !== 'string')
		return false

	if(children.length == 1) {
		return true
	}

	children.shift()

	if(children[0] instanceof SubscriptElement)
		children.splice(0, 2)

	if(children.length == 0)
		return true
	
	if(children.length == 2) {

		if(!(children[0] instanceof ParenthesesElement) || children[0] instanceof AbsElement)
			return
		
		let content = children[0].content.children
		
		if(!content.every(e => {
			if(e instanceof OperatorElement) {
				if(e.content == ',')
					return true
				return false
			}
			else {
				if(!e.children.every(el => (el instanceof VariableElement || el instanceof ND)))
					return false
				for(let i=0; i<e.children.length-2; i++)
					if(e.children[i].subscript != null)
						return false
				return true
			}
		}))
			return false

		if(children[1] === '')
			return true
	}
}

AssignmentElement.prototype.lockLeft = function() {


	let ndc = this.left.children[0]
	
	let collapsed = ndc.collapse()

	let temp = this.dictionary
	this.left = new VirtElement(
		this, new NDC(this, collapsed), 
		new Forest([])
	)

	unlockRecurse(this.left)
}

function unlockRecurse(current, parentRefresh) {

	if(!current.getChildren)
		return

	let canRefresh = Boolean(current.refresh)

	for(let el of current.getChildren()) {
		unlockRecurse(el, canRefresh)
	}

	if(!parentRefresh && canRefresh)
		current.refresh()
}

AssignmentElement.prototype.unlockLeft = function() {
	this.orientChildren()
	unlockRecurse(this.left)
}

AssignmentElement.prototype.render = function(ref) {
	let container = document.createElement('div')
	container.className = 'AssignmentElement'
	if(this.left) {
		container.appendChild(this.left.render(ref))
		let eq = document.createElement('div')
		eq.className = 'EqualsSign'
		eq.textContent = '='
		container.appendChild(eq)
	}
	container.appendChild(this.right.render(ref))
	return container
}

AssignmentElement.prototype.isLocked = function() {
	if(!this.left)
		return true
	return this.left.dictionary.isEmpty()
}

AssignmentElement.prototype.compile = function(strict) {
	if(this.left) {
		if(this.left.dictionary.isEmpty()) {
			let contents = this.left.children[0].children
			
			if(contents.length > 1) { //function definition
				let leftC = contents
								.map(c => c.compile(strict))
								.join(' ')

				return leftC + " := " + this.right.compile(strict)
			}
			else {
				return this.left.compile(strict) + ' := ' + this.right.compile(strict)
			}
		}
		else {
			return this.left.compile(strict) + " = " + this.right.compile(strict)
		}

	}
	return this.right.compile(strict)
}

AssignmentElement.prototype.setupCursorLower = function(ref) {
	if(ref.activeElement.id == this.right.id) {
		ref.activeElement = this
		ref.cursorPos += this.left ? this.left.cursorDistance() + 1 : 0
		return
	}

	ref.activeElement = this
}

AssignmentElement.prototype.positionCursor = function(ref) {
	if(!this.left)
		return this.right.positionCursor(ref)

	let offset = this.left.cursorDistance()

	if(ref.cursorPos <= offset) {
		return this.left.positionCursor(ref)
	}

	ref.cursorPos -= offset + 1
	return this.right.positionCursor(ref)
}

AssignmentElement.prototype.positionCursorStart = function(ref) {
	return this.getFirstInput().positionCursorStart(ref)
}

AssignmentElement.prototype.positionCursorEnd = function(ref) {
	return this.getLastInput().positionCursorEnd(ref)
}

AssignmentElement.prototype.handleNav = function(ref, dir, sourceID) {
	if(this.right.id == sourceID) {
		if(dir == 1)
			return this.right.positionCursorEnd(ref)
		if(!this.left)
			return this.right.positionCursorStart(ref)

		return this.left.positionCursorEnd(ref)
	}
	else {
		if(dir == 1)
			return this.right.positionCursorStart(ref)
		return this.left.positionCursorStart(ref)
	}
}

AssignmentElement.prototype.handleBackspace = function(ref, sourceID) {
	if(this.right.id == sourceID) {
		if(this.left) {
			ref.cursorPos = this.left.cursorDistance()
			let contents = this.left.children
			let middle = NDC.join(contents.pop(), this.right.children.shift())
			this.left = null
			this.right = new VirtElement(this, [...contents, middle, ...this.right.children])
			unlockRecurse(this.right)
			return this.right.positionCursor(ref)
		}
		
		if(this.right.cursorDistance())
			return this.right.positionCursorStart(ref)

		this.setupCursorLower(ref)
		this.parent.handleBackspace(ref, sourceID)
	}
	else {
		if(this.left.cursorDistance())
			return this.left.positionCursorStart(ref)

		this.setupCursorLower(ref)
		this.parent.handleBackspace(ref, sourceID)
	}
}

AssignmentElement.prototype.handleDel = function(ref, sourceID) {
	if(this.left && this.left.id == sourceID) {
		ref.cursorPos = this.left.cursorDistance()
		let contents = this.left.children
		let middle = NDC.join(contents.pop(), this.right.children.shift())
		this.left = null
		this.right = new VirtElement(this, [...contents, middle, ...this.right.children])
		unlockRecurse(this.right)
		return this.right.positionCursor(ref)
	}
	else {
		if(this.left || this.right.cursorDistance())
			return this.right.positionCursorEnd(ref)

		this.setupCursorLower(ref)
		this.parent.handleBackspace(ref, sourceID)
	}
}

AssignmentElement.prototype.duplicate = function() {
	return new AssignmentElement(this, this.left, this.right)
}

export {AssignmentElement}