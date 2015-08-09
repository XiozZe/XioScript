XSCL.push({
	row: "Employee",
	name: "Holiday On",
	description: "The employees of the selected subdivision will go on holiday.",
	code: function(){
				
		xcMain(["fitness", "fuel", "hairdressing", "laundry", "medicine", "mill", "office", "repair", "restaurant", "shop", "workshop"]);
		
		xlist.push(function(){		
			for(var i = 0; i < xvar.main.xcId.length; i++){
				xcGet("holidayOn", xvar.realm+"/main/unit/view/"+xvar.main.xcId[i]+"/holiday_set");
			}
		});
		
		xcList();
		
	}
});