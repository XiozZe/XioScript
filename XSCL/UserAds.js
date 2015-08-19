XSCL.push({
	row: "Ads",
	name: "User Ads",
	description: "Sets the advertisements expenses of store or a service sector subdivision to the amount specified by the user with a dialog. If required expenses are less than the minimum advertisement budget, it will set the expenses to minimum. The medium is always TV.",
	code: function(){
		
		xcMain(["fitness", "fuel", "hairdressing", "laundry", "medicine", "repair", "restaurant", "shop"]);

		xlist.push(function(){
			for(var i = 0; i < xvar.main.xcId.length; i++){
				xcGet("adsGet", xvar.realm+"/main/unit/view/"+xvar.main.xcId[i]+"/virtasement");
			}
			xcUser("Fill in the price of advertisement your subdivision has to set for its marketing.", "ads");			
		});		

		xlist.push(function(){
			for(var i = 0; i < xvar.main.xcId.length; i++){	
				xvar.play.media = [false, false, false, false, true];
				xvar.play.price = [xvar.play.ads];
				xcPost("adsPost", xvar.adsGet[i], [["priceAds", xvar.play.price], ["mediaCheck", xvar.play.media]], "edit");
			}							
		});
		
		
		xcList();	
	}
});