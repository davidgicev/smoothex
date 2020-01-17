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
var nIncrement = 0.01

var mouseX = windowWidth/2 + windowWidth*commandContainerRatio/2;
var mouseY = windowHeight/2;

var lastMouseX = 0;
var lastMouseY = 0;

var elapsedTime = 0

var animations = []
var transitions = []

var fps = 60;
var INTERVAL = Math.ceil(1000/fps);
var currentTime = 0, lastTime = (new Date()).getTime(), delta = 0;
var isMouseDown;
var zoom = 1;

var light = {
	background: "white",
	axes: "black",
	font: "gray",
	colors: ["#8CDEDC", "#2191FB", "#BA274A", "#841C26", "green"]
}

var dark = {
	background: "black",
	axes: "white",
	font: "white"
}

var theme = light;


var POCHETEN = scale

var builtInFunctions = [{
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
	}
]

var functions = [...builtInFunctions]

var builtInVariables = [{
		name: "x",
		value: null
	}, 
	{
		name: "centerX",
		value: null
	},
	{
		name: "pi",
		value: Math.PI
	},
	{
		name: "e",
		value: Math.E
	}
]

var variables = [... builtInVariables]

var zapamti;

document.getElementById("window").style.width  = windowWidth  + "px"
document.getElementById("window").style.height = windowHeight + "px"

document.getElementById("commandContainer").style.width  = Math.max(windowWidth*commandContainerRatio, 300) + "px"
document.getElementById("commandContainer").style.height = windowHeight     + "px"

initCommands()
draw()

function initCommands() {

	let container = document.getElementById("commandContainer")

	createField()
	createField()
	createField()

	container.children[0].children[0].focus()
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
	zoom += zoom*dodadenZoom
	// console.log(zoom)

	xInterval += mouseX/scale*dodadenZoom
	yInterval += mouseY/scale*dodadenZoom

	scale += scale*dodadenZoom


	draw()
})	

window.addEventListener("resize", () => {

	windowWidth  = window.innerWidth;
	windowHeight = window.innerHeight;
	screenWidth = windowWidth

	canvas.width  = windowWidth
	canvas.height = windowHeight

	//scale = Math.max(windowWidth, windowHeight)/13

	document.getElementById("window").style.width  = windowWidth  + "px"
	document.getElementById("window").style.height = windowHeight + "px"

	document.getElementById("commandContainer").style.width  = Math.max(windowWidth*commandContainerRatio, 300) + "px"
	document.getElementById("commandContainer").style.height = windowHeight     + "px"
	draw()
});
