//If you want to set a subdivision from holiday, load this page
Page.add(new Page({

    id: "HolidayUnset",

    getUrl: (domain, realm, subid) => {
        return `${domain}/${realm}/main/unit/view/${subid}/holiday_unset`
    }

}))