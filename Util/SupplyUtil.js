//This object has functions for the abhorrent structure of supply pages. Because there are more then one supply page (production, retail, warehouse) and they more or less work the same, we have this class
const SupplyUtil = {

    // Every supply page has products with a number of suppliers. Because the way the variables are gathered is all over the place (by row, by supplier, by good) we need to regulate that. Yielding this generator will retrieve all information for a good. The input arguments are the extracted variables of the supply page, sorted by their way of collection: per supplier or per good. Furthermore we need information on if a row is a "MainRow" meaning that on this row the good name and details are introduced, and if a row has "Suppliers", meaning that a contract is placed on that row.
    goodsGenerator: function*({goodsBased, supplierBased, isMainRow, hasSupplier}){

        let supplierIndex = 0;
        let goodIndex = 0;
        let supplierInfo = [];

        for(let i = 0; i < isMainRow.length; i++){

            //Add all information of this supplier to the supplierInfo
            if(hasSupplier[i]){

                const newSupplier = {};
                for(const v in supplierBased){
                    newSupplier[v] = supplierBased[v][supplierIndex];
                }
                supplierInfo.push(newSupplier);

                supplierIndex++;
            }

            //If we see that on the next row a new good starts, or the loop ends, finish of this good
            if(isMainRow[i+1] === undefined || isMainRow[i+1]){

                const newGood = {suppliers: supplierInfo};
                for(const v in goodsBased){
                    newGood[v] = goodsBased[v][goodIndex];
                }
                yield newGood;                
                supplierInfo = [];
                goodIndex++;
            }

        }
    },
    
}