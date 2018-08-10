//Report under Analytics --> Market analysis --> Marketing --> Products
Page.add(new Page({

    id: "ProductMarket",

    getUrl: (domain, realm, productId) => {
        return `${domain}/${realm}/main/globalreport/marketing/by_products/${productId}/`;
    },

    scrape: (doc) => ({
        available: doc.extract(".grid td.nowrap:nth-child(2)").map( e => Tools.parse(e.childNodes[0].nodeValue) ),
        maximum: doc.extract(".grid td.nowrap:nth-child(2)").map( e => e.extract("span") ).map( e => e.length? Tools.parse(e[0].innerText.split(":")[1]) : Infinity ),
        quality: doc.extract(".grid td.nowrap:nth-child(4)").map( e => Tools.parse(e.innerText) ),
        price: doc.extract(".grid td.nowrap:nth-child(5)").map( e => Tools.parse(e.innerText) ),
        subid: doc.extract(".grid td:nth-child(1) td:nth-child(1) a").map( e => e.getAttribute("href").match(/\d+/)[0] )
    }),

    repetition: ["available", "maximum", "quality", "price", "subid"],

    settings: (doc, domain, realm, productId) => [
        {
            hasWrongSettings: doc.getElementById("filterSummary").style.display !== "none",
            url: `${domain}/${realm}/main/common/util/setfiltering/reportcompany/marketingProduct`,
            data: {
                "free_for_buy_isset": 0,
                "free_for_buy[from]": [1, 1],
                "price_isset": 0,
                "price[from]": 0,
                "price[to]": 0,
                "quality_isset": 0,
                "quality[from]": 0,
                "quality[to]": 0,
                "quantity_isset": 0,
                "quantity[from]": 0
            }
        }
    ]

}))