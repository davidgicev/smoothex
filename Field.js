import {createField} from './fieldConstructor.js';
import {renderSubfields, insertSub, focusOnInput, moveCaretToEnd} from './fensitex.js';
import {getFreeName, getRandomColor, blurFields, checkAddField, handleNav, handleDelete} from './FieldManager.js';
import {pushNew, functions, variables} from './itemClass.js';
import {drawFunctionInit, drawFunctionTransition, drawVariableTransition, toggleAnimation, changeAnimationSpeed} from './animationClass.js'
import {config} from './app.js'
import {initializeFunctionCache} from './drawHandler.js'
import {FensiInput} from './fensitex/index.js'
import {runInterpreter} from './interpreter.js'
import './FieldHtml.js'

function Field(dictionary) {

	this.id = Math.round(Math.random()*100000)
	console.log(this.id)
	this.object = {};
	this.objectReference = {};
	this.index = -1;

	this.input = new FensiInput(this, dictionary)
	this.html = {};

	this.generateHtml()
	this.type = 'constant';


	Object.defineProperty(this, "object", {
		get: function () {
			return this.objectReference;
		},
		set: function (updated) {

			let isFunction = Boolean(updated.f);

			if(!this.objectReference.name || !updated.name) {
				this.initialize(updated)
				return
			}
			
			if(this.isFunction != isFunction) {
				this.initialize(updated)
				return
			}

			this.update(updated)
		},
		
	})

	Object.defineProperty(this, "value", {
		get: function () {
			return this.objectReference.value;
		},
		set: function (updated) {
			if(this.valueReference == updated) {
				return;
			}
			this.objectReference.value = updated;
			this.updateVarElements()
		}
	})
}

Field.prototype.submit = function() {
	runInterpreter();
	this.focus()
}

Field.prototype.compile = function(strict) {
	return this.input.compile(strict)
}

Field.prototype.getDefinand = function() {
	return this.input.getDefinand()
}

Field.prototype.getOccurrences = function() {
	return this.input.getOccurrences()
}

Field.prototype.refresh = function() {
	this.input.refresh()
}

Field.prototype.initialize = function(updated) {
	// console.log("init")
	let isFunction = this.isFunction = Boolean(updated.f);
	if(isFunction) {
		updated.hidden = updated.f.length != 1;
		if(!updated.name) {
			this.objectReference.name = updated.name = getFreeName();
			this.updateFuncName();
		}
		this.index = functions.length
		pushNew({
			...updated,
			color: getRandomColor(),
		})
		if(!updated.hidden && updated.f.length == 1)
			drawFunctionInit()
		this.objectReference = functions[this.index]
	}
	else {
		if(!updated.name) {
			this.objectReference = {};
			this.populateField();
			return
		}
		this.index = variables.length
		pushNew({
			...updated,
		})
		this.objectReference = variables[this.index]
		this.updateSliderRange()				
	}
	this.populateField()
}

Field.prototype.update = function(updated) {
	// console.log("update")
	let isFunction = updated.f;
	if(isFunction) {
		updated.hidden = updated.f.length != 1;
		this.index = functions.length
		pushNew({
			...updated,
			color: this.objectReference.color,
		})
		// initializeFunctionCache(functions[functions.length-1])
		if(this.objectReference.f.toString() != updated.f.toString() && !updated.hidden && updated.f.length == 1) {
			drawFunctionTransition(this.objectReference)
		}
		this.objectReference = {
			name: this.objectReference.name,
			f: updated.f,
			color: this.objectReference.color,
		}
	}
	else {
		this.index = variables.length
		pushNew({
			...updated,
		})
		if(this.objectReference.value != updated.value) {
			drawVariableTransition(this, updated.value)
		}
		this.objectReference = {
			name: this.objectReference.name,
			value: updated.value
		}
		this.updateSliderRange()				
	}

	this.populateField()
}

Field.prototype.updateVarElements = function() {
	variables[this.index].value = this.objectReference.value;
	this.updateVarInput();
	this.updateVarSlider();
};

Field.prototype.updateVarInput = function() {
	let value = this.object.value
	value = Number.isInteger(value) ? value : value.toFixed(2);
	this.input.updateVariableValue(value)
};

Field.prototype.updateVarSlider = function() {
	this.html.sliderContainer.children[1].value = this.objectReference.value
}

Field.prototype.updateFuncName = function() {
	this.input.updateFunctionName(this.objectReference.name)
}

Field.prototype.updateFuncColor = function(color) {
	this.html.field.style.borderLeft = "10px solid "+color;
	functions[this.index].color = color;
	this.objectReference.color = color;
}

Field.prototype.updateSliderRange = function() {
	let element = this.html.sliderContainer
	let min = element.children[0].textContent;
	let max = element.children[2].textContent;
	min = Math.min(min, this.objectReference.value);
	max = Math.max(max, this.objectReference.value);
	// console.log(min, max)
	element.children[0].textContent = min;
	element.children[2].textContent = max;
	element = element.children[1];
	element.value = this.objectReference.value;
	element.min = min;
	element.max = max;
}

Field.prototype.toggleAnimation = function(stop) {
	let status = toggleAnimation(this, stop)
	let animationToggle = this.html.animationContainer.firstElementChild.children[1]

	if(status) {
		animationToggle.innerHTML = '<i class="far fa-pause-circle"></i>'
	}
	else {
		animationToggle.innerHTML = '<i class="far fa-play-circle"></i>'
	}
	this.input.VirtElement.positionCursorEnd(this.input.HtmlElement)
}

Field.prototype.changeAnimationSpeed = function(value) {
	changeAnimationSpeed(this, value);
}

Field.prototype.populateField = function() {

	let object  = this.object
	let element = this.html

	this.hideError()

	if(!object.name) {
		element.field.classList.remove('activeField')
		element.colorContainer.style.display = 'none'	
		element.animationContainer.style.display = 'none'		
		element.sliderContainer.style.display = 'none'
		element.field.style.removeProperty('border-left')
		return
	}

	if(object.f) {
		element.colorContainer.style.display = 'flex'	
		element.animationContainer.style.display = 'none'		
		element.sliderContainer.style.display = 'none'
		element.field.style.borderLeft = "10px solid "+object.color
	}
	else {
		element.colorContainer.style.display = 'none'	
		element.animationContainer.style.display = 'flex'		
		element.sliderContainer.style.display = 'flex'
		element.field.style.borderLeft = "10px solid gray"


		// element.nextSibling.children[0].style.display = "none"
		// element.nextSibling.children[1].style.display = "none"
		// element.nextSibling.children[2].children[0].value = object.value
		// element.nextSibling.children[3].name = object.name
		// element.nextSibling.children[2].style.display = "flex"
		// element.nextSibling.children[3].style.display = "block"
	}
}

Field.prototype.blur = function() {
	if(this.objectReference.name) {
		this.html.field.classList.remove("activeField")
	}
	this.input.blur()
}

Field.prototype.focus = function(event) {
	blurFields()
	if(this.objectReference.name) {
		this.html.field.classList.add("activeField")
	}
	this.input.focus(event)
	checkAddField(this)
}

Field.prototype.showError = function(error) {
	this.input.HtmlElement.renderError(error)
	this.html.subcontainer.style.display = 'none'
}

Field.prototype.hideError = function() {
	this.input.HtmlElement.clearError()
	this.html.subcontainer.style.removeProperty('display')
}

Field.prototype.handle = function(ref, event, sourceID) {

	if(event.keyCode == 40) {	// down
		handleNav(this, 1)
		return
	}

	if(event.keyCode == 38) {	// up
		handleNav(this, -1)
		return
	}

	return
}

Field.prototype.handleDelete = function() {
	handleDelete(this)
}

export {Field};