Page.add(new Page({

    id : "Products",
    type : "HTML",

    getUrl : (domain, realm) => {
        return `${domain}/${realm}/main/common/main_page/game_info/products`;
    },

    test : (doc, url) => {
        return undefined;
    },

    scrape : (doc, domain, realm) => {
        
		values = {
			productName : doc.extract(".list a").filter( (e, i) => !(i%4) ).map( e => e.title ),
            productId : doc.extract(".list a").filter( (e, i) => !(i%4) ).map( e => e.href.match(/\d+/)[0] ),
            productImg : doc.extract(".list a > img").map( e => e.src )
		}
 
        const settings = [];        
        const repetition = [];

        return {values, settings, repetition};	
    
    }
}));