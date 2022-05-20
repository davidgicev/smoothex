import {Field} from './Field.js';
import {functions} from './itemClass.js';
import {config} from './app.js';
import {builtInDefinitions} from './itemClass.js'
import {Forest} from './fensitex/trieHelper.js'

var fields = [];
var globalDict = new Forest([{
	name: 'builtin',
	dictionary: builtInDefinitions
}, {
	name: 'global',
	dictionary: []
}])

var findField = function(id) {
	return fields.find(x => x.id == id);
}

function createFieldInstance() {
	fields.push(new Field(globalDict))
}

function checkAddField(field) {
	if(fields[fields.length-1] == field)
		createFieldInstance()
}

function getFreeName() {

	let i = 1;

	while(globalDict.find('f_'+i))
		i++;

	return 'f_'+i;
}

function getRandomColor() {

	for(let i=1; i<config.theme.colors.length; i++)
		if(functions.findIndex(x => x.color == config.theme.colors[i]) == -1)
			return config.theme.colors[i];

	let index = 1 + Math.floor(Math.random() * (config.theme.colors.length-1))

	return config.theme.colors[index]

  //return "hsl("+(Math.random()*360)+", 80%, 50%)";
}

function blurFields() {
	for(let i=0; i<fields.length; i++) {
		fields[i].blur();
	}
}

function refreshFields(source) {

	let defs = []
	for(let f of fields) {
		defs.push(f.getDefinand());
	}

	globalDict.set('global', defs.filter(d => Boolean(d)).map(d => ({
		name: d.name,
		content: d.name,
		type: d.type,
	})))

	for(let i=0; i<fields.length; i++) {
		if(fields[i].input !== source) {
			fields[i].refresh()
		}
	}
}

function handleNav(field, dir) {
	if(dir == 1) { // next
		let index = fields.findIndex(f => f.id == field.id)
		if(fields.length == index + 1)
			return

		fields[index].blur()
		fields[index+1].focus()
		return
	}
	if(dir == -1) { // prev
		let index = fields.findIndex(f => f.id == field.id)
		if(index == 0)
			return

		fields[index].blur()
		fields[index-1].focus()
		return
	}
}

function handleDelete(field) {
	let index = fields.findIndex(f => f.id == field.id)
	fields.splice(index, 1)
	let el = document.getElementById("commandContainer")
	el.removeChild(el.children[index])
	fields[Math.max(0, index-1)].focus()
}


export {createFieldInstance, findField, checkAddField, fields, handleDelete,
	getFreeName, getRandomColor, blurFields, refreshFields, globalDict, handleNav}