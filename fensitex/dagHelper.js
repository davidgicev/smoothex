function Node(value, edges) {
	this.value = value;
	this.edges = edges
}

function DAG(nodes, edges) {
	this.nodes = nodes.map((n, i) => {
		return new Node(n, edges[i])
	})
}

DAG.prototype.shortestPath = function(startIndex, endIndex, forbidEqual) {
	
	let dist = []
	let route = []
	let n = this.nodes.length

	for(let i=0; i<n; i++)
		dist[i] = Infinity

	for(let i=0; i<n; i++)
		route[i] = -1

	dist[startIndex] = 0
	route[startIndex] = startIndex

	for(let i=0; i<n-1; i++) {
		
		let node = this.nodes[i]

		for(let j=0; j<n; j++) {

			if(node.edges[j] < 0 || dist[i] === Infinity)
				continue

			let newDist = dist[i] + node.edges[j]
			if(newDist < dist[j]) {
				dist[j] = newDist
				route[j] = i
			}
			else if(!newDist && newDist == dist[j] && forbidEqual) {
				alert("Ambiguous string of variables")
			}
		}
	}

	let path = []
	let curr = endIndex
	path.push(endIndex)
	while(true) {
		if(curr == route[curr])
			break
		curr = route[curr]
		path.push(curr)
	}
	path.reverse()

	return path
}

DAG.prototype.getOrder = function() {
	let path = []
	let visited = Array(this.nodes.length).fill(false)
	for(let i=0; i<this.nodes.length; i++) {
		this.getOrderR(i, path, visited)
	}
	return path
}

DAG.prototype.getOrderR = function(current, path, visited) {
	
	if(visited[current])
		return
	visited[current] = true

	for(let i=0; i<this.nodes.length; i++) {
		if(this.nodes[current].edges[i] == 1) {
			this.getOrderR(i, path, visited)
		}
	}

	path.push(current)
}

export {DAG}