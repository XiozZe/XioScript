const Equipment = {
    
    name: "Equipment",
    explanation: `Fix equipment`,
    subTypes: ["workshop", "mine", "mill", "orchard", "animalfarm", "sawmill", "farm", "apiary", "oilpump", "fishingbase", "lab"],
    options: {
        "Repair": ["Black Parts", "All Parts", "One Percent"],
        "Quantity": ["Current", "Employees", "Full"],
        "Required": ["Fulfill", "Ignore"],
        "Heuristic": ["Lowest Price", "Lowest PQR"],
        "Manager": ["Target", "Maximum", "Overflow"],
        "Price": ["$10,000", "$100,000", "$1,000,000", "$10,000,000", "Infinite"],
        "Source": ["World Market", "Yourself"]
    },
    predecessor: ["Production Sale", "Technology", "Research"],
    calls: {

    },
    oneByOne: true,
    execute: async(subid, choice, type) => {

        let makeEquipFromEquipList = (equipList) => {
            //I don't want to copy the same functions for Equip and EquipList

            let index = equipList.subid.indexOf(subid);

            return {					
                qualityCur: equipList.qualityCur[index],
                qualityReq: equipList.qualityReq[index],
                quantityCur: equipList.quantityCur[index],
                quantityMax: equipList.quantityMax[index],
                wearBlack: equipList.wearPercent[index],
                wearRed: equipList.wearRed[index],
                wearPercent: equipList.wearPercent[index]
            }

        }

        let addWearBlackRedToEquip = (equip) => {

            equip.wearBlack = Math.floor(equip.wearPercent/100 * equip.quantityCur);
            equip.wearRed = Math.ceil((equip.wearPercent/100 * equip.quantityCur) % 1);

            return equip;

        }

        let getRepairQuantity = (equip) => {
            
            switch(choice["Repair"]){
                case "Black Parts":
                    return equip.wearBlack;
                case "All Parts":
                    return equip.wearBlack + equip.wearRed;
                case "One Percent":
                    if(equip.wearPercent[index] > 1)
                        return Math.floor(equip.wearPercent/100 * equip.quantityCur);
                    else
                        return 0;
            }

        }

        let getAimQuantity = async (equip) => {
            
            switch(choice["Quantity"]){
                case "Current":
                    return equip.quantityCur;
                case "Employees":
                    let salaryList = await Scrapper.get(`/${Vital.getRealm()}/main/company/view/${Vital.getCompanyId()}/unit_list/employee/salary`, VirtoMap.SalaryList);
                    let salaryIndex = salaryList.subid.indexOf(subid);
                    let employeeRatio = salaryList.emplWrk[salaryIndex] / salaryList.emplMax[salaryIndex];
                    return employeeRatio * equip.quantityMax;
                case "Full":
                    return equip.quantityMax;
            }

        }

        let needsToDoEquipment = async (equip) => {

            let repairQuantity = getRepairQuantity(equip);
            let qualityTooLow = equip.qualityCur <= equip.qualityReq;
            let notEnoughEquipment = equip.quantityCur !== await getAimQuantity(equip);

            return repairQuantity || qualityTooLow || notEnoughEquipment;

        }		

        let getMinQuality = (equip) => {

            switch(choice["Required"]){
            case "Fulfill":
                return equip.qualityReq;
            case "Ignore":
                return 0;				
            }

        }

        let getManager = async () => {

            let qual = await Scrapper.get(`/${Vital.getRealm()}/main/user/privat/persondata/knowledge`, VirtoMap.Manager);
            
            let managerImg = HardData.getManagerImg(type);
            let managerIndex = qual.pic.indexOf(managerImg);

            switch(choice["Manager"]){
            case "Target":
                return qual.base[managerIndex];
            case "Maximum":
                return qual.base[managerIndex] + qual.bonus[managerIndex];
            case "Overflow":
                return (qual.base[managerIndex] + qual.bonus[managerIndex]) * (6/5);					
            }

        }

        let getMaxQuality = async () => {
            
            let salaryList = await Scrapper.get(`/${Vital.getRealm()}/main/company/view/${Vital.getCompanyId()}/unit_list/employee/salary`, VirtoMap.SalaryList);

            let manager = await getManager();
            let top1 = HardData.getTop1(type);
            let emplIndex = salaryList.subid.indexOf(subid);
            let employees = salaryList.emplWrk[emplIndex] || salaryList.emplMax[emplIndex];

            return Formulas.equip( Formulas.skill( employees, top1, manager) );
            
        }

        let getMaxPrice = () => {

            switch(choice["Price"]){
                case "$10,000":
                    return 10000;
                case "$100,000":
                    return 100000;
                case "$1,000,000":
                    return 100000;
                case "Infinite":
                    return Infinity;
            }

        }
        
        let extractSuppliersFromPage = (equip) => {

            let suppliers = [];

            for(let offerIndex in equip.offerId){

                suppliers.push({
                    id: equip.offerId[offerIndex],
                    price: equip.offerPrice[offerIndex],
                    quality: equip.offerQuality[offerIndex],
                    available: equip.offerAvailable[offerIndex],
                    PQR: equip.offerPrice[offerIndex] / equip.offerQuality[offerIndex],
                    buy: 0
                });

            }

            return suppliers;

        }

        let addCurrentAsSupplier = (equip, suppliers) => {
            suppliers.push({
                id: "CURRENT",
                price: 0,
                quality: equip.qualityCur,
                available: equip.quantityCur,
                PQR: 0,
                buy: 0
            });
            return suppliers;
        }

        let filterSuppliers = (suppliers) => {

            let filterMaxPrice = (supplier) => {
                return supplier.price < getMaxPrice();
            }

            return suppliers.filter(filterMaxPrice);
            
        }

        let applyPQRinsteadOfPrice = (suppliers) => {

            if(choice["Heuristic"] === "Lowest PQR"){
                for(let supplier of suppliers)
                    supplier.price /= supplier.quality;
            }

            return suppliers;
        }

        let sortSuppliersOnPrice = (suppliers) => {

            suppliers.sort((sup1, sup2) => {
                return sup1.price - sup2.price;
            });

            return suppliers;
        }
        
        let getSuppliers = (equip) => {
            
            let suppliers = extractSuppliersFromPage(equip);
            suppliers2 = addCurrentAsSupplier(equip, suppliers);
            suppliers3 = filterSuppliers(suppliers2);
            suppliers4 = applyPQRinsteadOfPrice(suppliers3);
            suppliers5 = sortSuppliersOnPrice(suppliers4);

            return suppliers5;
            
        }

        let fillSuppliersWithLowestPrice = (suppliers, quantity) => {
            
            for(let supplier of suppliers){

                let toBuy = Math.min(supplier.available, quantity);
                quantity -= toBuy;
                supplier.buy += toBuy;

                if(quantity === 0)
                    break;

            }

            if(!quantity)
                return suppliers;
            else{
                StatTracker.addMessage(`Could not find enough suppliers for <a href=https://virtonomics.com/mary/main/unit/view/${subid}>${subid}</a> that meet the requirements.`);
                return false;
            }
                
        }
    
        let calcSuppliersAverageQuality = (suppliers) => {

            let quality = 0;
            let buy = 0;

            for(let supplier of suppliers){
                quality += supplier.quality * supplier.buy;
                buy += supplier.buy;
            }

            return quality/buy;

        }

        let findMostQualityChange = (suppliers, averageQuality, qualityDirection) => {
            
            let bestSupplier;
            let mostChange = 0;
            for (let supplier of suppliers){

                let qualityChange = (supplier.quality - averageQuality) / supplier.price;

                let betterUp = qualityChange > mostChange && qualityDirection === "UP";
                let betterDown = qualityChange < mostChange && qualityDirection === "DOWN";

                if( supplier.available - supplier.buy > 0 && (betterUp || betterDown) ){
                    bestSupplier = supplier;
                    mostChange = qualityChange;
                }

            }

            return bestSupplier;

        }

        let changeBuyOfSupplier = (composition, specificSupplier, changeInBuy) => {

            for(let supplier of composition){

                if(supplier.id === specificSupplier.id){
                    supplier.buy += changeInBuy;
                    break;
                }
            }

            return composition

        }

        let findBestReplacement = (composition, bestSupplier, qualityDirection) => {

            composition = changeBuyOfSupplier(composition, bestSupplier, 1);
            
            let worstSupplier;
            let bestPQR = Infinity;

            for(let supplier of composition){

                let qualityUp = bestSupplier.quality > supplier.quality && qualityDirection === "UP";
                let qualityDown = bestSupplier.quality < supplier.quality && qualityDirection === "DOWN";

                if(supplier.buy && supplier.id !== bestSupplier.id && (qualityUp || qualityDown) ){
                    
                    let qualityChange = Math.abs(bestSupplier.quality - supplier.quality);
                    let priceIncrease = bestSupplier.price - supplier.price;
                    let PQR = priceIncrease / qualityChange;

                    if(PQR < bestPQR){
                        worstSupplier = supplier;
                        bestPQR = PQR;
                    }		

                }
            }

            composition = changeBuyOfSupplier(composition, worstSupplier, -1);

        }

        let findBetterComposition = (composition, qualityDirection) => {

            let averageQuality = calcSuppliersAverageQuality(composition);
            let bestSupplier = findMostQualityChange(composition, averageQuality, qualityDirection);

            if(!bestSupplier){
                StatTracker.addMessage(`Could not find enough suppliers for <a href=https://virtonomics.com/mary/main/unit/view/${subid}>${subid}</a> that meet the requirements.`);
                return false;
            }

            let betterComposition = findBestReplacement(composition, bestSupplier, qualityDirection);

            return composition;

        }

        let findBestComposition = async (equip) => {

            let suppliers = getSuppliers(equip);
            let quantity = getRepairQuantity(equip) + await getAimQuantity(equip);
            let composition = fillSuppliersWithLowestPrice(suppliers, quantity);

            if(!composition) 
                return false;

            let minQual = getMinQuality(equip);
            let maxQual = await getMaxQuality();
            let curQual = calcSuppliersAverageQuality(composition);
            
            let maxIterations = 100000;
            let iteration = 0;

            if( minQual >= maxQual ){
                StatTracker.addMessage("Minimum Quality is higher than Maximum Quality for subdivision <a href=https://virtonomics.com/mary/main/unit/view/${subid}>${subid}</a>");
                return false;
            }

            while( (curQual < minQual || curQual > maxQual) && iteration++ < maxIterations){

                let qualityDirection = curQual < minQual ? "UP" : "DOWN";
                composition = findBetterComposition(composition, qualityDirection);

                if(!composition){
                    //Is false if something bad has happened
                    break;
                }

                curQual = calcSuppliersAverageQuality(composition);

            }					

            console.log("Iterations done: ", iteration);

            return composition;

        }		

        let buyComposition = async (suppliers) => {
            console.log(subid, suppliers);
            return false;
        }

        let equipList = await Scrapper.get(`/${Vital.getRealm()}/main/company/view/${Vital.getCompanyId()}/unit_list/equipment`, VirtoMap.EquipmentList);
        
        //It's fake: it extracts enough data from the equipment list to do certain functions meant for equip (so I don't have to copy).
        //FakeEquip already has Wear Black and Wear Red
        let fakeEquip = makeEquipFromEquipList(equipList);

        if( await needsToDoEquipment(fakeEquip) ){
            
            let equipUrl = `/${Vital.getRealm()}/window/unit/equipment/${subid}`;
            let realEquip = await Scrapper.get(equipUrl, VirtoMap.Equipment);				
            realEquip = addWearBlackRedToEquip(realEquip);

            console.log("Change took place");


            /*
            let maxIterations = 1;
            let iteration = 0;
            while( await needsToDoEquipment(realEquip) && iteration++ < maxIterations){

                let composition = await findBestComposition(realEquip);					 

                if(composition){
                    await buyComposition(composition);
                    Scrapper.clean(equipUrl);
                    realEquip = await Scrapper.get(equipUrl, VirtoMap.Equipment);
                    realEquip = addWearBlackRedToEquip(realEquip);
                }
                else{
                    //Something bad happened
                    break;
                }
                
            }
            */
        }




        //if(!qE.num[j] || !torep && (qE.quality[j] >= qE.required[j] || opt.q1[i].choice[1] === 2)) return;
                    
        
        
        


        return false;

        let qualReq = (qE.required[j] || 0) + 0.005;
        let qualNow = qE.quality[j] - 0.005;
        let qualMax = Infinity;
                    
        //repair
        for(let k = 0; k < torep; k++){
                                    
            let lowestPQR = Infinity;
            let bestqual = 0;
            let best;				
                                
            for(let l = 0; l < eq.offer.length; l++){
                                        
                //Some contracts are not good enough without even looking at them
                let PQR = eq.price[l] / eq.qualOffer[l];
                if(PQR > lowestPQR && (eq.qualOffer[l] < qualNow || bestqual > qualNow || opt.q1[i].choice[0] !== 2) || eq.available - repair[eq.offer[l]] === 0)
                    continue;
                        
                //What happens to the total quality if we buy one of this contract more?
                qualEst = qualNow;							
                repair[eq.offer[l]]++;								
                for(let m in repair){
                    if(repair[m]){
                        qualEst = ((qE.num[j] - repair[m]) * qualEst + repair[m] * eq.qualOffer[eq.offer.indexOf(Tools.parse(m))]) / qE.num[j];
                    }															
                }
                repair[eq.offer[l]]--;			
                
                //Remember that this is the new best deal
                if(opt.q1[i].choice[0] === 1 && (qualEst > qualReq || qualEst > qualNow && qualNow < qualReq)
                || opt.q1[i].choice[0] === 2 && qualEst < qualMax ){
                    best = eq.offer[l];
                    lowestPQR = PQR;
                    bestqual = eq.qualOffer[l];
                }						
            }

            if(best >= 0){
                repair[best]++;
            } else{
                postMessage(`Could not repair subdivision <a href="/${Vital.getRealm()}/main/unit/view/${qE.subid[j]}">${qE.subid[j]}</a>, no equipment met the required quality`);
                break;
            }
            
        }			
        
        //replace
        if(opt.q1[i].choice[0] === 1){				

            qualEst = qualNow;									
            for(let m in repair){
                if(repair[m]){;
                    qualEst = ((qE.num[j] - repair[m]) * qualEst + repair[m] * eq.qualOffer[eq.offer.indexOf(Tools.parse(m))]) / qE.num[j];
                }															
            }	
            qualNow = qualEst;
                            
            while(qualEst < qualReq){
                                        
                let lowestPQR = Infinity;
                let best;				
                                    
                for(let l = 0; l < eq.offer.length; l++){
                                            
                    let PQR = eq.price[l] / (eq.qualOffer[l] - qualNow);
                    if(PQR < lowestPQR && eq.qualOffer[l] > qualReq && eq.available[l] - repair[eq.offer[l]] - replace[eq.offer[l]] > 0) {								
                        best = eq.offer[l];
                        lowestPQR = PQR;
                    }						
                }

                if(best >= 0){
                                                
                    let bestqual = eq.qualOffer[eq.offer.indexOf(Tools.parse(best))];
                    let numNeeded = Math.ceil((qualReq - qualEst) / (bestqual - qualNow) * qE.num[j]);
                    let toreplace = Math.min(numNeeded, eq.available[eq.offer.indexOf(Tools.parse(best))] - repair[best]);
                    replace[best] = toreplace;							
                    qualEst += toreplace * (bestqual - qualNow) / qE.num[j];
                    
                } else{
                    postMessage(`Could not increase the quality of subdivision <a href="/${Vital.getRealm()}/main/unit/view/${qE.subid[j]}">${qE.subid[j]}</a>, no equipment met the required quality`);
                    break;
                }				
                
            }	
            
        }
        
        //buy

        //repair
        for(let m in repair){
            if(repair[m]){
                dealsmade++;
                sccount.qrepair += repair[m];
                sccount.qprice += eq.price[eq.offer.indexOf(Tools.parse(m))] * repair[m];
                await xPost(`/${Vital.getRealm()}/ajax/unit/supply/equipment`, {
                    operation : "repair",
                    offer : m,
                    unit : qE.subid[j],
                    supplier : m,
                    amount : repair[m]
                }, "qdeals", "JSON").then(go);
            }															
        }
        
        //replace				
        for(let m in replace){
            if(replace[m]){
                dealsmade += 2;
                sccount.qreplace += replace[m];
                sccount.qprice += eq.price[eq.offer.indexOf(Tools.parse(m))] * replace[m];
                await xPost(`/${Vital.getRealm()}/ajax/unit/supply/equipment`, {
                    operation : "terminate",
                    unit : qE.subid[j],
                    amount : replace[m]
                }, "qdeals", "JSON").then(go);
                await xPost(`/${Vital.getRealm()}/ajax/unit/supply/equipment`, {
                    operation : "buy",
                    offer : m,
                    unit : qE.subid[j],
                    supplier : m,
                    amount : replace[m]
                }, "qdeals", "JSON").then(go);
            }															
        }			

    }
};
