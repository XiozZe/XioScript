Module.add( new Module({
    
    id: "Research",
    name: "Research",
    explanation: `If no project is currently running, one level higher than the last finished project will be started, as long as the level does not exceed the technology level allowed by the top manager. Step 2: If no hypothesis is currently in study, the script will pick the hypothesis based on the 'Tactic': 'Highest' will use the highest probability chance, 'Fastest' will use the shortest completion time or 'Smartest' will calculate the average completion time for each hypothesis and selects the lowest. Step 3: The script will go through all possible factories that can be attached to the lab, looking for the highest load times efficiency. If the lab cannot find a factory with a efficiency and load higher than zero, it will give off a message and not select anything.`,
    subTypes: ["lab"],
    options: [
        new Option({
            id: "tactic",
            name: "Tactic",
            type: "select",
            start: "smartest",
            values: [
                new Value({ id: "highest", name: "Highest" }),
                new Value({ id: "fastest", name: "Fastest" }),
                new Value({ id: "smartest", name: "Smartest" }),
            ]
        })
    ],
    predecessors: [],
    stats: [
        new Stat({ id: "continue", display: "Researches Continued", format: "Plain" }),
        new Stat({ id: "hypothesis", display: "Hypotheses Set", format: "Plain" }),
        new Stat({ id: "attach", display: "Subdivisions Attached", format: "Plain" })
    ],
    precleaner: [],
    execute: async function(domain, realm, companyid, subid, type, choice) {

        const getManagerLevel = async () => {
            const level = await ManagerUtil.getLevel(domain, realm, type)
            const bonus = await ManagerUtil.getBonus(domain, realm, type)
            return level + bonus            
        }

        const pickNewResearch = async (lab) => {

            if (!lab.lastIndustry) {
                Results.warningLog(`No clue what to research!`, {domain, realm, subid, type})
                return
            }								
            
            const manager = await getManagerLevel()
            const maxTechLevel = Formulas.techLevel(manager)
                                                                        
            if (lab.lastLevel + 1 > maxTechLevel) {
                return
            }	

            const data = {
                industry: lab.lastIndustry, 
                unit_type: lab.lastType
            }

            const ProjectCreatePage = Page.get("ProjectCreate")
            const p = await ProjectCreatePage.send(data, domain, realm, subid)

            if (p.canContinue) {
                data.level = lab.lastLevel + 1
                data.create = "Invent"
                await ProjectCreatePage.send(data, domain, realm, subid)  
                Results.addStats(this.id, "continue", 1)             
            } 
            else {
                const s = `Maximum technology level research for this size. Could not research the next level.`
                Results.warningLog(s, {domain, realm, subid, url})
            }            
            
        }

        const pickNewHypothesis = async () => {

            const calcStudyTime = (p, k) => {
                //p is possibility between 0 and 1
                //k is reference time between 0 and +infinite   
                
                const calcProduct = (p, n) => {
                    let value = 1
                    for(let m = 1; m <= n-1; m++){
                        value *= (1-(1/100*(m-1)+p))
                    }
                    return value
                }   

                let value = 0
                for(let n = 0; n <= 100*(1-p); n++){
                    value += k*(n+1)*(1/100*n+p)*calcProduct(p, n+1)				
                }
                return value
            }

            const getStudyTimeWithTactic = (time, chance) => {

                switch(choice.tactic){
                    case "highest":
                        return 1/chance
                    case "fastest":
                        return time + 0.0001/chance
                    case "smartest":
                        return calcStudyTime(chance/100, time)
                    default: console.error(`Module Research does not have tactic ${choice.tactic}`)

                }

            }
            
            const hypothesesById = ListUtil.restructById("hypothesisId", lab)
            const hypotheses = Object.values(hypothesesById)

            const f = (a, v) => {
                const vh = getStudyTimeWithTactic(v.hypothesisTime, v.hypothesisChance)
                const ah = getStudyTimeWithTactic(a.hypothesisTime, a.hypothesisChance)
                return vh < ah? v : a
            }
            const bestHypothesis = hypotheses.reduce(f)

            const data = {
                selectedHypotesis: bestHypothesis.hypothesisId,
                selecIt: "Select+a+hypothesis"
            }

            await Page.get("Laboratory").send(data, domain, realm, subid)
            Results.addStats(this.id, "hypothesis", 1)            
        }

        const pickNewFactory = async () => {

            const e = await Page.get("ExperimentalUnit").load(domain, realm, subid)
            const possibleFactories = e.subid
                        
            if (!possibleFactories.length) {
                Results.warningLog(`No subdivision available to support`, {domain, realm, subid, type})
                return
            }

            const forecastPromises = []
            const efficiencyList = []
            for (const id of possibleFactories) {
                const data = { "unit_id" : id }
                const p = Page.get("Forecast").send(data, domain, realm)
                p.then(f => efficiencyList.push(f))
                forecastPromises.push(p)
            }            
            await Promise.all(forecastPromises)
            
            const f = (acc, value) => {
                if (acc.efficiency * acc.load < value.efficiency * value.load){
                    return value;
                } else {    
                    return acc;
                }
            }
            const g = {
                unit_id: 0, 
                productivity: 0, 
                loading: 0
            }
            const mostEfficient = efficiencyList.reduce(f, g)
            
            if (!mostEfficient.unit_id) {
                Results.warningLog(`No subdivision available to support.`, {domain, realm, subid, type})
                return
            }

            const data = {
                unit: mostEfficient.unit_id,
                next: "Select"
            }
            
            await Page.get("ExperimentalUnit").send(data, domain, realm, subid)
            Results.addStats(this.id, "attach", 1)
            
            if (mostEfficient.productivity * mostEfficient.loading < 100) {
                Results.warningLog(`Factory attached, but not working 100%.`, {domain, realm, subid, type})
            }
        }
        
        const continueResearch = async (lab) => {

            if(lab.isFree){
                await pickNewResearch(lab)
            } else if (lab.isHypothesisStage && !lab.isHypothesisChosen){
                await pickNewHypothesis(lab)
            } else if (lab.hasBadFactory || lab.hasAbsentFactory){
                await pickNewFactory(lab)
            }

        }

        const lab = await Page.get("Laboratory").load(domain, realm, subid)
        await continueResearch(lab)

    }
}))