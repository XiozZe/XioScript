//Summary of the whole company through the API
//This page should only be loaded through the function in the APIUtil
Page.add(new Page({

    id: "CompanySummary",

    /*
     * This page has the parameter 'pagesize' with as sole purpose to force a new unique load. 
     */
    getUrl: (domain, realm, companyid, pagesize) => {
        return `${domain}/api/${realm}/main/company/units?id=${companyid}&pagesize=${2000000+pagesize}`
    }   
    
}))

Page.get("CompanySummary").load = async function (domain, realm, companyid) {        
    return await APIUtil.loadCompanySummary.call(this, domain, realm, companyid)
}

//We should clean the variables the APIUtil uses as well when this page is cleaned.
Page.get("CompanySummary").clean = function (domain, realm, companyid) {
    //Calling Page.prototype.clean is useless because we do not know the pagesize here
    APIUtil.cleanCompanySummary.call(this, domain, realm, companyid, pagesize)
}

Page.get("CompanySummary").cleanAll = function () {
    Page.prototype.cleanAll.call(this)
    APIUtil.cleanAllCompanySummary()
}

/**

Has the following layout:

    "info": {
        "count": "225",
        "page": 1,
        "page_size": "2000000"
    },
    "indicators": {
        "2248440": {
            "303076": {
                "id": "303076",
                "kind": "workers_in_holiday",
                "name": "The employees are on vacation"
            }
        },
        "2249943": {
            ...
        },
        ...
    }
    "data": {
        "2248440": {
            "id": "2248440",
            "name": "Factory Canned Products",
            "country_symbol": "tr",
            "country_name": "Turkey",
            "region_name": "Anatolia",
            "city_name": "Ankara",
            "unit_type_id": "1855",
            "unit_type_symbol": "workshop",
            "unit_type_name": "Meat processing plant",
            "size": "50",
            "labor_max": "5000",
            "equipment_max": "5000",
            "square": "0",
            "unit_type_produce_name": "Canned meat ",
            "unit_class_id": "1814",
            "unit_class_name": "Factory",
            "unit_class_kind": "workshop",
            "productivity": "1",
            "notice": null,
            "product_ids": "{3869}",
            "product_symbols": "{can}",
            "product_names": "{\"Canned products\"}",
            "market_status": "",
            "time_to_build": "0",
            "office_sort": "1"
        },
        "2249943": {
            
        }
    }


 */