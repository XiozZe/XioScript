//Handy tools such as parse and check if promise is resolved
const Tools = {

	/**
	 * Checks tries the function, and if errors occur return null
	 * Great for unsafe scraping of pages
	 */
	try: (func) => {
		try{
			return func();
		}
		catch(e){

			const allowedFailures = [
				"doc.querySelector(...) is null",
				"doc.querySelector(...).nextElementSibling is null",
				"reDoc.querySelector(...) is null",
				"reDoc.querySelector(...).nextElementSibling is null",
				"e.extract(...)[0] is undefined"
			]

			if(!allowedFailures.includes(e.message)){
				console.error("Tools Try Error: "+e.message);
			}
			return null;
		}
	},
		
	//Parse text to number
	parse: (textToParse) => {
		textToParse = String(textToParse).trim();
		if(textToParse === 'Не огр.' || textToParse === 'Unlim.' || textToParse === 'Не обм.' || textToParse === 'N’est pas limité' || textToParse === 'No limitado' || textToParse === '无限' || textToParse === 'Nicht beschr.') {
			return Number.POSITIVE_INFINITY;
		} 
		else {
			return parseFloat(textToParse.replace(/[\s\$\%]/g, "")) || 0;
		}
	},
	
	//Makes http post code from object
	encodeObject: (object) => {

		let string = "";
		for(let key in object){
			string += `${key}=${object[key]}&`;
		}
		string = string.slice(0, -1);
		return encodeURI(string);

	}

};