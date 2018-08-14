//Check on which page we are and based on that add extensions

(function(){
	
	console.log("XioScript 14 is running!");
	const version = "14.0";

	//Page Number Adder
	//if(PageNumbersAdder.checkPage()){
		//PageNumbersAdder.create();
	//}

	//Forum Message Update
	//if(new RegExp("\/.*\/forum/forumcategory/list$").test(document.URL)){
		//ForumChecker.updateRecentForumValues();
	//}

	//Forum Message Tracker
	//if(ForumChecker.canAppendMessage()){
		//ForumChecker.trackNewForumMessage();
	//}

	const unitList = Page.get("UnitList")
	if(unitList.test(document, document.URL)){
		const list = new ListChoice("MainList")
		list.createList()
	}

	//Equipment List
	if(new RegExp("\/.*\/main\/company\/view\/[0-9]+\/unit_list\/equipment$").test(document.URL)){
		const salaryList = new ListChoice("ManagementList")
		salaryList.createList()
	}	

	//Salary List
	if(new RegExp("\/.*\/main\/company\/view\/[0-9]+\/unit_list\/employee\/salary$").test(document.URL)){
		const salaryList = new ListChoice("ManagementList")
		salaryList.createList()
	}	

	Extension.run()

	//Not user company: we shouldn't use any building or top manager function here
	//if(($(".officePlace a").attr("href") + "/dashboard" === $(".dashboard a").attr("href") || !$(".officePlace > a").length) && !$(".officePlace tr:eq(1) a").length){
		
		//Building
		//if(new RegExp("\/.*\/main\/unit\/create\/[0-9]+").test(document.URL)){
		//    buildingShortener();
		//}

		//Top Manager
		//if(new RegExp("\/.*\/main\/unit\/view\/[0-9]+$").test(document.URL) && ($(".fa-users").length === 1 || $("[href*='/window/unit/employees/engage/']").length === 1)){
		//    topManagerStats();
		//}	

	//}


})()


