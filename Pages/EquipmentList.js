//This is the page under Management -> Employee
Page.add(new Page({

    id: "EquipmentList",

    getUrl: (domain, realm, companyid) => {
        return `${domain}/${realm}/main/company/view/${companyid}/unit_list/equipment`;
    },

    scrape: (doc) => ({
        subid: doc.extract("[type=checkbox][name]").map( e => e.getAttribute("id").split("_")[1] ),
        type: doc.extract(".list td[class]:nth-child(3)").map( e => e.getAttribute("class").split("-")[2] ),
        quantityCurrent: doc.extract(".list td[class]:nth-child(4)").map( e => Tools.parse(e.innerText) ),
        quantityMaximum: doc.extract(".list td[class]:nth-child(5)").map( e => Tools.parse(e.innerText) ),
        wearPercent: doc.extract("td:nth-child(8)").map( e => Tools.parse(e.innerText) ),
        wearBlack: doc.extract("td:nth-child(8)").map( e => Tools.parse(e.innerText.split("(")[1]) ),
        wearRed: doc.extract("td:nth-child(8)").map( e => Tools.parse(e.innerText.split("+")[1]) ),
        qualityCurrent: doc.extract("td:nth-child(6).nowrap").map( e => Tools.parse(e.innerText) ),
        qualityRequired: doc.extract("td:nth-child(7)").map( e => Tools.parse(e.innerText) )
    }),
        
    repetition: ["subid", "type", "quantityCurrent", "quantityMaximum", "wearPercent", "wearBlack", "wearRed", "qualityCurrent", "qualityRequired"],
 
    settings: (doc, domain, realm, companyid) => [        
        {
            hasWrongSettings: !doc.extract(".u-t.u-s").length || doc.extract("input[name=unfilter]").length,
            url: `${domain}/${realm}/main/common/util/setfiltering/dbunit/unitListWithEquipment/country=/region=/city=/product=/understaffed=/wear_percent=/low_quality=/animal_food_not_enough=/animal_food_low_quality=`
        }
    ]

}));