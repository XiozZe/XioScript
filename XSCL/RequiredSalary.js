XSCL.push({
	row: "Employee",
	name: "Required Salary",
	description: "Sets the salary of the employees of the selected subdivision in such a way that the new qualification of the employees matches their required qualification. 80% of city salary as minimum. 50,000% of city salary maximum.",
	code: function(){
				
		xcMain(["fitness", "fuel", "hairdressing", "laundry", "medicine", "mill", "office", "repair", "restaurant", "shop", "workshop"]);
		
		xlist.push(function(){
			for(var i = 0; i < xvar.main.xcId.length; i++){
				xcGet("salaryGet", xvar.realm+"/window/unit/employees/engage/"+xvar.main.xcId[i]);
			}
		});
		
		xlist.push(function(){
			for(var i = 0; i < xvar.main.xcId.length; i++){		
				xvar.play.calc = xvar.salaryGet[i].salaryNow[0] > xvar.salaryGet[i].salaryCity[0]? 
					xvar.salaryGet[i].skillNow[0] - xvar.salaryGet[i].skillCity[0] * Math.log( 1 + xvar.salaryGet[i].salaryNow[0] / xvar.salaryGet[i].salaryCity[0] ) / Math.log(2) 
					: Math.pow( xvar.salaryGet[i].salaryCity[0] / xvar.salaryGet[i].salaryNow[0], 2) * xvar.salaryGet[i].skillNow[0] - xvar.salaryGet[i].skillCity[0];
				xvar.play.newSalary = [ xvar.salaryGet[i].skillRequired[0] > ( xvar.play.calc + xvar.salaryGet[i].skillCity[0] )? 
					xvar.salaryGet[i].salaryCity[0] * (Math.pow(2, ( xvar.salaryGet[i].skillRequired[0] - xvar.play.calc ) / xvar.salaryGet[i].skillCity[0] ) - 1) 
					: xvar.salaryGet[i].salaryCity[0] * Math.sqrt( xvar.salaryGet[i].skillRequired[0] / ( xvar.salaryGet[i].skillCity[0] + xvar.play.calc ) ) ];
				xvar.play.newSalary[0] = Math.max(xvar.play.newSalary[0], (xvar.salaryGet[i].salaryCity[0]+.005) * 0.8);
				xvar.play.newSalary[0] = Math.min(xvar.play.newSalary[0], (xvar.salaryGet[i].salaryCity[0]-.005) * 500);
				xcPost("salaryPost", xvar.salaryGet[i], [["salaryNow", xvar.play.newSalary]], "save");
			}
		});	
		
		xcList();
	}
});