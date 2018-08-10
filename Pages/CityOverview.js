Page.add(new Page({

    id: "CityOverview",

    getUrl: (domain, realm) => {
        return `${domain}/api/${realm}/main/geo/city/browse`
    }

}));

/* 
Has the following layout:
         
{
    "3031": {
        "id":"3031",
        "region_id":"15923",
        "country_id":"15906",
        "region_name":"Northern France",
        "country_name":"France",
        "level":"5",
        "population":"2449548",
        "plough_field":"35800",
        "salary":"395.48",
        "unemployment":"0",
        "education":"9.2",
        "x":"233",
        "y":"4886",
        "status":"0",
        "wealth_level":"37.59",
        "country_symbol":"fr",
        "city_id":"3031",
        "city_name":"Paris",
        "novice_shield":"0",
        "restrictions":null,
        "restrictions_count":"0",
        "retails":null,
        "retail_count":"0",
        "intellectuals_cost":"0.00",
        "merchants_cost":"0.00",
        "workers_cost":"43.02",
        "mayor":{
            "id":"3031",
            "mayor_user_id":"855039",
            "mayor_name":"gfife11",
            "popularity_rate":"0.00426324088276713",
            "turnout":"1",
            "elections_id":"1852",
            "city_name":"Paris",
            "region_name":"Northern France",
            "country_name":"France",
            "country_symbol":"fr",
            "mayor_elections_counter":"152",
            "mayor_elections_counter_right":"4",
            "security_level":"2",
            "country_id":"15906",
            "region_id":"15923",
            "popularity":"0.00426324088276713",
            "popularity_hint":{
                "level":"danger",
                "title":"TXT_PRODUCTIVITY_HINT_TITLE_VERY_LOW"
            },
            "info":{
                "villas_ids":null,
                "villas_size":null,
                "party_popularity_rate":"0",
                "mayor_party_popularity_rate":"0.0019423137629969",
                "turnout":"1",
                "security_level":"2",
                "id":"3031"
            }
        }
    },
    
"3032":{
    ...
}
*/

