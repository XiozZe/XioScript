Module.add( new Module({
    
    id: "Equipment",
    name: "Equipment",
    explanation: `This module can do two things: repair and manage equipment. For repairing the 'damage' option will give the minimum percentage of damage needed before the script will repair. With a value of 0.5 that means the wear and tear should be at least 0.5% before any repair will happen. Also there is an option 'Red Parts' that will determine if the +1 in red will be repaired or not. How repair happens will be determined by the 'Heuristic': with 'Low Price' the equipment with the lowest price will be bought. Same thing applies to 'High Quality' and 'Low P/Q' or 'Low P/Q2', where the last two mean Price/Quality ratio and Price/Quality^2 ratio. With the 'Required' option you can give a minimum quality (in addition to the required quality by technology), and with the 'Max Price' option you can give a maximum price. All suppliers that do not meet these criteria will be ignored. Also regarding the price: it ignores customs and transport costs. Then the managing part: if you set the 'Manage' option on 'On' it will start managing the number of pieces of equipment. The number of pieces is given by the 'Quantity' option, where 'Current' means don't change the number of pieces, 'Employee' means match the number of equipment with the number of employees, and 'Full' is change the number of pieces to maximum. To match these numbers, the script will add or remove equipment, also satisfying the required quality and the maximum price constraints. To calculate which suppliers to use, it uses Integer Programming to minimize the price. This managing part also replaces equipment if through technology changes the required equipment quality changes.`,
    subTypes: ['coal_power', 'cellular', 'farm', 'fishingbase', 'fitness', 'fuel', 'hairdressing', 'incinerator_power', 'kindergarten', 'lab', 'laundry', 'medicine', 'mill', 'mine', 'network', 'office', 'oil_power', 'oilpump', 'orchard', 'repair', 'restaurant', 'sawmill', 'sun_power', 'workshop'],
    predecessors: ["ProdSale", "Technology", "Research", "Employee"],
    options: [
        new Option({
            id: "damage",
            name: "Damage",
            type: "textbox",
            format: "Float",
            start: 0.5
        }),
        new Option({
            id: "red",
            name: "Red Parts",
            type: "select",
            start: "repair",
            values: [
                new Value({ id: "repair", name: "Repair" }),
                new Value({ id: "ignore", name: "Ignore" }),
            ]
        }),
        new Option({
            id: "required",
            name: "Required",
            type: "textbox",
            format: "Float",
            start: 15
        }),
        new Option({
            id: "manage",
            name: "Manage",
            type: "select",
            start: "off",
            values: [
                new Value({ id: "on", name: "On" }),
                new Value({ id: "off", name: "Off" })
            ]
        }),
        new Option({
            id: "quantity",
            name: "Quantity",
            type: "select",
            start: "current",
            values: [
                new Value({ id: "current", name: "Current" }),
                new Value({ id: "employees", name: "Employees" }),
                new Value({ id: "full", name: "Full" }),
            ]
        }),
        new Option({
            id: "price",
            name: "Max Price",
            type: "textbox",
            format: "Float",
            start: 100000
        }),
        new Option({
            id: "heuristic",
            name: "Heuristic",
            type: "select",
            start: "lowprice",
            values: [
                new Value({ id: "lowprice", name: "Low Price" }),
                new Value({ id: "lowPQR", name: "Low P/Q" }),
                new Value({ id: "lowPQ2R", name: "Low P/Q2" }),
                new Value({ id: "highqual", name: "High Quality" }),
            ]
        })/*,
        new Option({
            id: "source",
            name: "Source",
            type: "select",
            start: "world",
            values: [
                new Value({ id: "world", name: "World Market"}),
                new Value({ id: "yourself", name: "Yourself"})
            ]
        })*/
    ],
    stats: [
        new Stat({ id: "bought", display: "Equipment Bought", format: "Plain"}),
        new Stat({ id: "removed", display: "Equipment Removed", format: "Plain"}),
        new Stat({ id: "repaired", display: "Equipment Repaired", format: "Plain"}),
        //new Stat({ id: "spend", display: "Budget Spend", format: "Dollar"})
    ],
    precleaner: ["EmployeeList"],
    execute: async function(domain, realm, companyid, subid, type, choice) {

        //Finds the first subdivision on the equipment list that has the same type as this subdivision. We do this to make sure that a certain type is only been called once, because the page can only handle one at the time.
        const getEquipmentWindow = async (equipmentList) => {
            const index = equipmentList.type.findIndex(e => e === type);
            const sid = equipmentList.subid[index];
            return await Page.get("EquipmentWindow").load(domain, realm, sid);
        }

        const createPriceList = (equipmentWindow) => {
            const offers = ListUtil.restructById("offerId", equipmentWindow);
            const priceList = Object.values(offers);
            priceList.forEach(o => {
                o.price = o.offerPrice; 
                delete o.offerPrice;
                o.available = o.offerAvailable;
                delete o.offerAvailable
                o.quality = o.offerQuality;
                delete o.offerQuality;
                o.id = o.offerId;
                delete o.offerId;
                o.windowIndex = equipmentWindow.offerId.indexOf(o.id)
                o.toRepair = 0;
                o.toBuy = 0;
            });
            return priceList;
        }

        const sortPriceList = (priceList) => {
            switch(choice.heuristic){
                case "lowprice": priceList.sort( (a, b) => a.price - b.price ); break;
                case "lowPQR": priceList.sort( (a, b) => a.price/a.quality - b.price/b.quality ); break;
                case "lowPQ2R": priceList.sort( (a, b) => a.price/a.quality**2 - b.price/b.quality**2 ); break;
                case "highqual": priceList.sort( (a, b) => b.quality - a.quality ); break;
                default: console.error(`Undefined equipment heuristic: ${choice.heuristic}`);
            }
        }

        const filterPriceListMaxPrice = (priceList) => {
            const maxPrice = choice.price;
            priceList = priceList.filter(o => o.price <= maxPrice);
            return priceList;
        }

        const getNumPartsToRepair = (equipmentData) => {
            if(choice.damage > equipmentData.wearPercent)
                return 0;

            if(choice.red === "repair")
                return equipmentData.wearBlack + equipmentData.wearRed;
            else
                return equipmentData.wearBlack;
        }

        const getQualityRequired = (equipmentData) => {
            let qualityRequired = 0;
            if(equipmentData.qualityRequired){
                qualityRequired = equipmentData.qualityRequired;
            }
            return Math.max(qualityRequired, choice.required);
        }

        //Because the equipmentWindow page is shared between all subdivisions from the same type, we should decrease the number of pieces available if something is repaired or bought here.
        const reduceAvailability = (equipmentWindow, windowIndex, nPieces) => {
            equipmentWindow.offerAvailable[windowIndex] -= nPieces;
        }

        const determineRepair = (priceList, numPartsToRepair, qualityRequired, equipmentWindow) => {

            if(!numPartsToRepair)
                return priceList;

            let toRepair = numPartsToRepair;

            for(const offer of priceList){
                if(offer.quality > qualityRequired){
                    const repair = Math.min(toRepair, offer.available);
                    offer.toRepair = repair;
                    toRepair -= repair;
                    if(toRepair === 0){
                        break;
                    }
                }
            }

            if(toRepair > 0){
                Results.warningLog(`Could not be repaired. Needs ${numPartsToRepair} pieces of equipment with quality ${qualityRequired} and a maximum price of $${choice.price}, but could not find enough of them on the market.`, {domain, realm, subid, type});
                priceList.forEach( o => o.toRepair = 0 );
            }

            return priceList;
        }

        const repairStats = (offer) => {
            Results.addStats(this.id, "repaired", offer.toRepair);
            //Results.addStats(this.id, "spend", offer.toRepair*offer.price);
        }

        const repairEquipment = async (priceList, equipmentWindow) => {

            const offerPromises = [];
            for(const offer of priceList){
                if(offer.toRepair){
                    reduceAvailability(equipmentWindow, offer.windowIndex, offer.toRepair);
                    console.log(subid, offer);

                    const data = {
                        operation: "repair",
                        offer: offer.id,
                        unit: subid,
                        supplier: offer.id,
                        amount: offer.toRepair
                    }
    
                    const r = () => repairStats(offer);
                    const p = Page.get("EquipmentAjax").send(data, domain, realm).then(r);
                    offerPromises.push(p);
                }                
            }

            await Promise.all(offerPromises);
            
            if(offerPromises.length){
                await updateEmployeeList();
            }
        }

        const cleanRepairPriceList = (priceList) => {
            for (const offer of priceList){
                offer.available -= offer.toRepair;
                offer.toRepair = 0;
            }
            return priceList;
        }

        const getMachineQuantity = async (equipmentData) => {
            switch(choice.quantity){
                case "current": return equipmentData.quantityCurrent;
                case "full": return equipmentData.quantityMaximum;
                case "employees": 
                    const employeeList = await Page.get("EmployeeList").load(domain, realm, companyid);
                    const index = employeeList.subid.indexOf(subid);
                    const w = employeeList.employeesWorking[index];
                    const m = employeeList.employeesMaximum[index];
                    const workerRatio = Math.ceil(w/m*equipmentData.quantityMaximum);
                    return workerRatio;               
                default: console.error(`Equipment module has Quantity choice ${choice.quantity} that does not exist.`)
            }
        }

        //Adds an extra offer to the priceList, namely a fake offer that represents the current equipment in use
        const addHomeToPriceList = (priceList, equipmentData) => {
            priceList.push({
                price: 0,
                available: equipmentData.quantityCurrent,
                quality: equipmentData.qualityCurrent,                
                id: "HOME",
                windowIndex: "HOME",
                toRepair: 0,
                toBuy: 0
            });
            return priceList;
        }

        const getBuyRemoveModel = (priceList, machineQuantity, qualityRequired) => {

            const model = {
                "optimize": "price",
                "opType": "min",
                "constraints": {
                    "quality": {"min": qualityRequired * machineQuantity },
                    "pieces": {"equal": machineQuantity }
                },
                "variables": {},
                "ints": {}
            }

            for(const offer of priceList){
                model.constraints["c"+offer.id] = {"max": offer.available};
                model.variables[offer.id] = {
                    "price": offer.price,
                    "quality": offer.quality,
                    ["c"+offer.id]: 1,
                    "pieces": 1
                }
                model.ints[offer.id] = 1;
            }
            
            return model;
        }

        const determineBuyRemove = (priceList, model, qualityRequired, machineQuantity) => {
            
            const solution = Solver.solve(model);
            if(!solution.feasible){
                Results.warningLog(`Could not find equipment to make sure that it has ${machineQuantity} pieces of equipment with quality ${qualityRequired} and maximum price ${choice.price}.`, {domain, realm, subid, type});
                return priceList;
            }

            delete solution.feasible;
            delete solution.bounded;
            delete solution.result;

            for(const offerId in solution){
                const index = priceList.findIndex(o => o.id === offerId);
                priceList[index].toBuy = solution[offerId];
            }

            return priceList;
        }

        //If equipment is being changed, naturally the required skill for employees also change. However, the employeeList only gets updated after something employee related happens. So we have to force an update.
        const updateEmployeeList = async () => {
            const eL = await Page.get("EmployeeList").load(domain, realm, companyid)
            const data = {
                "unitEmployeesData[quantity]": eL.employeesWorking[1],
                "unitEmployeesData[salary]": eL.salaryWorking[1]
            }
            await Page.get("SalaryWindow").send(data, domain, realm, eL.subid[1])
        }

        const buyRemoveEquipment = async (priceList, equipmentData, equipmentWindow) => {

            const machinesKept = priceList.pop().toBuy; //Home offer is always last
            const machinesToRemove = equipmentData.quantityCurrent - machinesKept;

            //This have to be done first before the code jumps to another subdivision because of await/async
            for(const offer of priceList){
                if(offer.toBuy){
                    reduceAvailability(equipmentWindow, offer.windowIndex, offer.toBuy);
                }
            }

            if(machinesToRemove){
                const data = {
                    operation: "terminate",
                    unit: subid,
                    amount: machinesToRemove
                }
    
                const r = () => Results.addStats(this.id, "removed", machinesToRemove);
                await Page.get("EquipmentAjax").send(data, domain, realm).then(r);
            }            

            const offerPromises = [];
            for(const offer of priceList){
                if(offer.toBuy){
                    const data = {
                        operation: "buy",
                        offer: offer.id,
                        unit: subid,
                        supplier: offer.id,
                        amount: offer.toBuy
                    }
    
                    const b = () => Results.addStats(this.id, "bought", offer.toBuy);
                    const p = Page.get("EquipmentAjax").send(data, domain, realm).then(b);
                    offerPromises.push(p);
                }                
            }

            await Promise.all(offerPromises);

            if(offerPromises.length){
                await updateEmployeeList();
            }
        }


        const equipmentList = await Page.get("EquipmentList").load(domain, realm, companyid)
        const equipmentData = ListUtil.restructById("subid", equipmentList)[subid]
        const equipmentWindow = await getEquipmentWindow(equipmentList)
        let priceList = createPriceList(equipmentWindow)
        sortPriceList(priceList)
        priceList = filterPriceListMaxPrice(priceList)
        const numPartsToRepair = getNumPartsToRepair(equipmentData)
        const qualityRequired = getQualityRequired(equipmentData)
        priceList = determineRepair(priceList, numPartsToRepair, qualityRequired)
        await repairEquipment(priceList, equipmentWindow)

        if(choice.manage !== "on") return

        priceList = cleanRepairPriceList(priceList)
        const machineQuantity = await getMachineQuantity(equipmentData)
        priceList = addHomeToPriceList(priceList, equipmentData)
        const model = getBuyRemoveModel(priceList, machineQuantity, qualityRequired)
        priceList = determineBuyRemove(priceList, model, qualityRequired, machineQuantity)
        await buyRemoveEquipment(priceList, equipmentData, equipmentWindow)

    }
}));
