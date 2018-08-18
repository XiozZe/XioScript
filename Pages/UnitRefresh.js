//This is the place we can refresh the "UnitSummary" page in order to have the latest data
Page.add(new Page({

    id: "UnitRefresh",

    getUrl: (domain, realm) => {
        return `${domain}/api/${realm}/main/unit/refresh`
    }   
    
}));

/* 
To refresh you should send the following data:

data = {
    id: "2248440"    (ID of the subdivision)
    token: "5b6ff667d4d53"   (Token gotten from the "Token" page)
}

*/