XSEL.push({
	name: "Realm Quality",
	description: "Compares the realm quality with your own quality in the industry tab of your company reports. If the realm quality is higher, your quality is shown with a red background color. Otherwise, the color will be green.",
	regex: "\/.*\/main\/company\/view\/[0-9]+\/sales_report\/by_produce$",
	code: function(){
		
		xcHere();
		
		for(var i = 0; i < xvar.here.qualityYou.length; i++){
			if(xvar.here.qualityYou[i] >= xvar.here.qualityRealm[i]){
				xc$("qualityYou").eq(i).css("background-color", "#E1F5E2");
			}
			else{				
				xc$("qualityYou").eq(i).css("background-color", "#F5E1F4");
			}
				
		}
		
		xcList();		
	}
});