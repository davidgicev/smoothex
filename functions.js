function createField() {

	let element = document.createElement("div")
	element.className = "field"
	element.id = -1

	let input = document.createElement("input")
	input.type = "text"
	input.className = "fieldInput"
	input.placeholder = "insert function"
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

	color.onclick = () => {
		let input = prompt("Color")
		functions[element.id].color = input
		color.style.backgroundColor = input
		draw()
	}

	input.addEventListener("keyup", function(event) {

	  if (event.keyCode === 13) {

	  	event.preventDefault()

	  	let id = this.parentElement.id
	  	let freeId = getFreeId()

	  	let empty = this.value == ""

	  	if(id == -1 && !empty) {
	  		let color = getRandomColor()
	  		eval("animations.push(drawFunctionInit({f: x => " + parseInput(this.value) + ", color:'"+color+"', id: "+freeId+"}));")
	  		this.parentElement.id = freeId
	  		this.nextSibling.children[0].innerHTML = "Parsed: "+parseInput(this.value)
	  		this.nextSibling.children[1].style.backgroundColor = color
	  		this.nextSibling.children[1].innerHTML = "Color"
	  		container.style.display = "block"
	  		skrieni = 0
	  		animate()
	  	}
	  	else if(id != -1 && !empty){
  			eval("animations.push(drawFunctionTransition(functions["+id+"], x => " + parseInput(this.value) + ", "+id+"));")
	  		functions[id].hidden = true
	  		animate()
  			this.nextSibling.children[0].innerHTML = "Parsed: "+parseInput(this.value)
	  	}
	  	else {
  			eval("animations.push(drawFunctionClosure(functions["+id+"]));")
  			animate()
  			functions[id] = null;
  			this.parentElement.id = -1
  			this.nextSibling.children[0].innerHTML = ""
	  		this.nextSibling.children[1].style.backgroundColor = "transparent"
	  		this.nextSibling.children[1].innerHTML = ""
	  		container.style.display = "none"
	  		this.blur()
	  	}

	  	checkAddField()

	  	draw()
	  }
	});

	container.appendChild(text)
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