import {config, state} from './app.js'
import {Interval} from './intervalArithmetic.js'

function toR(px) {
	return px/state.scale + state.xInterval
}

let sampleFunctionPoints = function(f, a, b) {

	if(f.f.length != 1)
		return

	// console.log('sampling')

	let xInterval = state.xInterval;
	let yInterval = state.yInterval;
	let screenWidth  = config.width;
	let windowHeight = config.height;
	let scale = state.scale
	let points = []
	let pointCounter = 0
	let F = f

	f = f.f

	let x2 = a/scale + xInterval
	let y2 = -f(x2)

	let x3 = (a+1)/scale + xInterval
	let y3 = -f(x3)

	let x1, y1;

	let renderX1 = a
	let renderY1 = a+1

	let renderX2, renderX3, renderY2, renderY3;

	points.push({point: [x2, y2]})

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

		let range = F.cif(new Interval(x2, x3))


		if(!range.defined) {
			
			if(!range.isEmpty() && !range.isFinite()) { //ima asimptoti
				// if(x2 < 10 && x2 > -10)
				// 	console.log({point: [x2, y2], extra: true, infinities: [range.lo, range.hi]})
				points.push({point: [x2, y2], infinities: [range.lo, range.hi], extra: true})	
			}
			else {					//ima jump
				points.push({point: [x2, y2], extra: true})
			}

			x2 = x1
			y2 = y1
			continue
		}

		// if(0.5*(Math.abs(y2-y1)+Math.abs(y3-y2))+2*Math.abs(y3-y1) < 0.5/scale) {
		// if(Math.abs((x3-x1)*(y1-y2)-(x1-x2)*(y3-y1))*scale*scale < 0.5) {
		// 	x2 = x1;
		// 	y2 = y1;
		// 	continue;
		// }

		// let testResult = midpointTest(F, x2, x3, range);

		points.push({point: [x2, y2]})
		pointCounter++;

	}

	points.push({point: [x3, y3]})
	postProcessing(points, F)
	// console.log(points.length)
	return points
}

function postProcessing(points, f) {
	for(let i=0; i<points.length; i++) {
		
		if(!points[i]) {
			continue
		}

		if(!points[i].extra)
			continue

		if(points[i].infinities)
			handleInf(points, i, f)
		else
			i += handleJump(points, i, f)
	}
}

function handleInf(points, index, f) {

	let xInterval = state.xInterval;
	let yInterval = state.yInterval;
	let screenWidth  = config.width;
	let windowHeight = config.height;
	let scale = state.scale

	let x1 = points[index].point[0]
	let y1 = points[index].point[1]

	let x2 = x1 + 0.5/scale
	let y2 = -f.f(x2)

	let x3 = x1 + 1/scale
	let y3 = -f.f(x3)
	
	let inf = points[index].infinities

	let iv1 = f.cif(new Interval(x1, x2))
	let iv2 = f.cif(new Interval(x2, x3))

	print("gledam za ", points[index])
	print(x1, x2, x3)
		print(iv1, iv2)

	// if(!isFinite(y1) || !isFinite(y3)) {
	// 	print("infinity na granicite")
	// 	points.splice(index, 1, {point: [x3, y3], asymptote: Math.sign(inf[0]+inf[1])}, null)
	// 	return
	// }

	if(isFinite(inf[0]) || isFinite(inf[1])) {
		print("eden infinity")

		let steps = 5
		points.splice(index, 1, {point: [x1, y1]})
		print(x1,x2,x3)
		print(y1,y2,y3)
		if(iv1.defined || iv1.isEmpty()) {
		// if(iv1.isFinite()) {
			print("desno e asimp")
			if(determineSide(x2, x3, f, 5)) { // the asymptote is first
				print("asymptote is first")
				points.splice(index+1, 0, {point: [x2, y2], asymptote: Math.sign(iv2.lo+iv2.hi)}, null, {point: [x3, y3]})
			}
			else {
				print("asymptote is second")
				points.splice(index+1, 0, {point: [x2, y2]}, null, {point: [x3, y3], asymptote: Math.sign(iv2.lo+iv2.hi)})
			}
		}
		else {
			print("levo e asimp")
			if(determineSide(x1, x2, f, 5)) { // the asymptote is first
				print("asymptote is first")
				points.splice(index+1, 0, {point: [x1, y1], asymptote: Math.sign(iv1.lo+iv1.hi)}, null, {point: [x3, y3]})
			}
			else {
				print("asymptote is second")
				points.splice(index+1, 0, {point: [x1, y1]}, null, {point: [x3, y3], asymptote: Math.sign(iv1.lo+iv1.hi)})
			}
		}



		// points.splice(index, 1, null, {point: [x1,y1], asymptote: Math.sign(inf[0]+inf[1])}, null)
		return	
	}

	print("vo edna od polovinite e")
	
	points.splice(index, 1, {point: [x1, y1]})
	if(iv1.isFinite()) {
		print("levo")
		points.splice(index+1, 0, {point: [x2, y2], asymptote: -Math.sign(y2-y1)}, null, {point: [x3, y3], asymptote: Math.sign(y2-y1)})
	}
	else {
		print("desno")
		points.splice(index+1, 0, {point: [x1, y1], asymptote: -Math.sign(y3-y2)}, null, {point: [x2, y2], asymptote: Math.sign(y3-y2)})
	}
}

function handleJump(points, index, f) {

	// if(isNaN(points[index].point[1]))
	// 	points.splice(index, 1)

	// console.log("jump!")
	// console.log(points[index].point)

	let xInterval = state.xInterval;
	let yInterval = state.yInterval;
	let screenWidth  = config.width;
	let windowHeight = config.height;
	let scale = state.scale

	let x1 = points[index].point[0]
	let y1 = points[index].point[1]

	let x2 = x1 + 0.5/scale
	let y2 = -f.f(x2)

	let x3 = points[index+1].point[0]
	let y3 = points[index+1].point[1]
	
	let inf = points[index].infinities

	let iv1 = f.cif(new Interval(x1, x2))
	let iv2 = f.cif(new Interval(x2, x3))

	if(iv1.isEmpty() && iv2.isEmpty()) {
		points.splice(index, 1)
		return -1
	}

	let step = 5+Math.floor(Math.max(Math.log2(state.zoom), 0))
	let mid = findMidJump(x1, x3, f, step)

	if(f.cif(mid.clone()).isEmpty()) {
		//uh oh
	}

	if(isNaN(f.f(mid.lo))) {
		print("dupkata e levo")
		// console.log({point: [mid.hi, -f.f(mid.hi)], infinities: points[index].infinities})
		points.splice(index, 1, null, {point: [mid.hi, -f.f(mid.hi)], infinities: points[index].infinities})
	}
	else {					
		print("dupkata e desno")
		// console.log({point: [mid.lo, -f.f(mid.lo)], infinities: points[index].infinities})
		points.splice(index, 1, {point: [mid.lo, -f.f(mid.lo)], infinities: points[index].infinities}, null)
	}

	return 0
}

function findMidJump(a, b, f, step) {

	if(step == 0) {
		return new Interval(a,b)
	}
	
	let m = (a+b)/2;
	let i1 = f.cif(new Interval(a, m))
	let i2 = f.cif(new Interval(m, b))

	if(!i1.isEmpty() && !i1.defined) {
		return findMidJump(a, m, f, step-1)
	}
	else {
		return findMidJump(m, b, f, step-1)
	}
}

function print(txt) {
	if(!config.globalDebugging)
		return
	if(arguments.length > 1) {
		for(let s of arguments) {
			print(s)
		}
		return
	}
	console.log(txt)
}

function determineSide(a, b, f, s) { // returns true if it's on the left
	
	print(a,b,s)
	print(f.f(a), f.f(b))

	if(s == 0) {
		if(isNaN(f.f(a)))
			return false;
		if(isNaN(f.f(b)))
			return true;
		print(a,b)
		print(Math.abs(f.f(a)), Math.abs(f.f(b)))
		return Math.abs(f.f(a)) > Math.abs(f.f(b))
	}

	let m = (a+b)/2

	let am = f.cif(new Interval(a, m))
	let mb = f.cif(new Interval(m, b))

	print(am, mb)

	if(am.defined && !mb.isEmpty()) {
		print("odam desno")
		return determineSide(m, b, f, s-1)
	}
	else {
		print("odam levo")
		return determineSide(a, m, f, s-1)
	}
}

export {sampleFunctionPoints}