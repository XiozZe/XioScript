//This will be the virtonomics.com page or the virtonomica.ru page
Page.add(new Page({

    id: "HomePage",

    getUrl: (domain) => {
        return domain;
    },

    scrape: (doc) => ({
        loggedIn : !!doc.querySelector(".logout")
    })

}));