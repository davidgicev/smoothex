import {functions, variables, builtInVariables, builtInFunctions, reset} from './itemClass.js'
import {fields, globalDict} from './FieldManager.js'
import {returnParsedInput} from './fensitex.js'
import {isAlphaNumeric, parseExpression} from './parser.js'
import {Interval} from './intervalArithmetic.js'
import {transition} from './animationClass.js'
import {Scanner, localTokenize} from './scanner.js'
import {DAG} from './fensitex/dagHelper.js'

function runInterpreter() {
  try {
    interpreter();
  }
  catch(e) {
  	if(!e.location)
  		throw e
  	fields.find(f => f.id == e.location).showError(e.error)
  }
}


function interpreter() {

	//adds the definand and compiled properties
    let mapped = mapper(fields)

    // orders the fields
    let ordered = reorder(mapped)

    // maps every line to a tokenGroup (array of tokens) 
    let tokenGroups = tokenize(ordered)

    // flattens tokens and adds semicolons
    let code = flatten(tokenGroups, ordered)

    // adds 'parsed' property
    parse(code, ordered)

	makeChanges(ordered)
}

function mapper(fields) {

    let mapped = fields.map(f => {
    	
    	let compiled;

    	try {
    		compiled = f.compile(true)
    	} catch(e) {
    		throw {error: e, location: f.id}
    	}

    	return {
            field: f,
            definand: f.getDefinand(),
            compiled: compiled
        }
    })

    for(let f of mapped) {
    	if(!f.compiled)
    		continue
    	let scanner = Scanner()
    	f.dependencies = scanner(f.compiled, f.definand)
    }

    return mapped
}

function reorder(mapped) {

	let l = mapped.length

	let nodes = Array(l).fill(null)
	let edges = []

	for(let i=0; i<l; i++) {
		let temp = Array(l).fill(-1)
		edges.push(temp)
		if(!mapped[i].compiled)
			continue
		for(let j=0; j<l; j++) {
			if(!mapped[j].compiled || !mapped[j].definand)
				continue
			if(mapped[i].dependencies.includes(mapped[j].definand.name)) {
				temp[j] = 1
			}
		}
	}

	let dag = new DAG(nodes, edges)
	let path = dag.getOrder()

	let visited = Array(l).fill(false)
	for(let i=0; i<l; i++) {
		let p = path[i]
		for(let j=0; j<l; j++) {
			if(edges[p][j] == 1 && !visited[j])
				throw {error:"Recursive definition", location: mapped[i].field.id}
		}
		visited[p] = true
	}

	return path.map(p => mapped[p])
}

function tokenize(ordered) {

	let tokenGroups = []

	let defined = {}
	for(let o of ordered) {
		if(!o.definand)
			continue
		defined[o.definand.name] = o.definand
	}
	
	for(let i=0; i<ordered.length; i++) {

		let object = ordered[i]

		let line = object.compiled

		if(!line) {
			tokenGroups.push([])
			continue
		}

		let tokens = []

		let parts = line.split(' ')
		let local = object.definand ? object.definand.args : [{name: 'x', type:'variable', local: true}]

		for(let p of parts) {
			
			if(!p) continue;

			if(!isNaN(p)) {
				tokens.push({
					type: 'number', value: Number(p),
				})
			}
			else {
				if(isOperation(p)) {
					tokens.push({
						type: 'operation', value: p,
					})
					continue
				}

				if(p[0] == '\\') {
					tokens.push({
						type: 'string', value: p, 
					})
					continue
				}

				let match = local?.find(x => x.name == p) || defined[p] || globalDict.find(p) 
				if(!match) {
					throw {
						error: `Undefined keyword "${p}"`,
						location: ordered[i].field.id
					}
				}
				tokens.push({
					type: 'string', value: p,
					variable: match.type == 'variable',
					function: match.type == 'function',
					arguments: match.args,
					local: match.local
				})
				continue
			}
		}

		tokenGroups.push(autoFill(tokens))
	}

	return tokenGroups
}

function parse(code, ordered) {

	let parserObject = parser()
    let result = parserObject(code, ordered.filter(o => o.definand).map(o => {
    	let data = o.definand
    	return {
	    	value: data.name,
	    	variable: data.type == 'variable',
	    	function: data.type == 'function',
	    	arguments: data.args
    	}
    }));

    for(let i=0; i<ordered.length; i++) {
    	ordered[i].parsed = result[i]
    }
}

function makeChanges(ordered) {

	reset()

	for(let i=0; i<ordered.length; i++) {

		let field = ordered[i].field

		if(!ordered[i].compiled) {
			field.object = {}
			continue
		}

		field.object = parseOutputTree(ordered[i].parsed)
	}

	transition()
}

function parseOutputTree(input) { //input is a parse tree

  if(input.arity == "binary" && input.value == ":=") {

    if(input.first.arity == "function") {

      // f(x) = neshto

      let name = input.first.value;

      let args = [];

      for(let i=0; i<input.first.first.length; i++)
        args.push(input.first.first[i].value)

      let expression = "return "+parseExpression(input.second)+";";

      let object = {
        name: name,
        f: eval("("+args.join(",")+")=>{"+expression+"}"),
        cif: eval("("+args.join(",")+")=>{return "+Interval.compileFunction(input.second, args)+"}")
      }

      return object;
    }
    else {

      // var = neshto
      
      let name = input.first.value;

      let expression = parseExpression(input.second);

      // console.log(expression)

      let object = {
        name: name,
        value: eval(expression)
      }

      return object;
    }
  }
  else {

    // anonymous function

    let args = ['x'];

    let expression = "return "+parseExpression(input)+";";

    let object = {
      name: null,
      f: eval("(x)=>{"+expression+"}"),
      cif: eval("(x)=>{return "+Interval.compileFunction(input, args)+"}") //pretprocesiranje
    }

    return object;

  }
}


let flatten = function(a, ordered) {
    let tokens = []
    for(let i=0; i<a.length; i++) {
        if(a[i] && a[i].length)
            tokens.push.apply(tokens, a[i].map(t => ({...t, line_nr: ordered[i].field.id})));
        tokens.push({
            type: "operation",
            value: ";"
        })
    }
    return tokens;
}


let isOperation = function(char) {

  return "+-*/^()[]:=,|".indexOf(char) != -1;
}

let autoFill = function(tokens) {
  for(let i=1; i<tokens.length-1; i++) {
    if(tokens[i].type == "filler")
      continue;
    let tip = isParentheses(tokens[i])
    if(tip) {
      if(isMem(tokens[i-1]) && tip === 1) {
        insert(i, "openP");
        i++;
      }
      if(isMem(tokens[i+1]) && tip === -1) {
        insert(i+1, "mult");
        i++;
      }
      if(tip + isParentheses(tokens[i+1]) === 0) {
        // insert(i+1, "mult");
        // i++;
      }
    }
    if(isMem(tokens[i]) && isMem(tokens[i-1])) {
      insert(i);      
      i++;
    }
    if(isMem(tokens[i]) && isMem(tokens[i+1])) {
      insert(i+1);
      i++;
    }   
  }
  return cleanFillers(tokens);

  function insert(i, type) {
    tokens.splice(i, 0, {
      type: type == "mult" ? "operation" : "filler",
      value: type == "mult" ? "*" : type
    })
  }
}

let cleanFillers = function(tokens) {
    // tokens.forEach(token => console.log(token.type, token.value))
  for(let i=1; i<tokens.length-1; i++) {
    if(tokens[i].type == "filler") {
      let token = tokens[i];
      if(token.value == "openP") {
        if(tokens[i-1].type == "number" || tokens[i-1].variable) {
          token.type = "operation";
          token.value = "*";
        }
        else if(tokens[i+1].value == "("){
          tokens.splice(i, 1);
          i--;
        }
      }
      else {
        if(tokens[i+1].type == "number" || tokens[i+1].variable) {
          token.type = "operation";
          token.value = "*";
        }
        if(tokens[i-1].type == "number" || tokens[i-1].variable) {
          token.type = "operation";
          token.value = "*";
        }
        if(tokens[i-1].function) {
          // token.type = "operation";
          // token.value = "(";
          tokens.splice(i, 1);
          i--;
        }
      }
    }
  }
  return tokens;
}

let isMem = function(token) {

  return token.type == "number" || token.type == "string";
}

let isParentheses = function(token) {
  if(token.type != "operation")
    return 0;
  if(token.value == "(")
    return 1;
  if(token.value == ")")
    return -1;
  return 0;
}

let parser = function () {
    let scope;
    let symbol_table = {};
    let token;
    let tokens;
    let token_nr;

    let itself = function () {
        return this;
    };

    let error = function(text, ref) {
        throw{
            error: text,
            location: ref.line_nr
        }
    }

    let func = function () {
        let a = [];
        let stepen;
        if(token.id == "^") {
            advance("^")
            // console.log(token)
            stepen = expression(80);
            // console.log(stepen)
            advance("*");
        }
        if(token.id != "(") {
          if(this.arguments.length != 1) {
            error("The function requires more than one argument but no parentheses are used", this)
          }
          a.push(expression(50))
        }
        else {
          advance("(");
          if (token.id !== ")") {
              while (true) {
                  // if (token.arity !== "string") {
                  //     token.error("Expected a parameter name.");
                  // }
                  a.push(expression(0));
                  if (token.id !== ",") {
                      break;
                  }
                  advance(",");
              }
          }

          advance(")");
        }
        if(a.length != this.arguments.length) {
          error(`Incorrect number of arguments\n${this.value} expects ${this.arguments.length}, got ${a.length}`, this);
        }

        if(stepen) {
            this.first = {
                arity: "function",
                first: a,
                value: this.value
            }
            this.second = stepen;
            this.arity  = "binary";
            this.value = "^"
            return this;
        }

        this.first = a
        this.arity = "function";
        return this;
    }

    let original_scope = {
        define: function (n) {
            let t = this.def[n.value];
            if (t) {
                error(t.reserved
                    ? "Already reserved."
                    : "Already defined.", this);
            }
            this.def[n.value] = n;
            n.reserved = false;
            n.nud      = n.function ? func : itself;
            n.led      = null;
            n.std      = null;
            n.lbp      = 0;
            n.scope    = scope;
            return n;
        },
        find: function (n) {
            let e = this, o;
            while (true) {
                o = e.def[n];
                if (o) {
                    return e.def[n];
                }
                e = e.parent;
                if (!e) {
                    o = symbol_table[n];
                    return (o)
                        ? o
                        : null;
                }
            }
        },
        pop: function () {
            scope = this.parent;
        },
        reserve: function (n) {
            if (n.arity !== "string" || n.reserved) {
                return;
            }
            let t = this.def[n.value];
            if (t) {
                if (t.reserved) {
                    return;
                }
                if (t.arity === "string") {
                    error("Already defined.",this);
                }
            }
            this.def[n.value] = n;
            n.reserved = true;
        }
    };

    let new_scope = function () {
        let s = scope;
        scope = Object.create(original_scope);
        scope.def = {};
        scope.parent = s;
        return scope;
    };

    let populateScope = function (declarations) {
      for(let i=0; i<declarations.length; i++) {
            if(declarations[i])
          scope.define(declarations[i]);
      }
    };

    let populateLocalScope = function (args) {
        new_scope();
        for(let i=0; i<args.length; i++) {
            scope.define({
                value: args[i].name,
                variable: true,
                function: false,
                local: true
            })
        }
    };

    let advance = function (id) {
        let a, o, t, v;
        if (id && token.id !== id) {
            error("Expected '" + id + "'.", this);
        }
        if (token_nr >= tokens.length) {
            token = symbol_table["(end)"];
            return;
        }
        t = tokens[token_nr];
        token_nr += 1;
        v = t.value;
        a = t.type;
        if (a === "string") {
            o = scope.find(v);
            if(!o) {
              o = scope.define(t);
            }
        } else if (a === "operation") {
            o = symbol_table[v];
            if (!o) {
                error("Unknown operator.", this);
            }
        } else if (a ===  "number") {
            o = symbol_table["(literal)"];
            a = "literal";
        } else {
            error("Unexpected token.",this);
        }
        token = Object.create(o);
        token.line_nr  = t.line_nr;
        token.column_nr    = t.column_nr;
        token.value = v;
        token.arity = a;
        token.function = t.function;
        token.variable = t.variable;
        token.local = t.local;  
        return token;
    };

    let expression = function (rbp) {
        let left;
        let t = token;
        advance();
        left = t.nud();
        while (rbp < token.lbp) {
            t = token;
            advance();
            left = t.led(left);
        }
        return left;
    };

    let statement = function (declaration) {
        let n = token, v;

        if(declaration && declaration.arguments)
            populateLocalScope(declaration.arguments)

        if(token.id != ";")
            v = expression(0);
        else
            v = null;

        advance(";");
        if(scope.parent) {
          scope.pop();
        }
        return v;
    };

    let statements = function (declarations) {
        let a = [], s;
        let i = 0;
        while (true) {
            if (token.id === "}" || token.id === "(end)") {
                break;
            }
            s = statement(declarations[i]);
            a.push(s)
            i++;
        }
        return a;
    };

    let block = function () {
        let t = token;
        advance("{");
        return t.std();
    };

    let original_symbol = {
        nud: function () {
            error("Undefined.", this);
        },
        led: function (left) {
            error("Missing operator.", this);
        }
    };

    let symbol = function (id, bp) {
        let s = symbol_table[id];
        bp = bp || 0;
        if (s) {
            if (bp >= s.lbp) {
                s.lbp = bp;
            }
        } else {
            s = Object.create(original_symbol);
            s.id = s.value = id;
            s.lbp = bp;
            symbol_table[id] = s;
        }
        return s;
    };

    let constant = function (s, v) {
        let x = symbol(s);
        x.nud = function () {
            scope.reserve(this);
            this.value = symbol_table[this.id].value;
            this.arity = "literal";
            return this;
        };
        x.value = v;
        return x;
    };

    let infix = function (id, bp, led) {
        let s = symbol(id, bp);
        s.led = led || function (left) {
            this.first = left;
            this.second = expression(bp);
            this.arity = "binary";
            return this;
        };
        return s;
    };

    let infixr = function (id, bp, led) {
        let s = symbol(id, bp);
        s.led = led || function (left) {
            this.first = left;
            this.second = expression(bp - 1);
            this.arity = "binary";
            return this;
        };
        return s;
    };

    infixr("^", 75)

    let assignment = function (id) {
        return infixr(id, 10, function (left) {
            if (left.id !== "." && left.id !== "[" && left.arity !== "string") {
                error("Bad lvalue.", this);
            }

            let o = scope.def[left.value];
            
            if(typeof o !== "object") {
        scope.define(left);
            }

            this.first = left;
            this.second = expression(9);
            this.assignment = true;
            this.arity = "binary";
            return this;
        });
    };

    let prefix = function (id, nud) {
        let s = symbol(id);
        s.nud = nud || function () {
            scope.reserve(this);
            this.first = expression(70);
            this.arity = "unary";
            return this;
        };
        return s;
    };

    let stmt = function (s, f) {
        let x = symbol(s);
        x.std = f;
        return x;
    };

    symbol("(end)");
    symbol("(string)");
    symbol(":");
    symbol(")");
    symbol("]");
    symbol("}");
    symbol(",");
    symbol(".");
    symbol("else");

    symbol("(literal)").nud = itself;
    symbol(";").nud = function () {
        return this;
    };


    symbol("this").nud = function () {
        scope.reserve(this);
        this.arity = "this";
        return this;
    };

    symbol("\\sqrt").nud = function() {

        let a = [];
        let stepen;

		advance("(");
		this.arity = 'function'
		this.first = [expression(0)]
		advance(")")

        return this;
    }

    symbol("\\nthroot").nud = function() {

        let a = [];
        let stepen;

		advance("(");
		this.arity = 'function'
		let ind = expression(0)
		advance(",")
		let rad = expression(0)
		advance(")")

		this.first = [ind, rad]

        return this;
    }

    assignment("=").led = function (left) {

        this.first = left;
        this.second = expression(9);
        this.assignment = true;
        this.arity = "binary";
        return this;
    }

    assignment(":=").led = function (left) {
      // if (left.id !== "." && left.id !== "[" && left.arity !== "string") {
     //        left.error("Bad lvalue.");
     //    }


   //      let o = scope.def[left.value];
   //      console.log(o);
        
   //      if(typeof o !== "object") {
      // scope.define(left);
   //      }

        this.first = left;
        this.second = expression(9);
        this.assignment = true;
        this.arity = "binary";
        return this;
    }

    infix("+", 50);
    infix("-", 50);

    infix("*", 60);
    infix("/", 60);

    // infix(".", 80, function (left) {
    //     this.first = left;
    //     if (token.arity !== "string") {
    //         error("Expected a property name.", this);
    //     }
    //     token.arity = "literal";
    //     this.second = token;
    //     this.arity = "binary";
    //     advance();
    //     return this;
    // });

    infix("[", 80, function (left) {
        this.first = left;
        this.second = expression(0);
        this.arity = "binary";
        advance("]");
        return this;
    });

    infix("(", 80, function (left) {
      // console.log("infix (")
        let a = [];
        if (left.id === "." || left.id === "[") {
            this.arity = "ternary";
            this.first = left.first;
            this.second = left.second;
            this.third = a;
        } else {
            this.arity = "binary";
            this.first = left;
            this.second = a;
            if ((left.arity !== "function") &&
                    left.arity !== "string" && left.id !== "(" &&
                    left.id !== "&&" && left.id !== "||" && left.id !== "?") {
                error("Expected a variable name.", this);
            }
        }
        if (token.id !== ")") {
            while (true) {
                a.push(expression(0));
                if (token.id !== ",") {
                    break;
                }
                advance(",");
            }
        }
        advance(")");
        return this;
    });

    prefix("-");
    prefix("+");

    prefix("(", function () {
      // console.log("prefix (")
        let e = expression(0);
        advance(")");
        return {
            arity: "unary",
            value: "(",
            first: e
        }
    });

    prefix("|", function () {
        // console.log("prefix |")
        let e = expression(0);
        // console.log(e)
        advance("|");
        return {
            arity: "unary",
            value: "|",
            first: e
        }
    })

    prefix("[", function () {
        let a = [];
        if (token.id !== "]") {
            while (true) {
                a.push(expression(0));
                if (token.id !== ",") {
                    break;
                }
                advance(",");
            }
        }
        advance("]");
        this.first = a;
        this.arity = "unary";
        return this;
    });

    stmt("if", function () {
        advance("(");
        this.first = expression(0);
        advance(")");
        this.second = block();
        if (token.id === "else") {
            scope.reserve(token);
            advance("else");
            this.third = token.id === "if" ? statement() : block();
        } else {
            this.third = null;
        }
        this.arity = "statement";
        return this;
    });


    return function (array_of_tokens, declarations) {
        tokens = array_of_tokens;
        token_nr = 0;
        new_scope();
        populateScope(declarations);
        advance();
        let s = statements(declarations);
        advance("(end)");
        scope.pop();
        return s;
    }
}

export {runInterpreter}