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

	let sliderContainer = document.createElement("div")
	let slider = document.createElement("input")
	slider.type = "range"
	slider.min = -5
	slider.max = 5
	slider.value = 0
	slider.step = 0.1
	sliderContainer.appendChild(slider)
	slider.className = "slider"
	sliderContainer.className = "sliderContainer"

	let animationContainer = document.createElement("div")
	animationContainer.className = "animationContainer"

	let animationText = document.createElement("div")
	animationText.className = "animationText"
	animationText.innerHTML = "Animate"

	let animationButton = document.createElement("div")
	animationButton.innerHTML = '<i class="far fa-play-circle"></i>'
	animationButton.className = "animationButton"
	animationButton.name = ""

	slider.oninput = () => {
		let inputValue = input.value
		input.value = inputValue.substring(0, inputValue.indexOf("=") + 1) + " " + slider.value;
		text.innerHTML = "Value: " + slider.value;
		variables[contains(variables, "name", slider.id.substring(2))].value = Number(slider.value)
		draw()
	}

	animationButton.onclick = () => {
		if(!animationButton.name) {
			animations.splice(contains(animations, "id", animationButton.name))
			return
		}
		animationButton.name = ''
		animations.push(animateVariable(slider.id))
		animate()
	}

	color.onclick = () => {

		let pickedColor = prompt("Color")

		if(!pickedColor)
			pickedColor = getRandomColor()

		let value = input.value
		value = parseInput(value).name

		let index = contains(functions, "name", value)
		functions[index].color = pickedColor
		color.style.borderColor = pickedColor
		draw()
	}

	input.addEventListener("keyup", function(event) {

		if (event.keyCode !== 13) {
			return
		}

		zapamti = this

  	event.preventDefault()

  	console.log("=======================================================================")

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
  		if(results[i] === 1)
  			children[i].children[0].style.backgroundColor = "rgba(255,255,255,0.7)"
  		else if (results[i]) {
  			this.value = results[i] + "(x) = " + this.value
  			children[i].children[0].style.backgroundColor = "rgba(255,255,255,0.7)"
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

			this.nextSibling.children[0].innerHTML = "Parsed: " + object.readable

			console.log(functions)

			let index = contains(functions, "name", object.name)

			this.nextSibling.children[1].style.borderColor = functions[index].color
  			this.nextSibling.children[2].style.display = "none"
  			this.nextSibling.children[3].style.display = "none"
		}
		else {
  			this.nextSibling.children[0].innerHTML = "Value:  "+object.value
  			this.nextSibling.children[1].style.display = "none"
  			this.nextSibling.children[2].children[0].value = object.value
  			this.nextSibling.children[2].children[0].id = "1_" + object.name
  			this.nextSibling.children[3].children[1].name = "1_" + object.name
		}

		zapamti = this

		this.nextSibling.style.display = "block"

	});


	  			// this.nextSibling.children[0].innerHTML = "Parsed: "+object.readable
	  			// this.nextSibling.children[1].style.borderColor = object.color

	  			// start(drawFunctionInit(object))
  				// this.nextSibling.children[1].style.display = "block"

	container.appendChild(text)
	color.appendChild(colorText)
	color.appendChild(colorButton)
	container.appendChild(color)
	container.appendChild(sliderContainer)
	animationContainer.appendChild(animationText)
	animationContainer.appendChild(animationButton)
	container.appendChild(animationContainer)
	element.appendChild(input)
	element.appendChild(container)
	document.getElementById("commandContainer").appendChild(element)
}

function checkAddField() {
	
	let children = document.getElementById("commandContainer").children

	if(children.length < functions.length + variables.length - 2)
		createField()
}

function roundToNumber(toRound, number) {
	return toRound - (toRound%number)
}

function nearestTen(number) {
	number = Math.abs(number)
	return Math.pow(2, Math.floor( Math.log(number)/Math.log(2) ));
}

function getFreeName() {

	let letters = "fgh"

	for(let i=0; i<letters.length; i++) {
		if(contains(functions, "name", letters[i]) == -1)
			return letters[i]
	}

	let i = 1

	while(contains(functions, "name", "f"+i) != -1)
		i++

	return "f"+i;
}

function enableInputs() {

	let fields = document.getElementById("commandContainer").children

	for(let i=0; i<fields.length; i++) {
		fields[i].children[0].disabled = false
		fields[i].children[0].style.color = "black"
	}

	zapamti.focus()
}


function disableInputs() {

	let fields = document.getElementById("commandContainer").children

	for(let i=0; i<fields.length; i++) {
		fields[i].children[0].disabled = true
		fields[i].children[0].style.color = "rgba(0,0,0,0.7)"
	}
}