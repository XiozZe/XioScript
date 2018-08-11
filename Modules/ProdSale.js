Module.add( new Module({
    
    id: "ProdSale",
    name: "Production Sale",
    explanation: `Sets the prices and policies of the sales page. The price option will let you pick a price formula: zero, primecost (plus one penny), the Indicative Price of that good, or a more difficult formula: CTIE = prime cost * (1 + CTIE rate), profit tax = prime cost * (1 + CTIE rate) * (1 + region's profit tax rate). You can also let the price determine by the market: If you put for example '20' in the 'Percentile' input box it will increase the price in such a way that the Price/Quality ratio is at least higher than 20% of the rest of the market. Set 'Percentile' to '0' to ignore this feature. By changing the 'Multiplier' the price you have chosen gets multiplied by the number you fill in the box. Note that whatever price you set, the script will not let you put a price higher than 30 times the Indicative Price. Origin will determine if the Stock or Output value for prime cost and quality will be used (makes no difference for warehouses). To Zero will determine what the script will do when it is about to set a value to zero: set it to zero, or keep the old price. The 'Price Hike' will give off a warning if the price has increased by 30% if you fill in '30' in the box. The policy option will set the policy to the selected. If the target is all goods, that means all goods will be set to the selected policy. If the target is Output Only, only goods that have output last turn are set to the selected policy, and all other goods will be set to No Sale.`,
    subTypes: ['animalfarm', 'apiary', 'farm', 'fishingbase', 'mill', 'mine', 'oilpump', 'orchard', 'sawmill', 'warehouse', 'workshop'],
    predecessors: [],
    options: [       
        new Option({
            id: "price",
            name: "Price",
            type: "select",
            start: "primeCost",
            values: [
                new Value({ id: "zero", name: "Zero" }),
                new Value({ id: "primeCost", name: "Prime Cost" }),
                new Value({ id: "profitTax", name: "Profit Tax" }),
                new Value({ id: "CTIE", name: "CTIE" }),
                new Value({ id: "IP", name: "IP" }),            
            ]
        }),
        new Option({
            id: "percentile",
            name: "Percentile",
            type: "textbox",
            format: "Float",
            start: 0
        }),
        new Option({
            id: "multiplier",
            name: "Multiplier",
            type: "textbox",
            format: "Float",
            start: 1
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
            id: "priceHike",
            name: "Price Hike",
            type: "textbox",
            format: "Float",
            start: 20
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
            const ip = await Page.get("CustomDuties").load(domain, realm, countryId)			
            return ip.data[productId].min_cost
        }

        const getCTIE = async (regionId, productId) => {
            const CTIErates = await Page.get("CTIErates").load(domain, realm, regionId)
            return parseInt(CTIErates.data[productId].tax)/100
        }

        const getProfitTax = async (regionId) => {
            const regionOverview = await Page.get("RegionOverview").load(domain, realm)
            return parseInt(regionOverview[regionId].tax)/100
        }

        const getOutputOrStock = (output, stock) => {
            //Warehouses do not have an primecostOutput
            if(choice.origin === "output" && type !== "warehouse"){
                return output
            }
            else{
                return stock
            }            
        }

        const getBasePrice = async (primecost, IP, productId, regionId) => {

            switch(choice.price){
                case "zero": return 0
                case "primeCost": return primecost+0.01 < 30*IP && primecost ? primecost+0.01 : primecost
                case "CTIE": {
                    const CTIE = await getCTIE(regionId, productId)
                    return primecost*(1+CTIE)
                }
                case "profitTax": {
                    const CTIE = await getCTIE(regionId, productId)
                    const profitTax = await getProfitTax(regionId)            
                    const price = primecost*(1+CTIE*profitTax)
                    return price < 30*IP? price : Math.max(primecost, 30*IP)
                }
                case "IP": return IP
            }

        }

        const getPercentilePrice = async (quality, productId) => {
            
            if (choice.percentile > 100 || choice.percentile < 0) {
                Results.warningLog(`The percentile of the Production Sale module should be between 0 and 100.`)
            }

            if (!quality) {
                return 0
            }

            let c = choice.percentile
            c = Math.min(c, 100)
            c = Math.max(0, c)
            const percentile = c / 100

            if (percentile === 0) {
                return 0
            }

            const m = await Page.get("ProductMarket").load(domain, realm, productId)
            const p = ListUtil.restructById("subid", m)
            const supplierList = Object.values(p)

            if (!supplierList.length) {
                return 0
            }

            supplierList.forEach(v => v.PQR = v.price / v.quality)
            supplierList.sort((a, b) => a.PQR - b.PQR)
            const v = supplierList.length * percentile
            const criticalValue = Math.ceil(v) - 1
            console.log(percentile, criticalValue, supplierList)
            const PQR = supplierList[criticalValue].PQR

            return quality * PQR
        }

        const decidePrice = async (primecost, quality, productName) => {
                        
            const productIdPromise = ProductUtil.getProductId(domain, realm, productName)
            const geoPromise = GeoUtil.getGeoIdFromSubid(domain, realm, companyid, subid)
            const productId = await productIdPromise
            const {countryId, regionId} = await geoPromise
            const IP = await getIP(countryId, productId)
            
            let price = await getBasePrice(primecost, IP, productId, regionId)
            const percentilePrice = await getPercentilePrice(quality, productId)
            console.log(price, percentilePrice)
            price = Math.max(price, percentilePrice)
            price = price * choice.multiplier

            const maxPrice = 30*IP            
            if(price > maxPrice && price > primecost){
                price = Math.max(primecost, maxPrice)
            }

            return Math.round(price*100)/100
        }

        //If the new price is zero, we can set the price to zero or keep the old price         
        const decideToZero = (oldPrice, newPrice) => {
            if(choice.toZero === "holdOld" && !newPrice){
                return oldPrice
            }
            return newPrice
        }

        const checkPriceHike = (oldPrice, newPrice, productName) => {
            const priceHike = choice.priceHike
            const p = 1 + choice.priceHike / 100
            if (oldPrice && priceHike && newPrice > oldPrice * p ) {
                const s = `A price hike has taken place. The price of ${productName} has increased from $${oldPrice} to $${newPrice}`
                Results.normalLog(s, {domain, realm, subid, type})
            }
        }

        const decidePolicy = () => {
            switch(choice.policy){
                case "noSale":
                    return "0"
                case "anyCustomer":
                    return "1"
                case "myCompany":
                    return "3"
                case "myCorporation":
                    return "5"
                default:
                    console.error(`Could not find policy ${choice.policy} in the Production Sale module`)
            }
        }
            
        //Set the policy to no sale if the goods aren't produced                  
        const decideOnlyTarget = (newPolicy, hasprimecostOutputColumn, primecostOutput) => {
            if(choice.targets === "outputOnly" && hasprimecostOutputColumn && !primecostOutput){
                return "0"
            }
            else{
                return newPolicy
            }

        }

        const updateStats = (oldPrice, oldPolicy, newPrice, newPolicy) => {
            //Function wrapper because we want to execute it after the data was send   
            return () => {
                if(oldPolicy !== newPolicy)
                    Results.addStats(this.id, "setPolicy", 1)
                if(oldPrice !== newPrice)
                    Results.addStats(this.id, "setPrice", 1)
                if(oldPrice > 0 && newPrice === 0)                    
                    Results.addStats(this.id, "setToZero", 1)
                if(oldPrice === 0 && newPrice > 0)                            
                    Results.addStats(this.id, "setFromZero", 1)
            }               
                  
        }

        const addPostData = (oldPrice, oldPolicy, newPrice, newPolicy, productData, volume) => {
            const data = {}
            if(oldPolicy !== newPolicy || oldPrice !== newPrice){
                data[productData+"[price]"] = newPrice
                data[productData+"[max_qty]"] = volume
                data[productData+"[constraint]"] = newPolicy
            }
            return data
        }

        const salePage = Page.get("ProdSale")
        const saleData = await salePage.load(domain, realm, subid)     
        const p = ListUtil.restructById("productId", saleData)
        const products = Object.values(p)

        const data = {}
        const updates = []
        
        for(const product of products){
            
            const {primecostOutput, primecostStock, qualityOutput, qualityStock, productName, productData, volume} = product
            const oldPrice = product.price
            const oldPolicy = product.policy 

            const hasprimecostOutputColumn =  !!saleData.primecostOutput.length

            const primecost = getOutputOrStock(primecostOutput, primecostStock)
            const quality = getOutputOrStock(qualityOutput, qualityStock)

            let newPrice = await decidePrice(primecost, quality, productName)
            newPrice = decideToZero(oldPrice, newPrice)
            checkPriceHike(oldPrice, newPrice, productName)
            let newPolicy = decidePolicy()
            newPolicy = decideOnlyTarget(newPolicy, hasprimecostOutputColumn, primecostOutput)  
            
            const u = updateStats(oldPrice, oldPolicy, newPrice, newPolicy)
            updates.push(u)
            const a = addPostData(oldPrice, oldPolicy, newPrice, newPolicy, productData, volume)
            Object.assign(data, a)
        }
        
        if(Object.keys(data).length){
            await salePage.send(data, domain, realm, subid)
        }
        updates.forEach(update => update())

    }
}))