Page.add(new Page({

    id: "RegionOverview",

    getUrl: (domain, realm) => {
        return `${domain}/api/${realm}/main/geo/region/bonuses`;
    }

}));

/* 
Has the following layout:

{            
    "15916":{
        "id":"15916",
        "country_id":"15904",
        "name":"England",
        "country_name":"United Kingdom",
        "landarea":"133",
        "population":"50762900",
        "tax":"23",
        "status":"0",
        "sort":"0",
        "city_count":"10",
        "country_symbol":"uk",
        "region_id":"15916",
        "region_name":"England",
        "governor":{
            "governor_user_id":"1107890",
            "governor_name":"luisk2",
            "elections_id":null,
            "governor_party_id":"4704428",
            "governor_party_name":"LK64",
            "original_party_id":"4704428",
            "original_party_name":"LK64",
            "governor_popularity":"150",
            "new_tax":null,
            "elections_counter":"92",
            "elections_counter_right":"64",
            "popularity":"150",
            "popularity_hint":{
                "level":"success",
                "title":"TXT_PRODUCTIVITY_HINT_TITLE_VERY_HIGH"}
            },
            "bonus":null,
            "projects":[]
        },
    }
    "15917":{
        ...
    }
    ...
}

Note that the "governor" part is optional: only if there is a head of state


*/

