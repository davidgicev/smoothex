import {SeparatorElement, OperatorElement} from './elements/elements.js'

function basicTokenize(string) {

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

  if(!string) {
    throw "ne mozhe empty ofco"
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

function tokenizePart(string, offset) {
  
  let basic = basicTokenize(string)
  let final = []

  for(let i=0; i<basic.length; i++) {
    
    if(basic[i].type == 'number') {
      final.push(basic[i])
      continue
    }

    if(basic[i].type == 'string') {
      
      if(i+1 < basic.length && basic[i+1].type == 'subscript') {
        final.push({
          type: 'variable',
          content: basic[i].content,
          subscript: basic[i+1].content
        })
        i++;
        continue
      }

      final.push({
        type: 'variable',
        content: basic[i].content
      })

      continue
    }

    // subscript staveno kako prvo
    final.push({
      type: 'variable',
      content: '',
      subscript: basic[i].content
    })
  }

  return final
}

function tokenizeString(string) {
  if(!string)
    return [""]
  let vkupno = []
  let parts = string.split(" ")
  let offset = 0
  for(let s of parts) {
    vkupno.push(tokenizePart(s, offset))
    offset += s.length+1
  }
  return vkupno.flat()
}

function isAlphaNumeric(char) {

  if(char.length != 1)
    return false

  if (/[a-zA-Z0-9.']/.test(char))
    return true

  return false
}

function shouldSkip(el) {
  
  let skippable = [OperatorElement, SeparatorElement]

  for(let c of skippable)
    if (el instanceof c)
      return true

  return false
}

export {tokenizeString, isAlphaNumeric, shouldSkip}