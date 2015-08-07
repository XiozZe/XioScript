XSCL.push({
	row: "Production",
	name: "Supply XioStock",
	description: "The stock of selected subdivisions aim to have three times the required amount. (Just in case, you know.) This function will set the supply accordingly. Beware of the fact that each raw material has to have exactly one supplier: zero, two or more than two will give strange results, if any at all.",	
	code: function(){
		
		console.log("Supply XioStock"); 		
		xcMain(["mill", "workshop"]);
		
		xlist.push(function(){
			for(var i = 0; i < xvar.main.xcId.length; i++){
				xcGet("supplyGet", xvar.realm+"/main/unit/view/"+xvar.main.xcId[i]+"/supply");
			}
		});		

		xlist.push(function(){
			for(var i = 0; i < xvar.main.xcId.length; i++){	
				xvar.play.supply = [];
				for(var j = 0; j < xvar.supplyGet[i].parcel.length; j++){
					xvar.play.supply.push( 4 * xvar.supplyGet[i].required[j] - xvar.supplyGet[i].stock[j] 
					- Math.max(xvar.supplyGet[i].required[j] - xvar.supplyGet[i].stock[j] , 0));
				}
				xcPost("supplyPost", xvar.supplyGet[i], [["parcel", xvar.play.supply]], "edit");
			}
		});
		
		xcList();
	}
});