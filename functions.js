function createField() {

	let element = document.createElement("div")
	element.className = "field"
	element.id = -1

	let input = document.createElement("input")
	input.type = "text"
	input.className = "fieldInput"
	input.placeholder = "insert expression"
	input.spellcheck = 0
	input.onfocus = () => {
		hideInfo()
		if(element.id != -1) {
			container.style.display = "block"
			skrieni = 0
		}
	}

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

	color.onclick = () => {
		let input = prompt("Color")
		fields[element.id].color = input
		functions[fields[element.id].id].color = input
		color.style.borderColor = input
		draw()
	}

	input.addEventListener("keyup", function(event) {

	  if (event.keyCode === 13) {

	  	event.preventDefault()

	  	let id = this.parentElement.id

	  	let inputEmpty = this.value == ""

	  	if(id == -1 && !inputEmpty) {
	  		
	  		let object = parseInput(this.value)

	  		if(!object) {
	  			alert("Neshto ne e u red")
	  			return
	  		}

	  		id = getFreeId()

	  		fields[id] = object

	  		if(fields[id].f) {

	  			if(contains(functions, "name", object.name)) {
	  				alert("Vekje definirano")
	  				return
	  			}

	  			fields[id] = object
	  			object.id = functions.length
	  			functions.push(object)

	  			this.nextSibling.children[0].innerHTML = "Parsed: "+object.readable
	  			this.nextSibling.children[1].style.borderColor = object.color

	  			animations.push(drawFunctionInit(object))
	  		}
	  		else {

	  			if(contains(variables, "name", object.name)) {
	  				alert("Vekje definirano")
	  				return
	  			}

	  			fields[id] = object
	  			object.id = variables.length
	  			variables.push(object)

	  			this.nextSibling.children[0].innerHTML = "Value:  "+object.value
	  			this.nextSibling.children[1].style.display = "none"

	  			draw()
	  		}

	  		container.style.display = "block"
	  		skrieni = 0

	  		this.parentElement.id = id

	  		animate()
	  	}
	  	else if(id != -1 && !inputEmpty){

	  		let object = parseInput(this.value)

	  		object.id = fields[id].id

	  		if(!fields[id].f == !object.f) {

	  			if(fields[id].f) {

	  				if(fields[id].name == object.name || !isNaN(fields[id].name[0]) && !isNaN(object.name[0])) {

	  					object.color = fields[id].color
	  					animations.push(drawFunctionTransition(fields[id], object))
	  					fields[id] = object

	  					this.nextSibling.children[0].innerHTML = "Parsed: "+object.readable
	  				}
	  				else {

	  					animations.push(drawFunctionClosure(functions[fields[id].id]))
		  				fields[id] = null

		  				id = getFreeId()
		  				fields[id] = object
			  			object.id = functions.length
			  			functions.push(object)

			  			this.nextSibling.children[0].innerHTML = "Parsed: "+object.readable
			  			this.nextSibling.children[1].style.borderColor = object.color

		  				animations.push(drawFunctionInit(object))
	  				}

	  			}
	  			else {

					fields[id] = object
	  	  			variables[fields[id].id] = object

	  	  			this.nextSibling.children[0].innerHTML = "Value:  "+object.value

	  	  			draw()
	  			}
	  		}
	  		else {


		  		if(!fields[id].f) {

		  			variables.splice(fields[id].id)
	
		  			fields[id] = object

		  			if(contains(functions, "name", object.name)) {
		  				alert("Vekje definirano")
		  				return
		  			}

		  			fields[id] = object
		  			object.id = functions.length
		  			functions.push(object)

		  			this.nextSibling.children[0].innerHTML = "Parsed: "+object.readable
		  			this.nextSibling.children[1].style.borderColor = object.color

		  			animations.push(drawFunctionInit(object))
	  				this.nextSibling.children[1].style.display = "block"

		  		}
		  		else {

		  			if(contains(variables, "name", object.name)) {
		  				alert("Vekje definirano")
		  				return
		  			}

		  			animations.push(drawFunctionClosure(functions[fields[id].id]))

		  			fields[id] = object
		  			object.id = variables.length
		  			variables.push(object)

		  			this.nextSibling.children[0].innerHTML = "Value:  "+object.value
		  			this.nextSibling.children[1].style.display = "none"
		  			draw()
		  		}

	  		}

	  		this.parentElement.id = id
  			
	  		animate()
	  	}
	  	else {

	  		if(fields[id].f) {

		  		animations.push(drawFunctionClosure(functions[fields[id].id]))

		  		fields[id] = null

	  			animate()


		  		this.nextSibling.children[1].style.borderColor = "transparent"
	  		
	  		}
	  		else {

	  			variables.splice(fields[id].id, 1)
	  			fields[id] = null
	  		}

  			this.parentElement.id = -1

	  		this.blur()
	  		container.style.display = "none"
	  	}

	  	checkAddField()
	  	draw()
	  }
	});

	container.appendChild(text)
	color.appendChild(colorText)
	color.appendChild(colorButton)
	container.appendChild(color)
	element.appendChild(input)
	element.appendChild(container)
	document.getElementById("commandContainer").appendChild(element)
}

function checkAddField() {
	
	let children = document.getElementById("commandContainer").children
	let br = 0

	for(let i=0; i<children.length; i++) {
		if(children[i].id == -1)
			br++
	}

	if(br == 0)
		createField()
}

function roundToNumber(toRound, number) {
	return toRound - (toRound%number)
}

function nearestTen(number) {
	number = Math.abs(number)
	return Math.pow(2, Math.floor( Math.log(number)/Math.log(2) ));
	if(broj > 5 || broj < 0.26)
		return Math.pow(10, Math.floor( Math.log(number)/Math.log(10) ))
	else
		return broj
}