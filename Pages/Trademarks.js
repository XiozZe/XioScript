Page.add(new Page({

    id : "Trademarks",
    type : "HTML",

    getUrl : (domain, realm) => {
        return `${domain}/${realm}/main/globalreport/tm/info`;
    },

    test : (doc, url) => {
        return undefined;
    },

    scrape : (doc, domain, realm) => {
        
		values = {
			productName : doc.extract(".grid td:nth-child(even)").map( e => e.childNodes[3].nodeValue.trim() ),
			franchise : doc.extract(".grid b").map( e => e.innerText )
		}
 
        const settings = [];        
        const repetition = [];

        return {values, settings, repetition};	
    
    }
}));