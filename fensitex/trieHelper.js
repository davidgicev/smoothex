function Forest(dictionaries) {
	this.trees = {}
	this.order = []

	for(let t of dictionaries) {
		this.trees[t.name] = new Trie(t.dictionary)
		this.order.push(t.name)
	}
}

Forest.prototype.find = function(string, onlyNotHidden) {
	let trees = this.order.map(name => {
		return this.trees[name]
	})
	for(let trie of trees) {
		let found = trie.find(string)
		if(found && (!onlyNotHidden || !found.hiddenAC)) {
			return found
		}
	}
}

Forest.prototype.startsWithQ = function(string) {
	let tries = this.order.map(n => this.trees[n])
	return tries.map(t => {
		let finds = t.startsWithQ(string)
		return finds
	}).flat()
}

Forest.prototype.isEmpty = function() {
	return Object.keys(this.trees).length == 0
}

Forest.prototype.set = function(name, dictionary) {
	
	if(!this.order.includes(name)) {
		this.order.push(name)
		this.trees[name] = new Trie(dictionary)
		return
	}

	let trie = new Trie(dictionary)
	this.trees[name].root = trie.root
	this.trees[name].d = trie.d
}


// does a shallow copy to the tries specified (in names)
Forest.prototype.duplicate = function(names) {
	let res = new Forest([])
	let copy = [...names]
	for(let o of this.order) {
		if(copy.includes(o)) {
			res.order.push(o)
			res.trees[o] = this.trees[o]
		}
	}
	return res
}

function Node(key, value) {
	this.key = key
	this.value = value
	this.children = []
}

Node.prototype.findChild = function(char) {
	for(let child of this.children) {
		if(child.key == char)
			return child
	}
	return null
}

function Trie(dictionary) {
	this.root = new Node()
	this.d = dictionary
	this.populate()
}

Trie.prototype.populate = function() {
	for(let entry of this.d) {
		if(!this.find(entry.name)) {
			this.insert(entry)
		}
	}
}

Trie.prototype.find = function(string) {

	let node = this.root

	while(string && node) {
	
		let c = string.charAt(0)
		string = string.substring(1)

		node = node.findChild(c)

		if(!node)
			return null

		if(!string && node.value)
			return node.value
	}
	
	return null
}

Trie.prototype.startsWithQ = function(string) {

	let node = this.root

	while(string && node) {
	
		let c = string.charAt(0)
		string = string.substring(1)

		node = node.findChild(c)

		if(!node || !string)
			break
	}

	if(!node)
		return []

	let queue = [node]
	let results = []

	if(queue[0].value)
		results.push(queue[0].value)

	while(queue.length) {
		let node = queue.shift()
		for(let child of node.children) {
			queue.push(child)
			if(child.value)
				results.push(child.value)
		}
	}

	return results
}

Trie.prototype.insert = function(entry) {

	//vo zavisnost od ova za dali ke se replacene
	if(this.find(entry.name))
		return
	
	let string = entry.name
	let node = this.root
	let before = node

	while(string && node) {
	
		let c = string.charAt(0)
		string = string.substring(1)

		before = node
		node = node.findChild(c)

		if(!node) {
			node = new Node(c)
			before.children.push(node)
		}

		if(!string) {
			node.value = entry
			return
		}
	}
	
	before.children.push(new Node(entry.name, entry))
}

Trie.createEmpty = function() {
	return new Trie([])
}

Trie.prototype.isEmpty = function() {
	return this.root.children.length == 0
}

export {Trie, Forest}