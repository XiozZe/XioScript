Page.add(new Page({

    id: "Qualification",

    getUrl: (domain, realm) => {
        return `${domain}/${realm}/main/user/privat/persondata/knowledge`;
    },

    scrape: (doc) => ({
        base: doc.extract(".qual_item .mainValue").map( e => Tools.parse(e.innerText) ),
        bonus: doc.extract(".qual_item").map( e => Tools.parse( e.extract(".bonusValue")[0].innerText ) ),
        image: doc.extract(".qual_item img").map( e => e.getAttribute("src") )
    })

}))