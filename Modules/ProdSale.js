Module.add( new Module({
    
    id: "ProdSale",
    name: "Production Sale",
    explanation: `Sets the prices and policies of the sales page. The price option will let you pick a price formula: primecost (plus one penny), 1x or 30x the Indicative Price of that good, or a more difficult formula: CTIE = prime cost * (1 + CTIE rate), profit tax = prime cost * (1 + CTIE rate) * (1 + region's profit tax rate). You can also pick "Input", in that case the price will be set to the value you input in the Input textbox. If you don't pick Input the value in the Input textbox will be ignored. Note that whatever price you set, the script will not let you put a price higher than 30 times the Indicative Price. Origin will determine which prime cost to use: the Stock prime cost or the Output prime cost (makes no difference for warehouses). To Zero will determine what the script will do when it is about to set a value to zero: set it to zero, or keep the old price. The policy option will set the policy to the selected. If the target is all goods, that means all goods will be set to the selected policy. If the target is Output Only, only goods that have output last turn are set to the selected policy, and all other goods will be set to No Sale.`,
    subTypes: ['animalfarm', 'apiary', 'farm', 'fishingbase', 'mill', 'mine', 'oilpump', 'orchard', 'sawmill', 'warehouse', 'workshop'],
    predecessors: [],
    options: [         
        new Option({
            id: "price",
            name: "Price",
            type: "select",
            start: "primeCost",
            values: [
                new Value({ id: "input", name: "Input" }),
                new Value({ id: "primeCost", name: "Prime Cost" }),
                new Value({ id: "profitTax", name: "Profit Tax" }),
                new Value({ id: "CTIE", name: "CTIE" }),
                new Value({ id: "IPx1", name: "1x IP" }),
                new Value({ id: "IPx30", name: "30x IP" })
            ]
        }),
        new Option({
            id: "input",
            name: "Input",
            type: "textbox",
            format: "Float",
            start: 0
        }),
        new Option({
            id: "origin",
            name: "Origin",
            type: "select",
            start: "stock",
            values: [
                new Value({ id: "stock", name: "Stock" }),
                new Value({ id: "output", name: "Output"})
            ]    
        }),
        new Option({
            id: "toZero",
            name: "To Zero",
            type: "select",
            start: "setZero",
            values: [
                new Value({ id: "setZero", name: "Set Zero" }),
                new Value({ id: "holdOld", name: "Hold Old" }),
            ]
        }),
        new Option({
            id: "policy",
            name: "Policy",
            type: "select",
            start: "myCompany",
            values: [
                new Value({ id: "noSale", name: "No Sale" }),
                new Value({ id: "anyCustomer", name: "Any Customer" }),
                new Value({ id: "myCompany", name: "My Company" }),
                new Value({ id: "myCorporation", name: "My Corporation" })
            ]
        }),
        new Option({
            id: "targets",
            name: "Target",
            type: "select",
            start: "allGoods",
            values: [
                new Value({ id: "allGoods", name: "All Goods" }),
                new Value({ id: "outputOnly", name: "Output Only" })
            ]
        })
    ],
    stats: [
        new Stat({ id : "setPrice", display : "Prices Set", format : "Plain"}),
        new Stat({ id : "setToZero", display : "Prices Set to Zero", format : "Plain"}),
        new Stat({ id : "setFromZero", display : "Prices Set from Zero", format : "Plain"}),
        new Stat({ id : "setPolicy", display : "Policies Set", format : "Plain"})
    ],
    precleaner: [],
    execute: async function(domain, realm, companyid, subid, type, choice){
                
        const getIP = async (countryId, productId) => {            
            const ip = await Page.get("CustomDuties").load(domain, realm, countryId);				
            return ip.data[productId].min_cost;
        }

        const getCTIE = async (regionId, productId) => {
            const CTIErates = await Page.get("CTIErates").load(domain, realm, regionId);
            return parseInt(CTIErates.data[productId].tax)/100;
        }

        const getProfitTax = async (regionId) => {
            const regionOverview = await Page.get("RegionOverview").load(domain, realm);
            return parseInt(regionOverview[regionId].tax)/100;
        }

        const getPrimeCost = (primecostOutput, primecostStock) => {
            //Warehouses do not have an primecostOutput
            if(choice.origin === "output" && type !== "warehouse"){
                return primecostOutput;
            }
            else{
                return primecostStock;
            }            
        }

        const decidePrice = async (primecost, productName) => {
                        
            const productIdPromise = ProductUtil.getProductId(domain, realm, productName);
            const geoPromise = GeoUtil.getGeoIdFromSubid(domain, realm, companyid, subid);
            const productId = await productIdPromise;
            const {countryId, regionId} = await geoPromise;
            const IP = await getIP(countryId, productId);

            switch(choice.price){
                case "input": {
                    price = choice.input;
                    break;
                }
                case "primeCost": {
                    price = primecost+0.01 < 30*IP && primecost ? primecost+0.01 : primecost;
                    break;
                }
                case "CTIE": {
                    const CTIE = await getCTIE(regionId, productId);
                    price = primecost*(1+CTIE);
                    break;
                }
                case "profitTax": {
                    const CTIE = await getCTIE(regionId, productId);
                    const profitTax = await getProfitTax(regionId);                    
                    price = primecost*(1+CTIE*profitTax);
                    price = price < 30*IP? price : Math.max(primecost, 30*IP);
                    break;
                }
                case "IPx1": {
                    price = IP;
                    break;
                }
                case "IPx30": {
                    price = 30*IP;
                    break;
                }
            }

            if(price > 30*IP){
                price = Math.max(primecost, 30*IP);
            }
            return Math.round(price*100)/100;
        }

        //If the new price is zero, we can set the price to zero or keep the old price         
        const decideToZero = (newPrice, oldPrice) => {
            if(choice.toZero === "holdOld" && !newPrice){
                return oldPrice;
            }
            return newPrice;
        }

        const decidePolicy = () => {
            switch(choice.policy){
                case "noSale":
                    return "0";
                case "anyCustomer":
                    return "1";
                case "myCompany":
                    return "3";
                case "myCorporation":
                    return "5";
                default:
                    console.error(`Could not find policy ${choice.policy} in the Production Sale module`)
            }
        }
            
        //Set the policy to no sale if the goods aren't produced                  
        const decideOnlyTarget = (newPolicy, hasprimecostOutputColumn, primecostOutput) => {
            if(choice.targets === "outputOnly" && hasprimecostOutputColumn && !primecostOutput){
                return "0";
            }
            else{
                return newPolicy;
            }

        }

        const updateStats = (oldPrice, oldPolicy, newPrice, newPolicy) => {
            //Function wrapper because we want to execute it after the data was send   
            return () => {
                if(oldPolicy !== newPolicy)
                    Results.addStats(this.id, "setPolicy", 1);
                if(oldPrice !== newPrice)
                    Results.addStats(this.id, "setPrice", 1);
                if(oldPrice > 0 && newPrice === 0)                    
                    Results.addStats(this.id, "setToZero", 1);
                if(oldPrice === 0 && newPrice > 0)                            
                    Results.addStats(this.id, "setFromZero", 1);
            }               
                  
        }

        const addPostData = (oldPrice, oldPolicy, newPrice, newPolicy, productData, volume) => {
            const data = {};
            if(oldPolicy !== newPolicy || oldPrice !== newPrice){
                data[productData+"[price]"] = newPrice;
                data[productData+"[max_qty]"] = volume;
                data[productData+"[constraint]"] = newPolicy;
            }
            return data;
        }

        const salePage = Page.get("ProdSale");
        const saleData = await salePage.load(domain, realm, subid);        
        let data = {};
        const updates = []
        
        for(let j in saleData.price){
            
            const oldPrice = saleData.price[j];
            const oldPolicy = saleData.policy[j]; 
            const primecostOutput = saleData.primecostOutput[j];
            const primecostStock = saleData.primecostStock[j];
            const hasprimecostOutputColumn =  !!saleData.primecostOutput.length;
            const productName = saleData.productName[j]
            const productData = saleData.productData[j];
            const volume = saleData.volume[j];

            const primecost = getPrimeCost(primecostOutput, primecostStock);
            let newPrice = await decidePrice(primecost, productName);
            newPrice = decideToZero(newPrice, oldPrice);
            let newPolicy = decidePolicy(); 
            newPolicy = decideOnlyTarget(newPolicy, hasprimecostOutputColumn, primecostOutput);   
            
            updates.push(updateStats(oldPrice, oldPolicy, newPrice, newPolicy));
            Object.assign(data, addPostData(oldPrice, oldPolicy, newPrice, newPolicy, productData, volume));            
        }
        
        if(Object.keys(data).length){
            await salePage.send(data, domain, realm, subid);
        }
        updates.forEach(update => update());

    }
}));