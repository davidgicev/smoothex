function draw() {
	drawAxes();
	drawGrid()
	drawFunctions();
}

function drawFunctions() {

	for (let i=0; i<functions.length; i++) {
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

	let n = screenWidth*(1-commandContainerRatio)/scale

	n /= 5;

	n = nearestTen(n)

	for(let i=roundToNumber(xInterval, n); i<screenWidth/scale + xInterval; i += n) {

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

		ctx.fillText(i, renderX, -yInterval*scale + 20);

	}

	for(let i=roundToNumber(yInterval, n); i<windowHeight/scale + yInterval; i += n) {

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

		ctx.fillText(-i, -xInterval*scale + String(i).length*5+10, renderY + 4);

	}
}


function drawGrid() {

	let ctx = canvas.getContext('2d');

	ctx.strokeStyle = theme.axes
	ctx.lineWidth = 1

	ctx.font = "15px Arial";
	ctx.textAlign = "center";

	let n = screenWidth*(1-commandContainerRatio)/scale

	n /= 20;

	n = nearestTen(n)

	for(let i=roundToNumber(xInterval, n); i<screenWidth/scale + xInterval; i += n) {

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

	for(let i=roundToNumber(yInterval, n); i<windowHeight/scale + yInterval; i += n) {

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

	let n = 0.01

	let minatIzvod = 1
	let sporedbeno = 0.1

	//let vreme = (new Date()).getTime()

	if(!f || f.hidden) {
		return
	}

	let color = f.color
	f = f.f

	let ctx = canvas.getContext("2d")

	for(let i=xInterval; i<screenWidth/scale + xInterval;) {

	ctx.strokeStyle = color
	ctx.lineWidth = 3

	let x = i
	let y = -f(x)


	i += n

	if(isNaN(y))
		continue

	let x2 = i
	let y2 = -f(x2)

	let renderX = (x-xInterval)*scale
	let renderY = (y-yInterval)*scale

	let renderX2 = (x2-xInterval)*scale
	let renderY2 = (y2-yInterval)*scale


	let momentalenIzvod = (-(y2-y)/n)
	let starn = n
	let promena = Math.max(Math.abs((momentalenIzvod - minatIzvod)/n)*10, 2)
	promena = Math.max(1 / promena, 0.01)
	promena = promena*Math.min(Math.sqrt(screenWidth/scale/12), 5)


	// let zaRender = (momentalenIzvod - minatIzvod)/n

	n = promena

		

	if(starn > n) {

	// ctx.fillStyle = "red"

	// ctx.beginPath()
	// ctx.arc(renderX,  (y - yInterval)*scale, 10, 0, 2*3.14);
	// ctx.fill()

		i = i - starn
		continue
	}

	// ctx.fillStyle = "black"

	// ctx.beginPath()
	// ctx.arc(renderX,  (-zaRender - yInterval)*scale, 5, 0, 2*3.14);
	// ctx.fill()	

	minatIzvod = momentalenIzvod

	if(Math.abs(momentalenIzvod) > windowHeight) {
		//asimptota

		ctx.beginPath()
		ctx.moveTo(renderX , renderY)
		ctx.lineTo(renderX, Math.sign(y)*(windowHeight))
		ctx.stroke()

		ctx.beginPath()
		ctx.moveTo(renderX2 , renderY2)
		ctx.lineTo(renderX, Math.sign(y2)*(windowHeight))
		ctx.stroke()

		continue
	}


	ctx.beginPath()
	ctx.moveTo(renderX , renderY)
	ctx.lineTo(renderX2, renderY2)
	ctx.stroke()

	}

	//elapsedTime += (new Date()).getTime() - vreme
	//console.log(elapsedTime)
	//elapsedTime = 0

}



function drawParametric(f) {

	let xFunk = f.xFunk
	let yFunk = f.yFunk

	let color = f.color

	let ctx = canvas.getContext("2d")

	for(let t=0; t<100; t += n) {

	ctx.strokeStyle = color
	ctx.lineWidth = 3

	let x =  xFunk(t)
	let y = -yFunk(t)


	let x2 =  xFunk(t+n)
	let y2 = -yFunk(t+n)

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

	functions[f.id] = {
		f: f.f,
		color: f.color,
		hidden: true,
	}

	let funkcija = function() {

		if(this.smooth > 1) {
			this.smooth = 0
			functions[f.id].hidden = false
			drawFunctions()
			return -1
		}

		let koef = -2*Math.pow(this.smooth,3)+3*Math.pow(this.smooth, 2)

		let funk = {
			f: x => f.f(x)*koef,
			color: f.color
		}

		drawFunction(funk)

		this.smooth += 0.01*(INTERVAL/(1000/60))
	}

	return funkcija.bind({smooth:0});
}

function drawFunctionTransition(f1, f2, id) {

	let funkcija = function() {

		if(this.smooth >= 1) {
			this.smooth = 0
			functions[id].f = f2;
			functions[id].hidden = false
			drawFunctions()
			return -1
		}

		let koef = -2*Math.pow(this.smooth,3)+3*Math.pow(this.smooth, 2)


		let funk = {
			f: x => f1.f(x) + koef*(f2(x) - f1.f(x)),
			color: f1.color,
		}
		

		drawFunction(funk)

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

		this.smooth += 0.01*(INTERVAL/(1000/60))
	}

	return funkcija.bind({smooth:0});
}

function getFreeId() {
	for(let i=0; i<functions.length; i++)
		if(functions[i] == null)
			return i
	return functions.length
}