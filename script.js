var windowWidth  = window.innerWidth;
var windowHeight = window.innerHeight;

var canvas = document.getElementById("screen");

canvas.width  = windowWidth
canvas.height = windowHeight

var xAxis = windowHeight/2
var screenWidth = windowWidth
var commandContainerRatio = 0.2
var scale = Math.max(windowWidth, windowHeight)/13
var xInterval = -windowWidth/scale/2 - windowWidth*commandContainerRatio/scale/2
var yInterval = -windowHeight/scale/2

var variables = [{
	name: "x",
	value: null
}]

var skrieni = 1

var light = {
	background: "white",
	axes: "black",
	font: "gray"
}

var dark = {
	background: "black",
	axes: "white",
	font: "white"
}

var theme = light;


var POCHETEN = scale

var functions = [{
		name: "sin",
		f: Math.sin
	},
	{
		name: "cos",
		f: Math.cos
	},
	{
		name: "tan",
		f: Math.tan
	},
	{
		name: "cotan",
		f: x => 1/Math.tan(x)
	}]

var zapamti;

document.getElementById("window").style.width  = windowWidth  + "px"
document.getElementById("window").style.height = windowHeight + "px"

document.getElementById("commandContainer").style.width  = windowWidth*commandContainerRatio + "px"
document.getElementById("commandContainer").style.height = windowHeight     + "px"

//document.getElementById("commandContainer").style.backgroundColor = theme.background;

initCommands()
draw()

function initCommands() {

	let container = document.getElementById("commandContainer")

	createField()
	createField()
	createField()

	container.children[0].children[0].focus()
}

var nIncrement = 0.01
function pan() {

	xInterval -= (mouseX - lastMouseX)/scale
	yInterval -= (mouseY - lastMouseY)/scale

	//xInterval  -= (mouseX - lastMouseX)/scale


	lastMouseX = mouseX
	lastMouseY = mouseY

	draw()
}

document.getElementById("screen").addEventListener("mousemove", (event) => {
	mouseX = event.clientX
	mouseY = event.clientY
	if(isMouseDown) {
		pan()
	}
})

document.getElementById("screen").addEventListener("mousedown", (event) => {
	lastMouseX = mouseX
	lastMouseY = mouseY
	isMouseDown = true
	hideInfo()
})

document.getElementById("screen").addEventListener("mouseup", (event) => {
	isMouseDown = false
})

document.getElementById("screen").addEventListener("wheel", (event) => {

	let dodadenZoom = -0.05*Math.sign(event.deltaY)

	xInterval += mouseX/scale*dodadenZoom
	yInterval += mouseY/scale*dodadenZoom

	scale += scale*dodadenZoom

	draw()
})	

var mouseX = windowWidth/2 + windowWidth*commandContainerRatio/2;
var mouseY = windowHeight/2;

var lastMouseX = 0;
var lastMouseY = 0;

var elapsedTime = 0

var interval;

document.onkeydown = checkKey;

function checkKey(e) {

    e = e || window.event;

    if (e.keyCode == '38') {
        // up arrow

    }
    else if (e.keyCode == '40') {
        // down arrow
    }
    else
    	return
}

function getRandomColor() {
  return "hsl("+(Math.random()*300+240)+", 80%, 50%)";
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

var animations = []
var transitions = []

function start(animation) {

	let object = {
		main: function () {
			if(this.funk() == -1)
				return
			requestAnimationFrame(this.main)
		},
		funk: function () {
			draw()
			animation()
		}
	}

	object.main = object.main.bind(object)
	object.main()
}



var fps = 60;
var INTERVAL = Math.ceil(1000/fps);
var currentTime = 0, lastTime = (new Date()).getTime(), delta = 0;
var isMouseDown;

function hideInfo() {
	let elements = document.getElementById("commandContainer").children
	for(let i=0; i<elements.length; i++)
		if(elements[i].children[1])
			elements[i].children[1].style.display = "none"
}