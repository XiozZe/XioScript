//Window where you can attach a factory to a laboratory
Page.add(new Page({

    id: "ExperimentalUnit",

    getUrl: (domain, realm, subid) => {
        return `${domain}/${realm}/window/unit/view/${subid}/set_experemental_unit`
    },

    scrape: (doc) => ({
        subid: doc.extract("[type=radio]").map( e => e.value )
    })

}))