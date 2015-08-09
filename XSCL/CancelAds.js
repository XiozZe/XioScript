XSCL.push({
	row: "Ads",
	name: "Cancel Ads",
	description: "Cancel the advertisement of the selected subdivisions. Works for stores and service sector buildings.",
	code: function(){
		
		xcMain(["fitness", "fuel", "hairdressing", "laundry", "medicine", "repair", "restaurant", "shop"]);

		xlist.push(function(){
			for(var i = 0; i < xvar.main.xcId.length; i++){
				xcGet("adsGet", xvar.realm+"/main/unit/view/"+xvar.main.xcId[i]+"/virtasement");
			}			
		});		

		xlist.push(function(){
			for(var i = 0; i < xvar.main.xcId.length; i++){	
				xcPost("adsPost", xvar.adsGet[i], [], "cancel");
			}							
		});
		
		
		xcList();	
	}
});