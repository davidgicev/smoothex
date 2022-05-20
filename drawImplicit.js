import {Interval} from './intervalArithmetic.js'
import {state, config} from './app.js';
import {translateH, translateV} from './transformCanvasData.js'

function drawImplicit(a, b, array) {

	let implicit = globalImplicit

	// renderSubplot(a, b, implicit, array)
	drawImplicitSeq(a, b, array)

	// renderSubplot(
	// 	new Interval(a.lo/scale+xInterval, a.hi/scale+xInterval), 
	// 	new Interval(b.lo/scale+yInterval, b.hi/scale+yInterval),
	// 	implicit, array);
}

function renderSubplot(a, b, implicit, array) {

	let xInterval = state.xInterval;
	let yInterval = state.yInterval;
	let scale = state.scale
	let windowWidth = config.width

	let copya = new Interval(a.lo/scale+xInterval, a.hi/scale+xInterval)
	let copyb = new Interval(b.lo/scale+yInterval, b.hi/scale+yInterval)

	let result = implicit(copya,copyb)

	if(result.lo > 0 || result.hi < 0) {
		for(let i=a.lo; i<a.hi; i++) {
			for(let j=b.lo; j<b.hi; j++) {
				array[4*(i + windowWidth*j)+0] = 0;
				array[4*(i + windowWidth*j)+1] = 0;
				array[4*(i + windowWidth*j)+2] = 0;
				array[4*(i + windowWidth*j)+3] = 0;
			}
		}
		return;
	}

	let La = (a.hi-a.lo)/2;
	let Lb = (b.hi-b.lo)/2;

	if(La + Lb <= 1) {

		array[4*(a.lo + windowWidth*b.lo)+0] = 255;
		array[4*(a.lo + windowWidth*b.lo)+1] = 0;
		array[4*(a.lo + windowWidth*b.lo)+2] = 0;
		array[4*(a.lo + windowWidth*b.lo)+3] = 255;

		return
	}

	renderSubplot(new Interval(a.lo, Math.ceil(a.lo+La)), new Interval(b.lo, Math.ceil(b.lo+Lb)), implicit, array)
	renderSubplot(new Interval(Math.floor(a.lo+La), a.hi), new Interval(b.lo, Math.ceil(b.lo+Lb)), implicit, array)
	renderSubplot(new Interval(a.lo, Math.ceil(a.lo+La)), new Interval(Math.floor(b.lo+Lb), b.hi), implicit, array)
	renderSubplot(new Interval(Math.floor(a.lo+La), a.hi), new Interval(Math.floor(b.lo+Lb), b.hi), implicit, array)
}

function drawImplicitSeq(start, end, array) {

	let implicit = globalImplicit

	let xInterval = state.xInterval;
	let yInterval = state.yInterval;
	let scale = state.scale
	let windowWidth = config.width

	let a,b;

	for(let i=start.lo; i<=start.hi; i++) {
		for(let j=end.lo; j<=end.hi; j++) {
			a = new Interval(i/scale+xInterval, (i+1)/scale+xInterval);
			b = new Interval(j/scale+yInterval, (j+1)/scale+yInterval);

			let result = implicit(a,b.flip())

			array[4*(i + windowWidth*j)+0] = 0;
			array[4*(i + windowWidth*j)+1] = 0;
			array[4*(i + windowWidth*j)+2] = 0;
			array[4*(i + windowWidth*j)+3] = 0;

			if(result.lo > 0 || result.hi < 0)
				continue;

			array[4*(i + windowWidth*j)+0] = 255;
			array[4*(i + windowWidth*j)+3] = 255;
		}
	}
}

function testSeq() {
	let length = 4*config.width*config.height;

	let uint = new Uint8ClampedArray(length);

	// let ctx = canvas.getContext('2d')

	// let uint = ctx.getImageData(0,0,Application.config.width, Application.config.height).data;

	// for (let i = 0; i < uint.length; i += 4) {
	// 	// uint[i + 0] = 255;   
	// 	// uint[i + 1] = 0;  
	// 	// uint[i + 2] = 0;    
	// 	// uint[i + 3] = 0;
	// }

	console.log("TESTING")
	let start = performance.now();
	for(let i=0; i<10; i++)
		drawImplicitSeq(
			new Interval(0, config.width),
			new Interval(0, config.height), 
			uint);
	console.log(performance.now()-start)

	globalMemoryImageTestThing = uint;

	// let image = new ImageData(uint, Application.config.width, Application.config.height);

	// ctx.putImageData(image, 0, 0)
}

function testUint() {

	let length = 4*config.width*config.height;

	let uint = new Uint8ClampedArray(length);

	// let ctx = canvas.getContext('2d')

	// let uint = ctx.getImageData(0,0,Application.config.width, Application.config.height).data;

	// for (let i = 0; i < uint.length; i += 4) {
	// 	uint[i + 0] = 255;   
	// 	uint[i + 1] = 0;  
	// 	uint[i + 2] = 0;    
	// 	uint[i + 3] = 255;
	// }

	console.log("TESTING")
	let start = performance.now();
	// for(let i=0; i<10; i++)
		drawImplicit(
			new Interval(0, config.width), 
			new Interval(0, config.height), 
			uint);

	console.log(performance.now()-start)

	globalMemoryImageTestThing = uint;

	// let image = new ImageData(uint, Application.config.width, Application.config.height);

	// ctx.putImageData(image, 0, 0)
}

const Application = {
	config: {
		windowWidth: window.innerWidth,
		windowHeight: window.innerHeight,

	}

}

const canvas = document.getElementById("screen")

function panTest() {

	let length = 4*config.width*config.height;

	if(!globalMemoryImageTestThing)
		testUint()

	let uint = globalMemoryImageTestThing;

	let ctx = canvas.getContext('2d')

	let width  = config.width
	let height = config.height
	let amount = state.mouseX-state.lastMouseX;

	translateH(uint, state.mouseX-state.lastMouseX)
	translateV(uint, state.mouseY-state.lastMouseY)

	if(amount < 0) {
		drawImplicitSeq(new Interval(width+amount, width), new Interval(0,height), uint)
	}
	else if(amount > 0) {
		drawImplicitSeq(new Interval(0, amount), new Interval(0,height), uint)
	}

	amount = state.mouseY-state.lastMouseY;

	if(amount < 0) {
		drawImplicitSeq(new Interval(0,width), new Interval(height+amount, height), uint)
	}
	else if(amount > 0) {
		drawImplicitSeq(new Interval(0,width), new Interval(0, amount), uint)
	}

	let image = new ImageData(uint, config.width, config.height);

	ctx.putImageData(image,0,0)
}

var globalMemoryImageTestThing;

function drawImplicitBest(start, end, array) {
	//horizontal test
	let implicit = globalImplicit

	let xInterval = state.xInterval;
	let yInterval = state.yInterval;
	let scale = state.scale

	let points = 0;

	let a,b;
	let mid = end.lo+Math.floor((end.hi-end.lo)/2);

	b = new Interval(mid/scale+yInterval, (mid+1)/scale+yInterval);

	for(let i=start.lo; i<=start.hi; i++) {

		a = new Interval(i/scale+xInterval, (i+1)/scale+xInterval);

		let result = implicit(a,b.clone().flip())

		if(result.lo <= 0 && result.hi >= 0)
			points++;
	}

	mid = start.lo+Math.floor((start.hi-start.lo)/2);

	a = new Interval(mid/scale+xInterval, (mid+1)/scale+xInterval);

	for(let i=end.lo; i<=end.hi; i++) {

		b = new Interval(i/scale+yInterval, (i+1)/scale+yInterval);

		let result = implicit(a.clone(),b.clone().flip())

		if(result.lo <= 0 && result.hi >= 0)
			points++;
	}

	if(points < (start.hi-start.lo+end.hi-end.lo)/10) {
		drawImplicit(start, end, array)
	}
	else {
		drawImplicitSeq(start,end,array)
	}
}

function testDrawImplicitBest() {

	let length = 4*config.width*config.height;

	let uint = new Uint8ClampedArray(length);

	console.log("TESTING")
	let start = performance.now();
	for(let i=0; i<100; i++)
		drawImplicitBest(
			new Interval(0, config.width), 
			new Interval(0, config.height), 
			uint);

	console.log(performance.now()-start)
}

// var globalImplicit = (x,y) => x.divide(new Interval(0.5)).sin().subtract(y.divide(new Interval(0.5)).cos()).subtract(new Interval(0.2))
var globalImplicit = (x,y) => x.clone()
								.sin().pow(new Interval(2))
								.add(x.clone().cos().pow(new Interval(2)))
								.subtract(new Interval(1))

// panTest()