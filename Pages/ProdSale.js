Page.add(new Page({

	id : "ProdSale",
	type : "HTML",

    getUrl : (domain, realm, subid) => {
        return `${domain}/${realm}/main/unit/view/${subid}/sale`;
    },

    test : (doc, url) => {
        return undefined;
    },

    scrape : (doc, domain, realm, subid) => {
    
        values = { 
			//be careful with the possible extra green vehicle img: shifts columns one place to the right
			//outprime/outqual is length zero for warehouses
			available: doc.extract(".nowrap:nth-last-child(3)").map( e => Tools.parse(e.innerText) ),    
			policy: doc.extract("select[onchange]").map( e => e.value ),
			price: doc.extract("input.money:nth-child(odd)").map( e => Tools.parse(e.value) ),
			outqual: doc.extract("td[align]:nth-last-child(6) tr:nth-child(2) td:nth-child(2)").map( e => Tools.parse(e.innerText) ),
			outprime: doc.extract("td[align]:nth-last-child(6) tr:nth-child(3) td:nth-child(2)").map( e => Tools.parse(e.innerText) ),
			stockqual: doc.extract("td[align]:nth-last-child(5) tr:nth-child(2) td:nth-child(2)").map( e => Tools.parse(e.innerText) ),
			stockprime: doc.extract("td[align]:nth-last-child(5) tr:nth-child(3) td:nth-child(2)").map( e => Tools.parse(e.innerText) ),
			productName: doc.extract(".grid a:not([onclick])").map( e => e.innerText ),
			productId: doc.extract(".grid a:not([onclick])").map( e => Tools.parse(e.href.match(/\d+/)[0]) ),
			productData: doc.extract("input.money:nth-child(even)").map( e => e.getAttribute("name").split("][")[0]+"]" ),
			volume: doc.extract("input.money:nth-child(even)").map( e => Tools.parse(e.value) )
			//Unnecessary, because you can get all the geographical info of a subdivision from the unit list:
			//countryName: doc.extract(".headern .title a")[1].innerText,
			//countryId: doc.extract(".headern .title a")[1].href.match(/\d+/)[0]
		}
 
        const settings = [];        
        const repetition = [];

        return {values, settings, repetition};	
    
    }
}));