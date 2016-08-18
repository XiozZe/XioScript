// ==UserScript==
// @name           XioScript
// @namespace      https://github.com/XiozZe/XioScript
// @description    XioScript with XioMaintenance
// @version        12.1.0
// @author		   XiozZe
// @require        http://ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js
// @include        http://*virtonomic*.*/*/*
// @exclude        http://virtonomics.wikia.com*
// ==/UserScript==

let version = "12.1.0";

this.$ = this.jQuery = jQuery.noConflict(true);

//Notes: (TODO-list)
//Holiday laboratory
//Builder moves to close screen?
//Equipment maximal goes over maximal bug
//XSPE supply: what does it do with a very large stock to the threshold formula?
//Dredlyn Russian Translation
//XioOverview smoother with selecting outside box area


let numberfy = function (letiable){
	if(String(letiable) === 'Не огр.' || String(letiable) === 'Unlim.' || String(letiable) === 'Не обм.' || String(letiable) === 'N’est pas limité' || String(letiable) === 'No limitado' || String(letiable) === '无限' || String(letiable) === 'Nicht beschr.') {
  		return Number.POSITIVE_INFINITY;
  	} else {
  		return parseFloat(String(letiable).replace(/[\s\$\%]/g, "")) || 0;
	}
}

//the waiter acts as a barrier: till all the ajax calls related to the variables are not returned, the code will not continue
let waiter = function* (go, ...a){
	let arr = [];
	for(let i = 0; i < a.length; i++){
		if(a[i] instanceof Array){
			arr.push(...a[i]);
		} else {
			arr.push(a[i]);
		}
	}
	let newarr = [];
	yield Promise.all(arr).then((v) => {
		let t = v;
		newarr = [];
		for(let i = 0; i < a.length; i++){
			if(a[i] instanceof Array){
				newarr.push(v.splice(0, a[i].length));
			} else {//if(a[i] instanceof Promise){
				newarr.push(v.splice(0, 1)[0]);
			} /*else{
				console.log('nota');
				newarr.push(undefined);
			}*/
		}
	}).then(go);
	return newarr;	
}

//
Array.prototype.hasChoice = function(index, func){
	for(let i = 0; i < this.length; i++){
		if(func(this[i].choice[index]))
			return true;
	}
	return false;
}

let ls = localStorage;
let processingtime, timeinterval;
let mousedown = false;
let $tron;
const companyid = numberfy($(".dashboard a").attr("href").match(/\d+/)[0]);
let sccount = {};

//doesn't work in FF: script breaks on this
//const Infinity = Number.POSITIVE_INFINITY;

//save the current realm (mary/lien/etc.) in a variable
let ca = document.cookie.split(';'), rlm;
for(let i = 0; i < ca.length; i++){
	let c = ca[i];
	while (c.charAt(0) == ' ') c = c.substring(1, c.length);
	if (c.indexOf("last_realm=") === 0) rlm = c.substring(11, c.length);
}
const realm = rlm;

//all data related to the extraction of DOM elements from the virtonomics page are listed here
//the map function returns an object with useful data extracted from the page
function map(html, url, page){
	
	if(page === "none" || !page){
		return "hollahoop";
	} else if(page === "ajax"){
		return JSON.parse(html);
	}
	
	let $html = $(html);
	if(page === "unitlist"){
		return {
			subids : $html.find(".unit-list-2014 td:nth-child(1):not(.u-ed)").map( (i, e) => numberfy($(e).text()) ).get(),
			type: $html.find(".unit-list-2014 td:nth-child(3)").map( (i, e) => $(e).attr("class").split("-")[1] ).get(),
			country: $html.find(".unit-list-2014 td:nth-child(2):not(.u-n)").map( (i, e) => $(e).attr("class").split("-")[1] ).get(),
			city: $html.find(".unit-list-2014 td:nth-child(2):not(.u-n)").map( (i, e) => $(e).text().trim() ).get(),
			name: $html.find(".unit-list-2014 td:nth-child(3) a").map( (i, e) => $(e).text().trim() ).get(),
			alert:  $html.find(".unit-list-2014 td:nth-child(8)").map( (i, e) => $(e).html().replace(/\s{2,}/g, "") ).get(),
		}
	} 
	else if(page === "main"){
		return {
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
			managerPic : $html.find(".unit_box:has(.fa-user) ul img").attr("src"),
			qual : numberfy($html.find(".unit_box:has(.fa-user) tr:eq(1) td:eq(1)").text()),
			techLevel : numberfy($html.find(".unit_box:has(.fa-industry) tr:eq(3) td:eq(1)").text()),
			maxEmployees : numberfy($html.find(".unit_box:has(.fa-user) tr:eq(2) td:eq(1)").text()),
			img : $html.find("#unitImage img").attr("src").split("/")[4].split("_")[0],
			size : numberfy($html.find("#unitImage img").attr("src").split("_")[1]),
			hasBooster : !$html.find("[src='/img/artefact/icons/color/production.gif']").length,
			onHoliday : !!$html.find("[href$=unset]").length,
			isStore : !!$html.find("[href$=trading_hall]").length,
			departments : numberfy($html.find("tr:contains('Number of departments') td:eq(1)").text()),
			visitors: numberfy($html.find("tr:contains('Number of visitors') td:eq(1)").text()),
		}
	}
	else if(page === "sale"){ 
		return {
			policy : $html.find("select:even").map( (i, e) => $(e).find("[selected]").index() ).get(),
			price : $html.find("input.money:even").map( (i, e) => numberfy($(e).val()) ).get(),
			outqual : $html.find("td:has('table'):nth-last-child(6)  tr:nth-child(2) td:nth-child(2)").map( (i, e) => numberfy($(e).text()) ).get(),
			outprime : $html.find("td:has('table'):nth-last-child(6)  tr:nth-child(3) td:nth-child(2)").map( (i, e) => numberfy($(e).text()) ).get(),
			stockqual : $html.find("td:has('table'):nth-last-child(5)  tr:nth-child(2) td:nth-child(2)").map( (i, e) => numberfy($(e).text()) ).get(),
			stockprime : $html.find("td:has('table'):nth-last-child(5)  tr:nth-child(3) td:nth-child(2)").map( (i, e) => numberfy($(e).text()) ).get(),
			product : $html.find(".grid a:not([onclick])").map( (i, e) => $(e).text() ).get(),
			productId : $html.find(".grid a:not([onclick])").map( (i, e) => numberfy($(e).attr("href").match(/\d+/)[0]) ).get(),
			productData : $html.find("input.money:even").map( (i, e) => $(e).attr("name").split("][")[0]+"]" ).get(),
			volume : $html.find("input.money:odd").map( (i, e) => numberfy($(e).val()) ).get(),
			constraint : $html.find("select").map( (i, e) => numberfy($(e).val()) ).get(),
			region : $html.find(".officePlace a:eq(-2)").text(),
			contractpage : !!$html.find(".tabsub").length,
			contractprice : ($html.find("script:contains(mm_Msg)").text().match(/(\$(\d|\.| )+)|(\[\'name\'\]		= \"[a-zA-Zа-яА-ЯёЁ ]+\")/g) || []).map((e) => e[0] === "["? e.slice(13, -1) : numberfy(e) )
		}
	} 
	else if(page === "salecontract"){ 
		return {
			category : $html.find("#productsHereDiv a").map( (i, e) => $(e).attr("href") ).get(),
			contractprice : ($html.find("script:contains(mm_Msg)").text().match(/(\$(\d|\.| )+)|(\[\'name\'\]		= \"[a-zA-Zа-яА-ЯёЁ ]+\")/g) || []).map( (e) => e[0] === "["? e.slice(13, -1) : numberfy(e) )
		}
	}
	else if(page === "prodsupply"){
		return $html.find(".inner_table").length? {  //new interface
			parcel : $html.find(".quickchange").map( (i, e) => numberfy($(e).val()) ).get(),
			required : $html.find(".list td:nth-child(3).inner_table tr:nth-child(1) td:nth-child(2)").map( (i, e) => numberfy($(e).text()) ).get(),
			stock : $html.find(".list td:nth-child(4).inner_table tr:nth-child(1) td:nth-child(2)").map( (i, e) => numberfy($(e).text()) ).get(),
			basequality : $html.find(".list td:nth-child(4).inner_table tr:nth-child(2) td:nth-child(2)[align]").map( (i, e) => numberfy($(e).text()) ).get(),
			prodid : $html.find(".list tr:has([src='/img/supplier_add.gif']) > td:nth-child(1) a").map( (i, e) => numberfy($(e).attr("href").match(/\d+/)[0]) ).get(),
			offer : $html.find(".destroy").map( (i, e) => numberfy($(e).val()) ).get(),
			price : $html.find(".list tr[onmouseover] table:has(a) tr:nth-child(2) td:nth-child(3)").map( (i, e) => numberfy($(e).text()) ).get(),
			quality : $html.find(".list tr[onmouseover] table:has(a) tr:nth-child(3) td:nth-child(3)").map( (i, e) => numberfy($(e).text()) ).get(),
			available : $html.find(".list tr[onmouseover] table:has(a) tr:nth-child(4) td:nth-child(2)").map( (i, e) => numberfy($(e).text()) ).get(),
			maximum : $html.find(".list td:has(.quicksave)").map( (i, e) => $(e).find("[style='color: red;']").length? numberfy($(e).find("[style='color: red;']").text().match(/(\d|\s)+/)[0]) : Infinity ).get(),
			reprice : $html.find(".list tr[onmouseover] table:has(a) tr:nth-child(2)").map( (i, e) => !!$(e).filter(".ordered_red, .ordered_green").length ).get(),
			mainrow : $html.find(".list tr[onmouseover]").map( (i, e) => !!$(e).find("[alt='Select supplier']").length ).get(),
			nosupplier : $html.find(".list tr[onmouseover]").map( (i, e) => !$(e).find("[src='/img/smallX.gif']").length ).get(),
			img : $html.find("#unitImage img").attr("src").split("/")[4].split("_")[0]
		} : { //old interface
			parcel : $html.find("input[type=type]").map( (i, e) => numberfy($(e).val()) ).get(),
			required : $html.find(".list td:nth-child(2) table tr:nth-child(1) td:nth-child(2)").map( (i, e) => numberfy($(e).text()) ).get(),
			stock : $html.find(".list td:nth-child(3) table tr:nth-child(1) td:nth-child(2)").map( (i, e) => numberfy($(e).text()) ).get(),
			basequality : $html.find(".list td:nth-child(3) table tr:nth-child(2) td:nth-child(2)").map( (i, e) => numberfy($(e).text()) ).get(),
			prodid : $html.find(".list a:has(img)[title]").map( (i, e) => numberfy($(e).attr("href").match(/\d+/)[0]) ).get(),
			offer : $html.find(".destroy").map( (i, e) => numberfy($(e).val()) ).get(),
			price : $html.find("[id^=totalPrice] tr:nth-child(1) td:nth-child(3)").map( (i, e) => numberfy($(e).text()) ).get(),
			quality : $html.find("[id^=totalPrice] tr:nth-child(3) td:nth-child(2)").map( (i, e) => numberfy($(e).text()) ).get(),
			available : $html.find("[id^=quantity] tr:nth-child(2) td:nth-child(2)").map( (i, e) => numberfy($(e).text()) ).get(),
			maximum : $html.find(".list td:has([type=type])").map( (i, e) => $(e).find("[style='color:red']").length? numberfy($(e).find("[style='color:red']").text().match(/(\d|\s)+/)[0]) : Infinity ).get(),
			reprice : $html.find("[id^=totalPrice] tr:nth-child(1)").map( (i, e) => !!$(e).filter("[style]").length ).get(),
			mainrow : $html.find(".list tr[id]").map( (i, e) => !/sub/.test($(e).attr("id")) ).get(),
			nosupplier : $html.find(".list tr[id]").map( (i, e) => !$(e).find("[src='/img/smallX.gif']").length ).get(),
			img : $html.find("#unitImage img").attr("src").split("/")[4].split("_")[0]
		}
		
	}
	else if(page === "manufacture"){
		return $html.find(".unit_box:has('.fa-certificate')").length ? { //new interface
			 bonuses : $html.find(".unit_box:has('.fa-certificate') .mainHintPanel :gt(1)").map( (i, e) => numberfy($(e).text().match(/(\+|\-)\s(\d|\.)+/)[0]) ).get()
		 } : { //old interface
			 bonuses : []
		 }		
	}
	else if(page === "consume"){
		return {
			consump : $html.find(".list td:nth-last-child(1) div:nth-child(1)").map( (i, e) => numberfy($(e).text().split(":")[1]) ).get()
		}
	}
	else if(page === "traderef"){
		return {
			item : $html.find(".list a:has(img)").map( (i, e) => numberfy($(e).attr("href").match(/\d+/)[0]) ).get(),
			department : $html.find(".list a:has(img)").map( (i, e) => $(e).parents("tr").prevUntil(":not([class])").andSelf().prev().filter(":not([class])").text().trim() ).get()
		}
	}
	else if(page === "citymarket"){
		return {
			item : $html.find(".grid tr[class] td a").map( (i, e) => numberfy($(e).attr("href").match(/\d+/)[0]) ).get(),
			localprice : $html.find("td:nth-child(5)").map( (i, e) => numberfy($(e).text()) ).get(),
			localquality : $html.find("td:nth-child(6)").map( (i, e) => numberfy($(e).text()) ).get()
		}
	}
	else if(page === "storesupply"){
		return {
			parcel : $html.find("input:text[name^='supplyContractData[party_quantity]']").map( (i, e) => numberfy($(e).val()) ).get(),
			purchase : $html.find("td.nowrap:nth-child(4)").map( (i, e) => numberfy($(e).text()) ).get(),
			quantity : $html.find("td:nth-child(2) table:nth-child(1) tr:nth-child(1) td:nth-child(2)").map( (i, e) => numberfy($(e).text()) ).get(),
			sold : $html.find("td:nth-child(2) table:nth-child(1) tr:nth-child(5) td:nth-child(2)").map( (i, e) => numberfy($(e).text()) ).get(),
			offer : $html.find(".destroy").map( (i, e) => numberfy($(e).val()) ).get(),
			available : $html.find("td:nth-last-child(2) tr:nth-child(3) td:nth-child(2)").map( (i, e) => numberfy($(e).text()) ).get(),
			max : $html.find("tr:has(.destroy)").map( (i, e) => numberfy($(e).find("span[style='color:red']").text().split(": ")[1]) || Infinity ).get(),
			price : $html.find("td:nth-last-child(3) tr:nth-child(1) td:nth-child(2)").map( (i, e) => numberfy($(e).text()) ).get(),
			reprice : $html.find("td:nth-last-child(3) tr:nth-child(1) td:nth-child(2)").map( (i, e) => !!$(e).find("div").length ).get(),
			quality : $html.find("td:nth-last-child(3) tr:nth-child(2) td:nth-child(2)").map( (i, e) => numberfy($(e).text()) ).get(),
			brand : $html.find("td:nth-last-child(3) tr:nth-child(3) td:nth-child(2)").map( (i, e) => numberfy($(e).text()) ).get(),
			img : $html.find(".noborder td > img").map( (i, e) => $(e).attr("src") ).get(),
			item : $html.find(".noborder tr:nth-child(1) a").map( (i, e) => numberfy($(e).attr("href").match(/\d+/g)[2]) ).get(),
			supplier : $html.find(".noborder tr:nth-child(1) a").map( (i, e) => $(e).attr("href") ).get(),
			subrow : $html.find("tr:has(.destroy)").map( (i, e) => $(e).hasClass("sub_row") ).get(),
			title : $html.find(".title").map( (i, e) => $(e).text() ).get()
		}
	}
	else if(page === "tradehall"){
		return {
			sold : $html.find(".nowrap:nth-child(4)").map( (i, e) => numberfy($(e).text()) ).get(),
			stock : $html.find(".nowrap:nth-child(6)").map( (i, e) => numberfy($(e).text()) ).get(),
			deliver : $html.find(".nowrap:nth-child(5)").map( (i, e) => numberfy($(e).text().split("[")[1]) ).get(),
			report : $html.find(".grid a:has(img):not(:has(img[alt]))").map( (i, e) => $(e).attr("href") ).get(),
			img : $html.find(".grid a img:not([alt])").map( (i, e) => $(e).attr("src") ).get(),
			quality : $html.find("td:nth-child(7)").map( (i, e) => numberfy($(e).text()) ).get(),
			purch : $html.find("td:nth-child(9)").map( (i, e) => numberfy($(e).text()) ).get(),
			price : $html.find(":text").map( (i, e) => numberfy($(e).val()) ).get(),
			name : $html.find(":text").map( (i, e) => $(e).attr("name") ).get(),
			share : $html.find(".nowrap:nth-child(11)").map( (i, e) => numberfy($(e).text()) ).get(),
			cityprice : $html.find("td:nth-child(12)").map( (i, e) => numberfy($(e).text()) ).get(),
			cityquality : $html.find("td:nth-child(13)").map( (i, e) => numberfy($(e).text()) ).get(),
			history : $html.find("a.popup").map( (i, e) => $(e).attr("href") ).get(),
			itemid : $html.find(".grid a:has(img):not(:has(img[alt]))").map( (i, e) => numberfy($(e).attr("href").match(/\d+/)[0]) ).get()
		}
	}
	else if(page === "retailreport"){
		return {
			marketsize : numberfy($html.find("b:eq(1)").text()),
			localprice : numberfy($html.find(".grid .even td:eq(0)").text()),
			localquality : numberfy($html.find(".grid .odd td:eq(0)").text()),
			cityprice : numberfy($html.find(".grid .even td:eq(1)").text()),
			cityquality : numberfy($html.find(".grid .odd td:eq(1)").text())
		}
	}
	else if(page === "pricehistory"){
		return {
			quantity : $html.find(".list td:nth-child(2)").map( (i, e) => numberfy($(e).text()) ).get(),
			price : $html.find(".list td:nth-child(4)").map( (i, e) => numberfy($(e).text()) ).get()
		}
	}
	else if(page === "TM"){
		return {
			product : $html.find(".grid td:odd").map( (i, e) => $(e).clone().children().remove().end().text().trim() ).get(),
			franchise : $html.find(".grid b").map( (i, e) => $(e).text() ).get()
		}
	}
	else if(page === "IP"){
		return {
			product : $html.find(".list td:nth-child(5n-3)").map( (i, e) => $(e).text() ).get(),
			IP : $html.find(".list td:nth-child(5n)").map( (i, e) => numberfy($(e).text()) ).get()
		}
	}
	else if(page === "transport"){
		return {
			countryName : $html.find("select:eq(0) option").map( (i, e) => $(e).text() ).get(),
			countryId : $html.find("select:eq(0) option").map( (i, e) => numberfy($(e).val().split("/")[1]) ).get(),
			regionName : $html.find("select:eq(1) option").map( (i, e) => $(e).text() ).get(),
			regionId : $html.find("select:eq(1) option").map( (i, e) => numberfy($(e).val().split("/")[2]) ).get(),
			cityName : $html.find("select:eq(2) option").map( (i, e) => $(e).text() ).get(),
			cityId : $html.find("select:eq(2) option").map( (i, e) => numberfy($(e).val().split("/")[3]) ).get()			
		}
	}
	else if(page === "CTIE"){
		return {
			product : $html.find(".list td:nth-child(3n-1)").map( (i, e) => $(e).text() ).get(),
			profitTax : numberfy($html.find(".region_data td:eq(3)").text()),
			CTIE : $html.find(".list td:nth-child(3n)").map( (i, e) => numberfy($(e).text()) ).get()
		}
	}
	else if(page === "salary"){
		return {
			employees : numberfy($html.find("#quantity").val()),
			form : $html.filter("form"),
			salaryNow : numberfy($html.find("#salary").val()),
			salaryCity : numberfy($html.find("tr:nth-child(3) > td").text().split("$")[1]),
			skillNow : numberfy($html.find("#apprisedEmployeeLevel").text()),
			skillCity : numberfy($html.find("div span[id]:eq(1)").text().match(/[0-9]+(\.[0-9]+)?/)[0]),
			skillReq : numberfy($html.find("div span[id]:eq(1)").text().split(",")[1].match(/(\d|\.)+/))	
		}	
	}	
	else if(page === "training"){
		return {
			form : $html.filter("form"),
			salaryNow : numberfy($html.find(".list td:eq(8)").text()),
			salaryCity : numberfy($html.find(".list td:eq(9)").text().split("$")[1]),
			weekcost : numberfy($html.find("#educationCost").text()),
			employees : numberfy($html.find("#unitEmployeesData_employees").val()),	
			skillNow : numberfy($html.find(".list span:eq(0)").text()),			
			skillCity : numberfy($html.find(".list span:eq(1)").text()),
		}	
	}
	else if(page === "equipment"){
		return {
			qualNow : numberfy($html.find("#top_right_quality").text()),
			qualReq : numberfy($html.find(".recommended_quality span:not([id])").text()),
			equipNum : numberfy($html.find("#quantity_corner").text()),
			equipMax : numberfy($html.find(".contract:eq(1)").text().split("(")[1].match(/(\d| )+/)[0]),
			equipPerc : numberfy($html.find("#wear").text()),
			price : $html.find(".digits:contains($):odd:odd").map( (i, e) => numberfy($(e).text()) ).get(),
			qualOffer : $html.find(".digits:not(:contains($)):odd").map( (i, e) => numberfy($(e).text()) ).get(),
			available : $html.find(".digits:not(:contains($)):even").map( (i, e) => numberfy($(e).text()) ).get(),
			offer : $html.find(".choose span").map( (i, e) => numberfy($(e).attr("id")) ).get(),
			img : $html.find(".rightImg").attr("src"),
			filtername : $html.find("[name=doFilterForm]").attr("action").match(/db.*?\//)[0].slice(2, -1)
		}		
	}
	else if(page === "manager"){
		return {
			base : $html.find("input:text[readonly]").map( (i, e) => numberfy($(e).val()) ).get(),
			bonus : $html.find(".grid:eq(1) td:nth-child(5)").map( (i, e) => numberfy($(e).text()) ).get(),
			pic : $html.find(".grid img").map( (i, e) => $(e).attr("src") ).get()
		}
	}
	else if(page === "tech"){ 
		return $html.find(".rounded-table").length? {
			curlevel : numberfy($html.find(".rounded-table .current_row .level_field").text().match(/\d+/)[0]),
			level : $html.find(".rounded-table .level_field").map( (i, e) => numberfy($(e).text().match(/\d+/)[0]) ),
			yours : $html.find(".rounded-table tr:has(.level_field)").map( (i, e) => !$(e).find(".small_button").length ),
			img : $html.find("#unitImage img").attr("src").split("/")[4].split("_")[0]
		} :	{
			curlevel : numberfy($html.find(".list tr.disabled div:eq(0)").text().match(/\d+/)[0]),
			level : $html.find(".list td:nth-child(1)").map( (i, e) => numberfy($(e).text().match(/\d+/)[0]) ).get(),
			yours : $html.find("tr td.nowrap:nth-child(2)").map( (i, e) => !numberfy($(e).text()) ).get(),
			img : $html.find("#unitImage img").attr("src").split("/")[4].split("_")[0]
		};
	}	
	else if(page === "techlist"){
		return {
			subid : $html.find(".list_sublink:not([style])").map( (i, e) => numberfy($(e).attr("href").match(/\d+/)[0] ) ).get(),
			level : $html.find(".list td[align]").map( (i, e) => numberfy($(e).text().match(/\d+/)[0]) ).get(),
			type : $html.find(".list tr[class] img[alt]").map( (i, e) => $(e).attr("src").split("/")[3].split(".")[0] ).get()
		}
	}
	else if(page === "products"){
		return {
			name : $html.find(".list td:nth-child(2n):has(a)").map( (i, e) => $(e).text() ).get(),
			id : $html.find(".list td:nth-child(2n) a:nth-child(1)").map( (i, e) => numberfy($(e).attr("href").match(/\d+/)[0]) ).get()
		}
	}
	else if(page === "waresupply"){
		return {			
			form : $html.find("[name=supplyContractForm]"),
			contract : $html.find(".p_title").map( (i, e) => $(e).find("a:eq(1)").attr("href") ).get(),			
			id : $html.find(".p_title").map( (i, e) => numberfy($(e).find("a:eq(1)").attr("href").match(/\d+$/)[0]) ).get(),
			type : $html.find(".p_title").map( (i, e) => $(e).find("strong:eq(0)").text() ).get(),
			stock : $html.find(".p_title table").map( (i, e) => $(e).find("strong").length >= 2? numberfy($(e).find("strong:eq(0)").text()) : 0 ).get(),			
			shipments : $html.find(".p_title table").map( (i, e) => $(e).find("strong").length === 1? numberfy($(e).find("strong:eq(0)").text()) : numberfy($(e).find("strong:eq(2)").text()) ).get(),
			parcel : $html.find("input:text[name^='supplyContractData[party_quantity]']").map( (i, e) => numberfy($(e).val()) ).get(),
			product : $html.find("tr:has(input:text[name])").map( (i, e) => $(e).prevAll(".p_title:first").find("strong:eq(0)").text() ).get(),
			price : $html.find("tr:has(input) td:nth-child(4)").map( (i, e) => numberfy($(e).text().match(/(\d|\.|\s)+$/)) ).get(),
			reprice : $html.find("tr:has(input) td:nth-child(4)").map( (i, e) => !!$(e).find("span").length ).get(),
			quality : $html.find("tr:has(input) td:nth-child(6)").map( (i, e) => numberfy($(e).text()) ).get(),
			offer : $html.find("tr input:checkbox").map( (i, e) => numberfy($(e).val()) ).get(),
			available : $html.find("tr:has(input) td:nth-child(9)").map( (i, e) => $(e).text().split(/\s[a-zA-Zа-яА-ЯёЁ]+\s/).reduce( (a, b) => Math.min(a, b.match(/\d+/) === null? Infinity : numberfy(b.match(/(\d| )+/)[0])), Infinity) ).get(),
			myself : $html.find("tr:has(input)[class]").map( (i, e) => !!$(e).find("strong").length ).get(),
			contractAdd : $html.find(".add_contract a:has(img)").map( (i, e) => $(e).attr("href") ).get(),	
			idAdd : $html.find(".add_contract a:has(img)").map( (i, e) => numberfy($(e).attr("href").match(/\d+$/)[0]) ).get(),	
			typeAdd : $html.find(".add_contract img").map( (i, e) => $(e).attr("alt") ).get(),
		}
	}	
	else if(page === "contract"){
		return {
			available : $html.find(".price_w_tooltip:nth-child(4)").map( (i, e) => numberfy($(e).find("i").remove().end().text()) ).get(),
			offer : $html.find(".unit-list-2014 tr[id]").map( (i, e) => numberfy($(e).attr("id").match(/\d+/)[0]) ).get(),
			price : $html.find(".price_w_tooltip:nth-child(6)").map( (i, e) => numberfy($(e).text()) ).get(),
			quality : $html.find("td:nth-child(7)").map( (i, e) => numberfy($(e).text()) ).get(),
			brand : $html.find("td:nth-child(8)").map( (i, e) => numberfy($(e).text()) ).get(),
			tm : $html.find(".unit-list-2014 td:nth-child(1)").map( (i, e) => $(e).find("img").length ? $(e).find("img").attr("title") : "" ).get(),
			company : $html.find("td:has(i):not([class])").map( (i, e) => $(e).find("b").text() ).get(),
			myself : $html.find(".unit-list-2014 tr[id]").map( (i, e) => !!$(e).filter(".myself").length ).get(),
			product : $html.find("img:eq(0)").attr("title")
		}
	}
	else if(page === "research"){
		return {
			isFree : !$html.find(".cancel").length,
			isHypothesis : !!$html.find("#selectIt").length,
			isBusy : !!numberfy($html.find(".grid .progress_static_bar").text()),
			hypId : $html.find(":radio").map( (i, e) => numberfy($(e).val()) ).get(),
			curIndex : $html.find("tr:has([src='/img/v.gif'])").index() - 1,
			chance : $html.find(".grid td.nowrap:nth-child(3)").map( (i, e) => numberfy($(e).text()) ).get(),
			time : $html.find(".grid td.nowrap:nth-child(4)").map( (i, e) => numberfy($(e).text()) ).get(),
			isAbsent : !!$html.find("b[style='color: red']").length,
			isFactory : !!$html.find("span[style='COLOR: red']").length,
			unittype : $html.find(":button:eq(2)").attr("onclick") && numberfy($html.find(":button:eq(2)").attr("onclick").split(",")[1]),
			industry : $html.find(":button:eq(2)").attr("onclick") && numberfy($html.find(":button:eq(2)").attr("onclick").split("(")[1]),
			level : numberfy($html.find(".list tr td[style]:eq(0)").text())
		}
	}
	else if(page === "experimentalunit"){
		return {
			id : $html.find(":radio").map( (i, e) => numberfy($(e).val()) ).get()
		}
	}	
	else if(page === "productreport"){
		return {
			max : $html.find(".grid td.nowrap:nth-child(2)").map( (i, e) => numberfy($(e).text().split(":")[1]) ).get(),
			total : $html.find(".grid td.nowrap:nth-child(2)").map( (i, e) => numberfy($(e).text()) ).get(),
			available : $html.find(".grid td.nowrap:nth-child(3)").map( (i, e) => numberfy($(e).text()) ).get(),
			quality : $html.find(".grid td.nowrap:nth-child(4)").map( (i, e) => numberfy($(e).text()) ).get(),
			price : $html.find(".grid td.nowrap:nth-child(5)").map( (i, e) => numberfy($(e).text()) ).get(),
			subid : $html.find(".grid td:nth-child(1) td:nth-child(1) a").map( (i, e) => numberfy($(e).attr("href").match(/\d+/)[0]) ).get()
		}
	}
	else if(page === "financeitem"){
		return {
			energy : numberfy($html.find(".list tr:has(span[style]) td:eq(1)").text()),
		}
	}
	else if(page === "size"){
		return {
			size : $html.find(".nowrap:nth-child(2)").map( (i, e) => numberfy($(e).text()) ).get(),
			rent : $html.find(".nowrap:nth-child(3)").map( (i, e) => numberfy($(e).text()) ).get(),
			id : $html.find(":radio").map( (i, e) => numberfy($(e).val()) ).get()
		}
	}
	else if(page === "waremain"){
		return {
			size : numberfy($html.find(".infoblock td:eq(1)").text()),
			full : numberfy($html.find("[nowrap]:eq(0)").text()),
			product : $html.find(".grid td:nth-child(1)").map( (i, e) => $(e).text() ).get(),
			stock : $html.find(".grid td:nth-child(2)").map( (i, e) => numberfy($(e).text()) ).get(),
			shipments : $html.find(".grid td:nth-child(6)").map( (i, e) => numberfy($(e).text()) ).get(),			
		}
	}
	else if(page === "ads"){
		return {
			pop : numberfy($html.find("script").text().match(/params\['population'\] = \d+/)[0].substring(23)),
			budget : numberfy($html.find(":text:not([readonly])").val()),
			requiredBudget : numberfy($html.find(".infoblock tr:eq(1) td:eq(1)").text().split("$")[1])
		}
	}
	else if(page === "employees"){
		return {
			subid : $html.find(".list tr:gt(2) :checkbox").map( (i, e) => numberfy($(e).attr("id").substring(5)) ).get(),
			type : $html.find(".list td[class]:nth-child(3)").map( (i, e) => $(e).attr("class").split("-")[2] ).get(),
			city : $html.find(".u-a b").map( (i, e) => $(e).text() ).get(),
			emplWrk : $html.find(".list td:nth-child(5).nowrap").map( (i, e) => numberfy($(e).text()) ).get(),
			emplMax : $html.find(".list td:nth-child(6).nowrap").map( (i, e) => numberfy($(e).text()) ).get(),
			salaryWrk : $html.find(".list td:nth-child(7)").map( (i, e) => numberfy($(e).find("span").remove().end().text()) ).get(),
			salaryCity : $html.find(".list td:nth-child(8)").map( (i, e) => numberfy($(e).text()) ).get(),
			skillWrk : $html.find(".list td:nth-child(9)").map( (i, e) => numberfy($(e).text()) ).get(),
			skillReq : $html.find(".list td:nth-child(10)").map( (i, e) => numberfy($(e).text()) ).get(),
			onHoliday : $html.find(".list td:nth-child(11)").map( (i, e) => !!$(e).find(".in-holiday").length ).get(),
			onTraining : $html.find("tr:has(.u-a)").map( (i, e) => !!$(e).find(".sizebar").length ).get(),
			efficiency : $html.find(".list td:nth-child(11)").map( (i, e) => $(e).text().trim() ).get()
		};
	}
	else if(page === "holiday"){
		return {
			subid : $html.find(".list tr:gt(2) :checkbox").map( (i, e) => numberfy($(e).attr("id").substring(5)) ).get(),
			skillCity : $html.find(".list td:nth-child(9)").map( (i, e) => numberfy($(e).text()) ).get()
		}
	}
	else if(page === "promotion"){
		return {
			id : $html.find(".grid tr[onmouseover] a").map( (i, e) => numberfy($(e).attr("href").match(/\d+/)[0]) ).get(),
			buyers : $html.find(".grid .nowrap:nth-child(8)").map( (i, e) => numberfy($(e).text()) ).get(),
			delta : $html.find(".grid .nowrap:nth-child(8)").map( (i, e) => numberfy($(e).text().split("(")[1]) ).get()
		}
	}
	else if(page === "machines"){
		return {
			id : $html.find(":checkbox[name]").map( (i, e) => numberfy($(e).val()) ).get(),
			subid : $html.find(":checkbox[name]").map( (i, e) => numberfy($(e).attr("id").split("_")[1]) ).get(),
			type : $html.find(".list td[class]:nth-child(3)").map( (i, e) => $(e).attr("class").split("-")[2] ).get(),
			num : $html.find(".list td[class]:nth-child(4)").map( (i, e) => numberfy($(e).text()) ).get(),
			perc : $html.find("td:nth-child(8)").map( (i, e) => numberfy($(e).text()) ).get(),
			black : $html.find("td:nth-child(8)").map( (i, e) => numberfy($(e).text().split("(")[1]) ).get(),
			red : $html.find("td:nth-child(8)").map( (i, e) => numberfy($(e).text().split("+")[1]) ).get(),
			quality : $html.find("td:nth-child(6).nowrap").map( (i, e) => numberfy($(e).text()) ).get(),
			required : $html.find("td:nth-child(7)").map( (i, e) => numberfy($(e).text()) ).get()
		}
	}
	else if(page === "animals"){
		return {
			id : $html.find(":checkbox[name]").map( (i, e) => numberfy($(e).val()) ).get(),
			subid : $html.find(":checkbox[name]").map( (i, e) => numberfy($(e).attr("id").split("_")[1]) ).get(),
			type : $html.find(".list td[class]:nth-child(3)").map( (i, e) => $(e).attr("class").split("-")[2] ).get(),
			num : $html.find(".list td[class]:nth-child(4)").map( (i, e) => numberfy($(e).text()) ).get(),			
			quality : $html.find("td:nth-child(6)").map( (i, e) => numberfy($(e).text()) ).get(),
			perc : $html.find("td:nth-child(7)").map( (i, e) => numberfy($(e).text()) ).get(),
			black : $html.find("td:nth-child(7)").map( (i, e) => numberfy($(e).text().split("(")[1]) ).get(),
			red : $html.find("td:nth-child(7)").map( (i, e) => numberfy($(e).text().split("+")[1]) ).get()
		}
	}
	else if(page === "cityoverview"){
		return {
			city : $html.find(".geo > a").map( (i, e) => $(e).text() ).get(),
			skill : $html.find(".unit-list-2014 td:nth-child(4)").map( (i, e) => numberfy($(e).text()) ).get()
		}
	}
	else if(page === "regionoverview"){
		return {
			region : $html.find(".geo > a").map( (i, e) => $(e).text() ).get(),
			ptax : $html.find(".unit-list-2014 td:nth-child(9)").map( (i, e) => numberfy($(e).text()) ).get()
		}
	}
	else if(page === "prodhistory"){
		return {
			quality : $html.find(".list tr[class] td:nth-child(4)").map( (i, e) => numberfy($(e).text()) ).get()
		}
	}
	else if(page === "specchange"){
		return {
			idMaterial : $html.find("tr:has([checked]) td:nth-child(5) a:has(img)").map( (i, e) => numberfy($(e).attr("href").match(/\d+/)[0]) ).get(),
			idProduct : $html.find("tr:has([checked]) td:nth-child(6) a:has(img)").map( (i, e) => numberfy($(e).attr("href").match(/\d+/)[0]) ).get(),
			shareMaterial : $html.find("tr:has([checked]) td:nth-child(5) table[align]").map( (i, e) =>  numberfy(eval($(e).text().match(/(\d|\/)+/)[0])) ).get(),
			shareProduct : $html.find("tr:has([checked]) td:nth-child(6) table[align]").map( (i, e) =>  numberfy(eval($(e).text().match(/(\d|\/)+/)[0])) ).get()
		}
	}
}


function xGet(url, page){	
	
	return new Promise( function(resolve, reject){
	
		$.ajax({
			url: url,				
			type: "GET",

			success: function(html, status, xhr){	
				sccount.get++;		
				servercalls();
				resolve(map(html, url, page));
			},

			error: function(xhr, status, error){
				sccount.get++;			
				servercalls();
				//Resend ajax
				setTimeout(() => {
					$.ajax(this);
				}, 3000);
			}			
		});	
	
	});
	
}

function xPost(url, data, count, datatype="text"){
		
	return new Promise( function(resolve, reject){	
	
		$.ajax({
			url: url,	
			data: data,
			type: "POST",
			datatype: datatype,

			success: function(html, status, xhr){
				sccount.post++;	
				if(count)
					sccount[count]++;
				servercalls();
				resolve(html);
			},

			error: function(xhr, status, error){
				sccount.post++;	
				if(count)
					sccount[count]++;		
				servercalls();
				//Resend ajax
				setTimeout(() => {
					$.ajax(this);
				}, 3000);
			}
		});
	});
	
}

//the TOP1 modifier, TOP3 modifier and the img for the top manager page
let subType = {
	mine: [8, 8, "/img/qualification/mining.png"],	
	power: [6, 6, "/img/qualification/power.png"],
	coal_power: [6, 6, "/img/qualification/power.png"],
	workshop: [4, 4, "/img/qualification/manufacture.png"],	
	sawmill: [4, 4, "/img/qualification/manufacture.png"],
	farm: [1.6, 1.6, "/img/qualification/farming.png"],
	orchard: [1.2, 1.2, "/img/qualification/farming.png"],				
	medicine: [1, 1, "/img/qualification/medicine.png"],
	fishingbase: [1, 1, "/img/qualification/fishing.png"],				
	animalfarm: [0.6, 0.6, "/img/qualification/animal.png"],
	lab: [0.4, 0.4, "/img/qualification/research.png"],
	mill: [0.4, 4, "/img/qualification/manufacture.png"],
	restaurant: [0.4, 0.4, "/img/qualification/restaurant.png"],
	shop: [0.4, 0.4, "/img/qualification/trade.png"],
	repair: [0.2, 0.2, "/img/qualification/car.png"],
	fuel: [0.2, 0.2, "/img/qualification/car.png"],
	service: [0.12, 0.12, "/img/qualification/service.png"],
	service_light: [0.12, 0.12, "/img/qualification/service.png"],
	office: [0.08, 0.08, "/img/qualification/management.png"]
}

function postMessage(html){
	$("#XMproblem").append("<div>"+html+"</div>");
}

//gives the option names to the option categories
let optionJSON = {			
	pc1 : {
		opt: [["Zero", "$0.01", "Prime Cost", "CTIE", "Profit Tax", "1x IP", "30x IP"], ["Stock", "Output"], ["Set", "Hold"]], 
		tag: "Price",
	},
	pc2 : {
		opt: [["Zero", "$0.01", "Prime Cost", "CTIE", "Profit Tax", "1x IP", "30x IP"], ["Set", "Hold"]], 
		tag: "Price",
	},
	pc3 : {
		opt: [["Zero", "Market", "Sales", "Turnover", "Stock", "Local", "City"], ["P x0.0", "P x1.0", "P x1.1", "P x1.4", "P x2.0"]], 
		tag: "Price",
	},
	pl1 : {
		opt: [["No sale", "Any", "Company", "Corp."], ["All", "Output"]], 
		tag: "Policy",
	},
	pl2 : {
		opt: [["No sale", "Any", "Company", "Corp."]], 
		tag: "Policy",
	},
	s1 : {
		opt: [["Zero", "Required", "Economical", "Excessive"], ["PQR", "Price", "Quality"]], 
		tag: "Supply",
	},
	s2 : {
		opt: [["Zero", "Required", "Stock", "Service"]], 
		tag: "Supply",
	},
	s3 : {
		opt: [["Zero", "Required", "Stock", "Enhance", "Nuance", "Maximum"]], 
		tag: "Supply",
	},
	s4 : {
		opt: [["Zero", "Sold", "Amplify", "Stock", "Enhance"], ["None", "One", "$1 000", "$1 000 000", "Market 1%", "Market 5%", "Market 10%"], ["Any Q", "Local Q", "City Q"]], 
		tag: "Supply",
	},
	ad : {
		opt: [["Zero", "Min", "Max", "Pop", "Req"]], 
		tag: "Ads",
	},
	es : {
		opt: [["Required", "Target", "Maximum", "Overflow"], ["Free", "Safe", "Secure"]], 
		tag: "Salary",
	},
	eh1 : {
		opt: [["Holiday", "Work"]], 
		tag: "Holiday",
	},
	eh2 : {
		opt: [["Holiday", "Work", "Stock"]], 
		tag: "Holiday",
	},
	et : {
		opt: [["Always", "80% City", "100% City", "EcoLimit", "Year Plan"]], 
		tag: "Training"
	},
	q1 : {
		opt: [["Required", "Maximal"], ["Black", "Full", "Perc"]], 
		tag: "Equipment",
	},
	q2 : {
		opt: [["Q2.00"]], 
		tag: "Equipment",
	},
	tc : {
		opt: [["Target", "Maximum"]], 
		tag: "Tech",
	},
	rs : {
		opt: [["Target", "Maximum", "Infinite"], ["Highest", "Fastest", "Smartest"]], 
		tag: "Research",
	},
	sl : {
		opt: [["Always", "Profitable"]], 
		tag: "Solar",
	},
	sz : {
		opt: [["Packed", "Full"]], 
		tag: "Size",
	}
}		

//determines which option categories are available based on the subdivision type	
let choiceJSON = {
	"mine" : ["pc1", "pl1", "es", "eh1", "et", "q1", "tc"], 
	"orchard" : ["pc1", "pl1", "es", "eh1", "et", "q1", "tc"], 
	"animalfarm" : ["pc1", "pl1", "s1", "es", "eh1", "et", "tc"],
//			"mill" : [price1, price2, price3, policy1, policy2, supply1], 
	"warehouse" : ["pc2", "pl1", "s3", "sz"], 
	"shop" : ["pc3", "s4", "ad", "es", "eh1", "et"], 
	"lab" : ["es", "eh1", "et", "q1", "rs"], 
	"workshop" : ["pc1", "pl1", "s1", "es", "eh1", "et", "q1", "tc", "sl"], 
	"office" : ["es", "eh1", "et", "q1"], 
	"farm" : ["pc1", "pl1", "es", "eh1", "et", "q1", "tc"], 
//			"sawmill" : [price1, price2, price3, policy1, policy2], 
//			"medicine" : [], 
	"fishingbase" : ["pc1", "pl1", "es", "eh1", "et", "q1", "tc"], 
//			"restaurant" : [], 
	"oilpump" : ["pc1", "pl1", "es", "eh1", "et", "q1", "tc"], 
//			"fitness" : [], 
//			"coal_power" : [], 
//			"fuel" : [], 
//			"incinerator_power", 
//			"repair", 
//			"oil_power", 
	"apiary" : ["pc1", "pl1", "s1", "es", "eh1", "et", "tc"], 
//			"hairdressing", 
//			"laundry"
}

//change the saved options in the localstorage to a readable object
//while simultaneously add and remove new subdivisions to the data if needed
function Update(list){
	//list is an array with subids and type extracted from the unit list
	
	if(!ls["XS"+realm])
		ls["XS"+realm] = "";
	
	if(!ls.XSchoice)
		ls.XSchoice = JSON.stringify(choiceJSON);
		
	let data = ls["XS"+realm].split(";");
	let subs = {};
	
	//make it able to read the data by subids
	for(let i = 0; i < data.length; i++){
		subs[numberfy(data[i].split("-")[0])] = data[i].split("-")[1];			
	}
	
	//if data is empty
	delete subs[0];
	
	//does the data has to be updated?
	let change = false;
	
	//if there has been a choiceJSON update: update
	if(ls.XSchoice !== JSON.stringify(choiceJSON))
		change = true;	
	
	let opt = {};
	//fill opt with all possible options
	for(let key in optionJSON){
		opt[key] = [];
	}	
	
	for(let i = 0; i < list.subids.length; i++){
		
		let s = list.subids[i];
		let t = list.type[i];
		let oldJSON = JSON.parse(ls.XSchoice);
				
		//create new data entrance if the subid is not in the saved data, or is updated
		if(choiceJSON[t] && !subs[s] || JSON.stringify(choiceJSON[t]) !== JSON.stringify(oldJSON[t]) ){
			subs[s] = "";
			for(let j = 0; j < choiceJSON[t].length; j++){
				for(let k = 0; k < optionJSON[choiceJSON[t][j]].opt.length; k++){
					change = true;
					subs[s] += k === 0? "0" : "1";
				}
			}
		}
		//remove data entrance if the option is not available in XioScript anymore
		else if(!choiceJSON[t] && subs[s]){
			change = true;
			delete subs[s];				
		}
		
		//the 'x' is the current position in the data-saved option string
		let x = 0;
				
		//organise the choices by option, instead of by subid		
		if(choiceJSON[t]){
			for(let j = 0; j < choiceJSON[t].length; j++){				
				let plc = choiceJSON[t][j];	
				let charr = [];
				for(let k = 0; k < optionJSON[plc].opt.length; k++){
					charr.push(numberfy(subs[s].slice(x, x+1)));
					x++;
				}
				opt[plc].push({
					subid : s,
					choice : charr
				});
			}
		}		
	}
	
	//update data, if needed
	if(change){
		let newdata = "";			
		for(let key in subs){
			newdata += key + "-" + subs[key] + ";";
		}
		newdata = newdata.slice(0, -1);
		ls["XS"+realm] = newdata;
		ls.XSchoice = JSON.stringify(choiceJSON);
	}
	
	return opt;
	
}

//some function I got from the internet
//don't ask me how it works, but it works
//it's needed for running generator functions (functions with a *)
function runG(gen){
	let gen2 = gen(resume);
	function resume(cbadd, cbVal){
		gen2.next(cbadd);
	}	
	gen2.next();
}

//keep track of all the great things the script has done
function servercalls(){
	
	if(sccount.sale === undefined){
		$.extend(sccount, {
			phase : 0,
			post : 0,
			get : 0,
			qdeals : 0,
			qrepair : 0,
			qreplace : 0,
			qprice : 0,
			sale : 0,
			supply : 0,
			tech : 0,
			salary : 0,
			train : 0,
			holiday : 0,
			hypothesis : 0,
			research : 0,
			attach : 0
		});
	}
	
	$("#XioSalePage").text(sccount.sale);	
	$("#XioPSupply").text(sccount.supply);	
	$("#XioTechs").text(sccount.tech);		
	$("#XioHoliday").text(sccount.holiday);
	$("#XioQDeals").text(sccount.qdeals);
	$("#XioQRepair").text(sccount.qrepair);	
	$("#XioQReplace").text(sccount.qreplace);
	$("#XioQPrice").text("$ "+sccount.qprice.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " "));		
	$("#XioSalary").text(sccount.salary);
	$("#XioTraining").text(sccount.train);
	$("#XioResearch").text(sccount.research);
	$("#XioHypothesis").text(sccount.hypothesis);
	$("#XioAttach").text(sccount.attach);
	$("#XioGetCalls").text(sccount.get);
	$("#XioPostCalls").text(sccount.post);
	$("#XioServerCalls").text(sccount.get + sccount.post);	
	$("#XioPhase").text(sccount.phase);
}

//this is where all the magic happens~
//it's GLORIOUS
function* XioMaintenance(go){
	
	console.log("XM!");
	let processingtime = new Date().getTime();
	let timeinterval = setInterval(() => {	
		let time = new Date().getTime();
		let minutes = (time-processingtime)/1000/60;
		$("#XioMinutes").text(Math.floor(minutes));
		$("#XioSeconds").text(Math.round((minutes - Math.floor(minutes))*60));	
	}, 1000);	
	
	$(".XioGo").attr("disabled", true);	
	$(".XioProperty").remove();
	
	sccount.sale = undefined;
	
	//HTML 
	//{
	let tablestring = `
		<div id=XMtabletitle class=XioProperty style='font-size: 24px; color:gold; margin-bottom: 5px; margin-top: 15px;'>XS 12 Maintenance Log</div>
		<table id=XMtable class=XioProperty style='font-size: 18px; color:gold; border-spacing: 10px 0; margin-bottom: 18px'>
			<tr id=XSplit></tr>
			<tr>
				<td>Sale Page Updates: </td>
				<td id=XioSalePage>0</td>
				<td>Equipment Deals: </td>
				<td id=XioQDeals>0</td>
			</tr>
			<tr>
				<td>Supply Renewals: </td>
				<td id=XioPSupply>0</td>
				<td>Equipment Repaired: </td>
				<td id=XioQRepair>0</td>
			</tr>
			<tr>
				<td></td>
				<td></td>
				<td>Equipment Replaced: </td>
				<td id=XioQReplace>0</td>
			</tr>			
			<tr>
				<td>Holiday Mutations: </td>
				<td id=XioHoliday>0</td>
				<td>Equipment Budget: </td>
				<td id=XioQPrice>0</td>
			</tr>
			<tr>
				<td>Salary Evaluations: </td>
				<td id=XioSalary>0</td>
			</tr>
			<tr>
				<td>Forced Trainings: </td>
				<td id=XioTraining>0</td>				
				<td>Techs Introduced: </td>
				<td id=XioTechs>0</td>
			</tr>
			<tr>
				<td></td>
				<td></td>			
				<td>Researches Started: </td>
				<td id=XioResearch>0</td>
			</tr>
			<tr>
				<td>Get Calls: </td>
				<td id=XioGetCalls>0</td>					
				<td>Hypotheses Selected: </td>
				<td id=XioHypothesis>0</td>
			</tr>
			<tr>
				<td>Post Calls: </td>
				<td id=XioPostCalls>0</td>				
				<td>Buildings Attached: </td>
				<td id=XioAttach>0</td>
			</tr>
			<tr>
				<td>Total Calls: </td>
				<td id=XioServerCalls>0</td>
			</tr>
			<tr>
				<td>Phase: </td>
				<td id=XioPhase>0</td>
			</tr>
			<tr>			
				<td>Time: </td>
				<td>
					<span id=XioMinutes>0</span>
					 m 
					<span id=XioSeconds>0</span>					
					 s
				</td>
			</tr>
			<tr>
				<td id=xDone colspan=4 style='visibility: hidden; color: lightgoldenrodyellow'>All Done!</td>
			</tr>
		</table>
		<div id=XMproblem class=XioProperty style='font-size: 18px; color:gold;'></div>`;
	
	//}
	
	$("#topblock").append(tablestring);
		
	let filtersetting = $(".u-s").attr("href") || "/"+realm+"/main/common/util/setfiltering/dbunit/unitListWithProduction/class=0/size=0/type=" + $(".unittype").val();
	let opt;
			
	yield Promise.all([
		xGet("/"+realm+"/main/common/util/setpaging/dbunit/unitListWithProduction/20000"),
		xGet("/"+realm+"/main/common/util/setfiltering/dbunit/unitListWithProduction/class=0/type=0")
	]).then(go);
		
	let unit = yield xGet(`/${realm}/main/company/view/${companyid}/unit_list`, "unitlist").then(go);
	
	yield Promise.all([
		xGet("/"+realm+"/main/common/util/setpaging/dbunit/unitListWithProduction/400"),
		xGet(filtersetting)
	]).then(go);
				
	opt = Update(unit);	
	sccount.phase++;
	
	for(let opti in optionJSON){
		opt[opti] = opt[opti] || [];
	}
	
	console.log(opt);	
	
	//remove all with no choice (choice[0] === 0)
	let strip = function(arr){
		for(let i = 0; i < arr.length; i++){
			if(arr[i].choice[0] === 0){
				arr.splice(i--, 1);
			}
		}
	}
	
	//Combine holiday data
	let eh = opt.eh1.concat(opt.eh2);
		
	//Top Manager Page
	let qual; 
	if(opt.q1.hasChoice(0, a => a === 2) || opt.tc.hasChoice(0, a => a) || opt.es.hasChoice(0, a => a >= 2) || opt.rs.hasChoice(0, a => a === 1 || a === 2)){
		qual = xGet(`/${realm}/main/user/privat/persondata/knowledge`, "manager");
	}
	
	//Combine price and policy data
	let pc = opt.pc1.slice();	
	for(let i = 0; i < opt.pc2.length; i++){
		let tmp = opt.pc2[i];
		tmp.choice = [ tmp.choice[0], false, tmp.choice[1] ];
		pc.push(tmp);
	}	
	
	for(let i = 0; i < opt.pl1.length; i++){
		let found = false;
		for(let j = 0; j < pc.length; j++){
			if(pc[j].subid === opt.pl1[i].subid){
				pc[j].choice.push(...opt.pl1[i].choice);
				found = true;
				break;
			}
		}
		if(!found){
			pc.push({ 
				subid : opt.pl1[i].subid,
				choice : [0, false, false, ...opt.pl1[i].choice]
			});
		}
	}
	
	for(let i = 0; i < pc.length; i++){
		if(pc[i].choice[0] === 0 && pc[i].choice[3] === 0){
			pc.splice(i--, 1);
		}
	}
	
	let sp = opt.s1.slice();
	strip(sp);
	
	//Sale Pages
	let sales = [];
	for(let i = 0; i < pc.length; i++){
		sales.push(xGet(`/${realm}/main/unit/view/${pc[i].subid}/sale`, "sale"));			
	}
	
	//TM and IP pages
	let tm, ip;
	if(pc.hasChoice(0, a => a >= 3)){
		tm = xGet(`/${realm}/main/globalreport/tm/info`, "TM");
		ip = xGet(`/${realm}/main/geo/countrydutylist/359837`, "IP");
	}
		
	//CTIE and Transport page
	let CTIE, tp;
	if(pc.hasChoice(0, a => a === 4 || a === 5)){
		CTIE = xGet(`/${realm}/main/geo/regionENVD/359838`, "CTIE");
		tp = xGet(`/${realm}/main/common/main_page/game_info/transport`, "transport");		
	}
	
	//Region list (for profit tax) PREP
	let ptaxprp;
	if(pc.hasChoice(0, a => a === 5)){
		ptaxprp = xGet(`/${realm}/main/common/util/setpaging/report/regionBonus/20000`);
	}
	
	//Product Global Market for sale Report PREP
	//Not used
	let prp;
	if(pc.hasChoice(0, a => a === 8)){
		prp = xGet(`/${realm}/main/common/util/setpaging/reportcompany/marketingProduct/40000`, "none");
	}		
	
	//Company Tech List PREP
	let techprep;	
	if(opt.tc.hasChoice(0, a => a)){
		techprep = xGet(`/${realm}/main/common/util/setpaging/dbunit/unitListWithTechnology/20000`);
	}
		
	let qprp = [];
	//Equipment page PREP
	if(opt.q1.hasChoice(0, a => a)){
		qprp.push(xGet(`/${realm}/main/common/util/setpaging/dbunit/unitListWithEquipment/20000`));
		qprp.push(xGet(`/${realm}/main/common/util/setfiltering/dbunit/unitListWithEquipment/class=0/type=0`));
	}
	
	//Animals page PREP
	//Not used
	if(opt.q2.hasChoice(0, a => a)){
		qprp.push(xGet(`/${realm}/main/common/util/setpaging/dbunit/unitListWithAnimals/20000`));
		qprp.push(xGet(`/${realm}/main/common/util/setfiltering/dbunit/unitListWithAnimals/class=0/type=0`));
	}
	
	//Employees pages PREP
	if(eh.hasChoice(0, a => a) || opt.q1.hasChoice(0, a => a === 2)  || opt.es.hasChoice(0, a => a)){
		qprp.push(xGet(`/${realm}/main/common/util/setpaging/dbunit/unitListWithHoliday/20000`));
		qprp.push(xGet(`/${realm}/main/common/util/setfiltering/dbunit/unitListWithHoliday/class=0/type=0`));
	}
	
	//City Skill List PREP
	let eprp;
	if(opt.es.hasChoice(0, a => a)){
		eprp = xGet(`/${realm}/main/common/util/setpaging/report/cityBonus/20000`);
	}
	
	//Research Pages Load
	strip(opt.rs);
	let lab = [];	
	for(let i = 0; i < opt.rs.length; i++){
		lab.push(xGet(`/${realm}/main/unit/view/${opt.rs[i].subid}/investigation`, "research"));
	}
	
	[qual, tm, ip, CTIE, tp,,, sales,, lab] = yield* waiter(go, qual, tm, ip, CTIE, tp, ptaxprp, prp, sales, techprep, lab);
	sccount.phase++;
	
	//Region List (Profit Tax)
	let rL;
	if(opt.es.hasChoice(0, a => a)){
		rL = xGet(`/${realm}/main/common/main_page/game_info/bonuses/region`, "regionoverview");
	}
	
	//Company Tech List
	let tech;
	if(opt.tc.hasChoice(0, a => a)){		
		tech = xGet(`/${realm}/main/company/view/${companyid}/unit_list/technology`, "techlist");
	}
	
	//Holiday: Employee Manager Page
	let s;
	if(eh.hasChoice(0, a => a)){
		s = xGet(`/${realm}/main/company/view/${companyid}/unit_list/employee/salary`, "employees");
	}
	
	//Research Pages Process
	let labpost = [];
	for(let i = 0; i < opt.rs.length; i++){
				
		if(lab[i].isFree){		
		
			if(!lab[i].industry){
				postMessage(`Laboratory <a href="/${realm}/main/unit/view/${opt.rs[i].subid}/investigation">${opt.rs[i].subid}</a> has no clue what to research!`);
				continue;
			}
				
		
			let manIndex = qual.pic.indexOf("/img/qualification/research.png");
			let man = Infinity;
			
			if(opt.rs[i].choice[0] === 1){
				man = qual.base[manIndex];
			} else if(opt.rs[i].choice[0] === 2){
				man = qual.base[manIndex] + qual.bonus[manIndex];
			}
																		
			if(lab[i].level+1 < calcTechLevel(man)){
				let data = yield xPost(`/${realm}/window/unit/view/${opt.rs[i].subid}/project_create`, `industry=${lab[i].industry}&unit_type=${lab[i].unittype}`).then(go);							
				let isContinue = !!$(data).find(":submit").length;
				if(isContinue){
					let send = "industry="+lab[i].industry+"&unit_type="+lab[i].unittype+"&level="+(lab[i].level+1)+"&create=Invent";
					labpost.push(xPost(`/${realm}/window/unit/view/${opt.rs[i].subid}/project_create`, send, "research"));
				} else {
					postMessage(`Laboratory <a href="/${realm}/main/unit/view/${opt.rs[i].subid}/investigation">${opt.rs[i].subid}</a> reached the maximum technology level for its size. Could not research the next level.`);
				}				
				
			}
		}	
		
		else if(lab[i].isHypothesis && !lab[i].isBusy){
			
			function calcProduct(p, n){
				let value = 1;
				for(let m = 1; m <= n-1; m++){
					value *= (1-(1/100*(m-1)+p));
				}
				return value;
			}   

			function calcStudyTime(p, k){
				//p is possibility between 0 and 1
				//k is reference time between 0 and +infinite    
				let value = 0;
				for(let n = 0; n <= 100*(1-p); n++){
					value += k*(n+1)*(1/100*n+p)*calcProduct(p, n+1);					
				}
				return value;
			}
			
			let favid = -1;
			let favindex = -1;
			let lowtime = Infinity;
			
			for(let j = 0; j < lab[i].chance.length; j++){

				let studytime = 0;
				if(opt.rs[i].choice[1] === 1){
					studytime = 1/lab[i].chance[j];
				} else if(opt.rs[i].choice[1] === 2){
					studytime = lab[i].time[j] + 0.0001/lab[i].chance[j];
				} if(opt.rs[i].choice[1] === 3){
					studytime = calcStudyTime(lab[i].chance[j]/100, lab[i].time[j]);					
				}
				
				if(studytime < lowtime){
					lowtime = studytime;
					favid = lab[i].hypId[j];
					favindex = j;
				}			
				
			}
			
			if(lab[i].curIndex !== favindex){
				let data = `selectedHypotesis=${favid}&selectIt=Select+a+hypothesis`;
				labpost.push(xPost(`/${realm}/main/unit/view/${opt.rs[i].subid}/investigation`, data, "hypothesis"));	
			}
			
		}	
		else if(lab[i].isAbsent || lab[i].isFactory){	

			let expunit = yield xGet(`/${realm}/window/unit/view/${opt.rs[i].subid}/set_experemental_unit`, "experimentalunit").then(go);				
			
			let effi = [];			
			let contracts = [];
			
			if(!expunit.id.length){
				postMessage(`No subdivision available to support laboratory <a href="/${realm}/main/unit/view/${opt.rs[i].subid}/investigation">${opt.rs[i].subid}</a>.`);
				continue;
			}
			
			for(let j = 0; j < expunit.id.length; j++){
				contracts.push(xPost(`/${realm}/ajax/unit/forecast`, {"unit_id" : expunit.id[j]}, "", "JSON"));
			}
			
			[contracts] = yield* waiter(go, contracts);
						
			for(let j = 0; j < expunit.id.length; j++){
				let con = JSON.parse(contracts[j]);
				effi.push({
					"id": expunit.id[j], 
					"efficiency": numberfy(con.productivity), 
					"load": numberfy(con.loading)
				});
			}	
					
			let efficient = 0;
			let index = -1;
			for(let j = 0; j < effi.length; j++){
				if(efficient < effi[j].efficiency * effi[j].load){
					efficient = effi[j].efficiency * effi[j].load
					index = j;
				}
			}
			
			if(index === -1){
				postMessage(`No subdivision available to support laboratory <a href="/${realm}/main/unit/view/${opt.rs[i].subid}/investigation">${opt.rs[i].subid}</a>.`);
				continue;
			} else{
				let data = "unit="+effi[index].id+"&next=Select";				
				xPost(`/${realm}/window/unit/view/${opt.rs[i].subid}/set_experemental_unit`, data, "attach");							
			}					
						
		}		
	}
	
	[rL, tech, s] = yield* waiter(go, rL, tech, s);
	sccount.phase++;
		
	//Sales page updates
	let posts = [];	
	for(let i = 0; i < pc.length; i++){
		
		let datastring = "";
				
		for(let j = 0; j < sales[i].price.length; j++){
					
			let primecost = pc[i].choice[1] === 2 ? sales[i].outprime[j] : sales[i].stockprime[j];
			let quality = pc[i].choice[1] === 2 ? sales[i].outqual[j] : sales[i].stockqual[j];
			let price = sales[i].price[j];
			let policy = sales[i].constraint[j];
			let IP = 0, realCTIE = 0, product;
						
			if( [3, 4, 5, 6, 7, 8].indexOf(pc[i].choice[0]) >= 0 ){
				let indexFranchise = tm.franchise.indexOf( sales[i].product[j] );
				product = tm.product[indexFranchise] || sales[i].product[j];
				let indexIP = ip.product.indexOf(product);
				IP = ip.IP[indexIP];			
			}
			
			if( pc[i].choice[0] === 4 || pc[i].choice[0] === 5 ){		
				let indexCTIE = CTIE.product.indexOf(product);
				realCTIE = CTIE.CTIE[indexCTIE];				
			}			
			
			if(pc[i].choice[0] === 1){
				price = 0;
			} else if(pc[i].choice[0] === 2){
				price = 0.01;
			} else if(pc[i].choice[0] === 3){
				price = primecost+0.01 < 30 * IP && primecost ? primecost + 0.01 : primecost;
				price = Math.round(price*100)/100;		
			} else if(pc[i].choice[0] === 4){
				price = primecost * (1 + realCTIE/100);
				price = Math.round(price*100)/100;
				price = price < 30 * IP? price : primecost;
			} else if(pc[i].choice[0] === 5){
				let indexRegion = rL.region.indexOf(sales[i].region);
				let profitTax = rL.ptax[indexRegion];
				price = primecost * (1 + realCTIE/100 * profitTax/100);
				price = Math.round(price*100)/100;
				price = price < 30 * IP? price : primecost;
				console.log(primecost, profitTax, realCTIE, price, 30 * IP);
			} else if(pc[i].choice[0] === 6){							
				price = IP;
			} else if(pc[i].choice[0] === 7){
				price = 30 * IP;
			}
			
			if(pc[i].choice[2] === 2 && !price){
				price = sales[i].price[j];
			}
			
			if(pc[i].choice[3] === 1){
				policy = 0;
			} else if(pc[i].choice[3] === 2){
				policy = 1;
			} else if(pc[i].choice[3] === 3){
				policy = 3;
			} else if(pc[i].choice[3] === 4){
				policy = 5;
			}
			
			if(pc[i].choice[4] === 2 && !primecost){
				policy = 0;
			}
			
			if(sales[i].policy[j] !== policy || sales[i].price[j] !== price){
				datastring += encodeURI(`&${sales[i].productData[j]}[price]=${price}
										&${sales[i].productData[j]}[max_qty]=${sales[i].volume[j]}
										&${sales[i].productData[j]}[constraint]=${policy}`);
			}
		}
		
		if(datastring.length){
			posts.push(xPost(`/${realm}/main/unit/view/${pc[i].subid}/sale`, datastring, "sale"));
		}		
	}
		
	//Technology pages
	strip(opt.tc);
	let tcp = [], tclvl = [], tcid = [];
	for(let i = 0; i < opt.tc.length; i++){
		for(let j = 0; j < tech.subid.length; j++){
			if(opt.tc[i].subid === tech.subid[j]){
				let qualImg = subType[tech.type[j]][2];
				let qualIndex = qual.pic.indexOf(qualImg);
				let manReq = qual.base[qualIndex];
				let manMax = manReq + qual.bonus[qualIndex];
				let man = opt.tc[i].choice[0] === 2 ? manMax : manReq;
				let maxtech = Math.floor(calcTechLevel(man));
				if(tech.level[j] < maxtech){
					tcp.push(xGet(`/${realm}/main/unit/view/${opt.tc[i].subid}/technology`, "tech"));
					tclvl.push(maxtech);
					tcid.push(opt.tc[i].subid);
				}
				break;
			}
		}
	}	
	
	//Holiday
	let hols = [];
	for(let i = 0; i < eh.length; i++){
		let index = s.subid.indexOf(eh[i].subid);
		
		if(eh[i].choice[0] === 1 && !s.onHoliday[index]){
			hols.push(xGet(`/${realm}/main/unit/view/${eh[i].subid}/holiday_set`, "none"));
			sccount.holiday++;		
			servercalls();
		} else if(eh[i].choice[0] === 2 && s.onHoliday[index]){			
			hols.push(xGet(`/${realm}/main/unit/view/${eh[i].subid}/holiday_unset`, "none"));
			sccount.holiday++;		
			servercalls();
		}
		
	}
	
	[, tcp,, ] = yield* waiter(go, posts, tcp, qprp, eprp);
	sccount.phase++;
	
	//Technology purchases
	let posts2 = [];
	for(let i = 0; i < tcp.length; i++){
		for(let j = tcp[i].level.length - 1; tcp[i].level[j] > tcp[i].curlevel; j--){
			if(tcp[i].level[j] <= tclvl[i] && tcp[i].yours[j]){
				posts2.push(xPost(`/${realm}/main/unit/view/${tcid[i]}/technology`, `level=${tcp[i].level[j]}`, "tech"))
				break;
			}
		}
	}
	
	//City Skill List
	let cSL;
	if(opt.es.hasChoice(0, a => a)){
		cSL = xGet(`/${realm}/main/common/main_page/game_info/bonuses/city`, "cityoverview");
	}
		
	[, cSL,, ] = yield* waiter(go, posts2, cSL, hols, labpost);
	sccount.phase++;
	
	//Equipment Deals
	let dealsmade = 0;
	let equipcounts = {};
	do{
	
		console.log("DO LOOP");
		dealsmade = 0;
		let qE, qA, qS;
		
		if(opt.q1.hasChoice(0, a => a)){
			qE = xGet(`/${realm}/main/company/view/${companyid}/unit_list/equipment`, "machines");
		}		
		if(opt.q2.hasChoice(0, a => a)){
			qA = xGet(`/${realm}/main/company/view/${companyid}/unit_list/animals`, "animals");
		}	
		if(opt.q1.hasChoice(0, a => a === 2)){
			qS = xGet(`/${realm}/main/company/view/${companyid}/unit_list/employee/salary`, "employees");
		}
			
		[qE, qA, qS] = yield* waiter(go, qE, qA, qS);
		
		for(let i = 0; i < qE.subid.length; i++){
			equipcounts[qE.subid[i]] = equipcounts[qE.subid[i]] || qE.num[i];
		}
					
		let equipfilter = [];
		for(let i = 0; i < opt.q1.length; i++){
			if(opt.q1[i].choice[0] === 0){
				continue;
			}
			
			for(let j = 0; j < qE.subid.length; j++){	
				if(opt.q1[i].subid !== qE.subid[j]) continue;
				
				let torep = qE.black[j];
				if(opt.q1[i].choice[1] === 2 || opt.q1[i].choice[1] === 3 && !torep) 
					torep++;
				
				if(!qE.num[j] || !torep && (qE.quality[j] >= qE.required[j] || opt.q1[i].choice[1] === 2)) continue;
				
				let eq = yield xGet(`/${realm}/window/unit/equipment/${qE.subid[j]}`, "equipment").then(go);
				
				if(equipfilter.indexOf(eq.filtername) === -1){								
					equipfilter.push(eq.filtername);			
					
					let data = "total_price%5Bfrom%5D=&total_price%5Bto%5D=&quality%5Bfrom%5D=&quality%5Bto%5D=&quantity%5Bisset%5D=1&quantity%5Bfrom%5D=1&total_price%5Bfrom%5D=0&total_price%5Bto%5D=0&total_price_isset=0&quality%5Bfrom%5D=0&quality%5Bto%5D=0&quality_isset=0&quantity_isset=1";
					let prop = [
						xGet(`/${realm}/window/common/util/setpaging/db${eq.filtername}/equipmentSupplierListByUnit/40000`),
						xPost(`/${realm}/window/common/util/setfiltering/db${eq.filtername}/equipmentSupplierListByUnit/`, data),
						xGet(`/${realm}/window/common/util/setfiltering/db${eq.filtername}/equipmentSupplierListByUnit/supplierType=all`)
					]
					
					yield* waiter(go, prop);				
					eq = yield xGet(`/${realm}/window/unit/equipment/${qE.subid[j]}`, "equipment").then(go);				
				}
				
										
				let qualReq = (qE.required[j] || 0) + 0.005;
				let qualNow = qE.quality[j] - 0.005;
				let qualMax = Infinity;
				
				if(opt.q1[i].choice[0] === 2){
					let typeInfo = subType[qE.type[j]];
					let managerIndex = qual.pic.indexOf(typeInfo[2]);
					let emplIndex = qS.subid.indexOf(qE.subid[j]);
					let employees = qS.emplWrk[emplIndex] || qS.emplMax[emplIndex];
					qualMax = calcEquip( calcSkill( employees, typeInfo[0], qual.base[managerIndex] + qual.bonus[managerIndex] ) );
				}
				
				let repair = {};				
				let replace = {};

				for(let l = 0; l < eq.offer.length; l++){
					repair[eq.offer[l]] = 0;
					replace[eq.offer[l]] = 0;
				}						
				
				//repair
				for(let k = 0; k < torep; k++){
											
					let lowestPQR = Infinity;
					let bestqual = 0;
					let best;				
										
					for(let l = 0; l < eq.offer.length; l++){
												
						//Some contracts are not good enough without even looking at them
						let PQR = eq.price[l] / eq.qualOffer[l];
						if(PQR > lowestPQR && (eq.qualOffer[l] < qualNow || bestqual > qualNow || opt.q1[i].choice[0] !== 2) || eq.available - repair[eq.offer[l]] === 0) 
							continue;
								
						//What happens to the total quality if we buy one of this contract more?
						qualEst = qualNow;							
						repair[eq.offer[l]]++;								
						for(let m in repair){
							if(repair[m]){
								qualEst = ((qE.num[j] - repair[m]) * qualEst + repair[m] * eq.qualOffer[eq.offer.indexOf(numberfy(m))]) / qE.num[j];
							}															
						}
						repair[eq.offer[l]]--;			
						
						//Remember that this is the new best deal
						if(opt.q1[i].choice[0] === 1 && (qualEst > qualReq || qualEst > qualNow && qualNow < qualReq)
						|| opt.q1[i].choice[0] === 2 && qualEst < qualMax ){
							best = eq.offer[l];
							lowestPQR = PQR;
							bestqual = eq.qualOffer[l];
						}						
					}

					if(best >= 0){
						repair[best]++;
					} else{
						postMessage(`Could not repair subdivision <a href="/${realm}/main/unit/view/${qE.subid[j]}">${qE.subid[j]}</a>, no equipment met the required quality`);
						break;
					}
					
				}			
				
				//replace
				if(opt.q1[i].choice[0] === 1){				

					qualEst = qualNow;									
					for(let m in repair){
						if(repair[m]){;
							qualEst = ((qE.num[j] - repair[m]) * qualEst + repair[m] * eq.qualOffer[eq.offer.indexOf(numberfy(m))]) / qE.num[j];
						}															
					}	
					qualNow = qualEst;
									
					while(qualEst < qualReq){
												
						let lowestPQR = Infinity;
						let best;				
											
						for(let l = 0; l < eq.offer.length; l++){
													
							let PQR = eq.price[l] / (eq.qualOffer[l] - qualNow);
							if(PQR < lowestPQR && eq.qualOffer[l] > qualReq && eq.available[l] - repair[eq.offer[l]] - replace[eq.offer[l]] > 0) {								
								best = eq.offer[l];
								lowestPQR = PQR;
							}						
						}

						if(best >= 0){
														
							let bestqual = eq.qualOffer[eq.offer.indexOf(numberfy(best))];
							let numNeeded = Math.ceil((qualReq - qualEst) / (bestqual - qualNow) * qE.num[j]);
							let toreplace = Math.min(numNeeded, eq.available[eq.offer.indexOf(numberfy(best))] - repair[best]);
							replace[best] = toreplace;							
							qualEst += toreplace * (bestqual - qualNow) / qE.num[j];
							
						} else{
							postMessage(`Could not increase the quality of subdivision <a href="/${realm}/main/unit/view/${qE.subid[j]}">${qE.subid[j]}</a>, no equipment met the required quality`);
							break;
						}				
						
					}	
					
				}
				
				//buy

				//repair
				for(let m in repair){
					if(repair[m]){
						dealsmade++;
						sccount.qrepair += repair[m];
						sccount.qprice += eq.price[eq.offer.indexOf(numberfy(m))] * repair[m];
						yield xPost(`/${realm}/ajax/unit/supply/equipment`, {
							operation : "repair",
							offer : m,
							unit : qE.subid[j],
							supplier : m,
							amount : repair[m]
						}, "qdeals", "JSON").then(go);
					}															
				}
				
				//replace				
				for(let m in replace){
					if(replace[m]){
						dealsmade += 2;
						sccount.qreplace += replace[m];
						sccount.qprice += eq.price[eq.offer.indexOf(numberfy(m))] * replace[m];
						yield xPost(`/${realm}/ajax/unit/supply/equipment`, {
							operation : "terminate",
							unit : qE.subid[j],
							amount : replace[m]
						}, "qdeals", "JSON").then(go);
						yield xPost(`/${realm}/ajax/unit/supply/equipment`, {
							operation : "buy",
							offer : m,
							unit : qE.subid[j],
							supplier : m,
							amount : replace[m]
						}, "qdeals", "JSON").then(go);
					}															
				}	
				
				//buy
				
				
				
				break;
			} 	
		}
	} while(dealsmade);
	
	sccount.phase++;
	//Supply Pages (Production)
	let supply = [];
	for(let i = 0; i < sp.length; i++){
		supply.push(xGet(`/${realm}/main/unit/view/${sp[i].subid}/supply`, "prodsupply"));			
	}
	
	//Salary Evaluations
	let sset = 0;
	do{
		
		console.log("DO LOOP 2");
		sset = 0;
		
		s = yield xGet(`/${realm}/main/company/view/${companyid}/unit_list/employee/salary`, "employees").then(go);
		
		let maxEmpl = {};
		for(let i = 0; i < s.subid.length; i++){
			let workers = s.onHoliday[i]? 0 : s.emplWrk[i];
			let type = subType[s.type[i]][2];
			if(maxEmpl[type]){
				maxEmpl[type] += workers;
			} else{
				maxEmpl[type] = workers;
			}
		}
		
		let sets = [];
				
		for(let i = 0; i < opt.es.length; i++){
						
			let req = 0;
			let index = s.subid.indexOf(opt.es[i].subid);
			
			if(!opt.es[i].choice[0])
				continue;
			else if(opt.es[i].choice[0] === 1)
				req = s.skillReq[index];
			else{				
				let typeInfo = subType[s.type[index]];
				let managerIndex = qual.pic.indexOf(typeInfo[2]);
				if(opt.es[i].choice[0] === 2){
					req = calcSkill(s.emplWrk[index], typeInfo[0], qual.base[managerIndex]);					
				} else if(opt.es[i].choice[0] === 3){
					req = calcSkill(s.emplWrk[index], typeInfo[0], qual.base[managerIndex] + qual.bonus[managerIndex]);
				} else if(opt.es[i].choice[0] === 4){
					let man = qual.base[managerIndex] + qual.bonus[managerIndex];
					let manNew = man * calcOverflowTop1(maxEmpl[typeInfo[2]], typeInfo[1], man);
					req = calcSkill(s.emplWrk[index], typeInfo[0], manNew);
				}				
			}
			
			req = Math.floor(req*100)/100;
			let city = s.city[index];
			let cityIndex = cSL.city.indexOf(city);
			let newsalary = calcSalary(s.salaryWrk[index], s.salaryCity[index], s.skillWrk[index], cSL.skill[cityIndex], req);
			
			if(opt.es[i].choice[1] >= 2){
				newsalary = Math.min(newsalary, s.salaryCity[index] * 500);
			}						
			if(opt.es[i].choice[1] === 3){
				newsalary = Math.ceil(Math.max(newsalary, (s.salaryCity[index]+0.005) * 0.8)*100)/100;
			}
			if(!s.emplWrk[index]){
				newsalary = s.salaryCity[index];
			}
			
			newsalary = Math.round(newsalary*100)/100;
			
			if(newsalary !== s.salaryWrk[index]){	
				let setstring = `unitEmployeesData%5Bquantity%5D=${s.emplWrk[index]}&unitEmployeesData%5Bsalary%5D=${newsalary}`;
				sets.push(xPost(`/${realm}/window/unit/employees/engage/${opt.es[i].subid}`, setstring, "salary"));
				sset++;				
			}			
		}
	
		yield Promise.all(sets).then(go);
		
	} while(sset);
	
	[supply] = yield* waiter(go, supply);
	sccount.phase++;
	
	//Training remove unneeded
	for(let i = 0; i < opt.et.length; i++){
		let index = s.subid.indexOf(opt.et[i].subid);
		if(s.onTraining[index] || !s.emplWrk[index]){
			opt.et.splice(i, 1);
			i--;
		}
	}
	
	//Training data collection
	let train = [];
	for(let i = 0; i < opt.et.length; i++){
					
		if(opt.et[i].choice[0] === 4 || opt.et[i].choice[0] === 5){			
			let index = s.subid.indexOf(opt.et[i].subid);
			let string = `employees=${s.emplWrk[index]}&weeks=4`;
			train.push(xPost(`/${realm}/ajax/unit/employees/calc_new_lvl_after_train/${opt.et[i].subid}`, string, undefined, "json"));		
		}
		
		if(opt.et[i].choice[0] === 5){
			train.push(xGet(`/${realm}/window/unit/employees/education/${opt.et[i].subid}`, "training"));
		}
		
	}
	
	//Supply Renewals
	let supplypost = [];
	if(typeof XSPE === "undefined")
	for(let i = 0; i < sp.length; i++){
		
		let rowcount = 0;
		let nosup = 0;
		
		for(let j = 0; j < supply[i].stock.length; j++){
			
			let newsupply = 0;
			
			if(sp[i].choice[0] === 2){
				newsupply = supply[i].required[j];
			} else if(sp[i].choice[0] === 3){
				newsupply = Math.min(2 * supply[i].required[j] - supply[i].stock[j], supply[i].required[j]);
			} else if(sp[i].choice[0] === 4){
				newsupply = Math.min(2 * supply[i].required[j], Math.max(3 * supply[i].required[j] - supply[i].stock[j], 0));
			} 
			
			if(supply[i].nosupplier[rowcount]){
				rowcount++;
				nosup++;
				if(newsupply)
					postMessage(`Subdivision <a href="/${realm}/main/unit/view/${sp[i].subid}">${sp[i].subid}</a> is missing a supplier!`);
				continue;
			}
			
			
			let startrow = rowcount;
			let rows = 1;
			while(supply[i].mainrow[rowcount + 1] === false && supply[i].nosupplier[rowcount + 1] === false){
				rowcount++;
				rows++;
			}

			let supplier = [];
			for(let k = startrow - nosup; k < startrow - nosup + rows; k++){
				supplier.push({
					price : supply[i].price[k],
					quality : supply[i].quality[k],
					PQR : supply[i].price[k] / supply[i].quality[k],
					available : Math.min(supply[i].available[k], supply[i].maximum[k]),					
					supply : supply[i].parcel[k],
					reprice : supply[i].reprice[k],
					offer : supply[i].offer[k]
				});
			}
			
			let sortfunc;
			if(sp[i].choice[1] === 1){
				sortfunc = (a, b) => a.PQR - b.PQR;
			} else if(sp[i].choice[1] === 2){
				sortfunc = (a, b) => a.price - b.price;
			} else if(sp[i].choice[1] === 3){
				sortfunc = (a, b) => b.quality - a.quality;
			}

			supplier.sort(sortfunc);
						
			for(let k = 0; k < supplier.length; k++){
				let thissupply = Math.min(newsupply, supplier[k].available);
				if(thissupply !== supplier[k].supply || supplier[k].reprice){
					let data = {
						amount: thissupply,
						offer: supplier[k].offer,
						unit: sp[i].subid
					};
					supplypost.push(xPost(`/${realm}/ajax/unit/supply/create`, data, "supply", "json"));
				}				
				newsupply -= thissupply;
			}
			
			if(newsupply){
				postMessage(`Subdivision <a href="/${realm}/main/unit/view/${sp[i].subid}">${sp[i].subid}</a> does not have enough supply!`);
			}
			
			rowcount++;
			
		}
		
	}
		
	[train] = yield* waiter(go, train);
	sccount.phase++;
	
	//Training Kickoffs
	let trainposts = [];
	for(let i = 0; i < opt.et.length; i++){
					
		let index = s.subid.indexOf(opt.et[i].subid);
		
		let temp, go;
		if(opt.et[i].choice[0] === 4 || opt.et[i].choice[0] === 5){
			temp = JSON.parse(train.shift());
			temp = temp.employees_level;
		}
		
		if(opt.et[i].choice[0] === 5){
			let city = s.city[index];
			let cityIndex = cSL.city.indexOf(city);
			let salaryNew = calcSalary(s.salaryWrk[index], s.salaryCity[index], temp, cSL.skill[cityIndex], s.skillWrk[index]);
			salaryNew = Math.max(salaryNew, 0.8 * s.salaryCity[index]);
			let savings = (s.salaryWrk[index] - salaryNew) * 365;
			let training = train.shift();
			let costs = training.weekcost * 4 / s.emplWrk[index];
			go = savings > costs
		}		
		
		if(opt.et[i].choice[0] === 1
		|| opt.et[i].choice[0] === 2 && s.salaryWrk[index] > s.salaryCity[index] * 0.8
		|| opt.et[i].choice[0] === 3 && s.salaryWrk[index] > s.salaryCity[index]
		|| opt.et[i].choice[0] === 4 && temp > s.skillWrk[index] + 0.12
		|| opt.et[i].choice[0] === 5 && go){
						
			let data = `unitEmployeesData%5Btime_count%5D=4&unitEmployeesData%5Bemployees%5D=${s.emplWrk[index]}`
			trainposts.push(xPost(`/${realm}/window/unit/employees/education/${opt.et[i].subid}`, data, "train"));			
			
		}
		
	}
	
	yield* waiter(go, trainposts, supplypost);
	sccount.phase++;

	if(typeof XSPE !== "undefined"){
		yield* XSPE(go, opt);
	}
	
	sccount.phase++;
	
	$("#xDone").css("visibility", "");
	$(".XioGo").attr("disabled", false);
	clearInterval(timeinterval);
	console.log("done!");	
}

//for the purpose of loading the XioOverview
function* XioOverview(go){	
	
	let processingtime = new Date().getTime();
	
	$("#mainContent").append("<div id=XOloading style='font-size: 30px'>XioOverview is Loading.....</div>");
	
	let urlHoliday = "/"+realm+"/main/company/view/"+companyid+"/unit_list/employee/salary";
	let urlUnitlist = "/"+realm+"/main/company/view/"+companyid+"/unit_list";
		
	yield Promise.all([
		xGet("/"+realm+"/main/common/util/setpaging/dbunit/unitListWithHoliday/20000", "none"), 
		xGet("/"+realm+"/main/common/util/setfiltering/dbunit/unitListWithHoliday/class=0/type=0", "none"), 
		xGet("/"+realm+"/main/common/util/setpaging/dbunit/unitListWithProduction/20000", "none"), 
		xGet("/"+realm+"/main/common/util/setfiltering/dbunit/unitListWithProduction/class=0/type=0", "none")
	]).then(go);
			
	let [empl, unit] = yield Promise.all([
		xGet(urlHoliday, "employees"),
		xGet(urlUnitlist, "unitlist")
	]).then(go);
		
	yield Promise.all([
		xGet("/"+realm+"/main/common/util/setpaging/dbunit/unitListWithHoliday/400", "none"),
		xGet("/"+realm+"/main/common/util/setpaging/dbunit/unitListWithProduction/400", "none")
	]).then(go);
				
	$("#XOloading").remove();
	
	let opt = Update(unit);		
	
	let types = {};
	
	for(let i = 0; i < unit.subids.length; i++){
		
		if(!choiceJSON[unit.type[i]])
			continue;
		
		if(!types[unit.type[i]]){
			types[unit.type[i]] = "<table cellspacing=0 data-type="+unit.type[i]+" style='margin-top:20px'><tr><th></th><th>City</th><th>Subdivision</th>";	

			let text2 = "<tr><td></td><td><img class=Xall src='/img/unit_types/"+unit.type[i]+".gif'></td><td></td>";
			for(let j = 0; j < choiceJSON[unit.type[i]].length; j++){
				types[unit.type[i]] += "<th>"+optionJSON[choiceJSON[unit.type[i]][j]].tag+"</th>";					
				text2 += "<td>";
				for(let k = 0; k < optionJSON[choiceJSON[unit.type[i]][j]].opt.length; k++){
					text2 += "<ul style='list-style-type: none; display: inline-block; padding: 0px; vertical-align: middle;'>";
					for(let l = 0; l < optionJSON[choiceJSON[unit.type[i]][j]].opt[k].length; l++){
						text2 += "<li style='margin-left: 0px; margin-right: 8px'>"+optionJSON[choiceJSON[unit.type[i]][j]].opt[k][l]+"</li>";
					}						
					text2 += "</ul>";
				}
				
			}
			types[unit.type[i]] += "<th>Efficiency</th><th></th></tr>";
			types[unit.type[i]] += text2 + "<td></td><td></td></tr>";
		}

		types[unit.type[i]] += "<tr data-id="+unit.subids[i]+">"
						+"<td><img src='/img/flag/"+unit.country[i]+".png'></img></td>"
						+"<td>"+unit.city[i]+"</td>"
						+"<td><a href='/"+realm+"/main/unit/view/"+unit.subids[i]+"'>"+unit.name[i]+"</a></td>";		
		
		for(let j = 0; j < choiceJSON[unit.type[i]].length; j++){
			types[unit.type[i]] += "<td>";		
			let addend = false;
			for(let k = 0; k < optionJSON[choiceJSON[unit.type[i]][j]].opt.length; k++){	
				if(k === 1){
					types[unit.type[i]] += " (";
					addend = true;
				}
				else if(k >= 2){
					types[unit.type[i]] += " ";
				}
				
				let choice;
				for(let l = 0; l < opt[choiceJSON[unit.type[i]][j]].length; l++){
					if(opt[choiceJSON[unit.type[i]][j]][l].subid === unit.subids[i]){
						choice = opt[choiceJSON[unit.type[i]][j]][l].choice[k];
						break;
					}
				}
				
				if(choice === 0){
					break;
				}
				else{
					types[unit.type[i]] += optionJSON[choiceJSON[unit.type[i]][j]].opt[k][choice-1];
				}					
			}
			if(addend){
				types[unit.type[i]] += ")";
			}
			types[unit.type[i]] += "</td>";
		}
		
		let index = empl.subid.indexOf(unit.subids[i]);
		if(index >= 0){
			if(empl.efficiency[index] === ""){
				empl.efficiency[index] = '<img align="right" src="/img/unit_indicator/workers_in_holiday.gif" title="The employees are on vacation">';
			}
			types[unit.type[i]] += "<td>"+empl.efficiency[index]+"</td>";
		}
		else{
			types[unit.type[i]] += "<td></td>";
		}
		
		types[unit.type[i]] += "<td>"+unit.alert[i]+"</td>";		
		types[unit.type[i]] += "</tr>";			
		
	}
		
	let totalstring = "<div id=XOtables style='white-space: nowrap; user-select: none;'>";
	for(let key in types){
		types[key] += "</table>";
		totalstring += types[key];
	}		
			
	$("#mainContent").append(totalstring+"</div>");
	
	let startWrap = $("#wrapper").width();
	let startMain = $("#mainContent").width();
	let tableWidth = Math.max.apply(null, $("#XOtables table").map( (i, e) => $(e).width() ).get());
	$("#wrapper").width(Math.max(tableWidth + 80, startWrap));
	$("#mainContent").width(Math.max(tableWidth, startMain));
	
	$("#XOtables tr:nth-child(odd)").css("backgroundColor", "lightgoldenrodyellow");
	$("#XOtables").css("user-select", "none");
	
	$(document).on("mousedown.XO", "#XOtables tr[data-id]", function(e){
		if(!$(e.target).is('.XioChoice') && !$(e.target).is('.XioChoice option')){
			$(".trXIO").css("backgroundColor", "").filter("tr:nth-child(odd)").css("backgroundColor", "lightgoldenrodyellow");
			$(".trXIO").removeClass("trXIO");			
			$(this).addClass("trXIO").css("backgroundColor", "rgb(255, 210, 170)");
			mousedown = true;			
			$tron = $(e.target).is("tr")? $(e.target) : $(e.target).parents("tr");			
		}	  
	});	
	$(document).on("mouseup.XO", "#XOtables tr[data-id]", function(){
		mousedown = false;
	});
	$(document).on("mouseover.XO", "#XOtables tr[data-id]", function(){
		if(mousedown && $tron && $tron.parent().get(0) === $(this).parent().get(0)){
			$(".trXIO").css("backgroundColor", "").filter("tr:nth-child(odd)").css("backgroundColor", "lightgoldenrodyellow");
			$(".trXIO").removeClass("trXIO");
			$this = $(this);	
			if($this.index() < $tron.index()){
				$this.nextUntil($tron).andSelf().add($tron).addClass("trXIO").css("backgroundColor", "rgb(255, 210, 170)");
			}
			else if($this.index() > $tron.index()){
				$tron.nextUntil($this).andSelf().add($this).addClass("trXIO").css("backgroundColor", "rgb(255, 210, 170)");
			}
			$this.addClass("trXIO").css("backgroundColor", "rgb(255, 210, 170)");
		}
	});	
	$(document).on("click.XO", "#XOtables img.Xall", (e) => {		
		let $trs = $(e.target).parents("table").find("tr[data-id]");
		$trs.eq(0).trigger("mousedown.XO");
		$trs.trigger("mouseover.XO");
		mousedown = false;
	});
	$(document).on("click.XO", "#XOtables li", function(){
		if($tron && $tron.parent().get(0) === $(this).parents("tbody").get(0)){
			$this = $(this);		
			let index = $this.parents("tbody").find("ul").index($this.parent());
			let index2 = $this.index();
			let subids = [];
			let $trXIO = $(".trXIO");
			for(let i = 0; i < $trXIO.length; i++){
				subids.push(numberfy($trXIO.eq(i).attr("data-id")));
			}
			let data = ls["XS"+realm].split(";");
			for(let i = 0; i < data.length; i++){
				let split = data[i].split("-");
				if(subids.indexOf(numberfy(split[0])) >= 0){
					data[i] = split[0] + "-" + split[1].substring(0, index) + (index2 + 1) +  split[1].substring(index + 1);
				}					
			}
			ls["XS"+realm] = data.join(";");
			let datatype = $this.parents("table").attr("data-type");
			opt = Update(unit);
			for(let i = 0; i < subids.length; i++){					
				for(let j = 0; j < choiceJSON[datatype].length; j++){
					let html = "";
					let addend = false;
					for(let k = 0; k < optionJSON[choiceJSON[datatype][j]].opt.length; k++){	
						if(k === 1){
							html += " (";
							addend = true;
						}
						else if(k >= 2){
							html += " ";
						}
						
						let choice;
						for(let l = 0; l < opt[choiceJSON[datatype][j]].length; l++){
							if(opt[choiceJSON[datatype][j]][l].subid === subids[i]){
								choice = opt[choiceJSON[datatype][j]][l].choice[k];
								break;
							}
						}
												
						if(choice === 0){
							break;
						}
						else{
							html += optionJSON[choiceJSON[datatype][j]].opt[k][choice-1];
						}					
					}
					if(addend){
						html += ")";
					}
					$trXIO.eq(i).find("td").eq(j+3).html(html);
				}
			}
			
		}
	});	
	$(document).on("click.XO", "#XOtables th", function(){
		if($tron && $tron.parent().get(0) === $(this).parents("tbody").get(0)){
			$this = $(this);
			let index2 = $this.index();
			let index = $this.parents("tbody").find("td:lt("+index2+") ul").length;
			let subids = [];
			let $trXIO = $(".trXIO");
			for(let i = 0; i < $trXIO.length; i++){
				subids.push($trXIO.eq(i).attr("data-id"));
			}
			let data = ls["XS"+realm].split(";");
			for(let i = 1; i < data.length; i++){
				let split = data[i].split("-");
				if(subids.indexOf(split[0]) >= 0){
					data[i] = split[0] + "-" + split[1].substring(0, index) + "0" +  split[1].substring(index + 1);
				}					
			}
			ls["XS"+realm] = data.join(";");
			$trXIO.find("td:nth-child("+(index2+1)+")").html("");
		}	
	});
	
}

//the XioExport and Import functions are basically:
//Export: put the saved data from the localstorage in a textbox
//Import: put the data from the textbox in the localstorage
function XioExport(){
	//note that it only exports the current realm
	$(".XioProperty").remove();
	$("#topblock").append("<br class=XioProperty><textarea id=XEarea class=XioProperty style='width: 900px'></textarea>");	
	$("#XEarea").text(ls["XS"+realm]).height($("#XEarea")[0].scrollHeight);
}

function XioImport(){
	//note that it only imports to this realm
	$(".XioProperty").remove();
	$("#topblock").append("<br class=XioProperty><textarea id=XIarea class=XioProperty style='width: 900px'></textarea><br class=XioProperty><input type=button id=XioSave class=XioProperty value=Save!>");
	
	$(document).on('input propertychange', "#XIarea", function(){
		$("#XIarea").height($("#XIarea")[0].scrollHeight);
	});
	
	$("#XioSave").click(function(){
		let string = $("#XIarea").val();
		ls["XS"+realm] = string;
		document.location.reload();
	});	
	
}

//the calc functions are function relating to the formula's used inside virtonomics
//these functions are used throughout all other functions
function calcSalary(sn, sc, kn, kc, kr){
	// s = salary, k = skill, n = now, c = city, r = required
	let calc = sn > sc? kn - kc * Math.log( 1 + sn / sc ) / Math.log(2)	: Math.pow( sc / sn , 2) * kn - kc;	
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
	
	let effi = [];
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
	console.log(manager / calcTopTech(techLevel), manager / calcTop1(employees, qualification, factor1));
	return Math.max(Math.min(6/5, manager / calcTopTech(techLevel), manager / calcTop1(employees, qualification, factor1)), 5/6);
}

//show the top manager stats 
//but no Russian support yet!
function topManagerStats(){
	let url = "/"+realm+"/main/user/privat/persondata/knowledge";
	
	$.ajax({
		url: url,				
		type: "GET",

		success: function(html, status, xhr){
						
			let qual = map(html, url, "manager");
			let here = map(document, "here", "main");
			
			console.log(qual);
			
			let factor1 = subType[here.img][0];
			let factor3 = subType[here.img][1];			
			
			let managerIndex = qual.pic.indexOf(here.managerPic);
						
			if(managerIndex >= 0){
				
				console.log("new", qual);
				
				let managerBase = qual.base[managerIndex];
				let managerTotal = here.qual;
				let ov1 = calcOverflowTop1(here.maxEmployees, factor3, managerTotal);
				let ov3 = calcOverflowTop3(here.employees, here.skillNow, here.techLevel, factor1, managerTotal);
								
				$(".unit_box:has(.fa-users) tr:not(:has([colspan])):eq(3) td:eq(1)").append( " (current)"
					+"<div style='color: darkgreen'>"+(Math.floor(calcSkill(here.employees, factor1, managerBase)*100)/100).toFixed(2)+" (target) </div>"
					+"<div style='color: indigo'>"+(Math.floor(calcSkill(here.employees, factor1, managerTotal)*100)/100).toFixed(2)+" (maximum) </div>"
					+"<div style='color: crimson'>"+(Math.floor(calcSkill(here.employees, factor1, managerTotal*ov1)*100)/100).toFixed(2)+" (overflow) </div>"
				);
				
				$(".unit_box:has(.fa-users) tr:not(:has([colspan])):eq(0) td:eq(1)").append( " (current)"
					+"<div style='color: darkgreen'>"+Math.floor(calcEmployees(here.skillNow, factor1, managerBase)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")+" (target) </div>"
					+"<div style='color: indigo'>"+Math.floor(calcEmployees(here.skillNow, factor1, managerTotal)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")+" (maximum) </div>"
					+"<div style='color: crimson'>"+Math.floor(calcEmployees(here.skillNow, factor1, managerTotal*ov1)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")+" (overflow) </div>"
				);
				
				$(".unit_box:has(.fa-user) tr:not(:has([colspan])):eq(2) td:eq(1)").append( " (current)"
					+"<div style='color: darkgreen'>"+Math.floor(calcAllEmployees(factor3, managerBase)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")+" (target) </div>"
					+"<div style='color: indigo'>"+Math.floor(calcAllEmployees(factor3, managerTotal)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")+" (maximum) </div>"
					+"<div style='color: crimson'>"+Math.floor(calcAllEmployees(factor3, managerTotal)*ov3).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")+" (overflow) </div>"
				);
				
				$(".unit_box:has(.fa-cogs) tr:not(:has([colspan])):eq(2) td:eq(1)").append( " (current)"
					+"<div style='color: darkgreen'>"+(Math.floor(calcEquip(calcSkill(here.employees, factor1, managerBase))*100)/100).toFixed(2)+" (target) </div>"
					+"<div style='color: indigo'>"+(Math.floor(calcEquip(calcSkill(here.employees, factor1, managerTotal))*100)/100).toFixed(2)+" (maximum) </div>"
					+"<div style='color: crimson'>"+(Math.floor(calcEquip(calcSkill(here.employees, factor1, managerTotal*ov1))*100)/100).toFixed(2)+" (overflow) </div>"
				);
				
				$(".unit_box:has(.fa-industry) tr:not(:has([colspan])):eq(2) td:eq(1)").append( " (current)"
					+"<div style='color: darkgreen'>"+Math.floor(calcTechLevel(managerBase))+" (target) </div>"
					+"<div style='color: indigo'>"+Math.floor(calcTechLevel(managerTotal))+" (maximum) </div>"
					+"<div style='color: crimson'>"+Math.floor(calcTechLevel(managerTotal*ov1))+" (overflow) </div>"
				);
				
				$(".unit_box:has(.fa-tasks) tr:not(:has([colspan])):eq(7)").after( ""
					+"<tr style='color: blue'><td>Expected top manager efficiency</td><td>"+calcEfficiency(here.employees, here.maxEmployees, managerTotal, factor1, factor3, here.skillNow, here.techLevel)+"</td></tr>"
				);	
				
				
			}
			else{
				
				console.log("old", qual);
				
				managerIndex = qual.pic.indexOf(subType[here.img][2]);
				let managerBase = qual.base[managerIndex];
				let managerTotal = managerBase + qual.bonus[managerIndex];
				
				function placeText($place, text, value, color){
					$place.html($place.html()+"<br><span style='color: "+color+"'><b>"+value+"</b>"+text+"</span>");			
				}
				
				let $qualRow = $("tr:contains('Qualification of employees'), tr:contains('Qualification of scientists'), \n\
							  tr:contains('Workers qualification')");
				let $levelRow = $("tr:contains('Qualification of player')");
				let $empRow = $("tr:contains('Number of employees'), tr:contains('Number of scientists'),\n\
									tr:contains('Number of workers')");
				let $totalEmpRow = $("tr:contains('profile qualification')");
				let $techRow = $("tr:contains('Technology level'), tr:contains('Current research')");
				let $equipRow = $("tr:contains('Equipment quality'), tr:contains('Computers quality'),\n\
					 tr:contains('Livestock quality'), tr:contains('Quality of agricultural machines')");
				let $effiRow =  $("tr:contains('Top manager efficiency')");       
				
				let amount = numberfy($empRow.find("td:eq(1)").text());
				let skill = numberfy($qualRow.find("td:eq(1)").text());
				let level = numberfy($levelRow.find("td:eq(1)").text());
				let totalEmp = numberfy($totalEmpRow.find("td:eq(1)").text());
				let tech = numberfy($techRow.find("td:eq(1)").text());
				let eqQual = numberfy($equipRow.find("td:eq(1)").text());
							
				ov1 = calcOverflowTop1(totalEmp, factor3, managerTotal);
				ov3 = calcOverflowTop3(amount, skill, tech, factor1, managerTotal);
				console.log(ov1, ov3, here);
										
				placeText($empRow.find("td:eq(1)")," (target)", Math.floor(calcEmployees(skill, factor1, managerBase)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " "), "darkgreen");       
				placeText($empRow.find("td:eq(1)")," (maximum)", Math.floor(calcEmployees(skill, factor1, managerTotal)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " "), "indigo");
				placeText($empRow.find("td:eq(1)")," (overflow)", Math.floor(calcEmployees(skill, factor1, managerTotal*ov1)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " "), "crimson");
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
				placeText($effiRow.find("td:eq(1)"), " (Expected top manager efficiency)", calcEfficiency(amount, totalEmp, managerTotal, factor1, factor3, skill, tech), "blue");
				
			}			
		}		
	});
}

//this function should reduce the time you have to wait during the subdivision building
//seems a bit buggy though
function buildingShortener(){
	$( document ).ajaxSuccess(function( event, xhr, settings ) {
		
		let newUrl = $(xhr.responseText).find("#mainContent form").attr("action");			

		if(new RegExp("\/.*\/main\/unit\/create\/[0-9]+").test(newUrl)){
			
			$("#mainContent").html($(xhr.responseText).find("#mainContent").html());
			
			$(":submit:not([name=next])").remove();	
			
			let $form = $("form:eq(1)");		
			$form.submit(function(event){
				event.preventDefault();
				$.post(newUrl, $form.serialize());
			});				
			
		}	
		else{
			let $form = $("form:eq(1)");
			$form.off("submit");
			newUrl && window.location.replace(newUrl);
		}
		
	});
	
	let $form = $("form:eq(1)");
	$(":submit:not([name=next])").remove();
	
	$form.submit(function(event){
		event.preventDefault();
		$.post(document.URL, $form.serialize());
	});	
}

//determines which functions to run based on which page where at
function XioScript(){
	
	console.log("XioScript 12 is running!");	
	
	//Add XioOverview to the top bar
	if(new RegExp(".*\/main\/.*").test(document.URL)){
		let $tag = $("#menutop ul:eq(0) li:not([class]):eq(0)").clone();
		$tag.find("a").text("XioOverview").attr("href", "/"+realm+"/main/company/view/"+companyid+"/");
		$("#menutop ul:eq(0)").append($tag);
	}
	
	//XioOverview
	if(new RegExp("\/.*\/main\/company\/view\/[0-9]+\/$").test(document.URL)){
        $("#topblock").append("<div style='font-size: 24px; color:gold; margin-bottom: 5px;'>XioScript "+version+"</div>"
							 +"<input type=button id=XM class=XioGo value=XioMaintenance>"
							 +"<input type=button id=XE class=XioGo value=Export>"
							 +"<input type=button id=XI class=XioGo value=Import>");		
						  
		$("#XM").click(function(){
			runG(XioMaintenance);
		});		
		$("#XE").click(function(){
			XioExport();
		});	
		$("#XI").click(function(){
			XioImport();
		});		
		
		runG(XioOverview);	
    }
	
	//page options (for the extra number of subdivisions per page)
	if($(".pager_options").length){
		$(".pager_options").append( $(".pager_options :eq(1)")[0].outerHTML.replace(/10/g, "1000") 
								   +$(".pager_options :eq(1)")[0].outerHTML.replace(/10/g, "2000") 
								   +$(".pager_options :eq(1)")[0].outerHTML.replace(/10/g, "4000") 
								   +$(".pager_options :eq(1)")[0].outerHTML.replace(/10/g, "10000") 
								   +$(".pager_options :eq(1)")[0].outerHTML.replace(/10/g, "20000") 
		);
	}
	
	//Not user company: we should use any building or top manager function here
	if($(".officePlace a").attr("href") + "/dashboard" !== $(".dashboard a").attr("href") && !!$(".officePlace > a").length || !!$(".officePlace tr:eq(1) a").length){
		return false;
	}
	
	//Building
	if(new RegExp("\/.*\/main\/unit\/create\/[0-9]+").test(document.URL)){
		buildingShortener();
	}
	
	//Top Manager
    if(new RegExp("\/.*\/main\/unit\/view\/[0-9]+$").test(document.URL) && ($(".fa-users").length === 1 || $("[href*='/window/unit/employees/engage/']").length === 1)){
		topManagerStats();
	}	
}

//let's roll
document.onreadystatechange = function () {
    if (document.readyState == "complete") {
        XioScript();
    }
}
document.onreadystatechange();
