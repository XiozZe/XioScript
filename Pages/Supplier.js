Page.add(new Page({

    id: "Supplier",

    getUrl: (domain, realm) => {
        return `${domain}/${realm}/ajax/unit/supply/create`;
    }   
    
}));

/* 
Can send data to create or update a supplier. Has the following layout:

 const data = {
    amount: 3000,
    offer: 1234567, (this is the unique offerID of the contract between two subdivisions)
    unit: 123456 (this is the subdivisionID of the subdivision that retrieves the supply)
};

*/

