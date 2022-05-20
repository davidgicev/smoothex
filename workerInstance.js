
if('function' === typeof importScripts) {
	this.importScripts('intervalArithmetic.js');
	this.localUint = null;
	this.config = null;
}

this.onmessage = function(message) {
	if(message.data.array) {
		this.localUint = message.data.array;
		// console.log("worker: poraka sodrzhi uint");
	}
	if(!this.localUint || this.localUint.length == 0) {
		// console.log("worker: poraka bez uint")
	}
	this.config = message.data.config
	workerPanWorker()
}



var startTime = 0;

function drawImplicitSeq(start, end, array) {

	let implicit = globalImplicit

	let xInterval = this.config.xInterval;
	let yInterval = this.config.yInterval;
	let scale = this.config.scale
	let windowWidth = this.config.width

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

var globalImplicit = (x,y) => x.subtract(new Interval(2))//x.sin().subtract(y.cos()).subtract(new Interval(0.2))


function workerPanWorker() {

	// if(!globalMemoryImageTestThing)
	// 	testUint()

	let width = this.config.width, height = this.config.height, amount = this.config.amount;

	let uint = this.localUint;

	if(uint.length == 0) {
		return;
	}

	translateH(uint, amount[0])
	translateV(uint, amount[1])

	// worker.postMessage({start: {lo: width+amount, hi: width}, end: {lo: 0, hi: height}, array: uint}, [uint.buffer])

	if(amount[0] < 0) {
		drawImplicitSeq(new Interval(width+amount[0], width), new Interval(0,height), uint)
	}
	else if(amount[0] > 0) {
		drawImplicitSeq(new Interval(0, amount[0]), new Interval(0,height), uint)
	}

	if(amount[1] < 0) {
		drawImplicitSeq(new Interval(0,width), new Interval(height+amount[1], height), uint)
	}
	else if(amount[1] > 0) {
		drawImplicitSeq(new Interval(0,width), new Interval(0, amount[1]), uint)
	}

	// uint.fill(150, 0, width*height*4)


	// let image = new ImageData(uint, Application.config.windowWidth, Application.config.windowHeight);

	// console.log("worker: prakjam kon main so uint")
	this.postMessage({array: this.localUint}, [this.localUint.buffer])		
}

function translateH(array, amount) {

	if(amount < 0) {
		array.copyWithin(0,-4*amount)
		// drawImplicitSeq(new Interval(width+amount*2, width), new Interval(0,height), array)
	}
	else if(amount > 0) {
		array.copyWithin(4*amount)
		// drawImplicitSeq(new Interval(0, amount*2), new Interval(0,height), array)
	}


	return array;
}

function translateV(array, amount) {

	let width  = this.config.width

	if(amount < 0) {
		array.copyWithin(0,-width*4*amount)
		// drawImplicitSeq(new Interval(0,width), new Interval(height+amount*2, height), array)
	}
	else if(amount > 0) {
		array.copyWithin(width*4*amount)
		// drawImplicitSeq(new Interval(0,width), new Interval(0, amount*2), array)
	}

	return array;
}

