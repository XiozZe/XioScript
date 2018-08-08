Page.add(new Page({

    id: "Forecast",

    getUrl: (domain, realm) => {
        return `${domain}/${realm}/ajax/unit/forecast`
    },


}))

/* 
    If you send this data:
    {
        "unit_id": "4212784"
    }

    You will get information on the efficiency of the subdivision:
    { 
        turn_id: "5782", 
        unit_id: "4212784", 
        manager_productivity: "1.000", 
        office_productivity: "0.000", 
        equipment_productivity: "1.000", 
        employee_productivity: "0.971", 
        unit_complexity: "0", 
        power: "10000", 
        loading: "100.00", 
        productivity: "0" 
    }

*/