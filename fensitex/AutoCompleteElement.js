import {ND} from './elements/ND.js'
import {isAlphaNumeric} from './helpers.js'
import {RootElement, NDC, VariableElement, AbsElement, SubscriptElement} from './elements/elements.js'
import {VirtElement} from './VirtElement.js'

function AutoCompleteElement(parent) {
	this.parent = parent
	this.state = {
		pos: -1,
		suggestions: null,
		query: ""
	}
}

var quickReplace = [
	{
		name: 'sqrt',
		generate: () => new RootElement({idCounter:0}, 2),
		replace: true,
		length: 1,
		type: '√x',
		virtParent: true
	},
	{
		name: 'nthroot',
		generate: () => new RootElement({idCounter:0}),
		replace: true,
		length: 1,
		type: 'ⁿ√x',
		virtParent: true
	},
	{
		name: 'abs',
		generate: () => new AbsElement({idCounter:0}, null, 'open('),
		replace: true,
		length: 1,
		type: "|x|"
	},
	{
		name: 'pi',
		generate: () => new VariableElement({idCounter:0}, 'π'),
		replace: true,
		length: 1,
		type: "π"
	},
	{
		name: 'tau',
		generate: () => new VariableElement({idCounter:0}, 'τ'),
		replace: true,
		length: 1,
		type: "τ"
	}
]

AutoCompleteElement.prototype.handlePre = function(event) {

	if(!this.state.suggestions?.length)
		return false

	if(event.ctrlKey || event.altKey)
		return false

	if(event.keyCode === 9) { // tab
		if(this.state.pos == -1)
			return false
		else {
			this.submit()
			return true
		}
	}

	if(event.keyCode === 13) { // enter
		this.submit()
		return true
	}

	if(event.keyCode === 27) { //esc
		this.reset()
		return true
	}

	//navigation

	if(event.keyCode === 38 ||
	   event.keyCode === 40) {		//up/down

	   	this.state.pos += event.keyCode === 38 ? -1 : 1;
	   	this.state.pos = Math.max(0, this.state.pos)
	   	this.state.pos = Math.min(this.state.suggestions.length-1, this.state.pos)
	   	return true
	}

}

AutoCompleteElement.prototype.handlePost = function(event) {

	if(event.ctrlKey || event.altKey)
		return false

	if(event.keyCode === 9) { // tab
		if(!this.state.suggestions?.length)
			this.refresh()
		return
	}

	// if(event.keyCode === 13) { // enter
	// 	this.reset()
	// 	return false
	// }

	if(isAlphaNumeric(event.key) || event.keyCode === 8 || event.keyCode == 189) {
		this.refresh()
		return
	}

	// //navigation

	if(event.keyCode === 37 ||
	   event.keyCode === 39) {		//left/right
		if(this.state.suggestions?.length)
			this.refresh()
	}

}

AutoCompleteElement.prototype.refresh = function() {

	let elRef = this.parent.activeElement

	while(!(elRef instanceof VirtElement) && elRef) {
		elRef = elRef.parent
		elRef.setupCursorLower(this.parent)
	}

	let cursorPos = this.parent.cursorPos
	elRef.positionCursor(this.parent)


	if(!elRef)
		return this.reset()

	let isInSub = this.parent.activeElement instanceof SubscriptElement

	let res = elRef.elementAtCursor(cursorPos)
	cursorPos -= res.cummulative
	let ndc = res.element.duplicate()
	ndc.orientChildren()
	ndc = ndc.split(cursorPos)[0]
	let collapsed = ndc.collapse()
	let text;


	if(isInSub) {
		let sub = this.parent.activeElement
		if(sub.content.length) {
			collapsed.pop()
			collapsed.pop()
		}
		text = collapsed.pop() + "_" + sub.content
	}
	else
		text = collapsed.pop()

	this.populateSuggestions(text, elRef.dictionary)
	this.state.elInfo = {
		ndc: res.element,
		cursorPos: cursorPos
	}
	this.state.query = text
}

AutoCompleteElement.prototype.populateSuggestions = function(query, dict) {

	let results = []
	let l = query.length
	let q, res1, res2;
	let subIndex = query.indexOf("_")
	let limit = (subIndex == -1) ? l : subIndex;
	
	for(let i=0; i<limit; i++) {

		q = query.substring(i, l)
		res1 = dict.startsWithQ(q)?.filter(s => !s.hidden && s.name !== q)
		res2 = quickReplace.filter(s => s.name.startsWith(q));

		for(let r of res1)
			if(!results.includes(r))
				results.push(r)

		for(let r of res2)
			if(!results.includes(r))
				results.push(r)	
	}

	// if(!res || !res.length && !res2.length) {
	// 	return true
	// }

	this.state.suggestions = results
	if(this.state.pos == -1)
		this.state.pos = 0
	return true
}

AutoCompleteElement.prototype.reset = function() {
	this.state.pos = -1
	this.state.suggestions = []
	this.state.query = ""
}

AutoCompleteElement.prototype.submit = function() {

	let option = this.state.suggestions[this.state.pos]
	let isInSub = this.parent.activeElement instanceof SubscriptElement
	let ndcCursorPos = this.state.elInfo.cursorPos

	let virt = this.parent.activeElement

	while(!(virt instanceof VirtElement)) {
		virt = virt.parent
		virt.setupCursorLower(this.parent)
	}

	let prefixLength;
	let q = this.state.query
	for(let i=0; i<q.length; i++) {
		if(option.name.startsWith(q.substring(i))) {
			prefixLength = q.length - i
			break
		}
	}

	// let [ndcLL, ndcLR] = ndcL.split(ndcCursorPos - prefixLength)

	let content;
	let offset;

	if(option.replace) {
		content = option.generate()
		offset = option.length - prefixLength
	}
	else {
		content = new VariableElement(this, ...option.name.split("_"))
		offset = -prefixLength + content.cursorDistance()
	}

	let pair = virt.split(this.parent.cursorPos)

	let pairL = pair[0].split(this.parent.cursorPos - prefixLength)

	virt.children = [
		...pairL[0].children,
		option.virtParent ? content : new NDC(virt, [content]),
		...pair[1].children 
	]

	virt.refresh()
	this.parent.cursorPos += offset
	virt.positionCursor(this.parent)
	this.reset()
	return true
}

/*


	let option = this.state.suggestions[this.state.pos]
	let isInSub = this.parent.activeElement instanceof SubscriptElement
	let ndcCursorPos = this.state.elInfo.cursorPos

	let ndc = this.state.elInfo.ndc
	let [ndcL, ndcR] = ndc.split(ndcCursorPos)

	console.log(ndcL, ndcR)

	let prefixLength;
	let q = this.state.query
	for(let i=0; i<q.length; i++) {
		if(option.name.startsWith(q.substring(i))) {
			prefixLength = q.length - i
			break
		}
	}

	let [ndcLL, ndcLR] = ndcL.split(ndcCursorPos - prefixLength)

	let content;
	let offset;

	if(option.replace) {
		content = option.generate()
		offset = option.length - prefixLength
	}
	else {
		content = new VariableElement(this, ...option.name.split("_"))
		offset = -prefixLength + content.cursorDistance()
	}

	ndcLL.children.push(content)

	let joined = NDC.join(ndcLL, ndcR)
	ndc.children = joined.children
	ndc.refresh()
	this.parent.cursorPos = ndcCursorPos + offset
	ndc.positionCursor(this.parent)

	this.reset()
	return true


*/

AutoCompleteElement.prototype.render = function() {

	if(!this.state.suggestions)
		return
	
	let container = document.createElement("div")
	container.className = 'AutoCompleteWrapper'

	let suggestions = this.state.suggestions

	for(let i=0; i<suggestions.length; i++) {
		
		let suggestion = suggestions[i]

		let subc = document.createElement("div")

		let name = document.createElement("div")
		let pair = suggestion.name.split("_")
		name.appendChild(document.createTextNode(pair[0]))
		if(pair.length > 1) {
			let sub = document.createElement("div")
			sub.className = 'SubscriptElement'
			sub.textContent = pair[1]
			name.appendChild(sub)
		}
		let type = document.createElement("div")
		type.textContent = suggestion.type

		if(i == this.state.pos)
			subc.className = "AutoCompleteSelected"

		subc.appendChild(name)
		subc.appendChild(type)
		container.appendChild(subc)
	}

	return container
}

export {AutoCompleteElement}