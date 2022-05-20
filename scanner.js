import {globalDict} from './FieldManager.js'

function removeEquals(string) {
    return string
}

function localTokenize(string) {
    string = removeEquals(string)
    let members = string.split(" ")
    return members.filter(m => {
        if(!m || !isNaN(m))
            return false

        if("+-=*/^".includes(m))
            return false

        return true
    });
}

function Scanner() {
    
    let tokens;
    let deps = []
    let scopes = []
    let mainDef;

    let depend = function(str) {
        if(!deps.includes(str))
            deps.push(str)
    }

    let newScope = function() {
        scopes.push([])
    }

    let find = function(def) {

        // if(globalDict.find(def))
        //     return true

        let i = scopes.length - 1
        while(i >= 0) {
            if(scopes[i].includes(def))
                return true
            i--
        }
        return false
    }

    let define = function(def) {
        if(!find(def)) 
            scopes[scopes.length - 1].push(def)
    }

    let advance = function(symbol) {

        while(tokens.length) {

            let token = tokens.shift()
            let next = tokens[0]

            if(token == symbol)
                return

            if(token == '(') {
                advance(')')
                continue
            }

            if(token == '\\sum') {
                tokens.shift() // (
                newScope()
                advance(',')
                let s = scopes.pop()
                advance(',')
                scopes.push(s)
                advance(')')
                scopes.pop()
                continue
            }

            if(token == ':=') {
                scopes.pop()
                continue
            }

            if(token == ',')
                continue

            if(!find(token))
                depend(token)
        }
    }

    return function(string, definand) {
        deps = []
        tokens = localTokenize(string)
        newScope()
        if(definand && definand.args)
            scopes[0].push(...definand.args.map(a => a.name))
        // za definicijata
        newScope()
        if(definand)
            define(definand.name)
        advance()
        return deps
    }
}

export {Scanner, localTokenize}