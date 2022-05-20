import {Trie} from './trieHelper.js'

let dictionary = {
	abc: {
		type: 'variable',
		content: 'abc'
	},
	m: {
		type: 'variable',
		content: 'm'
	},
	x: {
		type: 'variable',
		content: 'x'
	},
}

let trie = new Trie(dictionary)

function regroup(smushed) {

	let res = []

	for(let el of smushed) {

		if(typeof el == "string")
			el = initialGrouping(el)
		
		res.push(el)
	}

	if(res.length == 0) {
		res = [{
			type: 'ND',
			content: ""			
		}]
	}

	return elementGrouping(res.flat())
}

//groups objects into elements
function elementGrouping(elements) {

	let final = []

	while(elements.length) {

		let el = elements.shift()

		if(el.type == 'exponent') {
			final.push({
				type: 'ExponentElement',
				params: [[], elements.shift()]
			})
			continue
		}

		if(elements.length && elements[0].type == 'exponent') {
			elements.shift() // za da se trgne operatorot
			final.push({
				type: 'ExponentElement',
				params: [[el], elements.shift()]
			})
			continue
		}

		if(el.type == 'number') {
			final.push({
				type: "NumberElement",
				params: [el.content]
			})
			continue
		}

		if(el.type == 'variable') {
			let parts = el.content.split("_")
			final.push({
				type: 'VariableElement',
				params: parts
			})
			continue
		}

		if(el.type == 'function') {
			final.push({
				type: 'FunctionElement',
				params: [el.content, elements]
			})
			break
		}

		if(el.type == 'ND') {
			final.push({
				type: 'ND',
				params: el.content
			})
			continue
		}

		final.push({
			type: 'expression',
			params: el
		})

	}

	return final
}

//groups string into variables, functions, numbers, etc.
function initialGrouping(string) {
	
	let parts = []
	let builder = ""

	function flush() {
		if(!builder)
			return
		parts.push(separateInnerString(builder))
		builder = ""
	}

	while(string) {

		let c = string.charAt(0)
		string = string.substring(1)

		if(c == "^") {
			flush()
			parts.push({
				type: 'exponent',
			})
			continue
		}

		builder += c
	}

	flush()

	return parts.flat()
}

//groups strings and subscripts, and then parses them as a whole
function separateInnerString(string) {

	let parts = basicSeparation(string)

	let result = []

	while(parts.length) {
		
		let p = parts.shift()

		if(p.type == 'number') {
			result.push(p)
			continue
		}

		if(p.type == 'string') {
			
			let whole = p.content
			
			if(parts.length && parts[0].type == 'subscript')
				whole += "_" + parts.shift().content
			
			result.push(rec(whole))
		}

		if(p.type == 'subscript') {
			result.push({
				type: 'variable',
				content: "_"+p.content
			})
		}
	}

	return result.flat()
}

//separates the string into groupings of letters, numbers and subscripts
function basicSeparation(string) {

  function flush() {
    if(!builder)
      return
    tokens.push({
      type: bType == 0 ? "string" : "number",
      content: builder
    })
    bType = -1
    builder = ""
  }

  let bType = -1;
  let builder = "";
  let tokens = []

  while(string) {

    let c = string.charAt(0)
    string = string.substring(1)

    if(isNaN(c)) {
      if(bType != 0)
        flush()
      if(c == "_") {
        if(bType != -1)
          flush()     
        let ending = string.indexOf("}")
        let sub = string.substring(0, ending+1)
        string = string.substring(ending+1)
        tokens.push({
          type: "subscript",
          content: sub.slice(1,-1)
        })
      }
      else {
        if(bType == -1)
          bType = 0
        builder += c
      }

    }
    else {
      if(bType != 1)
        flush()
      if(bType == -1)
        bType = 1
      builder += c
    }
  }

  if(bType != -1)
    flush()

  return tokens
}

//occurences of known variable names, function names, etc.
function rec(string) {

	function flush() {
		if(!builder)
			return
		res.push({
			type: 'variable',
			content: builder
		})
		builder = ""
	}
	
	let res = []

	let builder = ""

	while(string) {
		let r = trie.find(string)
		if(!r) { //no match that includes the first letter
			builder += string.charAt(0)
			string = string.substring(1)
			continue
		}
		flush()
		res.push(r.value)
		string = string.substring(r.value.content.length)
	}

	flush()

	return res
}

export {regroup}
