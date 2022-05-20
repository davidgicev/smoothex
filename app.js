import {draw} from './draw.js';
import {animations, animate} from './animationClass.js'
import {animateSetup} from './setupAnimation.js'

var animateSetupBool = true

var config = {
	width:  window.innerWidth,
	height: window.innerHeight,
	animateSetup: animateSetupBool,
	globalAnimationKoef: 1,
	commandContainerRatio: 0.2,
	globalFontSize: 25,
	theme: null,
	setupState: {
		axes: !animateSetupBool,
		grid: !animateSetupBool,
	},
	globalDebugging: false
}

var state = {
	mouseX: 0,
	mouseY: 0,
	lastMouseX: 0,
	lastMouseY: 0,
	xInterval: 0,
	yInterval: 0,
	shift: false,
	isMouseDown: false,
	zoom: 1,
	scale: Math.max(config.width, config.height)/13,
	resizingMode: false,
}

state.xInterval = -config.width/state.scale/2 - 
((config.animateSetup) ? 0 : config.width*config.commandContainerRatio/state.scale/2);

state.yInterval = -config.height/state.scale/2

// findInnerSubfieldLeft(container).focus()

if(config.animateSetup) {
	animateSetup()
}

export {state, config};
