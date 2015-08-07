XSCL.push({
	row: "Employee",
	name: "Full Training",
	description: "Give the selected subdivisions a full training schedule of 4 weeks.",
	code: function(){
		
		console.log("Full Training is running!");	
		xcMain(["fitness", "fuel", "hairdressing", "laundry", "medicine", "mill", "office", "repair", "restaurant", "shop", "workshop"]);
		
		xlist.push(function(){
			for(var i = 0; i < xvar.main.xcId.length; i++){
				xcGet("trainGet", xvar.realm+"/window/unit/employees/education/"+xvar.main.xcId[i]);
			}
		});
		
		xlist.push(function(){
			for(var i = 0; i < xvar.main.xcId.length; i++){					
				xcPost("trainPost", xvar.trainGet[i], [["duration", [4]]], "train");
			}
		});	
		
		xcList();
	}
});