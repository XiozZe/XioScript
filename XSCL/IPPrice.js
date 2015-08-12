XSCL.push({
	row: "Price",
	name: "IP Price",
	description: "For all selected production subdivisions and warehouses: set the price of the products to 1x their IP.",	
	code: function(){
				
		xcMain(["mill", "warehouse", "workshop"]); 
						
		xlist.push(function(){
			for(var i = 0; i < xvar.main.xcId.length; i++){
				xcGet("priceGet", xvar.realm+"/main/unit/view/"+xvar.main.xcId[i]+"/sale");
			}
			xcGet("TM", xvar.realm+"/main/globalreport/tm/info");
			xcGet("IP", xvar.realm+"/main/geo/countrydutylist/15913");
		});		

		xlist.push(function(){
			for(var i = 0; i < xvar.main.xcId.length; i++){	
				xvar.play.price = [];
				for(var j = 0; j < xvar.priceGet[i].price.length; j++){
					xvar.play.franchiseIndex = xvar.TM[0].franchise.indexOf( xvar.priceGet[i].product[j] );
					xvar.play.product = xvar.TM[0].product[ xvar.play.franchiseIndex ] || xvar.priceGet[i].product[j];
					xvar.play.IPIndex = xvar.IP[0].product.indexOf( xvar.play.product );
					xvar.play.IP = xvar.IP[0].IP[ xvar.play.IPIndex ];
					xvar.play.price.push( xvar.play.IP );
				}
				xcPost("pricePost", xvar.priceGet[i], [["price", xvar.play.price]], "save");
			}
		});
		
		xcList();
	}
});