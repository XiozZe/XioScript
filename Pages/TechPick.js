//A factory's technology page where you can pick the technology
Page.add(new Page({

    id: "TechPick",

    getUrl: (domain, realm, subid) => {
        return `${domain}/${realm}/main/unit/view/${subid}/technology`;
    },

    scrape: (doc) => ({
        levelCurrent: Tools.parse(doc.querySelector(".rounded-table .current_row .level_field").innerText.match(/\d+/)[0]),
        levelTech: doc.extract(".rounded-table .level_field").map( e => Tools.parse(e.innerText.match(/\d+/)[0]) ),
        isYours: doc.extract(".rounded-table .normal_row, .rounded-table .current_row").map( e => !e.extract(".small_button").length )
    })

}));