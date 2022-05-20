import {Forest} from './fensitex/trieHelper.js'

var parametric = [];
var points = [];

var builtInFunctions = [
	{
		name: "sin",
		f: Math.sin,
		cif: x => x.sin()
	},
	{
		name: "cos",
		f: Math.cos,
		cif: x => x.cos()
	},
	{
		name: "tan",
		f: Math.tan,
		cif: x => x.tan()
	},
	{
		name: "cot",
		f: x => 1/Math.tan(x),
		cif: x => x.cot()
	},
	{
		name: "\\abs",
		f: Math.abs,
		cif: x => x.abs(),
		hiddenAC: true
	},
	{
		name: "\\sqrt",
		f: Math.sqrt,
		cif: x => x.sqrt(),
		hiddenAC: true
	},
	{
		name: "ln",
		f: Math.log
	},
	{
		name: "\\nthroot",
		f: (x,y) => { //x e stepen, y e osnova
			if(x % 2 == 0)
				return Math.pow(y, 1/x)

			return Math.sign(y) * Math.pow(Math.abs(y), 1/x)
		},
		cif: (x, y) => y.pow(x.multiplicativeInverse()),
		hiddenAC: true
	}
];

 var builtInVariables = [
	{
		name: "centerX",
		value: null
	},
	{
		name: "π",
		value: Math.PI,
		hiddenAC: true,
	},
	{
		name: "e",
		value: Math.E
	},
	{
		name: "f_23",
		value: 3
	},
	{
		name: "f_2abakus",
		value: 3
	}
];

var variables = [...builtInVariables];
var functions = [...builtInFunctions];

var pushNew = function(object) {
	if(object.f)
		functions.push(object);
	else
		variables.push(object)
}

var reset = function() {
	// console.log(this.functions.length)
	while(functions.length > builtInFunctions.length)
		functions.pop()
	while(variables.length > builtInVariables.length)
		variables.pop()

	// console.log(this.functions)
}

var variableList = variables
	.map(v => ({
		name: v.name,
		type: 'variable',
		content: v.name,
		hidden: v.hiddenAC
	}));

var functionList = functions
	.filter(f => !f.hiddenAC)
	.map(f => ({
		name: f.name,
		type: 'function',
		content: f.name,
		args: Array(f.f.length),
		hidden: f.hiddenAC
	}));

var builtInDefinitions = [...variableList, ...functionList]

export {
	variables, functions, reset, builtInFunctions, builtInVariables, pushNew, builtInDefinitions
};