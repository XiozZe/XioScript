XSCL.push({
	row: "Miscellaneous",
	name: "Delete Subdivision",
	description: "Deletes the selected subdivisions. No-one will know it was there. Asks for confirmation before actually closing your subdivision.",
	code: function(){
		
		xcMain(["fitness", "fuel", "hairdressing", "laundry", "medicine", "mill", "office", "repair", "restaurant", "shop", "warehouse", "workshop"]);
		
		xlist.push(function(){
			for(var i = 0; i < xvar.main.xcId.length; i++){
				xcGet("closeGet", xvar.realm+"/window/unit/close/"+xvar.main.xcId[i]);
			}	
			xcUser("Are you sure you want to close these subdivisions? There is no way back. Type 'XIODELETE' (without the quotes) if you want to close the subdivisions", "confirm");
		});
		
		xlist.push(function(){
			if(xvar.play.confirm === "XIODELETE"){
				for(var i = 0; i < xvar.main.xcId.length; i++){				
					xcPost("closePost", xvar.closeGet[i], [], "close");
				}
			}
		});	
		
		xcList();	
	}
});