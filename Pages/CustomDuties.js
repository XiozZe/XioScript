Page.add(new Page({

    id : "CustomDuties",
    type : "JSON",

    getUrl : (domain, realm, countryid) => {
        return `${domain}/api/${realm}/main/geo/country/duty?country_id=${countryid}`;
    },

    test : (doc, url) => {
        return undefined;
    },

    scrape : (json) => {        
        return json;  
        
        /* 
        Has the following layout:
        
        {
            data: {
                "130": {
                    category_name: "Materials, semi-products"​​​
                    export: "10"​​​
                    id: "130"​​​
                    import: "1"​​​
                    min_cost: "500000"​​​
                    new_export: "10"​​​
                    new_import: "0"​​​
                    product_category_id: "1470"​​​
                    product_name: "Ship's hull"​​​
                    product_symbol: "ship_body"
                }
                "131": {
                    ...
                }
                ...
            }
            info : {
                count: 302
                page: 0
                info: 0
            }

        }


        */
    }
}));