// ==UserScript==
// @name           XioScript
// @namespace      https://github.com/XiozZe/XioScript
// @description    XioScript using XioMaintenance
// @version        12.0.11
// @require        http://ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js
// @include        http://*virtonomic*.*/*/*
// @exclude        http://virtonomics.wikia.com*
// ==/UserScript==

var version = "12.0.11";

this.$ = this.jQuery = jQuery.noConflict(true);

function xpCookie(name){
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i = 0; i < ca.length; i++){
		var c = ca[i];
		while (c.charAt(0) == ' ') c = c.substring(1, c.length);
		if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
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
var xmax = {};
var typedone = [];
var xwait = [];
var xsupplier = [];
var xequip = [];
var firesupplier = false;
var fireequip = false;
var servergetcount = 0;
var serverpostcount = 0;
var suppliercount = 0;
var processingtime = 0;
var timeinterval;

function numberfy(variable){
	return parseFloat(String(variable).replace(/[\s\$\%]/g, "")) || 0;
}

function map(html, url, page){
	var $html = $(html);
	if(page === "unitlist"){
		mapped[url] = {
			subids : $html.find(".unit-list-2014 td:nth-child(1)").map(function(){ return numberfy($(this).text()); }).get()
		};
	}
	else if(page === "sale"){ 
		mapped[url] = {
			form : $html.find("[name=storageForm]"),
			policy : $html.find("select:even").map(function(){ return $(this).find("[selected]").index(); }).get(),
			price : $html.find("input.money:even").map(function(){ return numberfy($(this).val()); }).get(),
			primecost : $html.find("td:has('table'):nth-last-child(5)  tr:nth-child(3) td:nth-child(2)").map(function(){ return numberfy($(this).text()); }).get(),
			product: $html.find(".grid a:not([onclick])").map(function(){ return $(this).text(); }).get(),
			region: $html.find(".officePlace a:eq(-2)").text()
		};
	}
	else if(page === "prodsupply"){
		mapped[url] = { 
			isProd : !$html.find(".sel").next().attr("class"),
			form : $html.find("[name=supplyContractForm]"),
			parcel: $html.find("input[type=type]").map(function(){ return numberfy($(this).val()); }).get(),
			required : $html.find(".inner_table").length? $html.find(".list td:nth-child(3).inner_table tr:nth-child(1) td:nth-child(2)").map(function(){ return numberfy($(this).text()); }).get() : $html.find(".list td:nth-child(2) table tr:nth-child(1) td:nth-child(2)").map(function(){ return numberfy($(this).text()); }).get(),
			stock : $html.find(".inner_table").length? $html.find(".list td:nth-child(4).inner_table tr:nth-child(1) td:nth-child(2)").map(function(){ return numberfy($(this).text()); }).get() : $html.find(".list td:nth-child(3) table tr:nth-child(1) td:nth-child(2)").map(function(){ return numberfy($(this).text()); }).get(),
			offer : $html.find(".destroy").map(function(){ return numberfy($(this).val()); }).get(),
			reprice : $html.find(".inner_table").length? $html.find("td:nth-child(5) tr:nth-child(2)").map(function(){ return !!$(this).filter("[class]").length; }).get() : $html.find("[id^=totalPrice] tr:nth-child(1)").map(function(){ return !!$(this).filter("[style]").length; }).get(),
		};
	}
	else if(page === "consume"){
		mapped[url] = {
			consump : $html.find(".list td:nth-last-child(1) div:nth-child(1)").map(function(){ return numberfy($(this).text().match(/\d+/)); }).get()
		};
	}
	else if(page === "storesupply"){
		mapped[url] = {
			form : $html.find("[name=supplyContractForm]"),
			parcel : $html.find("input:text[name^='supplyContractData[party_quantity]']").map(function(){ return numberfy($(this).val()); }).get(),
			purchase : $html.find("td.nowrap:nth-child(4)").map(function(){ return numberfy($(this).text()); }).get(),
			quantity : $html.find("td:nth-child(2) table:nth-child(1) tr:nth-child(1) td:nth-child(2)").map(function(){ return numberfy($(this).text()); }).get(),
			sold : $html.find("td:nth-child(2) table:nth-child(1) tr:nth-child(5) td:nth-child(2)").map(function(){ return numberfy($(this).text()); }).get(),
			offer : $html.find(".destroy").map(function(){ return numberfy($(this).val()); }).get(),
			reprice : $html.find("td:nth-child(9) table:nth-child(1) tr:nth-child(1) td:nth-child(2)").map(function(){ return !!$(this).find("div").length; }).get(),
		};
	}
	else if(page === "TM"){
		mapped[url] = {
			product : $html.find(".grid td:odd").map(function(){ return $(this).clone().children().remove().end().text().trim(); }).get(),
			franchise : $html.find(".grid b").map(function(){ return $(this).text(); }).get()
		};
	}
	else if(page === "IP"){
		mapped[url] = {
			product : $html.find(".list td:nth-child(5n-3)").map(function(){ return $(this).text(); }).get(),
			IP : $html.find(".list td:nth-child(5n)").map(function(){ return numberfy($(this).text()); }).get()
		};
	}
	else if(page === "transport"){
		mapped[url] = {
			countryName : $html.find("select:eq(0) option").map(function(){ return $(this).text(); }).get(),
			countryId : $html.find("select:eq(0) option").map(function(){ return numberfy($(this).val().split("/")[1]); }).get(),
			regionName : $html.find("select:eq(1) option").map(function(){ return $(this).text(); }).get(),
			regionId : $html.find("select:eq(1) option").map(function(){ return numberfy($(this).val().split("/")[2]); }).get(),
			cityName : $html.find("select:eq(2) option").map(function(){ return $(this).text(); }).get(),
			cityId : $html.find("select:eq(2) option").map(function(){ return numberfy($(this).val().split("/")[3]); }).get()			
		};
	}
	else if(page === "CTIE"){
		mapped[url] = {
			product : $html.find(".list td:nth-child(3n-1)").map(function(){ return $(this).text(); }).get(),
			profitTax : numberfy($html.find(".region_data td:eq(3)").text()),
			CTIE : $html.find(".list td:nth-child(3n)").map(function(){ return numberfy($(this).text()); }).get()
		};
	}
	else if(page === "main"){
		mapped[url] = {
			employees : numberfy($html.find(".unit_box:has(.fa-users) tr:eq(0) td:eq(1)").text()),
			salaryNow : numberfy($html.find(".unit_box:has(.fa-users) tr:eq(2) td:eq(1)").text()),
			salaryCity : numberfy($html.find(".unit_box:has(.fa-users) tr:eq(3) td:eq(1)").text()),
		    skillNow : numberfy($html.find(".unit_box:has(.fa-users) tr:eq(4) td:eq(1)").text()),
			skillReq : numberfy($html.find(".unit_box:has(.fa-users) tr:eq(5) td:eq(1)").text()),
			equipNum : numberfy($html.find(".unit_box:has(.fa-cogs) tr:eq(0) td:eq(1)").text()),
			equipMax : numberfy($html.find(".unit_box:has(.fa-cogs) tr:eq(1) td:eq(1)").text()),
			equipQual : numberfy($html.find(".unit_box:has(.fa-cogs) tr:eq(2) td:eq(1)").text()),
			equipReq : numberfy($html.find(".unit_box:has(.fa-cogs) tr:eq(3) td:eq(1)").text()),
			equipWearBlack : numberfy($html.find(".unit_box:has(.fa-cogs) tr:eq(4) td:eq(1)").text().split("(")[1]),
			equipWearRed : $html.find(".unit_box:has(.fa-cogs) tr:eq(4) td:eq(1) span").length === 1,
			manager : $html.find(".unit_box:has(.fa-user) tr:eq(0) td:eq(1)").text(),
			qual : numberfy($html.find(".unit_box:has(.fa-user) tr:eq(1) td:eq(1)").text()),
			maxEmployees : numberfy($html.find(".unit_box:has(.fa-user) tr:eq(2) td:eq(1)").text()),
			img : $html.find("#unitImage img").attr("src").split("/")[4].split("_")[0],
			hasService : !$html.find("[src='/img/artefact/icons/color/production.gif']").length
		};
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
		};	
	}	
	else if(page === "training"){
		mapped[url] = {
			form : $html.filter("form"),
			salaryNow : numberfy($html.find(".list td:eq(8)").text()),
			salaryCity : numberfy($html.find(".list td:eq(9)").text().split("$")[1]),
		};	
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
		};		
	}
	else if(page === "manager"){
		mapped[url] = {
			base : $html.find("input:text[readonly]").map(function(){ return numberfy($(this).val()); }).get(),
			bonus : $html.find(".grid:eq(1) td:nth-child(5)").map(function(){ return numberfy($(this).text()); }).get(),
			name : $html.find("[id^=title]").map(function(){ return $(this).text().trim(); }).get()
		};
	}
	else if(page === "tech"){
		mapped[url] = {
			price : $html.find("tr td.nowrap:nth-child(2)").map(function(){ return $(this).text().trim(); }).get(),
			tech : $html.find("tr:has([src='/img/v.gif'])").index(),
			img: $html.find("#unitImage img").attr("src").split("/")[4].split("_")[0]
		};
	}	
	else if(page === "products"){
		mapped[url] = {
			name : $html.find(".list td:nth-child(2n):has(a)").map(function(){ return $(this).text(); }).get(),
			id : $html.find(".list td:nth-child(2n) a:nth-child(1)").map(function(){ return numberfy($(this).attr("href").match(/\d+/)[0]); }).get()
		};
	}
	else if(page === "waresupply"){
		mapped[url] = {			
			form : $html.find("[name=supplyContractForm]"),
			contract : $html.find(".p_title").map(function(){ return $(this).find("a:eq(1)").attr("href"); }).get(),
			parcel : $html.find("input:text[name^='supplyContractData[party_quantity]']").map(function(){ return numberfy($(this).val()); }).get(),
			product : $html.find("tr:has(input:text[name])").map(function(){ return $(this).prevAll(".p_title:first").find("strong:eq(0)").text(); }).get(),
			price : $html.find("tr:has(input) td:nth-child(4)").map(function(){ return numberfy($(this).text().match(/(\d|\.|\s)+$/)); }).get(),
			reprice : $html.find("tr:has(input) td:nth-child(4)").map(function(){ return !!$(this).find("span").length; }).get(),
			quality : $html.find("tr:has(input) td:nth-child(6)").map(function(){ return numberfy($(this).text()); }).get(),
			offer : $html.find("tr input:checkbox").map(function(){ return numberfy($(this).val()); }).get(),
			type : $html.find(".p_title").map(function(){ return $(this).find("strong:eq(0)").text(); }).get(),
			stock : $html.find(".p_title table").map(function(){ return $(this).find("strong").length >= 2? numberfy($(this).find("strong:eq(0)").text()) : 0; }).get(),			
			shipments : $html.find(".p_title table").map(function(){ return $(this).find("strong").length === 1? numberfy($(this).find("strong:eq(0)").text()) : numberfy($(this).find("strong:eq(2)").text()); }).get(),
			available : $html.find("tr:has(input) td:nth-child(9)").map(function(){ return $(this).text().split(/\s[a-zA-Zа-яА-ЯёЁ]+\s/).reduce(function(a, b){ return Math.min(a, b.match(/\d+/) === null? Infinity : numberfy(b.match(/(\d| )+/)[0])); }, Infinity); }).get()			
		};
	}	
	else if(page === "contract"){
		mapped[url] = {
			available : $html.find(".price_w_tooltip:nth-child(4)").map(function(){ $(this).find("i").remove(); return  numberfy($(this).text()); }).get(),
			offer : $html.find(".unit-list-2014 tr[id]").map(function(){ return numberfy($(this).attr("id").match(/\d+/)[0]); }).get(),
			price : $html.find(".price_w_tooltip:nth-child(6)").map(function(){ return numberfy($(this).text()); }).get(),
			quality : $html.find("td:nth-child(7)").map(function(){ return numberfy($(this).text()); }).get(),
			tm : $html.find(".unit-list-2014 td:nth-child(1)").map(function(){ return $(this).find("img").length ? $(this).find("img").attr("title") : ""; }).get(),
			product : $html.find("img:eq(0)").attr("title")
		};
	}
	else if(page === "research"){
		mapped[url] = {
			isFree : !$html.find(".cancel").length,
			isAbsent : $html.find("b[style='color: red']").length,
			isFactory : $html.find("span[style='COLOR: red;']").length,
			unittype : $html.find(":button:eq(2)").attr("onclick") && numberfy($html.find(":button:eq(2)").attr("onclick").split(",")[1]),
			industry : $html.find(":button:eq(2)").attr("onclick") && numberfy($html.find(":button:eq(2)").attr("onclick").split("(")[1]),
			level : numberfy($html.find(".list tr td[style]:eq(0)").text())
		};
	}
	else if(page === "experimentalunit"){
		mapped[url] = {
			id : $html.find(":radio").map(function(){ return numberfy($(this).val()); }).get()
		};
	}	
}

function xGet(url, page, callback){
	
	var unchangable = ["TM", "IP", "transport", "CTIE", "manager", "products", "none"];
	
	if($.inArray(url, getUrls) === -1){
		
		if($.inArray(page, unchangable) >= 0){
			getUrls.push(url);			
		}
		
		$.ajax({
			url: url,				
			type: "GET",

			success: function(html, status, xhr){	
				time();
				servergetcount++;			
				$("#XioGetCalls").text(servergetcount);
				$("#XioServerCalls").text(servergetcount + serverpostcount);
				map(html, url, page);
				callback();
				xUrlDone(url);
			},

			error: function(){
				time();
				servergetcount++;			
				$("#XioGetCalls").text(servergetcount);
				$("#XioServerCalls").text(servergetcount + serverpostcount);
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
			time();			
			serverpostcount++;			
			$("#XioPostCalls").text(serverpostcount);
			$("#XioServerCalls").text(servergetcount + serverpostcount);
			callback(html);		
		},

		error: function(){
			time();
			serverpostcount++;			
			$("#XioPostCalls").text(serverpostcount);
			$("#XioServerCalls").text(servergetcount + serverpostcount);
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

		success: function(data, status, xhr){
			time();
			serverpostcount++;			
			$("#XioPostCalls").text(serverpostcount);
			$("#XioServerCalls").text(servergetcount + serverpostcount);
			callback(data);		
		},

		error: function(){
			time();		
			serverpostcount++;			
			$("#XioPostCalls").text(serverpostcount);
			$("#XioServerCalls").text(servergetcount + serverpostcount);
			//Resend ajax
			setTimeout(function(){
				$.ajax(this);
			}, 3000);
		}
	});
	
}

function xTypeDone(type){	
	
	xcount[type]--;
	$("[id='x"+type+"']").text(xmax[type] - xcount[type]);
	if(!xcount[type]){
		$("[id='x"+type+"done']").text("Done!");
		typedone.push(type);
		for(var i = 0; i < xwait.length; i++){
			var index = xwait[i][0].indexOf(type);
			if(index >= 0){
				xwait[i][0].splice(index, 1);
				if(xwait[i][0].length === 0){
					xwait[i][1]();
					xwait.splice(i, 1);
					i--;
				}
			}			
		}

	}	
	
	var sum = 0;
	for(var i in xcount)
		sum += xcount[i];
	
	if(sum === 0 && $("#xDone").css("visibility") === "hidden"){
		$("#xDone").css("visibility", "");
		console.log("mapped: ", mapped);
		$(".XioGo").attr("disabled", false);
		clearInterval(timeinterval);
	}	
}

function xUrlDone(url){
	
	finUrls.push(url);	
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
	var urlContract = "/"+realm+"/ajax/unit/supply/create";
	
	
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
		
		var change = [];
		
		if(mapped[url].parcel.length !== mapped[url].required.length){
			choice = 1;
			postMessage("Subdivision <a href="+url+">"+subid+"</a> is missing a supplier, or has too many suppliers!");
		}
		
		
		for(var i = 0; i < mapped[url].parcel.length; i++){
			
			var newsupply = 0;
			if(choice === 1){
				newsupply = 0;
			}		
			else if(choice === 2 && mapped[url].isProd){
				newsupply =  mapped[url].required[i]
			}
			else if(choice === 2 && !mapped[url].isProd){
				newsupply = mapped[url2].consump[i];
			}
			else if(choice === 3 && mapped[url].isProd){
				newsupply =  Math.min(2 * mapped[url].required[i], Math.max(3 * mapped[url].required[i] - mapped[url].stock[i], 0));	
			}
			else if(choice === 3 && !mapped[url].isProd){
				newsupply =  Math.min(2 * mapped[url2].consump[i], Math.max(3 * mapped[url2].consump[i] - mapped[url].stock[i], 0));				
			}
			
			if(mapped[url].parcel[i] !== newsupply || mapped[url].reprice[i]){
				change.push({
					amount: newsupply,
					offer: mapped[url].offer[i],
					unit: subid
				});	
			}								
		}
		
		var postcount = change.length;
		if(postcount){
			for(var i = 0; i < change.length; i++){
				xContract(urlContract, change[i], function(){
					!--postcount && xTypeDone(type);
				});
			}
		}
		else{
			xTypeDone(type);
		}
		
	}
	
}

function storeSupply(type, subid, choice){
	var url = "/"+realm+"/main/unit/view/"+subid+"/supply";	
	var urlContract = "/"+realm+"/ajax/unit/supply/create";
		
	xGet(url, "storesupply", function(){
		post();
	});	
	
	function post(){
		
		var change = [];
		
		if(mapped[url].parcel.length !== mapped[url].sold.length){
			choice = 1;
			postMessage("Subdivision <a href="+url+">"+subid+"</a> is missing a supplier, or has too many suppliers!");
		}
		
		for(var i = 0; i < mapped[url].parcel.length; i++){
			
			var newsupply = 0;
			if(choice === 1){
				newsupply = 0;
			}		
			else if(choice === 2){
				newsupply = mapped[url].sold[i];
			}
			else if(choice === 3){
				newsupply = mapped[url].sold[i] + mapped[url].sold[i] * mapped[url].quantity[i] === mapped[url].purchase[i] * 0.2;
			}
			else if(choice === 4){
				newsupply =  Math.min(2 * mapped[url].sold[i], Math.max(3 * mapped[url].sold[i] - mapped[url].quantity[i], 0));
			}
			
			if(mapped[url].parcel[i] !== newsupply || mapped[url].reprice[i]){
				change.push({
					amount: newsupply,
					offer: mapped[url].offer[i],
					unit: subid
				});	
			}								
		}
		
		var postcount = change.length;
		if(postcount){
			for(var i = 0; i < change.length; i++){
				xContract(urlContract, change[i], function(){
					!--postcount && xTypeDone(type);
				});
			}
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
			mapped[url].form.find("#salary").val(mapped[url].salaryNow);			
		}
		else if(choice === 2){
			var skillReq = calcSkill(mapped[url].employees, subType[mapped[urlMain].img][0], mapped[urlManager].base[subType[mapped[urlMain].img][2]]);
						
			if(mapped[url].skillNow !== skillReq){
				change = true;
				mapped[url].salaryNow = calcSalary(mapped[url].salaryNow, mapped[url].salaryCity, mapped[url].skillNow, mapped[url].skillCity, skillReq);
				mapped[url].salaryNow = Math.max(mapped[url].salaryNow, (mapped[url].salaryCity+.005) * 0.8);
				mapped[url].salaryNow = Math.min(mapped[url].salaryNow, (mapped[url].salaryCity-.005) * 500);
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

function holiday(type, subid, choice){
	
	if(choice === 1){
		xGet("/"+realm+"/main/unit/view/"+subid+"/holiday_set", "none", function(){
			xTypeDone(type);
		});
	}
	else if(choice === 2){		
		xGet("/"+realm+"/main/unit/view/"+subid+"/holiday_unset", "none", function(){
			xTypeDone(type);
		});
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
	
	function post(){
		
		var change = [];		
		
		var equipPerc = mapped[urlMain].img === "animalfarm"? 100 - mapped[url].equipPerc : mapped[url].equipPerc;
		var equipWear = Math.floor(mapped[url].equipNum * equipPerc / 100);		
		
		if(choice === 1){
								
			var offer = {
				low : [],
				high : [],
			};
			
			var qualReq = mapped[url].qualReq + 0.005;
			var qualNow = mapped[url].qualNow - 0.005;
			
			for(var i = 0; i < mapped[url].offer.length; i++){
				var data = {
					PQR : mapped[url].price[i] / mapped[url].qualOffer[i],
					quality : mapped[url].qualOffer[i] - 0.005,
					available : mapped[url].available[i],
					buy : 0,
					offer : mapped[url].offer[i]
				}				
				if(data.quality < qualReq){
					offer.low.push(data);
				}
				else{
					offer.high.push(data);
				}
			}
			
			for(var key in offer){
				offer[key].sort(function(a, b) {
					return a.PQR - b.PQR;
				});
			}
			
			var l = 0;
			var h = 0;
			var qualEst = 0;
			var qualNew = qualNow;
			
			while(equipWear > 0 && h < offer.high.length){
				
				qualEst = qualNew;
				l < offer.low.length && offer.low[l].buy++;
				for(var key in offer){
					for(var i = 0; i < offer[key].length; i++){
						if(offer[key][i].buy){
							qualEst = ((mapped[url].equipNum - offer[key][i].buy) * qualEst + offer[key][i].buy * offer[key][i].quality) / mapped[url].equipNum;
						}						
					}
				}
				l < offer.low.length && offer.low[l].buy++;
				
				if(l < offer.low.length && qualEst > qualReq && offer.low[l].PQR < offer.high[h].PQR){
					offer.low[l].buy++;
					offer.low[l].available--;
					if(offer.low[l].available === 0){
						l++;
					}
				}
				else{
					offer.high[h].buy++;
					offer.high[h].available--;
					if(offer.high[h].available === 0){
						h++;
					}
				}
				
				equipWear--;				
			}		
			
			for(var key in offer){
				for(var i = 0; i < offer[key].length; i++){
					if(offer[key][i].buy){
						change.push({
							op : "repair",
							offer : offer[key][i].offer,
							amount : offer[key][i].buy
						});
						qualNew = ((mapped[url].equipNum - offer[key][i].buy) * qualNew + offer[key][i].buy * offer[key][i].quality) / mapped[url].equipNum;
					}
				}
			}
			
			var offer = {
				inc : []
			};
			
			for(var i = 0; i < mapped[url].offer.length; i++){
				var data = {
					PQR : mapped[url].price[i] / (mapped[url].qualOffer[i] - qualReq),
					quality : mapped[url].qualOffer[i] - 0.005,
					available : mapped[url].available[i],
					buy : 0,
					offer : mapped[url].offer[i]
				}				
				if(data.quality > qualReq){
					offer.inc.push(data);
				}
			}
			
			offer.inc.sort(function(a, b) {
				return a.PQR - b.PQR;
			});			
			
			var n = 0;
			qualEst = 0;	
			var torepair = 0;
			for(var i = 0; i < offer.inc.length; i++){
				if(offer.inc[i].buy){
					torepair += offer.inc[i].buy;
					qualEst += offer.inc[i].buy * offer.inc[i].quality;
				}						
			}
			qualEst = (qualEst + (mapped[url].equipNum - torepair) * qualNow) / mapped[url].equipNum;
						
			while(qualEst < qualReq && n < offer.inc.length){
				
				offer.inc[n].buy++;
				offer.inc[n].available--;
				if(offer.inc[n].available === 0){
					n++;
				}
				
				qualEst = 0;	
				torepair = 0;
				for(var i = 0; i < offer.inc.length; i++){
					if(offer.inc[i].buy){
						torepair += offer.inc[i].buy;
						qualEst += offer.inc[i].buy * offer.inc[i].quality;
					}						
				}
				qualEst = (qualEst + (mapped[url].equipNum - torepair) * qualNow) / mapped[url].equipNum;							
			}		
			
			if(torepair){
				change.push({
					op : "terminate",
					amount : torepair
				});
			}
			
			for(var i = 0; i < offer.inc.length; i++){
				if(offer.inc[i].buy){
					change.push({
						op : "buy",
						offer : offer.inc[i].offer,
						amount : offer.inc[i].buy
					});
				}
			}						
			
			if(equipWear > 0 && (h < offer.high.length || n < offer.inc.length)){
				postMessage("No equipment on the market with a quality higher than required. Could not repair subdivision <a href="+url+">"+subid+"</a>");
			}			
			
		}
		
		else if(choice === 2 && equipWear !== 0){
						
			var s = subType[mapped[urlMain].img];
			var equipMax = calcEquip(calcSkill(mapped[urlSalary].employees, s[0], mapped[urlManager].base[s[2]] + mapped[urlManager].bonus[s[2]]));
								
			var offer = {
				low : [],
				mid : [],
				high : [],
			};
			
			var qualNow = mapped[url].qualNow + 0.005;
			
			for(var i = 0; i < mapped[url].offer.length; i++){
				var data = {
					PQR : mapped[url].price[i] / mapped[url].qualOffer[i],
					quality : mapped[url].qualOffer[i] + 0.005,
					available : mapped[url].available[i],
					buy : 0,
					offer : mapped[url].offer[i]
				}				
				if(data.quality < qualNow){
					offer.low.push(data);
				}
				else if(data.quality < equipMax){
					offer.mid.push(data);
				}
				else{
					offer.high.push(data);
				}
			}
			
			for(var key in offer){
				offer[key].sort(function(a, b) {
					return a.PQR - b.PQR;
				});
			}
			
			var l = 0;
			var m = 0;
			var h = 0;
			var qualEst = 0;
			var qualNew = qualNow;
			
			while(equipWear > 0 && l + m < offer.low.length + offer.mid.length && m + h < offer.mid.length + offer.high.length){
				
				qualEst = qualNew;
				h < offer.high.length && offer.high[h].buy++;
				for(var key in offer){
					for(var i = 0; i < offer[key].length; i++){
						if(offer[key][i].buy){
							qualEst = ((mapped[url].equipNum - offer[key][i].buy) * qualEst + offer[key][i].buy * offer[key][i].quality) / mapped[url].equipNum;
						}						
					}
				}
				h < offer.high.length && offer.high[h].buy--;
				
				if(h < offer.high.length && qualEst < equipMax && (m === offer.mid.length || offer.high[h].PQR < offer.mid[m].PQR)){
					offer.high[h].buy++;
					offer.high[h].available--;
					if(offer.high[h].available === 0){
						h++;
					}
				}
				else if(l < offer.low.length && qualEst > equipMax && (m === offer.mid.length || offer.low[l].PQR < offer.mid[m].PQR)){
					offer.low[l].buy++;
					offer.low[l].available--;
					if(offer.low[l].available === 0){
						l++;
					}
				}
				else{
					offer.mid[m].buy++;
					offer.mid[m].available--;
					if(offer.mid[m].available === 0){
						m++;
					}
				}
				
				equipWear--;				
			}
			
			for(var key in offer){
				for(var i = 0; i < offer[key].length; i++){
					if(offer[key][i].buy){
						change.push({
							op : "repair",
							offer : offer[key][i].offer,
							amount : offer[key][i].buy
						});	
						qualNew = ((mapped[url].equipNum - offer[key][i].buy) * qualNew + offer[key][i].buy * offer[key][i].quality) / mapped[url].equipNum;
					}
				}
			}	
			
			if(equipWear > 0 && l + m < offer.low.length + offer.mid.length){
				postMessage("No equipment on the market with a quality lower than the maximum quality defined by the Top1. Could not repair subdivision <a href="+url+">"+subid+"</a>");
			}
			else if(equipWear > 0 && m + h < offer.mid.length + offer.high.length){
				postMessage("No equipment on the market with a quality higher than the current quality. Could not repair subdivision <a href="+url+">"+subid+"</a>");
			}				
			
		}	
		else if(choice === 3 && equipWear !== 0){
			
			var offer = [];
			
			for(var i = 0; i < mapped[url].offer.length; i++){
				offer.push({
					price : mapped[url].price[i],
					quality : mapped[url].qualOffer[i],
					available : mapped[url].available[i],
					offer : mapped[url].offer[i]
				});
			}
			
			offer.sort(function(a, b){
				return a.price - b.price;
			});
			
			var i = 0;
			while(equipWear > 0 && i < offer.length){
				
				var tobuy = 0;
				if(offer[i].quality === 2.00){
					
					tobuy = Math.min(equipWear, offer[i].available);
					equipWear -= tobuy;			
					change.push({
						op : "repair",
						offer : offer[i].offer,
						amount : tobuy
					});
					
				}				
				i++;
			}
			
			if(i === offer.length){
				postMessage("No equipment on the market with a quality of 2.00. Could not repair subdivision <a href="+url+">"+subid+"</a>");
			}
			
		}
		
		var equipcount = change.length;
		for(var i = 0; i < change.length; i++){
			xequip.push(
				(function(i){
					xContract("/"+realm+"/ajax/unit/supply/equipment", {
						'operation'       : change[i].op,
						'offer'  		  : change[i].offer,
						'unit'  		  : subid,
						'supplier'		  : change[i].offer,
						'amount'		  : change[i].amount							
					}, 
					function(){
						if(xequip.length){
							xequip.shift()();
						}
						!--equipcount && xTypeDone(type);							
					});						
				}.bind(this, i))
			);
		}
		
		if(xequip.length && !fireequip){
			fireequip = true;
			xequip.shift()();
		}
		else if(equipcount === 0){
			xTypeDone(type);
		}
		
		
	}
}

function technology(type, subid, choice){
	var url = "/"+realm+"/main/unit/view/"+subid+"/technology";
	var urlManager = "/"+realm+"/main/user/privat/persondata/knowledge";

	var getcount = 2;
	xGet(url, "tech", function(){
		!--getcount && post();
	});
	xGet(urlManager, "manager", function(){
		!--getcount && post();
	});
	
	function post(){
		var change = false;
			
		if(choice === 1){
			
			var managerIndex = subType[mapped[url].img][2];
			var managerQual = mapped[urlManager].base[managerIndex] + mapped[urlManager].bonus[managerIndex];
			var techLevel = calcTechLevel(managerQual);
			
			for(var i = mapped[url].price.length - 1; i >= 0; i--){
				if(mapped[url].price[i] === "$0.00" && (i+1) <= techLevel) break;
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

function prodBooster(type, subid, choice){
	
	var url = "/"+realm+"/main/unit/view/"+subid;
	
	xGet(url, "main", function(){
		post();
	});
	
	function post(){
		var change = false;
			
		if(choice === 1 && !mapped[url].hasService){
			change = true;				
		}	

		if(change){
			xPost("/"+realm+"/ajax/unit/artefact/attach/", "?unit_id="+subid+"&artefact_id=300804&slot_id=300139", function(){
				xTypeDone(type);
			});
		}
		else{
			xTypeDone(type);			
		}
	}
	
	
	
}

function research(type, subid, choice){
	var url = "/"+realm+"/main/unit/view/"+subid+"/investigation";
	var urlUnit = "/"+realm+"/window/unit/view/"+subid+"/set_experemental_unit";
	var urlForecast = "/"+realm+"/ajax/unit/forecast";

	xGet(url, "research", function(){
		
		if(choice === 1 && mapped[url].isFree){
			var data = "industry="+mapped[url].industry+"&unit_type="+mapped[url].unittype+"&level="+(mapped[url].level+1)+"&create=Invent";
			xPost("/"+realm+"/window/unit/view/"+subid+"/project_create", data, function(){
				xTypeDone(type);
			});
		}
		else if(choice === 1 && (mapped[url].isAbsent || mapped[url].isFactory)){			
			xGet(urlUnit, "experimentalunit", function(){
				
				var effi = [];
				var contractcount = mapped[urlUnit].id.length;
				for(var i = 0; i < mapped[urlUnit].id.length; i++){
					(function(i){
						xContract(urlForecast, {"unit_id" : mapped[urlUnit].id[i]}, function(data){
							effi.push({
								"id": mapped[urlUnit].id[i], 
								"efficiency": numberfy(data.productivity), 
								"load": numberfy(data.loading)
							});
							!--contractcount && post();
						});			
					})(i);											
				}

				if(!mapped[urlUnit].id.length){
					postMessage("There is no factory available to support laboratory <a href="+url+">"+subid+"</a>");
					xTypeDone(type);
				}
				
				function post(){
							
					var efficient = 0;
					var index = -1;
					for(var i = 0; i < effi.length; i++){
						if(efficient < effi[i].efficiency * effi[i].load){
							efficient = effi[i].efficiency * effi[i].load
							index = i;
						}
					}
					
					if(index === -1){
						postMessage("There is no factory available to support laboratory <a href="+url+">"+subid+"</a>");
						xTypeDone(type);
					}
					else{
						var data = "unit="+effi[index].id+"&next=Select";				
						xPost(urlUnit, data, function(){
							xTypeDone(type);
						});							
					}					
				}				
			});			
		}
		else{
			xTypeDone(type);
		}
		
		
	});
}

function wareSupply(type, subid, choice){
	var url = "/"+realm+"/main/unit/view/"+subid+"/supply";	
	var getcount = 0;
	
	getcount++;
	xGet(url, "waresupply", function(){
		!--getcount && post();
	});
	
	if(choice >= 5){
		getcount += 3;
		xGet("/"+realm+"/window/common/util/setpaging/dbwarehouse/supplyList/40000", "none", function(){
			!--getcount && post();
		});
		var data = "total_price%5Bfrom%5D=&total_price%5Bto%5D=&quality%5Bfrom%5D=&quality%5Bto%5D=&quantity%5Bfrom%5D=&free_for_buy%5Bfrom%5D=1&brand_value%5Bfrom%5D=&brand_value%5Bto%5D=";
		xPost("/"+realm+"/window/common/util/setfiltering/dbwarehouse/supplyList", data, function(){
			!--getcount && post();
		});
		xGet("/"+realm+"/window/common/util/setfiltering/dbwarehouse/supplyList/supplierType=all/tm=all", "none", function(){
			!--getcount && post();
		});

	}
	
	var change = [];
	var deletechange = false;
	var deletestring = "contractDestroy=1";		
	
	function post(){		
		
		if(choice === 1 || choice === 4){
			
			for(var i = 0; i < mapped[url].parcel.length; i++){
				
				var newsupply = 0;
				if(choice === 1){
					newsupply = 0;
				}
				else if(choice === 4){
					newsupply = 1000000000;
				}
				
				if(mapped[url].parcel[i] !== newsupply || mapped[url].reprice[i]){
					change.push({							
						'newsup' : false,
						'offer'  : mapped[url].offer[i],
						'amount' : newsupply	
					});
				}
				
			}
			
			post2();
			
		}

		else if(choice === 2 || choice === 3){
			var j = 0;
			var supplier = [];
			for(var i = 0; i < mapped[url].type.length; i++){
				
				var set = 0;
				if(choice === 2){
					set = mapped[url].shipments[i];
				}
				else if(choice === 3){
					set = Math.min(2 * mapped[url].shipments[i], Math.max(3 * mapped[url].shipments[i] - mapped[url].stock[i], 0));					
				}
				
				supplier = [];
				while(mapped[url].type[i] === mapped[url].product[j]){
					supplier.push({
						available : mapped[url].available[j],
						PQR : mapped[url].price[j] / mapped[url].quality[j],
						offer : mapped[url].offer[j],
						index : j
					});
					j++;
				}
				
				supplier.sort(function(a, b) {
					return a.PQR - b.PQR;
				});
				
				var toset = 0;
				for(var k = 0; k < supplier.length; k++){
					toset = Math.min(set, supplier[k].available);
					set -= toset;
					if(mapped[url].parcel[supplier[k].index] !== toset || mapped[url].reprice[supplier[k].index]){
						change.push({							
							'newsup' : false,
							'offer'  : supplier[k].offer,
							'amount' : toset	
						});
					}		
				}
				
				if(set > 0){
					postMessage("Not enough suppliers for product "+mapped[url].type[i]+" in warehouse <a href="+url+">"+subid+"</a>");
				}
			}
			
			post2();
			
		}
		
		else if(choice >= 5){
				
			var supcount = mapped[url].type.length;			
			
			var j = 0;			
			for(var i = 0; i < mapped[url].type.length; i++){
								
				var urlContract = mapped[url].contract[i];
				
				var set = 0;				
				if(choice === 5){
					set = mapped[url].shipments[i];
				}
				else if(choice === 6){
					set = Math.min(2 * mapped[url].shipments[i], Math.max(3 * mapped[url].shipments[i] - mapped[url].stock[i], 0));					
				}
				set = Math.max(set, 1);
				
				var supplier = [];
				while(mapped[url].type[i] === mapped[url].product[j]){
					supplier.push({
						available : mapped[url].available[j],
						PQR : mapped[url].price[j] / mapped[url].quality[j],
						offer : mapped[url].offer[j],
						index : j
					});
					j++;					
				}				

				var product = mapped[url].type[i];

				xsupplier.push(
					(function(product, urlContract, set, supplier){
						xGet(urlContract, "contract", function(){
														
							var offers = supplier.map(function(contract){
								return contract.offer;
							});
							
							for(var k = 0; k < mapped[urlContract].offer.length; k++){
								if(offers.indexOf(mapped[urlContract].offer[k]) === -1 && (mapped[urlContract].tm[k] === product || mapped[urlContract].product === product)){
									supplier.push({
										available : mapped[urlContract].available[k],
										PQR : mapped[urlContract].price[k] / mapped[urlContract].quality[k],
										offer : mapped[urlContract].offer[k],
										row : k
									});									
								}
							}
							
							supplier.sort(function(a, b) {
								return a.PQR - b.PQR;
							});		
							
							for(var k = 0; k < supplier.length; k++){
								var toset = Math.min(set, supplier[k].available);
								set -= toset;
								if(toset > 0 && (supplier[k].row >= 0 || supplier[k].index >= 0 && mapped[url].parcel[supplier[k].index] !== toset) || mapped[url].reprice[supplier[k].index]){
									change.push({
										'newsup' : supplier[k].row >= 0,
										'offer'  : supplier[k].offer,
										'amount' : toset					
									});																	
								}
								else if(supplier[k].index >= 0 && toset === 0){
									deletechange = true;
									deletestring += "&supplyContractData%5Bselected%5D%5B%5D="+supplier[k].offer;
								}
							}
							
							if(set > 0){
								postMessage("Not enough suppliers for product "+product+" in warehouse <a href="+url+">"+subid+"</a>");
							}	
							
							if(xsupplier.length){
								xsupplier.shift()();
							}
							else{
								firesupplier = false;
							}
							
							!--supcount && post2();
							
						});						
					}.bind(this, product, urlContract, set, supplier))
				);
			}
			
			if(!supcount){
				post2();
			}

			if(!firesupplier && xsupplier.length){
				firesupplier = true;
				xsupplier.shift()();
			}		
		}	
	}	
	
	function post2(){
		
		var contractcount = change.length + deletechange;
		
		for(var i = 0; i < change.length; i++){
			
			(function(i){
				xContract("/"+realm+"/ajax/unit/supply/create", {
				'offer'  		  : change[i].offer,
				'unit'  		  : subid,
				'amount'		  : change[i].amount			
				}, function(){
					if(change[i].newsup){
						suppliercount++;
						$("#XioSuppliers").text(suppliercount);												
					}
					!--contractcount && xTypeDone(type);
				});
			})(i);
		}
		
		if(deletechange){
			xPost(url, deletestring, function(){
				!--contractcount && xTypeDone(type);
			});
		}
		
		if(contractcount === 0){
			xTypeDone(type);
		}	
		
	}
}

function advertisement(type, subid, choice){
	
}

var policyJSON = {
	pc: {
		func: salePrice, 
		save: ["don't change price", "zero price", "prime cost", "1x IP", "30x IP", "CTIE", "Profit Tax"], 
		order: ["don't change price", "zero price", "prime cost", "CTIE", "Profit Tax", "1x IP", "30x IP", ],
		name: "Production price",
		group: "Price",
		wait: []
	},
	pl: {
		func: salePolicy, 
		save: ["don't change policy", "not for sale", "any customer", "my company", "my corporation"], 
		order: ["don't change policy", "not for sale", "any customer", "my company", "my corporation"],
		name: "Policy",
		group: "Policy",
		wait: []
	},
	sp: {
		func: prodSupply, 
		save: ["don't change supply", "zero supply", "required", "3x stock"], 
		order: ["don't change supply", "zero supply", "required", "3x stock"],
		name: "Production supply",
		group: "Supply",
		wait: ["Production price", "Policy"]
	},
	ss: {
		func: storeSupply, 
		save: ["don't change supply", "zero supply", "sold", "sold++", "3x stock"], 
		order: ["don't change supply", "zero supply", "sold", "sold++", "3x stock"],
		name: "Retail supply",
		group: "Supply",
		wait: ["Production price", "Policy"]
	},	
	sw: {
		func: wareSupply,
		save: ["don't change supply", "zero supply", "required", "2x stock", "maximum supply", "required (world)", "2x stock (world)"], 
		order: ["don't change supply", "zero supply", "required", "required (world)", "2x stock", "2x stock (world)", "maximum supply"],
		name: "Warehouse supply",
		group: "Supply",
		wait: ["Production supply", "Retail supply"]
	},
	ad: {
		func: advertisement,
		save: ["don't change ads", "zero ads", "minimum TV ads", "maximum ads"], 
		order: ["don't change ads", "zero ads", "minimum TV ads", "maximum ads"],
		name: "Advertisement",
		group: "Advertisement",
		wait: []
	},
	es: {
		func: salary, 
		save: ["don't change salary", "required salary", "target salary", "maximum salary"], 
		order: ["don't change salary", "required salary", "target salary", "maximum salary"],
		name: "Salary",
		group: "Salary",
		wait: ["Equipment"]
	},
	eh: {
		func: holiday, 
		save: ["don't change holiday", "holiday", "working"], 
		order: ["don't change holiday", "holiday", "working"], 
		name: "Holiday",
		group: "Holiday",
		wait: []
	},
	et: {
		func: training, 
		save: ["don't train", "always train", "train city salary"], 
		order: ["don't train", "always train", "train city salary"],
		name: "Training",
		group: "Training",
		wait: ["Salary"]
	},
	qp: {
		func: equipment, 
		save: ["don't change equipment", "required equipment", "maximal equipment", "Q2.00 equipment"], 
		order: ["don't change equipment", "Q2.00 equipment", "required equipment", "maximal equipment"],
		name: "Equipment",
		group: "Equipment",
		wait: ["Technology", "Research"]
	},
	tc: {
		func: technology,
		save: ["don't change technology", "introduce researched"],
		order: ["don't change technology", "introduce researched"],
		name: "Technology",
		group: "Technology",
		wait: []
	},	
	pb: {
		func: prodBooster,
		save: ["don't buy solar panels", "always buy solar panels"],
		order: ["don't buy solar panels", "always buy solar panels"],
		name: "Booster",
		group: "Booster",
		wait: []
	},
	rs: {
		func: research,
		save: ["don't start new project", "continue research"],
		order: ["don't start new project", "continue research"],
		name: "Research",
		group: "Research",
		wait: []
	}
};

function preference(policies){
	//manage preference options
	
	if(document.URL.match(/(view\/?)\d+/) === null){
		return false;
	}
	
	var subid = numberfy(document.URL.match(/(view\/?)\d+/)[0].split("/")[1]);	
			
	var savedPolicyStrings = ls["x"+realm+subid]? ls["x"+realm+subid].split(";") : [];
	var savedPolicies = [];
	var savedPolicyChoices = [];
	var $topblock = $("#topblock");
	for(var i = 0; i < savedPolicyStrings.length; i++){		
		savedPolicies[i] = savedPolicyStrings[i].substring(0, 2);
		savedPolicyChoices[i] = numberfy(savedPolicyStrings[i].substring(2));		
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
		
		savedPolicyStrings = ls["x"+realm+subid]? ls["x"+realm+subid].split(";") : [];	
		savedPolicies = [];
		savedPolicyChoices = [];
		for(var i = 0; i < savedPolicyStrings.length; i++){		
			savedPolicies[i] = savedPolicyStrings[i].substring(0, 2);
			savedPolicyChoices[i] = numberfy(savedPolicyStrings[i].substring(2));		
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
		
		ls["x"+realm+subid] = newPolicyString.substring(1);
	}).each(function(){
		$(this).trigger("change");
	});
	
}

function preferencePages(html, url){
	
	$html = $(html);
	
	//Production and Warehouse Price/Sale page
    if(new RegExp("\/.*\/main\/unit\/view\/[0-9]+\/sale$").test(url) && $html.find(".list_sublink").length === 0){
		return ["pc", "pl"]
	}
	
	//Production and Service Supply page
    else if(new RegExp("\/.*\/main\/unit\/view\/[0-9]+\/supply$").test(url) && $html.find(".add_contract").length === 0 && $html.find("[name=productCategory]").length === 0){
		return ["sp"];
	}
	
	//Store Supply page
    else if(new RegExp("\/.*\/main\/unit\/view\/[0-9]+\/supply$").test(url) && $html.find(".add_contract").length === 0){
		return ["ss"];
	}
	
	//Warehouse Supply page
    else if(new RegExp("\/.*\/main\/unit\/view\/[0-9]+\/supply$").test(url)){
		return ["sw"];
	}
	
	//Main unit page: Salary and Equipment
    else if(new RegExp("\/.*\/main\/unit\/view\/[0-9]+$").test(url) && ($html.find(".fa-users").length && $html.find(".fa-cogs").length || $html.find("[href*='/window/unit/employees/engage/']").length && $html.find("[href*='/window/unit/equipment/']").length)){
		return ["es", "eh", "et", "qp"];
	}
	
	//Main unit page: Salary only
    else if(new RegExp("\/.*\/main\/unit\/view\/[0-9]+$").test(url) && ($html.find(".fa-users").length || $html.find("[href*='/window/unit/employees/engage/']").length)){
		return ["es", "eh", "et"];
	}
	
	//Technology page
    else if(new RegExp("\/.*\/main\/unit\/view\/[0-9]+\/technology$").test(url)){
		return ["tc"];
	}
	
	//Research page
	else if(new RegExp("\/.*\/main\/unit\/view\/[0-9]+\/investigation$").test(url)){
		return ["rs"];
	}
	
	//Pages with no preference
	else{
		return [];
	}
	
}

function time(){	
	var time = new Date().getTime();
	var minutes = (time-processingtime)/1000/60;
	$("#XioMinutes").text(Math.floor(minutes));
	$("#XioSeconds").text(Math.round((minutes - Math.floor(minutes))*60));	
}

function postMessage(html){
	$("#XMproblem").append("<div>"+html+"</div>");
}

function XioMaintenance(subids, allowedPolicies){
		
	console.log("XM!");
	processingtime = new Date().getTime();
	timeinterval = setInterval(time, 1000);	
	
	$(".XioGo").attr("disabled", true);	
	$(".XioProperty").remove();
	
	getUrls = [];
	finUrls = [];
	xcallback = [];
	xcount = {};
	xmax = {};
	mapped = {};
	servergetcount = 0;
	serverpostcount = 0;
	suppliercount = 0;
	
	if(!subids){
		subids = [];
		for(var key in ls){
			if(/x\d+/.test(key)){
				subids.push(numberfy(key.match(/\d+/)[0]));
			}
		}
	}
	
	if(!allowedPolicies){
		allowedPolicies = [];
		for(var key in policyJSON){
			allowedPolicies.push(policyJSON[key].name);
		}
	}
	
	
	var tablestring = ""
		+"<div id=XMtabletitle class=XioProperty style='font-size: 24px; color:gold; margin-bottom: 5px; margin-top: 15px;'>XS 12 Maintenance Log</div>"
		+"<table id=XMtable class=XioProperty style='font-size: 18px; color:gold; border-spacing: 10px 0; margin-bottom: 18px'>"
			+"<tr id=XSplit></tr>"
			+"<tr>"
				+"<td>New suppliers: </td>"
				+"<td id=XioSuppliers>0</td>"
			+"</tr>"
			+"<tr>"
				+"<td>Get calls: </td>"
				+"<td id=XioGetCalls>0</td>"
			+"</tr>"
			+"<tr>"
				+"<td>Post calls: </td>"
				+"<td id=XioPostCalls>0</td>"
			+"</tr>"
			+"<tr>"
				+"<td>Total server calls: </td>"
				+"<td id=XioServerCalls>0</td>"
			+"</tr>"
			+"<tr>"
				+"<td>Time: </td>"
				+"<td id=XioMinutes>0</td>"
				+"<td>min</td>"
				+"<td id=XioSeconds>0</td>"
				+"<td>sec</td>"
			+"</tr>"
			+"<tr>"
				+"<td id=xDone colspan=4 style='visibility: hidden; color: lightgoldenrodyellow'>All Done!</td>"
			+"</tr>"
		+"</table>"
		+"<div id=XMproblem class=XioProperty style='font-size: 18px; color:gold;'></div>";
				
	$("#topblock").append(tablestring);	
	
	var companyid = numberfy($(".dashboard a").attr("href").match(/\d+/)[0]);
	var urlUnitlist = "/"+realm+"/main/company/view/"+companyid+"/unit_list";
	xGet("/"+realm+"/main/common/util/setpaging/dbunit/unitListWithProduction/20000", "none", function(){
		xGet("/"+realm+"/main/company/view/"+companyid+"/unit_list", "unitlist", function(){		
			xGet("/"+realm+"/main/common/util/setpaging/dbunit/unitListWithProduction/400", "none", function(){
				further(mapped[urlUnitlist].subids);
			});
		});
	});
	
	function further(realsubids){
		
		var startedPolicies = [];
		console.log(realsubids);
		for(var i = 0; i < subids.length; i++){
			if(realsubids.indexOf(subids[i]) === -1){
				var urlSubid = "/"+realm+"/main/unit/view/"+subids[i];
				postMessage("Subdivision <a href="+urlSubid+">"+subids[i]+"</a> is missing from the company. Options have been erased from the Local Storage");
				ls.removeItem("x"+subids[i]);
				continue;
			}
			var savedPolicyStrings = ls["x"+realm+subids[i]]? ls["x"+realm+subids[i]].split(";") : [];
			for(var j = 0; j < savedPolicyStrings.length; j++){	
				var policy = policyJSON[savedPolicyStrings[j].substring(0, 2)]
				var choice = parseFloat(savedPolicyStrings[j].substring(2));
				if(policy === undefined || !choice || allowedPolicies.indexOf(policy.name) === -1){
					continue;
				}
				
				if(startedPolicies.indexOf(policy.name) === -1){
					startedPolicies.push(policy.name);				
				}
				
				xmax[policy.name] = ++xmax[policy.name] || 1;
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
			if(startedPolicies.indexOf(type) >= 0){
				$("#XSplit").before( "<tr>"
										+"<td>"+type+"</td>"
										+"<td id='x"+type+"'>0</td>"
										+"<td>of</td>"
										+"<td>"+xmax[type]+"</td>"
										+"<td id='x"+type+"done' style='color: lightgoldenrodyellow'></td>"
									+"</tr>"
				);
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
	

}

function XioGenerator(subids){
	
	$(".XioGo").attr("disabled", true);
	$(".XioProperty").remove();
	
	$("#topblock").append(""
		+"<table id=XMtable class=XioProperty style='font-size: 18px; color:gold; border-spacing: 10px 0; margin-top: 10px;'>"
			+"<tr>"
				+"<td>Total server calls: </td>"
				+"<td id=XioServerCalls>0</td>"
			+"</tr>"
			+"<tr>"
				+"<td id=xDone colspan=4 style='visibility: hidden; color: lightgoldenrodyellow'>All Done!</td>"
			+"</tr>"
		+"</table>"	
	);
	
	servergetcount = 0;
	var getcount = 0;
	var data = {};
	
	for(var j = 0; j < subids.length; j++){
		
		var subid = subids[j];
		data[subid] = [];
		
		var url = "/"+realm+"/main/unit/view/"+subid;	
				
		getcount++;
		(function(url, subid){
			$.get(url, function(htmlmain){
				
				servergetcount++;
				$("#XioServerCalls").text(servergetcount);
				
				data[subid].push({
					html: htmlmain,
					url: url
				});
				
				var links = $(htmlmain).find(".tabu > li > a:gt(2)").map(function(){ return $(this).attr("href"); }).get();
				getcount += links.length;			
				!--getcount && checkpreference();
				for(var i = 0; i < links.length; i++){
					(function(url, subid){
						$.get(url, function(html){
							
							servergetcount++;
							$("#XioServerCalls").text(servergetcount);	
							
							data[subid].push({
								html: html,
								url: url
							});			
							
							!--getcount && checkpreference();
						});		
					})(links[i], subid);
				}
			});
		})(url, subid);
	}
	
	function checkpreference(){
		
		console.log(data);
		
		
		var refresh = false;
		var i = 0;
		for(var j = 0; j < subids.length; j++){		
		
			var change = false;
			var subid = subids[j];
		
			var policies = [];
			for(var i = 0; i < data[subid].length; i++){
				var prePages = preferencePages(data[subid][i].html, data[subid][i].url);
				console.log(data[subid][i].url, prePages);
				policies.push.apply(policies, prePages);				
			}
			console.log(subid, policies);
			
			savedPolicyStrings = ls["x"+realm+subid]? ls["x"+realm+subid].split(";") : [];	
			savedPolicies = [];
			savedPolicyChoices = [];
			for(var i = 0; i < savedPolicyStrings.length; i++){		
				savedPolicies[i] = savedPolicyStrings[i].substring(0, 2);
				savedPolicyChoices[i] = numberfy(savedPolicyStrings[i].substring(2));					
			}
			
			for(var i = 0; i < savedPolicies.length; i++){		
				if(policies.indexOf(savedPolicies[i]) === -1){
					savedPolicies.splice(i, 1);
					savedPolicyChoices.splice(i, 1);
					refresh = true;	
					change = true;
				}
			}
					
			for(var i = 0; i < policies.length; i++){		
				if(savedPolicies.indexOf(policies[i]) === -1){
					savedPolicies.push(policies[i]);
					savedPolicyChoices.push(0);		
					refresh = true;
					change = true;
				}
			}
			
			if(change){
				newPolicyString = "";
				for(var i = 0; i < savedPolicies.length; i++){
					newPolicyString += ";"+savedPolicies[i] + savedPolicyChoices[i];
				};
				
				ls["x"+realm+subid] = newPolicyString.substring(1);
			}
			
		}
		
		if(refresh){
									
			$(".XioHide").removeClass("XioHide").show();
			$(".XOhtml").remove();
			$(document).off("change.XO").off("click.XO");
			XioOverview();
			
		}
		
		$("#xDone").css("visibility", "");
		$(".XioGo").attr("disabled", false);
		
	}
	
	
}

function XioOverview(){
		
	$(".unit-list-2014").find("td, th").filter(":not(:nth-child(2)):not(:nth-child(3)):not(:nth-child(8))").addClass("XioHide").hide();
	$(".unit-list-2014 tr.odd").css("backgroundColor", "lightgoldenrodyellow");
	$(".unit-list-2014 td:nth-child(3) span").remove(); 
	$(".unit-list-2014").css("white-space", "nowrap");
		
	var policyString = [];
	var groupString = [];
	var thstring = "<th class=XOhtml><input type=button id=XioGeneratorPRO class='XioGo' value='Generate ALL'></th>";
	var tdstring = "";
	for(var key in policyJSON){			
		if(groupString.indexOf(policyJSON[key].group) === -1){
			groupString.push(policyJSON[key].group);
			policyString.push([policyJSON[key].name]);				
			thstring += "<th class=XOhtml>"+policyJSON[key].group+"  <input type=button data-group="+policyJSON[key].group+" class='XioGo XioGroup' value=FIRE!></th>";
			tdstring += "<td class=XOhtml></td>";
		}
		else{
			policyString[groupString.indexOf(policyJSON[key].group)].push(policyJSON[key].name);
		}			
	}			
	
	$(".unit-list-2014 th:nth-child(7)").after(thstring);
	$td = $(".unit-list-2014 td:nth-child(8)");
	
	var subids = $(".unit-list-2014 td:nth-child(1)").map(function(){ return numberfy($(this).text()); }).get();
	for(var i = 0; i < subids.length; i++){
		$td.eq(i).after("<td class=XOhtml>"
						   +"<input type=button data-id="+subids[i]+" class='XioGo XioGenerator' value=Generate>"
						   +"<input type=button data-id="+subids[i]+" class='XioGo XioSub' value=FIRE!>"
					  +"</td>"
					  +tdstring
		);
	}
			
	for(var i = 0; i < subids.length; i++){			
		
		var savedPolicyStrings = ls["x"+realm+subids[i]]? ls["x"+realm+subids[i]].split(";") : [];
		for(var j = 0; j < savedPolicyStrings.length; j++){	
			var policy = policyJSON[savedPolicyStrings[j].substring(0, 2)];
			var choice = numberfy(savedPolicyStrings[j].substring(2));		

			if(policy === undefined){
				continue;
			}
			
			var policyChoice = policy.order.indexOf(policy.save[choice]);
							
			var htmlstring = "<select data-id="+subids[i]+" data-name="+savedPolicyStrings[j].substring(0, 2)+" class=XioChoice>";
			for(var k = 0; k < policy.order.length; k++){
				htmlstring += "<option>"+policy.order[k]+"</option>";
			}
			
			$(".unit-list-2014 tr").eq(i+1)
								   .find("td").eq(groupString.indexOf(policy.group)+9)
								   .html(htmlstring + "</select>")
								   .find("option").eq(policyChoice)
								   .attr("selected", true);	
		}	
	}
	
	var j = 0;
	for(var i = 0; i < policyString.length; i++){
		if($(".unit-list-2014 td:nth-child("+(10+i-j)+")").find("select").length === 0){
			$(".unit-list-2014 th:nth-child("+(9+i-j)+"), .unit-list-2014 td:nth-child("+(10+i-j)+")").remove();
			j++;
		}
	}
	
	$("#wrapper").width($(".unit-list-2014").width() + 80);
	$("#mainContent").width($(".unit-list-2014").width());
	
	
	$(document).on('change.XO', ".XioChoice", function(){	
	
		var thisid = $(this).attr("data-name");
		var thisindex = policyJSON[thisid].save.indexOf($(this).find("option:selected").text());
		var subid = $(this).attr("data-id");
		
		savedPolicyStrings = ls["x"+realm+subid]? ls["x"+realm+subid].split(";") : [];	
		savedPolicies = [];
		savedPolicyChoices = [];
		for(var i = 0; i < savedPolicyStrings.length; i++){		
			savedPolicies[i] = savedPolicyStrings[i].substring(0, 2);
			savedPolicyChoices[i] = parseFloat(savedPolicyStrings[i].substring(2));		
		}
		
		savedPolicyChoices[savedPolicies.indexOf(thisid)] = thisindex;
		
		newPolicyString = "";
		for(var i = 0; i < savedPolicies.length; i++){
			newPolicyString += ";"+savedPolicies[i] + savedPolicyChoices[i];
		};
		
		ls["x"+realm+subid] = newPolicyString.substring(1);
	});	

	$(document).on('click.XO', "#XioGeneratorPRO", function(){
		XioGenerator(subids);
	});	
	
	$(document).on('click.XO', ".XioGenerator", function(){
		var subid = numberfy($(this).attr("data-id"));
		XioGenerator([subid]);
	});	
	
	$(document).on('click.XO', ".XioGroup", function(){
		var index = groupString.indexOf($(this).attr("data-group"));
		var allowedPolicies = policyString[index];
		
		XioMaintenance(undefined, allowedPolicies);
	});	
	
	$(document).on('click.XO', ".XioSub", function(){
		var subid = numberfy($(this).attr("data-id"));
		XioMaintenance([subid], undefined);
	});		
}

function XioExport(){
	$(".XioProperty").remove();
	$("#topblock").append("<br class=XioProperty><textarea id=XEarea class=XioProperty style='width: 900px'></textarea>");
	
	var string = ""
	for(var key in ls){
		var patt = new RegExp("x"+realm+"\d+");
		if(patt.test(key)){
			string += key.substring(1)+"="+ls[key]+",";
		}
	}
	
	$("#XEarea").text(string).height($("#XEarea")[0].scrollHeight);
}

function XioImport(){
	$(".XioProperty").remove();
	$("#topblock").append("<br class=XioProperty><textarea id=XIarea class=XioProperty style='width: 900px'></textarea><br class=XioProperty><input type=button id=XioSave class=XioProperty value=Save!>");
	
	$(document).on('input propertychange', "#XIarea", function(){
		$("#XIarea").height($("#XIarea")[0].scrollHeight);
	});
	
	$("#XioSave").click(function(){
		var string = $("#XIarea").val();
		string = string.replace(/=/g, "']='").replace(/,/g, "';localStorage['x");
		try{
			eval("localStorage['x"+string.slice(0, -15));
			document.location.reload();
		}
		catch(e){
			console.log("import not successful");
		}
	});	
	
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
	return Math.floor(Math.pow(manager*156.25, 1/3)*10)/10;
}

function calcAllEmployees(factor, manager){
	return Math.floor(25 * factor * manager * (manager + 3)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function topManagerStats(){
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
			
			var managerIndex = mapped[url].name.indexOf(mapped[here].manager);
			
			if(managerIndex >= 0){
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
			
				$(".unit_box:has(.fa-cogs) tr:not(:has([colspan])):eq(2)").after( ""
					+"<tr style='color: darkgreen'><td>Maximum quality according to the current qualification of employees</td><td>"+calcEquip(mapped[here].skillNow)+"</td></tr>"
					+"<tr style='color: indigo'><td>Maximum quality according to the target qualification of employees</td><td>"+calcEquip(calcSkill(mapped[here].employees, factor1, managerBase))+"</td></tr>"
					+"<tr style='color: crimson'><td>Maximum quality according to the maximum qualification of employees</td><td>"+calcEquip(calcSkill(mapped[here].employees, factor1, managerTotal))+"</td></tr>"
				);
				
				$(".unit_box:has(.fa-industry) tr:not(:has([colspan])):eq(2)").after( ""
					+"<tr style='color: indigo'><td>Target technology level</td><td>"+calcTechLevel(managerBase)+"</td></tr>"
					+"<tr style='color: crimson'><td>Maximum technology level</td><td>"+calcTechLevel(managerTotal)+"</td></tr>"
				);						
				
				
			}
			else{
				managerBase = mapped[url].base[subType[mapped[here].img][2]];
				managerTotal = managerBase + mapped[url].bonus[subType[mapped[here].img][2]];
				
				function placeText($place, text, value, color){
					$place.html($place.html()+"<br><span style='color: "+color+"'><b>"+value+"</b>"+text+"</span>");			
				}
				
				var $qualRow = $("tr:contains('Qualification of employees'), tr:contains('Qualification of scientists'), \n\
							  tr:contains('Workers qualification')");
				var $levelRow = $("tr:contains('Qualification of player')");
				var $empRow = $("tr:contains('Number of employees'), tr:contains('Number of scientists'),\n\
									tr:contains('Number of workers')");
				var $totalEmpRow = $("tr:contains('profile qualification')");
				var $techRow = $("tr:contains('Technology level'), tr:contains('Current research')");
				var $equipRow = $("tr:contains('Equipment quality'), tr:contains('Computers quality'),\n\
					 tr:contains('Livestock quality'), tr:contains('Quality of agricultural machines')");
				var $effiRow =  $("tr:contains('Top manager efficiency')");       
				
				var amount = numberfy($empRow.find("td:eq(1)").text());
				var qual = numberfy($qualRow.find("td:eq(1)").text());
				var level = numberfy($levelRow.find("td:eq(1)").text());
				var totalEmp = numberfy($totalEmpRow.find("td:eq(1)").text());
				var tech = numberfy($techRow.find("td:eq(1)").text());
				var eqQual = numberfy($equipRow.find("td:eq(1)").text());
										
				placeText($empRow.find("td:eq(1)")," (Target number based on the qualification of employees)", calcEmployees(qual, factor1, managerBase), "indigo");       
				placeText($empRow.find("td:eq(1)")," (Maximum number based on the qualification of employees)", calcEmployees(qual, factor1, managerTotal), "crimson");
				placeText($qualRow.find("td:eq(1)")," (Target qualification based on the number of employees)", calcSkill(amount, factor1, managerBase), "indigo");
				placeText($qualRow.find("td:eq(1)")," (Maximum qualification based on the number of employees)", calcSkill(amount, factor1, managerTotal), "crimson");
				placeText($totalEmpRow.find("td:eq(1)")," (Target number of employees on profile qualification)", calcAllEmployees(factor3, managerBase), "indigo");
				placeText($totalEmpRow.find("td:eq(1)")," (Maximum number of employees on profile qualification)", calcAllEmployees(factor3, managerTotal), "crimson");
				placeText($equipRow.find("td:eq(1)")," (Required according to the current qualification of employees)", calcEquip(qual), "darkgreen");
				placeText($equipRow.find("td:eq(1)")," (Required according to the target qualification of employees)", calcEquip(calcSkill(amount, factor1, managerBase)), "indigo");
				placeText($equipRow.find("td:eq(1)")," (Required according to the maximum qualification of employees)", calcEquip(calcSkill(amount, factor1, managerTotal)), "crimson");	
				placeText($techRow.find("td:eq(1)")," (Target technology level)", calcTechLevel(managerBase), "indigo");
				placeText($techRow.find("td:eq(1)")," (Maximum technology level)", calcTechLevel(managerTotal), "crimson");		
				
			}			
		}		
	});
}

function XioScript(){
	//determines which functions to run;
	
	console.log("XioScript 12 is running!");	
	
	//page options
	if($(".pager_options").length){
		$(".pager_options").append( $(".pager_options :eq(1)")[0].outerHTML.replace(/10/g, "1000") 
								   +$(".pager_options :eq(1)")[0].outerHTML.replace(/10/g, "2000") 
								   +$(".pager_options :eq(1)")[0].outerHTML.replace(/10/g, "4000") 
								   +$(".pager_options :eq(1)")[0].outerHTML.replace(/10/g, "10000") 
								   +$(".pager_options :eq(1)")[0].outerHTML.replace(/10/g, "20000") 
		);
	}
	
	//Unit list	
    if(new RegExp("\/.*\/main\/company\/view\/[0-9]+\/unit_list(\/?)$").test(document.URL)){
        $("#topblock").append("<div style='font-size: 24px; color:gold; margin-bottom: 5px;'>XioScript "+version+"</div>"
							 +"<input type=button id=XM class=XioGo value=XioMaintenance>"
							 +"<input type=button id=XO value=XioOverview>"
							 +"<input type=button id=XE class=XioGo value=Export>"
							 +"<input type=button id=XI class=XioGo value=Import>");		
						  
		$("#XM").click(function(){
			XioMaintenance();
		});		
		$("#XO").click(function(){
			if(new RegExp("\/.*\/main\/company\/view\/[0-9]+\/unit_list\/$").test(document.URL)){
				window.location.href = window.location.href.slice(0, -1);
			}
			else{
				window.location.href = window.location.href+"/";
			}
		});	
		$("#XE").click(function(){
			XioExport();
		});	
		$("#XI").click(function(){
			XioImport();
		});		
		
		if(new RegExp("\/.*\/main\/company\/view\/[0-9]+\/unit_list\/$").test(document.URL)){
			XioOverview();
		}		
    }
	
	//Top Manager
    if(new RegExp("\/.*\/main\/unit\/view\/[0-9]+$").test(document.URL) && ($(".fa-users").length === 1 || $("[href*='/window/unit/employees/engage/']").length === 1)){
		topManagerStats();
	}
	
	//Preferences
	preference(preferencePages($(document), document.URL));
}

document.onreadystatechange = function () {
    if (document.readyState == "complete") {
        XioScript();
    }
}
document.onreadystatechange();
