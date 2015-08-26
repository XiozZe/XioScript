XSCL.push({
    row: "Supply",
    name: "Zero Supply",
    description: "The stock of selected production subdivisions will have their supply set to zero.",
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
						xvar.play.supply.push( 0 );
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