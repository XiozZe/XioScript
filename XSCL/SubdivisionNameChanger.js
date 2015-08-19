XSCL.push({
	row: "Miscellaneous",
	name: "Subdivision Name Changer",
	description: "Change the name of a subdivision. Uses the selected subdivisions on the main page. A dialog is prompted where you will have to fill in the new name.",		
	code: function(){
		
		xcMain(["fitness", "fuel", "hairdressing", "laundry", "medicine", "mill", "office", "repair", "restaurant", "shop", "warehouse", "workshop"]);
		
		xlist.push(function(){
			for(var i = 0; i < xvar.main.xcId.length; i++){
				xcGet("ncwGet", xvar.realm+"/window/unit/changename/"+xvar.main.xcId[i]);			
			}	
			xcUser("Give your subdivisions a new name!", "name")
		});			
		
		xlist.push(function(){
			for(var i = 0; i < xvar.main.xcId.length; i++){	
				xvar.play.name = [xvar.play.name];
				xcPost("ncwPost", xvar.ncwGet[i], [["intName", xvar.play.name]], "save");
			}
		});
		
		xcList();
	}
});