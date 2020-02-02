function checkAddField() {
	
	let children = document.getElementById("commandContainer").children

	let br = 0

	for(let i=0; i<children.length; i++) {
		if(!children[i].children[0].value)
			br++
	}

	if(br < 2)
		createField()
}

function roundToNumber(toRound, number) {
	return toRound - (toRound%number)
}

function nearestToBase(number, base) {
	number = Math.abs(number)
	return Math.pow(base, Math.floor( Math.log(number)/Math.log(base) ));
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
  
  let index = 1 + Math.floor(Math.random() * (light.colors.length-1))

  return light.colors[index]

  //return "hsl("+(Math.random()*360)+", 80%, 50%)";
}

function transition() {

	animations = []

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
			if(transitions[0]() == -1) {
				transitions.splice(0, 1)
			}
			draw()
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
		if(elements[i].children[1]) {
			elements[i].children[1].style.display = "none"
			
			if(elements[i].children[1].children[1].children[2]) {
				elements[i].children[1].children[1].children[2].style.display = "none"
			}
		}
}


function getFreeId() {
	for(let i=0; i<fields.length; i++)
		if(fields[i] == null)
			return i
	return fields.length
}

function stopAnimation(animationContainer) {

	let index = contains(animations, "id", animationContainer.name);

	if(index == -1)
		return

	animations.splice(index, 1);

	animationContainer.children[1].innerHTML = '<i class="far fa-play-circle"></i>'

	// animations.push(animateVariable(container))

}

function formatNumber(a, nIncrement) {

	a = Number(a)

	if(a == 0)
		return 0

	if(nIncrement < 0.01)
		a = a.toExponential(3)
	else if(nIncrement > 100)
		a = a.toExponential(0)

	a = String(a)

	if(a.indexOf('e') != -1) {
		a = a.replace("e", "*10^")
	}

	return a
}
