XSEL.push({
	name: "Top Manager Stats",
	description: "Shows top manager stats on the main page of a subdivision.",
	regex: "\/.*\/main\/unit\/view\/[0-9]+(\/?)$",
	code: function(){
		
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
		
		xcHere();
		if(xvar.here.managerQual){
			
			xlist.push(function(){				
				xcGet("manager", xvar.realm+"/main/user/privat/persondata/knowledge");				
			});			
			xlist.push(function(){
				
				xvar.play.factor1 = subType[ xvar.here.img[0] ][0];
				xvar.play.factor3 = xvar.play.factor1 + xvar.play.factor1 * 9 * (xvar.here.img[0] === "mill");
				xvar.play.managerBonus = xvar.manager[0].bonus[ subType[ xvar.here.img[0] ][1] ];
				xvar.play.managerNormal = xvar.here.managerQual[0] - xvar.play.managerBonus;
				
				xvar.play.techMax = Math.pow(xvar.here.managerQual*156.25, 1/3);
				xcHtml("techLevel", "<br><span style='color: Crimson'><b>"+Math.floor(xvar.play.techMax)+"</b> (Maximum technology level with this top manager qualification)</span>"); 
				
				xvar.play.emplNumMax = Math.pow(5,1+xvar.here.emplSkill[0]) * Math.pow(7, 1-xvar.here.emplSkill[0]) * xvar.play.factor1 * Math.pow(xvar.play.managerNormal, 2);
				xcHtml("emplNum", "<br><span style='color: DarkMagenta'><b>"+Math.floor(xvar.play.emplNumMax).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")+"</b> (Maximum number of employees with maximized Top1)</span>");
				xvar.play.emplNumMaxBonus = Math.pow(5,1+xvar.here.emplSkill[0]) * Math.pow(7, 1-xvar.here.emplSkill[0]) * xvar.play.factor1 * Math.pow(xvar.here.managerQual, 2);
				xcHtml("emplNum", "<br><span style='color: Crimson'><b>"+Math.floor(xvar.play.emplNumMaxBonus).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")+"</b> (Maximum number of employees with maximized Top1 + bonus)</span>");
				
				xvar.play.emplSkillMax = -Math.log(xvar.here.emplNum[0]/(35*xvar.play.factor1*Math.pow(xvar.play.managerNormal, 2)))/Math.log(7/5);
				xcHtml("emplSkill", "<br><span style='color: DarkMagenta'><b>"+Math.floor(xvar.play.emplSkillMax *100)/100+"</b> (Maximum employee qualification with maximized Top1)</span>");
				xvar.play.emplSkillMaxBonus = -Math.log(xvar.here.emplNum[0]/(35*xvar.play.factor1*Math.pow(xvar.here.managerQual[0], 2)))/Math.log(7/5);
				xcHtml("emplSkill", "<br><span style='color: Crimson'><b>"+Math.floor(xvar.play.emplSkillMaxBonus*100)/100+"</b> (Maximum employee qualification with maximized Top1 + bonus)</span>");			
				
				xvar.play.equipQualMax = Math.pow(xvar.here.emplSkill[0], 1.5);				
				xcHtml("equipQual", "<br><span style='color: MediumBlue'><b>"+Math.floor(xvar.play.equipQualMax*100)/100+"</b> (Maximum equipment quality with this employee qualification)</span>");
				xvar.play.equipQualSkillMax = Math.pow(xvar.play.emplSkillMax, 1.5);		
				xcHtml("equipQual", "<br><span style='color: DarkMagenta'><b>"+Math.floor(xvar.play.equipQualSkillMax*100)/100+"</b> (Maximum equipment quality with the employee qualification maximized to Top1)</span>");
				xvar.play.equipQualSkillMaxBonus = Math.pow(xvar.play.emplSkillMaxBonus, 1.5);
				xcHtml("equipQual", "<br><span style='color: Crimson'><b>"+Math.floor(xvar.play.equipQualSkillMaxBonus*100)/100+"</b> (Maximum equipment quality with the employee qualification maximized to Top1 + bonus)</span>");
				
				xvar.play.top1 = Math.pow(5, 1/2*(-1-xvar.here.emplSkill[0])) * Math.pow(7, 1/2*(-1+xvar.here.emplSkill[0])) * Math.sqrt(xvar.here.emplNum[0] / xvar.play.factor1);
				xcHtml("managerQual", "<br><span style='color: MediumBlue'><b>"+Math.ceil(xvar.play.top1)+"</b> (Top1: Required top manager qualification for handling this subdivision.)</span>");
				xvar.play.top3 = (-15*xvar.play.factor3+Math.sqrt(225*Math.pow(xvar.play.factor3, 2) + 4*xvar.play.factor3*xvar.here.emplAll[0]))/(10*xvar.play.factor3);
				xcHtml("managerQual", "<br><span style='color: MediumBlue'><b>"+Math.ceil(xvar.play.top3)+"</b> (Top3: Required top manager qualification for handling all subdivisions.)</span>");
				
				xvar.play.emplAllMax = 25 * xvar.play.factor3 * xvar.play.managerNormal * (xvar.play.managerNormal + 3);
				xcHtml("emplAll", "<br><span style='color: DarkMagenta'><b>"+Math.floor(xvar.play.emplAllMax).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")+"</b> (Maximum total number of employees with maximized Top1)</span>");
				xvar.play.emplAllMaxBonus = 25 * xvar.play.factor3 * xvar.here.managerQual[0] * (xvar.here.managerQual[0] + 3);
				xcHtml("emplAll", "<br><span style='color: Crimson'><b>"+Math.floor(xvar.play.emplAllMaxBonus).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")+"</b> (Maximum total number of employees  with maximized Top1 + bonus)</span>");
				
				xvar.here.techLevel = xvar.here.techLevel || [1];
				xvar.play.managerTech = Math.pow(xvar.here.techLevel[0], 3)/156.25
				xvar.play.managerEff = Math.min(1, xvar.here.managerQual[0] * xvar.play.emplAllMaxBonus / xvar.here.emplAll[0] / xvar.play.top1, xvar.here.managerQual[0] / xvar.play.top1 * 6/5, xvar.play.emplAllMaxBonus / xvar.here.emplAll[0] * 6/5, xvar.here.managerQual[0] / xvar.play.managerTech * xvar.play.emplAllMaxBonus / xvar.here.emplAll[0], xvar.here.managerQual[0] / xvar.play.managerTech * 6/5);
				xcHtml("managerEff", "<br><span style='color: MediumBlue'><b>"+(Math.round(xvar.play.managerEff*1000)/10).toFixed(2) + "%</b> (Expected top manager efficiency with current settings)</span>");
				
			});
			
			
		}	
		
		xcList();
		
	}
});