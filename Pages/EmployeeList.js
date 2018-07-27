//This is the page under Management -> Employee
Page.add(new Page({

    id: "EmployeeList",

    getUrl: (domain, realm, companyid) => {
        return `${domain}/${realm}/main/company/view/${companyid}/unit_list/employee/salary`;
    },

    scrape: (doc) => ({
        //All (sub)ids in this script should be TEXT instead of NUMBERS (because you don't calculate with them)
        subid: doc.extract(".list [type=checkbox][name]").map( e => e.getAttribute("id").substring(5) ),
        type: doc.extract(".list td[class]:nth-child(3)").map( e => e.getAttribute("class").split("-")[2] ),
        cityName: doc.extract(".u-a b").map( e => e.innerText ),
        employeesWorking: doc.extract(".list td:nth-child(5).nowrap").map( e => Tools.parse(e.innerText) ),
        employeesMaximum: doc.extract(".list td:nth-child(6).nowrap").map( e => Tools.parse(e.innerText) ),
        salaryWorking:  doc.extract(".list td:nth-child(7)").map( e => Tools.parse(e.childNodes[0].nodeValue) ),
        salaryCity: doc.extract(".list td:nth-child(8)").map( e => Tools.parse(e.innerText) ),
        skillWorking: doc.extract(".list td:nth-child(9)").map( e => Tools.parse(e.innerText) ),
        skillRequired: doc.extract(".list td:nth-child(10)").map( e => Tools.parse(e.innerText) ),
        onHoliday: doc.extract(".list td:nth-child(11)").map( e => !!e.extract(".in-holiday").length ),
        onTraining: doc.extract(".u-c").map( e => !!e.extract(".sizebar").length ),
        efficiency: doc.extract(".list td:nth-child(11)").map( e => e.innerText.trim() )
    }),
        
    repetition: ["subid", "type", "cityName", "employeesWorking", "employeesMaximum", "salaryWorking", "salaryCity", "skillWorking", "skillRequired", "onHoliday", "onTraining", "efficiency"],
 
    settings: (doc, domain, realm, companyid) => [
        {
            hasWrongSettings: Tools.try(() => !doc.querySelector(".u-s").classList.contains("u-t")),
            url: `${domain}/${realm}/main/common/util/setfiltering/dbunit/unitListWithHoliday/class=0/type=0/country=all/region=all/city=all`
        }
    ]

}));