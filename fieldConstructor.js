function createField() {

	let element = document.createElement("div")
	element.className = "field"
	element.id = -1

	let input = document.createElement("input")
	input.type = "text"
	input.className = "fieldInput"
	input.placeholder = "insert expression"
	input.spellcheck = 0

	let container = document.createElement("div")
	container.className = "fieldSubContainer"

	let text = document.createElement("div")
	text.className = "fieldText"

	let color = document.createElement("div")
	color.className = "fieldColor"

	let colorText = document.createElement("div")
	colorText.className = "fieldColorText"
	colorText.innerHTML = "Color"

	let colorButton = document.createElement("div")
	colorButton.innerHTML = '<i class="far fa-edit"></i>'
	colorButton.className = "fieldColorButton"

	let colorPalette = document.createElement("div")
	colorPalette.className = "colorPalette"

	for(let i=0; i<light.colors.length; i++) {
		
		let colorOption = document.createElement("div")

		colorOption.className = "colorOption"

		colorOption.style.backgroundColor = light.colors[i]

		colorOption.onclick = () => {

			let pickedColor = light.colors[i]
			
			let value = input.value
			value = parseInput(value).name

			let index = contains(functions, "name", value)
			functions[index].color = pickedColor
			input.style.borderLeft = "10px solid " + pickedColor

			draw()
		}

		colorPalette.appendChild(colorOption)
	}

	let sliderContainer = document.createElement("div")
	let slider = document.createElement("input")
	slider.type = "range"
	slider.min = -5
	slider.max = 5
	slider.value = 0
	slider.step = 0.01
	sliderContainer.appendChild(slider)
	slider.className = "slider"
	sliderContainer.className = "sliderContainer"

	let animationContainer = document.createElement("div")
	animationContainer.className = "animationContainer"

	let animationText = document.createElement("div")
	animationText.className = "animationText"
	animationText.innerHTML = "Animate"

	let animationToggle = document.createElement("div")
	animationToggle.innerHTML = '<i class="far fa-play-circle"></i>'
	animationToggle.className = "animationButton"

	let animationEditContainer = document.createElement("div")
	animationEditContainer.className = "animationEditContainer"
	let animationEditButton = document.createElement("div")
	animationEditButton.innerHTML = '<i class="fas fa-pencil-alt"></i>'
	animationEditButton.className = "animationEditButton"

	animationEditButton.onclick = () => {
		let status = animationEditContainer.style.display

		if(status == "block")
			animationEditContainer.style.display = "none";
		else
			animationEditContainer.style.display = "block";
	}

	let animationEditMin   = document.createElement("div")
	let animationEditMax   = document.createElement("div")
	let animationEditSpeed = document.createElement("div")
	let animationEditStep  = document.createElement("div")

	let animationInputMin  = document.createElement("input")
	let animationInputMax  = document.createElement("input")
	let animationInputStep = document.createElement("input")

	let animationInputSpeed = document.createElement("input")

	animationInputMin.type  = "text"
	animationInputMin.value = -5
	animationInputMin.oninput = () => {
		slider.min = Number(animationInputMin.value);
		slider.value = Number(animationInputMin.value)
		input.value = animationContainer.name + " = " + slider.value;
		text.innerHTML = "Value: " + slider.value;
		variables[contains(variables, "name", animationContainer.name)].value = Number(slider.value)
		stopAnimation(animationContainer);
		draw()
	}
	animationInputMax.type  = "text"
	animationInputMax.value = 5
	animationInputMax.oninput = () => {
		slider.max = Number(animationInputMax.value); 
		slider.value = Number(animationInputMin.value)
		input.value = animationContainer.name + " = " + slider.value;
		text.innerHTML = "Value: " + slider.value;
		variables[contains(variables, "name", animationContainer.name)].value = Number(slider.value)
		stopAnimation(animationContainer)
		draw()
	}
	animationInputStep.type = "text"
	animationInputStep.value= 0.1

	animationInputSpeed.type = "range"
	
	animationEditMin.appendChild(document.createTextNode("Min "))
	animationEditMin.appendChild(animationInputMin)
	animationEditMax.appendChild(document.createTextNode("Max "))
	animationEditMax.appendChild(animationInputMax)
	// animationEditStep.appendChild(document.createTextNode("Step "))
	// animationEditStep.appendChild(animationInputStep)

	animationEditSpeed.appendChild(document.createTextNode("Speed "))
	animationInputSpeed.min  = 1
	animationInputSpeed.max  = 10
	// animationInputSpeed.step = 1
	animationInputSpeed.value= 5
	animationInputSpeed.oninput = () => {
		let index = contains(animations, "id", animationContainer.name)

		if(index != -1) {
			animations[index].speed = Math.sign(animations[index].speed)*animationInputSpeed.value
		}

		animate()
	}
	animationInputSpeed.className = "slider"
	animationEditSpeed.className  = "sliderContainer"
	animationEditSpeed.appendChild(animationInputSpeed)

	animationEditContainer.appendChild(animationEditMin)
	animationEditContainer.appendChild(animationEditMax)
	// animationEditContainer.appendChild(animationEditStep)
	animationEditContainer.appendChild(animationEditSpeed)

	slider.oninput = () => {

		if(contains(animations, 'id', animationContainer.name) != -1)
			stopAnimation(animationContainer)

		let inputValue = input.value
		input.value = animationContainer.name + " = " + slider.value;
		text.innerHTML = "Value: " + slider.value;
		variables[contains(variables, "name", animationContainer.name)].value = Number(slider.value)
		draw()
	}

	animationToggle.onclick = () => {

		let index = contains(animations, "id", animationContainer.name)

		if(index == -1) {
			animations.push(animateVariable(animationContainer))
			animationToggle.innerHTML = '<i class="far fa-pause-circle"></i>'
		}
		else {
			animations.splice(index, 1)
			animationToggle.innerHTML = '<i class="far fa-play-circle"></i>'
		}

		animate()
	}

	colorButton.onclick = () => {

		let status = colorPalette.style.display

		if(status == "block")
			colorPalette.style.display = "none";
		else
			colorPalette.style.display = "block";

		// let pickedColor = prompt("Color")

		// if(!pickedColor)
		// 	pickedColor = getRandomColor()

		// let value = input.value
		// value = parseInput(value).name

		// let index = contains(functions, "name", value)
		// functions[index].color = pickedColor
		// color.style.borderColor = pickedColor
		// draw()
	}

	input.addEventListener("keyup", function(event) {

		if (event.keyCode !== 13) {
			if(event.keyCode === 38) { // up
				if(this.parentElement.previousSibling) {
					container.parentElement.parentElement.insertBefore(this.parentElement, this.parentElement.previousSibling)
				}
			} 
			if(event.keyCode === 40) { // down
				if(this.parentElement.nextSibling) {
					container.parentElement.parentElement.insertBefore(this.parentElement.nextSibling, this.parentElement)
				}
			}

			return
		}

		zapamti = this
		zapamti.focus()

  	event.preventDefault()

  	//console.log("==================================================================")

  	if(transitions.length)
  		return

  	let novi = []

  	let children = this.parentElement.parentElement.children

  	for(let i=0; i<children.length; i++) {
  		if(children[i].children[0].value) {
  			novi.push(children[i].children[0].value)
  		}
  		else
  			novi.push("")
  	}

  	let results = processInputs(novi)

  	for(let i=0; i<results.length; i++) {
  		if(results[i] === 1) {
  			children[i].children[0].style.backgroundColor = "transparent"
  			if(!novi[i])
  				children[i].children[0].style.borderLeft = "10px solid rgba(0,0,0,0.07)"
  		}
  		else if (results[i]) {
  			this.value = results[i] + "(x) = " + this.value
  			children[i].children[0].style.backgroundColor = "transparent"
  		}
  		else
  			children[i].children[0].style.backgroundColor = "rgba(240,20,60,0.4)"
  	}

  	checkAddField()
  	draw()

  	this.blur()
  	this.focus()

	});

	input.addEventListener("focus", function (event) {

		hideInfo()

		if(!this.value)
			return

		let object = parseInput(this.value)

		if(!object) {
			return
		}

		if(object.f) {

			this.nextSibling.children[0].innerHTML =  object.readable

			//console.log(functions)

			let index = contains(functions, "name", object.name)

			// this.nextSibling.children[1].style.borderColor = functions[index].color
			input.style.borderLeft = "10px solid " + functions[index].color
			// input.style.boxShadow = "0px -7px 3px -5px inset " + functions[index].color
			this.nextSibling.children[1].style.display = "block"
  			this.nextSibling.children[2].style.display = "none"
  			this.nextSibling.children[3].style.display = "none"
		}
		else {
  			// this.nextSibling.children[0].innerHTML = "Value:  "+object.value
  			input.style.borderLeft = "10px solid rgba(0,0,0,0.07)"
  			this.nextSibling.children[0].style.display = "none"
  			this.nextSibling.children[1].style.display = "none"
  			this.nextSibling.children[2].children[0].value = object.value
  			// this.nextSibling.children[2].children[0].id = "1_" + object.name
  			this.nextSibling.children[3].name = object.name
  			this.nextSibling.children[2].style.display = "block"
  			this.nextSibling.children[3].style.display = "block"
		}

		zapamti = this

		this.nextSibling.style.display = "block"

	});


	  			// this.nextSibling.children[0].innerHTML = "Parsed: "+object.readable
	  			// this.nextSibling.children[1].style.borderColor = object.color

	  			// start(drawFunctionInit(object))
  				// this.nextSibling.children[1].style.display = "block"
  				// text.style.display = "none"
	container.appendChild(text)
	color.appendChild(colorText)
	color.appendChild(colorButton)
	color.appendChild(colorPalette)
	container.appendChild(color)
	container.appendChild(sliderContainer)
	animationContainer.appendChild(animationText)
	animationContainer.appendChild(animationToggle)
	animationContainer.appendChild(animationEditButton)
	animationContainer.appendChild(animationEditContainer)
	container.appendChild(animationContainer)
	element.appendChild(input)
	element.appendChild(container)
	document.getElementById("commandContainer").appendChild(element)
}