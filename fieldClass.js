function Field() {

	let field = Application.createField();
	this.id = field.id;
	this.element = field.element;
	// console.log(this.id)
	this.object = {};
	this.objectReference = {};
	this.index = -1;


	this.isFunction = false;

	Object.defineProperty(this, "object", {
		get: function () {
			return this.objectReference;
		},
		set: function (updated) {
			let isFunction = Boolean(updated.f);

			if(!this.objectReference.name) {
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
			this.updateVarElements();
		}
	})

	this.updateSubfields()
}

Field.prototype.initialize = function(updated) {
	// console.log("init")
	let isFunction = this.isFunction = Boolean(updated.f);
	if(isFunction) {
		updated.hidden = updated.f.length != 1;
		if(!updated.name) {
			updated.name = getFreeName();
			this.objectReference.name = updated.name;
			this.updateFuncName();
		}
		this.index = Application.Collection.functions.length
		Application.Collection.push({
			...updated,
			color: getRandomColor(),
		})
		Application.AnimationHandler.drawFunctionInit()
		this.objectReference = Application.Collection.functions[this.index]
	}
	else {
		if(!updated.name)
			return
		this.index = Application.Collection.variables.length
		Application.Collection.push({
			...updated,
		})
		this.objectReference = Application.Collection.variables[this.index]
		this.updateSliderRange()				
	}
	populateField(this)
}

Field.prototype.update = function(updated) {
	// console.log("update")
	let isFunction = updated.f;
	if(isFunction) {
		updated.hidden = updated.f.length != 1;
		this.index = Application.Collection.functions.length
		Application.Collection.push({
			...updated,
			color: this.objectReference.color
		})
		if(this.objectReference.f.toString() != updated.f.toString() && !updated.hidden) {
			Application.AnimationHandler.drawFunctionTransition(this.objectReference)
		}
		this.objectReference = {
			name: this.objectReference.name,
			f: updated.f,
			color: this.objectReference.color
		}
	}
	else {
		this.index = Application.Collection.variables.length
		Application.Collection.push({
			...updated,
		})
		if(this.objectReference.value != updated.value) {
			Application.AnimationHandler.drawVariableTransition(this, updated.value)
		}
		this.objectReference = {
			name: this.objectReference.name,
			value: updated.value
		}
		this.updateSliderRange()				
	}

	populateField(this)
}

Field.prototype.updateVarElements = function() {
	Application.Collection.variables[this.index].value = this.objectReference.value;
	this.updateVarInput();
	this.updateVarSlider();
};

Field.prototype.updateVarInput = function() {
	let element = this.element.firstElementChild.firstElementChild;
	for(let i=0; i<element.children.length; i++) {
		let base = element.children[i];
		if(base.nodeName !== "SPAN")
			continue;
		let index = base.textContent.indexOf("=")
		if(index == -1)
			continue;
		let value = this.object.value;
		value = Number.isInteger(value) ? value : value.toFixed(2);
		base.textContent = base.textContent.substring(0,index+1)+" "+value;
		while(base.nextSibling) {
			element.removeChild(base.nextSibling);
		}
		moveCaretToEnd(base)
	}
};

Field.prototype.updateVarSlider = function() {
	let element = this.element.children[1].children[2].children[1];
	element.value = this.objectReference.value;
}

Field.prototype.updateFuncName = function() {
	let base = this.element.firstElementChild.firstElementChild.firstElementChild;
	base.textContent = this.object.name+"(x) = "+base.textContent;
	while(base.previousSibling) {
		element.removeChild(base.previousSibling);
	}
	base.style.display = "inline-block"
}

Field.prototype.updateFuncColor = function(color) {
	this.element.style.borderLeft = "10px solid "+color;
	Application.Collection.functions[this.index].color = color;
	this.objectReference.color = color;
}

Field.prototype.updateSliderRange = function() {
	let element = this.element.children[1].children[2];
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

Field.prototype.updateSubfields = function() {
	renderSubfields(this.element.firstElementChild, 0, 0)
}

Field.prototype.toggleAnimation = function(stop) {
	let status = Application.AnimationHandler.toggleAnimation(this, stop)
	let animationToggle = this.element.children[1].children[3].children[1]

	if(status) {
		animationToggle.innerHTML = '<i class="far fa-pause-circle"></i>'
	}
	else {
		animationToggle.innerHTML = '<i class="far fa-play-circle"></i>'
	}
}

Field.prototype.changeAnimationSpeed = function(value) {

	Application.AnimationHandler.changeAnimationSpeed(this, value);

}