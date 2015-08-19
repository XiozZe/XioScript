XSCL.push({
	row: "Supply",
	name: "Supply XioStock",
	description: "The stock of selected production subdivisions aim to have three times the required amount. (Just in case, you know.) This function will set the supply accordingly. Beware of the fact that each raw material has to have exactly one supplier: zero, two or more than two will give strange results, if any at all.",	
	code: function(){
				
		xcMain(["mill", "workshop"]);
		
		xlist.push(function(){
			for(var i = 0; i < xvar.main.xcId.length; i++){
				xcGet("supplyGet", xvar.realm+"/main/unit/view/"+xvar.main.xcId[i]+"/supply");
			}
		});		

		xlist.push(function(){
			for(var i = 0; i < xvar.main.xcId.length; i++){	
				xvar.play.supply = [];
				if(xvar.supplyGet[i].parcel){
					for(var j = 0; j < xvar.supplyGet[i].parcel.length; j++){
						xvar.play.supply.push( 4 * xvar.supplyGet[i].required[j] - xvar.supplyGet[i].stock[j] 
						- Math.max(xvar.supplyGet[i].required[j] - xvar.supplyGet[i].stock[j] , 0));
					}
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