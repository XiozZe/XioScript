XSCL.push({
	row: "Price",
	name: "CTIE Price",
	description: "For all selected production subdivisions and warehouses: set the price of the products to their prime cost increased by their CTIE. The price cannot exceed 30x IP. If the prime cost of the stock is zero, do nothing.",	
	code: function(){
				
		xcMain(["mill", "warehouse", "workshop"]); 
						
		xlist.push(function(){
			for(var i = 0; i < xvar.main.xcId.length; i++){
				xcGet("priceGet", xvar.realm+"/main/unit/view/"+xvar.main.xcId[i]+"/sale");
			}
			xcGet("transport", xvar.realm+"/main/common/main_page/game_info/transport");
			xcGet("TM", xvar.realm+"/main/globalreport/tm/info");
			xcGet("IP", xvar.realm+"/main/geo/countrydutylist/15913");
			xcGet("CTIE", xvar.realm+"/main/geo/regionENVD/15932");
		});		
		
		xlist.push(function(){
			for(var i = 0; i < xvar.main.xcId.length; i++){	
				xvar.play.price = [];
				for(var j = 0; j < xvar.priceGet[i].price.length; j++){
					xvar.play.franchiseIndex = xvar.TM[0].franchise.indexOf( xvar.priceGet[i].product[j] );
					xvar.play.product = xvar.TM[0].product[ xvar.play.franchiseIndex ] || xvar.priceGet[i].product[j];
					xvar.play.IPIndex = xvar.IP[0].product.indexOf( xvar.play.product );
					xvar.play.IP = xvar.IP[0].IP[ xvar.play.IPIndex ];
					
					xvar.play.CTIEIndex = xvar.CTIE[0].product.indexOf( xvar.play.product );
					xvar.play.CTIE = xvar.CTIE[0].CTIE[ xvar.play.CTIEIndex ];
					xvar.play.CTIEPrice = xvar.priceGet[i].primeCost[j] * (1 + xvar.play.CTIE/100);
					xvar.play.price.push( Math.min( Math.round(xvar.play.CTIEPrice*100)/100, 30 * xvar.play.IP ) || xvar.priceGet[i].price[j]);
				}
				xcPost("pricePost", xvar.priceGet[i], [["price", xvar.play.price]], "save");
			}
		});
		
		xcList();
	}
});