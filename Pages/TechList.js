//The management technology list
Page.add(new Page({

    id: "TechList",

    getUrl: (domain, realm, companyid) => {
        return `${domain}/${realm}/main/company/view/${companyid}/unit_list/technology`;
    },

    scrape: (doc) => ({
        subid: doc.extract(".list_sublink:not([style])").map( e => e.getAttribute("href").match(/\d+/)[0] ),
        level: doc.extract(".list td[align][style]").map( e => Tools.parse(e.innerText.match(/\d+/)[0]) ),
        type: doc.extract(".list tr[class] img[alt]").map( e => e.getAttribute("src").split("/")[3].split(".")[0] )
    }),

    repetition: ["subid", "level", "type"],

    //Different subdivision types go to a different page (settings not needed)

}))