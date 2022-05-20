var worker = new Worker("./workerInstance.js");;

worker.addEventListener("message", function(message) {
	// console.log("received message from worker");
	if(message.data.array) {
		localUint = message.data.array;
		// console.log("main: sega e kaj mene")
	}
	else {
		// console.log("main: dobiv potvrda bez uint")
	}

	if(localUint.length != 0)
		refreshCanvas(localUint);
})

function refreshCanvas(localUint) {

	console.log("refreshnuvam")
	
	let ctx = canvas.getContext('2d')

	let image = new ImageData(localUint, Application.config.windowWidth, Application.config.windowHeight);

	ctx.putImageData(image,0,0)

	Application.draw()
}

var localUint = new Uint8ClampedArray(4*Application.config.windowWidth*Application.config.windowHeight);

var specifichno = 12;


function workerPan() {

	let width  = Application.config.windowWidth
	let height = Application.config.windowHeight
	let amount = [mouseX-lastMouseX, mouseY-lastMouseY];

	let uint = localUint;


	if(localUint.length == 0) {
		// console.log("main: ne e kaj mene momentalno ama prakjam poraka")
		worker.postMessage({config: {
			width, height, amount, 
			xInterval: Application.xInterval, yInterval:Application.yInterval,
			scale: Application.config.scale
		}})
		return;
	}

	// if(!globalMemoryImageTestThing)
	// 	testUint()



	// translateH(uint, mouseX-lastMouseX)
	// translateV(uint, mouseY-lastMouseY)

	// console.log("main:kaj mene e i prakjam poraka")
	worker.postMessage({config: {
			width, height, amount, 
			xInterval: Application.xInterval, yInterval:Application.yInterval,
			scale: Application.scale,
		}, array: uint
	}, [uint.buffer])


	// if(amount < 0) {
	// 	worker.postMessage({start: {lo: width+amount, hi: width}, end: {lo: 0, hi: height}, array: uint}, [uint.buffer])
	// }
	// else if(amount > 0) {
	// 	worker.postMessage({start: {lo: 0, hi: amount}, end: {lo: 0, hi: height}, array: uint}, [uint.buffer])
	// }

	// amount = mouseY-lastMouseY;

	// if(amount < 0) {
	// 	worker.postMessage({start: {lo: 0, hi:width}, end: {lo: height+amount, hi: height}, array: uint}, [uint.buffer])
	// }
	// else if(amount > 0) {
	// 	worker.postMessage({start: {lo: 0, hi:width}, end: {lo: 0, hi: amount}, array: uint}, [uint.buffer])
	// }

}