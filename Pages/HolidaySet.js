//If you want to set a subdivision to holiday, load this page
Page.add(new Page({

    id: "HolidaySet",

    getUrl: (domain, realm, subid) => {
        return `${domain}/${realm}/main/unit/view/${subid}/holiday_set`
    }

}))