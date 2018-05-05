const Technology = {
    
    name: "Technology",
    explanation: `Set the Technology level. The technology will not be higher than allowed under the top-manager. 'Manager' will determine which qualification level to use: 'Target' gives qualification without bonuses, 'Maximum' with bonus. Overflow will set the tech level to the maximum for which the subdivision can get 100% efficiency, but keep in mind that TOP3 (number of total employees) should be lower, because TOP1 is overloaded.`,
    subTypes: ["workshop", "mine", "mill", "orchard", "animalfarm", "sawmill", "farm", "apiary", "oilpump", "fishingbase"],
    options: {
        "Manager": ["Target", "Maximum", "Overflow"]
    },
    predecessor: [],
    calls: {
        "Checked": "Subdivisions Checked",
        "Pages": "Tech Pages Checked",
        "Level": "Tech Level Changes"
    },
    execute: async (subid, choice, type) => {

        let tech = await Scrapper.get(`/${Vital.getRealm()}/main/company/view/${Vital.getCompanyId()}/unit_list/technology`, VirtoMap.TechList);
        let qual = await Scrapper.get(`/${Vital.getRealm()}/main/user/privat/persondata/knowledge`, VirtoMap.Manager);

        let pageChecked = 0;
        let techChanged = 0;

        //Find index for this subdivision in the tech list
        let j = (() => {
            for(let j in tech.subid)
                if(subid === tech.subid[j])
                    return j;
        })();

        let qualImg = HardData.getManagerImg(tech.type[j]);
        let qualIndex = qual.pic.indexOf(qualImg);
        let manReq = qual.base[qualIndex];
        let manMax = manReq + qual.bonus[qualIndex];
        let mananager = 0;

        switch(choice["Manager"]){
            case "Target":
                manager = manReq;
                break;
            case "Maximum":
                manager = manMax;
                break;
            case "Overflow":
                manager = manMax * 6/5;
                break;							
        }

        let maxtech = Math.floor(Formulas.techLevel(manager));

        if(tech.level[j] < maxtech){
            pageChecked = 1;
            techpage = await Scrapper.get(`/${Vital.getRealm()}/main/unit/view/${subid}/technology`, VirtoMap.Technology);
            
            //Go through all possible better tech level candidates
            for(let i = techpage.level.length - 1; techpage.level[i] > techpage.curlevel; i--){
                
                //Yours means here that it's free
                if(techpage.level[i] <= maxtech && techpage.yours[i]){
                    techChanged = 1;
                    Ajax.post(`/${Vital.getRealm()}/main/unit/view/${subid}/technology`, `level=${techpage.level[i]}`);
                    break;
                }
            }

        }

        return {
            "Checked": 1,
            "Pages": pageChecked,
            "Level": techChanged
        }

    }
};