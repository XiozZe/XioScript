
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

HTMLDivElement.prototype.toggleActive = function(){
	//Change visibility on page
	console.assert("isActiveProcedure" in this);

	if(this.isActiveProcedure){
		this.style.backgroundColor = "#DDDDDD";
		this.querySelector("p").style.fontStyle = "italic";
		this.querySelectorAll("select, input").forEach(selectElement => selectElement.disabled = true);
	}
	else{            
		this.style.backgroundColor = "#FFFFFF";
		this.querySelector("p").style.fontStyle = "";
		this.querySelectorAll("select, input").forEach(selectElement => selectElement.disabled = false);
	}
	this.isActiveProcedure = !this.isActiveProcedure;
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