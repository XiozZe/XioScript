// ==UserScript==
// @name           XioScript
// @namespace      Virtonomics
// @description    XioScript using XioMaintenance
// @version        12.0.4
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
		mapped[url] = {
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
			equipWearRed: $html.find(".unit_box:has(.fa-cogs) tr:eq(4) td:eq(1) span").length === 1,
			manager: $html.find(".unit_box:has(.fa-user) tr:eq(0) td:eq(1)").text(),
			qual: numberfy($html.find(".unit_box:has(.fa-user) tr:eq(1) td:eq(1)").text()),
			maxEmployees: numberfy($html.find(".unit_box:has(.fa-user) tr:eq(2) td:eq(1)").text()),
			img: $html.find("#unitImage img").attr("src").split("/")[4].split("_")[0]
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
	else if(page === "equipment"){
		mapped[url] = {
			qualNow : numberfy($html.find("#top_right_quality").text()),
			qualReq : numberfy($html.find(".recommended_quality span:not([id])").text()),
			equipNum : numberfy($html.find("#quantity_corner").text()),
			equipMax : numberfy($html.find(".contract:eq(1)").text().split("(")[1].match(/\d+/)[0]),
			equipPerc : numberfy($html.find("#wear").text()),
			price : $html.find(".digits:contains($):odd:odd").map(function(){ return numberfy($(this).text()); }).get(),
			qualOffer : $html.find(".digits:not(:contains($)):odd").map(function(){ return numberfy($(this).text()); }).get(),
			available : $html.find(".digits:not(:contains($)):even").map(function(){ return numberfy($(this).text()); }).get(),
			offer : $html.find(".choose span").map(function(){ return numberfy($(this).attr("id")); }).get()
		}		
	}
	else if(page === "manager"){
		mapped[url] = {
			base : $html.find("input:text[readonly]").map(function(){ return numberfy($(this).val()); }).get(),
			bonus : $html.find(".grid:eq(1) td:nth-child(5)").map(function(){ return numberfy($(this).text()); }).get(),
			name : $html.find("[id^=title]").map(function(){ return $(this).text().trim(); }).get()
		}
	}
	else if(page === "tech"){
		mapped[url] = {
			price : $html.find("tr td.nowrap:nth-child(2)").map(function(){ return $(this).text().trim(); }).get(),
			tech : $html.find("tr:has([src='/img/v.gif'])").index()
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

function xContract(url, data, callback){
		
	$.ajax({
		url: url,	
		data: data,
		type: "POST",
		dataType: "JSON",

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
		console.log(xcount[type]+" subdivisions with "+type+" functions to do left");
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

function salePrice(type, subid, choice){	
	var url = "/"+realm+"/main/unit/view/"+subid+"/sale";
	var urlIP = "/"+realm+"/main/geo/countrydutylist/359837";
	var urlTM = "/"+realm+"/main/globalreport/tm/info";
	var urlCTIE = "/"+realm+"/main/geo/regionENVD/359838";
	var urlTrans = "/"+realm+"/main/common/main_page/game_info/transport";

	var getcount = 0;
	if(choice >= 1){
		getcount++;
		xGet(url, "sale", function(){
			!--getcount && phase();
		});
	}
	
	if(choice >= 2){
		getcount = getcount + 2;
		xGet(urlTM, "TM", function(){
			!--getcount && phase();
		});
		xGet(urlIP, "IP", function(){
			!--getcount && phase();
		});
	}
	
	if(choice >= 5){
		getcount++;
		xGet(urlTrans, "transport", function(){
			!--getcount && phase();
		});
	}
	
	function phase(){
		if(choice === 5){
			getcount++;
			xGet(urlCTIE, "CTIE", function(){
				!--getcount && post();
			});
		}
		else if(choice === 6){
			getcount++;				
			indexRegion = mapped[urlTrans].regionName.indexOf(mapped[url].region);
			regionId = mapped[urlTrans].regionId[ indexRegion ];	
			urlCTIE = "/"+realm+"/main/geo/regionENVD/"+regionId;
			
			xGet(urlCTIE, "CTIE", function(){
				!--getcount && post();
			});	
		}
		else{
			post();
		}
		
	}
	
	function post(){
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
				price = mapped[url].primecost[i]+0.01 < 30 * IP? mapped[url].primecost[i] + 0.01 : mapped[url].primecost[i];
							
				if(mapped[url].price[i] !== price && mapped[url].primecost[i]){
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
				
				if(mapped[url].price[i] !== price && mapped[url].primecost[i]){
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
				
				if(mapped[url].price[i] !== price && mapped[url].primecost[i]){
					change = true;
					mapped[url].price[i] = price;
					mapped[url].form.find("input.money:even").eq(i).val(price);
				}
			}
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
}

function salePolicy(type, subid, choice){
	var url = "/"+realm+"/main/unit/view/"+subid+"/sale";
		
	xGet(url, "sale", function(){
		post();
	});
	
	function post(){
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
	
	
}

function prodSupply(type, subid, choice){
	var url = "/"+realm+"/main/unit/view/"+subid+"/supply";
	var url2 = "/"+realm+"/main/unit/view/"+subid+"/consume";
	
	
	xGet(url, "prodsupply", function(){
		phase();
	});	
	
	function phase(){
		if(choice >= 2 && !mapped[url].isProd){
			xGet(url2, "consume", function(){
				post();
			});
		}
		else{
			post();
		}
	}
	
	function post(){
		
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
	
}

function storeSupply(type, subid, choice){
	var url = "/"+realm+"/main/unit/view/"+subid+"/supply";	
		
	xGet(url, "storesupply", function(){
		post();
	});	
	
	function post(){
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
}

function salary(type, subid, choice){
	var url = "/"+realm+"/window/unit/employees/engage/"+subid;
	var urlMain = "/"+realm+"/main/unit/view/"+subid;
	var urlManager = "/"+realm+"/main/user/privat/persondata/knowledge";
	var getcount = 0;
	
	if(choice >= 1){
		getcount++;
		xGet(url, "salary", function(){
			!--getcount && post();
		});
	}
	
	if(choice >= 2){
		getcount += 2;
		xGet(urlMain, "main", function(){
			!--getcount && post();
		});
		xGet(urlManager, "manager", function(){
			!--getcount && post();
		});
		
	}
	
	function post(){
		var change = false;	
		
		if(mapped[url].salaryNow === 0){
			change = true;
			mapped[url].form.find("#salary").val(mapped[url].salaryCity);
		}			
		else if(choice === 1 && mapped[url].skillNow !== mapped[url].skillReq){
			change = true;
			mapped[url].salaryNow = calcSalary(mapped[url].salaryNow, mapped[url].salaryCity, mapped[url].skillNow, mapped[url].skillCity, mapped[url].skillReq);
			mapped[url].salaryNow = Math.max(mapped[url].salaryNow, (mapped[url].salaryCity+.005) * 0.8);
			mapped[url].salaryNow = Math.min(mapped[url].salaryNow, (mapped[url].salaryCity-.005) * 500);
			mapped[url].skillNow = mapped[url].skillReq; //not always the case
			mapped[url].form.find("#salary").val(mapped[url].salaryNow);			
		}
		else if(choice === 2){
			var skillReq = calcSkill(mapped[url].employees, subType[mapped[urlMain].img][0], mapped[urlManager].base[subType[mapped[urlMain].img][2]]);
						
			if(mapped[url].skillNow !== skillReq){
				change = true;
				mapped[url].salaryNow = calcSalary(mapped[url].salaryNow, mapped[url].salaryCity, mapped[url].skillNow, mapped[url].skillCity, skillReq);
				mapped[url].salaryNow = Math.max(mapped[url].salaryNow, (mapped[url].salaryCity+.005) * 0.8);
				mapped[url].salaryNow = Math.min(mapped[url].salaryNow, (mapped[url].salaryCity-.005) * 500);
				mapped[url].skillNow = skillReq; //not always the case
				mapped[url].form.find("#salary").val(mapped[url].salaryNow);
			}
			
		}
		else if(choice === 3){
			var skillReq = calcSkill(mapped[url].employees, subType[mapped[urlMain].img][0], mapped[urlManager].base[subType[mapped[urlMain].img][2]] + mapped[urlManager].bonus[subType[mapped[urlMain].img][2]]);
						
			if(mapped[url].skillNow !== skillReq){
				change = true;
				mapped[url].salaryNow = calcSalary(mapped[url].salaryNow, mapped[url].salaryCity, mapped[url].skillNow, mapped[url].skillCity, skillReq);
				mapped[url].salaryNow = Math.max(mapped[url].salaryNow, (mapped[url].salaryCity+.005) * 0.8);
				mapped[url].salaryNow = Math.min(mapped[url].salaryNow, (mapped[url].salaryCity-.005) * 500);
				mapped[url].skillNow = skillReq; //not always the case
				mapped[url].form.find("#salary").val(mapped[url].salaryNow);
			}
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
}

function training(type, subid, choice){
	var url = "/"+realm+"/window/unit/employees/education/"+subid;
		
	xGet(url, "training", function(){
		post();
	});	
	
	function post(){
		
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
}

var subType = {
	mine: [8, 8, 8],
	power: [6, 6, 9],
	workshop: [4, 4, 10],
	farm: [1.6, 1.6, 1],
	orchard: [1.2, 1.2, 1],				
	medicine: [1, 1, 7],
	fishingbase: [1, 1, 3],				
	animalfarm: [0.6, 0.6, 5],
	lab: [0.4, 0.4, 12],
	mill: [0.4, 4, 10],
	restaurant: [0.4, 0.4, 11],
	shop: [0.4, 0.4, 2],
	repair: [0.2, 0.2, 4],
	fuel: [0.2, 0.2, 4],
	service: [0.12, 0.12, 13],
	office: [0.08, 0.08, 0]
}

function equipment(type, subid, choice){
	var url = "/"+realm+"/window/unit/equipment/"+subid;	
	var urlMain = "/"+realm+"/main/unit/view/"+subid;
	var urlSalary = "/"+realm+"/window/unit/employees/engage/"+subid;
	var urlManager = "/"+realm+"/main/user/privat/persondata/knowledge";
	
	var getcount = 0;
	var equipcount = 0;
	
	getcount++;
	xGet(urlMain, "main", function(){
		!--getcount && phase();
	});	
	
	if(choice === 2){
		getcount += 2;
		xGet(urlSalary, "salary", function(){
			!--getcount && phase();
		});
		xGet(urlManager, "manager", function(){
			!--getcount && phase();
		});
	}
	
	function phase(){
		getcount += 2;
		xGet("/"+realm+"/window/common/util/setpaging/db"+mapped[urlMain].img+"/equipmentSupplierListByUnit/40000", "none", function(){
			!--getcount && phase2();
		});
		var data = "total_price%5Bfrom%5D=&total_price%5Bto%5D=&quality%5Bfrom%5D=&quality%5Bto%5D=&quantity%5Bisset%5D=1&quantity%5Bfrom%5D=1&total_price%5Bfrom%5D=0&total_price%5Bto%5D=0&total_price_isset=0&quality%5Bfrom%5D=0&quality%5Bto%5D=0&quality_isset=0&quantity_isset=1";
		xPost("/"+realm+"/window/common/util/setfiltering/db"+mapped[urlMain].img+"/equipmentSupplierListByUnit", data, function(){
			!--getcount && phase2();
		});
	}
	
	function phase2(){
		
		xGet(url, "equipment", function(){
			post();
		});
	}
	
	function equipContract(op, amount, offer, callback){
		// op = repair, buy or terminate
		equipcount++;
		if(op === "repair" || op === "buy"){
			xContract("/"+realm+"/ajax/unit/supply/equipment", {
			'operation'       : op,
			'offer'  		  : offer,
			'unit'  		  : subid,
			'supplier'		  : offer,
			'amount'		  : amount							
			}, function(){
				if(callback){
					callback;
				}
				else{
					!--equipcount && xTypeDone(type);						
				}	
			});
		}
		else{
			xContract("/"+realm+"/ajax/unit/supply/equipment", {
				'operation'       : "terminate",
				'unit'  		  : subid,
				'amount'		  : amount					
			}, function(){
				equipcount--;
				if(callback){
					callback();
				}
				else{
					!equipcount && xTypeDone(type);
				}
			});
		}
		
	}
	
	function post(){
		var change = false;		
		
		var equipWear = Math.floor(mapped[url].equipNum * mapped[url].equipPerc / 100);
		if(choice === 1 && (mapped[url].qualNow < mapped[url].qualReq || equipWear !== 0)){
						
			while(mapped[url].qualNow < mapped[url].qualReq){
							
				var PQR = 0;
				var minPQR = Infinity;
				var minId = -1;
				
				for(var i = 0; i < mapped[url].offer.length; i++){
					PQR = mapped[url].price[i] / (mapped[url].qualOffer[i] - mapped[url].qualReq + 0.001);
					if(PQR < minPQR && PQR > 0 && mapped[url].available[i]){
						minPQR = PQR;
						minId = i;
					}
				}
				
				if(minId === -1){
					console.log("No equipment on the market with a sufficient quality. Could not repair subdivision "+subid);
					xTypeDone(type);
					return false;
				}
				
				var tobuy = Math.ceil(mapped[url].equipNum * (mapped[url].qualReq - mapped[url].qualNow) / (mapped[url].qualOffer[minId] - mapped[url].qualNow));
				tobuy = Math.min(tobuy, mapped[url].available[minId]);
				mapped[url].available[minId] -= tobuy;
				
				mapped[url].qualNow = (mapped[url].qualOffer[minId] * tobuy + mapped[url].qualNow * (mapped[url].equipNum - tobuy)) / mapped[url].equipNum;					
				equipContract("terminate", tobuy, mapped[url].offer[minId], function(){
					equipContract("buy", tobuy, mapped[url].offer[minId]);
				});	
				
			}
			
			while(equipWear > 0){
				
				var minPrice = Infinity;
				var minId = -1;
				var botPrice = Infinity;
				var botId = -1;
				
				for(var i = 0; i < mapped[url].offer.length; i++){
					if(mapped[url].price[i] < minPrice && mapped[url].qualOffer[i] >= mapped[url].qualReq && mapped[url].available[i]){
						minPrice = mapped[url].price[i];
						minId = i;
					}
					if(mapped[url].price[i] < botPrice && mapped[url].available[i]){
						botPrice = mapped[url].price[i];
						botId = i;
					}
				}
				
				if(minId === -1){
					console.log("No equipment on the market with sufficient quality. Could not repair subdivision "+subid);
					xTypeDone(type);
					return false;
				}
				
				var newQual = 0;
				var minBuy = 0;
				var botBuy = 0;
				while(mapped[url].available[minId] && mapped[url].available[botId] && equipWear > 0){
					newQual = ((mapped[url].equipNum - 1 - minBuy - botBuy) * mapped[url].qualNow + (botBuy + 1) * mapped[url].qualOffer[botId] + minBuy * mapped[url].qualOffer[minId]) / mapped[url].equipNum;
					if(newQual > mapped[url].qualReq && botId >= 0 && botPrice < minPrice){
						botBuy++;
						mapped[url].available[botId]--;
					}
					else{
						minBuy++;
						mapped[url].available[minId]--;
					}			
					equipWear--;
				}
				
				mapped[url].qualNow = newQual;				
				if(botBuy){
					equipContract("repair", botBuy, mapped[url].offer[botId]);
				}				
				if(minBuy){
					equipContract("repair", minBuy, mapped[url].offer[minId]);
				}			
			}
		}
		else if(choice === 2 && equipWear !== 0){
			
			var s = subType[mapped[urlMain].img];
			var equipMax = calcEquip(calcSkill(mapped[urlSalary].employees, s[0], mapped[urlManager].base[s[2]] + mapped[urlManager].bonus[s[2]]));
						
			while(equipWear > 0){
				
				var minPrice = Infinity;
				var minId = -1;
				var botPrice = Infinity;
				var botId = -1;
				
				for(var i = 0; i < mapped[url].offer.length; i++){
					if(mapped[url].price[i] < minPrice && mapped[url].qualOffer[i] >= mapped[url].qualNow && mapped[url].available[i]){
						minPrice = mapped[url].price[i];
						minId = i;
					}
					if(mapped[url].price[i] < botPrice && mapped[url].qualOffer[i] <= equipMax && mapped[url].available[i]){
						botPrice = mapped[url].price[i];
						botId = i;
					}
				}
				
				if(minId === -1 || botId === -1){
					console.log("No equipment on the market with sufficient quality. Could not repair subdivision "+subid);
					xTypeDone(type);
					return false;
				}
								
				var newQual = 0;
				var minBuy = 0;
				var botBuy = 0;
				while(mapped[url].available[minId] && mapped[url].available[botId] && equipWear > 0){
					newQual = ((mapped[url].equipNum - 1 - minBuy - botBuy) * mapped[url].qualNow + botBuy * mapped[url].qualOffer[botId] + (minBuy + 1) * mapped[url].qualOffer[minId]) / mapped[url].equipNum;
					if(newQual < equipMax){
						minBuy++;
						mapped[url].available[minId]--;
					}
					else{
						botBuy++;
						mapped[url].available[botId]--;
						
					}			
					equipWear--;
				}
				
				mapped[url].qualNow = newQual;
				if(botBuy){
					equipContract("repair", botBuy, mapped[url].offer[botId]);
				}				
				if(minBuy){
					equipContract("repair", minBuy, mapped[url].offer[minId]);
				}							
			}
			mapped[urlSalary].skillNow = calcEquip(mapped[url].qualNow);
		}		
		else{
			xTypeDone(type);
		}
	}
}

function technology(type, subid, choice){
	var url = "/"+realm+"/main/unit/view/"+subid+"/technology";
		
	xGet(url, "tech", function(){
		post();
	});
	
	function post(){
		var change = false;
			
		if(choice === 1){
			
			for(var i = mapped[url].price.length - 1; i >= 0; i--){
				console.log(i, mapped[url].price[i]);
				if(mapped[url].price[i] === "$0.00") break;
			}
			
			if((i+1) !== mapped[url].tech){
				change = true;	
				mapped[url].tech = i+1;
			}
			
		}		

		if(change){
			xPost(url, "level="+mapped[url].tech+"&impelentit=Buy+a+technology", function(){
				xTypeDone(type);
			});
		}
		else{
			xTypeDone(type);			
		}
	}
	
	
}

var policyJSON = {
	pc: {
		func: salePrice, 
		save: ["don't change price", "zero price", "prime cost", "1x IP", "30x IP", "CTIE", "Profit Tax"], 
		order: ["don't change price", "zero price", "prime cost", "CTIE", "Profit Tax", "1x IP", "30x IP", ],
		name: "price",
		wait: []
	},
	pl: {
		func: salePolicy, 
		save: ["don't change policy", "not for sale", "any customer", "my company", "my corporation"], 
		order: ["don't change policy", "not for sale", "any customer", "my company", "my corporation"],
		name: "policy",
		wait: []
	},
	sp: {
		func: prodSupply, 
		save: ["don't change supply", "zero supply", "required", "3x stock"], 
		order: ["don't change supply", "zero supply", "required", "3x stock"],
		name: "supply",
		wait: []
	},
	ss: {
		func: storeSupply, 
		save: ["don't change supply", "zero supply", "sold", "sold++", "3x stock"], 
		order: ["don't change supply", "zero supply", "sold", "sold++", "3x stock"],
		name: "supply",
		wait: []
	},
	es: {
		func: salary, 
		save: ["don't change salary", "required salary", "target salary", "maximum salary"], 
		order: ["don't change salary", "required salary", "target salary", "maximum salary"],
		name: "salary",
		wait: ["equip"]
	},
	et: {
		func: training, 
		save: ["don't train", "always train", "train city salary"], 
		order: ["don't train", "always train", "train city salary"],
		name: "training",
		wait: ["salary"]
	},
	qp: {
		func: equipment, 
		save: ["don't change equipment", "required equipment", "maximal equipment"], 
		order: ["don't change equipment", "required equipment", "maximal equipment"],
		name: "equip",
		wait: ["tech"]
	},
	tc: {
		func: technology,
		save: ["don't change technology", "introduce researched"],
		order: ["don't change technology", "introduce researched"],
		name: "tech",
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
	
	var startedPolicies = [];
	var savedPolicyStrings = [];
	var policy, choice;
	for(var i = 0; i < subids.length; i++){		 
		savedPolicyStrings = ls["x"+subids[i]]? ls["x"+subids[i]].split(";") : [];
		for(var j = 0; j < savedPolicyStrings.length; j++){	
			policy = policyJSON[savedPolicyStrings[j].substring(0, 2)]
			choice = parseFloat(savedPolicyStrings[j].substring(2));
			if(!choice){
				continue;
			}
			
			if(startedPolicies.indexOf(policy.name) === -1){
				startedPolicies.push(policy.name);
			}
			
			xcount[policy.name] = ++xcount[policy.name] || 1;
			
			if(policy.wait.length === 0){
				policy.func(policy.name, subids[i], choice);
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
	
	var type;
	for(var key in policyJSON){
		type = policyJSON[key].name;
		if(startedPolicies.indexOf(type) === -1){
			xcount[type] = 1;
			xTypeDone(type);
		}
	}
	
}

function calcSalary(sn, sc, kn, kc, kr){
	// s = salary, k = skill, n = now, c = city, r = required
	var calc = sn > sc? kn - kc * Math.log( 1 + sn / sc ) / Math.log(2)	: Math.pow( sc / sn , 2) * kn - kc;	
	return kr > ( calc + kc )? sc * (Math.pow(2, ( kr - calc ) / kc ) - 1) : sc * Math.sqrt( kr / ( kc + calc ) );
}

function calcEmployees(skill, factor, manager){
	return Math.floor(Math.pow(5,1+skill) * Math.pow(7, 1-skill) * factor * Math.pow(manager, 2)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");	
}

function calcSkill(employees, factor, manager){
	return Math.floor(-Math.log(employees/(35*factor*Math.pow(manager, 2)))/Math.log(7/5)*100)/100;
}

function calcReqSkill(equip){
	return Math.ceil(Math.pow(skill, 2/3)*100)/100;
}

function calcEquip(skill){
	return Math.floor(Math.pow(skill, 1.5)*100)/100;
}

function calcTechLevel(manager){
	return Math.floor(Math.pow(manager*156.25, 1/3));
}

function calcAllEmployees(factor, manager){
	return Math.floor(25 * factor * manager * (manager + 3)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function topManagerStats(hasEquip){
	var url = "/"+realm+"/main/user/privat/persondata/knowledge";
	var here = "here";
	
	$.ajax({
		url: url,				
		type: "GET",

		success: function(html, status, xhr){
						
			map(html, url, "manager");
			map(document, here, "main");
									
			var factor1 = subType[mapped[here].img][0];
			var factor3 = subType[mapped[here].img][1];			
			
			managerIndex = mapped[url].name.indexOf(mapped[here].manager)
			managerBase = mapped[url].base[managerIndex];
			managerTotal = mapped[here].qual;
				
			$(".unit_box:has(.fa-users) tr:not(:has([colspan])):eq(4)").after( ""
				+"<tr style='color: indigo'><td>Target qualification based on the number of employees</td><td>"+calcSkill(mapped[here].employees, factor1, managerBase)+"</td></tr>"
				+"<tr style='color: crimson'><td>Maximum qualfication based on the number of employees</td><td>"+calcSkill(mapped[here].employees, factor1, managerTotal)+"</td></tr>"
			);
			
			$(".unit_box:has(.fa-users) tr:not(:has([colspan])):eq(1)").after( ""
				+"<tr style='color: indigo'><td>Target number based on the qualification of employees</td><td>"+calcEmployees(mapped[here].skillNow, factor1, managerBase)+"</td></tr>"
				+"<tr style='color: crimson'><td>Maximum number based on the qualification of employees</td><td>"+calcEmployees(mapped[here].skillNow, factor1, managerTotal)+"</td></tr>"
			);
			
			$(".unit_box:has(.fa-user) tr:not(:has([colspan])):eq(2)").after( ""
				+"<tr style='color: indigo'><td>Target number of employees on profile qualification</td><td>"+calcAllEmployees(factor3, managerBase)+"</td></tr>"
				+"<tr style='color: crimson'><td>Maximum number of employees on profile qualification</td><td>"+calcAllEmployees(factor3, managerTotal)+"</td></tr>"
			);
						
			if(!hasEquip) return false;
			
			$(".unit_box:has(.fa-cogs) tr:not(:has([colspan])):eq(2)").after( ""
				+"<tr style='color: darkgreen'><td>Required according to the current qualification of employees</td><td>"+calcEquip(mapped[here].skillNow)+"</td></tr>"
				+"<tr style='color: indigo'><td>Required according to the target qualification of employees</td><td>"+calcEquip(calcSkill(mapped[here].employees, factor1, managerBase))+"</td></tr>"
				+"<tr style='color: crimson'><td>Required according to the maximum qualification of employees</td><td>"+calcEquip(calcSkill(mapped[here].employees, factor1, managerTotal))+"</td></tr>"
			);
			
			$(".unit_box:has(.fa-industry) tr:not(:has([colspan])):eq(2)").after( ""
				+"<tr style='color: indigo'><td>Target technology level</td><td>"+calcTechLevel(managerBase)+"</td></tr>"
				+"<tr style='color: crimson'><td>Maximum technology level</td><td>"+calcTechLevel(managerTotal)+"</td></tr>"
			);
			
		}		
	});
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
		topManagerStats(true);
	}
	
	//Main unit page: Salary only
    else if(new RegExp("\/.*\/main\/unit\/view\/[0-9]+$").test(document.URL) && ($(".fa-users").length === 1 || $("[href*='/window/unit/employees/engage/']").length === 1)){
		preference(["es", "et"]);
		topManagerStats(false);
	}
	
	//Technology page
    else if(new RegExp("\/.*\/main\/unit\/view\/[0-9]+\/technology$").test(document.URL)){
		preference(["tc"]);
	}
	
}

document.onreadystatechange = function () {
    if (document.readyState == "complete") {
        XioScript();
    }
}
document.onreadystatechange();