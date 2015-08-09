XSCL.push({
	row: "Price",
	name: "Prime Cost Price",
	description: "For all selected production subdivisions and warehouses: set the price to the prime cost of the stock. If the prime cost of the stock is zero, do nothing.",	
	code: function(){
				
		xcMain(["mill", "warehouse", "workshop"]); 
		
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