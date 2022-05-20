import {Trie} from './trieHelper.js'
import {DAG} from './dagHelper.js'
import {SubscriptElement, ExponentElement, ParenthesesElement, RootElement} from './elements/elements.js'

function regroup(smushed, trie) {

	// strings mixed with elements
	let res = smushed

	// divide strings into numbers and words
	res = smushed.map(el => {
		return (typeof el == "string") ? basicSeparation(el) : el
	}).flat()


	// group elements
	// first wrap the expressions
	res = res.map(el => {
		return el.token ? el : wrapElement(el)
	})

	// returns normal elements/numbers, and groups of strings and subscripts
	res = basicGroup(res)

	// segment groups into known functions, variables, etc.
	res = res.map(el => {
		return (el.type == 'group') ? segmentGroup(el, trie) : el
	}).flat()


	if(res.length == 0) {
		res = [{
			type: 'ND',
			content: ""			
		}]
	}

	res = elementGrouping(res)

	return res

}

// tokenize/wrap elements
function wrapElement(element) {
	let type = 'expression';

	if(element instanceof SubscriptElement)
		type = 'subscript'

	return {
		token: true,
		type: type,
		content: element
	}	
}

// segments array into groups of strings/subscripts/numbers
function basicGroup(elements) {
	
	function flush() {
		inGroup = false
		if(!builder.length)
			return
		result.push({
			type: 'group',
			token: true,
			children: builder
		})
		builder = []
	}

	let result = []
	let builder = []
	let inGroup = false

	while(elements.length) {
		
		let el = elements.shift()

		if(el.type == 'expression' || el.type == 'number') {
			flush()
			result.push(el)
			continue
		}

		inGroup = true
		builder.push(el)
		if(el.type == 'subscript')
			flush()
	}

	flush()

	return result
}

// segment a given group into known functions, variables, etc.
function segmentGroup(group, trie) {
	let last = group.children.pop()
	let subscript = null	
	let content = group.children.reduce(function(acc, curr) {
		return acc + curr.content
	}, "")

	if(last.type == 'string')
		content += last.content
	else
		subscript = last.content.content

	let segmented;
	let toString = content + (subscript != null ? "_"+subscript : "")

	segmented = segment(toString, trie)
		

	segmented = segmented.filter(s => s.content.length > 0)

	let lastS = segmented[segmented.length-1]

	if(subscript != null) {
		if(lastS.miss) {
			lastS.content = lastS.content.split("_")[0] + "_" + subscript
		}
	}

	return segmented
}

// the actual segmentation
function segment(content, trie) {
	
	let edges = []

	let subIndex = content.indexOf('_')

	for(let i=0; i<content.length; i++) {
		
		let temp = []
		
		for(let j=0; j<=content.length; j++)
			temp[j] = -1


		for(let j=i+1; j<=content.length; j++) {

			if(content[i] === '_')
				break

			if(subIndex != -1 && j >= subIndex && j != content.length)
				continue

			let substr = content.substring(i, j)
			temp[j] = (trie.find(substr, true) ? 0 : 1)*(j-i)
		}

		edges[i] = temp
	}

	let nodes = []
	for(let i=0; i<=content.length; i++)
		nodes.push(null)

	let dag = new DAG(nodes, edges)
	let path = dag.shortestPath(0, content.length, true)
	let matches = []

	for(let i=0; i<path.length-1; i++) {
		let substr = content.substring(path[i], path[i+1])
		
		let match = trie.find(substr, true)
		if(!match) {
			matches.push({
				type: 'variable',
				content: substr,
				token: true,
				miss: true
			})	
		}
		else {
			matches.push({...match, token: true})
		}
	}

	return matches
}

//groups objects into elements
function elementGrouping(elements) {

	let final = []

	while(elements.length) {

		let el = elements.shift()
		let next = elements[0]

		if(next) {
			if(next.type == 'expression' && next.content instanceof ExponentElement) {
				final.push({
					type: 'ExponentElement',
					params: [elementGrouping([el]), elements.shift().content.expo]
				})
				continue
			}
		}

		if(el.type == 'number') {
			final.push({
				type: "NumberElement",
				params: [el.content]
			})
			continue
		}

		if(el.type == 'variable') {
			final.push({
				type: 'VariableElement',
				params: el.content.split("_")
			})
			continue
		}

		if(el.type == 'function') {
			let right;
			if(next && next.type == 'expression' && next.content instanceof ParenthesesElement) {
				right = elementGrouping([elements.shift()])
			}
			else {
				right = elementGrouping(elements)
				elements = []
			}
			final.push({
				type: 'FunctionElement',
				params: [el.content, right]
			})
			continue
		}

		if(el.type == 'ND') {
			final.push({
				type: 'ND',
				params: [el.content]
			})
			continue
		}

		final.push({
			type: el.type,
			params: el.content
		})

	}

	return final
}

//separates the string into groupings of letters and numbers
function basicSeparation(string) {

  function flush() {
    if(!builder)
      return
    tokens.push({
      type: bType == 0 ? "string" : "number",
      content: builder,
      token: true
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

    if(isNaN(c) && c != '.') {

      if(bType != 0)
        flush()
      if(bType == -1)
        bType = 0

      builder += c
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

export {regroup}