XSCL.push({
	row: "Ads",
	name: "Required Ads",
	description: "Sets the advertisements expenses of a hairdressing salon to the required amount to keep the current popularity. If required expenses are zero or less than the minimum advertisement budget, it will set the expenses to minimum. The medium is always TV.",
	code: function(){
		
		xcMain(["fitness", "fuel", "hairdressing", "laundry", "medicine", "repair", "restaurant", "shop"]);

		xlist.push(function(){
			for(var i = 0; i < xvar.main.xcId.length; i++){
				xcGet("adsGet", xvar.realm+"/main/unit/view/"+xvar.main.xcId[i]+"/virtasement");
			}			
		});		

		xlist.push(function(){
			for(var i = 0; i < xvar.main.xcId.length; i++){	
				xvar.play.media = [false, false, false, false, true];
				xvar.play.price = [ Math.max( xvar.adsGet[i].priceReq[0], xvar.adsGet[i].priceMin ) ];
				xcPost("adsPost", xvar.adsGet[i], [["priceAds", xvar.play.price], ["mediaCheck", xvar.play.media]], "edit");
			}							
		});
		
		
		xcList();	
	}
});