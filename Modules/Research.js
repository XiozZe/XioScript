const Research = {
    
    name: "Research",
    explanation: `(Step 1) If no project is currently running, one level higher than the last finished project will be started, as long as the level does not exceed the technology level allowed by the top manager (Target/Maximum/Overflow) or without restriction (Infinite). (Step 2) If no hypothesis is currently in study, the script will pick the hypothesis with the highest probability chance (Highest), the shortest completion time (Fastest) or calculate the average completion time for each hypothesis and selects the best (Smartest). (Step 3) The script will go through all possible factories that can be attached to the lab, looking for the highest load times efficiency. If the lab cannot find a factory with a efficiency and load higher than zero, it will give off a message.`,
    subTypes: ["lab"],
    options: {
        "Manager": ["Target", "Maximum", "Overflow", "Infinite"],
        "Tactic": ["Highest", "Fastest", "Smartest"]
    },
    predecessor: [],
    calls: {
        "Checked": "Pages Checked",
        "Continue": "Researched Continued",
        "Hypothesis": "Hypotheses Set",
        "Attach": "Subdivisions Attached"
    },
    execute: async (subid, choice, type) => {

        let call = {
            "Checked": 1,
            "Continue": 0,
            "Hypothesis": 0,
            "Attach": 0
        }

        let getManager = async (techChoice) => {

            let qual = await Scrapper.get(`/${Vital.getRealm()}/main/user/privat/persondata/knowledge`, VirtoMap.Manager);
            let manIndex = qual.pic.indexOf("/img/qualification/research.png");
            let manager = 0;

            switch(techChoice){
                case "Target":
                    return manager = qual.base[manIndex];
                case "Maximum":
                    return manager = qual.base[manIndex] + qual.bonus[manIndex];
                case "Overflow":
                    return manager = (qual.base[manIndex] + qual.bonus[manIndex])*6/5;
                case "Infinite":
                    return manager = Infinity;
            }
        }

        let setResearchStageOne = async () => {

            if(!lab.industry){
                StatTracker.addMessage(`Laboratory <a href="/${Vital.getRealm()}/main/unit/view/${subid}/investigation">${subid}</a> has no clue what to research!`);
                return false;
            }								
            
            let manager = await getManager(choice["Manager"]);
            let maxTechLevel = Formulas.techLevel(manager); //Not rounded
                                                                        
            if(lab.level+1 >= maxTechLevel){
                return false;
            }	
            
            let projectCreateHTML = await Ajax.post(`/${Vital.getRealm()}/window/unit/view/${subid}/project_create`, `industry=${lab.industry}&unit_type=${lab.unittype}`);

            //It's not retrieved by get so we can't use Scrapper.get
            let projectCreate = VirtoMap.ProjectCreate($(projectCreateHTML));

            if(projectCreate.isContinue){
                let sendData = `industry=${lab.industry}&unit_type=${lab.unittype}&level=${lab.level}&create=Invent`;
                await Ajax.post(`/${Vital.getRealm()}/window/unit/view/${subid}/project_create`, sendData);
                call["Continue"]++;
            } 
            else {
                StatTracker.addMessage(`Laboratory <a href="/${Vital.getRealm()}/main/unit/view/${subid}/investigation">${subid}</a> reached the maximum technology level for its size. Could not research the next level.`);
            }	
            
        }

        let setResearchStageTwo = async () => {

            let calcProduct = (p, n) => {
                let value = 1;
                for(let m = 1; m <= n-1; m++){
                    value *= (1-(1/100*(m-1)+p));
                }
                return value;
            }   

            let calcStudyTime = (p, k) => {
                //p is possibility between 0 and 1
                //k is reference time between 0 and +infinite    
                let value = 0;
                for(let n = 0; n <= 100*(1-p); n++){
                    value += k*(n+1)*(1/100*n+p)*calcProduct(p, n+1);					
                }
                return value;
            }

            let getStudyTimeWithTactic = (tactic, time, chance) => {

                switch(tactic){
                    case "Highest":
                        return 1/chance;
                    case "Fastest":
                        return time + 0.0001/chance;
                    case "Smartest":
                        return calcStudyTime(chance/100, time);

                }

            }
            
            let favid = -1;
            let favindex = -1;
            let lowtime = Infinity;
            
            for(let j in lab.chance){

                let studytime = getStudyTimeWithTactic(choice["Tactic"], lab.time[j], lab.chance[j]);
                
                if(studytime < lowtime){
                    lowtime = studytime;
                    favid = lab.hypId[j];
                    favindex = j;
                }
                
            }
            
            if(lab.curIndex !== favindex){
                let data = `selectedHypotesis=${favid}&selectIt=Select+a+hypothesis`;
                await Ajax.post(`/${Vital.getRealm()}/main/unit/view/${subid}/investigation`, data);
                call["Hypothesis"]++;
            }


        }

        let setResearchStageThree = async () => {

            let expUnit = await Scrapper.get(`/${Vital.getRealm()}/window/unit/view/${subid}/set_experemental_unit`, VirtoMap.ExperimentalUnit);
            
            let effi = [];			
            
            if(!expUnit.id.length){
                StatTracker.addMessage(`No subdivision available to support laboratory <a href="/${Vital.getRealm()}/main/unit/view/${subid}/investigation">${subid}</a>.`);
                return false;
            }
            
            let forecastPromises = new Array();
            for(let unitId of expUnit.id){
                forecastPromises.push(Ajax.post(`/${Vital.getRealm()}/ajax/unit/forecast`, {"unit_id" : unitId}, "JSON"));
            }
            
            await Promise.all(forecastPromises);
            
            let effiList = [];
            for(let index in expUnit.id){
                let forecast = forecastPromises[index];
                effiList.push({
                    "unitId": expUnit.id[index], 
                    "efficiency": Tools.parse(forecast.productivity), 
                    "load": Tools.parse(forecast.loading)
                });
            }
                    
            let mostEffi = effiList.reduce((acc, value) => {
                if(acc.efficiency * acc.load < value.efficiency * value.load)
                    return value;
                return acc;
            }, {unitId:0, efficiency: 0, load:0})
            
            if(!mostEffi.unitId){
                StatTracker.addMessage(`No subdivision available to support laboratory <a href="/${Vital.getRealm()}/main/unit/view/${subid}/investigation">${subid}</a>.`);
                return false;
            } 

            let data = "unit="+mostEffi.unitId+"&next=Select";				
            await Ajax.post(`/${Vital.getRealm()}/window/unit/view/${subid}/set_experemental_unit`, data);
            call["Attach"]++;
        }

        let setResearchByStage = async () => {

            if(lab.isFree)
                await setResearchStageOne();
            else if(lab.isHypothesis && !lab.isBusy)
                await setResearchStageTwo();
            else if(lab.isAbsent || lab.isFactory)
                await setResearchStageThree();

        }

        let lab = await Scrapper.get(`/${Vital.getRealm()}/main/unit/view/${subid}/investigation`, VirtoMap.Research);
        await setResearchByStage();

        return call;			
    }
};