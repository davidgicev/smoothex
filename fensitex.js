import {state} from './app.js';
import {parseSection} from './parser.js'

function createInputField() {
	let frame = document.createElement("div");
	frame.className = "ftFrame"
	
	let container = document.createElement("div");
	container.className = "ftContainer"

	let base = createInputSubfield(container).firstElementChild

	// base.firstElementChild.style.backgroundColor = "rgba(0,0,0,0.1)"

	container.appendChild(base)
	frame.appendChild(container)

	return frame;
}

function createInputSubfield() {

	let base = document.createElement("span")
	base.contentEditable = "true"
	base.className = "ftText"

	let shell = document.createElement("div")
	shell.className = "ftWrapper"

	// base.name = depth
	base.spellcheck = false

	let innerShell = document.createElement("div")
	innerShell.className = "ftInnerShell"

	base.addEventListener("keydown", function(event) {

		if(event.keyCode === 13) { //enter
			event.preventDefault()
			return
		}

		if(state.shift && event.keyCode === 54) { //^

			event.preventDefault();
			
			insertExponent(base);

			return
		}

		if(event.keyCode === 191) { // /

			event.preventDefault();

			insertFraction(base)

			return
		}

		if (event.keyCode === 8) { //backspace
			if(base.textContent == "") {
				event.preventDefault()
				
				let target = previousSubfield(base)

				if(target.nodeName != "SPAN")
					return

				if(base.parentElement.className == "Broitel") {
					if(indexOfChild(base) == 0) {
						target = previousSubfield(base)
						base.parentElement.parentElement.remove()
					}
					moveCaretToEnd(target)
					return
				}

				if(base.parentElement.className == "Imenitel") {
					base.parentElement.parentElement.parentElement.insertBefore(target, base.parentElement.parentElement)
					base.parentElement.parentElement.parentElement.removeChild(base.parentElement.parentElement)
					moveCaretToEnd(target)
					return
				}

				if(base.parentElement.className == "Content") {
					target = previousSubfield(base)
					if(indexOfChild(base) == 0) {
						moveCaretToEnd(target)
						target.nextSibling.remove()
					}
					else {
						moveCaretToEnd(target)
					}
					return
				}

				if(base.parentElement.className == "ftRootPok") {
					if(base.parentElement.contains(target)) {
						moveCaretToEnd(target)
					}
					else {
						let cont = base.parentElement.nextSibling.firstElementChild.children[1]
						let last = cont.lastElementChild
						while(last) {
							target.parentElement.insertBefore(last, target.nextSibling)
							last = cont.lastElementChild
						}
						base.parentElement.parentElement.remove()
						moveCaretToEnd(target)
					}
					return
				}

				if(base.parentElement.contains(target)) {
					moveCaretToEnd(target)
				}
				else {
					base.parentElement.parentElement.removeChild(base.parentElement)
					moveCaretToEnd(target)
				}
				
			}

			return

		}

		// 37 left
		// 39 right
		// 38 up
		// 40 down

		if(event.keyCode === 37 || event.keyCode === 38) { //left
			if(getCaretPosition(base) == 0) {
				event.preventDefault()
				let target = previousSubfield(base)

				if(target.nodeName != "SPAN")
					return

				moveCaretToEnd(target)
			}
			return
		}

		if(event.keyCode === 39 || event.keyCode === 40) { //right
			if(getCaretPosition(base) == base.textContent.length) {

				event.preventDefault()

				let target = nextSubfield(base)
				if(target.nodeName != "SPAN")
					return
				if(target.style.display == "none")
					target.style.display = "inline-block"

				target.focus()
			}
			return
		}

		if(state.shift && event.keyCode === 75) { // (n-ti) koren

			event.preventDefault();
			
			insertRoot(base)
			return
		}

		if(state.shift && event.keyCode === 68) { // (kvadraten) koren

			event.preventDefault();
			
			let root = insertRoot(base)
			root.style.marginLeft = "0px";
			root.firstElementChild.firstElementChild.textContent = 2
			root.firstElementChild.firstElementChild.style.visibility = "hidden"
			findInnerSubfieldRight(root).focus()
		}

		if(state.shift && event.keyCode === 189) { // subscript
			event.preventDefault();
			insertSub(base);
			return
		}

		if(event.keyCode === 189) { // swap - with –
			event.preventDefault()
			let index = getCaretPosition(base)
			let text = base.textContent
			base.textContent = text.substring(0, index) + "\u2013" + text.substring(index)
			moveCaretToEnd(base, index+1)
		}

		if(state.shift && event.keyCode === 56) { // swap * with ⋅
			event.preventDefault()
			let index = getCaretPosition(base)
			let text = base.textContent
			base.textContent = text.substring(0, index) + "\u22C5" + text.substring(index)
			moveCaretToEnd(base, index+1)
		}

		// if(event.keyCode === 9) { 					// tab
		// 	console.log(getCaretPosition(base))
		// 	console.log(base.textContent.length)
		// 	console.log(base.textContent)
		// 	if(getCaretPosition(base) == base.textContent.length) {

		// 		event.preventDefault()

		// 		let target = nextSubfield(nextSubfield(base).parentElement);
		// 		if(target.nodeName != "SPAN") {
		// 			return
		// 		}
		// 		if(target.style.display == "none")
		// 			target.style.display = "inline-block"

		// 		target.focus()
		// 	}
		// 	return
		// }


	})

	innerShell.appendChild(base)
	shell.appendChild(innerShell)

	return shell;
}

function moveCaretToEnd(el, index) {

	if(el.style.display == "none")
		el.style.display = "inline-block"

	if(!el.firstChild) {
		el.focus()
		return
	}

	index = index || el.textContent.length

	var range = document.createRange();
	var sel = window.getSelection();
	range.setStart(el.childNodes[0], index);
	range.collapse(true);
	sel.removeAllRanges();
	sel.addRange(range);
}

function indexOfChild(child){
    var parent = child.parentNode;
    var children = parent.children;
    var i = children.length - 1;
    for (; i >= 0; i--){
        if (child == children[i]){
            break;
        }
    }
    return i;
}

function cutLeft(input) {

	let openP = 0
	for(let i = input.length-1; i > 0; i--) {		

		// console.log(input[i])
		
		if(input[i] == ")")
			openP++

		else if(input[i] == "(")
			openP--

		else if(openP == 0 && "+- ".indexOf(input[i]) != -1) {
			return i+1
		}
	}
	if(input.indexOf("+") == -1 && input.indexOf("-") == -1)
		return 0;
	return input.length;
}

function getCaretPosition(editableDiv) {
  var caretPos = 0,
    sel, range;
  if (window.getSelection) {
    sel = window.getSelection();
    if (sel.rangeCount) {
      range = sel.getRangeAt(0);
      if (range.commonAncestorContainer.parentNode == editableDiv) {
        caretPos = range.endOffset;
      }
    }
  } else if (document.selection && document.selection.createRange) {
    range = document.selection.createRange();
    if (range.parentElement() == editableDiv) {
      var tempEl = document.createElement("span");
      editableDiv.insertBefore(tempEl, editableDiv.firstChild);
      var tempRange = range.duplicate();
      tempRange.moveToElementText(tempEl);
      tempRange.setEndPoint("EndToEnd", range);
      caretPos = tempRange.text.length;
    }
  }
  return caretPos;
}

function createFractionField(container) {

	let broitelDiv  = createInputSubfield(container).firstElementChild
	let imenitelDiv = createInputSubfield(container).firstElementChild

	let broitel  = broitelDiv .firstChild
	let imenitel = imenitelDiv.firstChild

	broitelDiv .className = "Broitel"
	imenitelDiv.className = "Imenitel"

	broitel .appendChild(document.createTextNode(""))
	imenitel.appendChild(document.createTextNode(""))

	let sneaky = document.createElement('span')
	sneaky.style.display = "inline-block"
	sneaky.style.visibility = "hidden"

	let wrapper = document.createElement("div")

	wrapper.appendChild(broitelDiv)
	wrapper.appendChild(imenitelDiv)
	wrapper.appendChild(sneaky)

	wrapper.className = "ftFraction"

	return wrapper
}

function insertExponent(base) {

	let subfield = createInputSubfield(base.parentElement)
	subfield.className = "ftExponent"
	let position = getCaretPosition(base)
	let temp = base.textContent.substring(position)
	base.textContent = base.textContent.substring(0, position)
	base.parentElement.insertBefore(subfield, base.nextSibling)
	subfield.firstElementChild.firstElementChild.focus()
	let prodolzhenie = createInputSubfield(base.parentElement).firstElementChild
	prodolzhenie = prodolzhenie.children[0]
	prodolzhenie.textContent = temp;
	base.parentElement.insertBefore(prodolzhenie, subfield.nextSibling)
}

function insertFraction(base) {
	
	let subfield = createFractionField(base.parentElement)
	let position = getCaretPosition(base)

	let leftText  = base.textContent.substring(0, position)
	let rightText = base.textContent.substring(position)

	let cutIndex = cutLeft(leftText)

	base.textContent = leftText.substring(0, cutIndex)

	let imenitelTekst = leftText.substring(cutIndex)

	subfield.firstChild.firstChild.textContent = imenitelTekst;

	base.parentElement.insertBefore(subfield, base.nextSibling)
	if(!imenitelTekst) {
		subfield.firstChild.firstChild.focus()
	}
	else
		subfield.children[1].firstChild.focus()
	let prodolzhenie = createInputSubfield(base.parentElement).firstElementChild
	prodolzhenie = prodolzhenie.children[0]
	prodolzhenie.textContent = rightText;
	base.parentElement.insertBefore(prodolzhenie, subfield.nextSibling)
}

function createRootField(container) {

	/*

		Root Div
		|
		|--Stepen Div (ftRootPok)
		|	|
		|	Stepen Span
		|
		|
		|--Content Div (ftRootContent)
		|	|
		|	First Div
		|		|
		|		|--SVG Wrapper (ftRootSVGWrapper)
		|		|	|
		|		|	SVG
		|		|
		|  		|--Content (Content)

	*/

	let stepenDiv  = document.createElement("div")
	stepenDiv.className = "ftRootPok"
	let stepenSpan = createInputSubfield(container).firstElementChild.firstElementChild
	stepenDiv.appendChild(stepenSpan)
	
	let contentDiv = document.createElement("div")
	contentDiv.className = "ftRootContent"
	let firstDiv = document.createElement("div")
	let korenWrapper = document.createElement("div")
	korenWrapper.className = "ftRootSVGWrapper"
	let korenSimbol = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	korenSimbol.setAttribute("viewBox", "0 0 32 54")
	korenSimbol.setAttribute("preserveAspectRatio", "none")
	korenSimbol.innerHTML = '<path d="M0 33 L7 27 L12.5 47 L13 47 L30 0 L32 0 L13 54 L11 54 L4.5 31 L0 33"></path>'
	let content = document.createElement("div")
	content.className = "Content"
	content.appendChild(createInputSubfield().firstElementChild.firstElementChild)
	korenWrapper.appendChild(korenSimbol)
	firstDiv.appendChild(korenWrapper)
	firstDiv.appendChild(content)
	contentDiv.appendChild(firstDiv)

	let wrapper = document.createElement("div")
	wrapper.appendChild(stepenDiv)
	wrapper.appendChild(contentDiv)
	wrapper.className = "ftRoot"

	return wrapper
}

function insertRoot(base) {
	
	let subfield = createRootField(base.parentElement)
	let position = getCaretPosition(base)

	let leftText  = base.textContent.substring(0, position)
	let rightText = base.textContent.substring(position)

	let temp = base.textContent.substring(position)
	base.textContent = base.textContent.substring(0, position)

	base.parentElement.insertBefore(subfield, base.nextSibling)
	subfield.firstChild.firstChild.focus()
	let prodolzhenie = createInputSubfield(base.parentElement).firstElementChild
	prodolzhenie = prodolzhenie.children[0]
	prodolzhenie.textContent = temp;
	base.parentElement.insertBefore(prodolzhenie, subfield.nextSibling)

	return subfield
}

function insertSub(base) {

	let subfield = document.createElement("span")
	subfield.contentEditable = "true"
	subfield.className = "ftText"
	subfield.spellcheck = false

	subfield.addEventListener("keydown", function (event) {

		if(event.keyCode === 13) //enter
			event.preventDefault()

		if(event.keyCode === 37 || event.keyCode === 40) { //left
			if(getCaretPosition(subfield) == 0) {
				event.preventDefault()
				let target = previousSubfield(subfield)

				if(target.nodeName != "SPAN")
					return

				moveCaretToEnd(target)
			}
		}

		if(event.keyCode === 39 || event.keyCode === 40 || event.keyCode === 38) { //right
			if(getCaretPosition(subfield) == subfield.textContent.length) {

				event.preventDefault()

				let target = nextSubfield(subfield)
				if(target.nodeName != "SPAN")
					return
				if(target.style.display == "none")
					target.style.display = "inline-block"

				target.focus()
			}
		}

		if (event.keyCode === 8) { //backspace
			if(subfield.textContent == "") {
				event.preventDefault()
				moveCaretToEnd(previousSubfield(subfield))
				subfield.parentElement.remove()
			}
		}
	})

	let wrapper = document.createElement('div')
	wrapper.className = "ftSub"
	wrapper.appendChild(subfield)
	let position = getCaretPosition(base)
	let temp = base.textContent.substring(position)
	base.textContent = base.textContent.substring(0, position)
	base.parentElement.insertBefore(wrapper, base.nextSibling)
	subfield.focus()
	let prodolzhenie = createInputSubfield(base.parentElement).firstElementChild
	prodolzhenie = prodolzhenie.children[0]
	prodolzhenie.textContent = temp;
	base.parentElement.insertBefore(prodolzhenie, subfield.nextSibling)
}

function nextSubfield(base) {

	if(base.className == "ftContainer")
		return base

	if(!base.nextSibling) {
		return nextSubfield(base.parentElement)
	}
	
	return findInnerSubfieldLeft(base.nextSibling)
}

function previousSubfield(base) {

	if(base.className == "ftContainer")
		return base

	if(!base.previousSibling)
		return previousSubfield(base.parentElement)

	return findInnerSubfieldRight(base.previousSibling)
}

function findInnerSubfieldLeft(base) {

	if(base.firstElementChild) {
		return findInnerSubfieldLeft(base.firstElementChild)
	}

	if(base.nodeName == "SPAN" && base.style.visibility != "hidden") 
		return base

	return nextSubfield(base)	
}

function findInnerSubfieldRight(base) {
	
	if(base.lastElementChild)
		return findInnerSubfieldRight(base.lastElementChild)
	
	if(base.nodeName == "SPAN" && base.style.visibility != "hidden")
		return base
	
	return previousSubfield(base)
}

function renderSubfields(element, depth, font) {

	let children = element.children

	let red = false

	for(let i=0; i<children.length; i++) {
		
		if(children[i].firstElementChild) {
			red = false
			renderSubfields(children[i])
		}
		else {
			if(red) {
				children[i-1].textContent += children[i].textContent;
				children[i].remove()
				moveCaretToEnd(children[i-1])
				red = false
			}
			else {
				red = true
				if(i == 0 && children.length == 1) {
					if(!children[i].textContent) {
						if(document.activeElement !== children[i]) {
							children[i].style.backgroundColor = "rgba(0,0,0,0.08)";
						}
						else {
							children[i].style.backgroundColor = "rgba(0,0,0,0.04)";
						}
					}
					else {
						children[i].style.backgroundColor = "transparent";
					}
				}
				else {
					if(!children[i].textContent) {
						if(document.activeElement === children[i]) {
							children[i].style.backgroundColor = "rgba(0,0,0,0.04)";
						}
						else {
							children[i].style.backgroundColor = "transparent";
						}
					}
					else {
						children[i].style.backgroundColor = "transparent";
					}
				}
				if(children.length > i+1) {
					if(children[i+1].className == "ftFraction" || children[i+1].className == "ftRoot") {
						children[i].style.backgroundColor = "transparent";
						if(!children[i].textContent) {
							if(document.activeElement !== children[i]) {
								children[i].style.display = "none"
							}
							else {
								children[i].style.backgroundColor = "rgba(0,0,0,0.04)";
							}							
						}
					}
				}
				if(i > 0) {
					if(children[i-1].className == "ftFraction" || children[i-1].className == "ftExponent" || children[i-1].className == "ftRoot") {
						children[i].style.backgroundColor = "transparent";
						if(!children[i].textContent) {
							if(document.activeElement !== children[i]) {
								children[i].style.display = "none"
							}
							else {
								children[i].style.backgroundColor = "rgba(0,0,0,0.04)";
							}							
						}
					}
				}
				if(i > 0 && children.length > i+1) {
					if(children[i-1].className == "ftSub" && children[i+1].className == "ftExponent") {
						children[i].style.backgroundColor = "transparent";
						if(!children[i].textContent) {
							if(document.activeElement !== children[i]) {
								children[i].style.display = "none"
								children[i+1].style.marginLeft = "-0.5em"
							}
							else {
								children[i].style.backgroundColor = "rgba(0,0,0,0.04)";
								children[i+1].style.marginLeft = "0px"
							}							
						}
					}
				}
			}
		}
	}
} 

function returnParsedInput(element) {
	let result = parsedInput(element.firstElementChild)
	return result
}

function parsedInput(element) {

	let string = ""

	let children = element.children

	if(element.className == "ftRoot") {
		let section1 = parsedInput(children[0])
		let section2 = parsedInput(children[1])
		return "nthroot(" + section1 + "," + section2 + ")";
	}

	if(element.className == "ftFraction") {
		let section1 = parsedInput(children[0])
		let section2 = parsedInput(children[1])
		return "((" + section1 + ")/(" + section2 + "))";
	}

	if(element.className == "ftExponent") {
		let section = parsedInput(children[0])
		return "^(" + section + ")";
	}

	if(element.className == "ftSub") {
		let section = parseSection(children[0].textContent, "ftSub")
		return "_" + section;
	}

	for(let i=0; i<children.length; i++) {

		if(children[i].firstElementChild) {
			let section = parsedInput(children[i])
			string += section
		}
		else { 
			string += parseSection(children[i].textContent, element.className);
		}
	}
	return string
}

function changeInputValue(input, value) {

	let children = input.firstElementChild.children

	for(let i=0; i<children.length-1; i++) {
		input.removeChild(children[1])
	}

	children[0].textContent = value
}

function focusOnInput(input) {	

	console.log(input)
	
	if(input.nodeName === "SPAN") {
		input.focus()
		return
	}

	input = findInnerSubfieldRight(input.firstElementChild)

	input.style.display = "inline-block"

	moveCaretToEnd(input)
}

export {createInputField, renderSubfields, returnParsedInput, moveCaretToEnd, insertSub, focusOnInput}