let canvasArray = [];
let canvasTarget;

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function initializeCanvases() {

	let start = performance.now();

	for(let i=0; i<20; i++) {
	    canvasArray.push(document.createElement("canvas"))
	}

	for(let i=0; i<canvasArray.length; i++) {
	    canvasArray[i].width = 2000;
	    canvasArray[i].height = 2000;
	}

	canvasTarget = document.createElement("canvas")

	canvasTarget.width = 2000;
	canvasTarget.height = 2000;
	console.log(performance.now() - start)
}

function populateCanvases() {

	let start = performance.now();

	for(let i=0; i<canvasArray.length; i++) {
	    let ctx = canvasArray[i].getContext("2d");
	    ctx.clearRect(0,0,2000,2000);
	    ctx.strokeStyle = getRandomColor();
	    for(let j=0; j<1000; j++) {
	        ctx.beginPath();
	        ctx.arc(Math.random()*2000, Math.random()*2000, 20, 0, Math.PI*2);
	        ctx.stroke();
	    }
	}
	console.log(performance.now() - start)
}

function layerCanvases() {
	let start = performance.now()
	let ctx = canvasTarget.getContext("2d")
	ctx.clearRect(0,0,2000,2000)
	let canvasArrayL = canvasArray
	for(let i=0; i<canvasArray.length; i++) {
	    ctx.drawImage(canvasArrayL[i], 0, 0);
	}
	document.getElementById("screen").getContext("2d").drawImage(canvasTarget,0,0)
	console.log(performance.now()-start)
}

function runTest() {
	initializeCanvases();
	populateCanvases();
	layerCanvases();
}

function testImplicit() {
	
}