
function roundToNumber(toRound, number) {
	return toRound - (toRound%number)
}

function nearestToBase(number, base) {
	number = Math.abs(number)
	return Math.pow(base, Math.floor( Math.log(number)/Math.log(base) ));
}

function formatNumber(a, nIncrement) {

	a = Number(a)

	if(a == 0)
		return 0

	if(nIncrement < 0.01)
		a = a.toExponential(3)
	else if(nIncrement > 10000)
		a = a.toExponential(0)

	a = String(a)

	if(a.indexOf('e') != -1) {
		a = a.replace("e", "*10^")
	}

	return a
}


function nthroot(pok, number) {
	
	if(pok % 2 == 0)
		return Math.pow(number, 1/pok)

	return Math.sign(number) * Math.pow(Math.abs(number), 1/pok)
}

export {roundToNumber, formatNumber, nearestToBase, nthroot}