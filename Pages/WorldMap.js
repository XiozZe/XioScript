Page.add(new Page({

    id: "WorldMap",

    getUrl: (domain, realm) => {
        return `${domain}/api/${realm}/main/geo/country/browse`;
    }
}));

/* 
Has the following layout:

{            
    "15904":{
        "id":"15904",
        "name":"United Kingdom",
        "population":"60776",
        "landarea":"245",
        "symbol":"uk",
        "tax_min":"18",
        "tax_max":"23",
        "available":"1",
        "city_count":"19",
        "country_id":"15904",
        "country_name":"United Kingdom",
        "country_symbol":"uk",
        "president":{
            "president_user_id":"1107890",
            "president_name":"luisk2",
            "elections_id":null,
            "president_party_id":"4704428",
            "president_party_name":"LK64",
            "original_party_id":"4704428",
            "original_party_name":"LK64",
            "president_popularity":"156",
            "job_title":"2",
            "elections_counter":"117",
            "elections_counter_right":"39",
            "popularity_hint":{
                "level":"success",
                "title":"TXT_PRODUCTIVITY_HINT_TITLE_VERY_HIGH"}}},
            }
        }
    }
    "15905":{
        ...
    }
    ...
}

Note that the "President" part is optional: only if there is a head of state


*/

