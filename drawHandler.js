import {state, config} from './app.js'
import {functions, variables, builtInFunctions, builtInVariables} from './itemClass.js';
import {sampleFunctionPoints} from './sampler.js'

var cache = {
	xSpan: null, //interval
	ySpan: null, //interval
	scale: null, //scale of cache
}

let initializeCache = function() {

	cache.xSpan = [toR(-config.width*0.5), toR(config.width*1.5)]
	// cache.yInterval = [yInterval, yInterval+height/scale]
	cache.scale = state.scale
}

let initializeFunctionCache = function(f) {
	f.cache = {}
	f.cache.points = sampleFunctionPoints(f, toPx(cache.xSpan[0]), toPx(cache.xSpan[1]))
}

function resampleFunctions() {
	for(let i=builtInFunctions.length; i<functions.length; i++) {
		initializeFunctionCache(functions[i])
	}
}

let handleDraw = function() {

	initializeCache()
	resampleFunctions()

	return

	let width = config.width;
	let height = config.height;
	let scale = state.scale;

	let xInterval = state.xInterval
	let yInterval = state.yInterval

	if(cache.scale != scale) {
		//trigger redraw
		if(cache.scale > scale) {
			// console.log("zoom out")
			// reduce
			initializeCache()
			resampleFunctions()
		}
		else {
			initializeCache()
			// console.log("zoom in")
			resampleFunctions()
		}
		cache.scale = scale
	}

	let xSpan = [xInterval, width/scale + xInterval]
	let ySpan = [yInterval, height/scale + yInterval]

	let mxSpan = width/scale

	if(xSpan[0] < cache.xSpan[0] || xSpan[1] > cache.xSpan[1])
		console.log("pound the alarm")

	if((xSpan[0] - cache.xSpan[0])/mxSpan < 0.25) {
		//se blizhi do cacheot ili vekje go ima izminato
		//proshiri cacheot na levata nasoka 
		expandFunctionsCache(true)
		// console.log("zavrshiv so")
		// console.log("kon levo shirenje "+cache.xSpan[0]+" "+xSpan[0])
	}

	if((cache.xSpan[1]-xSpan[1])/mxSpan < 0.25) {
		//se blizhi do cacheot ili vekje go ima izminato
		//proshiri cacheot na desnata nasoka
		expandFunctionsCache(false)
		// console.log("zavrshiv so")
		// console.log("kon desno shirenje "+cache.xSpan[1]+" "+xSpan[1])
	}
}

let expandFunctionsCache = function(left) {
	shrinkFunctionsCache(!left)
	for(let i=builtInFunctions.length; i<functions.length; i++) {
		if(functions[i].hidden)
			continue
		if(left)
			expandFunctionCacheLeft(functions[i])
		else
			expandFunctionCacheRight(functions[i])
	}
}

let expandFunctionCacheLeft = function(f) {
	console.log("expanding left for "+f.name)
	let offset = config.width*0.25/state.scale
	let points = sampleFunctionPoints(f, toPx(cache.xSpan[0]-offset), toPx(cache.xSpan[0]))
	f.cache.points.unshift(...points)
	cache.xSpan[0] -= config.width*0.25/state.scale
	cache.xSpan[1] -= config.width*0.25/state.scale	
	console.log(f.cache.points)
}

let expandFunctionCacheRight = function(f) {
	console.log("expanding right for "+f.name)
	let offset = config.width*0.25/state.scale
	let points = sampleFunctionPoints(f, toPx(cache.xSpan[1]), toPx(cache.xSpan[1]+offset))
	f.cache.points.push.apply(f.cache.points, points)
	cache.xSpan[1] += config.width*0.25/state.scale
	cache.xSpan[0] += config.width*0.25/state.scale
	console.log(f.cache.points)
}

let shrinkFunctionsCache = function(left) {
	for(let i=builtInFunctions.length; i<functions.length; i++) {
		if(functions[i].hidden)
			continue
		if(left)
			shrinkFunctionCacheLeft(functions[i])
		else
			shrinkFunctionCacheRight(functions[i])
	}
}

function shrinkFunctionCacheLeft(f) {
	let offset = config.width*0.25/state.scale
	let index = findPointLeft(f.cache.points, cache.xSpan[0]+offset, true)
	f.cache.points.splice(0, index)
}

function shrinkFunctionCacheRight(f) {
	console.log(cache.xSpan[1])
	let offset = config.width*0.25/state.scale
	let index = findPointRight(f.cache.points, cache.xSpan[1]-offset, false)
	f.cache.points.splice(index, f.cache.points.length)
}

function findPointLeft(array, a) {
	let windowRight = toR(config.width)
	for (let i=0; i<array.length-1; i++) {
		if(!array[i+1])
			continue
		if(array[i+1].point[0] > windowRight) 
			return 0
		if(array[i+1].point[0] >= a) {
			return i;
		}
	}
}

function findPointRight(array, a) {
	let windowRight = toR(config.width)
	for (let i = array.length - 1; i > 0; i--) {
		if(!array[i-1])
			continue
		if(array[i-1].point[0] < windowRight)
			return array.length;
		if(array[i-1].point[0] < a) {
			return i;
		}
	}
}

function toPx(R) {
	return Math.floor((R-state.xInterval)*state.scale);
}

function toR(px) {
	return px/state.scale + state.xInterval
}

function checkConsistency(f) {
	let points = f.cache.points
	for(let i=1; i<points.length; i++) {
		if(points[i-1].point[0] - points[i].point[0] > 0.1)
			console.log("ERRROR ZA "+f.name+", ", points[i-1].point[0], points[i].point[0])
	}
}


export {handleDraw, initializeCache, initializeFunctionCache}