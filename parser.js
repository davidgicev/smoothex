function parseInput(input) {

	input = input.replace(/ /g,'')

	console.log("parseInput: "+input)

	let EqualsIndex = input.indexOf("=")

	if(EqualsIndex == -1 || input.indexOf("(x)") == EqualsIndex - 3) {
		// f(x) = neshto

		let name = EqualsIndex == -1 ? getFreeName() : input.substring(0, EqualsIndex - 3)
		
		let object = {
			name: name,
			f: null,
			color: getRandomColor(),
			id: null,
			nameless: EqualsIndex == -1
		} 

		let result = parseExpression(input.substring(EqualsIndex + 1))

		try {			
			console.log("object.f = x => " + result.parsed)
			eval("object.f = x => " + result.parsed)
		}catch(e) {
			console.log("Invalid Input:")
			console.log(e)
			if(e)
				return 0;
		}

		object.readable = result.readable
		
		return object
	}
	else if(input.indexOf("(x)") == -1 || input.indexOf("(x)") > EqualsIndex) {
		// a = neshto

		let name = input.substring(0,EqualsIndex)

		let object = {
			name: name,
			value: null
		}

		try{
		eval("object.value = " + parseExpression(input.substring(EqualsIndex + 1)).parsed)
		}catch(e) {
			if(e)
				return 0;
		}

		return object

	}

	
}

function contains(array, property, value) {
	for(let i=0; i<array.length; i++) {
		if(array[i][property] == value)
			return i
	}
	return -1;
}

function parseExpression(input) {

	input = input.replace(/ /g,'')

	console.log("parseExpression: "+input)
	console.log("Rabotam so ")
	console.log(functions)
	console.log(variables)

	let targets = findObjects(input)
	// console.log(targets)
	let completed = ""
	let readable = ""

	let najdeno = 0

	for(let i=0; i<input.length; i++) {

		najdeno = 0

		for(let j=0; j<targets.length; j++) {

			if(targets[j].index <= i && i <= targets[j].index + targets[j].length - 1) {

				najdeno = 1

				// console.log("Najdeno e i ("+i+") vo targets "+j)

				if(i > 0 && i == targets[j].index && "(+-*/^.".indexOf(completed[completed.length-1]) == -1) {
					completed += "*"
					readable  += "*"
					// console.log(completed)
				}

				if(i == targets[j].index + targets[j].length - 1) {

					// console.log("i ("+i+") e kraj na object "+j)

					if(targets[j].variable) {

						// console.log("Variable! ")

						if(targets[j].objectIndex == 0) {
							completed += "x"					
							readable += "x"					
						}
						else {
							completed += "variables[" + targets[j].objectIndex + "].value"
							readable  += variables[targets[j].objectIndex].name
						}
						
						if(i+1 < input.length && "+-*/^).".indexOf(input[i+1]) == -1) {
							completed += "*"
							readable  += "*"
						}
					// console.log(completed)
					}
					else {

						// console.log("Funkcija!")
						
						completed += "functions[" + targets[j].objectIndex + "].f"
						readable  += functions[targets[j].objectIndex].name
						
						if(input[i+1] != "(") {
							completed += "("
							readable  += "("							
						}
					// console.log(completed)
					}
				}
				

				continue;
			}
		}

		if(najdeno)
			continue

		if(isNaN(input[i])) {
			if("+-()*^/.".indexOf(input[i]) == -1)
				return {
					parsed: "(",
					readable: null
				}
			completed += input[i]
			readable  += input[i]
		}
		else if(input[i+1] == "(") {
			completed += input[i] + "*"
			readable  += input[i] + "*"
		}
		else {
			completed += input[i]
			readable  += input[i]
		}
	}

	for(let i=0; i<completed.length; i++) {
		if(completed[i] == "(") {
			completed = completed.substring(0,i) + encapsulate(completed.substring(i))
			i++
		}
	}

	for(let i=0; i<completed.length-1; i++) {
		if(completed[i] == ")" && completed[i+1] == "(") {
			completed = completed.substring(0, i+1) + "*" + completed.substring(i+1)
		}
	}

	completed = completed.replace(/\^/g, '**');

	for(let i=0; i<readable.length; i++) {
		if(readable[i] == "(") {
			readable = readable.substring(0,i) + encapsulate(readable.substring(i))
			i++
		}
	}

	console.log("finished parseExpression: "+completed)

	return {
		parsed: completed,
		readable: readable
	}
}

function encapsulate(input) {

	let openP = 0

	for(let i=0; i<input.length; i++) {

		if(input[i] == "(")
			openP++

		else if(input[i] == ")")
			openP--

		else if(openP > 0 && "+-".indexOf(input[i]) != -1) {
			
			if(numberOfInstances(input.substring(i), ")") < numberOfInstances(input.substring(i), "(") + openP) {
				input = input.substring(0, i) + ")" + input.substring(i)
				openP--
			}

		}

	}

	for(let i=0; i<openP; i++) 
		input += ")"

	return input
}

function numberOfInstances(string, character) {
	let br = 0
	for(let i=0; i<string.length; i++) {
		if(string[i] == character)
			br++
	}
	return br
}

function findObjects(input) {

	let targets = []

	let offSet = 0

	let result = findNext(input, offSet)

	while(result) {
		targets.push(result)
		offSet = result.index + result.length
		result = findNext(input, offSet)
	}

	return targets
}

function findNext(input, startIndex) {


	input = input.substring(startIndex)

	let functionIndex = 0					//indeks na funkcijata koja se pojavuva
	let minIndexFunction = input.length 	//min indeks na najdena funkcija
	let index;

	for(let i=0; i<functions.length; i++) {

		index = input.indexOf(functions[i].name)

		if(index != -1 && index < minIndexFunction) {
			minIndexFunction = index
			functionIndex = i
		}
	}

	let variableIndex = 0
	let minIndexVariable = input.length
	
	for(let i=0; i<variables.length; i++) {

		index = input.indexOf(variables[i].name)

		if(index != -1 && index < minIndexVariable) {
			minIndexVariable = index
			variableIndex = i
		}
	}

	if(minIndexVariable == input.length && minIndexFunction == input.length)
		return 0;

	if(minIndexVariable < minIndexFunction) {
		return {
			index: minIndexVariable + startIndex,
			objectIndex: variableIndex,
			variable: true,
			length: variables[variableIndex].name.length
		}
	}
	else {
		return {
			index: minIndexFunction + startIndex,
			objectIndex: functionIndex,
			variable: false,
			length: functions[functionIndex].name.length
		}
	}
}

function processInputs(inputs) {

	let functionsCopy = [... functions]
	let variablesCopy = [... variables]

	functions = functions.slice(0,4)
	variables = [variables[0]]

	let results = []

	for(let i=0; i<inputs.length; i++) {

		if(!inputs[i]) {
			results.push(1)
			continue
		}

		let object = parseInput(inputs[i]);

		if(!object) {
			results.push(0)
			continue
		}

		if(object.nameless)
			results.push(object.name)
		else
			results.push(1)

		if(object.f) {

			console.log("Funkcija e")

			let index = contains(functionsCopy, "name", object.name)

			if(!isNaN(object.name[0])) {
				index = contains(functionsCopy, "readable", object.readable)
				if(index != -1)
					object.name = functionsCopy[index].name
			}


			if(index != -1) {

				console.log("Postoi funkcijata")

				if(functionsCopy[index].readable == object.readable) {
					console.log("Nema potreba da se updatira")
					functions.push(functionsCopy[index]) 
					continue
				}

				console.log("Se updatira")

				if(!parseExpression(functionsCopy[index].readable).readable) {
					console.log("Nevaliden pochetok na tranzicija")
					transitions.push(drawFunctionInit(object))
					continue
				}

				// if(transitions.length)
				// 	transitions = []

				object.color = functionsCopy[index].color
				functions.push(object)
				transitions.push(drawFunctionTransition({...functionsCopy[index], id: index}, object))
			}
			else {
				console.log("Ne postoi i se pravi nova")
				transitions.push(drawFunctionInit(object))
			}
		}
		else {

			variables.push(object)

			let index = contains(variablesCopy, "name", object.name)

			if(index != -1) {

				if(variablesCopy[index].value == object.value)
					continue

				variablesCopy[index] = object
			}
			else {
				variables.push(object)
			}
		}
	}

	//tie shto gi snemalo

	// for(let i=4; i<functionsCopy.length; i++) {
	// 	if(contains(functions, "name", functionsCopy[i].name) == -1) {
	// 		console.log("ke skratam "+functionsCopy[i].name)
	// 		transitions.unshift(drawFunctionClosure({...functionsCopy[i], id:i}))
	// 	}
	// }

	transition()
	return results
}