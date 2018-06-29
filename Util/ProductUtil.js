const ProductUtil = {

    getProductName: async (domain, realm, productId) => {            
        const products = await Page.get("Products").load(domain, realm);
        const i = products.productId.indexOf(productId);
        return products.productName[i];
    },

    getProductId: async (domain, realm, productName) => {
        //Important because we can have TradeMark goods
        const tmPromise = Page.get("Trademarks").load(domain, realm);
        const productsPromise = Page.get("Products").load(domain, realm);   
        const tm = await tmPromise;
        const indexFranchise = tm.franchise.indexOf( productName );
        const possibleProductName = tm.productName[indexFranchise];
        const realProductName = possibleProductName || productName;
        const products = await productsPromise;
        const realProductIndex = products.productName.indexOf(realProductName);
        return products.productId[realProductIndex];       
    }


}