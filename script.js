import {state, config} from './app.js';
import {draw} from './draw.js';
import {createFieldInstance} from './FieldManager.js'
import {blurFields} from './FieldManager.js'
import {toggleOptionsButton, toggleTheme} from './toggles.js'
import {themes} from './themes.js'
import {initializeCache} from './drawHandler.js'

var canvas = document.getElementById("screen");

canvas.width  = config.width
canvas.height = config.height

var svg = document.getElementById("svgScreen")

svg.style.width  = config.width + "px"
svg.style.height = config.height + "px"

document.getElementById("leftPanel").style.height = config.height + "px"
document.getElementById("leftPanel").style.width  = config.animateSetup ? 0 : config.width*config.commandContainerRatio + "px"

if(config.animateSetup) {
	document.getElementById("leftPanel").style.overflow = 'hidden'
}
else {
	document.getElementById("optionsButton").style.transform = "scale(1)"	
}

document.addEventListener("keydown", (e) => {
	if(e.keyCode === 16)
		state.shift = true
})
document.addEventListener("keyup", (e) => {
	if(e.keyCode === 16)
		state.shift = false
})

let themeName = localStorage.getItem("theme")

if(themeName)
	config.theme = themes[themeName]
else
	config.theme = themes.light

document.getElementById("themeFile").href = config.theme.name + ".css"

canvas.style.backgroundColor = config.theme.background


document.getElementById("optionsButton").addEventListener("mousedown", toggleOptionsButton)
document.getElementById("themeToggle")  .addEventListener("mousedown", toggleTheme)
document.getElementById("animationKoef").addEventListener("mousedown", animationKoef)

document.addEventListener("mousemove", (event) => {

	state.mouseX = event.clientX
	state.mouseY = event.clientY

	if(!state.resizingMode) {
		if(Math.abs(state.mouseX/config.width - config.commandContainerRatio) < 0.005)
			document.body.style.cursor = "ew-resize"
		else
			document.body.style.cursor = "default"
	}
	
	if(state.isMouseDown) {
		
		if(state.resizingMode) {
			config.commandContainerRatio = state.mouseX/config.width
			document.getElementById("leftPanel").style.width  = config.width*config.commandContainerRatio + "px"
		}
		else
			pan()
	}
})

document.getElementById("screen").addEventListener("mousedown", (event) => {
	state.lastMouseX = state.mouseX
	state.lastMouseY = state.mouseY
	state.isMouseDown = true
	blurFields()
})

document.addEventListener("mousedown", (event) => {

	if(Math.abs(state.mouseX/config.width - config.commandContainerRatio) < 0.01) {
		state.resizingMode = true;
		state.isMouseDown = true;
		document.body.style.cursor = "ew-resize"
	}

	if(state.mouseX/config.width > config.commandContainerRatio)
		state.isMouseDown = true;
})

document.addEventListener("mouseup", (event) => {

	state.isMouseDown = false

	config.globalDebbuging = true

	if(state.resizingMode) {
		config.commandContainerRatio = state.mouseX/config.width
		document.getElementById("leftPanel").style.width  = config.width*config.commandContainerRatio + "px"
	}

	state.resizingMode = false
	document.body.style.cursor = "default"
})

document.getElementById("screen").addEventListener("wheel", (event) => {

	let dodadenZoom = -0.09*Math.sign(event.deltaY)
	state.zoom += state.zoom*dodadenZoom
	state.scale += state.scale*dodadenZoom

	state.xInterval += state.mouseX/state.scale*dodadenZoom
	state.yInterval += state.mouseY/state.scale*dodadenZoom

	draw()
})	

window.addEventListener("resize", () => {

	config.width  = window.innerWidth;
	config.height = window.innerHeight;

	canvas.width  = config.width
	canvas.height = config.height

	svg.style.width  = config.width + "px"
	svg.style.height = config.height + "px"

	//scale = Math.max(windowWidth, windowHeight)/13

	document.getElementById("window").style.width  = config.width  + "px"
	document.getElementById("window").style.height = config.height + "px"

	// document.getElementById("leftPanel").style.width  = Math.max(windowWidth*Application.config.commandContainerRatio, 300) + "px"
	document.getElementById("leftPanel").style.height = config.height + "px"
	draw()
});

var pan = function() {

	state.xInterval -= (state.mouseX - state.lastMouseX)/state.scale
	state.yInterval -= (state.mouseY - state.lastMouseY)/state.scale


	let ctx = document.getElementById("screen").getContext('2d');
	ctx.clearRect(0,0,config.width,config.height)


	// panTest()
	// workerPan()

	state.lastMouseX = state.mouseX
	state.lastMouseY = state.mouseY
	
	draw()
}


createFieldInstance()
createFieldInstance()
createFieldInstance()

initializeCache()
draw()