//Advertising page of a store
Page.add(new Page({

    id: "Advertising",

    getUrl: (domain, realm, subid) => {
        return `${domain}/${realm}/main/unit/view/${subid}/virtasement`
    },

    scrape: (doc) => ({
        budget: Tools.parse(doc.extract("[type=text]:not(.readonly)")[0].value),
        requiredBudget: Tools.parse(doc.extract(".infoblock tr:nth-child(2) td:nth-child(2)")[0].innerText.split("$")[1]),
        requiredContacts: Tools.parse(doc.extract(".infoblock tr:nth-child(3) td:nth-child(2)")[0].innerText.match(/\d(\d|\.|\s)+/)[0]),
        mediaChecked: doc.extract("#media_managment [type=checkbox]").map( e => e.checked ),
        mediaId: doc.extract("#media_managment [type=checkbox]").map( e => e.getAttribute("value"))
    })

}))