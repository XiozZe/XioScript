Page.add(new Page({

    id: "ForumMain",

    getUrl: (domain, realm) => {
        return `${domain}/${realm}/forum/forumcategory/list`;
    },

    test: (doc, url) => {
        return !!doc.getElementsByClassName("forum-other-lang").length;
    },

    scrape: (doc) => ({        
        timeStamps: doc.extract(".forum_view_cell_last").map(e => e.childNodes[0].nodeValue.trim())
    })
}));