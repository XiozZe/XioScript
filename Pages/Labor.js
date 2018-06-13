Page.add(new Page({

    id: "Labor",

    getUrl: (domain, realm) => {
        return `${domain}/api/${realm}/main/geo/labors&pagesize=2000`;
    }   
    
}));

/* 
Has the following layout:

{
    "info": {
        "count":"280",
        "page":1,
        "page_size":50
    },
    "data":  {
        "3031":{
            "id":"3031",
            "name":"Paris",
            "region_id":"15923",
            "region_name":"Northern France",
            "country_id":"15906",
            "country_name":"France",
            "country_symbol":"fr",
            "population":"2449548",
            "salary":"395.48",
            "education":"8.76",
            "restrictions":null,
            "size_min":null,
            "size_max":null,
            "restrictions_count":"0",
            "retails":null,
            "retail_count":"0",
            "intellectuals_cost":"0.00",
            "merchants_cost":"0.00",
            "workers_cost":"30.86"},"3032":
        }
        "3032": {
            ...
        }
        ...
    }
}


*/

