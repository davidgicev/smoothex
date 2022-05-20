import {animations, transitions, animate, transition} from './animationClass.js'
import {state, config} from './app.js'
import {nearestToBase, formatNumber, roundToNumber} from './mathHelpers.js';

var INTERVAL = 25

var canvas = document.getElementById("screen")

let animateSetup = function() {

	let funkcija = function() {

		if(this.smooth > 1) {
			return -1
		}

		if(!this.axes) {
			animations.push(drawAxesInit())
			this.axes = true
		}

		if(!this.grid && this.smooth > 0.05) {
			animations.push(drawGridInit())
			this.grid = true
		}

		// drawAxes()
		// drawGridAnimation(koef)
		// drawAxesAnimation(1)

		this.smooth += config.globalAnimationKoef*0.01*(INTERVAL/(1000/60))
	}

	animations.push({f: funkcija.bind({smooth: 0, axes: false, grid: false})})
	animate()
}

let drawAxesInit = function() {

	let funkcija = function() {

		let koef = -2*Math.pow(this.smooth,3)+3*Math.pow(this.smooth, 2)

		drawAxesAnimation(koef)

		this.smooth += config.globalAnimationKoef*0.02*(INTERVAL/(1000/60))

		if(this.smooth > 1) {
			config.setupState.axes = true
			return -1
		}
	}

	return {
		f: funkcija.bind({smooth: 0}),
	};
}

let drawGridInit = function() {

	let funkcija = function() {

		if(!this.move && this.smooth > 0.7) {
			animations.push(finishSetup())
			this.move = true
		}

		let koef = -2*Math.pow(this.smooth,3)+3*Math.pow(this.smooth, 2)

		// drawAxes()
		drawGridAnimation(koef)
		// drawAxesAnimation(1)

		this.smooth += config.globalAnimationKoef*0.01*(INTERVAL/(1000/60))

		if(this.smooth > 1) {
			config.setupState.grid = true
			return -1
		}
	}

	return {
		f: funkcija.bind({smooth: 0, move: false}),
	};
}

let finishSetup = function() {

	document.getElementById("optionsButton").style.display = "block"
	let commandContainerRatio = config.commandContainerRatio
	let windowWidth = config.width
	let scale = state.scale

	let funkcija = function() {

		if(this.smooth > 1) {
			// findInnerSubfieldLeft(fields[0].element).focus()
			document.getElementById("optionsButton").style.transform = "scale(1)"
			document.getElementById("leftPanel").style.overflow = 'visible'
			return -1
		}

		let koef = -(Math.cos(Math.PI * this.smooth) - 1) / 2; //-2*Math.pow(this.smooth,3)+3*Math.pow(this.smooth, 2)

		state.xInterval = -(windowWidth/scale)*(0.5 + koef*commandContainerRatio/2)

		// drawAxesAnimation(1)
		// drawGridAnimation(1)

		document.getElementById("leftPanel").style.width  = windowWidth*commandContainerRatio*koef + "px"

		this.smooth += config.globalAnimationKoef*0.015*(INTERVAL/(1000/60))
	}

	return {
		f: funkcija.bind({smooth: 0})
	}
}


let drawAxesAnimation = function(koef, transitionKoef) {

	let xInterval = state.xInterval;
	let yInterval = state.yInterval;
	let screenWidth = config.width;
	let windowHeight = config.height;
	let scale = state.scale
	let ctx = canvas.getContext('2d');
	// ctx.clearRect(0,0,windowWidth,windowHeight)

	ctx.strokeStyle = config.theme.axes
	ctx.lineWidth = 1

	ctx.beginPath()
	ctx.moveTo(0, -yInterval*scale)
	ctx.lineTo(screenWidth*koef, -yInterval*scale)
	ctx.stroke()
	
	ctx.beginPath()
	ctx.moveTo(-xInterval*scale, windowHeight)
	ctx.lineTo(-xInterval*scale, windowHeight*(1-koef))
	ctx.stroke()

	// koef = (koef > 0.5) ? koef-0.5 : 0
}

let drawGridAnimation = function(koef, transitionKoef) {

	let xInterval = state.xInterval;
	let yInterval = state.yInterval;
	let screenWidth = config.width;
	let windowHeight = config.height;
	let scale = state.scale
	let ctx = canvas.getContext('2d');
	let commandContainerRatio = config.commandContainerRatio
	// ctx.clearRect(0,0,windowWidth,windowHeight)

	// drawAxesAnimation(1)

	ctx.strokeStyle = config.theme.axes
	ctx.lineWidth = 1

	ctx.textAlign = "center";

	let nIncrement = screenWidth*(1-commandContainerRatio)/scale

	nIncrement /= 20;

	nIncrement = nearestToBase(nIncrement, 2)
	ctx.lineWidth = 1

	ctx.strokeStyle = config.theme.grid

	for(let i=roundToNumber(xInterval, nIncrement); i<screenWidth/scale + xInterval; i += nIncrement) {

		let x = i
		let renderX = (i-xInterval)*scale 

		
		ctx.beginPath()
		let length = 5
		ctx.moveTo(renderX, windowHeight)
		ctx.lineTo(renderX, windowHeight*(1-koef))
		ctx.stroke()

	}

	for(let i=roundToNumber(yInterval, nIncrement); i<windowHeight/scale + yInterval; i += nIncrement) {

		let y = i
		let renderY = (i-yInterval)*scale 

		ctx.beginPath()
		let length = 5
		ctx.moveTo(0, renderY)
		ctx.lineTo(screenWidth*koef, renderY)
		ctx.stroke()

	}

	ctx.textAlign = "center";

	nIncrement = screenWidth*(1-commandContainerRatio)/scale

	nIncrement /= 5;

	nIncrement = nearestToBase(nIncrement,2)

	ctx.font = (15*koef)+"px Arial";

	ctx.strokeStyle = config.theme.axes

	let j = 0

	ctx.fillStyle = config.theme.axes

	for(let i=roundToNumber(xInterval, nIncrement); i<screenWidth/scale*koef + xInterval; i += nIncrement) {


		let x = i
		let renderX = (i-xInterval)*scale 

		ctx.beginPath()
		let length = 5
		ctx.moveTo(renderX, -yInterval*scale -5*koef)
		ctx.lineTo(renderX, -yInterval*scale + 5*koef)
		ctx.stroke()


		if(i == 0)
			renderX -= 10

		ctx.fillText(formatNumber(i, nIncrement), renderX, -yInterval*scale + 20);

	}

	j = 0

	for(let i=roundToNumber(yInterval, nIncrement); i<windowHeight/scale*(koef) + yInterval; i += nIncrement) {

		let y = i
		let renderY = (i-yInterval)*scale 

		ctx.beginPath()
		let length = 5
		ctx.moveTo(-xInterval*scale + 5*koef, renderY)
		ctx.lineTo(-xInterval*scale - 5*koef, renderY)
		ctx.stroke()


		if(i == 0)
			continue

		ctx.fillText(formatNumber(-i, nIncrement), -xInterval*scale + String(i).length*5+10, renderY + 4);

	}

	ctx.strokeStyle = config.theme.axes
	ctx.lineWidth = 1

	ctx.beginPath()
	ctx.moveTo(0, -yInterval*scale)
	ctx.lineTo(screenWidth*koef, -yInterval*scale)
	ctx.stroke()
	
	ctx.beginPath()
	ctx.moveTo(-xInterval*scale, windowHeight)
	ctx.lineTo(-xInterval*scale, windowHeight*(1-koef))
	ctx.stroke()
}

export {animateSetup}