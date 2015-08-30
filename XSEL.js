XSEL.push({
	name: "Choose Buttons",
	description: "Disables all XioFunction buttons. Clicking will toggle the button just like the XioExtensions do. When untoggled, the button will hide when the &quot;Hide buttons&quot; XioExtension is on. Reload to see the changes.",
	regex: "\/.*\/main\/company\/view\/[0-9]+\/unit_list$",
	code: function(){
		
		localStorage.XSCL = localStorage.XSCL || "{}";		
		
		var $buttons = $("input.xfButton");
		for(var i = 0; i < $buttons.length; i++){
			if(JSON.parse(localStorage.XSCL)[$buttons.eq(i).val()]){
				$buttons.eq(i).addClass("xfGrey");
			}
		}
				
		$buttons
			.off("click")
			.click(function(){
				$(this).toggleClass("xfGrey");
				var data = JSON.parse(localStorage.XSCL);
				data[$(this).val()] = !data[$(this).val()];
				localStorage.XSCL = JSON.stringify(data);
			});
		
		
		
	}
});
XSEL.push({
	name: "Hide Buttons",
	description: "Hides all buttons untoggled by the &quot;Choose buttons&quot; XioExtension.",
	regex: "\/.*\/main\/company\/view\/[0-9]+\/unit_list$",
	code: function(){
		
		localStorage.XSCL = localStorage.XSCL || "{}";
		
		var $buttons = $("input.xfButton");
		for(var i = 0; i < $buttons.length; i++){
			if(JSON.parse(localStorage.XSCL)[$buttons.eq(i).val()]){
				if($buttons.eq(i).parent().find("input").length === 1){
					$buttons.eq(i).parent().parent().remove();
				}
				else{
					$buttons.eq(i).remove();
				}
			}
		}
		
	}
});
XSEL.push({
	name: "Show Map",
	description: "Shows the map with variables saved in the XSML: powerful for creating XioFunctions/XioExtensions. Has no uses for non-developers.",
	regex: "\/.*\/.*",
	code: function(){

		for(var key in XSML){

			//First, the document url has to match the regExp
			if(new RegExp(XSML[key].regExp).test(document.URL)){

				var allElements = true;

				//Then, all elements have to be available on the page
				for(var j in XSML[key]){

					//regExp is never an item
					if(j === "regExp"){
						continue;
					}
					
					//mainList escape
					var escape = {
						yelName: true,
						yelType: true,
						yelId: true
					}

					if(!$(document).find(XSML[key][j].path).length && !escape[j] ){
						allElements = false;
						break;
					}					
				}	

				if(allElements){
					break;
				}
			}
		}	
		
		//Don't show table if the page is not mapped
		if(key === "notMapped"){  
			return false;
		}
		
		//Disable building
		if(key.indexOf("build") >= 0){  
			return false;
		}

		console.log(key);		

        $(document).tooltip();			
        				
        var arrayLength = 0;		
        
		var typeJSON = {
			item : true,
			input : true,
			submit : false,
			form: false
		};				
		
		function htmlMap(){
			
			$("[title]").not(".xfButton").removeAttr("title");
			
			var html = "<table id=mapTable><tr><th></th>";

			//Show items and inputs tooltips
			//Build table basics for overview				
			for(var j in XSML[key]){

				//regExp is never an item
				if(j === "regExp"){
					continue;
				}

				var path = XSML[key][j].path;
				var curTitle = $(path).attr("title")? $(path).attr("title") + " & ":"";	
				
				var classes = {
					item: "mapGTooltip ",
					input: "mapGTooltip mapPTooltip ",
					submit: "mapPTooltip "
				};
				
				//Highlight and tooltip
				if( XSML[key][j].type === "item" || XSML[key][j].type === "input" || XSML[key][j].type === "submit"){			
					$(path).not("[id^=xf]")
						.attr("title", curTitle + j)
						.addClass(classes[XSML[key][j].type]);
				}
				
				//Save value for overview
				if(typeJSON[XSML[key][j].type]){				
					html += "<th>"+j+"</th>";
					arrayLength = Math.max(arrayLength, $(path).length);				
				}
				
			}			
			
			html += "</tr>";
			
			for(var i = 0; i < arrayLength; i++){
				
				html += "<tr>";
				html += "<td>["+i+"]</td>";
				
				for(var j in XSML[key]){
					
					if(j !== "regExp" && typeJSON[XSML[key][j].type]){
						
						if($(XSML[key][j].path).length > i){
							html += "<td>"+XSML[key][j].mod( $(XSML[key][j].path).eq(i) )+"</td>";
						}
						else{
							html += "<td></td>";
						}
						
					}			
					
				}
				
				html += "</tr>";
				
			}
			
			html += "</table>";
			
			$("#topblock, #headerWithSeparator").append(html); 
			
		}
		
		htmlMap();
		
		$("body").click(function(){
			$("#mapTable").remove();
			htmlMap();
		});
		
		   	
		
	}
});
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
		
	}
});
XSEL.push({
	name: "Brand Link",
	description: "In the trade hall of a store, it attaches a link to the brand value which leads to the advertising in the office of that specific product, if that product is found.",
	regex: "\/.*\/main\/unit\/view\/[0-9]+\/trading_hall$",
	code: function(){
		
		xcHere();
		
		if(xvar.here.brandStore){
			xlist.push(function(){
				xcGet("officeGet", xvar.realm+"/main/unit/view/"+xvar.here.officeId+"/virtasement");
			});
			xlist.push(function(){				
				xvar.play.productUrl = [];
				for(var i = 0; i < xvar.officeGet[0].productUrl.length; i++){
					xvar.play.productUrl.push(parseFloat(xvar.officeGet[0].productUrl[i].match(/[0-9]+/)));
				}			
				for(var i = 0; i < xvar.here.itemId.length; i++){
					var productIndex = xvar.play.productUrl.indexOf(xvar.here.itemId[i]);
					if(productIndex !== -1){
						var $brandStore = xc$("brandStore").eq(i);
						var html = $brandStore.html();
						var url = xvar.realm+"/main/unit/view/"+xvar.here.officeId+"/virtasement"+xvar.officeGet[0].productUrl[productIndex];
						$brandStore.html("<a href='"+url+"'>"+html+"</a>");
					}
				}				
			});
			xcList();
		}
		else{
			console.log("No goods in the trade hall!");
		}
		
	}
});
XSEL.push({
	name: "Build Shortener",
	description: "Makes building easier and shorter. Loads the new parts of the page directly onto the old, without the need of redirecting. Removes all cancel and back buttons, as these are hard to deal with scripting-wise.",
	regex: "\/.*\/main\/unit\/create\/[0-9]+",
	code: function(){
		
		$( document ).ajaxSuccess(function( event, xhr, settings ) {
			var newUrl = $(xhr.responseText).find("#mainContent form").attr("action")
			
			if(new RegExp("\/.*\/main\/unit\/create\/[0-9]+").test(newUrl)){
				
				$("#mainContent").html($(xhr.responseText).find("#mainContent").html());
			
				var $form = $("form:eq(1)");
				$(":submit:not([name=next])").remove();
			
				$form.submit(function(event){
					event.preventDefault();
					$.post(newUrl, $form.serialize());
				});				
				
			}	
			else{
				window.location.replace(newUrl);
			}
			
		});
		
        var $form = $("form:eq(1)");
		$(":submit:not([name=next])").remove();
		
		$form.submit(function(event){
			event.preventDefault();
			$.post(document.URL, $form.serialize());
		});		
	}
});
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
		
	}
});
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
				xc$("techLevel").append("<br><span style='color: Crimson'><b>"+Math.floor(xvar.play.techMax)+"</b> (Maximum technology level with this top manager qualification)</span>"); 
				
				xvar.play.emplNumMax = Math.pow(5,1+xvar.here.emplSkill[0]) * Math.pow(7, 1-xvar.here.emplSkill[0]) * xvar.play.factor1 * Math.pow(xvar.play.managerNormal, 2);
				xvar.play.emplNumMaxBonus = Math.pow(5,1+xvar.here.emplSkill[0]) * Math.pow(7, 1-xvar.here.emplSkill[0]) * xvar.play.factor1 * Math.pow(xvar.here.managerQual, 2);
				xc$("emplNum").append("<br><span style='color: DarkMagenta'><b>"+Math.floor(xvar.play.emplNumMax).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")+"</b> (Maximum number of employees with maximized Top1)</span><br><span style='color: Crimson'><b>"+Math.floor(xvar.play.emplNumMaxBonus).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")+"</b> (Maximum number of employees with maximized Top1 + bonus)</span>");
				
				xvar.play.emplSkillMax = -Math.log(xvar.here.emplNum[0]/(35*xvar.play.factor1*Math.pow(xvar.play.managerNormal, 2)))/Math.log(7/5);
				xvar.play.emplSkillMaxBonus = -Math.log(xvar.here.emplNum[0]/(35*xvar.play.factor1*Math.pow(xvar.here.managerQual[0], 2)))/Math.log(7/5);
				xc$("emplSkill").append("<br><span style='color: DarkMagenta'><b>"+Math.floor(xvar.play.emplSkillMax *100)/100+"</b> (Maximum employee qualification with maximized Top1)</span><br><span style='color: Crimson'><b>"+Math.floor(xvar.play.emplSkillMaxBonus*100)/100+"</b> (Maximum employee qualification with maximized Top1 + bonus)</span>");			
				
				xvar.play.equipQualMax = Math.pow(xvar.here.emplSkill[0], 1.5);		
				xvar.play.equipQualSkillMax = Math.pow(xvar.play.emplSkillMax, 1.5);
				xvar.play.equipQualSkillMaxBonus = Math.pow(xvar.play.emplSkillMaxBonus, 1.5);		
				xc$("equipQual").append("<br><span style='color: MediumBlue'><b>"+Math.round(xvar.play.equipQualMax*100)/100+"</b> (Maximum equipment quality with this employee qualification)</span><br><span style='color: DarkMagenta'><b>"+Math.round(xvar.play.equipQualSkillMax*100)/100+"</b> (Maximum equipment quality with the employee qualification maximized to Top1)</span><br><span style='color: Crimson'><b>"+Math.round(xvar.play.equipQualSkillMaxBonus*100)/100+"</b> (Maximum equipment quality with the employee qualification maximized to Top1 + bonus)</span>");
				
				xvar.play.top1 = Math.pow(5, 1/2*(-1-xvar.here.emplSkill[0])) * Math.pow(7, 1/2*(-1+xvar.here.emplSkill[0])) * Math.sqrt(xvar.here.emplNum[0] / xvar.play.factor1);
				xvar.play.top3 = (-15*xvar.play.factor3+Math.sqrt(225*Math.pow(xvar.play.factor3, 2) + 4*xvar.play.factor3*xvar.here.emplAll[0]))/(10*xvar.play.factor3);
				xc$("managerQual").append("<br><span style='color: MediumBlue'><b>"+Math.ceil(xvar.play.top1)+"</b> (Top1: Required top manager qualification for handling this subdivision.)</span><br><span style='color: MediumBlue'><b>"+Math.ceil(xvar.play.top3)+"</b> (Top3: Required top manager qualification for handling all subdivisions.)</span>");
				
				xvar.play.emplAllMax = 25 * xvar.play.factor3 * xvar.play.managerNormal * (xvar.play.managerNormal + 3);
				xvar.play.emplAllMaxBonus = 25 * xvar.play.factor3 * xvar.here.managerQual[0] * (xvar.here.managerQual[0] + 3);
				xc$("emplAll").append("<br><span style='color: DarkMagenta'><b>"+Math.floor(xvar.play.emplAllMax).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")+"</b> (Maximum total number of employees with maximized Top1)</span><br><span style='color: Crimson'><b>"+Math.floor(xvar.play.emplAllMaxBonus).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")+"</b> (Maximum total number of employees  with maximized Top1 + bonus)</span>");
				
				xvar.here.techLevel = xvar.here.techLevel || [1];
				xvar.play.managerTech = Math.pow(xvar.here.techLevel[0], 3)/156.25
				xvar.play.managerEff = Math.min(1, xvar.here.managerQual[0] * xvar.play.emplAllMaxBonus / xvar.here.emplAll[0] / xvar.play.top1, xvar.here.managerQual[0] / xvar.play.top1 * 6/5, xvar.play.emplAllMaxBonus / xvar.here.emplAll[0] * 6/5, xvar.here.managerQual[0] / xvar.play.managerTech * xvar.play.emplAllMaxBonus / xvar.here.emplAll[0], xvar.here.managerQual[0] / xvar.play.managerTech * 6/5);
				xc$("managerEff").append("<br><span style='color: MediumBlue'><b>"+(Math.round(xvar.play.managerEff*1000)/10).toFixed(2) + "%</b> (Expected top manager efficiency with current settings)</span>");
				
			});
			
			
		}	
		
		xcList();
		
	}
});