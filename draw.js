import {state, config} from './app.js';
import {nearestToBase, formatNumber, roundToNumber} from './mathHelpers.js';
import {functions, variables, builtInFunctions, builtInVariables} from './itemClass.js';
import {Interval} from './intervalArithmetic.js'
import {renderFunction} from './render.js'
import {handleDraw} from './drawHandler.js'

var canvas = document.getElementById("screen")

let draw = function() {

	handleDraw()

	let ctx = canvas.getContext('2d');
	// ctx.save();
	ctx.clearRect(0,0,config.width,config.height)
	// ctx.globalCompositeOperation = "destination-over"; //obraten redosled treba da se crtaat zaradi ova

	if(config.setupState.grid) {
		drawGrid()
	}

	if(config.setupState.axes) {
		drawAxes()
	}

	drawFunctions()
	// ctx.restore()
}

let drawFunctions = function() {
	for (let i=builtInFunctions.length; i<functions.length; i++) {
		drawFunction(functions[i])
	}
}


let drawAxes = function() {


	let xInterval = state.xInterval;
	let yInterval = state.yInterval;
	let screenWidth = config.width;
	let windowHeight = config.height;
	let scale = state.scale

	let ctx = canvas.getContext('2d');

	ctx.strokeStyle = config.theme.axes
	ctx.lineWidth = 1

	ctx.beginPath()
	ctx.moveTo(0, -yInterval*scale)
	ctx.lineTo(screenWidth, -yInterval*scale)
	ctx.stroke()
	
	ctx.beginPath()
	ctx.moveTo(-xInterval*scale, 0)
	ctx.lineTo(-xInterval*scale, windowHeight)
	ctx.stroke()

	if(!config.setupState.grid)
		return

	ctx.font = "15px Arial";
	ctx.textAlign = "center";

	let nIncrement = screenWidth*(1-config.commandContainerRatio)/scale

	nIncrement /= 5;

	nIncrement = nearestToBase(nIncrement,2)

	ctx.lineWidth = 1

	ctx.fillStyle = config.theme.axes

	for(let i=roundToNumber(xInterval, nIncrement); i<screenWidth/scale + xInterval; i += nIncrement) {

		let x = i
		let renderX = (i-xInterval)*scale 

		

		ctx.beginPath()
		let length = 5
		ctx.moveTo(renderX, -yInterval*scale -5)
		ctx.lineTo(renderX, -yInterval*scale + 5)
		ctx.stroke()


		if(i == 0)
			renderX -= 10

		ctx.fillText(formatNumber(i, nIncrement), renderX, -yInterval*scale + 20);

	}

	for(let i=roundToNumber(yInterval, nIncrement); i<windowHeight/scale + yInterval; i += nIncrement) {

		let y = i
		let renderY = (i-yInterval)*scale 

		
		ctx.beginPath()
		let length = 5
		ctx.moveTo(-xInterval*scale + 5, renderY)
		ctx.lineTo(-xInterval*scale - 5, renderY)
		ctx.stroke()


		if(i == 0)
			continue

		ctx.fillText(formatNumber(-i, nIncrement), -xInterval*scale + String(i).length*5+10, renderY + 4);

	}
}

let drawGrid = function() {

	let xInterval = state.xInterval;
	let yInterval = state.yInterval;
	let screenWidth = config.width;
	let windowHeight = config.height;
	let scale = state.scale

	let ctx = canvas.getContext('2d');

	ctx.lineWidth = 1

	ctx.font = "15px Arial";
	ctx.textAlign = "center";

	let nIncrement = screenWidth*(1-config.commandContainerRatio)/scale

	nIncrement /= 20;

	nIncrement = nearestToBase(nIncrement, 2)

	ctx.strokeStyle = config.theme.grid

	for(let i=roundToNumber(xInterval, nIncrement); i<screenWidth/scale + xInterval; i += nIncrement) {

		let x = i
		let renderX = (i-xInterval)*scale 


		ctx.beginPath()
		let length = 5
		ctx.moveTo(renderX, 0)
		ctx.lineTo(renderX, windowHeight)
		ctx.stroke()

	}

	for(let i=roundToNumber(yInterval, nIncrement); i<windowHeight/scale + yInterval; i += nIncrement) {

		let y = i
		let renderY = (i-yInterval)*scale 

		ctx.beginPath()
		let length = 5
		ctx.moveTo(0, renderY)
		ctx.lineTo(screenWidth, renderY)
		ctx.stroke()

	}	
}

let drawFunction = function(f) {

	if(!f || f.hidden || !f.f || f.f.length != 1) {
		return
	}

	renderFunction(f)
	return


	let xInterval = state.xInterval;
	let yInterval = state.yInterval;
	let windowWidth  = config.width;
	let windowHeight = config.height;
	let scale = state.scale
	
	if(!f.cache.span) {
		console.log("kreiram cache span")
		f.cache.points = drawFunctionPoints(f, 0, windowWidth);
		f.cache.span = [xInterval, windowWidth/scale + xInterval]
	}

	// console.log(f.cache.span)

	let mappedLo = Math.ceil((f.cache.span[0]-xInterval)*scale)
	let mappedHi = Math.floor((f.cache.span[1]-xInterval)*scale)
	if(mappedLo < 0) {
		console.log("brisham desno", windowWidth)
		removeFunctionPoints(f, windowWidth/scale+xInterval, null)
	}
	else if(mappedLo > 0) {
		console.log("proshiruvam levo")
		f.cache.points.unshift(...drawFunctionPoints(f, 0, mappedLo))
	}

	if(mappedHi > windowWidth) {
		console.log("brisham levo", 0)
		removeFunctionPoints(f, null, xInterval)
	}
	else if(mappedHi < windowWidth) {
		console.log("proshiruvam desno")
		f.cache.points.push.apply(f.cache.points, drawFunctionPoints(f, mappedHi, windowWidth))
	}

	f.cache.span = [xInterval, windowWidth/scale + xInterval]
	renderFunction(f);
}

function removeFunctionPoints(f, a, b) {
	if(a == null) {
		let index = findPoint(f.cache.points, b, true);
		f.cache.points.splice(0, index)
	}
	else if (b == null) {
		let index = findPoint(f.cache.points, a, false);
		f.cache.points.splice(a, index)
	}
}

function findPoint(array, a, odLevo) {
	for(let i=0; i<array.length-1; i++) {
		if(a <= array[i+1].point[0] && a >= array[i].point[0])
			return odLevo ? i : i+1
	}
	if(a < array[0].point[0])
		return 0
	else
		return array.length-1
}

let drawFunctionOld = function(f) {

	let xInterval = state.xInterval;
	let yInterval = state.yInterval;
	let screenWidth  = config.width;
	let windowHeight = config.height;
	let scale = state.scale

	let nIncrement = 0.01

	let minatIzvod = 1
	let sporedbeno = 0.1
	let minatY = 0
	let pointCounter = 0;

	//let vreme = (new Date()).getTime()

	if(!f || f.hidden || !f.f) {
		return
	}

	let color = f.color
	let copyF = f;
	f = f.f

	let ctx = canvas.getContext("2d")

	ctx.beginPath()

	ctx.strokeStyle = color
	ctx.lineWidth = 3

	for(let i=xInterval; i<screenWidth/scale + xInterval;) {

	
	let x1 = i
	let y1 = -f(x1)

	i += nIncrement

	let x2 = i
	let y2 = -f(x2)

	i += nIncrement

	let x3 = i
	let y3 = -f(x3)

	if(isNaN(y1))
		continue

	let dy1 = (-(y2-y1)/nIncrement)
	let dy2 = (-(y3-y2)/nIncrement)

	let starn = nIncrement

	let promena = Math.max(Math.abs((dy2 - dy1)/nIncrement)*10, 10)
	promena = Math.max(1 / promena, 0.01)
	promena = promena*Math.min(1/(state.zoom), 5)

	// let zaRender = promena*10//(momentalenIzvod - minatIzvod)/nIncrement

	nIncrement = promena


	if(scale < 1)
		nIncrement = 1/scale	

	if(starn > nIncrement) {

		i = i - 2*starn
		continue
	}



	let renderX1 = (x1-xInterval)*scale
	let renderY1 = (y1-yInterval)*scale

	let renderX2 = (x2-xInterval)*scale
	let renderY2 = (y2-yInterval)*scale

	let renderX3 = (x3-xInterval)*scale
	let renderY3 = (y3-yInterval)*scale

	pointCounter++;

	// ctx.fillStyle = "red"

	// ctx.beginPath()
	// ctx.arc(renderX,  (y - yInterval)*scale, 10, 0, 2*3.14);
	// ctx.fill()

	// ctx.fillStyle = "black"

	// ctx.beginPath()
	// ctx.arc(renderX,  (-zaRender - yInterval)*scale, 5, 0, 2*3.14);
	// ctx.fill()	

	if(Math.abs(dy1) > windowHeight || Math.abs(dy2) > windowHeight) {

		ctx.stroke()

		ctx.beginPath()
		ctx.moveTo(renderX1 , renderY1)
		ctx.lineTo(renderX1, y1*windowHeight)
		ctx.stroke()


		ctx.beginPath()
		ctx.moveTo(renderX2 , renderY2)

		if(Math.abs(y2-y1) < Math.abs(y3-y2))
			ctx.lineTo(renderX1, renderY1)
		else
			ctx.lineTo(renderX3, renderY3)

		ctx.stroke()

		ctx.beginPath()
		ctx.moveTo(renderX3 , renderY3)
		ctx.lineTo(renderX3, y3*windowHeight)
		ctx.stroke()

		continue
	}

	ctx.moveTo(renderX1, renderY1)
	ctx.lineTo(renderX2, renderY2)
	ctx.lineTo(renderX3, renderY3)

	}

	// console.log("number of points drawn: "+pointCounter)

	//elapsedTime += (new Date()).getTime() - vreme
	//console.log(elapsedTime)
	//elapsedTime = 0
	ctx.stroke()
}

let drawFunctionPoints = function(f, a, b) {

	let xInterval = state.xInterval;
	let yInterval = state.yInterval;
	let screenWidth  = config.width;
	let windowHeight = config.height;
	let scale = state.scale
	let points = []
	let pointCounter = 0
	let F = f

	f = f.f

	let x1 = a/scale + xInterval
	let y1 = -f(x1)

	let x2 = (a+1)/scale + xInterval
	let y2 = -f(x2)

	let x3, y3;

	let renderX1 = a
	let renderY1 = a+1

	let renderX2, renderX3, renderY2, renderY3;

	points.push({point: [x1, y1]})

	for(let i=a+1; i<=b;) {

		x1 = x2;
		y1 = y2;
		x2 = x3;
		y2 = y3;

		i += 1

		x3 = i/scale + xInterval
		y3 = -f(x3)

		renderX1 = i-2
		renderY1 = (y1-yInterval)*scale

		renderX2 = i-1
		renderY2 = (y2-yInterval)*scale

		renderX3 = i
		renderY3 = (y3-yInterval)*scale

		// let range = F.cif(new Interval(x2, x3))

		// if(!isFinite(range.lo) || !isFinite(range.hi)) {
		// 	points.push({point: [x2, y2], infinities: [range.lo, range.hi]})
		// 	x2 = x1
		// 	y2 = y1
		// 	continue
		// }

		if(Math.abs((x3-x1)*(y1-y2)-(x1-x2)*(y3-y1))*scale*scale < 1) {
			x2 = x1;
			y2 = y1;
			continue;
		}

		// let testResult = midpointTest(F, x2, x3, range);

		points.push({point: [x2, y2]})
		pointCounter++;

	}

	points.push({point: [x3, y3]})
	return points
}

let animateXInterval = function() {
	let funkcija = {
		f: function() {

			if(this.period > 10) {

				return -1
			}

			//document.getElementById(sliderId)

			xInterval = this.period

			this.period += 0.01
		},
		id: -1
	}

	funkcija.f = funkcija.f.bind({period:xInterval})

	animations.push(funkcija)
	animate()
}

let previewPoints = function() {

	let xInterval = state.xInterval;
	let yInterval = state.yInterval;
	let screenWidth = config.width;
	let scale = state.scale

	draw()

	let ctx = canvas.getContext("2d")

	x = mouseX/scale + xInterval
	y = mouseY/scale + yInterval

	let counter = 0

	for(let i=builtInFunctions.length; i<functions.length; i++) {

		if(Math.abs( functions[i].f(x) + y ) < 0.25/zoom) {

			
			ctx.fillStyle = functions[i].color
			ctx.beginPath()
			ctx.arc((x-xInterval)*scale, (-functions[i].f(x)-yInterval)*scale, 5, 0, 2*3.1415)
			ctx.fill()

			ctx.fillStyle = functions[i].color

			ctx.beginPath()

			ctx.rect(mouseX+8, mouseY-48 - counter*40, 144, 39)
			ctx.fill()

			ctx.fillStyle = "white"

			ctx.beginPath()

			ctx.rect(mouseX+10, mouseY-46 - counter*40, 140, 35)
			ctx.fill()

			ctx.fillStyle = "black"
			
			ctx.fillText("("+x.toFixed(5)+ ","+functions[i].f(x).toFixed(5)+")", mouseX + 10 + 70, mouseY -25 -counter*40)

			counter++
		}
	}
}

export {
	draw,
	drawFunctions,
	drawAxes,
	drawGrid,
};

