XSCL.push({
	row: "Retail",
	name: "Price 3%",
	description: "For all selected stores: increase the price by 3% in case the stock was sold out, and decrease the price by 3% if there are goods left from yesterday. Exception for when there was nothing in stock (sales equals zero): in that case the price doesn&quot;t change.",	
	code: function(){
		
		console.log("Stores 3%");		
		xcMain(["fuel", "shop"]);
		
		xlist.push(function(){
			for(var i = 0; i < xvar.main.xcId.length; i++){
				xcGet("tradeGet", xvar.realm+"/main/unit/view/"+xvar.main.xcId[i]+"/trading_hall");
			}			
		});		

		xlist.push(function(){
			for(var i = 0; i < xvar.main.xcId.length; i++){
				xvar.play.price = [];
				for(var j = 0; j < xvar.tradeGet[i].priceSale.length; j++){					
					if(xvar.tradeGet[i].delivered[j] === xvar.tradeGet[i].stock[j] && xvar.tradeGet[i].sales[j]){
						xvar.play.price.push(xvar.tradeGet[i].priceSale[j] * 1.03);
					}
					else if(xvar.tradeGet[i].delivered[j] === xvar.tradeGet[i].stock[j]){
						xvar.play.price.push(xvar.tradeGet[i].priceSale[j]);
					}
					else{
						xvar.play.price.push(xvar.tradeGet[i].priceSale[j] * 0.97);
					}
				}
				xcPost("tradePost", xvar.tradeGet[i], [["priceSale", xvar.play.price]], "setprice");
			}							
		});
		
		xcList();
	}
});