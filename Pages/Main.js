//Main page of a subdivision

Page.add(new Page({

    id: "Main",

    getUrl: (domain, realm, subid) => {
        return `${domain}/${realm}/main/unit/view/${subid}`
    },

    test: (doc, url) => {
        return new RegExp("\/.*\/main\/unit\/view\/[0-9]+$").test(url)
    },

    scrape: (doc) => ({

    })

}))