XSCL.push({
	row: "Service",
	name: "Full Service",
	description: "For all selected restaurants, hospitals and autorepair: increase the price by 3% when the amount of visitors is higher than 97% of the maximum amount of visitors, and decrease the price by 3% when lower than 97%. Also sets the supply aiming for the stock to equal the required.",	
	code: function(){
		 		
		xcMain(["medicine", "repair", "restaurant"]);		
				
		xlist.push(function(){
			for(var i = 0; i < xvar.main.xcId.length; i++){
				xcGet("mainGet", xvar.realm+"/main/unit/view/"+xvar.main.xcId[i]);
				xcGet("supplyGet", xvar.realm+"/main/unit/view/"+xvar.main.xcId[i]+"/supply");
			}			
		});		

		xlist.push(function(){
			for(var i = 0; i < xvar.main.xcId.length; i++){	
				if(xvar.supplyGet[i].parcel){
					if(xvar.mainGet[i].visitorsNum[0] > xvar.mainGet[i].visitorsMax[0] * 0.97){
						xvar.play.price = [ xvar.mainGet[i].priceOld[0] * 1.03 ];
					}
					else{
						xvar.play.price = [ xvar.mainGet[i].priceOld[0] * 0.97 ];
					}							
					
					xvar.play.supply = [];
					for(var j = 0; j < xvar.supplyGet[i].parcel.length; j++){
						xvar.play.required = xvar.supplyGet[i].required[j] * xvar.mainGet[i].visitorsMax[0];
						xvar.play.supply.push( 2 * xvar.play.required - xvar.supplyGet[i].stock[j] 
						- Math.max(xvar.play.required - xvar.supplyGet[i].stock[j] , 0));
					}			
				
					xcPost("mainPost", xvar.mainGet[i], [["priceNew", xvar.play.price]], "setprice");
					xcPost("supplyPost", xvar.supplyGet[i], [["parcel", xvar.play.supply]], "edit");
				}
				else{
					console.log("This subdivision has no suppliers: "+xvar.main.xcId[0]);
				}
			}							
		});
		
		xcList();
	}
});