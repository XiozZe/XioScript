XSCL.push({
	row: "Employee",
	name: "Holiday Off",
	description: "The employees of the selected subdivision will return from holiday.",
	code: function(){
				
		xcMain(["fitness", "fuel", "hairdressing", "laundry", "medicine", "mill", "office", "repair", "restaurant", "shop", "workshop"]);
			
		xlist.push(function(){		
			for(var i = 0; i < xvar.main.xcId.length; i++){
				xcGet("holidayOff", xvar.realm+"/main/unit/view/"+xvar.main.xcId[i]+"/holiday_unset");
			}
		});
		
		xcList();
		
	}
});