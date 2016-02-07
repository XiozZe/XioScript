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
var xcount = {};
var typedone = [];
var xwait = [];

function numberfy(variable){
	return parseFloat(String(variable).replace(/[\s\$\%]/g, "")) || 0;
}

function map(html, url, page){
	var $html = $(html);
	if(page === "sale"){
		mapped[url] = {
			form : $html.find("[name=storageForm]"),
			policy : $html.find("select:even").map(function(){ return $(this).find("[selected]").index(); }).get(),
			price : $html.find("input.money:even").map(function(){ return numberfy($(this).val()); }).get(),
			primecost : $html.find("td:has('table'):nth-last-child(5)  tr:nth-child(3) td:nth-child(2)").map(function(){ return numberfy($(this).text()); }).get()			
		}
	}
	else if(page === "supply"){
		mapped[url] = {
			isProd : !$html.find(".sel").next().attr("class"),
			form : $html.find("[name=supplyContractForm]"),
			parcel: $html.find("input[type=type]").map(function(){ return numberfy($(this).val()); }).get(),
			required : $html.find(".list td:nth-child(2) table tr:nth-child(1) td:nth-child(2)").map(function(){ return numberfy($(this).text()); }).get(),
			stock : $html.find(".list td:nth-child(3) table tr:nth-child(1) td:nth-child(2)").map(function(){ return numberfy($(this).text()); }).get()
		}
	}
	else if(page === "consume"){
		mapped[url] = {
			consump : $html.find(".list td:nth-last-child(1) div:nth-child(1)").map(function(){ return numberfy($(this).text().match(/\d+/)); }).get()
		}
	}
}

function xGet(url, page, callback){
		
	if($.inArray(url, getUrls) === -1){
				
		getUrls.push(url);
		
		$.ajax({
			url: url,				
			type: "GET",

			success: function(html, status, xhr){
				map(html, url, page);
				callback();
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
	else{
		
		xcallback.push([url, function(){
			callback();
		}]);
		
		
	}	
}

function xPost(url, form, callback){
		
	$.ajax({
		url: url,	
		data: form,
		type: "POST",

		success: function(html, status, xhr){
			callback();			
		},

		error: function(){
			//Resend ajax
			setTimeout(function(){
				$.ajax(this);
			}, 3000);
		}
	});
	
}

function xTypeDone(type){	
	
	xcount[type]--;
	if(xcount[type]){
		console.log(xcount[type], "subdivisions with "+type+" functions to do left");
	}
	else{
		console.log(type+" functions completed!");
		typedone.push(type);
		for(var i = 0; i < xwait.length; i++){
			var index = xwait[i][0].indexOf(type);
			if(index >= 0){
				xwait[i][0].splice(index, 1);
				if(xwait[i][0].length === 0){
					xwait[i][1]();
					xwait.splice(i, 1)
					i--;
				}
			}			
		}

	}	
	
	var sum = 0;
	for(var i in xcount)
		sum += xcount[i];
	
	if(sum === 0){
		console.log("All Done!");
		console.log(mapped);
		$("#XM").attr("disabled", false);
	}
	
}

function xDone(url){
	
	if(url){
		finUrls.push(url);
	}
	
	for(var i = 0; i < xcallback.length; i++){
		if(finUrls.indexOf(xcallback[i][0]) >= 0){
			xcallback[i][1]();
			xcallback.splice(i, 1);
			i--;
		}
	}	
	
}

function saleprice1(type, subid, choice){	

	if(choice !== 0){
		xGet("/"+realm+"/main/unit/view/"+subid+"/sale", "sale", function(){
			saleprice2(type, subid, choice);
		});
	}	
	else{
		xTypeDone(type);
	}	
}

function saleprice2(type, subid, choice){	
	var url = "/"+realm+"/main/unit/view/"+subid+"/sale";
	var data = mapped[url];
	var change = false;
	
	for(var i = 0; i < mapped[url].price.length; i++){
		if(choice === 1 && mapped[url].price[i] !== 0){
			change = true;
			mapped[url].price[i] = 0;
			mapped[url].form.find("input.money:even").eq(i).val(0);
			
		}
		if(choice === 2 && Math.abs(mapped[url].price[i] - mapped[url].primecost[i] - 0.005) > 0.007){
			change = true;
			mapped[url].price[i] = mapped[url].primecost[i]? mapped[url].primecost[i]+0.001 : 0;
			mapped[url].form.find("input.money:even").eq(i).val(mapped[url].price[i]);
			
		}
	};

	if(change){
		xPost(url, mapped[url].form.serialize(), function(){
			xTypeDone(type);
		});
	}
	else{
		xTypeDone(type);
	}
}

function salepolicy1(type, subid, choice){
	if(choice !== 0){
		xGet("/"+realm+"/main/unit/view/"+subid+"/sale", "sale", function(){
			salepolicy2(type, subid, choice);
		});
	}
	else{
		xTypeDone(type);
	}
}

function salepolicy2(type, subid, choice){
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
		xPost(url, mapped[url].form.serialize(), function(){
			xTypeDone(type);
		});
	}
	else{
		xTypeDone(type);
	}
}

function supply1(type, subid, choice){
	if(choice !== 0){
		xGet("/"+realm+"/main/unit/view/"+subid+"/supply", "supply", function(){
			supply2(type, subid, choice);
		});
	}
	else{
		xTypeDone(type);
	}
}

function supply2(type, subid, choice){
	if(choice === 1 || mapped["/"+realm+"/main/unit/view/"+subid+"/supply"].isProd){
		supply3(type, subid, choice);
	}
	else{
		xGet("/"+realm+"/main/unit/view/"+subid+"/consume", "consume", function(){
			supply3(type, subid, choice);
		});
	}
}

function supply3(type, subid, choice){
	var url = "/"+realm+"/main/unit/view/"+subid+"/supply";	
	var url2 = "/"+realm+"/main/unit/view/"+subid+"/consume";
	var data = mapped[url];
	var change = false;
	
	if(mapped[url].parcel.length !== mapped[url].required.length){
		choice = 1;
		console.log("Subdivision "+subid+" is missing a supplier!");
	}
	
	for(var i = 0; i < mapped[url].parcel.length; i++){
		if(choice === 1 && mapped[url].parcel[i] !== 0){
			change = true;
			mapped[url].parcel[i] = 0;
			mapped[url].form.find("input[type=type]").eq(i).val(0);			
		}		
		else if(choice === 2 && mapped[url].isProd && mapped[url].parcel[i] !== mapped[url].required[i]){
			change = true;
			mapped[url].parcel[i] = mapped[url].required[i];
			mapped[url].form.find("input[type=type]").eq(i).val(mapped[url].parcel[i]);			
		}
		else if(choice === 2 && !mapped[url].isProd && mapped[url].parcel[i] !== mapped[url2].consump[i]){
			change = true;
			mapped[url].parcel[i] = mapped[url2].consump[i];
			mapped[url].form.find("input[type=type]").eq(i).val(mapped[url].parcel[i]);			
		}
		else if(choice === 3 && mapped[url].isProd && mapped[url].parcel[i] !== Math.min(2 * mapped[url].required[i], Math.max(3 * mapped[url].required[i] - mapped[url].stock[i], 0))){
			change = true;
			mapped[url].parcel[i] = Math.min(2 * mapped[url].required[i], Math.max(3 * mapped[url].required[i] - mapped[url].stock[i], 0));
			mapped[url].form.find("input[type=type]").eq(i).val(mapped[url].parcel[i]);			
		}
		else if(choice === 3 && !mapped[url].isProd && mapped[url].parcel[i] !== Math.min(2 * mapped[url2].consump[i], Math.max(3 * mapped[url2].consump[i] - mapped[url].stock[i], 0))){
			change = true;
			mapped[url].parcel[i] = Math.min(2 * mapped[url2].consump[i], Math.max(3 * mapped[url2].consump[i] - mapped[url].stock[i], 0));
			mapped[url].form.find("input[type=type]").eq(i).val(mapped[url].parcel[i]);			
		}
	};

	if(change){
		mapped[url].form.append(mapped[url].form.find("[name=applyChanges]").clone().wrap("<p></p>").parent().html().replace("submit","hidden"));
		xPost(url, mapped[url].form.serialize(), function(){
			xTypeDone(type);
		});
	}
	else{
		xTypeDone(type);
	}
}

var policyJSON = {
	pc: {
		func: saleprice1, 
		save: ["no changes in price", "zero price", "prime cost"], 
		order: ["no changes in price", "zero price", "prime cost"],
		name: "price",
		wait: []
	},
	pl: {
		func: salepolicy1, 
		save: ["no changes in policy", "not for sale", "any customer", "my company", "my corporation"], 
		order: ["no changes in policy", "not for sale", "any customer", "my company", "my corporation"],
		name: "policy",
		wait: []
	},
	sp: {
		func: supply1, 
		save: ["no changes in supply", "zero supply", "required", "2x stock"], 
		order: ["no changes in supply", "zero supply", "required", "2x stock"],
		name: "supply",
		wait: []
	}
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
			policyChoice = savedPolicyChoices[savedPolicies.indexOf(policies[i])];
		}
		
		var htmlstring = "<select class=XioPolicy id="+policies[i]+">";
		for(var j = 0; j < policyJSON[policies[i]].order.length; j++){
			htmlstring += "<option>"+policyJSON[policies[i]].order[j]+"</option>";
		}		
		$topblock.append(htmlstring + "</select>");
		$("#"+policies[i]+" option").eq(policyChoice).attr("selected", true);
		
	} 
	$(".XioPolicy").change(function(){	
		
		var thisid = $(this).attr("id");
		var thisindex = policyJSON[thisid].save.indexOf($(this).find("option:selected").text());
		
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
	xcount = {};
	mapped = {};
	
	/* while (GM_listValues().length > 0){
		GM_deleteValue(GM_listValues()[0]);
	} */
	
	//general collection
	
	
	
	
	//specific collection and execution
	var savedPolicyStrings = [];
	var subids = GM_listValues();
	var policy;
	for(var i = 0; i < subids.length; i++){		 
		savedPolicyStrings = GM_getValue(subids[i])? GM_getValue(subids[i]).split(";") : [];
		for(var j = 0; j < savedPolicyStrings.length; j++){	
			policy = policyJSON[savedPolicyStrings[j].substring(0, 2)]
			xcount[policy.name] = ++xcount[policy.name] || 1;
			
			if(policy.wait.length === 0){
				policy.func(policy.name, subids[i], parseFloat(savedPolicyStrings[j].substring(2)));
			}
			else{
				xwait.push(
					[						
						policy.wait.slice(), 
						function(i, j, policy, savedPolicyStrings){							
							policy.func(policy.name, subids[i], parseFloat(savedPolicyStrings[j].substring(2)));
						}.bind(this, i, j, policy, savedPolicyStrings)
					]
				);
			}						
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
	
	//Price/Sale page
    else if(new RegExp("\/.*\/main\/unit\/view\/[0-9]+\/sale$").test(document.URL)){
		preference(["pc", "pl"]);
	}
	
	//Supply page
    else if(new RegExp("\/.*\/main\/unit\/view\/[0-9]+\/supply$").test(document.URL)){
		preference(["sp"]);
	}
	
}

document.onreadystatechange = function () {
    if (document.readyState == "complete") {
        XioScript();
    }
}
document.onreadystatechange();