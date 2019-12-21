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

function pan() {

	xInterval -= (mouseX - lastMouseX)/scale
	yInterval -= (mouseY - lastMouseY)/scale

	lastMouseX = mouseX
	lastMouseY = mouseY

	draw()
}


function getRandomColor() {
  return "hsl("+(Math.random()*360)+", 80%, 50%)";
}

function transition() {

	disableInputs()

	let object = {
		main: function () {

			currentTime = (new Date()).getTime()
			delta = currentTime - lastTime;

			if(delta < INTERVAL) {
				requestAnimationFrame(this.main);
				return
			}

			lastTime = currentTime - (delta % INTERVAL)

			if(transitions.length)
				requestAnimationFrame(this.funk)
			else {
				enableInputs()
				return
			}

			requestAnimationFrame(this.main)
		},
		funk: function() {
			draw()
			if(transitions[0]() == -1) {
				transitions.splice(0, 1)
			}
		}
	}
	object.main = object.main.bind(object)
	object.main()
}

function animate() {

	let object = {
		main: function () {

			currentTime = (new Date()).getTime()
			delta = currentTime - lastTime;

			if(delta < INTERVAL) {
				requestAnimationFrame(this.main);
				return
			}

			lastTime = currentTime - (delta % INTERVAL)

			if(animations.length)
				requestAnimationFrame(this.funk)
			else {
				return
			}

			requestAnimationFrame(this.main)
		},
		funk: function() {
			draw()
			for(let i=0; i<animations.length; i++) {
				if(animations[i].f() == -1)
					animations.splice(i, 1)
			}
		}
	}
	object.main = object.main.bind(object)
	object.main()
}

function hideInfo() {
	let elements = document.getElementById("commandContainer").children
	for(let i=0; i<elements.length; i++)
		if(elements[i].children[1])
			elements[i].children[1].style.display = "none"
}


function getFreeId() {
	for(let i=0; i<fields.length; i++)
		if(fields[i] == null)
			return i
	return fields.length
}