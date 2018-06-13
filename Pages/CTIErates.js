Page.add(new Page({

    id: "CTIErates",

    getUrl: (domain, realm, regionId) => {
        return `${domain}/api/${realm}/main/geo/region/envd?region_id=${regionId}`;
    }

}));

/* 
Has the following layout:

{
    "info": {
        "count": 302,
        "page": 0,
        "page_size": 0
    },
    "data": {
        "130": {
            "id": "130",
            "product_name": "Ship's hull",
            "product_symbol": "ship_body",
            "tax": "20",
            "product_category_id": "1470",
            "category_name": "Materials, semi-products"
        },
        ...
        
}


*/