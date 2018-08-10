//The small popup window where you can set the salary and the employee count.
//Not implemented, because not needed: only the url to send data to is important
Page.add(new Page({

    id: "SalaryWindow",

    getUrl: (domain, realm, subid) => {
        return `${domain}/${realm}/window/unit/employees/engage/${subid}`;
    },

    scrape: (doc) => ({

    })

}))