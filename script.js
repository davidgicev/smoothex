var windowWidth  = window.innerWidth;
var windowHeight = window.innerHeight;

var canvas = document.getElementById("screen");

canvas.width  = windowWidth
canvas.height = windowHeight

var xAxis = windowHeight/2
var screenWidth = windowWidth
var commandContainerRatio = 0.2
var zoom = 1
var scale = Math.max(windowWidth, windowHeight)/8
var xInterval = -windowWidth/scale/2 - windowWidth*commandContainerRatio/scale/2
var yInterval = -windowHeight/scale/2

var skrieni = 1

var POCHETEN = scale

var functions = []

document.getElementById("window").style.width  = windowWidth  + "px"
document.getElementById("window").style.height = windowHeight + "px"

document.getElementById("commandContainer").style.width  = windowWidth*commandContainerRatio + "px"
document.getElementById("commandContainer").style.height = windowHeight     + "px"

initCommands()
draw()

function initCommands() {

	let container = document.getElementById("commandContainer")

	createField()
	createField()
	createField()
}

var n = 0.01
function pan() {

	xInterval -= (mouseX - lastMouseX)/scale
	yInterval -= (mouseY - lastMouseY)/scale

	//xInterval  -= (mouseX - lastMouseX)/scale


	lastMouseX = mouseX
	lastMouseY = mouseY

	draw();
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
	if(!skrieni) {
		hideInfo()
	}
})

document.getElementById("screen").addEventListener("mouseup", (event) => {
	isMouseDown = false
})

document.getElementById("screen").addEventListener("wheel", (event) => {

	let dodadenZoom = -event.deltaY/1000

	zoom -= event.deltaY/1000

	xInterval += mouseX/scale*dodadenZoom
	yInterval += mouseY/scale*dodadenZoom

	scale += scale*dodadenZoom

	draw()
})	

var mouseX = 0;
var mouseY = 0;

var lastMouseX = 0;
var lastMouseY = 0;

var interval;

document.onkeydown = checkKey;

function checkKey(e) {

    e = e || window.event;

    if (e.keyCode == '38') {
        // up arrow

        let f2 = prompt("Function")
		eval("animate(drawFunctionTransition(functions[0], x => " + f2 + ")); functions.pop()")
    }
    else if (e.keyCode == '40') {
        animate(drawFunctionSmooth({f: x => x*x, color: getRandomColor()}))
        // down arrow
    }
    else
    	return
}

function getRandomColor() {
  return "hsl("+(Math.random()*300+240)+", 100%, 85%)";
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
			else
				return
			requestAnimationFrame(this.main)
		},
		funk: function() {
			draw()
			for(let i=0; i<animations.length; i++) {
				if(animations[i]() == -1) {
					animations.splice(i, 1)
				}
			}
		}
	}
	object.main = object.main.bind(object)
	object.main()
}

var animations = []

function refresh(funk) {

	funk()

	currentTime = (new Date()).getTime()
	delta = currentTime - lastTime;

	if(delta < INTERVAL)
		return;

	lastTime = currentTime - (delta % INTERVAL)

	requestAnimationFrame(refresh, funk)
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