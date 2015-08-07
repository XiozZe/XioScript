XSCL.push({
	row: "Miscellaneous",
	name: "Delete Subdivision",
	description: "Deletes the selected subdivisions. No-one will know it was there.",
	code: function(){
		
		console.log("Delete Subdivision is running!");		
		xcMain(["fitness", "fuel", "hairdressing", "laundry", "medicine", "mill", "office", "repair", "restaurant", "shop", "warehouse", "workshop"]);
		
		xlist.push(function(){
			for(var i = 0; i < xvar.main.xcId.length; i++){
				xcGet("closeGet", xvar.realm+"/window/unit/close/"+xvar.main.xcId[i]);
			}	
		});
		
		xlist.push(function(){
			for(var i = 0; i < xvar.main.xcId.length; i++){				
				xcPost("closePost", xvar.closeGet[i], [], "close");
			}
		});	
		
		xcList();	
	}
});