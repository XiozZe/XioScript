// ==UserScript==
// @name           XioScript
// @namespace      https://github.com/XiozZe/XioScript
// @description    XioScript using XioMaintenance
// @version        12.0.15
// @require        http://ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js
// @include        http://*virtonomic*.*/*/*
// @exclude        http://virtonomics.wikia.com*
// ==/UserScript==

var version = "12.0.15";

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
var timeinterval = 0;
var optionclick = false;
var mousedown = false;
var $tron;

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
			quality : $html.find("td:has('table'):nth-last-child(5)  tr:nth-child(2) td:nth-child(2)").map(function(){ return numberfy($(this).text()); }).get(),
			primecost : $html.find("td:has('table'):nth-last-child(5)  tr:nth-child(3) td:nth-child(2)").map(function(){ return numberfy($(this).text()); }).get(),
			product : $html.find(".grid a:not([onclick])").map(function(){ return $(this).text(); }).get(),
			productId : $html.find(":checkbox:gt(0)").map(function(){ return numberfy($(this).val()); }).get(),
			region : $html.find(".officePlace a:eq(-2)").text(),
			contractpage : !!$html.find(".tabsub").length,
			contractprice : ($html.find("script:contains(mm_Msg)").text().match(/(\$(\d|\.)+)|(\[\'name\'\]		= \"[a-zA-Zа-яА-ЯёЁ ]+\")/g) || []).map(function(e){ return e[0] === "["? e.slice(13, -1) : numberfy(e); })
		};
	}
	else if(page === "salecontract"){ 
		mapped[url] = {
			contractprice : ($html.find("script:contains(mm_Msg)").text().match(/(\$(\d|\.)+)|(\[\'name\'\]		= \"[a-zA-Zа-яА-ЯёЁ ]+\")/g) || []).map(function(e){ return e[0] === "["? e.slice(13, -1) : numberfy(e); })
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
	else if(page === "tradehall"){
		mapped[url] = {
			stock : $html.find(".nowrap:nth-child(6)").map(function(){ return numberfy($(this).text()); }).get(),			
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
			techLevel : numberfy($html.find(".unit_box:has(.fa-industry) tr:eq(3) td:eq(1)").text()),
			maxEmployees : numberfy($html.find(".unit_box:has(.fa-user) tr:eq(2) td:eq(1)").text()),
			img : $html.find("#unitImage img").attr("src").split("/")[4].split("_")[0],
			hasService : !$html.find("[src='/img/artefact/icons/color/production.gif']").length,
			onHoliday : $html.find("[href$=unset]").length,
			isStore : $html.find("[href$=trading_hall]").length
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
			weekcost : numberfy($html.find("#educationCost").text()),
			employees : numberfy($html.find("#unitEmployeesData_employees").val()),	
			skillNow : numberfy($html.find(".list span:eq(0)").text()),			
			skillCity : numberfy($html.find(".list span:eq(1)").text()),
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
			isHypothesis : !!$html.find("#selectIt").length,
			isBusy : !!numberfy($html.find(".progress_static_bar:eq(1)").text()),
			hypId : $html.find(":radio").map(function(){ return numberfy($(this).val()); }).get(),
			curIndex : $html.find("tr:has([src='/img/v.gif'])").index() - 1,
			chance : $html.find(".grid td.nowrap:nth-child(3)").map(function(){ return numberfy($(this).text()); }).get(),
			time : $html.find(".grid td.nowrap:nth-child(4)").map(function(){ return numberfy($(this).text()); }).get(),
			isAbsent : !!$html.find("b[style='color: red']").length,
			isFactory : !!$html.find("span[style='COLOR: red;']").length,
			unittype : $html.find(":button:eq(2)").attr("onclick") && numberfy($html.find(":button:eq(2)").attr("onclick").split(",")[1]),
			industry : $html.find(":button:eq(2)").attr("onclick") && numberfy($html.find(":button:eq(2)").attr("onclick").split("(")[1]),
			level : numberfy($html.find(".list tr td[style]:eq(0)").text())
		};
	}
	else if(page === "projectcreate"){
		mapped[url] = {
			isContinue : !!$html.find(":submit").length
		};
	}
	else if(page === "experimentalunit"){
		mapped[url] = {
			id : $html.find(":radio").map(function(){ return numberfy($(this).val()); }).get()
		};
	}	
	else if(page === "productreport"){
		mapped[url] = {
			maxed : $html.find(".grid td.nowrap:nth-child(2)").map(function(){ return !!$(this).find("span").length; }).get(),
			quality : $html.find(".grid td.nowrap:nth-child(4)").map(function(){ return numberfy($(this).text()); }).get(),
			price : $html.find(".grid td.nowrap:nth-child(5)").map(function(){ return numberfy($(this).text()); }).get()
		};
	}
}

function xGet(url, page, force, callback){
	
	if($.inArray(url, getUrls) === -1 || force){
				
		if($.inArray(url, getUrls) === -1){
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
	
	var group;
	for(var key in policyJSON){
		if(policyJSON[key].name === type){
			group = policyJSON[key].group;
			break;
		}
	}
	
	var typeArray = [];
	for(var key in policyJSON){
		if(policyJSON[key].group === group){
			typeArray.push(policyJSON[key].name);
		}
	}
	
	xcount[type]--;
	
	var groupcount = 0;
	var maxcount = 0;
	for(var i = 0; i < typeArray.length; i++){
		groupcount += xcount[typeArray[i]];
		maxcount += xmax[typeArray[i]];
	}
	
	$("[id='x"+group+"']").text(maxcount - groupcount);
	if(!xcount[type]){
		if(!groupcount){
			$("[id='x"+group+"done']").text("Done!");
		}		
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
	for(var i in xcount){
		sum += xcount[i];
	}
	
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
	var urlContract = "/"+realm+"/main/unit/view/"+subid+"/sale/product";
	var urlIP = "/"+realm+"/main/geo/countrydutylist/359837";
	var urlTM = "/"+realm+"/main/globalreport/tm/info";
	var urlCTIE = "/"+realm+"/main/geo/regionENVD/359838";
	var urlTrans = "/"+realm+"/main/common/main_page/game_info/transport";
	var urlReport = [];

	var getcount = 0;
	if(choice >= 1){
		getcount++;
		xGet(url, "sale", false, function(){
			!--getcount && phase();
		});
	}
	
	if(choice >= 2){
		getcount = getcount + 2;
		xGet(urlTM, "TM", false, function(){
			!--getcount && phase();
		});
		xGet(urlIP, "IP", false, function(){
			!--getcount && phase();
		});
	}
	
	if(choice === 5 || choice === 6){
		getcount++;
		xGet(urlTrans, "transport", false, function(){
			!--getcount && phase();
		});
	}
	
	function phase(){
		if(choice === 5){
			getcount++;
			xGet(urlCTIE, "CTIE", false, function(){
				!--getcount && post();
			});
		}
		else if(choice === 6){
			getcount++;				
			var indexRegion = mapped[urlTrans].regionName.indexOf(mapped[url].region);
			var regionId = mapped[urlTrans].regionId[ indexRegion ];	
			urlCTIE = "/"+realm+"/main/geo/regionENVD/"+regionId;
			
			xGet(urlCTIE, "CTIE", false, function(){
				!--getcount && post();
			});	
		}
		else if(choice === 7){			
		
			getcount += mapped[url].price.length + 1;
			xGet("/"+realm+"/main/common/util/setpaging/reportcompany/marketingProduct/40000", "none", false, function(){
				!--getcount && post();
			});	
			
			for(var i = 0; i < mapped[url].price.length; i++){
				urlReport.push("/"+realm+"/main/globalreport/marketing/by_products/"+mapped[url].productId[i]);
				xGet(urlReport[i], "productreport", false, function(){
					!--getcount && post();
				});
			}
			
			if(mapped[url].contractpage){
				getcount++;
				xGet(urlContract, "salecontract", false, function(){
					!--getcount && post();
				});
			}
			
		}
		else{
			post();
		}
		
	}
	
	function post(){
		var change = false;
	
		var contractprices = mapped[url].contractpage && mapped[urlContract]? mapped[urlContract].contractprice : mapped[url].contractprice;
				
		for(var i = 0; i < mapped[url].price.length; i++){
			
			if(choice === 1 && mapped[url].price[i] !== 0){
				change = true;
				mapped[url].form.find("input.money:even").eq(i).val(0);
				
			}
			else if(choice === 2){
				var indexFranchise = mapped[urlTM].franchise.indexOf( mapped[url].product[i] );
				var product = mapped[urlTM].product[indexFranchise] || mapped[url].product[i];
				var indexIP = mapped[urlIP].product.indexOf(product);
				var IP = mapped[urlIP].IP[indexIP];
				var price = mapped[url].primecost[i]+0.01 < 30 * IP? mapped[url].primecost[i] + 0.01 : mapped[url].primecost[i];
							
				if(mapped[url].price[i] !== price && mapped[url].primecost[i]){
					change = true;
					mapped[url].form.find("input.money:even").eq(i).val(price);
				}			
			}
			else if(choice === 3){			
				var indexFranchise = mapped[urlTM].franchise.indexOf( mapped[url].product[i] );
				var product = mapped[urlTM].product[indexFranchise] || mapped[url].product[i];
				var indexIP = mapped[urlIP].product.indexOf(product);
				var IP = mapped[urlIP].IP[indexIP];
				
				if(mapped[url].price[i] !== IP){
					change = true;
					mapped[url].form.find("input.money:even").eq(i).val(IP);
				}		
			}
			else if(choice === 4){
				var indexFranchise = mapped[urlTM].franchise.indexOf( mapped[url].product[i] );
				var product = mapped[urlTM].product[indexFranchise] || mapped[url].product[i];
				var indexIP = mapped[urlIP].product.indexOf(product);
				var IP = mapped[urlIP].IP[indexIP];
				
				if(mapped[url].price[i] !== 30*IP){
					change = true;
					mapped[url].form.find("input.money:even").eq(i).val(30*IP);
				}
			}
			else if(choice === 5){
				var indexFranchise = mapped[urlTM].franchise.indexOf( mapped[url].product[i] );
				var product = mapped[urlTM].product[indexFranchise] || mapped[url].product[i];
				var indexIP = mapped[urlIP].product.indexOf(product);
				var IP = mapped[urlIP].IP[indexIP];
				
				var indexCTIE = mapped[urlCTIE].product.indexOf(product);
				var CTIE = mapped[urlCTIE].CTIE[indexCTIE];
				var priceCTIE = mapped[url].primecost[i] * (1 + CTIE/100);
				var price = Math.round(priceCTIE*100)/100;
				price = price < 30 * IP? price: mapped[url].primecost[i];
				
				if(mapped[url].price[i] !== price && mapped[url].primecost[i]){
					change = true;
					mapped[url].form.find("input.money:even").eq(i).val(price);
				}
			}
			else if(choice === 6){
				var indexRegion = mapped[urlTrans].regionName.indexOf(mapped[url].region);
				var regionId = mapped[urlTrans].regionId[indexRegion];
				urlCTIE = "/"+realm+"/main/geo/regionENVD/"+regionId;
				
				var indexFranchise = mapped[urlTM].franchise.indexOf( mapped[url].product[i] );
				var product = mapped[urlTM].product[indexFranchise] || mapped[url].product[i];
				var indexIP = mapped[urlIP].product.indexOf(product);
				var IP = mapped[urlIP].IP[indexIP];
				
				var indexCTIE = mapped[urlCTIE].product.indexOf(product);
				var CTIE = mapped[urlCTIE].CTIE[indexCTIE];
				var priceCTIE = mapped[url].primecost[i] * (1 + CTIE/100 * mapped["/"+realm+"/main/geo/regionENVD/"+regionId].profitTax/100);
				var price = Math.round(priceCTIE*100)/100;
				price = price < 30 * IP? price: mapped[url].primecost[i];
				
				if(mapped[url].price[i] !== price && mapped[url].primecost[i]){
					change = true;
					mapped[url].form.find("input.money:even").eq(i).val(price);
				}
			}
			else if(choice === 7){								
				var indexFranchise = mapped[urlTM].franchise.indexOf( mapped[url].product[i] );
				var product = mapped[urlTM].product[indexFranchise] || mapped[url].product[i];
				var indexIP = mapped[urlIP].product.indexOf(product);
				var IP = mapped[urlIP].IP[indexIP];
								
				var favPQR = Infinity;
				for(var j = 0; j < mapped[urlReport[i]].maxed.length; j++){
					if(!mapped[urlReport[i]].maxed[j]){
						var PQR = mapped[urlReport[i]].price[j] / mapped[urlReport[i]].quality[j];
						if(PQR < favPQR){
							favPQR = PQR;
						}
					}					
				}
				
				var thisproduct = false;
				var highprice = Infinity;
				for(var j = 0; j < contractprices.length; j++){
					if(contractprices[j] === mapped[url].product[i]){
						thisproduct = true;
					}
					else if(typeof contractprices[j] === "string"){
						thisproduct = false;
					}
					else if(thisproduct){
						highprice = Math.min(highprice, contractprices[j]);
					}
					
				}
								
				var price = favPQR * mapped[url].quality[i];					
								
				if(highprice){
					price = Math.min(Math.floor(highprice * 1.09 * 100)/100, price);
					price = Math.max(Math.ceil(highprice * 0.91 * 100)/100, price);
				}			
				
				price = price < 30 * IP? price: mapped[url].primecost[i];
				price = Math.max(price, mapped[url].primecost[i]);
								
				if(mapped[url].price[i] !== price && mapped[url].primecost[i]){
					change = true;
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
		
	xGet(url, "sale", false, function(){
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
	
	
	xGet(url, "prodsupply", false, function(){
		phase();
	});	
	
	function phase(){
		if(choice >= 2 && !mapped[url].isProd){
			xGet(url2, "consume", false, function(){
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
		
	xGet(url, "storesupply", true, function(){
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
		xGet(url, "salary", true, function(){
			!--getcount && post();
		});
	}
	
	if(choice >= 2){
		getcount += 2;
		xGet(urlMain, "main", false, function(){
			!--getcount && post();
		});
		xGet(urlManager, "manager", false, function(){
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
		else if(choice === 4){
			var manager = mapped[urlManager].base[subType[mapped[urlMain].img][2]] + mapped[urlManager].bonus[subType[mapped[urlMain].img][2]];
			var factor3 = subType[mapped[urlMain].img][1];
			var managerNew = manager * calcOverflowTop1(mapped[urlMain].maxEmployees, factor3, manager);	
			var skillReq = calcSkill(mapped[url].employees, subType[mapped[urlMain].img][0], managerNew);
						
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
	
	var urlMain = "/"+realm+"/main/unit/view/"+subid;
	xGet(urlMain, "main", false, function(){
		post();
	});
	
	function post(){
		
		if(choice === 1 && !mapped[urlMain].onHoliday){
			xGet("/"+realm+"/main/unit/view/"+subid+"/holiday_set", "none", false, function(){
				xTypeDone(type);
			});
		}
		else if(choice === 2 && mapped[urlMain].onHoliday){		
			xGet("/"+realm+"/main/unit/view/"+subid+"/holiday_unset", "none", false, function(){
				xTypeDone(type);
			});
		}
		else if(choice === 3){
			
			var urlSupply = "/"+realm+"/main/unit/view/"+subid+"/supply";
			var urlTrade = "/"+realm+"/main/unit/view/"+subid+"/trading_hall";	
			var stockfull;
			
			if(mapped[urlMain].isStore){
				xGet(urlTrade, "tradehall", false, function(){
					
					stockfull = false;
					for(var i = 0; i < mapped[urlTrade].stock.length; i++){
						if(mapped[urlTrade].stock[i]){
							stockfull = true;
						}
					}
					
					if(!mapped[urlTrade].stock.length){
						stockfull = false;
					}
					
					post2();				
				
				});
			}
			else{
				xGet(urlSupply, "prodsupply", false, function(){
					
					stockfull = true;
					for(var i = 0; i < mapped[urlSupply].stock.length; i++){
						if(!mapped[urlSupply].stock[i]){
							stockfull = false;
						}
					}
					
					if(mapped[urlSupply].stock.length !== mapped[urlSupply].required.length){
						stockfull = false;
					}				
					
					post2();
					
				});
			}
			
			function post2(){					
				
				if(!stockfull && !mapped[urlMain].onHoliday){
					xGet("/"+realm+"/main/unit/view/"+subid+"/holiday_set", "none", false, function(){
						xTypeDone(type);
					});
				}
				else if(stockfull && mapped[urlMain].onHoliday){
					xGet("/"+realm+"/main/unit/view/"+subid+"/holiday_unset", "none", false, function(){
						xTypeDone(type);
					});
				}
				else{
					xTypeDone(type);
				}
				
			};
		}	
		else{
			xTypeDone(type);
		}
		
	}
}

function training(type, subid, choice){
	var url = "/"+realm+"/window/unit/employees/education/"+subid;
	var urlValue = "/"+realm+"/ajax/unit/employees/calc_new_lvl_after_train/"+subid;
		
	xGet(url, "training", false, function(){
		phase();
	});	
	
	var expectedSkill = 0;
	
	function phase(){
		
		if(choice === 3){
			xContract(urlValue, "employees="+mapped[url].employees+"&weeks=4", function(data){
				expectedSkill = data.employees_level;
				post();
			});			
		}
		else{
			post();
		}
		
	}
	
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
		else if(choice === 3){
			
			var salaryNew = calcSalary(mapped[url].salaryNow, mapped[url].salaryCity, expectedSkill, mapped[url].skillCity, mapped[url].skillNow);
			var savings = (mapped[url].salaryNow - salaryNew) * 365;
			var costs = mapped[url].weekcost * 4 / mapped[url].employees;
			
			if(savings > costs){
				change = true;
				mapped[url].form.find("#unitEmployeesData_timeCount").val(4);
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
	xGet(urlMain, "main", false, function(){
		!--getcount && phase();
	});	
	
	if(choice === 2){
		getcount += 2;
		xGet(urlSalary, "salary", false, function(){
			!--getcount && phase();
		});
		xGet(urlManager, "manager", false, function(){
			!--getcount && phase();
		});
	}
	
	function phase(){
		getcount += 2;
		xGet("/"+realm+"/window/common/util/setpaging/db"+mapped[urlMain].img+"/equipmentSupplierListByUnit/40000", "none", false, function(){
			!--getcount && phase2();
		});
		var data = "total_price%5Bfrom%5D=&total_price%5Bto%5D=&quality%5Bfrom%5D=&quality%5Bto%5D=&quantity%5Bisset%5D=1&quantity%5Bfrom%5D=1&total_price%5Bfrom%5D=0&total_price%5Bto%5D=0&total_price_isset=0&quality%5Bfrom%5D=0&quality%5Bto%5D=0&quality_isset=0&quantity_isset=1";
		xPost("/"+realm+"/window/common/util/setfiltering/db"+mapped[urlMain].img+"/equipmentSupplierListByUnit", data, function(){
			!--getcount && phase2();
		});
	}
	
	function phase2(){
		
		xGet(url, "equipment", true, function(){
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
				l < offer.low.length && offer.low[l].buy--;				
				
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

			change.length && console.log(change);
			
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
						else{
							fireequip = false;
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
	xGet(url, "tech", false, function(){
		!--getcount && post();
	});
	xGet(urlManager, "manager", false, function(){
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
	
	xGet(url, "main", false, function(){
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
	var urlProject = "/"+realm+"/window/unit/view/"+subid+"/project_create";
	var urlUnit = "/"+realm+"/window/unit/view/"+subid+"/set_experemental_unit";
	var urlForecast = "/"+realm+"/ajax/unit/forecast";

	xGet(url, "research", false, function(){
		
		if(choice === 1 && mapped[url].isFree){
			console.log(mapped[url].isFree);
			xGet(urlProject, "projectcreate", false, function(){
				if(mapped[urlProject].isContinue){
					var data = "industry="+mapped[url].industry+"&unit_type="+mapped[url].unittype+"&level="+(mapped[url].level+1)+"&create=Invent";
					xPost("/"+realm+"/window/unit/view/"+subid+"/project_create", data, function(){
						xTypeDone(type);
					});
				}
				else{
					postMessage("Laboratory <a href="+url+">"+subid+"</a> reached the maximum technology level for its size. Could not research the next level.");
				}				
			});
		}
		else if(choice === 1 && mapped[url].isHypothesis && !mapped[url].isBusy){
			
			function calcProduct(p, n){
				var value = 1;

				for(var m = 1; m <= n-1; m++){
					value = value * (1-(1/100*(m-1)+p));
				}
				return value;
			}   

			function calcStudyTime(p, k){
				//p is possibility between 0 and 1
				//k is reference time between 0 and +infinite    
				var value = 0;

				for(var n = 1; n <= 100*(1-p); n++){
					value += k*n*(1/100*(n-1)+p)*calcProduct(p, n);
				}

				return value;
			}
			
			var favid = -1;
			var favindex = -1;
			var lowtime = Infinity;
			for(var i = 0; i < mapped[url].chance.length; i++){
				var studytime = calcStudyTime(mapped[url].chance[i]/100, mapped[url].time[i]);
				if(studytime < lowtime){
					lowtime = studytime;
					favid = mapped[url].hypId[i];
					favindex = i;
				}
				
			}
			
			if(mapped[url].curIndex !== favindex){
				var data = "selectedHypotesis="+favid+"&selectIt=Select+a+hypothesis";
				xPost(url, data, function(){
					xTypeDone(type);
				});	
			}
			else{
				xTypeDone(type);				
			}
			
		}	
		else if(choice === 1 && (mapped[url].isAbsent || mapped[url].isFactory)){			
			xGet(urlUnit, "experimentalunit", false, function(){
				
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
	xGet(url, "waresupply", true, function(){
		!--getcount && post();
	});
	
	if(choice >= 5){
		getcount += 3;
		xGet("/"+realm+"/window/common/util/setpaging/dbwarehouse/supplyList/40000", "none", false, function(){
			!--getcount && post();
		});
		var data = "total_price%5Bfrom%5D=&total_price%5Bto%5D=&quality%5Bfrom%5D=&quality%5Bto%5D=&quantity%5Bfrom%5D=&free_for_buy%5Bfrom%5D=1&brand_value%5Bfrom%5D=&brand_value%5Bto%5D=";
		xPost("/"+realm+"/window/common/util/setfiltering/dbwarehouse/supplyList", data, function(){
			!--getcount && post();
		});
		xGet("/"+realm+"/window/common/util/setfiltering/dbwarehouse/supplyList/supplierType=all/tm=all", "none", false, function(){
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
						xGet(urlContract, "contract", true, function(){
														
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
								if(toset > 0 && (supplier[k].row >= 0 || supplier[k].index >= 0 && (mapped[url].parcel[supplier[k].index] !== toset || mapped[url].reprice[supplier[k].index]))){
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
		save: ["don't change price", "zero price", "prime cost", "1x IP", "30x IP", "CTIE", "Profit Tax", "Market PQR"], 
		order: ["don't change price", "zero price", "prime cost", "CTIE", "Profit Tax", "1x IP", "30x IP", "Market PQR"],
		name: "priceProd",
		group: "Price",
		wait: []
	},
	pl: {
		func: salePolicy, 
		save: ["don't change policy", "not for sale", "any customer", "my company", "my corporation"], 
		order: ["don't change policy", "not for sale", "any customer", "my company", "my corporation"],
		name: "policy",
		group: "Policy",
		wait: []
	},
	sp: {
		func: prodSupply, 
		save: ["don't change supply", "zero supply", "required", "3x stock"], 
		order: ["don't change supply", "zero supply", "required", "3x stock"],
		name: "supplyProd",
		group: "Supply",
		wait: ["priceProd", "policy", "tech", "equip"]
	},
	ss: {
		func: storeSupply, 
		save: ["don't change supply", "zero supply", "sold", "sold++", "3x stock"], 
		order: ["don't change supply", "zero supply", "sold", "sold++", "3x stock"],
		name: "supplyRetail",
		group: "Supply",
		wait: ["priceProd", "policy"]
	},	
	sw: {
		func: wareSupply,
		save: ["don't change supply", "zero supply", "required", "2x stock", "maximum supply", "required (world)", "2x stock (world)"], 
		order: ["don't change supply", "zero supply", "required", "required (world)", "2x stock", "2x stock (world)", "maximum supply"],
		name: "supplyWare",
		group: "Supply",
		wait: ["supplyProd", "supplyRetail"]
	},
	ad: {
		func: advertisement,
		save: ["don't change ads", "zero ads", "minimum TV ads", "maximum ads"], 
		order: ["don't change ads", "zero ads", "minimum TV ads", "maximum ads"],
		name: "ads",
		group: "Advertisement",
		wait: []
	},
	es: {
		func: salary, 
		save: ["don't change salary", "required salary", "target salary", "maximum salary"], 
		order: ["don't change salary", "required salary", "target salary", "maximum salary"],
		name: "salaryOldInterface",
		group: "Salary",
		wait: ["equip"]
	},	
	en: {
		func: salary, 
		save: ["don't change salary", "required salary", "target salary", "maximum salary", "overflow salary"], 
		order: ["don't change salary", "required salary", "target salary", "maximum salary", "overflow salary"],
		name: "salaryNewInterface",
		group: "Salary",
		wait: ["equip"]
	},
	eh: {
		func: holiday, 
		save: ["don't change holiday", "holiday", "working"], 
		order: ["don't change holiday", "holiday", "working"], 
		name: "holidayElse",
		group: "Holiday",
		wait: []
	},	
	ep: {
		func: holiday, 
		save: ["don't change holiday", "holiday", "working", "has stock"], 
		order: ["don't change holiday", "holiday", "working", "has stock"], 
		name: "holidayProd",
		group: "Holiday",
		wait: ["priceProd"]
	},
	et: {
		func: training, 
		save: ["don't train", "always train", "train city salary", "1 year training"], 
		order: ["don't train", "always train", "train city salary", "1 year training"],
		name: "training",
		group: "Training",
		wait: ["salaryNewInterface", "salaryOldInterface"]
	},
	qp: {
		func: equipment, 
		save: ["don't change equipment", "required equipment", "maximal equipment", "Q2.00 equipment"], 
		order: ["don't change equipment", "Q2.00 equipment", "required equipment", "maximal equipment"],
		name: "equip",
		group: "Equipment",
		wait: ["tech", "research"]
	},
	tc: {
		func: technology,
		save: ["don't change technology", "introduce researched"],
		order: ["don't change technology", "introduce researched"],
		name: "tech",
		group: "Technology",
		wait: []
	},	
	pb: {
		func: prodBooster,
		save: ["don't buy solar panels", "always buy solar panels"],
		order: ["don't buy solar panels", "always buy solar panels"],
		name: "booster",
		group: "Booster",
		wait: []
	},
	rs: {
		func: research,
		save: ["don't start new project", "continue research"],
		order: ["don't start new project", "continue research"],
		name: "research",
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
	
	
	//Main unit page excluding warehouses
    else if(new RegExp("\/.*\/main\/unit\/view\/[0-9]+$").test(url) && !$html.find("[href$=delivery]").length){
		
		var policyArray = [];
		
		//New Interface
		if($html.find(".fa-users").length){		
			policyArray.push("en");
		}
		else{
			policyArray.push("es");
		}
		
		//Has stock holiday
		if($html.find("a[href$=supply]").length){
			policyArray.push("ep");
		}
		else{
			policyArray.push("eh");
		}		
		
		policyArray.push("et");
		
		//Has Equipment
		if($html.find(".fa-cogs").length || $html.find("[href*='/window/unit/equipment/']").length){
			policyArray.push("qp");
		}
		
		return policyArray;
		
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
			var patt = new RegExp("x"+realm+"\\d+");
			if(patt.test(key)){
				subids.push(numberfy(key.match(/\d+/)[0]));
			}
		}
	}
	
	if(!allowedPolicies){
		allowedPolicies = [];
		for(var key in policyJSON){
			allowedPolicies.push(policyJSON[key].group);
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
	var filtersetting = $(".u-s").attr("href") || "/"+realm+"/main/common/util/setfiltering/dbunit/unitListWithProduction/class=0/size=0/type=" + $(".unittype").val();
	xGet("/"+realm+"/main/common/util/setpaging/dbunit/unitListWithProduction/20000", "none", false, function(){
		xGet("/"+realm+"/main/common/util/setfiltering/dbunit/unitListWithProduction/class=0/type=0", "none", false, function(){
			xGet("/"+realm+"/main/company/view/"+companyid+"/unit_list", "unitlist", false, function(){		
				xGet("/"+realm+"/main/common/util/setpaging/dbunit/unitListWithProduction/400", "none", false, function(){
					xGet(filtersetting, "none", false, function(){
						further(mapped[urlUnitlist].subids);
					});
				});
			});
		})
	});
	
	function further(realsubids){
		
		var startedPolicies = [];
		var xgroup = {};
		for(var i = 0; i < subids.length; i++){
			if(realsubids.indexOf(subids[i]) === -1){
				var urlSubid = "/"+realm+"/main/unit/view/"+subids[i];
				postMessage("Subdivision <a href="+urlSubid+">"+subids[i]+"</a> is missing from the company. Options have been erased from the Local Storage");
				ls.removeItem("x"+realm+subids[i]);
				continue;
			}
			var savedPolicyStrings = ls["x"+realm+subids[i]]? ls["x"+realm+subids[i]].split(";") : [];
			for(var j = 0; j < savedPolicyStrings.length; j++){	
				var policy = policyJSON[savedPolicyStrings[j].substring(0, 2)]
				var choice = parseFloat(savedPolicyStrings[j].substring(2));
				if(policy === undefined || !choice || allowedPolicies.indexOf(policy.group) === -1){
					continue;
				}
				
				if(startedPolicies.indexOf(policy.name) === -1){
					startedPolicies.push(policy.name);				
				}
				
				xmax[policy.name] = ++xmax[policy.name] || 1;
				xcount[policy.name] = ++xcount[policy.name] || 1;
				xgroup[policy.group] = ++xgroup[policy.group] || 1;
				
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
				
		for(var key in policyJSON){
			var name = policyJSON[key].name;
			if(startedPolicies.indexOf(name) === -1){
				xcount[name] = 1;
				xmax[name] = 0;
				xTypeDone(name);
			}	
		}
		
		var displayedPolicies = [];
		for(var key in policyJSON){
			var name = policyJSON[key].name;
			var type = policyJSON[key].group;
			if(startedPolicies.indexOf(name) >= 0 && displayedPolicies.indexOf(type) === -1){
				displayedPolicies.push(type);
				$("#XSplit").before( "<tr>"
										+"<td>"+type+"</td>"
										+"<td id='x"+type+"'>0</td>"
										+"<td>of</td>"
										+"<td>"+xgroup[type]+"</td>"
										+"<td id='x"+type+"done' style='color: lightgoldenrodyellow'></td>"
									+"</tr>"
				);
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
				
		var refresh = false;
		var i = 0;
		for(var j = 0; j < subids.length; j++){		
		
			var change = false;
			var subid = subids[j];
		
			var policies = [];
			for(var i = 0; i < data[subid].length; i++){
				var prePages = preferencePages(data[subid][i].html, data[subid][i].url);
				policies.push.apply(policies, prePages);				
			}			
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
			$(document).off(".XO");
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
	$(".unit-list-2014").css("white-space", "nowrap").css("user-select", "none");
		
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
				htmlstring += "<option value="+k+">"+policy.order[k]+"</option>";
			}
			
			$(".unit-list-2014 tr").eq(i+1)
								   .find("td").eq(groupString.indexOf(policy.group)+9)
								   .html(htmlstring + "</select>")
								   .find("select").val(policyChoice);					   
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
	
	$(document).on("mousedown.XO", ".wborder", function(e){
		if(!$(e.target).is('.XioChoice')){
			$(".trXIO").css("backgroundColor", "").filter(".odd").css("backgroundColor", "lightgoldenrodyellow");
			$(".trXIO").removeClass("trXIO");			
			$(this).addClass("trXIO").css("backgroundColor", "#CAE1FF");
			mousedown = true;
			$tron = $(e.target).is("tr")? $(e.target) : $(e.target).parents("tr");			
		}
	  
	});	
	
	$(document).on("mouseup.XO", ".wborder", function(){
		mousedown = false;
	});
	
	$(document).on("mouseover.XO", ".wborder", function(){
		if(mousedown){
			$(".trXIO").css("backgroundColor", "").filter(".odd").css("backgroundColor", "lightgoldenrodyellow");
			$(".trXIO").removeClass("trXIO");
			$this = $(this);	
			if($this.index() < $tron.index()){
				$this.nextUntil($tron).andSelf().add($tron).addClass("trXIO").css("backgroundColor", "#CAE1FF");
			}
			else if($this.index() > $tron.index()){
				$tron.nextUntil($this).andSelf().add($this).addClass("trXIO").css("backgroundColor", "#CAE1FF");
			}
			$this.addClass("trXIO").css("backgroundColor", "#CAE1FF");
		}
	});	
	
	$(document).on('click.XO', "", function(){
		if(optionclick){
			optionclick = false;
		}
	});	
	$(document).on('click.XO', ".XioChoice", function(){	
	
		if(!optionclick){
			optionclick = true;
			return false;
		}	
				
		var thisid = $(this).attr("data-name");
		var choice = policyJSON[thisid].order[$(this).val()];
		var column = $(this).parent().index();	
		
		var arr = $(".trXIO td:nth-child("+(column+1)+") .XioChoice");		
		for(var i = 0; i < arr.length; i++){
			
						
			var type = arr.eq(i).attr("data-name");
			var index = policyJSON[type].save.indexOf(choice);
			var value = policyJSON[type].order.indexOf(choice);
						
			if(index >= 0){
				
				arr.eq(i).val(value);
				var subid = arr.eq(i).attr("data-id");
				savedPolicyStrings = ls["x"+realm+subid]? ls["x"+realm+subid].split(";") : [];	
				savedPolicies = [];
				savedPolicyChoices = [];
				for(var j = 0; j < savedPolicyStrings.length; j++){		
					savedPolicies[j] = savedPolicyStrings[j].substring(0, 2);
					savedPolicyChoices[j] = parseFloat(savedPolicyStrings[j].substring(2));		
				}
				
				savedPolicyChoices[savedPolicies.indexOf(thisid)] = index;
				
				newPolicyString = "";
				for(var j = 0; j < savedPolicies.length; j++){
					newPolicyString += ";"+savedPolicies[j] + savedPolicyChoices[j];
				};
							
				ls["x"+realm+subid] = newPolicyString.substring(1);
				
			}
			
		}
		
		
	});	

	$(document).on('click.XO', "#XioGeneratorPRO", function(){
		XioGenerator(subids);
	});	
	
	$(document).on('click.XO', ".XioGenerator", function(){
		var subid = numberfy($(this).attr("data-id"));
		XioGenerator([subid]);
	});
	
	$(document).on('click.XO', ".XioGroup", function(){
		var allowedPolicies = $(this).attr("data-group");	
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
		var patt = new RegExp("x"+realm+"\\d+");
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
	return Math.pow(5,1+skill) * Math.pow(7, 1-skill) * factor * Math.pow(manager, 2);	
}

function calcSkill(employees, factor, manager){
	return -Math.log(employees/(35*factor*Math.pow(manager, 2)))/Math.log(7/5);
}

function calcEquip(skill){
	return Math.pow(skill, 1.5);
}

function calcTechLevel(manager){
	return Math.pow(manager*156.25, 1/3);
}

function calcTopTech (tech){
	return Math.pow(tech, 3) / 156.25;
}

function calcAllEmployees(factor, manager){
	return 25 * factor * manager * (manager + 3);
}

function calcTop1(empl, qual, factor){
	return Math.pow(5, 1/2*(-1-qual)) * Math.pow(7, 1/2*(-1+qual)) * Math.sqrt(empl / factor);
}

function calcTop3(empl, factor){
	return (-15*factor+Math.sqrt(225*factor*factor + 4*factor*empl))/(10*factor);
}

function calcEfficiency(employees, allEmployees, manager, factor1, factor3, qualification, techLevel){
	
	var effi = [];
	effi[0] = 100;
	effi[1] = manager / calcTop1(employees, qualification, factor1) * calcAllEmployees(factor3, manager) / allEmployees * 100;
	effi[2] = manager / calcTop1(employees, qualification, factor1) * 6/5 * 100;
	effi[3] = calcAllEmployees(factor3, manager) / allEmployees * 6/5 * 100;
	effi[4] = manager / calcTopTech(techLevel) * calcAllEmployees(factor3, manager) / allEmployees * 100;
	effi[5] = manager / calcTopTech(techLevel) * 6/5 * 100;
	
	console.log(effi);
	return (Math.round(Math.min.apply(null, effi)*10)/10).toFixed(2) + "%";
}

function calcOverflowTop1(allEmployees, factor3, manager){
	return Math.max(Math.min(6/5, calcAllEmployees(factor3, manager) / allEmployees), 5/6);
}

function calcOverflowTop3(employees, qualification, techLevel, factor1, manager){
	return Math.max(Math.min(6/5, manager / calcTopTech(techLevel), manager / calcTop1(employees, qualification, factor1)), 5/6);
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
				ov1 = calcOverflowTop1(mapped[here].maxEmployees, factor3, managerTotal);
				ov3 = calcOverflowTop3(mapped[here].employees, mapped[here].skillNow, mapped[here].techLevel, factor1, managerTotal);
								
				$(".unit_box:has(.fa-users) tr:not(:has([colspan])):eq(4) td:eq(1)").append( " (current)"
					+"<div style='color: darkgreen'>"+(Math.floor(calcSkill(mapped[here].employees, factor1, managerBase)*100)/100).toFixed(2)+" (target) </div>"
					+"<div style='color: indigo'>"+(Math.floor(calcSkill(mapped[here].employees, factor1, managerTotal)*100)/100).toFixed(2)+" (maximum) </div>"
					+"<div style='color: crimson'>"+(Math.floor(calcSkill(mapped[here].employees, factor1, managerTotal*ov1)*100)/100).toFixed(2)+" (overflow) </div>"
				);
				
				$(".unit_box:has(.fa-users) tr:not(:has([colspan])):eq(1) td:eq(1)").append( " (current)"
					+"<div style='color: darkgreen'>"+Math.floor(calcEmployees(mapped[here].skillNow, factor1, managerBase)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")+" (target) </div>"
					+"<div style='color: indigo'>"+Math.floor(calcEmployees(mapped[here].skillNow, factor1, managerTotal)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")+" (maximum) </div>"
					+"<div style='color: crimson'>"+Math.floor(calcEmployees(mapped[here].skillNow, factor1, managerTotal*ov1)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")+" (overflow) </div>"
				);
				
				$(".unit_box:has(.fa-user) tr:not(:has([colspan])):eq(2) td:eq(1)").append( " (current)"
					+"<div style='color: darkgreen'>"+Math.floor(calcAllEmployees(factor3, managerBase)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")+" (target) </div>"
					+"<div style='color: indigo'>"+Math.floor(calcAllEmployees(factor3, managerTotal)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")+" (maximum) </div>"
					+"<div style='color: crimson'>"+Math.floor(calcAllEmployees(factor3, managerTotal)*ov3).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")+" (overflow) </div>"
				);
				
				$(".unit_box:has(.fa-cogs) tr:not(:has([colspan])):eq(2) td:eq(1)").append( " (current)"
					+"<div style='color: darkgreen'>"+(Math.floor(calcEquip(calcSkill(mapped[here].employees, factor1, managerBase))*100)/100).toFixed(2)+" (target) </div>"
					+"<div style='color: indigo'>"+(Math.floor(calcEquip(calcSkill(mapped[here].employees, factor1, managerTotal))*100)/100).toFixed(2)+" (maximum) </div>"
					+"<div style='color: crimson'>"+(Math.floor(calcEquip(calcSkill(mapped[here].employees, factor1, managerTotal*ov1))*100)/100).toFixed(2)+" (overflow) </div>"
				);
				
				$(".unit_box:has(.fa-industry) tr:not(:has([colspan])):eq(2) td:eq(1)").append( " (current)"
					+"<div style='color: darkgreen'>"+Math.floor(calcTechLevel(managerBase))+" (target) </div>"
					+"<div style='color: indigo'>"+Math.floor(calcTechLevel(managerTotal))+" (maximum) </div>"
					+"<div style='color: crimson'>"+Math.floor(calcTechLevel(managerTotal*ov1))+" (overflow) </div>"
				);
				
				$(".unit_box:has(.fa-tasks) tr:not(:has([colspan])):eq(7)").after( ""
					+"<tr style='color: blue'><td>Expected top manager efficiency</td><td>"+calcEfficiency(mapped[here].employees, mapped[here].maxEmployees, managerTotal, factor1, factor3, mapped[here].skillNow, mapped[here].techLevel)+"</td></tr>"
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
							
				ov1 = calcOverflowTop1(mapped[here].maxEmployees, factor3, managerTotal);
				ov3 = calcOverflowTop3(mapped[here].employees, mapped[here].skillNow, mapped[here].techLevel, factor1, managerTotal);
										
				placeText($empRow.find("td:eq(1)")," (target)", Math.floor(calcEmployees(qual, factor1, managerBase)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " "), "darkgreen");       
				placeText($empRow.find("td:eq(1)")," (maximum)", Math.floor(calcEmployees(qual, factor1, managerTotal)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " "), "indigo");
				placeText($empRow.find("td:eq(1)")," (overflow)", Math.floor(calcEmployees(qual, factor1, managerTotal*ov1)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " "), "crimson");
				placeText($qualRow.find("td:eq(1)")," (target)", (Math.floor(calcSkill(amount, factor1, managerBase)*100)/100).toFixed(2), "darkgreen");
				placeText($qualRow.find("td:eq(1)")," (maximum)", (Math.floor(calcSkill(amount, factor1, managerTotal)*100)/100).toFixed(2), "indigo");
				placeText($qualRow.find("td:eq(1)")," (overflow)", (Math.floor(calcSkill(amount, factor1, managerTotal*ov1)*100)/100).toFixed(2), "crimson");
				placeText($totalEmpRow.find("td:eq(1)")," (target)", Math.floor(calcAllEmployees(factor3, managerBase)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " "), "darkgreen");
				placeText($totalEmpRow.find("td:eq(1)")," (maximum)", Math.floor(calcAllEmployees(factor3, managerTotal)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " "), "indigo");
				placeText($totalEmpRow.find("td:eq(1)")," (overflow)", Math.floor(calcAllEmployees(factor3, managerTotal)*ov3).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " "), "crimson");
				placeText($equipRow.find("td:eq(1)")," (target)", (Math.floor(calcEquip(calcSkill(amount, factor1, managerBase))*100)/100).toFixed(2), "darkgreen");
				placeText($equipRow.find("td:eq(1)")," (maximum)", (Math.floor(calcEquip(calcSkill(amount, factor1, managerTotal))*100)/100).toFixed(2), "indigo");	
				placeText($equipRow.find("td:eq(1)")," (overflow)", (Math.floor(calcEquip(calcSkill(amount, factor1, managerTotal*ov1))*100)/100).toFixed(2), "crimson");	
				placeText($techRow.find("td:eq(1)")," (target)", Math.floor(calcTechLevel(managerBase)), "darkgreen");
				placeText($techRow.find("td:eq(1)")," (maximum)", Math.floor(calcTechLevel(managerTotal)), "indigo");
				placeText($techRow.find("td:eq(1)")," (overflow)", Math.floor(calcTechLevel(managerTotal*ov1)), "crimson");
				placeText($effiRow.find("td:eq(1)"), " (Expected top Manager efficiency)", calcEfficiency(amount, totalEmp, managerTotal, factor1, factor3, qual, tech), "blue");
				
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
