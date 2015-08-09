XSCL.push({
	row: "Miscellaneous",
	name: "Subdivision Name Changer",
	description: "Change the name of a subdivision. Uses the selected subdivisions on the main page. The new name of the subdivision is the old name plus &quot;Hello! This name is changed with XS 10.0!&quot;",		
	code: function(){
		
		xcMain(["fitness", "fuel", "hairdressing", "laundry", "medicine", "mill", "office", "repair", "restaurant", "shop", "warehouse", "workshop"]);
		
		xlist.push(function(){
			for(var i = 0; i < xvar.main.xcId.length; i++){
				xcGet("ncwGet", xvar.realm+"/window/unit/changename/"+xvar.main.xcId[i]);			
			}	
		});			
		
		xlist.push(function(){
			for(var i = 0; i < xvar.main.xcId.length; i++){	
				xvar.play.name = [xvar.ncwGet[i].intName[0] + " Hello! This name is changed with XS 10.0!"];
				xcPost("ncwPost", xvar.ncwGet[i], [["intName", xvar.play.name]], "save");
			}
		});
		
		xcList();
	}
});