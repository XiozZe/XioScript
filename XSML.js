console.log("XSML Loaded!");

function numberfy(variable){
	return parseFloat(String(variable).replace(/[\s\$\%]/g, "")) || 0;
}

var XSML = {
	mainList:{
		regExp: "\/.*\/main\/company\/view\/[0-9]+\/unit_list$",
		subName: {
			path: "[class^='info '] a",
			type: "item",
			mod: function($x){
				return $x.text();
			}
		},
		subType: {
			path: "[class^='info ']",
			type: "item",
			mod: function($x){
				return $x.attr("class").split("i-")[1].replace(" mapTooltip", "");
			}
		},
		subId: {
			path: ".unit_id",
			type: "item",
			mod: function($x){
				return numberfy($x.text());
			}
		},
		yelName: {
			path: ".ui-selected [class^='info '] a",
			type: "item",
			mod: function($x){
				return $x.text();
			}
		},
		yelType: {
			path: ".ui-selected [class^='info ']",
			type: "item",
			mod: function($x){
				return $x.attr("class").split("i-")[1].replace(" mapTooltip", "");
			}
		},
		yelId: {
			path: ".ui-selected .unit_id",
			type: "item",
			mod: function($x){
				return numberfy($x.text());
			}
		},
		compId: {
			path: ".unit-top a:has(img)",
			type: "item",
			mod: function($x){
				var href = $x.attr("href");
				return numberfy(href.substring(href.lastIndexOf("/")+1, href.length));
			}
		}
	},
	prodMain:{
		regExp: "\/.*\/main\/unit\/view\/[0-9]+(\/?)$",
		equipQual : {
			path: "tr:has(td.control):eq(0) ~ tr:eq(2):not(:has(.progress_bar)) td:eq(1)",
			type: "item", 
			mod: function($x){
				return numberfy($x.text());
			}
		},
		wearPerc : {
			path: "tr:has(td.control):eq(0) ~ tr:eq(3):has(.progress_bar) td:eq(1)",
			type: "item",
			mod: function($x){
				return numberfy($x.text());
			}
		},
		wearFull : {
			path: "tr:has(td.control):eq(0) ~ tr:eq(3):has(.progress_bar) td:eq(1)",
			type: "item",
			mod: function($x){
				return numberfy($x.text().split("(")[1]);
			}
		},
		emplNum : {
			path: "tr:has(td.control):eq(1) td:eq(1)",
			type: "item", 
			mod: function($x){
				return numberfy($x.text());
			}
		},
		emplSkill : {
			path: "tr:has(td.control):eq(1) ~ tr:eq(3):not(:has(img, .progress_bar)) td:eq(1)",
			type: "item", 
			mod: function($x){
				return numberfy($x.text());
			}
		},
		managerQual : {
			path: "tr:has(td.control):eq(2) ~ tr:eq(0) td:eq(1)",
			type: "item",
			mod: function($x){
				return numberfy($x.text());
			}
		},
		emplAll : {
			path: "tr:has(td.control):eq(2) ~ tr:eq(1) td:eq(1)",
			type: "item", 
			mod: function($x){
				return numberfy($x.text());
			}
		}
	},	
	prodSupply:{
		regExp: "\/.*\/main\/unit\/view\/[0-9]+\/supply$",
		required: {
			path: ".list td:nth-child(2) table tr:nth-child(1) td:nth-child(2)",
			type: "item",
			mod: function($x){
				return numberfy($x.text());
			}
		},
		stock: {
			path: ".list td:nth-child(3) table tr:nth-child(1) td:nth-child(2)",
			type: "item",
			mod: function($x){
				return numberfy($x.text());
			}
		},
		parcel: {
			path: "input[type=type]",
			type: "input",
			mod: function($x){
				return numberfy($x.val());
			},
			edit: function($x, value){
				return $x.val(value);
			}
		},
		avail: {
			path: "[id^=quantity] tr:nth-child(2) td:nth-child(2)",
			type: "item",
			mod: function($x){					
				return $x.text() === "Unlim."? $x.text() : numberfy( $x.text() );
			}
		},
		edit: {
			path: "[name=applyChanges]",
			type: "submit",
			form: "editForm"
		},
		editForm: {
			path: "[name=supplyContractForm]",
			type: "form",
			mod: function($form){				
				return $form.append($form.find("[name=applyChanges]").clone().wrap("<p></p>").parent().html().replace("submit","hidden"));			
			},
		}				
	},
	prodSale:{
		regExp: "\/.*\/main\/unit\/view\/[0-9]+\/sale$",
		stock: {
			path: "td:has('table'):nth-child(5)  tr:nth-child(1) td:nth-child(2)",
			type: "item",
			mod: function($x){
				return numberfy($x.text());
			}
		},
		primeCost: {
			path: "td:has('table'):nth-child(5)  tr:nth-child(3) td:nth-child(2)",
			type: "item",
			mod: function($x){
				return numberfy($x.text());
			}
		},
		primeQuality: {
			path: "td:has('table'):nth-child(5) tr:nth-child(2) td:nth-child(2)",
			type: "item",
			mod: function($x){
				return numberfy($x.text());
			}
		},
		available: {
			path: "td:nth-child(7)",
			type: "item",
			mod: function($x){
				return numberfy($x.text());
			}
		},
		price: {
			path: "input.money:even",
			type: "input",
			mod: function($x){
				return numberfy($x.val());
			},
			edit: function($x, value){
				return $x.val(value);
			}
		},
		policy: {
			path: "select:even",
			type: "input",
			mod: function($x){
				return $x.find("[selected]").text();
			},
			edit: function($x, value){
				return $x.val($x.find(":contains("+value+")").val());
			}
		},
		save: {
			path: ":submit.button205:not([name])",
			type: "submit",
			form: "form"
		},
		form: {
			path: "[name=storageForm]",
			type: "form",
			mod: function($form){
				return $form;
			}
		}			
	},
	storeMain:{
		regExp: "\/.*\/main\/unit\/view\/[0-9]+(\/?)$",
		emplNum : {
			path: "tr:has(td.control):eq(1) td:eq(1)",
			type: "item", 
			mod: function($x){
				return numberfy($x.text());
			}
		},
		emplSkill : {
			path: "tr:has(td.control):eq(1) ~ tr:eq(2) td:eq(1)",
			type: "item", 
			mod: function($x){
				return numberfy($x.text());
			}
		},
		visitors : {
			path: "tr:has(td.control):eq(2) ~ tr:eq(3) td:eq(1)",
			type: "item",
			mod: function($x){
				return numberfy($x.text());
			}
		},		
		serviceLevel : {
			path: "tr:has(td.control):eq(2) ~ tr:eq(4) .productivity_hint .title",
			type: "item",
			mod: function($x){
				return $x.text();
			}
		},
		managerQual : {
			path: "tr:has(td.control):eq(4) ~ tr:eq(0) td:eq(1)",
			type: "item",
			mod: function($x){
				return numberfy($x.text());
			}
		},
		emplAll : {
			path: "tr:has(td.control):eq(4) ~ tr:eq(1) td:eq(1)",
			type: "item", 
			mod: function($x){
				return numberfy($x.text());
			}
		}
	},	
	storeTrade:{
		regExp: "\/.*\/main\/unit\/view\/[0-9]+\/trading_hall$",
		checkbox : {
			path: ":checkbox[name^=product]",
			type: "input",
			mod: function($x){
				return $x.is(":checked");
			},
			edit: function($x, value){
				return $x.prop("checked", value);
			}				
		},
		sales : {
			path: ".nowrap:nth-child(4)",
			type: "item",
			mod: function($x){
				return numberfy($x.text());
			}
		},
		itemId : {
			path: ".nowrap:nth-child(4) a",
			type: "item",
			mod: function($x){
				return numberfy( $x.attr("href").match(/\d+\/$/) );
			}
		},
		order : {
			path: ".nowrap:nth-child(5)",
			type: "item",
			mod: function($x){
				return numberfy($x.text());
			}
		},
		delivered : {
			path: ".nowrap:nth-child(5)",
			type: "item",
			mod: function($x){
				return numberfy($x.text().split("[")[1]);
			}
		},
		stock : {
			path: ".nowrap:nth-child(6)",
			type: "item",
			mod: function($x){
				return numberfy($x.text());
			}
		},
		qualStore : {
			path: ".nowrap:nth-child(7)",
			type: "item",
			mod: function($x){
				return numberfy($x.text());
			}
		},
		brandStore : {
			path: ".nowrap:nth-child(8)",
			type: "item",
			mod: function($x){
				return numberfy($x.text());
			}
		},
		pricePurc : {
			path: ".nowrap:nth-child(9)",
			type: "item",
			mod: function($x){
				return numberfy($x.text());
			}
		},
		priceSale : {
			path: ":text",
			type: "input",
			mod: function($x){
				return numberfy($x.val());
			},
			edit: function($x, value){
				return $x.val(value);
			}
		},
		share : {
			path: ".nowrap:nth-child(11)",
			type: "item",
			mod: function($x){
				return numberfy($x.text());
			}
		},
		priceCity : {
			path: ".nowrap:nth-child(12)",
			type: "item",
			mod: function($x){
				return numberfy($x.text());
			}
		},
		qualCity : {
			path: ".nowrap:nth-child(13)",
			type: "item",
			mod: function($x){
				return numberfy($x.text());
			}
		},
		brandCity : {
			path: ".nowrap:nth-child(14)",
			type: "item",
			mod: function($x){
				return numberfy($x.text());
			}
		},
		setprice : {
			path: "[name=setprice]",
			type: "submit",
			form: "priceForm"
		},
		priceForm : {
			path: "form[name=tradingHallForm]",
			type: "form",
			mod: function($form){
				$form[0]['action'].value = "setprice";
				return $form;
			}
		},
		eliminate: {
			path: "[name=terminate]",	
			type: "submit",
			form: "eliminateForm"
		},
		eliminateForm : {
			path: "form[name=tradingHallForm]",
			type: "form",
			mod: function($form){
				$form[0]['action'].value = "terminate";
				return $form;
			}
		}
	},
	storeSupply:{
		regExp: "\/.*\/main\/unit\/view\/[0-9]+\/supply$",
		quantity: {
			path: "td:nth-child(2) table:nth-child(1) tr:nth-child(1) td:nth-child(2)",
			type: "item",
			mod: function($x){
				return numberfy($x.text());
			}
		},
		sold: {
			path: "td:nth-child(2) table:nth-child(1) tr:nth-child(5) td:nth-child(2)",
			type: "item",
			mod: function($x){
				return numberfy($x.text());
			}
		},
		supplyInput: {
			path: "input:text[name^='supplyContractData[party_quantity]']",
			type: "input",
			mod: function($x){
				return numberfy($x.val());
			},
			edit: function($x, value){
				return $x.val(value);
			}
		},
		supplyMax: {
			path: ".list td:nth-child(6)",
			type: "item",
			mod: function($x){
				return numberfy( $x.text().split(": ")[1] );
			}
		},
		avail: {
			path: ".list td:nth-child(10) tr:nth-child(3) td:nth-child(2)",
			type: "item",
			mod: function($x){					
				return $x.text() === "Unlim."? $x.text() : numberfy( $x.text() );
			}
		},
		checkbox: {
			path: ".destroy",
			type: "input",
			mod: function($x){
				return $x.is(":checked");
			},
			edit: function($x, value){
				return $x.prop("checked", value);
			}				
		},
		edit: {
			path: "[name=applyChanges]",
			type: "submit",
			form: "supplyForm"
		},
		supplyForm: {
			path: "form[name=supplyContractForm]",
			type: "form",
			mod: function($form){				
				return $form.append($form.find("[name=applyChanges]").clone().wrap("<p></p>").parent().html().replace("submit","hidden"));			
			}
		},
		cancel: {
			path: "[name=destroy]",	
			type: "submit",
			form: "destroyForm"
		},
		destroyForm: {
			path: "form[name=supplyContractForm]",
			type: "form",
			mod: function($form){
				if($form.find("[name=destroy]").length){
					return $form.append($form.find("[name=destroy]").clone().wrap("<p></p>").parent().html().replace("submit","hidden"));
				}
				else return $form;
			}
		}
	},
	serviceMain:{
		regExp: "\/.*\/main\/unit\/view\/[0-9]+(\/?)$",
		equipQual : {
			path: "tr:has(td.control):eq(0) ~ tr:eq(3):not(:has(.progress_bar)) td:eq(1)",
			type: "item", 
			mod: function($x){
				return numberfy($x.text());
			}
		},
		wearPerc : {
			path: "tr:has(td.control):eq(0) ~ tr:eq(4):has(.progress_bar) td:eq(1)",
			type: "item",
			mod: function($x){
				return numberfy($x.text());
			}
		},
		wearFull : {
			path: "tr:has(td.control):eq(0) ~ tr:eq(4):has(.progress_bar) td:eq(1)",
			type: "item",
			mod: function($x){
				return numberfy($x.text().split("(")[1]);
			}
		},
		emplNum : {
			path: "tr:has(td.control):eq(1) td:eq(1)",
			type: "item", 
			mod: function($x){
				return numberfy($x.text());
			}
		},
		emplSkill : {
			path: "tr:has(td.control):eq(1) ~ tr:eq(2) td:eq(1)",
			type: "item", 
			mod: function($x){
				return numberfy($x.text());
			}
		},
		visitorsNum : {
			path: ".infoblock .infoblock tbody > tr:eq(1) td:eq(1)",
			type: "item", 
			mod: function($x){
				return numberfy($x.text());
			}
		},
		visitorsMax : {
			path: ".infoblock .infoblock tbody > tr:eq(1) td:eq(1)",
			type: "item", 
			mod: function($x){
				return numberfy($x.text().split(": ")[1]);
			}
		},
		priceOld: {
			path: ".infoblock .infoblock a",
			type: "item",
			mod: function($x){
				return numberfy($x.text());
			}
		},
		priceNew: {
			path: "[name=servicePrice]",
			type: "input",
			mod: function($x){
				return numberfy($x.val());
			},
			edit: function($x, value){
				return $x.val(value);
			}
		},
		managerQual : {
			path: "tr:has(td.control):eq(4) ~ tr:eq(0) td:eq(1)",
			type: "item",
			mod: function($x){
				return numberfy($x.text());
			}
		},
		emplAll : {
			path: "tr:has(td.control):eq(4) ~ tr:eq(1) td:eq(1)",
			type: "item", 
			mod: function($x){
				return numberfy($x.text());
			}
		},
		setprice : {
			path: "[name=setprice]",
			type: "submit",
			form: "priceForm"
		},
		priceForm : {
			path: "form[name=servicePriceForm]",
			type: "form",
			mod: function($form){				
				return $form.append($form.find("[name=setprice]").clone().wrap("<p></p>").parent().html().replace("submit","hidden"));			
			}
		}	
	},	
	medicalMain:{
		regExp: "\/.*\/main\/unit\/view\/[0-9]+(\/?)$",
		equipQual : {
			path: "tr:has(td.control):eq(0) ~ tr:eq(2) td:eq(1)",
			type: "item", 
			mod: function($x){
				return numberfy($x.text());
			}
		},
		wearPerc : {
			path: "tr:has(td.control):eq(0) ~ tr:eq(3):has(.progress_bar) td:eq(1)",
			type: "item",
			mod: function($x){
				return numberfy($x.text());
			}
		},
		wearFull : {
			path: "tr:has(td.control):eq(0) ~ tr:eq(3):has(.progress_bar) td:eq(1)",
			type: "item",
			mod: function($x){
				return numberfy($x.text().split("(")[1]);
			}
		},
		emplNum : {
			path: "tr:has(td.control):eq(1) td:eq(1)",
			type: "item", 
			mod: function($x){
				return numberfy($x.text());
			}
		},
		emplSkill : {
			path: "tr:has(td.control):eq(1) ~ tr:eq(2) td:eq(1)",
			type: "item", 
			mod: function($x){
				return numberfy($x.text());
			}
		},
		visitorsNum : {
			path: ".infoblock .infoblock tr:eq(1) td:eq(1)",
			type: "item", 
			mod: function($x){
				return numberfy($x.text());
			}
		},
		visitorsMax : {
			path: ".infoblock .infoblock tr:eq(1) td:eq(1)",
			type: "item", 
			mod: function($x){
				return numberfy($x.text().split(": ")[1]);
			}
		},
		priceOld: {
			path: ".infoblock .infoblock a",
			type: "item",
			mod: function($x){
				return numberfy($x.text());
			}
		},
		priceNew: {
			path: "[name=servicePrice]",
			type: "input",
			mod: function($x){
				return numberfy($x.val());
			},
			edit: function($x, value){
				return $x.val(value);
			}
		},
		managerQual : {
			path: "tr:has(td.control):eq(4) ~ tr:eq(0) td:eq(1)",
			type: "item",
			mod: function($x){
				return numberfy($x.text());
			}
		},
		emplAll : {
			path: "tr:has(td.control):eq(4) ~ tr:eq(1) td:eq(1)",
			type: "item", 
			mod: function($x){
				return numberfy($x.text());
			}
		},
		setprice : {
			path: "[name=setprice]",
			type: "submit",
			form: "priceForm"
		},
		priceForm : {
			path: "form[name=servicePriceForm]",
			type: "form",
			mod: function($form){				
				return $form.append($form.find("[name=setprice]").clone().wrap("<p></p>").parent().html().replace("submit","hidden"));			
			}
		}	
	},
	gasMain:{
		regExp: "\/.*\/main\/unit\/view\/[0-9]+(\/?)$",
		equipQual : {
			path: "tr:has(td.control):eq(0) ~ tr:eq(2) td:eq(1)",
			type: "item", 
			mod: function($x){
				return numberfy($x.text());
			}
		},
		wearPerc : {
			path: "tr:has(td.control):eq(0) ~ tr:eq(3):has(.progress_bar) td:eq(1)",
			type: "item",
			mod: function($x){
				return numberfy($x.text());
			}
		},
		wearFull : {
			path: "tr:has(td.control):eq(0) ~ tr:eq(3):has(.progress_bar) td:eq(1)",
			type: "item",
			mod: function($x){
				return numberfy($x.text().split("(")[1]);
			}
		},
		emplNum : {
			path: "tr:has(td.control):eq(1) td:eq(1)",
			type: "item", 
			mod: function($x){
				return numberfy($x.text());
			}
		},
		emplSkill : {
			path: "tr:has(td.control):eq(1) ~ tr:eq(2) td:eq(1)",
			type: "item", 
			mod: function($x){
				return numberfy($x.text());
			}
		},
		managerQual : {
			path: "tr:has(td.control):eq(4) ~ tr:eq(0) td:eq(1)",
			type: "item",
			mod: function($x){
				return numberfy($x.text());
			}
		},
		emplAll : {
			path: "tr:has(td.control):eq(4) ~ tr:eq(1) td:eq(1)",
			type: "item", 
			mod: function($x){
				return numberfy($x.text());
			}
		}
	},	
	officeMain:{
		regExp: "\/.*\/main\/unit\/view\/[0-9]+(\/?)$",
		emplNum: {
			path: "tr:has(td.control):eq(1) td:eq(1)",
			type: "item", 
			mod: function($x){
				return numberfy($x.text());
			}
		},
		emplSkill: {
			path: "tr:has(td.control):eq(1) ~ tr:eq(2) td:eq(1)",
			type: "item", 
			mod: function($x){
				return numberfy($x.text());
			}
		},
		equipQual: {
			path: "tr:has(td.control):eq(2) ~ tr:eq(1) td:eq(1)",
			type: "item", 
			mod: function($x){
				return numberfy($x.text());
			}
		},
		wearPerc: {
			path: "tr:has(td.control):eq(2) ~ tr:eq(2) td:eq(1)",
			type: "item",
			mod: function($x){
				return numberfy($x.text());
			}
		},
		wearFull: {
			path: "tr:has(td.control):eq(2) ~ tr:eq(2) td:eq(1)",
			type: "item",
			mod: function($x){
				return numberfy($x.text().split("(")[1]);
			}
		},
		managerQual: {
			path: "tr:has(td.control):eq(4) td:eq(1)",
			type: "item",
			mod: function($x){
				return numberfy($x.text());
			}
		},
		emplAll: {
			path: "tr:has(td.control):eq(4) ~ tr:eq(0) td:eq(1)",
			type: "item", 
			mod: function($x){
				return numberfy($x.text());
			}
		}
	},	
	wareMain: {
		size: {
			path: ".infoblock tr:eq(0) td:eq(1)",
			type: "item",
			mod: function($x){
				return numberfy($x.text());
			}
		},
		full: {
			path: ".infoblock tr:eq(6) td:eq(1)",
			type: "item",
			mod: function($x){
				return numberfy($x.text());
			}
		}
	},
	salary:{
		regExp: "\/.*\/window\/unit\/employees\/engage\/[0-9]+$",
		number: {
			path: "#quantity",
			type: "input",
			mod: function($x){
				return numberfy($x.val());
			},
			edit: function($x, value){
				return $x.val(value);
			}
		},
		salaryNow: {
			path: "#salary",
			type: "input",
			mod: function($x){
				return numberfy($x.val());
			},
			edit: function($x, value){
				return $x.val(value);
			}
		},
		salaryCity: {
			path: "tr:eq(3) td",
			type: "item",
			mod: function($x){
				return numberfy($x.text().split("$")[1]);
			}
		},
		skillNow: {
			path: "#apprisedEmployeeLevel",
			type: "item",
			mod: function($x){
				return numberfy($x.text());
			}
		},
		skillCity: {
			path: "div span[id]:eq(1)",
			type: "item",
			mod: function($x){
				return numberfy($x.text().match(/\d+(\.\d+)?/)[0]);
			}
		},
		skillRequired: {
			path: "div span[id]:eq(1)",
			type: "item",
			mod: function($x){
				return numberfy($x.text().split(",")[1]);
			}
		},
		save: {
			path: ":submit.button160",
			type: "submit",
			form: "form"
		},
		form: {
			path: "form",
			type: "form",
			mod: function($form){
				return $form;
			}
		}
	},
	training:{
		regExp: "\/.*\/window\/unit\/employees\/education\/[0-9]+$",
		duration : {
			path: "#unitEmployeesData_timeCount",
			type: "input",
			mod: function($x){
				return numberfy($x.val());
			},
			edit: function($x, value){
				return $x.val(value);
			}
		},
		number : {
			path: ".list td:eq(0)",
			type: "item",
			mod: function($x){
				return numberfy($x.text());
			}
		},
		salaryCur : {
			path: ".list td:eq(8)",
			type: "item",
			mod: function($x){
				return numberfy($x.text());
			}
		},
		salaryCity : {
			path: ".list td:eq(9)",
			type: "item",
			mod: function($x){
				return numberfy($x.text().split("$")[1]);
			}
		},
		train : {
			path: ":submit",
			type: "submit",
			form: "form"
		},
		form : {
			path: "form",
			type: "form",
			mod: function($form){
				return $form;
			}
		}
	},
	equipment:{
		regExp: "\/.*\/window\/unit\/equipment\/[0-9]+$",
		price : {
			path: ".digits:contains($):odd:odd",
			type: "item",
			mod: function($x){
				return numberfy($x.text());
			}
		},
		quality : {
			path: ".digits:not(:contains($)):odd",
			type: "item",
			mod: function($x){
				return numberfy($x.text());
			}
		},
		avail : {
			path: ".digits:not(:contains($)):even",
			type: "item",
			mod: function($x){
				return numberfy($x.text());
			}
		},
		offer : {
			path: ".choose span",
			type: "item",
			mod: function($x){
				return numberfy($x.attr("id"));
			}
		}
	},
	changeName: {			
		regExp: "\/.*\/window\/unit\/changename\/[0-9]+$",
		defaultValue: {
			path: "span:eq(1)",
			type: "item",
			mod: function($x){
				return $x.text().substring($x.text().indexOf(":")+2).trim();
			}
		},
		city: {
			path: ".unit_company",
			type: "item",
			mod: function($x){
				return $x.text().substring($x.text().indexOf(" ")+1).trim();
			}
		},
		intName: {
			path: "#international_name",
			type: "input",
			mod: function($x){
				return $x.val();
			},
			edit: function($x, value){
				return $x.val(value);
			}
		},
		save: {
			path: "#save",
			type: "submit",
			form: "form"
		},
		form: {
			path: "form",
			type: "form",
			mod: function($form){
				return $form;
			},
		}
	},
	closeEnterprise: {			
		regExp: "\/.*\/window\/unit\/close\/[0-9]+$",
		close : {
			path: "[name=close_unit]",
			type: "submit",
			form: "form"
		},
		form : {
			path: "form",
			type: "form",
			mod: function($form){
				if($form.find("[name=close_unit]").length){
					return $form.append($form.find("[name=close_unit]").clone().wrap("<p></p>").parent().html().replace("submit","hidden"));
				}
				else return $form;
			},
		}
	},
	build1:{
		regExp: "\/.*\/main\/unit\/create\/[0-9]+(\/step1)?$",
		subClass: {
			path: ".list:eq(0) td:nth-child(3)",
			type: "item",
			mod: function($x){
				return $x.text().trim();
			}
		},
		radio: {
			path: ":radio",
			type: "input",
			mod: function($x){
				return $x.is(":checked");
			},
			edit: function($x, value){
				return $x.prop("checked", value);
			},				
		},
		next: {
			path: ":submit[name=next]",
			type: "submit", 
			form: "form"
		},
		form: {
			path: "form:has(.list)",
			type: "form",
			mod: function($x){
				return $x;
			}
		}
	},
	build1type:{
		regExp: "\/.*\/main\/unit\/create\/[0-9]+\/step1-type-select$",
		subType: {
			path: ".list:eq(0) td:nth-child(3)",
			type: "item",
			mod: function($x){
				return $x.text().trim();
			}
		},
		radio: {
			path: ":radio",
			type: "input",
			mod: function($x){
				return $x.is(":checked");
			},
			edit: function($x, value){
				return $x.prop("checked", value);
			},				
		},
		next: {
			path: ":submit[name=next]",
			type: "submit", 
			form: "form"
		},
		form: {
			path: "form:has(.list)",
			type: "form",
			mod: function($x){
				return $x;
			}
		}
	},
	build1prod:{
		regExp: "\/.*\/main\/unit\/create\/[0-9]+\/step1-type-select$",
		subType: {
			path: ".zavod_list label",
			type: "item",
			mod: function($x){
				return $x.text().trim();
			}
		},
		radio: {
			path: ".zavod_list :radio",
			type: "input",
			mod: function($x){
				return $x.is(":checked");
			},
			edit: function($x, value){
				return $x.prop("checked", value);
			},			
		},
		next: {
			path: ":submit[name=next]:eq(1)",
			type: "submit", 
			form: "form"
		},
		form: {
			path: "form.zavod_list",
			type: "form",
			mod: function($x){
				return $x;
			}
		}
	},
	build2:{
		regExp: "\/.*\/main\/unit\/create\/[0-9]+\/step2$",
		country: {
			path: ".list:eq(0) td:nth-child(2)",
			type: "item",
			mod: function($x){
				return $x.text().trim();
			}
		},
		radio: {
			path: ":radio",
			type: "input",
			mod: function($x){
				return $x.is(":checked");
			},
			edit: function($x, value){
				return $x.prop("checked", value);
			},				
		},
		next: {
			path: ":submit[name=next]",
			type: "submit", 
			form: "form"
		},
		form: {
			path: "form:has(.list)",
			type: "form",
			mod: function($x){
				return $x;
			}
		}
	},
	build2farm:{
		regExp: "\/.*\/main\/unit\/create\/[0-9]+\/step2-farm$",
		culture: {
			path: ".list:eq(0) td:nth-child(2)",
			type: "item",
			mod: function($x){
				return $x.text().trim();
			}
		},
		radio: {
			path: ":radio",
			type: "input",
			mod: function($x){
				return $x.is(":checked");
			},
			edit: function($x, value){
				return $x.prop("checked", value);
			},				
		},
		next: {
			path: ":submit[name=next]",
			type: "submit", 
			form: "form"
		},
		form: {
			path: "form:has(.list)",
			type: "form",
			mod: function($x){
				return $x;
			}
		}
	},
	build3:{
		regExp: "\/.*\/main\/unit\/create\/[0-9]+\/step3$",
		region: {
			path: ".list:eq(0) td:nth-child(2)",
			type: "item",
			mod: function($x){
				return $x.text().trim();
			}
		},
		radio: {
			path: ":radio",
			type: "input",
			mod: function($x){
				return $x.is(":checked");
			},
			edit: function($x, value){
				return $x.prop("checked", value);
			},				
		},
		next: {
			path: ":submit[name=next]",
			type: "submit", 
			form: "form"
		},
		form: {
			path: "form:has(.list)",
			type: "form",
			mod: function($x){
				return $x;
			}
		}
	},
	build4:{
		regExp: "\/.*\/main\/unit\/create\/[0-9]+\/step4$",
		city: {
			path: ".list:eq(0) td:nth-child(2)",
			type: "item",
			mod: function($x){
				return $x.text().trim();
			}
		},
		radio: {
			path: ":radio",
			type: "input",
			mod: function($x){
				return $x.is(":checked");
			},
			edit: function($x, value){
				return $x.prop("checked", value);
			},					
		},
		next: {
			path: ":submit[name=next]",
			type: "submit", 
			form: "form"
		},
		form: {
			path: "form:has(.list)",
			type: "form",
			mod: function($x){
				return $x;
			}
		}
	},
	build4district:{
		regExp: "\/.*\/main\/unit\/create\/[0-9]+\/step4-shop-district?$",
		district: {
			path: ".list:eq(0) td:nth-child(2)",
			type: "item",
			mod: function($x){
				return $x.text().trim();
			}
		},
		radio: {
			path: ":radio",
			type: "input",
			mod: function($x){
				return $x.is(":checked");
			},
			edit: function($x, value){
				return $x.prop("checked", value);
			},				
		},
		next: {
			path: ":submit[name=next]",
			type: "submit", 
			form: "form"
		},
		form: {
			path: "form:has(.list)",
			type: "form",
			mod: function($x){
				return $x;
			}
		}
	},
	build4warehouse:{
		regExp: "\/.*\/main\/unit\/create\/[0-9]+\/step4-warehouse?$",
		district: {
			path: ".list:eq(0) td:nth-child(2)",
			type: "item",
			mod: function($x){
				return $x.text().trim();
			}
		},
		radio: {
			path: ":radio",
			type: "input",
			mod: function($x){
				return $x.is(":checked");
			},
			edit: function($x, value){
				return $x.prop("checked", value);
			},	
		},
		next: {
			path: ":submit[name=next]",
			type: "submit", 
			form: "form"
		},
		form: {
			path: "form:has(.list)",
			type: "form",
			mod: function($x){
				return $x;
			}
		}
	},
	build5:{
		regExp: "\/.*\/main\/unit\/create\/[0-9]+\/step5$",
		specialization: {
			path: ".list:eq(0) td:nth-child(2)",
			type: "item",
			mod: function($x){
				return $x.text().trim();
			}
		},
		radio: {
			path: ":radio",
			type: "input",
			mod: function($x){
				return $x.is(":checked");
			},
			edit: function($x, value){
				return $x.prop("checked", value);
			},		
		},
		next: {
			path: ":submit[name=next]",
			type: "submit", 
			form: "form"
		},
		form: {
			path: "form:has(.list)",
			type: "form",
			mod: function($x){
				return $x;
			}
		}
	},
	build6:{
		regExp: "\/.*\/main\/unit\/create\/[0-9]+\/step6$",
		size: {
			path: ".list:eq(0) td:nth-child(2)",
			type: "item",
			mod: function($x){
				return $x.text().trim();
			}
		},
		radio: {
			path: ":radio",
			type: "input",
			mod: function($x){
				return $x.is(":checked");
			},
			edit: function($x, value){
				return $x.prop("checked", value);
			},		
		},
		next: {
			path: ":submit[name=next]",
			type: "submit", 
			form: "form"
		},
		form: {
			path: "form:has(.list)",
			type: "form",
			mod: function($x){
				return $x;
			}
		}
	},
	build7:{
		regExp: "\/.*\/main\/unit\/create\/[0-9]+\/step7$",
		level: {
			path: ".list:eq(0) td:nth-child(2)",
			type: "item",
			mod: function($x){
				return numberfy($x.text().match(/\d+/));
			}
		},
		purchase: {
			path: ".list:eq(0) td:nth-child(3)",
			type: "item",
			mod: function($x){
				return numberfy($x.text());
			}
		},
		radio: {
			path: ":radio",
			type: "input",
			mod: function($x){
				return $x.is(":checked");
			},
			edit: function($x, value){
				return $x.prop("checked", value);
			},	
		},
		next: {
			path: ":submit[name=next]",
			type: "submit", 
			form: "form"
		},
		form: {
			path: "form:has(.list)",
			type: "form",
			mod: function($x){
				return $x;
			}
		}
	},
	build8:{
		regExp: "\/.*\/main\/unit\/create\/[0-9]+\/step8$",
		buildName: {
			path: ":text",
			type: "input",
			mod: function($x){
				return $x.val();
			},
			edit: function($x, value){
				return $x.val(value);
			}			
		},
		build: {
			path: ":submit[name=next]",
			type: "submit", 
			form: "form"
		},
		form: {
			path: "form:has(.list)",
			type: "form",
			mod: function($x){
				return $x;
			}
		}
	},
	notMapped:{
		
	}
};