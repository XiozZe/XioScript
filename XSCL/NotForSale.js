XSCL.push({
	row: "Policy",
	name: "Not For Sale",
	description: "The policies for all goods of the selected subdivisions will be set to &quot;Not for sale&quot;. Works for production buildings and warehouses.",	
	code: function(){
		
		xcMain(["mill", "warehouse", "workshop"]);	
		
		xlist.push(function(){
			for(var i = 0; i < xvar.main.xcId.length; i++){
				xcGet("policyGet", xvar.realm+"/main/unit/view/"+xvar.main.xcId[i]+"/sale");
			}
		});
		
		xlist.push(function(){
			for(var i = 0; i < xvar.main.xcId.length; i++){	
				xvar.play.policy = [];
				for(var j = 0; j < xvar.policyGet[i].policy.length; j++){
					xvar.play.policy.push("Not for sale");
				}
				xcPost("policyPost", xvar.policyGet[i], [["policy", xvar.play.policy]], "save");
			}
		});
		
		xcList();
	}
});