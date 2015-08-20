XSEL.push({
	name: "Unit List Sub Count",
	description: "On the unit list, extended the amount of subdivisions you can have on one page by 800, 1500, or 4000.",
	regex: "\/.*\/main\/company\/view\/[0-9]+\/unit_list$",
	code: function(){
		
        $(".paging a[href$=400]").after( 
			"<a href='"+xvar.realm+"/main/common/util/setpaging/dbunit/unitListWithProduction/800'><span>800</span></a>"+
			"<a href='"+xvar.realm+"/main/common/util/setpaging/dbunit/unitListWithProduction/1500'><span>1500</span></a>"+
			"<a href='"+xvar.realm+"/main/common/util/setpaging/dbunit/unitListWithProduction/4000'><span>4000</span></a>"
		);
		
		xcList();
	}
});