XSCL.push({
	row: "Production",
	name: "To My Company",
	description: "The policies for all goods of the selected subdivisions will be set to &quot;Only to my company&quot;. Works for production buildings only (no warehouses).",	
	code: function(){
		
		console.log("To My Company is running!"); 	
		xcMain(["mill", "workshop"]);	
		
		xlist.push(function(){
			for(var i = 0; i < xvar.main.xcId.length; i++){
				xcGet("policyGet", xvar.realm+"/main/unit/view/"+xvar.main.xcId[i]+"/sale");
			}
		});
		
		xlist.push(function(){
			for(var i = 0; i < xvar.main.xcId.length; i++){	
				xvar.play.policy = [];
				for(var j = 0; j < xvar.policyGet[i].policy.length; j++){
					xvar.play.policy.push("Only to my company");
				}
				xcPost("policyPost", xvar.policyGet[i], [["policy", xvar.play.policy]], "save");
			}
		});
		
		xcList();
	}
});