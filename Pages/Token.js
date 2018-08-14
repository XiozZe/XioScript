//This is the place we can get the token we need to send to the unit refresh page
Page.add(new Page({

    id: "Token",

    getUrl: (domain, realm) => {
        return `${domain}/api/${realm}/main/token`
    }   
    
}));

/* 
Has the following layout:

"5b6ff667d4d53"

*/