XSCL.push({
	row: "Production",
	name: "Prime Cost Price",
	description: "For all selected subdivisions on the main page: set the price to the prime cost of the stock. If the prime cost of the stock is zero, do nothing.",	
	code: function(){
		
		console.log("Prime Cost Price is running!");  		
		xcMain(["mill", "workshop"]); 
		
		xlist.push(function(){
			for(var i = 0; i < xvar.main.xcId.length; i++){
				xcGet("priceGet", xvar.realm+"/main/unit/view/"+xvar.main.xcId[i]+"/sale");
			}
		});		

		xlist.push(function(){
			for(var i = 0; i < xvar.main.xcId.length; i++){	
				xvar.play.price = [];
				for(var j = 0; j < xvar.priceGet[i].price.length; j++){
					xvar.play.price.push(xvar.priceGet[i].primeCost[j] || xvar.priceGet[i].price[j]);
				}
				xcPost("pricePost", xvar.priceGet[i], [["price", xvar.play.price]], "save");
			}
		});
		
		xcList();
	}
});