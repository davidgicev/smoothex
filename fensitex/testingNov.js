import {FensiInput} from './index.js'


let element = new FensiInput()
element.HtmlElement.render()

document.getElementById("root").appendChild(element.HtmlElement.rendered)

element.focus()