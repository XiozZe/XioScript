const Holiday = {
    name: "Holiday",
    explanation: `This function will turn the holiday for workers on and off. If 'Base' is set to holiday, the subdivision will go on holiday. If set to working, holiday will be off. Exceptions are made for certain buildings: if 'Stock' is set to 'Holiday' the subdivision will go on holiday if there are no goods in stock (Retail) or the are no goods of one of the items in stock (Production), and this overrides the 'Working' setting of 'Base'. Same thing for laboratories: 'Research' to 'Holiday' will force a laboratory to holiday if no research is being done or if no subdivision is attached.	`,
    subTypes: ["workshop", "mine", "mill", "orchard", "animalfarm", "sawmill", "farm", "apiary", "oilpump", "fishingbase", "shop", "lab", "warehouse"],
    options: {
        "Base": ["Holiday", "Working"],
        "Stock": ["Holiday", "Ignore"],
        "Research": ["Holiday", "Ignore"]
    },
    predecessor: ["Production Supply", "Research"],
    calls: {
        "Checked": "Pages Checked",
        "Holiday": "Send on Holiday",
        "Working": "Send back to Work"
    },
    execute: async(subid, choice, type) => {
        
        //Not finished: need Retail And Service supply

        let isOnHoliday = Tools.once(async () => {
            let salaryList = await Scrapper.get(`/${Vital.getRealm()}/main/company/view/${Vital.getCompanyId()}/unit_list/employee/salary`, VirtoMap.SalaryList);
            let index = salaryList.subid.indexOf(subid);
            return salaryList.onHoliday[index];
        });

        let isEmptyStock = async () => {

            let supplyUrl = `/${Vital.getRealm()}/main/unit/view/${subid}/supply`;
            Scrapper.clean(supplyUrl);

            let subTypesProduction = ["workshop", "animalfarm", "apiary"];
            let subTypesRetail = ["shop"];
            let subTypesService = [];

            if(subTypesProduction.includes(type)){
                let supply = await Scrapper.get(supplyUrl, VirtoMap.ProductionSupply);
                return false;					
            }
            else if(subTypesRetail.includes(type)){
                return false;
            }
            else if (subTypesService.includes(type)){
                return false;
            }

        }

        let isNoResearch = async () => {

            let labUrl = `/${Vital.getRealm()}/main/unit/view/${subid}/investigation`;
            Scrapper.clean(labUrl); //To see what Research has set
            let lab = await Scrapper.get(labUrl, VirtoMap.Research);

            return lab.isFree || lab.isAbsent;
        }

        let goingOnHoliday = Tools.once(async () => {
            let subTypesWithStock = ["workshop", "animalfarm", "apiary", "shop"];
            
            return  choice["Base"] === "Holiday" ||
                    choice["Stock"] === "Holiday" && subTypesWithStock.includes(type) && await isEmptyStock() ||
                    choice["Research"] === "Holiday" && type === "lab" && await isNoResearch();
        });
        
        let call = {
            "Checked": true,
            "Holiday": false,
            "Working": false
        }

        if(!await isOnHoliday() && await goingOnHoliday()){
            await Ajax.get(`/${Vital.getRealm()}/main/unit/view/${subid}/holiday_set`);
            call["Holiday"] = true;
        } 
        else if(await isOnHoliday() && !await goingOnHoliday()){			
            await Ajax.get(`/${Vital.getRealm()}/main/unit/view/${subid}/holiday_unset`, "none");
            call["Working"] = true;
        }
        
        return call;
    }
}