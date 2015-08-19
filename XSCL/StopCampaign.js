XSCL.push({
	row: "Ads",
	name: "Stop Campaign",
	description: "Stops the advertisement campaign of all goods of the target office",
	code: function(){
		
		xcMain(["office"]);
		
		xlist.push(function(){			
			for(var i = 0; i < xvar.main.xcId.length; i++){
				xcGet("adsGet", xvar.realm+"/main/unit/view/"+xvar.main.xcId[i]+"/virtasement");
			}			
		});
		
		xlist.push(function(){			
			for(var i = 0; i < xvar.main.xcId.length; i++){
				xvar.play.checkbox = [];
				for(var j = 0; j < xvar.adsGet[i].checkbox.length; j++){
					xvar.play.checkbox.push(true);
				}
				xcPost("adsPost", xvar.adsGet[i], [["checkbox", xvar.play.checkbox]], "stop");
			}			
		});
		
		xcList();
	}
});