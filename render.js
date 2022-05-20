import {state, config} from './app.js';

var canvas = document.getElementById("screen")

function renderFunction(f) {

	if(!f.cache || !f.cache.points) {
		return
	}

	let xInterval = state.xInterval;
	let yInterval = state.yInterval;
	let windowWidth  = config.width;
	let windowHeight = config.height;
	let scale = state.scale

	let ctx = canvas.getContext("2d")

	let points = f.cache.points

	ctx.strokeStyle = f.color
	ctx.lineWidth = 3
	ctx.beginPath();

	for(let i=0; i<points.length; i++) {

		if(points[i] === null) {
			ctx.stroke()
			ctx.beginPath()
			continue
		}
		
		let x = (points[i].point[0]-xInterval)*scale
		let y = (points[i].point[1]-yInterval)*scale

		y = Math.min(Math.max(y, -100), 2*windowHeight)

		if(!points[i].asymptote) {
			ctx.lineTo(x, y)
		}
		else {
			ctx.lineTo(x, y)
			ctx.lineTo(x, points[i].asymptote>0 ? -100 : 2*windowHeight)
			ctx.moveTo(x, y)
		}
	}
	ctx.stroke()	

}

export {renderFunction}