import {findFunction, findVariable} from './parser.js'
import {functions, variables} from './itemClass.js'

class Interval {

	constructor(lo, hi, defined) {

		this.defined = defined == undefined ? true : defined

		if(hi === undefined) {
			this.lo = lo;
			this.hi = lo;
			return;
		}

		if(isNaN(lo) || isNaN(hi)) {
			this.lo =  Infinity;
			this.hi = -Infinity;
			return;
		}
		this.lo = lo;
		this.hi = hi;
	}
}

Interval.prototype.clone = function() {
	return new Interval(this.lo, this.hi, this.defined)
}

Interval.prototype.empty = function() {
	this.lo =  Infinity;
	this.hi = -Infinity;
	this.defined = false
	return this; 
}

Interval.prototype.cleanUp = function() {
	if(this.isEmpty()) {
		this.lo =  Infinity;
		this.hi = -Infinity;
		this.defined = false
	}
}

Interval.prototype.isEmpty = function() {
	if(this.lo === NaN || this.hi === NaN)
		return true;
	return this.lo > this.hi;
}

Interval.prototype.isFinite = function() {
	if(!isFinite(this.lo) || !isFinite(this.hi))
		return false
	return true
}

Interval.prototype.flip = function() {
	let tempLow = this.lo;
	this.lo = -this.hi;
	this.hi = -tempLow;
	return this;
}

Interval.prototype.add = function(i) {
	this.defined = this.defined && i.defined
	this.lo += i.lo;	
	this.hi += i.hi;
	this.cleanUp();
	return this;
};

Interval.prototype.subtract = function(i) {
	this.defined = this.defined && i.defined
	this.lo -= i.hi;
	this.hi -= i.lo;
	this.cleanUp();
	return this;
};

// abs

Interval.prototype.abs = function() {
	if(this.lo > 0 || this.hi < 0) {
		let oldLow = this.lo
		this.lo = Math.min(this.lo, this.hi)
		this.hi = Math.max(oldLow , this.hi)
		return this
	}
	this.lo = 0
	this.hi = Math.max(this.lo, this.hi)
	return this
}

Interval.prototype.multiply = function(i) {

	if(this.isEmpty() || i.isEmpty())
		return this.empty();

	this.defined = this.defined && i.defined

	let oldLow = this.lo;
	this.lo = Math.min(oldLow*i.lo, oldLow*i.hi, this.hi*i.lo, this.hi*i.hi)
	this.hi = Math.max(oldLow*i.lo, oldLow*i.hi, this.hi*i.lo, this.hi*i.hi)
	return this;
};

Interval.prototype.divide = function(i) {

	if(this.isEmpty() || i.isEmpty())
		return this.empty();

	this.defined = this.defined && i.defined

	return this.multiply(i.multiplicativeInverse());
}

Interval.prototype.multiplicativeInverse = function() {
	
	if(this.isEmpty())
		return this;

	if(this.lo <= 0 && this.hi >= 0) {

		this.defined = false

		if((this.lo !== 0 && this.hi !== 0) || 
		   (this.lo === 0 && this.hi === 0)) {	//[0,0]
			this.lo = -Infinity;
			this.hi =  Infinity;
			return this;
		}

		if(this.lo === 0) {						//[0,+]
			this.lo = 1/this.hi;
			this.hi = Infinity;
			return this;
		}
		else {				    //[-,0]
			this.hi = 1/this.lo;
			this.lo = -Infinity;
			return this;
		}

	}

	let tempLow = this.lo;
	this.lo = 1/this.hi;
	this.hi = 1/tempLow;
	return this;
}

Interval.prototype.sqrt = function() {

	if(this.isEmpty() || this.hi < 0)
		return this.empty();

	this.defined = this.defined && this.lo >= 0

	this.lo = Math.sqrt(Math.max(this.lo, 0));
	this.hi = Math.sqrt(this.hi);

	return this;
}

Interval.prototype.pow = function(i) {

	if(this.isEmpty() || i.isEmpty())
		return this.empty();

	this.defined = this.defined && i.defined

	if(i.lo === i.hi) {		 //eksponentot e brojka
		if(i.lo === 0) {
			if(this.lo === this.hi && this.lo === 0)
				return this.empty();
			this.lo = 1;
			this.hi = 1;
			return this;
		}
		else if(i.lo < 0) {
			i.lo = -i.lo;
			i.hi = -i.hi;
			return this.multiplicativeInverse().pow(i);
		}

		//od tuka eksponentot e pozitiven

		if(Number.isSafeInteger(i.lo)) {
			if(this.hi < 0) {
				
				let resLo = Math.pow(-this.hi, i.lo);
				let resHi = Math.pow(-this.lo, i.lo);

				if((i.lo & 1) === 1) { //neparen stepen
					this.lo = -resHi;
					this.hi = -resLo;
				}
				else {
					this.lo = resLo;
					this.hi = resHi;
				}

				return this;
			}
			else if(this.lo < 0) {			//intervalot na osnovata e neg,poz
				if((i.lo & 1) === 1) {
					this.lo = -Math.pow(-this.lo, i.lo);
					this.hi =  Math.pow( this.hi, i.lo);
				}
				else {
					this.hi = Math.pow(Math.max(-this.lo, this.hi), i.lo);
					this.lo = 0;
				}

				return this;
			}
			else {
				this.lo = Math.pow(this.lo, i.lo);
				this.hi = Math.pow(this.hi, i.lo);

				return this;
			}
		}
		else {  			//eksponentot ne e cel broj
			if(this.lo >= 0) {
				this.lo = Math.pow(this.lo, i.lo);
				this.hi = Math.pow(this.hi, i.lo);
				return this;
			}
			if(Number.isSafeInteger(1/i.lo)) { 	//nti koren
				if((1/i.lo & 1) === 1) {		//n e neparen
					this.lo = -Math.pow(-this.lo, i.lo)
					this.hi =  Math.sign(this.hi)*Math.pow(Math.abs(this.hi), i.lo)
					return this
				}
				else {							//n e paren
					if(this.hi < 0) {
						return this.empty();
					}
					else {
							this.defined = this.defined && this.lo >= 0
							this.lo = Math.pow(Math.max(this.lo, 0), i.lo);
							this.hi = Math.pow(this.hi, i.lo);
							return this
					}
				}
			}
			else {
				return this.empty();
			}
		}
	}
	else {								//eksponentot e interval

		// if(this.hi < 0) { 				//osnovata e pomala od 0
		// 	return this.empty();
		// }
		if(this.lo < 0) {				//osnovata ima del pomal od 0
			return this.empty();
		}	

		//osnovata e pozitivna

		if(i.hi <= 0) {
			return this.multiplicativeInverse().pow(i.flip());
		}
		if(i.lo < 0) {					//eksponentot e [-,+]

			let positivePart = new Interval(this.lo, this.hi).pow(new Interval(0, i.hi));
			let negativePart = new Interval(this.lo, this.hi).pow(new Interval(i.lo, 0));

			this.lo = Math.min(positivePart.lo, negativePart.lo);
			this.hi = Math.max(positivePart.hi, negativePart.hi);

			return this;
		}

		//eksponentot e pozitiven

		if(this.lo >= 1) {						//osnovata raste
			this.lo = Math.pow(this.lo, i.hi);
			this.hi = Math.pow(this.hi, i.hi);
			return this;
		}
		if(this.hi <= 1) {						//osnovata e [0,1]
			this.lo = Math.pow(this.lo, i.hi);
			this.hi = Math.pow(this.hi, i.lo);
			return this;
		}

		//osnovata: low < 1 < high

		this.lo = Math.pow(this.lo, i.hi);
		this.hi = Math.pow(this.hi, i.hi);

		return this;

	}

}

Interval.prototype.modulo = function(i) {
	
	if(this.isEmpty() || i.isEmpty())
		return this.empty();

	let low = this.lo < 0 ? i.lo : i.hi;

	let n = this.lo / low;

	if(n < 0)
		n = Math.ceil(n);
	else
		n = Math.floor(n);

	return this.subtract(i.multiply(new Interval(n)));
}

Interval.prototype.equals = function(i) {
	return !this.isEmpty() && !i.isEmpty() && this.lo === i.lo && this.hi === i.hi;
}

Interval.prototype.disjoint = function(i) {
	return  this.isEmpty() ||  i.isEmpty() || this.hi < i.lo || i.hi < this.lo; 
}

Interval.prototype.lessThan = function(i) {
	return  this.isEmpty() ||  i.isEmpty() || this.hi < i.lo;
}

Interval.prototype.greaterThan = function(i) {
	return  this.isEmpty() ||  i.isEmpty() || this.lo > i.hi;
}

//Trigonometriski

Interval.prototype.moveToPositive = function() {

	if(this.isEmpty())
		return this;

	if(this.lo >= 0)
		return this;

	if(this.lo === -Infinity) {
		this.lo = 0;
		this.hi = Infinity;
		return this;
	}

	let n = Math.ceil(-this.lo / (2*Math.PI));

	this.lo += 2*Math.PI*n;
	this.hi += 2*Math.PI*n;

	return this;
}

Interval.prototype.cos = function() {

	if(this.isEmpty())
		return this;

	if(!isFinite(this.lo) || !isFinite(this.hi)) {
		this.lo = -1;
		this.hi =  1;
		return this;
	}

	if(this.hi - this.lo >= 2*Math.PI) {
		this.lo = -1;
		this.hi =  1;
		return this;
	}

	this.moveToPositive();

	if(this.lo >= 2*Math.PI)
		this.modulo(new Interval(2*Math.PI));

	if(this.lo >= Math.PI) {
		return this.subtract(new Interval(Math.PI)).cos().flip()
	}

	if(this.hi <= Math.PI) {
		let tempLow = this.lo;
		this.lo = this.hi == Math.PI*0.5 ? 0 : Math.cos(this.hi);
		this.hi = tempLow == Math.PI*0.5 ? 0 : Math.cos(tempLow);
		return this;
	}

	if(this.hi <= 2*Math.PI) {
		this.hi = Math.max(Math.cos(this.lo), Math.cos(this.hi));
		this.lo = -1;
		return this;
	}

	this.lo = -1;
	this.hi =  1;

	return this;
}

Interval.prototype.sin = function() {
	return this.subtract(new Interval(0.5*Math.PI)).cos();
}

Interval.prototype.tan = function() {

	if(this.isEmpty())
		return this;

	this.moveToPositive();

	if(!isFinite(this.lo) || !isFinite(this.hi)) {
		this.lo = -Infinity;
		this.hi =  Infinity;
		this.defined = false
		return this;
	}

	if(this.hi - this.lo >= Math.PI) {
		this.lo = -Infinity;
		this.hi =  Infinity;
		this.defined = false
		return this;
	}

	if(this.lo >= Math.PI)
		this.modulo(new Interval(Math.PI))

	if(this.lo < 0) {
		console.log(this.lo, this.hi)
	}

	//[0,2PI]

	if((this.lo < 0.5*Math.PI && 0.5*Math.PI < this.hi) ||
	   (this.lo < 1.5*Math.PI && 1.5*Math.PI < this.hi)) {

		this.lo = -Infinity;
		this.hi =  Infinity;
		this.defined = false
		return this;
	}

	if(this.lo == 0.5*Math.PI) {
		this.lo = -Infinity;
		this.hi = Math.tan(this.hi)
		this.defined = false
		return this;
	}

	if(this.hi == 1.5*Math.PI) {
		this.hi = Infinity;
		this.lo = Math.tan(this.lo);
		this.defined = false
		return this;
	}
	
	this.lo = Math.tan(this.lo);
	this.hi = Math.tan(this.hi);
	return this;
}

Interval.prototype.cot = function() {
	return this.add(new Interval(0.5*Math.PI)).tan().flip();
}

Interval.lookup = {
	"+": "add",
	"-": "subtract",
	"*": "multiply",
	"/": "divide",
}

Interval.compileFunction = function(element, args) {

    let node = "";

    if(Array.isArray(element)) {
        for (let i=0; i<element.length; i++) {
            node += traverse(element[i])
            // string += "\n";
        }
        return node
    }

    if(element.arity == "string") {
    	if(element.local) {
    		return element.value+".clone()";
    	}
    	let index = findVariable(element.value)
    	if(index == -1) {
    		return element.value;
    	}
        return "new Interval(variables["+index+"].value)"
    }

    if(element.arity == "literal")
    	return "new Interval("+element.value+")";

    if(element.arity == "binary") {
    	if(element.value == "^") {
    		node += this.compileFunction(element.first)
    		node += ".pow("
    		node += this.compileFunction(element.second)
    		node += ")"
    		return node;
    	}
        node += this.compileFunction(element.first)+".";
        node += Interval.lookup[element.value];
        node += "("+this.compileFunction(element.second)+")";
        return node;
    }

    if(element.arity == "unary") {
    	if(element.value === "(") {
    		node += "(";
    		node += this.compileFunction(element.first);
    		node += ")";
    		return node;
    	}
        node += "new Interval(0)."+Interval.lookup[element.value];
        node += "("+this.compileFunction(element.first)+")";
        return node;
    }

    if(element.arity == "function") {
    	let index = findFunction(element.value)
        node += "(functions["+index+"].cif";
        node += "(" 
        node += this.compileFunction(element.first[0])
        for(let i=1; i<element.first.length; i++) {
            node += ","
            node += this.compileFunction(element.first[i])
        }
        node += "))"
        return node;
    }

	throw("Error while processing output tree")

    for(attribute in element) {
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

export {Interval}