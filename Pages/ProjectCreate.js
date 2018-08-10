//Window where you can set a new Research for a laboratory
Page.add(new Page({

    id: "ProjectCreate",

    getUrl: (domain, realm, subid) => {
        return `${domain}/${realm}/window/unit/view/${subid}/project_create`
    },

    scrape: (doc) => ({
        canContinue: !!doc.extract("[type=submit]").length
    })

}))