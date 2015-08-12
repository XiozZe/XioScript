XSCL.push({
	row: "Employee",
	name: "Bonus Salary",
	description: "Sets the salary of the employees of the selected subdivision to maximize top1 + bonus. 80% of city salary as minimum. 50,000% of city salary maximum.",
	code: function(){
				
		xcMain(["fitness", "fuel", "hairdressing", "laundry", "medicine", "mill", "office", "repair", "restaurant", "shop", "workshop"]);
		
		var subType = {
			mine: [8, 1],
			power: [6, 13],
			workshop: [4, 6],
			farm: [1.6, 9],
			orchard: [1.2, 9],				
			medicine: [1, 4],
			fishingbase: [1, 7],				
			animalfarm: [0.6, 2],
			lab: [0.4, 5],
			mill: [0.4, 6],
			restaurant: [0.4, 8],
			shop: [0.4, 11],
			repair: [0.2, 0],
			fuel: [0.2, 0],
			service: [0.12, 10],
			office: [0.08, 12]
		}
		
		xlist.push(function(){
			for(var i = 0; i < xvar.main.xcId.length; i++){
				xcGet("salaryGet", xvar.realm+"/window/unit/employees/engage/"+xvar.main.xcId[i]);
			}
			xcGet("manager", xvar.realm+"/main/user/privat/persondata/knowledge");
		});
		
		xlist.push(function(){
			for(var i = 0; i < xvar.main.xcId.length; i++){	
				xvar.play.skill = Math.floor(-Math.log(xvar.salaryGet[0].number[0]/(35*subType[xvar.salaryGet[0].img[0]][0]*Math.pow(xvar.manager[0].qual[subType[xvar.salaryGet[0].img[0]][1]]+xvar.manager[0].bonus[subType[xvar.salaryGet[0].img[0]][1]],2)))/Math.log(7/5)*100)/100;
				xvar.play.calc = xvar.salaryGet[i].salaryNow[0] > xvar.salaryGet[i].salaryCity[0]? xvar.salaryGet[i].skillNow[0] - xvar.salaryGet[i].skillCity[0] * Math.log( 1 + xvar.salaryGet[i].salaryNow[0] / xvar.salaryGet[i].salaryCity[0] ) / Math.log(2) : Math.pow( xvar.salaryGet[i].salaryCity[0] / xvar.salaryGet[i].salaryNow[0], 2) * xvar.salaryGet[i].skillNow[0] - xvar.salaryGet[i].skillCity[0];
				xvar.play.newSalary = [ xvar.play.skill > ( xvar.play.calc + xvar.salaryGet[i].skillCity[0] )? xvar.salaryGet[i].salaryCity[0] * (Math.pow(2, ( xvar.play.skill - xvar.play.calc ) / xvar.salaryGet[i].skillCity[0] ) - 1) : xvar.salaryGet[i].salaryCity[0] * Math.sqrt( xvar.play.skill / ( xvar.salaryGet[i].skillCity[0] + xvar.play.calc ) ) ];
				xvar.play.newSalary[0] = Math.max(xvar.play.newSalary[0], (xvar.salaryGet[i].salaryCity[0]+.005) * 0.8);
				xvar.play.newSalary[0] = Math.min(xvar.play.newSalary[0], (xvar.salaryGet[i].salaryCity[0]-.005) * 500);
				xcPost("salaryPost", xvar.salaryGet[i], [["salaryNow", xvar.play.newSalary]], "save");
			}
		});	
		
		xcList();
	}
});