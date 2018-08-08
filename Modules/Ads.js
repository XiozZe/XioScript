Module.add( new Module({

    id: "Ads",
    name: "Advertisements",
    explanation: `Set a subdivision's advertisement budget according to 'Budget' for the media 'Medium'. A 'Minimum' budget will set the budget to the minimum required for the medium. Required will set the budget to match the required number of contacts to keep the current reputation for TV, as given on the ads page. Population will set the budget to make sure the number of contacts is the population times the input given in the Population Input. For any other budget that Population Input is ignored. If this population budget exceeds Maximum it will be set to Maximum.  Maximum budget will set the maximum budget allowed by the top manager to keep 100% efficiency.`,
    subTypes: ["shop", "fitness", "hairdressing", "laundry", "restaurant", "medicine", "fuel", "repair", "kindergarten", "cellular"],
    predecessors: [],
    options: [
        new Option({
            id: "budget",
            name: "Budget",
            type: "select",
            start: "required",
            values: [
                new Value({ id: "zero", name: "Zero" }),
                new Value({ id: "minimum", name: "Minimum" }),
                new Value({ id: "required", name: "Required" }),
                new Value({ id: "population", name: "Population" }),
                new Value({ id: "maximum", name: "Maximum" }),
            ]
        }),
        new Option({
            id: "population",
            name: "Population",
            type: "textbox",
            format: "Float",
            start: 2.5
        }),
        new Option({
            id: "medium",
            name: "Medium",
            type: "select",
            start: "tv",
            values: [
                new Value({ id: "internet", name: "Internet" }),
                new Value({ id: "press", name: "Press" }),
                new Value({ id: "outdoor", name: "Outdoor" }),
                new Value({ id: "radio", name: "Radio" }),
                new Value({ id: "tv", name: "TV" }),
            ]
        })
    ],
    stats: [
        new Stat({ id: "budget", display: "Budgets Changed", format: "Plain"}),
        new Stat({ id: "media", display: "Media Changed", format: "Plain"})
    ],
    precleaner: [],
    execute: async function(domain, realm, companyid, subid, type, choice){
        
        const getMediumId = () => {
            switch (choice.medium) {
                case "internet": return "2260"
                case "press": return "2261"
                case "outdoor": return "2262"
                case "radio": return "2263"
                case "tv": return "2264"
                default: console.error(`Undefined medium: ${choice.medium} in Ads module`)
            }
        }

        const checkMediaChanged = (ads, mediumId) => {
            const array = [false, false, false, false, false]
            const mediumIndex = ads.mediaId.indexOf(mediumId)
            array[mediumIndex] = true
            return !array.every( (v, i) => v === ads.mediaChecked[i] )
        }

        const getPopulation = async () => {
            const cityOverview = await Page.get("CityOverview").load(domain, realm)
            const {cityId} = await GeoUtil.getGeoIdFromSubid(domain, realm, companyid, subid)
            return cityOverview[cityId].population
        }

        const getFame = async (mediumId, population) => {		

            const data = {
                moneyCost: 0,
                population,
                "type[0]": mediumId
            }
            const fame = await Page.get("Fame").send(data, domain, realm, subid)
            return fame
        }

        //Restricted by top manager
        const getMaxBudget = async () => {
            const q = await Page.get("Qualification").load(domain, realm)
            const managerIndex = q.image.indexOf("/img/qualification/advert.png")
            const manager = q.base[managerIndex] + q.bonus[managerIndex]
            return Math.floor(Formulas.maxAdsBudget(manager))
        }

        const getBudget = async (ads, mediumId) => {

            if(choice.budget === "zero"){
                return 0
            }

            const population = await getPopulation()
            const fame = await getFame(mediumId, population)
            const minBudget = fame.minCost
            const maxBudget = await getMaxBudget()

            let budget = 0;

            switch(choice.budget){
                case "minimum": budget = minBudget; break
                case "required": budget = ads.requiredContacts * parseFloat(fame.contactCost); break
                case "population": {
                    const p = await getPopulation()
                    const multiplier = choice.population
                    budget = p * multiplier * fame.contactCost
                    break
                }
                case "maximum": budget = maxBudget; break
            }

            budget = Math.max(minBudget, budget)
            budget = Math.min(budget, maxBudget)
            budget = Math.round(budget)
            return budget
        }

        const checkBudgetChanged = (ads, budget) => {
            if (budget === ads.budget){
                return false
            } else {
                return true
            }
        }
        
        const sendData = async (budget, mediumId) => {

            const data = {}
            
            if (budget === 0){
                data.cancel = "Stop+advertising"
            } else {
                data["advertData[type][]"] = mediumId
                data["advertData[totalCost]"] = budget
            }

            await Page.get("Advertising").send(data, domain, realm, subid)
        }

        const updateStats = (mediumChanged, budgetChanged) => {
            if (mediumChanged) {
                Results.addStats(this.id, "media", 1)
            }            
            if (budgetChanged) {
                Results.addStats(this.id, "budget", 1)
            }
        }
        
        const ads = await Page.get("Advertising").load(domain, realm, subid)
        
        const mediumId = getMediumId()
        const mediumChanged = checkMediaChanged(ads, mediumId)
        const budget = await getBudget(ads, mediumId)
        const budgetChanged = checkBudgetChanged(ads, budget)

        if (mediumChanged || budgetChanged) {
            await sendData(budget, mediumId)
            updateStats(mediumChanged, budgetChanged)           
        }
    }
}));