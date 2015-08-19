XSCL.push({
	row: "Ads",
	name: "User Campaign",
	description: "Sets advertisement campaign of all goods of the target office to the amount specified by the user with a dialog. Ignores minimum amount. The medium is TV, and it targets all region.",
	code: function(){
		
		xcMain(["office"]);
		
		xlist.push(function(){			
			for(var i = 0; i < xvar.main.xcId.length; i++){
				xcGet("adsGet", xvar.realm+"/main/unit/view/"+xvar.main.xcId[i]+"/virtasement");
			}			
		});
		
		xlist.push(function(){			
			for(var i = 0; i < xvar.main.xcId.length; i++){
				for(var j = 0; j < xvar.adsGet[i].productUrl.length; j++){
					xcGet("productGet", xvar.realm+"/main/unit/view/"+xvar.main.xcId[i]+"/virtasement"+xvar.adsGet[i].productUrl[j]);
				}				
			}	
			xcUser("Fill in the price of advertisement all your goods have to have.", "ads")
		});
		
		xlist.push(function(){	
			if(xvar.productGet){
				for(var i = 0; i < xvar.productGet.length; i++){
					xvar.play.cityCheck = [true];
					for(var j = 1; j < xvar.productGet[i].cityCheck.length; j++){
						xvar.play.cityCheck.push(true);
					}
					xvar.play.mediaCheck = [false, false, false, false, true];		
					xvar.play.price = [xvar.play.ads];
					xcPost("productPost", xvar.productGet[i], [["cityCheck", xvar.play.cityCheck], ["mediaCheck", xvar.play.mediaCheck], ["priceAds", xvar.play.price]], "edit");
				}	
			}					
		});
		
		xcList();
	}
});