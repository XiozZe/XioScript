// ==UserScript==
// @name           XioScript
// @namespace      Virtonomics
// @description    XioScript using XioMaintenance
// @version        12.0.3
// @require        http://ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js
// @include        http://*virtonomic*.*/*/*
// @exclude        http://virtonomics.wikia.com*
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

var ls = localStorage;
var realm = xpCookie('last_realm');
var getUrls = [];
var finUrls = [];
var xcallback = [];
var mapped = {};
var xcount = {};
var typedone = [];
var xwait = [];
var servercount = 0;
var processingtime = 0;

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
			primecost : $html.find("td:has('table'):nth-last-child(5)  tr:nth-child(3) td:nth-child(2)").map(function(){ return numberfy($(this).text()); }).get(),
			product: $html.find(".grid a:not([onclick])").map(function(){ return $(this).text(); }).get(),
			region: $html.find(".officePlace a:eq(-2)").text()
		}
	}
	else if(page === "prodsupply"){
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
	else if(page === "storesupply"){
		mapped[url] = {
			form : $html.find("[name=supplyContractForm]"),
			parcel : $html.find("input:text[name^='supplyContractData[party_quantity]']").map(function(){ return numberfy($(this).val()); }).get(),
			purchase : $html.find("td.nowrap:nth-child(4)").map(function(){ return numberfy($(this).text()); }).get(),
			quantity : $html.find("td:nth-child(2) table:nth-child(1) tr:nth-child(1) td:nth-child(2)").map(function(){ return numberfy($(this).text()); }).get(),
			sold : $html.find("td:nth-child(2) table:nth-child(1) tr:nth-child(5) td:nth-child(2)").map(function(){ return numberfy($(this).text()); }).get()			
		}
	}
	else if(page === "TM"){
		mapped[url] = {
			product : $html.find(".grid td:odd").map(function(){ return $(this).clone().children().remove().end().text().trim(); }).get(),
			franchise : $html.find(".grid b").map(function(){ return $(this).text(); }).get()
		}
	}
	else if(page === "IP"){
		mapped[url] = {
			product : $html.find(".list td:nth-child(5n-3)").map(function(){ return $(this).text(); }).get(),
			IP : $html.find(".list td:nth-child(5n)").map(function(){ return numberfy($(this).text()); }).get()
		}
	}
	else if(page === "transport"){
		mapped[url] = {
			countryName : $html.find("select:eq(0) option").map(function(){ return $(this).text(); }).get(),
			countryId : $html.find("select:eq(0) option").map(function(){ return numberfy($(this).val().split("/")[1]); }).get(),
			regionName : $html.find("select:eq(1) option").map(function(){ return $(this).text(); }).get(),
			regionId : $html.find("select:eq(1) option").map(function(){ return numberfy($(this).val().split("/")[2]); }).get(),
			cityName : $html.find("select:eq(2) option").map(function(){ return $(this).text(); }).get(),
			cityId : $html.find("select:eq(2) option").map(function(){ return numberfy($(this).val().split("/")[3]); }).get()			
		}
	}
	else if(page === "CTIE"){
		mapped[url] = {
			product : $html.find(".list td:nth-child(3n-1)").map(function(){ return $(this).text(); }).get(),
			profitTax : numberfy($html.find(".region_data td:eq(3)").text()),
			CTIE : $html.find(".list td:nth-child(3n)").map(function(){ return numberfy($(this).text()); }).get()
		}
	}
	else if(page === "main"){
		mapped[url] = {/*
			employees: numberfy($html.find(".unit_box:has(.fa-users) tr:eq(0) td:eq(1)").text()),
			salaryNow: numberfy($html.find(".unit_box:has(.fa-users) tr:eq(2) td:eq(1)").text()),
			salaryCity: numberfy($html.find(".unit_box:has(.fa-users) tr:eq(3) td:eq(1)").text()),
		    skillNow: numberfy($html.find(".unit_box:has(.fa-users) tr:eq(4) td:eq(1)").text()),
			skillReq: numberfy($html.find(".unit_box:has(.fa-users) tr:eq(5) td:eq(1)").text()),
			equipNum: numberfy($html.find(".unit_box:has(.fa-cogs) tr:eq(0) td:eq(1)").text()),
			equipMax: numberfy($html.find(".unit_box:has(.fa-cogs) tr:eq(1) td:eq(1)").text()),
			equipQual: numberfy($html.find(".unit_box:has(.fa-cogs) tr:eq(2) td:eq(1)").text()),
			equipReq: numberfy($html.find(".unit_box:has(.fa-cogs) tr:eq(3) td:eq(1)").text()),
			equipWearBlack: numberfy($html.find(".unit_box:has(.fa-cogs) tr:eq(4) td:eq(1)").text().split("(")[1]),
			equipWearRed: $html.find(".unit_box:has(.fa-cogs) tr:eq(4) td:eq(1) span").length === 1,*/
			qualification: $html.find(".unit_box:has(.fa-user) tr:eq(0) td:eq(1)").text()
		}
	}
	else if(page === "salary"){
		mapped[url] = {
			employees : numberfy($html.find("#quantity").val()),
			form : $html.filter("form"),
			salaryNow : numberfy($html.find("#salary").val()),
			salaryCity : numberfy($html.find("tr:nth-child(3) > td").text().split("$")[1]),
			skillNow : numberfy($html.find("#apprisedEmployeeLevel").text()),
			skillCity : numberfy($html.find("div span[id]:eq(1)").text().match(/[0-9]+(\.[0-9]+)?/)[0]),
			skillReq : numberfy($html.find("div span[id]:eq(1)").text().split(",")[1])	
		}		
	}	
	else if(page === "training"){
		mapped[url] = {
			form : $html.filter("form"),
			salaryNow : numberfy($html.find(".list td:eq(8)").text()),
			salaryCity : numberfy($html.find(".list td:eq(9)").text().split("$")[1]),
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
				servercount++;
				map(html, url, page);
				callback();
				xDone(url);
			},

			error: function(){
				servercount++;
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
			servercount++;
			callback();			
		},

		error: function(){
			servercount++;
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
		console.log("Total server calls made: "+servercount);
		console.log("Total time needed: "+((new Date().getTime()-processingtime)/1000)+" seconds");
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
		
	if(choice !== 1){
		xGet("/"+realm+"/main/globalreport/tm/info", "TM", function(){
			saleprice3(type, subid, choice);
		});
	}	
	else{
		saleprice6(type, subid, choice);
	}
	
}

function saleprice3(type, subid, choice){
		
	if(choice !== 1){
		xGet("/"+realm+"/main/geo/countrydutylist/359837", "IP", function(){
			saleprice4(type, subid, choice);
		});
	}	
	else{
		saleprice6(type, subid, choice);
	}
	
}

function saleprice4(type, subid, choice){
		
	if(choice === 5 || choice === 6){
		xGet("/"+realm+"/main/common/main_page/game_info/transport", "transport", function(){
			saleprice5(type, subid, choice);
		});
	}	
	else{
		saleprice6(type, subid, choice);
	}
	
}

function saleprice5(type, subid, choice){
		
	if(choice === 5){
		xGet("/"+realm+"/main/geo/regionENVD/359838", "CTIE", function(){
			saleprice6(type, subid, choice);
		});
	}	
	else if(choice === 6){
		var url = "/"+realm+"/main/unit/view/"+subid+"/sale";
		var urlTrans = "/"+realm+"/main/common/main_page/game_info/transport";
			
		indexRegion = mapped[urlTrans].regionName.indexOf(mapped[url].region);
		regionId = mapped[urlTrans].regionId[ indexRegion ];	
		
		xGet("/"+realm+"/main/geo/regionENVD/"+regionId, "CTIE", function(){
			saleprice6(type, subid, choice);
		});	
	}
	
}

function saleprice6(type, subid, choice){	
	var url = "/"+realm+"/main/unit/view/"+subid+"/sale";
	var urlIP = "/"+realm+"/main/geo/countrydutylist/359837";
	var urlTM = "/"+realm+"/main/globalreport/tm/info";
	var urlCTIE = "/"+realm+"/main/geo/regionENVD/359838";
	var urlTrans = "/"+realm+"/main/common/main_page/game_info/transport";
	var change = false;
	
	for(var i = 0; i < mapped[url].price.length; i++){
		if(choice === 1 && mapped[url].price[i] !== 0){
			change = true;
			mapped[url].price[i] = 0;
			mapped[url].form.find("input.money:even").eq(i).val(0);
			
		}
		else if(choice === 2){
			indexFranchise = mapped[urlTM].franchise.indexOf( mapped[url].product[i] );
			product = mapped[urlTM].product[indexFranchise] || mapped[url].product[i];
			indexIP = mapped[urlIP].product.indexOf(product);
			IP = mapped[urlIP].IP[indexIP];
			price = mapped[url].primecost[i]? (mapped[url].primecost[i]+0.001 < 30 * IP? mapped[url].primecost[i] + 0.001 : mapped[url].primecost[i]) : 0;
						
			if(mapped[url].price[i] !== price){
				change = true;
				mapped[url].price[i] = price
				mapped[url].form.find("input.money:even").eq(i).val(price);
			}			
		}
		else if(choice === 3){			
			indexFranchise = mapped[urlTM].franchise.indexOf( mapped[url].product[i] );
			product = mapped[urlTM].product[indexFranchise] || mapped[url].product[i];
			indexIP = mapped[urlIP].product.indexOf(product);
			IP = mapped[urlIP].IP[indexIP];
			
			if(mapped[url].price[i] !== IP){
				change = true;
				mapped[url].price[i] = IP;
				mapped[url].form.find("input.money:even").eq(i).val(IP);
			}		
		}
		else if(choice === 4){
			indexFranchise = mapped[urlTM].franchise.indexOf( mapped[url].product[i] );
			product = mapped[urlTM].product[indexFranchise] || mapped[url].product[i];
			indexIP = mapped[urlIP].product.indexOf(product);
			IP = mapped[urlIP].IP[indexIP];
			
			if(mapped[url].price[i] !== 30*IP){
				change = true;
				mapped[url].price[i] = 30*IP;
				mapped[url].form.find("input.money:even").eq(i).val(30*IP);
			}
		}
		else if(choice === 5){
			indexFranchise = mapped[urlTM].franchise.indexOf( mapped[url].product[i] );
			product = mapped[urlTM].product[indexFranchise] || mapped[url].product[i];
			indexIP = mapped[urlIP].product.indexOf(product);
			IP = mapped[urlIP].IP[indexIP];
			
			indexCTIE = mapped[urlCTIE].product.indexOf(product);
			CTIE = mapped[urlCTIE].CTIE[indexCTIE];
			priceCTIE = mapped[url].primecost[i] * (1 + CTIE/100);
			price = Math.min( Math.round(priceCTIE*100)/100, 30 * IP);
			
			if(mapped[url].price[i] !== price){
				change = true;
				mapped[url].price[i] = price;
				mapped[url].form.find("input.money:even").eq(i).val(price);
			}
		}
		else if(choice === 6){
			indexRegion = mapped[urlTrans].regionName.indexOf(mapped[url].region);
			regionId = mapped[urlTrans].regionId[indexRegion];
			urlCTIE = "/"+realm+"/main/geo/regionENVD/"+regionId;
			
			indexFranchise = mapped[urlTM].franchise.indexOf( mapped[url].product[i] );
			product = mapped[urlTM].product[indexFranchise] || mapped[url].product[i];
			indexIP = mapped[urlIP].product.indexOf(product);
			IP = mapped[urlIP].IP[indexIP];
			
			indexCTIE = mapped[urlCTIE].product.indexOf(product);
			CTIE = mapped[urlCTIE].CTIE[indexCTIE];
			priceCTIE = mapped[url].primecost[i] * (1 + CTIE/100 * mapped["/"+realm+"/main/geo/regionENVD/"+regionId].profitTax/100);
			price = Math.min( Math.round(priceCTIE*100)/100, 30 * IP);
			
			if(mapped[url].price[i] !== price){
				change = true;
				mapped[url].price[i] = price;
				mapped[url].form.find("input.money:even").eq(i).val(price);
			}
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

function prodsupply1(type, subid, choice){
	if(choice !== 0){
		xGet("/"+realm+"/main/unit/view/"+subid+"/supply", "prodsupply", function(){
			prodsupply2(type, subid, choice);
		});
	}
	else{
		xTypeDone(type);
	}
}

function prodsupply2(type, subid, choice){
	if(choice === 1 || mapped["/"+realm+"/main/unit/view/"+subid+"/supply"].isProd){
		prodsupply3(type, subid, choice);
	}
	else{
		xGet("/"+realm+"/main/unit/view/"+subid+"/consume", "consume", function(){
			prodsupply3(type, subid, choice);
		});
	}
}

function prodsupply3(type, subid, choice){
	var url = "/"+realm+"/main/unit/view/"+subid+"/supply";	
	var url2 = "/"+realm+"/main/unit/view/"+subid+"/consume";
	var change = false;
	
	if(mapped[url].parcel.length !== mapped[url].required.length){
		choice = 1;
		console.log("Subdivision "+subid+" is missing a supplier, or has too many suppliers!");
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

function storesupply1(type, subid, choice){
	if(choice !== 0){
		xGet("/"+realm+"/main/unit/view/"+subid+"/supply", "storesupply", function(){
			storesupply2(type, subid, choice);
		});
	}
	else{
		xTypeDone(type);
	}
}

function storesupply2(type, subid, choice){
	var url = "/"+realm+"/main/unit/view/"+subid+"/supply";	
	var change = false;
	
	for(var i = 0; i < mapped[url].parcel.length; i++){
		if(choice === 1 && mapped[url].parcel[i] !== 0){
			change = true;
			mapped[url].parcel[i] = 0;
			mapped[url].form.find("input:text[name^='supplyContractData[party_quantity]']").eq(i).val(0);			
		}		
		else if(choice === 2 && mapped[url].parcel[i] !== mapped[url].sold[i]){
			change = true;
			mapped[url].parcel[i] = mapped[url].sold[i];
			mapped[url].form.find("input:text[name^='supplyContractData[party_quantity]']").eq(i).val(mapped[url].parcel[i]);			
		}
		else if(choice === 3 && mapped[url].parcel[i] !== mapped[url].sold[i] + mapped[url].sold[i] * mapped[url].quantity[i] === mapped[url].purchase[i] * 0.2){
			change = true;
			mapped[url].parcel[i] = mapped[url].sold[i] + mapped[url].sold[i] * mapped[url].quantity[i] === mapped[url].purchase[i] * 0.2;
			mapped[url].form.find("input:text[name^='supplyContractData[party_quantity]']").eq(i).val(mapped[url].parcel[i]);			
		}
		else if(choice === 4 && mapped[url].parcel[i] !== Math.min(2 * mapped[url].sold[i], Math.max(3 * mapped[url].sold[i] - mapped[url].quantity[i], 0))){
			change = true;
			mapped[url].parcel[i] = Math.min(2 * mapped[url].sold[i], Math.max(3 * mapped[url].sold[i] - mapped[url].quantity[i], 0));
			mapped[url].form.find("input:text[name^='supplyContractData[party_quantity]']").eq(i).val(mapped[url].parcel[i]);			
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

function calcSalary(sn, sc, kn, kc, kr){
	// s = salary, k = skill, n = now, c = city, r = required
	var calc = sn > sc? kn - kc * Math.log( 1 + sn / sc ) / Math.log(2)	: Math.pow( sc / sn , 2) * kn - kc;
	return kr > ( calc + kc )? sc * (Math.pow(2, ( kr - calc ) / kc ) - 1) : sc * Math.sqrt( kr / ( kc + calc ) );
}

function salary1(type, subid, choice){
	if(choice !== 0){
		xGet("/"+realm+"/window/unit/employees/engage/"+subid, "salary", function(){
			salary2(type, subid, choice);
		});
	}
	else{
		xTypeDone(type);
	}
}

function salary2(type, subid, choice){
	var url = "/"+realm+"/window/unit/employees/engage/"+subid;	
	var change = false;	
	
	if(choice === 1 && mapped[url].skillNow !== mapped[url].skillReq){
		change = true;
		mapped[url].salaryNow = calcSalary(mapped[url].salaryNow, mapped[url].salaryCity, mapped[url].skillNow, mapped[url].skillCity, mapped[url].skillReq);
		mapped[url].salaryNow = Math.max(mapped[url].salaryNow, (mapped[url].salaryCity+.005) * 0.8);
		mapped[url].salaryNow = Math.min(mapped[url].salaryNow, (mapped[url].salaryCity-.005) * 500);
		mapped[url].skillNow = mapped[url].skillReq; //not always the case
		mapped[url].form.find("#salary").val(mapped[url].salaryNow);			
	}		

	if(change){
		xPost(url, mapped[url].form.serialize(), function(){
			xTypeDone(type);
		});
	}
	else{
		xTypeDone(type);
	}
}

function training1(type, subid, choice){
	if(choice !== 0){
		xGet("/"+realm+"/window/unit/employees/education/"+subid, "training", function(){
			training2(type, subid, choice);
		});
	}
	else{
		xTypeDone(type);
	}
}

function training2(type, subid, choice){
	var url = "/"+realm+"/window/unit/employees/education/"+subid;	
	var change = false;	
	
	if(choice === 1 && mapped[url].form.length){
		change = true;
		mapped[url].form.find("#unitEmployeesData_timeCount").val(4);			
	}		
	else if(choice === 2 && mapped[url].form.length && mapped[url].salaryNow > mapped[url].salaryCity){
		change = true;
		mapped[url].form.find("#unitEmployeesData_timeCount").val(4);			
	}	

	if(change){
		xPost(url, mapped[url].form.serialize(), function(){
			xTypeDone(type);
		});
	}
	else{
		xTypeDone(type);
	}
}

function equipment1(type, subid, choice){
	if(choice !== 0){
		xGet("/"+realm+"/main/unit/view/"+subid, "main", function(){
			//salary2(type, subid, choice);
			console.log(mapped);
		});
	}
	else{
		xTypeDone(type);
	}
}


var policyJSON = {
	pc: {
		func: saleprice1, 
		save: ["don't change price", "zero price", "prime cost", "1x IP", "30x IP", "CTIE", "Profit Tax"], 
		order: ["don't change price", "zero price", "prime cost", "CTIE", "Profit Tax", "1x IP", "30x IP", ],
		name: "price",
		wait: []
	},
	pl: {
		func: salepolicy1, 
		save: ["don't change policy", "not for sale", "any customer", "my company", "my corporation"], 
		order: ["don't change policy", "not for sale", "any customer", "my company", "my corporation"],
		name: "policy",
		wait: []
	},
	sp: {
		func: prodsupply1, 
		save: ["don't change supply", "zero supply", "required", "3x stock"], 
		order: ["don't change supply", "zero supply", "required", "3x stock"],
		name: "supply",
		wait: []
	},
	ss: {
		func: storesupply1, 
		save: ["don't change supply", "zero supply", "sold", "sold++", "3x stock"], 
		order: ["don't change supply", "zero supply", "sold", "sold++", "3x stock"],
		name: "supply",
		wait: []
	},
	es: {
		func: salary1, 
		save: ["don't change salary", "required salary"], 
		order: ["don't change salary", "required salary"],
		name: "salary",
		wait: []
	},
	et: {
		func: training1, 
		save: ["don't train", "always train", "train city salary"], 
		order: ["don't train", "always train", "train city salary"],
		name: "training",
		wait: ["salary"]
	},
	qp: {
		func: equipment1, 
		save: ["don't change equipment"], 
		order: ["don't change equipment"],
		name: "equip",
		wait: []
	}
};

function preference(policies){
	//manage preference options
	
	var subid = parseFloat(document.URL.match(/(view\/?)\d+/)[0].split("/")[1]);	
			
	var savedPolicyStrings = ls["x"+subid]? ls["x"+subid].split(";") : [];
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
			policyChoice = policyJSON[policies[i]].order.indexOf(policyJSON[policies[i]].save[policyChoice]);
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
		
		savedPolicyStrings = ls["x"+subid]? ls["x"+subid].split(";") : [];	
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
		
		ls["x"+subid] = newPolicyString.substring(1);
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
	servercount = 0;
	processingtime = new Date().getTime();
		
	var subids = [];
	for(var key in ls){
		if(/x\d+/.test(key)){
			subids.push(key.match(/\d+/)[0]);
		}
	}
	
	var savedPolicyStrings = [];
	var policy;
	for(var i = 0; i < subids.length; i++){		 
		savedPolicyStrings = ls["x"+subids[i]]? ls["x"+subids[i]].split(";") : [];
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
	
	//Production and Warehouse Price/Sale page
    else if(new RegExp("\/.*\/main\/unit\/view\/[0-9]+\/sale$").test(document.URL)){
		preference(["pc", "pl"]);
	}
	
	//Production and Service Supply page
    else if(new RegExp("\/.*\/main\/unit\/view\/[0-9]+\/supply$").test(document.URL) && $(".add_contract").length === 0 && $("[name=productCategory]").length === 0){
		preference(["sp"]);
	}
	
	//Store Supply page
    else if(new RegExp("\/.*\/main\/unit\/view\/[0-9]+\/supply$").test(document.URL) && $(".add_contract").length === 0){
		preference(["ss"]);
	}
	
	//Main unit page: Salary and Equipment
    else if(new RegExp("\/.*\/main\/unit\/view\/[0-9]+$").test(document.URL) && ($(".fa-users").length === 1 && $(".fa-cogs").length === 1 || $("[href*='/window/unit/employees/engage/']").length === 1 && $("[href*='/window/unit/equipment/']").length === 1)){
		preference(["es", "et", "qp"]);
	}
	
	//Main unit page: Salary only
    else if(new RegExp("\/.*\/main\/unit\/view\/[0-9]+$").test(document.URL) && ($(".fa-users").length === 1 || $("[href*='/window/unit/employees/engage/']").length === 1)){
		preference(["es", "et"]);
	}
	
}

document.onreadystatechange = function () {
    if (document.readyState == "complete") {
        XioScript();
    }
}
document.onreadystatechange();