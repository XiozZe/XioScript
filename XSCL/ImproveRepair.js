XSCL.push({
	row: "Equipment",
	name: "Improve Repair",
	description: "Repairs the equipment of the selected subdivisions. It only repairs the number in black, as the equipment piece of the number in red is not fully broken yet and therefore not cost efficient, although it will repair the part when the wear and tear is above 3% and all black parts are repaired. <br/><br/>The equipment used for reparation will be bought from the world market. It chooses the cheapest one but with a quality higher than the current equipment quality. Beware that this will inevitably increase the quality of the equipment over time, which could lead to problems with the employee qualification.",
	code: function(){
		
		xcMain(["fitness", "fuel", "hairdressing", "laundry", "medicine", "mill", "office", "repair", "restaurant", "workshop"]);
					
		for(var i = 0; i < xvar.main.xcId.length; i++){
			
			(function(i){				
				
				xlist.push(function(){
					xcGet("mainGet", xvar.realm+"/main/unit/view/"+xvar.main.xcId[i]);
					xcGet("eqGet", xvar.realm+"/window/unit/equipment/"+xvar.main.xcId[i]);
				});
				
				xlist.push(function(){
					
					xvar.play.toRepair = xvar.mainGet[i].wearBlack[0] + !!(xvar.mainGet[i].wearPerc[0] > 3 && !xvar.mainGet[i].wearBlack[0]);

					//Until nothing has to be repaired any more
					while(xvar.play.toRepair > 0){
						
						//Pick the cheapest	
						var cheapId = 0;
						var cheapPrice = 1000000000000000;
						var cheapAvail = 0;
						for(var j = 0; j < xvar.eqGet[i].price.length; j++){
							if(xvar.eqGet[i].price[j] < cheapPrice && xvar.eqGet[i].avail[j] > 0 && xvar.eqGet[i].quality[j] > xvar.mainGet[i].equipQual[0]){
								cheapPrice = xvar.eqGet[i].price[j];
								cheapId = xvar.eqGet[i].offer[j];
								cheapAvail = xvar.eqGet[i].avail[j];
							}
						}	

						if(cheapId === 0){
							console.log("No equipment fulfilling the requirements");
							break;
						}
						
						//Less to repair after successfully founding a supplier
						var amount = Math.min(xvar.play.toRepair, cheapAvail);
						xvar.play.toRepair -= amount;				
						
						xcSupplierPost("eqPost", xvar.realm + "/ajax/unit/supply/equipment", {
							'operation'       : "repair",
							'offer'  		  : cheapId,
							'unit'  		  : xvar.main.xcId[i],
							'supplier'		  : cheapId,
							'amount'		  : amount							
						});
					}	
				});				
			})(i);			
		}	

		xcList();
	}
});