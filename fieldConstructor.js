import {state, config} from './app.js';
import {draw} from './draw.js';
import {findField, checkAddField, blurFields} from './FieldManager.js';
import {createInputField, moveCaretToEnd} from './fensitex.js';
import {runInterpreter} from './interpreter.js';
import {FensiInput} from './fensitex/index.js'

var createField = function() {

	let id = Math.round(Math.random()*1000)

	let element = document.createElement("div")
	element.className = "field"
	element.id = -1

	let input = new FensiInput()

	let errorContainer = document.createElement("div")
	errorContainer.className = "fieldErrorContainer"

	let container = document.createElement("div")
	container.className = "fieldSubContainer"

	let text = document.createElement("div")
	text.className = "fieldText"

	let color = document.createElement("div")
	color.className = "fieldColor"

	let colorEntry = document.createElement("div")
	colorEntry.className = "fieldColorEntry"

	let colorText = document.createElement("div")
	colorText.className = "fieldColorText"
	colorText.textContent = "Color"

	let colorButton = document.createElement("div")
	colorButton.innerHTML = '<i class="fas fa-fill-drip"></i>'
	colorButton.className = "fieldColorButton"

	let colorPalette = document.createElement("div")
	colorPalette.className = "colorPalette"

	for(let i=0; i<config.theme.colors.length; i++) {
		
		let colorOption = document.createElement("div")

		colorOption.className = "colorOption"

		colorOption.style.backgroundColor = config.theme.colors[i]

		colorOption.onclick = () => {

			let pickedColor = config.theme.colors[i]

			let field = findField(id)

			field.updateFuncColor(pickedColor);

			draw()
		}

		colorPalette.appendChild(colorOption)
	}

	let sliderContainer = document.createElement("div")
	let slider = document.createElement("input")
	slider.type = "range"
	slider.min = -5
	slider.max = 5
	slider.value = 0
	slider.step = 0.01

	let sliderEditMin = document.createElement("span")
	sliderEditMin.contentEditable = "true"
	let sliderEditMax = document.createElement("span")
	sliderEditMax.contentEditable = "true"

	sliderEditMin.textContent = -5
	sliderEditMax.textContent =  5

	sliderEditMin.addEventListener("keydown", (event) => {
		if(event.keyCode !== 13) //enter
			return
		event.preventDefault()
		slider.min = Number(sliderEditMin.textContent)
		slider.value = Math.max(sliderEditMin.textContent, slider.value)
		let field = findField(id);
		field.value = Number(slider.value);
		draw()
	})

	sliderEditMax.addEventListener("keydown", (event) => {
		if(event.keyCode !== 13) //enter
			return
		event.preventDefault()
		slider.max = Number(sliderEditMax.textContent)
		slider.value = Math.min(sliderEditMax.textContent, slider.value)
		let field = findField(id);
		field.value = Number(slider.value);
		draw()
	})

	sliderContainer.appendChild(sliderEditMin)
	sliderContainer.appendChild(slider)
	sliderContainer.appendChild(sliderEditMax)

	slider.className = "slider"
	sliderContainer.className = "sliderContainer"

	let animationContainer = document.createElement("div")
	animationContainer.className = "animationContainer"

	let animationText = document.createElement("div")
	animationText.className = "animationText"
	animationText.textContent = "Animate"

	let animationToggle = document.createElement("div")
	animationToggle.innerHTML = '<i class="far fa-play-circle"></i>'
	animationToggle.className = "animationButton"

	let animationEditContainer = document.createElement("div")
	animationEditContainer.className = "animationEditContainer"
	let animationEditButton = document.createElement("div")
	animationEditButton.innerHTML = '<i class="fas fa-pen"></i>'
	animationEditButton.className = "animationEditButton"

	animationEditButton.onclick = () => {
		let status = animationEditContainer.style.display

		if(status == "flex")
			animationEditContainer.style.display = "none";
		else
			animationEditContainer.style.display = "flex";
	}

	let animationEditSpeed = document.createElement("div")
	let animationEditStep  = document.createElement("div")

	let animationInputStep  = document.createElement("input")
	let animationInputSpeed = document.createElement("input")

	animationInputStep.type  = "text"
	animationInputStep.value = 0.1

	animationInputSpeed.type = "range"

	// animationEditStep.appendChild(document.createTextNode("Step "))
	// animationEditStep.appendChild(animationInputStep)

	animationEditSpeed.appendChild(document.createTextNode("Speed "))
	animationInputSpeed.min  = 1
	animationInputSpeed.max  = 11
	// animationInputSpeed.step = 1
	animationInputSpeed.value= 5
	animationInputSpeed.oninput = () => {

		let field = findField(id)
		field.changeAnimationSpeed(animationInputSpeed.value)
	}
	animationInputSpeed.className = "slider"
	animationEditSpeed.className  = "sliderContainer"
	animationEditSpeed.appendChild(animationInputSpeed)

	// animationEditContainer.appendChild(animationEditStep)
	animationEditContainer.appendChild(animationEditSpeed)

	slider.oninput = () => {
		let field = findField(id)
		field.value = Number(slider.value);
		field.toggleAnimation(true)
		draw()
	}

	animationToggle.onclick = () => {

		let field = findField(id)
		
		field.toggleAnimation();
		

	}

	colorButton.onclick = () => {

		let status = colorPalette.style.display

		if(status == "block")
			colorPalette.style.display = "none";
		else
			colorPalette.style.display = "block";
	}

	container.appendChild(text)
	colorEntry.appendChild(colorText)
	colorEntry.appendChild(colorButton)
	color.appendChild(colorEntry)
	color.appendChild(colorPalette)
	container.appendChild(color)
	container.appendChild(sliderContainer)
	animationContainer.appendChild(animationText)
	animationContainer.appendChild(animationToggle)
	animationContainer.appendChild(animationEditButton)
	animationContainer.appendChild(animationEditContainer)
	container.appendChild(animationContainer)
	element.appendChild(input)
	element.appendChild(container)
	element.appendChild(errorContainer)
	document.getElementById("commandContainer").appendChild(element)
	return {
		id: id,
		element: element
	}
}

function expandField(reference) {

	let object  = reference.object
	let element = reference.element.firstElementChild

	if(!object.name)
		return;

	if(object.f && object.f.length != 1)
		return

	element.nextSibling.nextSibling.style.display = "none"
	element.nextSibling.style.display = "flex"

}

export {createField}