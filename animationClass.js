import * as App from './app.js';
import {functions, variables} from './itemClass.js'
import {draw} from './draw.js'
import {initializeFunctionCache} from './drawHandler.js'

var INTERVAL = Math.ceil(1000/60);
var currentTime = 0, lastTime = (new Date()).getTime(), delta = 0;

var animations = [];
var transitions = [];

var transition = function() {

	animations = []
	// draw()

	// disableInputs()

	let object = {
		main: function () {

			currentTime = (new Date()).getTime()
			delta = currentTime - lastTime;

			if(delta < INTERVAL) {
				requestAnimationFrame(this.main);
				return
			}

			lastTime = currentTime - (delta % INTERVAL)

			if(transitions.length)
				requestAnimationFrame(this.funk)
			else {
				draw()
				return
			}

			requestAnimationFrame(this.main)
		},
		funk: function() {
			// if(transitions[0]() == -1) {
			// 	transitions.splice(0, 1)
			// }
			for(let i=0; i<transitions.length; i++) {
				if(transitions[i]() == -1) {
					transitions.splice(i, 1)
					i--
				}
			}

			draw()
		},
		transitions: transitions
	}
	object.main = object.main.bind(object)
	object.funk = object.funk.bind(object)
	object.main()
}

var animate = function() {

	let object = {
		main: function () {

			currentTime = (new Date()).getTime()
			delta = currentTime - lastTime;

			if(delta < INTERVAL) {
				requestAnimationFrame(this.main);
				return
			}

			lastTime = currentTime - (delta % INTERVAL)

			if(this.animations.length)
				requestAnimationFrame(this.funk)
			else {
				return
			}

			requestAnimationFrame(this.main)
		},
		funk: function() {
			draw()
			for(let i=0; i<animations.length; i++) {
				if(animations[i].f() == -1) {
					animations.splice(i, 1)
					i--
				}
			}
		},
		animations: animations
	}
	object.main = object.main.bind(object)
	object.funk = object.funk.bind(object)
	object.main()
}

var drawFunctionInit = function() {
	let ref = functions[functions.length-1];

	let orginalna = ref.f;

	let funkcija = function() {

		if(this.smooth > 1) {

			ref.f = orginalna

			return -1
		}

		let koef = -2*Math.pow(this.smooth,3)+3*Math.pow(this.smooth, 2)

		ref.f = x => orginalna(x)*koef;
		this.smooth += App.config.globalAnimationKoef*0.01*(INTERVAL/(1000/60))

		initializeFunctionCache(ref)
	}
	let result = funkcija.bind({smooth:0})
	transitions.push(result)
	return result;
}

var drawFunctionTransition = function(f1) {
	let ref = functions[functions.length-1];
	ref.cache = {}
	let f1Copy = f1.f;
	let f2Copy = ref.f;

	try {
		f1Copy(0)
	} catch(e) {
		return drawFunctionInit()
	}

	let funkcija = function() {

		if(this.smooth >= 1) {

			ref.f = f2Copy

			return -1
		}

		let koef = -2*Math.pow(this.smooth,3)+3*Math.pow(this.smooth, 2)


		ref.f = x => {
			return Number(f1Copy(x)) + koef*(f2Copy(x) - f1Copy(x))	
		}
		// initializeFunctionCache(ref)
		this.smooth += App.config.globalAnimationKoef*0.01*(INTERVAL/(1000/60))
	}

	let result = funkcija.bind({smooth:0})
	transitions.push(result)
	return result;
}

var drawVariableTransition = function(field) {

	let ref = variables[variables.length-1];

	let v1Copy = isNaN(field.object.value) ? 0 : Number(field.object.value);
	let v2Copy = isNaN(ref.value) ? 0 : Number(ref.value);

	let funkcija = function() {

		if(this.smooth >= 1) {

			field.value = v2Copy
			return -1
		}

		let koef = -2*Math.pow(this.smooth,3)+3*Math.pow(this.smooth, 2)

		let newValue = v1Copy + koef*(v2Copy-v1Copy)

		field.value = newValue;
		this.smooth += App.config.globalAnimationKoef*0.025*(INTERVAL/(1000/60))
	}

	let result = funkcija.bind({smooth:0})
	transitions.push(result)
	return result;
}

var animateVariable = function(field) {

	let sliderContainer = field.html.sliderContainer;

	let min = sliderContainer.children[0].textContent
	min = Number(min)
	let max = sliderContainer.children[2].textContent
	max = Number(max)
	// let step = animationContainer.children[3].children[2].children[0].value
	// step = Number(step)
	let speed = sliderContainer.nextSibling.children[1].firstChild.firstElementChild.value
	speed = Number(speed)

	let funkcija = {
		f: function() {

			if(this.period > max || this.period < min) {
				this.speed *= -1
			}

			this.period += this.speed*0.005*((max-min)/10)
			field.value = this.period;
			// xInterval += this.speed*0.005*((max-min)/10)

		},
		id: field.id,
		speed: speed,
		period: Number(field.object.value)
	}

	funkcija.f = funkcija.f.bind(funkcija)

	return funkcija;
}

var changeAnimationSpeed = function(field, value) {

    let index = animations.findIndex(x => x.id == field.id);
    if (index == -1)
        return
    let currentSpeed = animations[index].speed
    animations[index].speed = Math.sign(currentSpeed) * value


}

var toggleAnimation = function(field, stop) {
	
	let index = animations.findIndex(x => x.id == field.id);
	
	if(index != -1) {
		animations.splice(index, 1);
	}
	else if(!stop) {
		animations.push(animateVariable(field))
	}

	animate()

	return index == -1 && !stop;
}

export {
	transition, animate, drawFunctionInit, drawVariableTransition, drawFunctionTransition, animateVariable, 
	toggleAnimation, animations, changeAnimationSpeed, transitions
};