Page.add(new Page({

    id : "UnitList",
    type : "HTML",

    getUrl : (domain, realm, companyId) => {
        return `${domain}/${realm}/main/company/view/${companyId}/unit_list`;
    },

    test : (doc, url) => {
        return new RegExp("\/.*\/main\/company\/view\/[0-9]+\/unit_list(#del)?$").test(url);
    },

    scrape : (doc, domain, realm, companyId) => {
    
        const values = {
            //All (sub)ids in this script should be TEXT instead of NUMBERS (because you don't calculate with them)
            subid: doc.extract(".unit-list-2014 td:nth-child(1):not(.u-ed)[class]").map( e => e.innerText ),
            type: doc.extract(".unit-list-2014 td:nth-child(3)").map(e => e.classList[1].substring(2)),
            countryName: doc.extract(".unit-list-2014 td:nth-child(2):not(.u-n)").map(e => e.title.split(";")[0]),
            regionName: doc.extract(".unit-list-2014 td:nth-child(2):not(.u-n)").map(e => e.title.split(";").reverse()[0]),
            cityName: doc.extract(".unit-list-2014 td:nth-child(2):not(.u-n)").map(e => e.innerText.trim()),
            name: doc.extract(".unit-list-2014 td:nth-child(3) a").map(e => e.innerText),
            alert: doc.extract(".unit-list-2014 td:nth-child(8)").map(e => e.innerHTML.replace(/\s{2,}/g, ""))
        }
 
        const settings = [
            {
                //There are two types of subdivision selecting: the pictures and the dropdown
                check: Tools.try(() => doc.querySelector("select.unittype").value === "0") || Tools.try(() => !!doc.querySelector(".u-t.u-s")),
                url: `${domain}/${realm}/main/common/util/setfiltering/dbunit/unitListWithProduction/class=0/type=0`
            }
        ]		
        
        const repetition = ["subid", "type", "countryName", "regionName", "cityName", "name", "alert"]

        return {values, settings, repetition};	
    
    }
}));