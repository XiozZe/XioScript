//The research tab of a laboratory
Page.add(new Page({

    id: "Laboratory",

    getUrl: (domain, realm, subid) => {
        return `${domain}/${realm}/main/unit/view/${subid}/investigation`;
    },

    scrape: (doc) => ({

        //Information on what is happening inside the laboratory
        isFree: !doc.extract(".cancel").length,
        isHypothesisStage: !!doc.extract("#selectIt").length,
        isHypothesisChosen: !!doc.extract(".grid tr[class]:not([onclick])").length,
        hasBadFactory: !!doc.extract("span[style*=red]").length,
        hasAbsentFactory: !!doc.extract("b[style='color: red']").length,

        //Extracting the hypthesis table
        hypothesisId: doc.extract(".grid > tbody > tr[class] > td:nth-child(1)").map( e => e.childNodes[0].value ),
        hypothesisChance: doc.extract(".grid td.nowrap:nth-child(3)").map( e => Tools.parse(e.innerText) ),
        hypothesisTime: doc.extract(".grid td.nowrap:nth-child(4)").map( e => Tools.parse(e.innerText) ),

        //These three are all the from last researched technology
        lastType: doc.extract("[type=button]")[2].getAttribute("onclick") && Tools.parse(doc.extract("[type=button]")[2].getAttribute("onclick").split(",")[1]),
        lastIndustry: doc.extract("[type=button]")[2].getAttribute("onclick") && Tools.parse(doc.extract("[type=button]")[2].getAttribute("onclick").split("(")[1]),
        lastLevel: Tools.parse(doc.extract(".list tr td[style]")[0].innerText)
    })

}))