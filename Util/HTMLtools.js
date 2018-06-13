
/** 
 * Makes querying easier, saves writing
 */ 
Node.prototype.extract = function(selector){
	return Array.from(this.querySelectorAll(selector));
}

Node.prototype.createChild = function(tagName){
	const newElement = document.createElement(tagName);
	this.appendChild(newElement);
	return newElement;
}

HTMLUListElement.prototype.equalWidth = function(){

	//Column Width
	let maxWidth = 0;
	const lis = this.childNodes;
	for(const li of lis){       
		const width = li.scrollWidth;
		maxWidth = Math.max(width, maxWidth);
	}        
	const width = maxWidth+"px";
	for(const li of lis){            
		li.style.width = width;
	}  

}

HTMLDivElement.prototype.toggleProcedureActive = function(){

	console.assert("isActiveProcedure" in this, "Tried to call toggleProcedureActive on a div that doesn't have inActiveProcedure");

	this.isActiveProcedure = !this.isActiveProcedure;
	if(this.isActiveProcedure){
		this.classList.remove("procedureDisabled");
		this.querySelectorAll("select, input").forEach(selectElement => selectElement.disabled = false);
	}
	else{            
		this.classList.add("procedureDisabled");
		this.querySelectorAll("select, input").forEach(selectElement => selectElement.disabled = true);
	}
}

HTMLDivElement.prototype.setMaxInputWidth = function(){
	
	let maxWidth = 0;            
	const inputs = this.querySelectorAll("select, input");
	for(const input of inputs){     
		const paddingWidth = window.getComputedStyle(input, null).getPropertyValue("padding-left")
		const inputWidth = input.scrollWidth - 2*parseInt(paddingWidth);
		maxWidth = Math.max(maxWidth, inputWidth);
	}
	for(const input of inputs){
		input.style.width = maxWidth+"px";		
	}	

}