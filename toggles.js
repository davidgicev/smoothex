import { animations, animate } from './animationClass.js'
import { config, state } from './app.js'
import { draw, drawGrid, drawAxes, drawFunctions } from './draw.js'
import { themes } from './themes.js'

var INTERVAL = Math.ceil(1000/60);
var canvas = document.getElementById("screen")

function splashAnimationScreen(color, callback, mouseX, mouseY) {

    let windowWidth = config.width
    let windowHeight = config.height

    let ctx = canvas.getContext("2d")
    ctx.save()
    ctx.beginPath()
    ctx.rect(0, 0, 0, 0)
    ctx.clip()

    // document.getElementById("screen").getContext("2d").globalCompositeOperation='source-atop';

    let funkcija = function() {

        if (this.smooth > 1) {
            callback()
            // canvas.getContext("2d").globalCompositeOperation='source-over';
            ctx.restore()
            draw()
            return -1
        }

        let koef = -(Math.cos(Math.PI * this.smooth) - 1) / 2; //-2*Math.pow(this.smooth,3)+3*Math.pow(this.smooth, 2)

        splashScreen(color, koef, this.mouseX, this.mouseY, this.radius)

        this.smooth += 0.02 * (INTERVAL / (1000 / 60)) * config.globalAnimationKoef
    }

    return {
        f: funkcija.bind({
            smooth: 0,
            mouseX: mouseX,
            mouseY: mouseY,
            radius: Math.sqrt(Math.pow(windowWidth, 2) + Math.pow(windowHeight, 2))
        })
    }
}

var toggleOptionsButton = function() {

    let windowWidth = config.width
    let windowHeight = config.height

    let leftPanelCanvas = document.getElementById("leftPanelCanvas")
    let ctx = leftPanelCanvas.getContext("2d")
    leftPanelCanvas.style.display = "block"

    leftPanelCanvas.width = windowWidth * config.commandContainerRatio
    leftPanelCanvas.height = windowHeight

    if (leftPanelCanvas.getAttribute("state") == 0) {

        let color = config.theme.osBackground

        leftPanelCanvas.setAttribute("state", 1)

        let optionsButton = document.getElementById("optionsButton")
        optionsButton.innerHTML = '<i class="fas fa-times"></i>'
        optionsButton.classList.add("pressed")
        optionsButton.style.pointerEvents = "none"

        animations.push(splashAnimation(color, function() {
            document.getElementById("commandScreen").style.visibility = "hidden"
            document.getElementById("commandScreen").style.opacity = 0
            document.getElementById("optionsScreen").style.visibility = "visible"
            document.getElementById("optionsScreen").style.opacity = 1
            document.getElementById("leftPanel").style.backgroundColor = color
            ctx.clearRect(0, 0, windowWidth, windowHeight)
            leftPanelCanvas.style.display = "none"
            optionsButton.style.pointerEvents = "auto"
        }, event.clientX, event.clientY))

        animate()
    } else {
        let color = config.theme.background

        leftPanelCanvas.setAttribute("state", 0)

        let optionsButton = document.getElementById("optionsButton")
        optionsButton.innerHTML = '<i class="fas fa-cog"></i>'
        optionsButton.classList.remove("pressed")
        optionsButton.style.pointerEvents = "none"

        animations.push(splashAnimation(color, function() {
            document.getElementById("commandScreen").style.visibility = "visible"
            document.getElementById("commandScreen").style.opacity = 1
            document.getElementById("optionsScreen").style.visibility = "hidden"
            document.getElementById("optionsScreen").style.opacity = 0
            document.getElementById("leftPanel").style.backgroundColor = color
            ctx.clearRect(0, 0, windowWidth, windowHeight)
            leftPanelCanvas.style.display = "none"
            optionsButton.style.pointerEvents = "auto"
        }, event.clientX, event.clientY))



        animate()
    }
}

var toggleTheme = function() {

    let windowWidth = config.width
    let windowHeight = config.height

    let themeToggle = document.getElementById("themeToggle")

    let leftPanelCanvas = document.getElementById("leftPanelCanvas")
    let ctx = leftPanelCanvas.getContext("2d")

    let optionsScreen = document.getElementById("optionsScreen")

    optionsScreen.style.zIndex = 2

    leftPanelCanvas.width = windowWidth * config.commandContainerRatio
    leftPanelCanvas.height = windowHeight
    leftPanelCanvas.style.display = "block"

    ctx.fillStyle = config.theme.osBackground
    ctx.fillRect(0, 0, windowWidth, windowHeight)

    if (config.theme == themes.light)
        config.theme = themes.dark
    else
        config.theme = themes.light

    let color = config.theme.background

    localStorage.setItem("theme", config.
    	theme.name)

    animations.push(splashAnimationScreen(color, function() {
        document.getElementById("screen").style.backgroundColor = color
    }, event.clientX, event.clientY))
    animations.push(splashAnimation(config.theme.osBackground, function() {
        optionsScreen.style.backgroundColor = config.theme.osBackground
        leftPanelCanvas.getContext("2d").clearRect(0, 0, windowWidth, windowHeight)
        leftPanelCanvas.style.display = "none"
        optionsScreen.style.zIndex = "auto"
        themeToggle.style.pointerEvents = "auto"
    }, event.clientX, event.clientY))

    document.getElementById("themeFile").href = config.theme.name + ".css"
    optionsScreen.style.backgroundColor = "transparent"
    themeToggle.innerHTML = config.theme.icon
    themeToggle.style.pointerEvents = "none"
    animate()
}

function splashScreen(color, koef, mouseX, mouseY, radius) {
	let ctx = canvas.getContext("2d")
	ctx.restore()
	ctx.save()
	ctx.beginPath()
	ctx.arc(mouseX, mouseY, koef*radius, 0, 2*Math.PI)
	ctx.clip()
	ctx.beginPath()
	ctx.arc(mouseX, mouseY, koef*radius, 0, 2*Math.PI)
	ctx.fillStyle = color
	ctx.fill()
	ctx.beginPath()
	ctx.arc(500,500,500,0,6)
	ctx.fill()
	drawGrid()
	drawAxes()
	drawFunctions()
}

function splashAnimation(color, callback, mouseX, mouseY) {

	let windowWidth = config.width
	let windowHeight = config.height

	let funkcija = function() {

		if(this.smooth > 1) {
			callback()
			return -1
		}

		let koef = -(Math.cos(Math.PI * this.smooth) - 1) / 2; //-2*Math.pow(this.smooth,3)+3*Math.pow(this.smooth, 2)

		splashLeftPanel(color, koef, this.mouseX, this.mouseY, this.radius)

		this.smooth += 0.02*(INTERVAL/(1000/60))*config.globalAnimationKoef
	}

	return {
		f: funkcija.bind({smooth: 0, mouseX: mouseX, mouseY: mouseY, 
			radius: Math.sqrt(Math.pow(windowWidth, 2)+Math.pow(windowHeight, 2))
				})
	}
}


function splashLeftPanel(color, koef, mouseX, mouseY, radius) {
	let leftPanelCanvas = document.getElementById("leftPanelCanvas")
	let ctx = leftPanelCanvas.getContext("2d")
	ctx.fillStyle = color
	ctx.beginPath()
	ctx.arc(mouseX, mouseY, koef*radius, 0, 2*Math.PI)
	ctx.fill()
}


export { toggleOptionsButton, toggleTheme }