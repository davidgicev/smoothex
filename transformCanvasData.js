import {state, config} from './app.js'

export function translateH(array, amount) {

	let width  = config.windowWidth
	let height = config.windowHeight

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

export function translateV(array, amount) {

	let width  = config.windowWidth
	let height = config.windowHeight

	if(amount < 0) {
		array.copyWithin(0,-config.windowWidth*4*amount)
		// drawImplicitSeq(new Interval(0,width), new Interval(height+amount*2, height), array)
	}
	else if(amount > 0) {
		array.copyWithin(config.windowWidth*4*amount)
		// drawImplicitSeq(new Interval(0,width), new Interval(0, amount*2), array)
	}

	return array;
}

