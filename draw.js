function draw() {
	drawAxes()
	drawGrid()
	drawFunctions()
	// variables[1].value = xInterval + screenWidth/scale/2 + windowWidth*commandContainerRatio/scale/2
	// builtInVariables[1].value = xInterval + screenWidth/scale/2 + windowWidth*commandContainerRatio/scale/2
}

function drawFunctions() {

	for (let i=builtInFunctions.length; i<functions.length; i++) {
		drawFunction(functions[i])
	}
}

function drawAxes() {

	let ctx = canvas.getContext('2d');
	ctx.clearRect(0,0,windowWidth,windowHeight)

	ctx.strokeStyle = theme.axes
	ctx.lineWidth = 1

	ctx.beginPath()
	ctx.moveTo(0, -yInterval*scale)
	ctx.lineTo(screenWidth, -yInterval*scale)
	ctx.stroke()
	
	ctx.beginPath()
	ctx.moveTo(-xInterval*scale, 0)
	ctx.lineTo(-xInterval*scale, windowHeight)
	ctx.stroke()

	ctx.font = "15px Arial";
	ctx.textAlign = "center";

	let nIncrement = screenWidth*(1-commandContainerRatio)/scale

	nIncrement /= 5;

	nIncrement = nearestToBase(nIncrement,2)

	for(let i=roundToNumber(xInterval, nIncrement); i<screenWidth/scale + xInterval; i += nIncrement) {

		let x = i
		let renderX = (i-xInterval)*scale 

		ctx.lineWidth = 1

		ctx.fillStyle = theme.axes

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

		ctx.lineWidth = 1

		ctx.fillStyle = theme.axes

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


function drawGrid() {

	let ctx = canvas.getContext('2d');

	ctx.strokeStyle = theme.axes
	ctx.lineWidth = 1

	ctx.font = "15px Arial";
	ctx.textAlign = "center";

	let nIncrement = screenWidth*(1-commandContainerRatio)/scale

	nIncrement /= 20;

	nIncrement = nearestToBase(nIncrement, 2)

	for(let i=roundToNumber(xInterval, nIncrement); i<screenWidth/scale + xInterval; i += nIncrement) {

		let x = i
		let renderX = (i-xInterval)*scale 

		ctx.lineWidth = 1

		ctx.strokeStyle = "rgba(0,0,0,0.2)"

		ctx.beginPath()
		let length = 5
		ctx.moveTo(renderX, 0)
		ctx.lineTo(renderX, windowHeight)
		ctx.stroke()

	}

	for(let i=roundToNumber(yInterval, nIncrement); i<windowHeight/scale + yInterval; i += nIncrement) {

		let y = i
		let renderY = (i-yInterval)*scale 

		ctx.lineWidth = 1

		ctx.strokeStyle = "rgba(0,0,0,0.2)"

		ctx.beginPath()
		let length = 5
		ctx.moveTo(0, renderY)
		ctx.lineTo(windowWidth, renderY)
		ctx.stroke()

	}
}

function drawFunction(f) {

	let nIncrement = 0.01

	let minatIzvod = 1
	let sporedbeno = 0.1

	//let vreme = (new Date()).getTime()

	if(!f || f.hidden || !f.f) {
		return
	}

	let color = f.color
	f = f.f

	let ctx = canvas.getContext("2d")

	ctx.beginPath()


	for(let i=xInterval; i<screenWidth/scale + xInterval;) {

	ctx.strokeStyle = color
	ctx.lineWidth = 3

	let x = i
	let y = -f(x)

	i += nIncrement

	if(isNaN(y))
		continue

	let x2 = i
	let y2 = -f(x2)

	let renderX = (x-xInterval)*scale
	let renderY = (y-yInterval)*scale

	let renderX2 = (x2-xInterval)*scale
	let renderY2 = (y2-yInterval)*scale


	let momentalenIzvod = (-(y2-y)/nIncrement)
	let starn = nIncrement
	let promena = Math.max(Math.abs((momentalenIzvod - minatIzvod)/nIncrement)*10, 10)
	promena = Math.max(1 / promena, 0.01)
	promena = promena*Math.min(1/(zoom), 5)


	// let zaRender = promena*10//(momentalenIzvod - minatIzvod)/nIncrement

	nIncrement = promena

	
	if(scale < 1)
		nIncrement = 1/scale	

	if(starn > nIncrement) {

	

		i = i - starn
		continue
	}

	// ctx.fillStyle = "red"

	// ctx.beginPath()
	// ctx.arc(renderX,  (y - yInterval)*scale, 10, 0, 2*3.14);
	// ctx.fill()

	// ctx.fillStyle = "black"

	// ctx.beginPath()
	// ctx.arc(renderX,  (-zaRender - yInterval)*scale, 5, 0, 2*3.14);
	// ctx.fill()	

	minatIzvod = momentalenIzvod

	if(Math.abs(momentalenIzvod) > windowHeight) {
		//asimptota

		ctx.stroke()

		ctx.beginPath()
		ctx.moveTo(renderX , renderY)
		ctx.lineTo(renderX, Math.sign(y)*(windowHeight))
		ctx.stroke()

		ctx.beginPath()
		ctx.moveTo(renderX2 , renderY2)
		ctx.lineTo(renderX, Math.sign(y2)*(windowHeight))
		ctx.stroke()

		// ctx.beginPath()


		continue
	}


	// ctx.beginPath()
	ctx.moveTo(renderX , renderY)
	ctx.lineTo(renderX2, renderY2)
	// ctx.stroke()

	}

	//elapsedTime += (new Date()).getTime() - vreme
	//console.log(elapsedTime)
	//elapsedTime = 0
	ctx.stroke()

}



function drawParametric(f) {

	let xFunk = f.xFunk
	let yFunk = f.yFunk

	let color = f.color

	let ctx = canvas.getContext("2d")

	for(let t=0; t<100; t += nIncrement) {

	ctx.strokeStyle = color
	ctx.lineWidth = 3

	let x =  xFunk(t)
	let y = -yFunk(t)


	let x2 =  xFunk(t+nIncrement)
	let y2 = -yFunk(t+nIncrement)

	let renderX = (x-xInterval)*scale
	let renderY = (y-yInterval)*scale

	let renderX2 = (x2-xInterval)*scale
	let renderY2 = (y2-yInterval)*scale

	ctx.beginPath()
	ctx.moveTo(renderX , renderY)
	ctx.lineTo(renderX2, renderY2)
	ctx.stroke()
	ctx.fill()
	}
}

function drawFunctionInit(f) {

	functions.push(f)

	let orginalna = f.f;

	let funkcija = function() {

		if(this.smooth > 1) {

			f.f = orginalna

			return -1
		}

		let koef = -2*Math.pow(this.smooth,3)+3*Math.pow(this.smooth, 2)

		f.f =  x => orginalna(x)*koef;

		this.smooth += 0.01*(INTERVAL/(1000/60))
	}

	return funkcija.bind({smooth:0});
}

function drawFunctionTransition(f1, f2) {

	let f1Copy = f1.f
	let f2Copy = f2.f

	functions[f1.id].f        = f2.f
	functions[f1.id].readable = f2.readable	

	let funkcija = function() {

		if(this.smooth >= 1) {

			functions[f1.id].f = f2Copy

			return -1
		}

		let koef = -2*Math.pow(this.smooth,3)+3*Math.pow(this.smooth, 2)


		functions[f1.id].f =  x => f1Copy(x) + koef*(f2Copy(x) - f1Copy(x))

		this.smooth += 0.01*(INTERVAL/(1000/60))
	}

	return funkcija.bind({smooth:0});

}

function drawFunctionClosure(f) {

	let funkcija = function() {

		if(this.smooth > 1) {


			return -1
		}

		let koef = -2*Math.pow(this.smooth,3)+3*Math.pow(this.smooth, 2)

		let funk = {
			f: x => f.f(x)*(1-koef),
			color: f.color
		}

		drawFunction(funk)

		this.smooth += 0.02*(INTERVAL/(1000/60))
	}

	return funkcija.bind({smooth:0});
}


function animateVariable(animationContainer) {

	let index = contains(variables, "name", animationContainer.name)

	let min = animationContainer.children[3].children[0].children[0].value
	min = Number(min)
	let max = animationContainer.children[3].children[1].children[0].value
	max = Number(max)
	// let step = animationContainer.children[3].children[2].children[0].value
	// step = Number(step)
	let speed = animationContainer.children[3].children[2].children[0].value
	speed = Number(speed)

	let funkcija = {
		f: function() {

			if(this.period > max || this.period < min) {
				this.speed *= -1
			}

			variables[index].value = this.period
			animationContainer.parentElement.parentElement.children[0].value = variables[index].name + " = " + this.period.toFixed(2)
			animationContainer.parentElement.children[0].innerHTML = "Value: " + this.period.toFixed(2)
			animationContainer.parentElement.children[2].children[0].value = this.period

			this.period += this.speed*0.005*((max-min)/10)
		},
		id: animationContainer.name,
		speed: speed,
		period: variables[index].value
	}

	funkcija.f = funkcija.f.bind(funkcija)

	return funkcija;
}

function animateXInterval() {
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

function drawTangent() {

	functions.push({
		name: "derivative",
		f: x => Math.cos(xInterval-5)*(x-xInterval-5) + Math.sin(xInterval-5),
		color: "blue",
	})

	animateXInterval()
}



function previewPoints() {

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