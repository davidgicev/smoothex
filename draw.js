function draw() {
	drawAxes();
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

	n = Math.min(0.02/(scale/windowWidth), 0.01)

	ctx.strokeStyle = "white"
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


	for(let i=Math.floor(xInterval); i<screenWidth/scale + xInterval; i += 1) {

		let x = i
		let renderX = (i-xInterval)*scale 

		ctx.lineWidth = 1

		ctx.fillStyle = "white"

		ctx.beginPath()
		let length = 5
		ctx.moveTo(renderX, -yInterval*scale -5)
		ctx.lineTo(renderX, -yInterval*scale + 5)
		ctx.stroke()


		if(i == 0)
			renderX -= 10

		ctx.fillText(i, renderX, -yInterval*scale + 20);

	}

	for(let i=Math.floor(yInterval); i<windowHeight/scale + yInterval; i += 1) {

		let y = i
		let renderY = (i-yInterval)*scale 

		ctx.lineWidth = 1

		ctx.fillStyle = "white"

		ctx.beginPath()
		let length = 5
		ctx.moveTo(-xInterval*scale + 5, renderY)
		ctx.lineTo(-xInterval*scale - 5, renderY)
		ctx.stroke()


		if(i == 0)
			continue

		ctx.fillText(i, -xInterval*scale + 15, renderY + 5);

	}
}

function drawFunction(f) {

	let n = 0.1;
	let minatIzvod = 1

	if(!f || f.hidden) {
		return
	}

	let color = f.color
	f = f.f

	let ctx = canvas.getContext("2d")

	for(let i=xInterval; i<screenWidth/scale + xInterval; i += n) {

	ctx.strokeStyle = color
	ctx.lineWidth = 3

	let x = i
	let y = -f(x)


	let x2 = i+n
	let y2 = -f(x2)

	// let momentalenIzvod = (y2-y)/n
	// n = Math.max(Math.min(1/((momentalenIzvod - minatIzvod)/n + 0.01), 0.5), 0.01)
	// console.log(n)
	// minatIzvod = momentalenIzvod

	if(Math.abs((y-y2)*scale) > windowHeight) {
		continue
	}

	let renderX = (x-xInterval)*scale
	let renderY = (y-yInterval)*scale

	let renderX2 = (x2-xInterval)*scale
	let renderY2 = (y2-yInterval)*scale

	// let renderN = (-n-yInterval)*scale

	// ctx.beginPath()
	// ctx.arc(renderX, renderN, 2, 0, 2*3.14)
	// ctx.fillStyle = "white"
	// ctx.fill()

	ctx.beginPath()
	ctx.moveTo(renderX , renderY)
	ctx.lineTo(renderX2, renderY2)
	ctx.stroke()
	ctx.fill()
	}
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