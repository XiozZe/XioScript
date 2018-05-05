Module.add( new Module({
    
    id: "ProdSupply",
    name: "Production Supply",
    explanation: `Set the supply on the Supply page. The amount gives a formula for the amount to supply. Zero is zero, required is the daily required. Economical is the same as required except when there is too much in stock, then it 2*required - stock. Excessive will aim for having two times required in stock all day: min{2*required, 3*required-stock}. When having more than one supplier for a product, the script will pick the best supplier given by the 'Order'. With Quality the script will prefer the supplier with the highest quality, Price: lowest price, PQR: lowest Price/Quality-Ratio. If there are suppliers missing or the suppliers together can't deliver enough goods, you will be informed.`,
    subTypes: ["workshop", "mine", "mill", "orchard", "animalfarm", "sawmill", "farm", "apiary", "oilpump", "fishingbase", "warehouse"],
    options: {
        "Amount": ["Zero", "Required", "Economical", "Excessive"], 
        "Order": ["PQR", "Price", "Quality"]
    },
    predecessors: ["ProdSale"],
    stats: {
        "Checked": "Pages Checked",
        "Changed": "Pages Changed",
        "Suppliers": "Suppliers Contacted"
    },
    oneByOne: false,
    execute: async (subid, choice, type) => {

        let rowcount = 0;
        let nosup = 0;
                    
        let supply = await Scrapper.get(`/${Vital.getRealm()}/main/unit/view/${subid}/supply`, VirtoMap.ProductionSupply);	
        let supplyposts = [];

        //Only post the message once
        let missingMessage = false;
        let notenoughMessage = false;

        for(let j in supply.stock){
            
            let newsupply = 0;
            
            //Pick amount to supply
            switch(choice["Amount"]){
                case "Zero":
                    newsupply = 0;
                    break;
                case "Required":
                    newsupply = supply.required[j];
                    break;
                case "Economical":
                    newsupply = Math.min(2 * supply.required[j] - supply.stock[j], supply.required[j]);
                    break;
                case "Excessive":
                    newsupply = Math.min(2 * supply.required[j], Math.max(3 * supply.required[j] - supply.stock[j], 0));
            }
            
            //Check if there is a supplier for this product
            if(supply.nosupplier[rowcount]){
                rowcount++;
                nosup++;
                if(newsupply)
                    missingMessage = true;
                continue;
            }
                        
            //Move to the next product row
            let startrow = rowcount;
            let rows = 1;
            while(supply.mainrow[rowcount + 1] === false && supply.nosupplier[rowcount + 1] === false){
                rowcount++;
                rows++;
            }

            //Keep track of all supplier information for this product
            let supplier = [];
            for(let k = startrow - nosup; k < startrow - nosup + rows; k++){
                supplier.push({
                    price : supply.price[k],
                    quality : supply.quality[k],
                    PQR : supply.price[k] / supply.quality[k],
                    available : Math.min(supply.available[k], supply.maximum[k]),					
                    supply : supply.parcel[k],
                    reprice : supply.reprice[k],
                    offer : supply.offer[k]
                });
            }
            
            //We want to select the suppliers in a certain order
            let sortfunc;
            switch(choice["Order"]){
                case "PQR":
                    sortfunc = (a, b) => a.PQR - b.PQR;
                    break;
                case "Price":
                    sortfunc = (a, b) => a.price - b.price;
                    break;
                case "Quality":
                    sortfunc = (a, b) => b.quality - a.quality;
                    break;
            }	
            supplier.sort(sortfunc);
            
            //Pick suppliers until the supply is fulfilled
            for(let k = 0; k < supplier.length; k++){
                let thissupply = Math.min(newsupply, supplier[k].available);
                if(thissupply !== supplier[k].supply || supplier[k].reprice){
                    let data = {
                        amount: thissupply,
                        offer: supplier[k].offer,
                        unit: subid
                    };
                    supplyposts.push(Ajax.post(`/${Vital.getRealm()}/ajax/unit/supply/create`, data, "json"));
                }				
                newsupply -= thissupply;
            }
            
            if(newsupply)
                notenoughMessage = true;	
            
            
            rowcount++;				
        }

        await Promise.all(supplyposts);

        if(missingMessage)
            StatTracker.addMessage(`Subdivision <a href="/${Vital.getRealm()}/main/unit/view/${subid}">${subid}</a> is missing a supplier!`);
        if(notenoughMessage)
            StatTracker.addMessage(`Subdivision <a href="/${Vital.getRealm()}/main/unit/view/${subid}">${subid}</a> does not have enough supply!`);

        return{
            Checked: 1,
            Changed: !!supplyposts.length,
            Suppliers: supplyposts.length
        }

    }
}));
