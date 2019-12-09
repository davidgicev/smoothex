function parseInput(input) {

	input = input.replace(/ /g,'')

	for(let i=0; i<input.length-1; i++) {
		if("0123456789".indexOf(input[i]) != -1 && "+-/*0123456789^)".indexOf(input[i+1]) == -1)
			input = input.substring(0,i+1)+"*"+input.substring(i+1)
	}

	//console.log(input)

	let functions = ["sin", "cos", "cotan", "tan"]


	for(let i=0; i<input.length; i++) {
		
		let index = input.indexOf("^");
		let openP = 0
		//console.log("Index na ^ : "+index)

		if(index == -1)
			break

		let leftSymbolIndex = index - 1, rightSymbolIndex = index + 1

		let leftSymbol, rightSymbol;

		while(leftSymbolIndex > 0) {

			leftSymbol = input[leftSymbolIndex]

			if(leftSymbol == ")") 
				openP++

			else if(leftSymbol == "(")
				openP--

			if(openP <= 0) {
				if("()".indexOf(leftSymbol) != -1) {
					leftSymbolIndex++;
				}
					break;
			}

			leftSymbolIndex--;
		}

		//console.log("left side index:"+leftSymbolIndex+", celo left: "+input.substring(leftSymbolIndex, index))

		openP = 0

		while(rightSymbolIndex < input.length) {

			rightSymbol = input[rightSymbolIndex]

			if(rightSymbol == "(") 
				openP++

			else if(rightSymbol == ")")
				openP--

			if(openP <= 0) {
				rightSymbolIndex++;
				break;
			}

			rightSymbolIndex++;
		}
		
		//console.log("right side index:"+rightSymbolIndex+", celo right: "+input.substring(index+1, rightSymbolIndex))

		input = input.substring(0, leftSymbolIndex) + "Math.pow(" + input.substring(leftSymbolIndex, index) + "," + input.substring(index+1, rightSymbolIndex) + ")" + input.substring(rightSymbolIndex)
		//console.log(input);
	
	}

	for(let i=0; i<functions.length; i++) {
		for(let j=0; j<input.length;) {

				let ostanato = input.substring(j)
				//console.log(ostanato)

				let index = ostanato.indexOf(functions[i])
				
				if(index == -1)
					break;

				index += j

				//console.log("Pochnuva da bara: "+input.substring(j))
				//console.log("Index na "+functions[i]+": "+index+", ponatamu: "+input.substring(index))

				if(input[index-1] == ".")
					break

				let openP = 0

				let rightSymbolIndex = index + functions[i].length

				let rightSymbol;

				while(rightSymbolIndex < input.length) {

					rightSymbol = input[rightSymbolIndex]

					if(rightSymbol == "(") 
						openP++

					else if(rightSymbol == ")")
						openP--

					if(openP <= 0) {
						if("+-*/".indexOf(rightSymbol) != -1) {
							break;	
						}
					}

					rightSymbolIndex++;
				}

				input = input.substring(0, index) + "Math." + functions[i] + "(" + input.substring(index + functions[i].length, rightSymbolIndex) + ")" + input.substring(rightSymbolIndex)
				j += rightSymbolIndex + functions[i].length + 4
		}	
	}
	
	return input
}


