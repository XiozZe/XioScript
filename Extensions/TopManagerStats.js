
let TopManagerStats = async () => {

	let qual = await Scrapper.get("/"+Vital.getRealm()+"/main/user/privat/persondata/knowledge", VirtoMap.Manager);
	let here = VirtoMap.Main($(document)).values;
	
	let factor1 = HardData.getTop1(here.type);
	let factor3 = HardData.getTop3(here.type);			
	
	let managerIndex = qual.pic.indexOf(here.managerPic);
				
	if(managerIndex >= 0){
				
		let managerBase = qual.base[managerIndex];
		let managerTotal = here.managerLevel;
		let ov1 = Formulas.overflowTop1(here.managerEmployees, factor3, managerTotal);
		let ov3 = Formulas.overflowTop3(here.employeesCur, here.skillNow, here.techLevel, factor1, managerTotal);
						
		$(".unit_box:has(.fa-users) tr:not(:has([colspan])):eq(3) td:eq(1)").append( " (current)"
			+"<div style='color: darkgreen'>"+(Math.floor(Formulas.skill(here.employeesCur, factor1, managerBase)*100)/100).toFixed(2)+" (target) </div>"
			+"<div style='color: indigo'>"+(Math.floor(Formulas.skill(here.employeesCur, factor1, managerTotal)*100)/100).toFixed(2)+" (maximum) </div>"
			+"<div style='color: crimson'>"+(Math.floor(Formulas.skill(here.employeesCur, factor1, managerTotal*ov1)*100)/100).toFixed(2)+" (overflow) </div>"
		);
		
		$(".unit_box:has(.fa-users) tr:not(:has([colspan])):eq(0) td:eq(1)").append( " (current)"
			+"<div style='color: darkgreen'>"+Math.floor(Formulas.employees(here.skillNow, factor1, managerBase)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")+" (target) </div>"
			+"<div style='color: indigo'>"+Math.floor(Formulas.employees(here.skillNow, factor1, managerTotal)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")+" (maximum) </div>"
			+"<div style='color: crimson'>"+Math.floor(Formulas.employees(here.skillNow, factor1, managerTotal*ov1)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")+" (overflow) </div>"
		);
		
		$(".unit_box:has(.fa-user) tr:not(:has([colspan])):eq(2) td:eq(1)").append( " (current)"
			+"<div style='color: darkgreen'>"+Math.floor(Formulas.allEmployees(factor3, managerBase)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")+" (target) </div>"
			+"<div style='color: indigo'>"+Math.floor(Formulas.allEmployees(factor3, managerTotal)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")+" (maximum) </div>"
			+"<div style='color: crimson'>"+Math.floor(Formulas.allEmployees(factor3, managerTotal)*ov3).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")+" (overflow) </div>"
		);
		
		$(".unit_box:has(.fa-cogs) tr:not(:has([colspan])):eq(2) td:eq(1)").append( " (current)"
			+"<div style='color: darkgreen'>"+(Math.floor(Formulas.equip(Formulas.skill(here.employeesCur, factor1, managerBase))*100)/100).toFixed(2)+" (target) </div>"
			+"<div style='color: indigo'>"+(Math.floor(Formulas.equip(Formulas.skill(here.employeesCur, factor1, managerTotal))*100)/100).toFixed(2)+" (maximum) </div>"
			+"<div style='color: crimson'>"+(Math.floor(Formulas.equip(Formulas.skill(here.employeesCur, factor1, managerTotal*ov1))*100)/100).toFixed(2)+" (overflow) </div>"
		);
		
		$(".unit_box:has(.fa-industry) tr:not(:has([colspan])):eq(2) td:eq(1)").append( " (current)"
			+"<div style='color: darkgreen'>"+Math.floor(Formulas.techLevel(managerBase))+" (target) </div>"
			+"<div style='color: indigo'>"+Math.floor(Formulas.techLevel(managerTotal))+" (maximum) </div>"
			+"<div style='color: crimson'>"+Math.floor(Formulas.techLevel(managerTotal*ov1))+" (overflow) </div>"
		);
		
		$(".unit_box:has(.fa-tasks) tr:not(:has([colspan])):eq(7)").after( ""
			+"<tr style='color: blue'><td>Expected top manager efficiency</td><td>"+Formulas.efficiency(here.employeesCur, here.managerEmployees, managerTotal, factor1, factor3, here.skillNow, here.techLevel)+"</td></tr>"
		);			
		
	}
	else{

		//Old Manager Page is ENGLISH ONLY
		
		managerIndex = qual.pic.indexOf(HardData.getManagerImg(here.type));
		let managerBase = qual.base[managerIndex];
		let managerTotal = managerBase + qual.bonus[managerIndex];
		
		let placeText = ($place, text, value, color) => {
			$place.html($place.html()+"<br><span style='color: "+color+"'><b>"+value+"</b>"+text+"</span>");			
		}
		
		let $qualRow = $("tr:contains('Qualification of employees'), tr:contains('Qualification of scientists'), \n\
						tr:contains('Workers qualification')");
		let $levelRow = $("tr:contains('Qualification of player')");
		let $empRow = $("tr:contains('Number of employees'), tr:contains('Number of scientists'),\n\
							tr:contains('Number of workers')");
		let $totalEmpRow = $("tr:contains('profile qualification')");
		let $techRow = $("tr:contains('Technology level'), tr:contains('Current research')");
		let $equipRow = $("tr:contains('Equipment quality'), tr:contains('Computers quality'),\n\
				tr:contains('Livestock quality'), tr:contains('Quality of agricultural machines')");
		let $effiRow =  $("tr:contains('Top manager efficiency')");       
		
		let amount = Tools.parse($empRow.find("td:eq(1)").text());
		let skill = Tools.parse($qualRow.find("td:eq(1)").text());
		let level = Tools.parse($levelRow.find("td:eq(1)").text());
		let totalEmp = Tools.parse($totalEmpRow.find("td:eq(1)").text());
		let tech = Tools.parse($techRow.find("td:eq(1)").text());
		let eqQual = Tools.parse($equipRow.find("td:eq(1)").text());
					
		ov1 = Formulas.overflowTop1(totalEmp, factor3, managerTotal);
		ov3 = Formulas.overflowTop3(amount, skill, tech, factor1, managerTotal);
								
		placeText($empRow.find("td:eq(1)")," (target)", Math.floor(Formulas.employees(skill, factor1, managerBase)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " "), "darkgreen");       
		placeText($empRow.find("td:eq(1)")," (maximum)", Math.floor(Formulas.employees(skill, factor1, managerTotal)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " "), "indigo");
		placeText($empRow.find("td:eq(1)")," (overflow)", Math.floor(Formulas.employees(skill, factor1, managerTotal*ov1)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " "), "crimson");
		placeText($qualRow.find("td:eq(1)")," (target)", (Math.floor(Formulas.skill(amount, factor1, managerBase)*100)/100).toFixed(2), "darkgreen");
		placeText($qualRow.find("td:eq(1)")," (maximum)", (Math.floor(Formulas.skill(amount, factor1, managerTotal)*100)/100).toFixed(2), "indigo");
		placeText($qualRow.find("td:eq(1)")," (overflow)", (Math.floor(Formulas.skill(amount, factor1, managerTotal*ov1)*100)/100).toFixed(2), "crimson");
		placeText($totalEmpRow.find("td:eq(1)")," (target)", Math.floor(Formulas.allEmployees(factor3, managerBase)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " "), "darkgreen");
		placeText($totalEmpRow.find("td:eq(1)")," (maximum)", Math.floor(Formulas.allEmployees(factor3, managerTotal)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " "), "indigo");
		placeText($totalEmpRow.find("td:eq(1)")," (overflow)", Math.floor(Formulas.allEmployees(factor3, managerTotal)*ov3).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " "), "crimson");
		placeText($equipRow.find("td:eq(1)")," (target)", (Math.floor(Formulas.equip(Formulas.skill(amount, factor1, managerBase))*100)/100).toFixed(2), "darkgreen");
		placeText($equipRow.find("td:eq(1)")," (maximum)", (Math.floor(Formulas.equip(Formulas.skill(amount, factor1, managerTotal))*100)/100).toFixed(2), "indigo");	
		placeText($equipRow.find("td:eq(1)")," (overflow)", (Math.floor(Formulas.equip(Formulas.skill(amount, factor1, managerTotal*ov1))*100)/100).toFixed(2), "crimson");	
		placeText($techRow.find("td:eq(1)")," (target)", Math.floor(Formulas.techLevel(managerBase)), "darkgreen");
		placeText($techRow.find("td:eq(1)")," (maximum)", Math.floor(Formulas.techLevel(managerTotal)), "indigo");
		placeText($techRow.find("td:eq(1)")," (overflow)", Math.floor(Formulas.techLevel(managerTotal*ov1)), "crimson");
		placeText($effiRow.find("td:eq(1)"), " (Expected top manager efficiency)", Formulas.efficiency(amount, totalEmp, managerTotal, factor1, factor3, skill, tech), "blue");
		
	}
}
