Module.add( new Module({
    
    id: "ProdSupply",
    name: "Production Supply",
    explanation: `Set the supply on the Supply page of production facilities. Under amount you can set the number to supply. Zero is zero, required is the daily required. Economical is the same as required except when there is too much in stock, then it uses 2*required - stock. Excessive will aim for having two times required in stock all day: min{2*required, 3*required-stock}. "Minimum" will determine the minimum number of goods set for all suppliers: zero or one. Note that it overwrites the "Zero" set by amount. When having more than one supplier for a product, the script will pick the best supplier given by the 'Order'. With Quality the script will prefer the supplier with the highest quality, Price: lowest price, PQR: lowest Price/Quality-Ratio. In case the price of a supplier has changed, "Update" will determine whether the buy contract should be updated to the new price. If there are not enough suppliers to deliver enough goods, you will be informed if you set Warning on Insufficient, and if you set it on No Suppliers you will be warned only if a good has no suppliers.`,
    subTypes: ['animalfarm', 'apiary', 'farm', 'fishingbase', 'mill', 'mine', 'oilpump', 'orchard', 'sawmill', 'workshop'],
    predecessors: ["ProdSale"],
    options: [
        new Option({
            id: "amount", 
            name: "Amount",
            type: "select",
            start: "required",
            values: [
                new Value({ id: "zero", name: "Zero" }),
                new Value({ id: "required", name: "Required" }),
                new Value({ id: "economical", name: "Economical" }),
                new Value({ id: "excessive", name: "Excessive" })
            ]
        }),
        new Option({
            id: "minimum",
            name: "Minimum",
            type: "select",
            start: "zero",
            values: [
                new Value({ id: "zero", name: "Zero" }),
                new Value({ id: "one", name: "One", })
            ]
        }),
        new Option({
            id: "order", 
            name: "Order",
            type: "select",
            start: "price",
            values: [
                new Value({ id: "pqr", name: "PQR" }),
                new Value({ id: "price", name: "Price" }),
                new Value({ id: "quality", name: "Quality" })
            ]
        }),
        new Option({
            id: "reprice",
            name: "Update",
            type: "select",
            start: "no",
            values: [
                new Value({ id: "yes", name: "Yes" }),
                new Value({ id: "no", name: "No", })
            ]
        }),
        new Option({
            id: "warning",
            name: "Warning",
            type: "select",
            start: "never",
            values: [
                new Value({ id: "never", name: "Never" }),
                new Value({ id: "none", name: "No Suppliers" }),
                new Value({ id: "insufficient", name: "Insufficient" })
            ]
        })
    ],
    stats: [
        new Stat({ id : "setSupply", display : "Supply Set", format : "Plain"}),
        new Stat({ id : "setToZero", display : "Supply Set to Zero", format : "Plain"}),
        new Stat({ id : "setFromZero", display : "Supply Set from Zero", format : "Plain"}),
        new Stat({ id : "reprice", display : "Updated Price", format : "Plain"}),
    ],
    precleaner: [],
    execute: async function(domain, realm, companyid, subid, type, choice){

        const determineSupply = (required, stock, nSuppliers) => {

            let toSupply = 0;

            switch(choice.amount){
                case "zero":
                    toSupply = 0;
                    break;
                case "required":
                    toSupply = required;
                    break;
                case "economical":
                    toSupply = Math.min(2 * required - stock, required);
                    break;
                case "excessive":
                    toSupply = Math.min(2 * required, Math.max(3 * required - stock, 0));
                    break;
                default:                    
                    Results.errorLog(`${this.name} error: supply amount misspecified. (Production Supply Module)`);
            }

            if(choice.minimum === "one"){
                //Minimum is one for each supplier, so we have less to distribute
                toSupply -= nSuppliers;
            }

            return toSupply;
        }

        const determineOrderSortFunc = () => {
            switch(choice.order){
                case "pqr":
                    return (a, b) => a.price/a.qualitySupplier - b.price/b.qualitySupplier;
                case "price":
                    return (a, b) => a.price - b.price;
                case "quality":
                    return (a, b) => b.qualitySupplier - a.qualitySupplier;
                default:
                    Results.errorLog(`${this.name} error: sort function misspecified. (Production Supply Module)`);
            }	
        }
        
        //Post things to the results log if supply is insufficient
        const warnSupply = async (supplyLeft, suppliers, productId) => {

            if(choice.warning === "none" && !suppliers.length){
                const productName = await ProductUtil.getProductName(domain, realm, productId);
                const s = `${this.name}: Not have suppliers for ${productName}!`;
                Results.warningLog(s, {domain, realm, subid, type});
            }
            else if(choice.warning === "insufficient" && supplyLeft > 0){
                const productName = await ProductUtil.getProductName(domain, realm, productId);
                const s = `${this.name}: Not have enough suppliers for ${productName}!`;
                Results.warningLog(s, {domain, realm, subid, type});
            }

        }

        //Returns an array of promises with all the posts to set the supply plus the warnings
        const orderGoods = (suppliers, newsupply, productId) => {

            const supplyposts = [];
            for(const supplier of suppliers){

                let thissupply = newsupply;

                //Note that this extra good is not part of the "new supply" that is to be set
                if(choice.minimum === "one"){
                    thissupply++;
                }
                
                thissupply = Math.min(thissupply, supplier.available, supplier.maximum);

                newsupply -= thissupply;
            
                if(choice.minimum === "one"){
                    newsupply++;
                }                

                if(thissupply !== supplier.parcel || supplier.hasReprice && choice.reprice === "yes"){

                    const data = {
                        amount: thissupply,
                        offer: supplier.offerId,
                        unit: subid
                    };

                    const s = Page.get("Supplier").send(data, domain, realm);
                    const f = updateStats(thissupply, supplier.parcel, supplier.hasReprice);
                    s.then(f);
                    supplyposts.push(s);
                }				


            }   

            const w = warnSupply(newsupply, suppliers, productId);
            supplyposts.push(w);

            return supplyposts;

        }

        const updateStats = (newsupply, parcel, reprice) => {
            return () => {
                Results.addStats(this.id, "setSupply", 1);
                if(newsupply === parcel && reprice){
                    Results.addStats(this.id, "reprice", 1);
                }
                else if(newsupply !== parcel && newsupply === 0){
                    Results.addStats(this.id, "setToZero", 1);
                }
                else if(newsupply !== parcel && parcel === 0){
                    Results.addStats(this.id, "setFromZero", 1);
                }
            }
        }
                            
        const supply = await Page.get("ProdSupply").load(domain, realm, subid);
        const goodsIterator = SupplyUtil.goodsGenerator(supply);

        const supplyposts = [];

        for(const goodInfo of goodsIterator){
            
            const newsupply = determineSupply(goodInfo.required, goodInfo.quantity, goodInfo.suppliers.length);
            const f = determineOrderSortFunc();            
            goodInfo.suppliers.sort(f);
            const o = orderGoods(goodInfo.suppliers, newsupply, goodInfo.productId);
            supplyposts.push(...o);

        }

        await Promise.all(supplyposts);

    }
}));
