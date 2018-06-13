Page.add(new Page({

	id: "ProdSupply",

    getUrl: (domain, realm, subid) => {
        return `${domain}/${realm}/main/unit/view/${subid}/supply`;
    },

    test: (doc, url) => {
        return undefined;
	},
	
	scrape: (doc) => {

		//This page scraping is different from other pages. First there are two interfaces: a new and an old one. Second the information will be formatted to good info, meaning that it will return an array of information for each good present.
		let productId, required, quantity, qualityStock;
		let parcel, offerId, priceRule, supplierId, price, qualitySupplier, available, maximum, hasReprice;
		let isMainRow, hasSupplier;

		//New interface
		if(doc.querySelector(".btn-primary > .fa-fw")){

			//Goods Based (one per good)
			productId = doc.extract(".list tr[onmouseover] [alt='Select supplier']").map( e => e.closest("tr").extract(".product_box_wo_truck a")[0].href.match(/\d+/)[0] ),
			required = doc.extract(".list td:nth-child(3).inner_table tr:nth-child(1) td:nth-child(2)").map( e => Tools.parse(e.innerText) ),
			quantity = doc.extract(".list td:nth-child(4).inner_table tr:nth-child(1) td:nth-child(2)").map( e => Tools.parse(e.innerText) ),
			qualityStock = doc.extract(".list td:nth-child(4).inner_table tr:nth-child(2) td:nth-child(2)[align]").map( e => Tools.parse(e.innerText) ),
	
			//Supplier Based (one good can have multiple suppliers)
			parcel = doc.extract(".quickchange").map( e => Tools.parse(e.value) ),
			offerId = doc.extract(".destroy").map( e => e.value ),
			priceRule = doc.extract("[id^=price_rules]").map( e => Tools.parse(e.innerText) ),
			supplierId = doc.extract(".list tr[onmouseover] td[colspan='3']").map( e => Tools.try(() => e.extract("a:nth-child(2)")[0].href.match(/\d+/)[0]) ), //Note: Subdivision ID of the supplier, Independent Supplier returns null
			price = doc.extract(".list tr[onmouseover] tr:nth-child(2) td:nth-child(3)").map( e => Tools.parse(e.innerText) ),
			qualitySupplier = doc.extract(".list tr[onmouseover] tr:nth-child(3) td:nth-child(3)").map( e => Tools.parse(e.innerText) ),
			available = doc.extract(".list tr[onmouseover] tr:nth-child(4)[id] td:nth-child(2):not([id])").map( e => Tools.parse(e.innerText) ),
			maximum = doc.extract(".list .quickchange").map( e => Tools.parse(e.nextElementSibling.children[0].innerText.split(":")[1]) || Infinity ),
			hasReprice = doc.extract(".list tr[onmouseover] [id^='price_rules']").map( e => !!e.parentElement.classList[0] ),
	
			//Row Based (one per row, is the same as supplier except when a good has none)
			isMainRow = doc.extract(".list tr[onmouseover]").map( e => !!e.extract("[alt='Select supplier']").length ),
			hasSupplier = doc.extract(".list tr[onmouseover]").map( e => !!e.extract("[src='/img/smallX.gif']").length )

			//This is a row based productId, because the old interface is also supported, the productId has to be goods based. Row based would make more sense in the new interface though.
			//productId = doc.extract(".product_box_wo_truck").map( e => e.extract("a")[0].href.match(/\d+/)[0] ),

		}
		else{

			//Goods Based (one per good)
			productId = doc.extract(".list th a[title] img").map( e => e.parentElement.href.match(/\d+/)[0] ),
			required = doc.extract(".list td:nth-child(2) table tr:nth-child(1) td:nth-child(2)").map( e => Tools.parse(e.innerText) ),
			quantity = doc.extract(".list td:nth-child(3) table tr:nth-child(1) td:nth-child(2)").map( e => Tools.parse(e.innerText) ),
			qualityStock = doc.extract(".list td:nth-child(3) table tr:nth-child(2) td:nth-child(2)").map( e => Tools.parse(e.innerText) ),

			//Supplier Based (one good can have multiple suppliers)
			parcel = doc.extract("input[type=type]").map( e => Tools.parse(e.value) ),
			offerId = doc.extract(".destroy").map( e => e.value ),
			priceRule = doc.extract(".contractConstraintPriceRel option[selected]").map( e => Tools.parse(e.value) ),
			supplierId = doc.extract(".list td[onmouseover][id^='name'] ").map( e => Tools.try(() => e.extract("a:nth-child(4)")[0].href.match(/\d+/)[0]) ), //Note: Subdivision ID of the supplier, Independent Supplier returns null
			price = doc.extract("[id^=totalPrice] tr:nth-child(1) td:nth-child(3)").map( e => Tools.parse(e.innerText) ),
			qualitySupplier = doc.extract("[id^=totalPrice] tr:nth-child(3) td:nth-child(2)").map( e => Tools.parse(e.innerText) ),
			available = doc.extract("[id^=quantity] tr:nth-child(2) td:nth-child(2)").map( e => Tools.parse(e.innerText) ),
			maximum = doc.extract(".list [id^=quantityField]").map( e => Tools.parse(e.innerText.split(":")[1]) || Infinity ),
			hasReprice = doc.extract("[id^=totalPrice] tr:nth-child(1)").map( e => !!e.style[0] ),
			
			//Row Based (one per row, is the same as supplier except when a good has none)
			isMainRow = doc.extract(".list tr[id]").map( e => !/sub/.test(e.id) ), //In this case isMainRow means the first supply row (if there is a supply) of a good
			hasSupplier = doc.extract(".list tr[id]").map( e => !!e.extract("[src='/img/smallX.gif']").length )

		}

		goodsBased = {productId, required, quantity, qualityStock};
		supplierBased = {parcel, offerId, priceRule, supplierId, price, qualitySupplier, available, maximum, hasReprice};

		return {
			goodsBased,
			supplierBased,
			isMainRow,
			hasSupplier
		}

	},
	
	settings: (doc, domain, realm, subid) => [
		//This setting is to go to the new, but is currently disabled because there are subdivisions (restaurants etc) that only use the old view
		/*{
			hasWrongSettings: !!doc.querySelector(".spec"),
			removeCookie: "oldschool_supply_tab"
		}*/
	],

}));