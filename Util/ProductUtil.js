const ProductUtil = {

    getProductName: async (domain, realm, productId) => {            
        const products = await Page.get("Products").load(domain, realm);
        const i = products.productId.indexOf(productId);
        return products.productName[i];
    }


}