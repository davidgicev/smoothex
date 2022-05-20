import {functions, variables} from './itemClass.js';
import {Interval} from './intervalArithmetic.js'

function isAlphaNumeric(char) {
  let code = char.charCodeAt();
  if  ((code!= 39 && code!= 95  && code!= 46) && // ' _ .
    !(code > 47 && code < 58) && // numeric (0-9)
      !(code > 64 && code < 91) && // upper alpha (A-Z)
      !(code > 96 && code < 123)) { // lower alpha (a-z)
        return false;
      }
    return true;
}

function parseSection(input, context) {

	input = input.replace(/\s/g,'')
	input = input.replace(/\u{2013}/ug,'-')
	input = input.replace(/\u{22C5}/ug,'*')

	if(context == "ftSub") {
		for(let i=0; i<input.length; i++) {
			if(!isAlphaNumeric(input[i]))		
				throw "The symbol '"+input[i]+"' is not allowed inside a subscript."
		}
	}

	return input
}



function parseExpression(object) {

    let statements = traverse(object)

    return statements;
}

function traverse(element) {
    let node = "";
    if(Array.isArray(element)) {
        for (let i=0; i<element.length; i++) {
            node += traverse(element[i])
            // string += "\n";
        }
        return node
    }

    if(element.arity == "string") {
    	if(element.local)
    		return element.value;
    	let index = findVariable(element.value)
    	if(index == -1)
    		return element.value;
        return "variables["+index+"].value"
    }

    if(element.arity == "literal")
    	return element.value;

    if(element.arity == "binary") {
    	if(element.value == "^") {
    		node += "Math.pow(";
    		node += traverse(element.first)
    		node += ","
    		node += traverse(element.second)
    		node += ")"
    		return node;
    	}
        node += traverse(element.first);
        node += element.value;
        node += traverse(element.second);
        return node;
    }

    if(element.arity == "unary") {
    	if(element.value === "(") {
    		node += "(";
    		node += traverse(element.first);
    		node += ")";
    		return node;
    	}
        node += element.value;
        node += traverse(element.first);
        return node;
    }

    if(element.arity == "function") {
    	let index = findFunction(element.value)
        node += "functions["+index+"].f";
        node += "(" 
        node += traverse(element.first[0])
        for(let i=1; i<element.first.length; i++) {
            node += ","
            node += traverse(element.first[i])
        }
        node += ")"
        return node;
    }
    console.log(element)

    for(attribute in element) {
        // console.log(attribute)
        // console.log(element[attribute])
        // console.log(typeof element[attribute])
        switch (typeof element[attribute]) {
            case "string":
            let el = makeDiv(element[attribute])
            el.className = "string"
            node.appendChild(el);
            break;
            case "object":
            node.appendChild(traverse(element[attribute]))
            break;
        }
    }
    return node;
}

function findVariable(string) {
	for (var i = variables.length - 1; i >= 0; i--) {
		if(variables[i].name == string)
			return i
	}
	return -1;
}

function findFunction(string) {
	for (var i = functions.length - 1; i >= 0; i--) {
		if(functions[i].name == string)
			return i
	}
	return -1;
}

function preprocessFunction(element, args) {
    let cif = Interval.compileFunction(element, args)
    return Function(args, "return "+cif);
}

export {parseSection, isAlphaNumeric ,parseExpression, findFunction, findVariable}