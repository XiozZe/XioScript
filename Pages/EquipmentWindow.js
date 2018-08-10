//The small popup window where you can set the training.
Page.add(new Page({

    id: "EquipmentWindow",

    getUrl: (domain, realm, subid) => {
        return `${domain}/${realm}/window/unit/equipment/${subid}`;
    },

    scrape: (doc) => ({
        qualityCurrent: Tools.parse(doc.getElementById("top_right_quality").innerText),
        //Not every subdivision has a required quality
        qualityRequired: Tools.try(() => Tools.parse(doc.querySelector(".recommended_quality span:not([id])").innerText)),
        quantityCurrent: Tools.parse(doc.getElementById("quantity_corner").innerText),
        quantityMaximum: Tools.parse(doc.extract(".contract")[1].innerText.split("(")[1].match(/(\d| )+/)[0]),
        wearPercent: Tools.parse(doc.getElementById("wear").innerText),
        offerPrice: doc.extract(".digits:nth-last-child(6)").map( e => Tools.parse(e.innerText) ),
        offerQuality: doc.extract(".digits:nth-last-child(2)").map( e => Tools.parse(e.innerText) ),
        offerAvailable: doc.extract(".digits:nth-last-child(7)").map( e => Tools.parse(e.innerText) ),
        offerId: doc.extract(".choose span").map( e => e.getAttribute("id") ),
    }),

    repetition: ["offerPrice", "offerQuality", "offerAvailable", "offerId"],

    settings: (doc, domain, realm, subid) => [
        {
            hasWrongSettings: !doc.querySelector(".all_self a[href*=all]").parentElement.classList.contains("selected2"),
            url: doc.querySelector(".all_self span a").getAttribute("href")
        },
        {
            hasWrongSettings: doc.querySelector("#line_quantity_isset input").value !== "1"
                || doc.querySelectorAll("#line_quality_isset input")[0].value !== ""
                || doc.querySelectorAll("#line_quality_isset input")[1].value !== ""
                || doc.querySelectorAll("#line_total_price_isset input")[1].value !== ""
                || doc.querySelectorAll("#line_total_price_isset input")[0].value !== "",
            url: doc.querySelector("form[name=doFilterForm]").getAttribute("action"),
            data: {
                "total_price[from]": 0,
                "total_price[to]": 0,
                "quality[from]": 0,
                "quality[to]": 0,
                "quantity[isset]": 1,
                "quantity[from]": 1,
                "total_price_isset": 0,
                "quality_isset": 0,
                "quantity_isset": 1
            }
        }
    ]

}))