Page.add(new Page({

    id: "Trademarks",

    getUrl: (domain, realm) => {
        return `${domain}/${realm}/main/globalreport/tm/info`;
    },

    scrape: (doc) => ({
        productName : doc.extract(".grid td:nth-child(even)").map( e => e.childNodes[3].nodeValue.trim() ),
        franchise : doc.extract(".grid b").map( e => e.innerText )
    })
    
}));