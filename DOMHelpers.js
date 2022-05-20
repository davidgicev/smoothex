function toggleOptions(event) {

	Application.AnimationHandler.toggleOptionsButton();
}


function toggleTheme(event) {

	Application.AnimationHandler.toggleTheme();

}

function splashAnimationScreen(color, callback, mouseX, mouseY) {

	let ctx = canvas.getContext("2d")
	ctx.save()
	ctx.beginPath()
	ctx.rect(0,0,0,0)
	ctx.clip()

	let funkcija = function() {

		if(this.smooth > 1) {
			callback()
			ctx.restore()
			draw()
			return -1
		}

		let koef = -(Math.cos(Math.PI * this.smooth) - 1) / 2; //-2*Math.pow(this.smooth,3)+3*Math.pow(this.smooth, 2)

		splashScreen(color, koef, this.mouseX, this.mouseY, this.radius)

		this.smooth += 0.02*(INTERVAL/(1000/60))*globalAnimationKoef
	}

	return {
		f: funkcija.bind({smooth: 0, mouseX: mouseX, mouseY: mouseY,
			radius: Math.sqrt(Math.pow(windowWidth, 2)+Math.pow(windowHeight, 2))
				})
	}
}


function animationKoef(event) {
	let options = [1, 2, 5, 0.5, 0.25]
	let index = options.findIndex(x => x == Application.config.globalAnimationKoef)
	index = (index+1)%options.length
	Application.config.globalAnimationKoef = options[index]
	document.getElementById("animationKoef").innerHTML = options[index] + "x"
}

function displayError(index, error) {
	let element = document.getElementById("commandContainer").children[index]
	element.children[1].style.display = 'none'
	element.children[2].style.display = "flex"
	element.children[2].innerHTML = error
}


function updateVariable(field, value) {

	field.object.value = value;
	variables.find(x => x.name == field.object.name).value = value;
	let base = field.element.firstElementChild.firstElementChild
	field.element.children[1].children[2].children[1].value = value
	if(base.children.length > 2) {
		base.children[2].textContent = " = " + value;
		while(base.children.length != 3) {
			base.remove(base.lastElementChild)
		}
	}
	else if(base.children.length == 1) {
		base.firstElementChild.textContent = field.object.name + " = " + value;
	}

}




function stopAnimation(animationContainer) {

	let index = contains(animations, "id", animationContainer.name);

	if(index == -1)
		return

	animations.splice(index, 1);

	animationContainer.children[1].innerHTML = '<i class="far fa-play-circle"></i>'
}

export { splashLeftPanel, splashScreen }