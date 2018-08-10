Module.add( new Module({
    
    id: "Technology",
    name: "Technology",
    explanation: `Set the Technology level of a subdivision. Only technology research by your company will be introduced, meaning that the purchase costs are always zero. The technology will not be higher than allowed under the top-manager. The option "Bonus" will determine if the bonus qualification will be taken in account when the maximum technology level is calculated.`,
    subTypes: ['animalfarm', 'apiary', 'coal_power', 'farm', 'fishingbase', 'incinerator_power', 'mill', 'mine', 'oil_power', 'oilpump', 'orchard', 'sawmill', 'sun_power', 'workshop'],
    predecessors: [],
    options: [
        new Option({
            id: "bonus",
            name: "Bonus",
            type: "select",
            start: "on",
            values: [
                new Value({ id: "on", name: "On" }),
                new Value({ id: "off", name: "Off" })
            ]
        })
    ],
    stats: [
        new Stat({ id: "changed", display: "Techs Changed", format: "Plain" })
    ],
    precleaner: [],
    execute: async function(domain, realm, companyid, subid, type, choice){

        const getManagerLevel = async () => {
            const baseLevel = await ManagerUtil.getLevel(domain, realm, type);
            switch(choice.bonus){
                case "on": return baseLevel + await ManagerUtil.getBonus(domain, realm, type)
                case "off": return baseLevel
            }
        }

        const techList = await Page.get("TechList").load(domain, realm, companyid)
        const techInfo = ListUtil.restructById("subid", techList)[subid]
        const managerLevel = await getManagerLevel()
        const maxTech = Formulas.techLevel(managerLevel)

        if(techInfo.level < maxTech){
            const techPickPage = Page.get("TechPick");
            const techPick = await techPickPage.load(domain, realm, subid)

            //Go through all possible better tech level candidates
            for(let i = techPick.levelTech.length - 1; techPick.levelTech[i] > techPick.levelCurrent; i--){
                
                //Yours means here that it's free
                if(techPick.levelTech[i] <= maxTech && techPick.isYours[i]){
                    const data = {
                        level: techPick.levelTech[i]
                    }
                    await techPickPage.send(data, domain, realm, subid)
                    Results.addStats(this.id, "changed", 1)
                    break
                }
            }
        }
    }
}));