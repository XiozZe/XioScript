Module.add( new Module({

    id: "Ads",
    name: "Advertisements",
    explanation: `Set a subdivision's advertisement budget according to 'Budget' for the media 'Medium'. A minimum budget will set the budget to the minimum required for the medium. Required will set the budget to match the required number of contacts to keep the current reputation. Population xN will set the budget to make sure the number of contacts is the population times N. If that budget exceeds Maximum it will be set to Maximum. Maximum budget will set the maximum budget allowed by the top manager to keep 100%.`,
    subTypes: ["shop"],
    options: {
        "Budget": ["Zero", "Minimum", "Required", "Population x1", "Population x2", "Population x5", "Population x10", "Population x20", "Maximum"],
        "Medium": ["Internet", "Press", "Outdoor", "Radio", "TV"]
    },
    predecessors: [],
    stats: {
        "Checked": "Page Checked",			
        "Budget": "Budgets Changed",
        "Media": "Media Changed"
    },
    execute: async (result, subid, choice, type) => {
        
        //For the stats
        let doesMediumChange = (mediumIndex) => {

            //One should be on
            if(!ads.mediaChecked[mediumIndex])
                return true;

            //All others off
            for(let mediaIndex of ads.mediaChecked){
                if(ads.mediaChecked[mediaIndex] && mediaIndex !== mediumIndex)
                    return true;
            }

            return false;
        }
    
        //Population is also hardcoded in the script of the advertisement page, but difficult to reach
        let getPopulation = async () => {
            let	cityOverview = await Scrapper.get(`/${Vital.getRealm()}/main/common/main_page/game_info/bonuses/city`, VirtoMap.CityOverview);
            let cityIndex = cityOverview.name.indexOf(ads.city);				
            return cityOverview.population[cityIndex];
        }

        //We need extra data about required and population costs
        let getFame = async () => {							
            let fameUrl = `/${Vital.getRealm()}/ajax/unit/virtasement/${subid}/fame`;
            let fame = await Ajax.post(fameUrl, `moneyCost=${ads.budget}&population=${await getPopulation()}&type%5B0%5D=${mediumId}`);
            return JSON.parse(fame);
        }

        //Restricted by top manager
        let getMaxBudget = async () => {
            let qual = await Scrapper.get(`/${Vital.getRealm()}/main/user/privat/persondata/knowledge`, VirtoMap.Manager);
            let managerIndex = qual.pic.indexOf("/img/qualification/advert.png");
            let manager = qual.base[managerIndex] + qual.bonus[managerIndex];
            return Math.floor(Formulas.maxAdsBudget(manager));
        }

        //Restricted by medium lower bound
        let getMinBudget = async () => {
            let fame = await getFame();
            return fame.minCost;
        }
                    
        let getBudget = async () => {
            if(choice["Budget"] === "Zero"){
                return 0;
            }
            else if(choice["Budget"] === "Minimum"){
                let fame = await getFame();
                return fame.minCost;
            }
            else if(choice["Budget"] === "Required"){
                let fame = await getFame();
                return ads.requiredContacts * parseFloat(fame.contactCost);
            }
            else if(/Population x\d+/.test(choice["Budget"])){
                let multiplier = parseInt(choice["Budget"].match(/\d+/)[0]);
                let contactCost = parseFloat((await getFame()).contactCost);
                return await getPopulation() * contactCost * multiplier;
            }
            else if(choice["Budget"] === "Maximum"){
                return await getMaxBudget();
            }
        }

        let sharpenBudget = (budget, min, max) => {
            let newBudget = Math.min(Math.max(min, budget), max);
            return Math.round(newBudget / 1000) * 1000;
        }

        let sendData = async (budget, mediumId) => {
            let data = {};
            
            if(budget === 0){
                data["cancel"] = "Stop+advertising";
            }
            else{
                data["advertData[type][]"] = mediumId;
                data["advertData[totalCost]"] = budget;
            }

            let dataString = Tools.encodeObject(data);

            await Ajax.post(`/${Vital.getRealm()}/main/unit/view/${subid}/virtasement`, dataString);
        }
        
        let ads = await Scrapper.get(`/${Vital.getRealm()}/main/unit/view/${subid}/virtasement`, VirtoMap.Advertisement);
        
        let mediumIndex = ["Internet", "Press", "Outdoor", "Radio", "TV"].indexOf(choice["Medium"]);
        let mediumId = ads.mediaId[mediumIndex];	

        let budget = await getBudget();			
        if(budget !== 0)
            budget = sharpenBudget(budget, await getMinBudget(), await getMaxBudget());

        let budgetChanged = false;

        if(budget !== ads.budget){
            budgetChanged = true;
            await sendData(budget, mediumId);
        }
        
        //Something something results
        
        return {
            "Checked": 1,
            "Budget": budgetChanged,
            "Media": doesMediumChange(mediumIndex)
        };

    }
}));