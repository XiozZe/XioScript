// ==UserScript==
// @name           XioScript
// @namespace      Virtonomics
// @description    XioScript using XioMaintenance
// @version        12.0.0
// @require        http://ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js
// @include        http://*virtonomic*.*/*/*
// @exclude        http://virtonomics.wikia.com*
// @grant          GM_getValue
// @grant          GM_setValue
// @grant          GM_listValues
// @grant          GM_deleteValue
// ==/UserScript==

this.$ = this.jQuery = jQuery.noConflict(true);

function xpCookie(name){
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i = 0; i < ca.length; i++){
		var c = ca[i];
		while (c.charAt(0) == ' ') c = c.substring(1, c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
	}
	return null;
}
var realm = xpCookie('last_realm');

var getUrls = [];
var finUrls = [];
var xcallback = [];
var mapped = {};

function numberfy(variable){
	return parseFloat(String(variable).replace(/[\s\$\%]/g, "")) || 0;
}

function map(html, url, type){
	if(type === "sale"){
		mapped[url] = {
			form : $(html).find("[name=storageForm]"),
			policy : $(html).find("select:even").map(function(){ return $(this).find("[selected]").index(); }).get(),
			price : $(html).find("input.money:even").map(function(){ return numberfy($(this).val()); }).get(),
			primecost : $(html).find("td:has('table'):nth-last-child(5)  tr:nth-child(3) td:nth-child(2)").map(function(){ return numberfy($(this).text()); }).get()			
		}
	}
}

function xGet(url, type, callback, subid, choice){
	
	
		
	xcallback.push([url, function(){
		callback(subid, choice);
	}]);
		
	if($.inArray(url, getUrls) === -1){
		
		xcount++;
		
		getUrls.push(url);
		
		$.ajax({
			url: url,				
			type: "GET",

			success: function(html, status, xhr){
				map(html, url, type);
				xDone(url);
			},

			error: function(){
				//Resend ajax
				setTimeout(function(){
					$.ajax(this);
				}, 3000);
			}			
		});		
	}	
	
}

function xPost(url, form){
	
	xcount++;
	
	$.ajax({
		url: url,	
		data: form,
		type: "POST",

		success: function(html, status, xhr){
			xDone();
		},

		error: function(){
			//Resend ajax
			setTimeout(function(){
				$.ajax(this);
			}, 3000);
		}
	});
	
}

function xDone(url){
	
	if(url){
		finUrls.push(url);
		for(var i = 0; i < xcallback.length; i++){
			if(xcallback[i][0] === url){
				xcallback[i][1]();
			}
		}
	}
	
	xcount--;
	console.log(xcount, "server calls left");
	
	if(xcount === 0){
		console.log("All Done!");
		console.log(mapped);
		$("#XM").attr("disabled", false)
	}
	
	
}

function saleprice1(subid, choice){	
	if(choice !== 0){
		xGet("/"+realm+"/main/unit/view/"+subid+"/sale", "sale", saleprice2, subid, choice);
	}		
}

function saleprice2(subid, choice){	
	var url = "/"+realm+"/main/unit/view/"+subid+"/sale";
	var data = mapped[url];
	var change = false;
	
	for(var i = 0; i < mapped[url].price.length; i++){
		if(Math.abs(mapped[url].price[i] - mapped[url].primecost[i] - 0.005) > 0.007){
			change = true;
			mapped[url].price[i] = mapped[url].primecost[i]? mapped[url].primecost[i]+0.001 : 0;
			mapped[url].form.find("input.money:even").eq(i).val(mapped[url].price[i]);
			
		}
	};

	if(change){
		xPost(url, mapped[url].form.serialize());
	}
	
}

function salepolicy1(subid, choice){
	if(choice !== 0){
		xGet("/"+realm+"/main/unit/view/"+subid+"/sale", "sale", salepolicy2, subid, choice);		
	}
}

function salepolicy2(subid, choice){
	var url = "/"+realm+"/main/unit/view/"+subid+"/sale";
	var data = mapped[url];
	var change = false;
	
	for(var i = 0; i < mapped[url].price.length; i++){
		if(choice === 1 && mapped[url].policy[i] !== 0){
			change = true;
			mapped[url].policy[i] = 0;
			mapped[url].form.find("select:even").eq(i).find("option").eq(0).attr("selected", true);			
		}
		else if(choice === 2 && mapped[url].policy[i] !== 1){
			change = true;
			mapped[url].policy[i] = 1;
			mapped[url].form.find("select:even").eq(i).find("option").eq(1).attr("selected", true);			
		}
		else if(choice === 3 && mapped[url].policy[i] !== 3){
			change = true;
			mapped[url].policy[i] = 3;
			mapped[url].form.find("select:even").eq(i).find("option").eq(3).attr("selected", true);			
		}
		else if(choice === 4 && mapped[url].policy[i] !== 5){
			change = true;
			mapped[url].policy[i] = 5;
			mapped[url].form.find("select:even").eq(i).find("option").eq(4).attr("selected", true);			
		}
	};

	if(change){
		xPost(url, mapped[url].form.serialize());
	}
}

var policyJSON = {
	pc: [saleprice1, ["no changes in price", "set price equal to the prime cost"]],
	pl: [salepolicy1, ["no changes in policy", "set always to not for sale", "set always to any customer", "set always to my company", "set always to my corporation"]]
};

function preference(policies){
	//manage preference options
	
	var subid = parseFloat(document.URL.match(/(view\/?)\d+/)[0].split("/")[1]);	
			
	var savedPolicyStrings = GM_getValue(subid)? GM_getValue(subid).split(";") : [];
	var savedPolicies = [];
	var savedPolicyChoices = [];
	var $topblock = $("#topblock");
	for(var i = 0; i < savedPolicyStrings.length; i++){		
		savedPolicies[i] = savedPolicyStrings[i].substring(0, 2);
		savedPolicyChoices[i] = parseFloat(savedPolicyStrings[i].substring(2));		
	}	
	
	for(var i = 0; i < policies.length; i++){
		var policyChoice = 0;
		if(savedPolicies.indexOf(policies[i]) >= 0){
			policyChoice = savedPolicyChoices[i];
		}
		
		var htmlstring = "<select class=XioPolicy id="+policies[i]+">";
		for(var j = 0; j < policyJSON[policies[i]][1].length; j++){
			htmlstring += "<option>"+policyJSON[policies[i]][1][j]+"</option>";
		}		
		$topblock.append(htmlstring + "</select>");
		$("#"+policies[i]+" option").eq(policyChoice).attr("selected", true);
		
	} 
	
	$(".XioPolicy").change(function(){
		
		var thisid = $(this).attr("id");
		var thisindex = $(this).find("option:selected").index();
				
		savedPolicyStrings = GM_getValue(subid)? GM_getValue(subid).split(";") : [];	
		savedPolicies = [];
		savedPolicyChoices = [];
		for(var i = 0; i < savedPolicyStrings.length; i++){		
			savedPolicies[i] = savedPolicyStrings[i].substring(0, 2);
			savedPolicyChoices[i] = parseFloat(savedPolicyStrings[i].substring(2));		
		}
		
		if(savedPolicies.indexOf(thisid) >= 0){
			savedPolicyChoices[savedPolicies.indexOf(thisid)] = thisindex;
		}
		else{
			savedPolicies.push(thisid);
			savedPolicyChoices.push(thisindex);
		}
		
		newPolicyString = "";
		for(var i = 0; i < savedPolicies.length; i++){
			newPolicyString += ";"+savedPolicies[i] + savedPolicyChoices[i];
		};
		
		GM_setValue(subid, newPolicyString.substring(1));
		
	});
	
}

function XioMaintenance(){
	
	console.log("XM!");
	
	$("#XM").attr("disabled", true)
	
	getUrls = [];
	finUrls = [];
	xcallback = [];
	xcount = 0;
	mapped = {};
	
	/* while (GM_listValues().length > 0){
		GM_deleteValue(GM_listValues()[0]);
	} */
	
	//general collection
	
	
	
	
	//specific collection and execution
	var savedPolicyStrings = [];
	var subids = GM_listValues();
	for(var i = 0; i < subids.length; i++){
		 
		savedPolicyStrings = GM_getValue(subids[i])? GM_getValue(subids[i]).split(";") : [];
		for(var j = 0; j < savedPolicyStrings.length; j++){		
			policyJSON[savedPolicyStrings[j].substring(0, 2)][0](subids[i], parseFloat(savedPolicyStrings[j].substring(2)));
		}	
	}
	
}

function XioScript(){
	//determines which functions to run;
	
	console.log("XioScript 12 is running!");	
	
	//Unit list
    if(new RegExp("\/.*\/main\/company\/view\/[0-9]+\/unit_list$").test(document.URL)){
        $("#topblock").append("<input type=button id=XM value=XioMaintenance>");
		$("#XM").click(function(){
			XioMaintenance();
		});
    }
	
	//Production Price/Sale page
    else if(new RegExp("\/.*\/main\/unit\/view\/[0-9]+\/sale$").test(document.URL)){
		preference(["pc", "pl"]);
	}
	
}

document.onreadystatechange = function () {
    if (document.readyState == "complete") {
        XioScript();
    }
}
document.onreadystatechange();