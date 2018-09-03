Page.add(new Page({

	id: "WarehouseSupply",

    getUrl: (domain, realm, subid) => {
        return `${domain}/${realm}/main/unit/view/${subid}/supply`
    },

    test: (doc, url) => {
        return undefined
	},
	
	scrape: (doc) => {

        const goodsBased = {
			//Goods Based (one per good)
            productId: doc.extract(".p_title").map( e => Tools.parse( e.extract("a")[1].getAttribute("href").match(/\d+$/)[0]) ),
            productName: doc.extract(".p_title").map( e => e.extract("strong")[0].innerText ),
			shipments: doc.extract(".p_title table").map( e => e.extract("strong").length === 2? 0 : Tools.parse(e.extract("strong").pop().innerText) ),
			quantity: doc.extract(".p_title table").map( e => e.extract("strong").length >= 2? Tools.parse(e.extract("strong")[0].innerText) : 0 ),
            qualityStock: doc.extract(".p_title table").map( e => e.extract("strong").length >= 2? Tools.parse(e.extract("strong")[1].innerText) : 0 )
            
        }
        		            
        const supplierBased = {
			//Supplier Based (one good can have multiple suppliers)
			parcel: doc.extract("input[name^='supplyContractData[party_quantity]']").map( e => Tools.parse(e.value) ),
			offerId: doc.extract("tr input[type=checkbox]").map( e => e.value ),
			supplierId:  doc.extract("tr:not(.p_title) td > div:nth-child(3)").map( e => e.extract("a").pop().getAttribute("href").match(/\d+/)[0] ), //Note: Subdivision ID of the supplier, Independent Supplier returns null
			price: doc.extract("tr:not(.p_title) td:nth-child(4)").map( e => Tools.parse(e.innerText.match(/(\d|\.|\s)+$/))),
			qualitySupplier: doc.extract("tr:not(.p_title) td:nth-child(6)").map( e => Tools.parse(e.innerText) ),
			available: doc.extract("tr:not(.p_title) td:nth-child(9)").map( e => e.innerText.split(/\s[a-zA-Zа-яА-ЯёЁ]+\s/).reduce( (a, b) => Math.min(a, b.match(/\d+/) === null? Infinity : Tools.parse(b.match(/(\d| )+/)[0])) , Infinity) ),
            hasReprice: doc.extract("tr:not(.p_title) td:nth-child(4)").map( e => !!e.extract("span").length ),
            isMyself: doc.extract("tr:not(.p_title) td > div:nth-child(3)").map( e => !!e.extract("strong").length )
        }

        //These are the goods at the bottom of the page of which no supplier is present
        const notSupplied = {
            productId: doc.extract(".add_contract a > img").map( e => e.parentNode.getAttribute("href").match(/\d+$/)[0] ),
            productName: doc.extract(".add_contract img").map( e => e.getAttribute("alt") ),
            qualityStock: doc.extract(".add_contract").map( e => e.extract("a").length === 2? Tools.parse(e.extract("a")[1].childNodes[2].nodeValue) : 0 ),
            quantity: doc.extract(".add_contract").map( e => e.extract("a").length === 2? Tools.parse(e.extract("a")[1].childNodes[0].nodeValue) : 0 )
        }

        //Row Based (one per row, is the same as supplier except when a good has none)
        const isMainRow = doc.extract("tr[class]").map( e => e.classList.contains("p_title") )
        const hasSupplier = doc.extract("tr[class]").map( e => !e.classList.contains("p_title") )

		return {
			goodsBased,
            supplierBased,
            notSupplied,
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

}))