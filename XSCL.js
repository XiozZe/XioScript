//Supply
XSCL.push({
    row: "Supply",
    name: "Zero Supply",
    description: "The stock of selected production subdivisions will have their supply set to zero.",
    code: function(){

		xcMain(["animalfarm", "coal_power", "incinerator_power", "medicine", "mill", "oil_power", "repair", "restaurant", "workshop"]);
	
        xlist.push(function(){
			for(var i = 0; i < xvar.main.xcId.length; i++){
				xcGet("supplyGet", xvar.realm+"/main/unit/view/"+xvar.main.xcId[i]+"/supply");
			}
		});		

		xlist.push(function(){
			for(var i = 0; i < xvar.main.xcId.length; i++){	
				xvar.play.supply = [];
				if(xvar.supplyGet[i].parcel){
					for(var j = 0; j < xvar.supplyGet[i].parcel.length; j++){
						xvar.play.supply.push( 0 );
					}
					xcPost("supplyPost", xvar.supplyGet[i], [["parcel", xvar.play.supply]], "edit");
				}
				else{
					console.log("This subdivision has no suppliers: "+xvar.main.xcId[0]);
				}
			}
		});
		
		xcList();

    }
});
XSCL.push({
    row: "Supply",
    name: "Required Supply",
    description: "The stock of selected production subdivisions will have their supply set equal to the amount they require. Beware of the fact that each raw material has to have exactly one supplier: zero, two or more than two will give strange results, if any at all.",
    code: function(){

		xcMain(["animalfarm", "coal_power", "incinerator_power", "medicine", "mill", "oil_power", "repair", "restaurant", "workshop"]);
	
		xlist.push(function(){
			for(var i = 0; i < xvar.main.xcId.length; i++){
				xcGet("supplyGet", xvar.realm+"/main/unit/view/"+xvar.main.xcId[i]+"/supply");
			}
		});		

		xlist.push(function(){
			for(var i = 0; i < xvar.main.xcId.length; i++){	
				xvar.play.supply = [];
				if(xvar.supplyGet[i].parcel){
					for(var j = 0; j < xvar.supplyGet[i].parcel.length; j++){
						xvar.play.supply.push( xvar.supplyGet[i].required[j] );
					}
					xcPost("supplyPost", xvar.supplyGet[i], [["parcel", xvar.play.supply]], "edit");
				}
				else{
					console.log("This subdivision has no suppliers: "+xvar.main.xcId[0]);
				}
			}
		});
		
		xcList();

    }
});
XSCL.push({
	row: "Supply",
	name: "Supply XioStock",
	description: "The stock of selected production subdivisions aim to have three times the required amount. (Just in case, you know.) This function will set the supply accordingly. Beware of the fact that each raw material has to have exactly one supplier: zero, two or more than two will give strange results, if any at all.",	
	code: function(){
				
		xcMain(["animalfarm", "coal_power", "incinerator_power", "medicine", "mill", "oil_power", "repair", "restaurant", "workshop"]);
		
		xlist.push(function(){
			for(var i = 0; i < xvar.main.xcId.length; i++){
				xcGet("supplyGet", xvar.realm+"/main/unit/view/"+xvar.main.xcId[i]+"/supply");
			}
		});		

		xlist.push(function(){
			for(var i = 0; i < xvar.main.xcId.length; i++){	
				xvar.play.supply = [];
				if(xvar.supplyGet[i].parcel){
					for(var j = 0; j < xvar.supplyGet[i].parcel.length; j++){
						xvar.play.supply.push( 4 * xvar.supplyGet[i].required[j] - xvar.supplyGet[i].stock[j] 
						- Math.max(xvar.supplyGet[i].required[j] - xvar.supplyGet[i].stock[j] , 0));
					}
					xcPost("supplyPost", xvar.supplyGet[i], [["parcel", xvar.play.supply]], "edit");
				}
				else{
					console.log("This subdivision has no suppliers: "+xvar.main.xcId[0]);
				}
			}
		});
		
		xcList();
	}
});

//Price
XSCL.push({
	row: "Price",
	name: "Zero Price",
	description: "For all selected production subdivisions and warehouses: set the price to $0.00",	
	code: function(){
				
		xcMain(["animalfarm", "farm", "fishingbase", "mill", "mine", "oil_power", "oilpump", "orchard", "sawmill", "warehouse", "workshop"]);
		
		xlist.push(function(){
			for(var i = 0; i < xvar.main.xcId.length; i++){
				xcGet("priceGet", xvar.realm+"/main/unit/view/"+xvar.main.xcId[i]+"/sale");
			}
		});		

		xlist.push(function(){
			for(var i = 0; i < xvar.main.xcId.length; i++){	
				xvar.play.price = [];
				for(var j = 0; j < xvar.priceGet[i].price.length; j++){
					xvar.play.price.push(0);
				}
				xcPost("pricePost", xvar.priceGet[i], [["price", xvar.play.price]], "save");
			}
		});
		
		xcList();
	}
});
XSCL.push({
	row: "Price",
	name: "Prime Cost Price",
	description: "For all selected production subdivisions and warehouses: set the price to the prime cost of the stock. If the prime cost of the stock is zero, do nothing.",	
	code: function(){
				
		xcMain(["animalfarm", "farm", "fishingbase", "mill", "mine", "oil_power", "oilpump", "orchard", "sawmill", "warehouse", "workshop"]);
		
		xlist.push(function(){
			for(var i = 0; i < xvar.main.xcId.length; i++){
				xcGet("priceGet", xvar.realm+"/main/unit/view/"+xvar.main.xcId[i]+"/sale");
			}
		});		

		xlist.push(function(){
			for(var i = 0; i < xvar.main.xcId.length; i++){	
				xvar.play.price = [];
				for(var j = 0; j < xvar.priceGet[i].price.length; j++){
					xvar.play.price.push((xvar.priceGet[i].primeCost[j] +0.001) || xvar.priceGet[i].price[j]);
				}
				xcPost("pricePost", xvar.priceGet[i], [["price", xvar.play.price]], "save");
			}
		});
		
		xcList();
	}
});
XSCL.push({
	row: "Price",
	name: "CTIE Price",
	description: "For all selected production subdivisions and warehouses: set the price of the products to their prime cost increased by their CTIE. The price cannot exceed 30x IP. If the prime cost of the stock is zero, do nothing.",	
	code: function(){
				
		xcMain(["animalfarm", "farm", "fishingbase", "mill", "mine", "oil_power", "oilpump", "orchard", "sawmill", "warehouse", "workshop"]);
						
		xlist.push(function(){
			for(var i = 0; i < xvar.main.xcId.length; i++){
				xcGet("priceGet", xvar.realm+"/main/unit/view/"+xvar.main.xcId[i]+"/sale");
			}
			xcGet("transport", xvar.realm+"/main/common/main_page/game_info/transport");
			xcGet("TM", xvar.realm+"/main/globalreport/tm/info");
			xcGet("IP", xvar.realm+"/main/geo/countrydutylist/359837");
			xcGet("CTIE", xvar.realm+"/main/geo/regionENVD/359838");
		});		
		
		xlist.push(function(){
			for(var i = 0; i < xvar.main.xcId.length; i++){	
				xvar.play.price = [];
				for(var j = 0; j < xvar.priceGet[i].price.length; j++){
					xvar.play.franchiseIndex = xvar.TM[0].franchise.indexOf( xvar.priceGet[i].product[j] );
					xvar.play.product = xvar.TM[0].product[ xvar.play.franchiseIndex ] || xvar.priceGet[i].product[j];
					xvar.play.IPIndex = xvar.IP[0].product.indexOf( xvar.play.product );
					xvar.play.IP = xvar.IP[0].IP[ xvar.play.IPIndex ];
					
					xvar.play.CTIEIndex = xvar.CTIE[0].product.indexOf( xvar.play.product );
					xvar.play.CTIE = xvar.CTIE[0].CTIE[ xvar.play.CTIEIndex ];
					xvar.play.CTIEPrice = xvar.priceGet[i].primeCost[j] * (1 + xvar.play.CTIE/100);
					xvar.play.price.push( Math.min( Math.round(xvar.play.CTIEPrice*100)/100, 30 * xvar.play.IP ) || xvar.priceGet[i].price[j]);
				}
				xcPost("pricePost", xvar.priceGet[i], [["price", xvar.play.price]], "save");
			}
		});
		
		xcList();
	}
});
XSCL.push({
	row: "Price",
	name: "Profit Tax Price",
	description: "For all selected production subdivisions and warehouses: set the price of the products to their prime cost increased by their CTIE and the profit tax. The price cannot exceed 30x IP. If the prime cost of the stock is zero, do nothing.",	
	code: function(){
				
		xcMain(["animalfarm", "farm", "fishingbase", "mill", "mine", "oil_power", "oilpump", "orchard", "sawmill", "warehouse", "workshop"]); 
						
		xlist.push(function(){
			for(var i = 0; i < xvar.main.xcId.length; i++){
				xcGet("priceGet", xvar.realm+"/main/unit/view/"+xvar.main.xcId[i]+"/sale");
			}
			xcGet("transport", xvar.realm+"/main/common/main_page/game_info/transport");
			xcGet("TM", xvar.realm+"/main/globalreport/tm/info");
			xcGet("IP", xvar.realm+"/main/geo/countrydutylist/359837");
		});		

		xlist.push(function(){
			xvar.play.regionList = [];
			for(var i = 0; i < xvar.main.xcId.length; i++){
				if( xvar.play.regionList.indexOf( xvar.priceGet[i].region[0] ) === -1 ){
					xvar.play.regionList.push( xvar.priceGet[i].region[0] );
				}
			}
			for(var i = 0; i < xvar.play.regionList.length; i++){
				xvar.play.regionIndex = xvar.transport[0].regionName.indexOf( xvar.play.regionList[i] );
				xvar.play.regionId = xvar.transport[0].regionId[ xvar.play.regionIndex ];
				xcGet("CTIE", xvar.realm+"/main/geo/regionENVD/"+xvar.play.regionId);
			}
			
		});
		
		xlist.push(function(){
			for(var i = 0; i < xvar.main.xcId.length; i++){	
				xvar.play.price = [];
				for(var j = 0; j < xvar.priceGet[i].price.length; j++){
					xvar.play.franchiseIndex = xvar.TM[0].franchise.indexOf( xvar.priceGet[i].product[j] );
					xvar.play.product = xvar.TM[0].product[ xvar.play.franchiseIndex ] || xvar.priceGet[i].product[j];
					xvar.play.IPIndex = xvar.IP[0].product.indexOf( xvar.play.product );
					xvar.play.IP = xvar.IP[0].IP[ xvar.play.IPIndex ];
					
					xvar.play.CTIEpage = xvar.play.regionList.indexOf( xvar.priceGet[i].region[0] );
					xvar.play.CTIEIndex = xvar.CTIE[ xvar.play.CTIEpage ].product.indexOf( xvar.play.product );
					xvar.play.CTIE = xvar.CTIE[ xvar.play.CTIEpage ].CTIE[ xvar.play.CTIEIndex ];
					xvar.play.CTIEPrice = xvar.priceGet[i].primeCost[j] * (1 + xvar.play.CTIE/100 * xvar.CTIE[ xvar.play.CTIEpage ].profitTax/100);
					xvar.play.price.push( Math.min( Math.round(xvar.play.CTIEPrice*100)/100, 30 * xvar.play.IP ) || xvar.priceGet[i].price[j]);
				}
				xcPost("pricePost", xvar.priceGet[i], [["price", xvar.play.price]], "save");
			}
		});
		
		xcList();
	}
});
XSCL.push({
	row: "Price",
	name: "IP Price",
	description: "For all selected production subdivisions and warehouses: set the price of the products to 1x their IP.",	
	code: function(){
				
		xcMain(["animalfarm", "farm", "fishingbase", "mill", "mine", "oil_power", "oilpump", "orchard", "sawmill", "warehouse", "workshop"]);
						
		xlist.push(function(){
			for(var i = 0; i < xvar.main.xcId.length; i++){
				xcGet("priceGet", xvar.realm+"/main/unit/view/"+xvar.main.xcId[i]+"/sale");
			}
			xcGet("TM", xvar.realm+"/main/globalreport/tm/info");
			xcGet("IP", xvar.realm+"/main/geo/countrydutylist/359837");
		});		

		xlist.push(function(){
			for(var i = 0; i < xvar.main.xcId.length; i++){	
				xvar.play.price = [];
				for(var j = 0; j < xvar.priceGet[i].price.length; j++){
					xvar.play.franchiseIndex = xvar.TM[0].franchise.indexOf( xvar.priceGet[i].product[j] );
					xvar.play.product = xvar.TM[0].product[ xvar.play.franchiseIndex ] || xvar.priceGet[i].product[j];
					xvar.play.IPIndex = xvar.IP[0].product.indexOf( xvar.play.product );
					xvar.play.IP = xvar.IP[0].IP[ xvar.play.IPIndex ];
					xvar.play.price.push( xvar.play.IP );
				}
				xcPost("pricePost", xvar.priceGet[i], [["price", xvar.play.price]], "save");
			}
		});
		
		xcList();
	}
});
XSCL.push({
	row: "Price",
	name: "30IP Price",
	description: "For all selected production subdivisions and warehouses: set the price of the products to 30x IP.",	
	code: function(){
				
		xcMain(["animalfarm", "farm", "fishingbase", "mill", "mine", "oil_power", "oilpump", "orchard", "sawmill", "warehouse", "workshop"]);
						
		xlist.push(function(){
			for(var i = 0; i < xvar.main.xcId.length; i++){
				xcGet("priceGet", xvar.realm+"/main/unit/view/"+xvar.main.xcId[i]+"/sale");
			}
			xcGet("TM", xvar.realm+"/main/globalreport/tm/info");
			xcGet("IP", xvar.realm+"/main/geo/countrydutylist/359837");
		});		

		xlist.push(function(){
			for(var i = 0; i < xvar.main.xcId.length; i++){	
				xvar.play.price = [];
				for(var j = 0; j < xvar.priceGet[i].price.length; j++){
					xvar.play.franchiseIndex = xvar.TM[0].franchise.indexOf( xvar.priceGet[i].product[j] );
					xvar.play.product = xvar.TM[0].product[ xvar.play.franchiseIndex ] || xvar.priceGet[i].product[j];
					xvar.play.IPIndex = xvar.IP[0].product.indexOf( xvar.play.product );
					xvar.play.IP = xvar.IP[0].IP[ xvar.play.IPIndex ];
					xvar.play.price.push( 30 * xvar.play.IP );
				}
				xcPost("pricePost", xvar.priceGet[i], [["price", xvar.play.price]], "save");
			}
		});
		
		xcList();
	}
});

//Policy
XSCL.push({
	row: "Policy",
	name: "Not For Sale",
	description: "The policies for all goods of the selected subdivisions will be set to &quot;Not for sale&quot;. Works for production buildings and warehouses.",	
	code: function(){
		
		xcMain(["animalfarm", "farm", "fishingbase", "mill", "mine", "oil_power", "oilpump", "orchard", "sawmill", "warehouse", "workshop"]);
		
		xlist.push(function(){
			for(var i = 0; i < xvar.main.xcId.length; i++){
				xcGet("policyGet", xvar.realm+"/main/unit/view/"+xvar.main.xcId[i]+"/sale");
			}
		});
		
		xlist.push(function(){
			for(var i = 0; i < xvar.main.xcId.length; i++){	
				xvar.play.policy = [];
				for(var j = 0; j < xvar.policyGet[i].policy.length; j++){
					xvar.play.policy.push("Not for sale");
				}
				xcPost("policyPost", xvar.policyGet[i], [["policy", xvar.play.policy]], "save");
			}
		});
		
		xcList();
	}
});
XSCL.push({
	row: "Policy",
	name: "To Any Costumer",
	description: "The policies for all goods of the selected subdivisions will be set to &quot;To any costumer&quot;. Works for production buildings and warehouses.",	
	code: function(){
		
		xcMain(["animalfarm", "farm", "fishingbase", "mill", "mine", "oil_power", "oilpump", "orchard", "sawmill", "warehouse", "workshop"]);
		
		xlist.push(function(){
			for(var i = 0; i < xvar.main.xcId.length; i++){
				xcGet("policyGet", xvar.realm+"/main/unit/view/"+xvar.main.xcId[i]+"/sale");
			}
		});
		
		xlist.push(function(){
			for(var i = 0; i < xvar.main.xcId.length; i++){	
				xvar.play.policy = [];
				for(var j = 0; j < xvar.policyGet[i].policy.length; j++){
					xvar.play.policy.push("To any costumer");
				}
				xcPost("policyPost", xvar.policyGet[i], [["policy", xvar.play.policy]], "save");
			}
		});
		
		xcList();
	}
});
XSCL.push({
	row: "Policy",
	name: "To My Company",
	description: "The policies for all goods of the selected subdivisions will be set to &quot;Only to my company&quot;. Works for production buildings and warehouses.",	
	code: function(){
		
		xcMain(["animalfarm", "farm", "fishingbase", "mill", "mine", "oil_power", "oilpump", "orchard", "sawmill", "warehouse", "workshop"]);
		
		xlist.push(function(){
			for(var i = 0; i < xvar.main.xcId.length; i++){
				xcGet("policyGet", xvar.realm+"/main/unit/view/"+xvar.main.xcId[i]+"/sale");
			}
		});
		
		xlist.push(function(){
			for(var i = 0; i < xvar.main.xcId.length; i++){	
				xvar.play.policy = [];
				for(var j = 0; j < xvar.policyGet[i].policy.length; j++){
					xvar.play.policy.push("Only to my company");
				}
				xcPost("policyPost", xvar.policyGet[i], [["policy", xvar.play.policy]], "save");
			}
		});
		
		xcList();
	}
});
XSCL.push({
	row: "Policy",
	name: "To Corporation",
	description: "The policies for all goods of the selected subdivisions will be set to &quot;Only to members of the corporation&quot;. Works for production buildings and warehouses.",	
	code: function(){
		
		xcMain(["animalfarm", "farm", "fishingbase", "mill", "mine", "oil_power", "oilpump", "orchard", "sawmill", "warehouse", "workshop"]);
		
		xlist.push(function(){
			for(var i = 0; i < xvar.main.xcId.length; i++){
				xcGet("policyGet", xvar.realm+"/main/unit/view/"+xvar.main.xcId[i]+"/sale");
			}
		});
		
		xlist.push(function(){
			for(var i = 0; i < xvar.main.xcId.length; i++){	
				xvar.play.policy = [];
				for(var j = 0; j < xvar.policyGet[i].policy.length; j++){
					xvar.play.policy.push("Only to members of the corporation");
				}
				xcPost("policyPost", xvar.policyGet[i], [["policy", xvar.play.policy]], "save");
			}
		});
		
		xcList();
	}
});

//Retail
XSCL.push({
	row: "Retail",
	name: "Price Empty Stock",
	description: "For all selected stores: increase the price by 3% in case the stock was sold out, and decrease the price by 3% if there are goods left from yesterday. Exception for when there was nothing in stock (sales equals zero): in that case the price doesn&quot;t change.",	
	code: function(){
		
		xcMain(["fuel", "shop"]);
		
		xlist.push(function(){
			for(var i = 0; i < xvar.main.xcId.length; i++){
				xcGet("tradeGet", xvar.realm+"/main/unit/view/"+xvar.main.xcId[i]+"/trading_hall");
			}			
		});		

		xlist.push(function(){
			for(var i = 0; i < xvar.main.xcId.length; i++){
				xvar.play.price = [];
				if(xvar.tradeGet[i].priceSale){
					for(var j = 0; j < xvar.tradeGet[i].priceSale.length; j++){					
						if(xvar.tradeGet[i].delivered[j] === xvar.tradeGet[i].stock[j] && xvar.tradeGet[i].sales[j]){
							xvar.play.price.push(xvar.tradeGet[i].priceSale[j] * 1.03);
						}
						else if(xvar.tradeGet[i].delivered[j] === xvar.tradeGet[i].stock[j]){
							xvar.play.price.push(xvar.tradeGet[i].priceSale[j]);
						}
						else{
							xvar.play.price.push(xvar.tradeGet[i].priceSale[j] * 0.97);
						}
					}
					xcPost("tradePost", xvar.tradeGet[i], [["priceSale", xvar.play.price]], "setprice");
				}
				else{
					console.log("This subdivision has no products in its trade hall: "+xvar.main.xcId[0]);
				}
			}							
		});
		
		xcList();
	}
});

//Service
XSCL.push({
	row: "Service",
	name: "Full Service",
	description: "For all selected restaurants, hospitals and autorepair: increase the price by 3% when the amount of visitors is higher than 97% of the maximum amount of visitors, and decrease the price by 3% when lower than 97%. Also sets the supply aiming for the stock to equal the required.",	
	code: function(){
		 		
		xcMain(["medicine", "repair", "restaurant"]);		
				
		xlist.push(function(){
			for(var i = 0; i < xvar.main.xcId.length; i++){
				xcGet("mainGet", xvar.realm+"/main/unit/view/"+xvar.main.xcId[i]);
				xcGet("supplyGet", xvar.realm+"/main/unit/view/"+xvar.main.xcId[i]+"/supply");
			}			
		});		

		xlist.push(function(){
			for(var i = 0; i < xvar.main.xcId.length; i++){	
				if(xvar.supplyGet[i].parcel){
					if(xvar.mainGet[i].visitorsNum[0] > xvar.mainGet[i].visitorsMax[0] * 0.97){
						xvar.play.price = [ xvar.mainGet[i].priceOld[0] * 1.03 ];
					}
					else{
						xvar.play.price = [ xvar.mainGet[i].priceOld[0] * 0.97 ];
					}							
					
					xvar.play.supply = [];
					for(var j = 0; j < xvar.supplyGet[i].parcel.length; j++){
						xvar.play.required = xvar.supplyGet[i].required[j] * xvar.mainGet[i].visitorsMax[0];
						xvar.play.supply.push( 2 * xvar.play.required - xvar.supplyGet[i].stock[j] 
						- Math.max(xvar.play.required - xvar.supplyGet[i].stock[j] , 0));
					}			
				
					xcPost("mainPost", xvar.mainGet[i], [["priceNew", xvar.play.price]], "setprice");
					xcPost("supplyPost", xvar.supplyGet[i], [["parcel", xvar.play.supply]], "edit");
				}
				else{
					console.log("This subdivision has no suppliers: "+xvar.main.xcId[0]);
				}
			}							
		});
		
		xcList();
	}
});

//Lab
XSCL.push({
	row: "Lab",
	name: "Step 2 Selector",
	description: "Selects the best possible hypothese in the selected labs on the main page, if the lab is in step 2. ",
	code: function(){
		
		xcMain(["lab"]);
		
		xlist.push(function(){
			for(var i = 0; i < xvar.main.xcId.length; i++){
				xcGet("invGet", xvar.realm+"/main/unit/view/"+xvar.main.xcId[i]+"/investigation");
			}
		});
		
		xlist.push(function(){
			for(var i = 0; i < xvar.main.xcId.length; i++){
				if(xvar.invGet[i].refTime){
					xvar.play.time = [];
					xvar.play.radio = [];
					xvar.play.fastest = 0;
					for(var j = 0; j < xvar.invGet[i].refTime.length; j++){
						//p=starting possibility between 0 and 1
						//k=reference time
						//i=1=the amount of percentage points the chance increases each fail (always 1)
						var calcProduct = function(i,p,n){
							var value=1;
							for(var m=1; m<= n-1; m++){ value = value*(1-(1/100*i*(m-1)+p)); }
							return value;
						}
						var calcStudyTime = function(p,k,i){
							var value=0;
							for(var n=1;n<=(100*(1-p)/i);n++){
								value += n*(1/100*i*(n-1)+p)*calcProduct(i,p,n);
							}
							return k*value;
						}
						xvar.play.time.push( calcStudyTime(xvar.invGet[i].chance[j]/100, xvar.invGet[i].refTime[j], 1) );
						if(xvar.play.time[j] < xvar.play.time[xvar.play.fastest]){
							xvar.play.fastest = j;
						}
						xvar.play.radio.push( false );

					}			

					xvar.play.radio[xvar.play.fastest] = true;
					console.log(xvar.play.time);
					xcPost("invPost", xvar.invGet[i], [["radio", xvar.play.radio]], "select");
				}				
			}
		});
		
		xcList();
		
	}
});

//Ads
XSCL.push({
	row: "Ads",
	name: "Cancel Ads",
	description: "Cancel the advertisement of the selected subdivisions. Works for stores and service sector buildings.",
	code: function(){
		
		xcMain(["fitness", "fuel", "hairdressing", "laundry", "medicine", "repair", "restaurant", "shop"]);

		xlist.push(function(){
			for(var i = 0; i < xvar.main.xcId.length; i++){
				xcGet("adsGet", xvar.realm+"/main/unit/view/"+xvar.main.xcId[i]+"/virtasement");
			}			
		});		

		xlist.push(function(){
			for(var i = 0; i < xvar.main.xcId.length; i++){				
				xcPost("adsPost", xvar.adsGet[i], [], "cancel");
			}							
		});		
		
		xcList();	
	}
});
XSCL.push({
	row: "Ads",
	name: "Required Ads",
	description: "Sets the advertisements expenses of store or a service sector subdivision to the required amount to keep the current popularity. If required expenses are less than the minimum advertisement budget, it will set the expenses to minimum. The medium is always TV.",
	code: function(){
		
		xcMain(["fitness", "fuel", "hairdressing", "laundry", "medicine", "repair", "restaurant", "shop"]);

		xlist.push(function(){
			for(var i = 0; i < xvar.main.xcId.length; i++){
				xcGet("adsGet", xvar.realm+"/main/unit/view/"+xvar.main.xcId[i]+"/virtasement");
			}			
		});		

		xlist.push(function(){
			for(var i = 0; i < xvar.main.xcId.length; i++){	
				xvar.play.media = [false, false, false, false, true];
				xvar.play.price = [xvar.adsGet[i].priceReq[0]];
				xcPost("adsPost", xvar.adsGet[i], [["priceAds", xvar.play.price], ["mediaCheck", xvar.play.media]], "edit");
			}							
		});
		
		
		xcList();	
	}
});
XSCL.push({
	row: "Ads",
	name: "User Ads",
	description: "Sets the advertisements expenses of store or a service sector subdivision to the amount specified by the user with a dialog. If required expenses are less than the minimum advertisement budget, it will set the expenses to minimum. The medium is always TV.",
	code: function(){
		
		xcMain(["fitness", "fuel", "hairdressing", "laundry", "medicine", "repair", "restaurant", "shop"]);

		xlist.push(function(){
			for(var i = 0; i < xvar.main.xcId.length; i++){
				xcGet("adsGet", xvar.realm+"/main/unit/view/"+xvar.main.xcId[i]+"/virtasement");
			}
			xcUser("Fill in the price of advertisement your subdivision has to set for its marketing.", "ads");			
		});		

		xlist.push(function(){
			for(var i = 0; i < xvar.main.xcId.length; i++){	
				xvar.play.media = [false, false, false, false, true];
				xvar.play.price = [xvar.play.ads];
				xcPost("adsPost", xvar.adsGet[i], [["priceAds", xvar.play.price], ["mediaCheck", xvar.play.media]], "edit");
			}							
		});
		
		
		xcList();	
	}
});
XSCL.push({
	row: "Ads",
	name: "Stop Campaign",
	description: "Stops the advertisement campaign of all goods of the target office",
	code: function(){
		
		xcMain(["office"]);
		
		xlist.push(function(){			
			for(var i = 0; i < xvar.main.xcId.length; i++){
				xcGet("adsGet", xvar.realm+"/main/unit/view/"+xvar.main.xcId[i]+"/virtasement");
			}			
		});
		
		xlist.push(function(){			
			for(var i = 0; i < xvar.main.xcId.length; i++){
				xvar.play.checkbox = [];
				for(var j = 0; j < xvar.adsGet[i].checkbox.length; j++){
					xvar.play.checkbox.push(true);
				}
				xcPost("adsPost", xvar.adsGet[i], [["checkbox", xvar.play.checkbox]], "stop");
			}			
		});
		
		xcList();
	}
});
XSCL.push({
	row: "Ads",
	name: "Required Campaign",
	description: "Sets advertisement campaign of all goods of the target office to the required amount to keep all contacts. Ignores minimum amount. The medium is TV, and it targets all region.",
	code: function(){
		
		xcMain(["office"]);
		
		xlist.push(function(){			
			for(var i = 0; i < xvar.main.xcId.length; i++){
				xcGet("adsGet", xvar.realm+"/main/unit/view/"+xvar.main.xcId[i]+"/virtasement");
			}			
		});
		
		xlist.push(function(){			
			for(var i = 0; i < xvar.main.xcId.length; i++){
				for(var j = 0; j < xvar.adsGet[i].productUrl.length; j++){
					xcGet("productGet", xvar.realm+"/main/unit/view/"+xvar.main.xcId[i]+"/virtasement"+xvar.adsGet[i].productUrl[j]);
				}				
			}			
		});
		
		xlist.push(function(){	
			if(xvar.productGet){
				for(var i = 0; i < xvar.productGet.length; i++){
					xvar.play.cityCheck = [true];
					for(var j = 1; j < xvar.productGet[i].cityCheck.length; j++){
						xvar.play.cityCheck.push(true);
					}
					xvar.play.mediaCheck = [false, false, false, false, true];		
					xvar.play.price = [xvar.productGet[i].priceReq[0]];
					xcPost("productPost", xvar.productGet[i], [["cityCheck", xvar.play.cityCheck], ["mediaCheck", xvar.play.mediaCheck], ["priceAds", xvar.play.price]], "edit");
				}	
			}					
		});
		
		xcList();
	}
});

//Repair
XSCL.push({
	row: "Equipment",
	name: "Improve Repair",
	description: "Repairs the equipment of the selected subdivisions. It only repairs the number in black, as the equipment piece of the number in red is not fully broken yet and therefore not cost efficient, although it will repair the part when the wear and tear is above 3% and all black parts are repaired. <br/><br/>The equipment used for reparation will be bought from the world market. It chooses the cheapest one but with a quality higher than the current equipment quality. Beware that this will inevitably increase the quality of the equipment over time, which could lead to problems with the employee qualification.",
	code: function(){
		
		xcMain(["animalfarm", "coal_power", "farm", "fishingbase", "fitness", "fuel", "hairdressing", "incinerator_power", "lab", "laundry", "medicine", "mill", "mine", "office", "oil_power", "oilpump", "orchard", "repair", "restaurant", "sawmill", "workshop"]);
					
		for(var i = 0; i < xvar.main.xcId.length; i++){
			
			(function(i){				
				
				xlist.push(function(){
					xcGet("mainGet", xvar.realm+"/main/unit/view/"+xvar.main.xcId[i]);
					xcGet("eqGet", xvar.realm+"/window/unit/equipment/"+xvar.main.xcId[i]);
				});
				
				xlist.push(function(){
					
					xvar.play.toRepair = xvar.mainGet[i].wearBlack[0] + !!(xvar.mainGet[i].wearPerc[0] > 3 && !xvar.mainGet[i].wearBlack[0]);

					//Until nothing has to be repaired any more
					while(xvar.play.toRepair > 0){
						
						//Pick the cheapest	
						var cheapId = 0;
						var cheapPrice = 1000000000000000;
						var cheapAvail = 0;
						for(var j = 0; j < xvar.eqGet[i].price.length; j++){
							if(xvar.eqGet[i].price[j] < cheapPrice && xvar.eqGet[i].avail[j] > 0 && xvar.eqGet[i].quality[j] > xvar.mainGet[i].equipQual[0]){
								cheapPrice = xvar.eqGet[i].price[j];
								cheapId = xvar.eqGet[i].offer[j];
								cheapAvail = xvar.eqGet[i].avail[j];
							}
						}	

						if(cheapId === 0){
							console.log("No equipment fulfilling the requirements");
							break;
						}
						
						//Less to repair after successfully founding a supplier
						var amount = Math.min(xvar.play.toRepair, cheapAvail);
						xvar.play.toRepair -= amount;				
						
						xcSupplierPost("eqPost", xvar.realm + "/ajax/unit/supply/equipment", {
							'operation'       : "repair",
							'offer'  		  : cheapId,
							'unit'  		  : xvar.main.xcId[i],
							'supplier'		  : cheapId,
							'amount'		  : amount							
						});
					}	
				});				
			})(i);			
		}	

		xcList();
	}
});
XSCL.push({
	row: "Equipment",
	name: "Improve Full Repair",
	description: "Repairs the equipment of the selected subdivisions. It repairs all broken equipment, both black and red. <br/><br/>The equipment used for reparation will be bought from the world market. It chooses the cheapest one but with a quality higher than the current equipment quality. Beware that this will inevitably increase the quality of the equipment over time, which could lead to problems with the employee qualification.",
	code: function(){
		
		xcMain(["animalfarm", "coal_power", "farm", "fishingbase", "fitness", "fuel", "hairdressing", "incinerator_power", "lab", "laundry", "medicine", "mill", "mine", "office", "oil_power", "oilpump", "orchard", "repair", "restaurant", "sawmill", "workshop"]);
					
		for(var i = 0; i < xvar.main.xcId.length; i++){
			
			(function(i){				
				
				xlist.push(function(){
					xcGet("mainGet", xvar.realm+"/main/unit/view/"+xvar.main.xcId[i]);
					xcGet("eqGet", xvar.realm+"/window/unit/equipment/"+xvar.main.xcId[i]);
				});
				
				xlist.push(function(){
					
					xvar.play.toRepair = xvar.mainGet[i].wearBlack[0] + xvar.mainGet[i].wearRed[0];

					//Until nothing has to be repaired any more
					while(xvar.play.toRepair > 0){
						
						//Pick the cheapest	
						var cheapId = 0;
						var cheapPrice = 1000000000000000;
						var cheapAvail = 0;
						for(var j = 0; j < xvar.eqGet[i].price.length; j++){
							if(xvar.eqGet[i].price[j] < cheapPrice && xvar.eqGet[i].avail[j] > 0 && xvar.eqGet[i].quality[j] > xvar.mainGet[i].equipQual[0]){
								cheapPrice = xvar.eqGet[i].price[j];
								cheapId = xvar.eqGet[i].offer[j];
								cheapAvail = xvar.eqGet[i].avail[j];
							}
						}	

						if(cheapId === 0){
							console.log("No equipment fulfilling the requirements");
							break;
						}
						
						//Less to repair after successfully founding a supplier
						var amount = Math.min(xvar.play.toRepair, cheapAvail);
						xvar.play.toRepair -= amount;				
						
						xcSupplierPost("eqPost", xvar.realm + "/ajax/unit/supply/equipment", {
							'operation'       : "repair",
							'offer'  		  : cheapId,
							'unit'  		  : xvar.main.xcId[i],
							'supplier'		  : cheapId,
							'amount'		  : amount							
						});
					}	
				});				
			})(i);			
		}	

		xcList();
	}
});
XSCL.push({
	row: "Equipment",
	name: "Required Repair",
	description: "Repairs the equipment of the selected subdivisions. It only repairs the number in black, as the equipment piece of the number in red is not fully broken yet and therefore not cost efficient, although it will repair the part when the wear and tear is above 3% and all black parts are repaired. <br/><br/>The equipment used for reparation will be bought from the world market. It chooses the cheapest one but with a quality higher than the required equipment quality. This function only works for production buildings, as only they have a required equipment quality.",
	code: function(){
		
		xcMain(["animalfarm", "coal_power", "farm", "fishingbase", "hairdressing", "incinerator_power", "mill", "mine", "oil_power", "oilpump", "orchard", "sawmill", "workshop"]);
					
		for(var i = 0; i < xvar.main.xcId.length; i++){
			
			(function(i){				
				
				xlist.push(function(){
					xcGet("mainGet", xvar.realm+"/main/unit/view/"+xvar.main.xcId[i]);
					xcGet("eqGet", xvar.realm+"/window/unit/equipment/"+xvar.main.xcId[i]);
				});
				
				xlist.push(function(){
					
					xvar.play.toRepair = xvar.mainGet[i].wearBlack[0] + !!(xvar.mainGet[i].wearPerc[0] > 3 && !xvar.mainGet[i].wearBlack[0]);

					//Until nothing has to be repaired any more
					while(xvar.play.toRepair > 0){
						
						//Pick the cheapest	
						var cheapId = 0;
						var cheapPrice = 1000000000000000;
						var cheapAvail = 0;
						for(var j = 0; j < xvar.eqGet[i].price.length; j++){
							if(xvar.eqGet[i].price[j] < cheapPrice && xvar.eqGet[i].avail[j] > 0 && xvar.eqGet[i].quality[j] > xvar.mainGet[i].equipReq[0]){
								cheapPrice = xvar.eqGet[i].price[j];
								cheapId = xvar.eqGet[i].offer[j];
								cheapAvail = xvar.eqGet[i].avail[j];
							}
						}	

						if(cheapId === 0){
							console.log("No equipment fulfilling the requirements");
							break;
						}
						
						//Less to repair after successfully founding a supplier
						var amount = Math.min(xvar.play.toRepair, cheapAvail);
						xvar.play.toRepair -= amount;				
						
						xcSupplierPost("eqPost", xvar.realm + "/ajax/unit/supply/equipment", {
							'operation'       : "repair",
							'offer'  		  : cheapId,
							'unit'  		  : xvar.main.xcId[i],
							'supplier'		  : cheapId,
							'amount'		  : amount							
						});
					}	
				});				
			})(i);			
		}	

		xcList();
	}
});
XSCL.push({
	row: "Equipment",
	name: "Required Full Repair",
	description: "Repairs the equipment of the selected subdivisions. It repairs all broken equipment, both black and red. <br/><br/>The equipment used for reparation will be bought from the world market. It chooses the cheapest one but with a quality higher than the required equipment quality. This function only works for production buildings, as only they have a required equipment quality.",
	code: function(){
		
		xcMain(["animalfarm", "coal_power", "farm", "fishingbase", "hairdressing", "incinerator_power", "mill", "mine", "oil_power", "oilpump", "orchard", "sawmill", "workshop"]);
					
		for(var i = 0; i < xvar.main.xcId.length; i++){
			
			(function(i){				
				
				xlist.push(function(){
					xcGet("mainGet", xvar.realm+"/main/unit/view/"+xvar.main.xcId[i]);
					xcGet("eqGet", xvar.realm+"/window/unit/equipment/"+xvar.main.xcId[i]);
				});
				
				xlist.push(function(){
					
					xvar.play.toRepair = xvar.mainGet[i].wearBlack[0] + xvar.mainGet[i].wearRed[0];

					//Until nothing has to be repaired any more
					while(xvar.play.toRepair > 0){
						
						//Pick the cheapest	
						var cheapId = 0;
						var cheapPrice = 1000000000000000;
						var cheapAvail = 0;
						for(var j = 0; j < xvar.eqGet[i].price.length; j++){
							if(xvar.eqGet[i].price[j] < cheapPrice && xvar.eqGet[i].avail[j] > 0 && xvar.eqGet[i].quality[j] > xvar.mainGet[i].equipReq[0]){
								cheapPrice = xvar.eqGet[i].price[j];
								cheapId = xvar.eqGet[i].offer[j];
								cheapAvail = xvar.eqGet[i].avail[j];
							}
						}	

						if(cheapId === 0){
							console.log("No equipment fulfilling the requirements");
							break;
						}
						
						//Less to repair after successfully founding a supplier
						var amount = Math.min(xvar.play.toRepair, cheapAvail);
						xvar.play.toRepair -= amount;				
						
						xcSupplierPost("eqPost", xvar.realm + "/ajax/unit/supply/equipment", {
							'operation'       : "repair",
							'offer'  		  : cheapId,
							'unit'  		  : xvar.main.xcId[i],
							'supplier'		  : cheapId,
							'amount'		  : amount							
						});
					}	
				});				
			})(i);			
		}	

		xcList();
	}
});

//Employee
XSCL.push({
	row: "Employee",
	name: "Required Salary",
	description: "Sets the salary of the employees of the selected subdivision in such a way that the new qualification of the employees matches their required qualification. 80% of city salary as minimum. 50,000% of city salary maximum.",
	code: function(){
				
		xcMain(["animalfarm", "coal_power", "farm", "fishingbase", "fitness", "fuel", "hairdressing", "incinerator_power", "lab", "laundry", "medicine", "mill", "mine", "office", "oil_power", "oilpump", "orchard", "repair", "restaurant", "sawmill", "shop", "workshop"]);
		
		xlist.push(function(){
			for(var i = 0; i < xvar.main.xcId.length; i++){
				xcGet("salaryGet", xvar.realm+"/window/unit/employees/engage/"+xvar.main.xcId[i]);
			}
		});
		
		xlist.push(function(){
			for(var i = 0; i < xvar.main.xcId.length; i++){		
				xvar.play.calc = xvar.salaryGet[i].salaryNow[0] > xvar.salaryGet[i].salaryCity[0]? 
					xvar.salaryGet[i].skillNow[0] - xvar.salaryGet[i].skillCity[0] * Math.log( 1 + xvar.salaryGet[i].salaryNow[0] / xvar.salaryGet[i].salaryCity[0] ) / Math.log(2) 
					: Math.pow( xvar.salaryGet[i].salaryCity[0] / xvar.salaryGet[i].salaryNow[0], 2) * xvar.salaryGet[i].skillNow[0] - xvar.salaryGet[i].skillCity[0];
				xvar.play.newSalary = [ xvar.salaryGet[i].skillRequired[0] > ( xvar.play.calc + xvar.salaryGet[i].skillCity[0] )? 
					xvar.salaryGet[i].salaryCity[0] * (Math.pow(2, ( xvar.salaryGet[i].skillRequired[0] - xvar.play.calc ) / xvar.salaryGet[i].skillCity[0] ) - 1) 
					: xvar.salaryGet[i].salaryCity[0] * Math.sqrt( xvar.salaryGet[i].skillRequired[0] / ( xvar.salaryGet[i].skillCity[0] + xvar.play.calc ) ) ];
				xvar.play.newSalary[0] = Math.max(xvar.play.newSalary[0], (xvar.salaryGet[i].salaryCity[0]+.005) * 0.8);
				xvar.play.newSalary[0] = Math.min(xvar.play.newSalary[0], (xvar.salaryGet[i].salaryCity[0]-.005) * 500);
				xcPost("salaryPost", xvar.salaryGet[i], [["salaryNow", xvar.play.newSalary]], "save");
			}
		});	
		
		xcList();
	}
});
XSCL.push({
	row: "Employee",
	name: "User Salary",
	description: "Sets the salary of the employees of the selected subdivision in such a way that the new qualification of the employees matches the qualification specified by the user with a dialog. 80% of city salary as minimum. 50,000% of city salary maximum.",
	code: function(){
				
		xcMain(["animalfarm", "coal_power", "farm", "fishingbase", "fitness", "fuel", "hairdressing", "incinerator_power", "lab", "laundry", "medicine", "mill", "mine", "office", "oil_power", "oilpump", "orchard", "repair", "restaurant", "sawmill", "shop", "workshop"]);
		
		xlist.push(function(){
			for(var i = 0; i < xvar.main.xcId.length; i++){
				xcGet("salaryGet", xvar.realm+"/window/unit/employees/engage/"+xvar.main.xcId[i]);
			}
			xcUser("Set the qualification of your employees", "skill");
		});
		
		xlist.push(function(){
			for(var i = 0; i < xvar.main.xcId.length; i++){						
				xvar.play.calc = xvar.salaryGet[i].salaryNow[0] > xvar.salaryGet[i].salaryCity[0]? xvar.salaryGet[i].skillNow[0] - xvar.salaryGet[i].skillCity[0] * Math.log( 1 + xvar.salaryGet[i].salaryNow[0] / xvar.salaryGet[i].salaryCity[0] ) / Math.log(2) : Math.pow( xvar.salaryGet[i].salaryCity[0] / xvar.salaryGet[i].salaryNow[0], 2) * xvar.salaryGet[i].skillNow[0] - xvar.salaryGet[i].skillCity[0];
				xvar.play.newSalary = [ xvar.play.skill > ( xvar.play.calc + xvar.salaryGet[i].skillCity[0] )? xvar.salaryGet[i].salaryCity[0] * (Math.pow(2, ( xvar.play.skill - xvar.play.calc ) / xvar.salaryGet[i].skillCity[0] ) - 1) : xvar.salaryGet[i].salaryCity[0] * Math.sqrt( xvar.play.skill / ( xvar.salaryGet[i].skillCity[0] + xvar.play.calc ) ) ];
				xvar.play.newSalary[0] = Math.max(xvar.play.newSalary[0], (xvar.salaryGet[i].salaryCity[0]+.005) * 0.8);
				xvar.play.newSalary[0] = Math.min(xvar.play.newSalary[0], (xvar.salaryGet[i].salaryCity[0]-.005) * 500);
				xcPost("salaryPost", xvar.salaryGet[i], [["salaryNow", xvar.play.newSalary]], "save");
			}
		});	
		
		xcList();
	}
});
XSCL.push({
	row: "Employee",
	name: "Top Salary",
	description: "Sets the salary of the employees of the selected subdivision to maximize top1. 80% of city salary as minimum. 50,000% of city salary maximum.",
	code: function(){
				
		xcMain(["animalfarm", "coal_power", "farm", "fishingbase", "fitness", "fuel", "hairdressing", "incinerator_power", "lab", "laundry", "medicine", "mill", "mine", "office", "oil_power", "oilpump", "orchard", "repair", "restaurant", "sawmill", "shop", "workshop"]);
		
		var subType = {
			mine: [8, 1],
			power: [6, 13],
			workshop: [4, 6],
			farm: [1.6, 9],
			orchard: [1.2, 9],				
			medicine: [1, 4],
			fishingbase: [1, 7],				
			animalfarm: [0.6, 2],
			lab: [0.4, 5],
			mill: [0.4, 6],
			restaurant: [0.4, 8],
			shop: [0.4, 11],
			repair: [0.2, 0],
			fuel: [0.2, 0],
			service: [0.12, 10],
			office: [0.08, 12]
		}
		
		xlist.push(function(){
			for(var i = 0; i < xvar.main.xcId.length; i++){
				xcGet("salaryGet", xvar.realm+"/window/unit/employees/engage/"+xvar.main.xcId[i]);
			}
			xcGet("manager", xvar.realm+"/main/user/privat/persondata/knowledge");
		});
		
		xlist.push(function(){
			for(var i = 0; i < xvar.main.xcId.length; i++){	
				xvar.play.skill = Math.floor(-Math.log(xvar.salaryGet[0].number[0]/(35*subType[ xvar.salaryGet[0].img[0] ][0]*Math.pow(xvar.manager[0].qual[subType[ xvar.salaryGet[0].img[0] ][1]], 2)))/Math.log(7/5)*100)/100;
				xvar.play.calc = xvar.salaryGet[i].salaryNow[0] > xvar.salaryGet[i].salaryCity[0]? xvar.salaryGet[i].skillNow[0] - xvar.salaryGet[i].skillCity[0] * Math.log( 1 + xvar.salaryGet[i].salaryNow[0] / xvar.salaryGet[i].salaryCity[0] ) / Math.log(2) : Math.pow( xvar.salaryGet[i].salaryCity[0] / xvar.salaryGet[i].salaryNow[0], 2) * xvar.salaryGet[i].skillNow[0] - xvar.salaryGet[i].skillCity[0];
				xvar.play.newSalary = [ xvar.play.skill > ( xvar.play.calc + xvar.salaryGet[i].skillCity[0] )? xvar.salaryGet[i].salaryCity[0] * (Math.pow(2, ( xvar.play.skill - xvar.play.calc ) / xvar.salaryGet[i].skillCity[0] ) - 1) : xvar.salaryGet[i].salaryCity[0] * Math.sqrt( xvar.play.skill / ( xvar.salaryGet[i].skillCity[0] + xvar.play.calc ) ) ];
				xvar.play.newSalary[0] = Math.max(xvar.play.newSalary[0], (xvar.salaryGet[i].salaryCity[0]+.005) * 0.8);
				xvar.play.newSalary[0] = Math.min(xvar.play.newSalary[0], (xvar.salaryGet[i].salaryCity[0]-.005) * 500);
				xcPost("salaryPost", xvar.salaryGet[i], [["salaryNow", xvar.play.newSalary]], "save");
			}
		});	
		
		xcList();
	}
});
XSCL.push({
	row: "Employee",
	name: "Bonus Salary",
	description: "Sets the salary of the employees of the selected subdivision to maximize top1 + bonus. 80% of city salary as minimum. 50,000% of city salary maximum.",
	code: function(){
				
		xcMain(["animalfarm", "coal_power", "farm", "fishingbase", "fitness", "fuel", "hairdressing", "incinerator_power", "lab", "laundry", "medicine", "mill", "mine", "office", "oil_power", "oilpump", "orchard", "repair", "restaurant", "sawmill", "shop", "workshop"]);
		
		var subType = {
			mine: [8, 1],
			power: [6, 13],
			workshop: [4, 6],
			farm: [1.6, 9],
			orchard: [1.2, 9],				
			medicine: [1, 4],
			fishingbase: [1, 7],				
			animalfarm: [0.6, 2],
			lab: [0.4, 5],
			mill: [0.4, 6],
			restaurant: [0.4, 8],
			shop: [0.4, 11],
			repair: [0.2, 0],
			fuel: [0.2, 0],
			service: [0.12, 10],
			office: [0.08, 12]
		}
		
		xlist.push(function(){
			for(var i = 0; i < xvar.main.xcId.length; i++){
				xcGet("salaryGet", xvar.realm+"/window/unit/employees/engage/"+xvar.main.xcId[i]);
			}
			xcGet("manager", xvar.realm+"/main/user/privat/persondata/knowledge");
		});
		
		xlist.push(function(){
			for(var i = 0; i < xvar.main.xcId.length; i++){	
				xvar.play.skill = Math.floor(-Math.log(xvar.salaryGet[0].number[0]/(35*subType[xvar.salaryGet[0].img[0]][0]*Math.pow(xvar.manager[0].qual[subType[xvar.salaryGet[0].img[0]][1]]+xvar.manager[0].bonus[subType[xvar.salaryGet[0].img[0]][1]],2)))/Math.log(7/5)*100)/100;
				xvar.play.calc = xvar.salaryGet[i].salaryNow[0] > xvar.salaryGet[i].salaryCity[0]? xvar.salaryGet[i].skillNow[0] - xvar.salaryGet[i].skillCity[0] * Math.log( 1 + xvar.salaryGet[i].salaryNow[0] / xvar.salaryGet[i].salaryCity[0] ) / Math.log(2) : Math.pow( xvar.salaryGet[i].salaryCity[0] / xvar.salaryGet[i].salaryNow[0], 2) * xvar.salaryGet[i].skillNow[0] - xvar.salaryGet[i].skillCity[0];
				xvar.play.newSalary = [ xvar.play.skill > ( xvar.play.calc + xvar.salaryGet[i].skillCity[0] )? xvar.salaryGet[i].salaryCity[0] * (Math.pow(2, ( xvar.play.skill - xvar.play.calc ) / xvar.salaryGet[i].skillCity[0] ) - 1) : xvar.salaryGet[i].salaryCity[0] * Math.sqrt( xvar.play.skill / ( xvar.salaryGet[i].skillCity[0] + xvar.play.calc ) ) ];
				xvar.play.newSalary[0] = Math.max(xvar.play.newSalary[0], (xvar.salaryGet[i].salaryCity[0]+.005) * 0.8);
				xvar.play.newSalary[0] = Math.min(xvar.play.newSalary[0], (xvar.salaryGet[i].salaryCity[0]-.005) * 500);
				xcPost("salaryPost", xvar.salaryGet[i], [["salaryNow", xvar.play.newSalary]], "save");
			}
		});	
		
		xcList();
	}
});
XSCL.push({
	row: "Employee",
	name: "Full Training",
	description: "Give the selected subdivisions a full training schedule of 4 weeks.",
	code: function(){
		
		xcMain(["animalfarm", "coal_power", "farm", "fishingbase", "fitness", "fuel", "hairdressing", "incinerator_power", "lab", "laundry", "medicine", "mill", "mine", "office", "oil_power", "oilpump", "orchard", "repair", "restaurant", "sawmill", "shop", "workshop"]);
		
		xlist.push(function(){
			for(var i = 0; i < xvar.main.xcId.length; i++){
				xcGet("trainGet", xvar.realm+"/window/unit/employees/education/"+xvar.main.xcId[i]);
			}
		});
		
		xlist.push(function(){
			for(var i = 0; i < xvar.main.xcId.length; i++){					
				xcPost("trainPost", xvar.trainGet[i], [["duration", [4]]], "train");
			}
		});	
		
		xcList();
	}
});
XSCL.push({
	row: "Employee",
	name: "Holiday On",
	description: "The employees of the selected subdivision will go on holiday.",
	code: function(){
				
		xcMain(["animalfarm", "coal_power", "farm", "fishingbase", "fitness", "fuel", "hairdressing", "incinerator_power", "lab", "laundry", "medicine", "mill", "mine", "office", "oil_power", "oilpump", "orchard", "repair", "restaurant", "sawmill", "shop", "workshop"]);
		
		xlist.push(function(){		
			for(var i = 0; i < xvar.main.xcId.length; i++){
				xcGet("holidayOn", xvar.realm+"/main/unit/view/"+xvar.main.xcId[i]+"/holiday_set");
			}
		});
		
		xcList();
		
	}
});
XSCL.push({
	row: "Employee",
	name: "Holiday Off",
	description: "The employees of the selected subdivision will return from holiday.",
	code: function(){
				
		xcMain(["animalfarm", "coal_power", "farm", "fishingbase", "fitness", "fuel", "hairdressing", "incinerator_power", "lab", "laundry", "medicine", "mill", "mine", "office", "oil_power", "oilpump", "orchard", "repair", "restaurant", "sawmill", "shop", "workshop"]);
			
		xlist.push(function(){		
			for(var i = 0; i < xvar.main.xcId.length; i++){
				xcGet("holidayOff", xvar.realm+"/main/unit/view/"+xvar.main.xcId[i]+"/holiday_unset");
			}
		});
		
		xcList();
		
	}
});

//Miscellaneous
XSCL.push({
	row: "Miscellaneous",
	name: "Subdivision Name Changer",
	description: "Change the name of a subdivision. Uses the selected subdivisions on the main page. A dialog is prompted where you will have to fill in the new name.",		
	code: function(){
		
		xcMain(["animalfarm", "coal_power", "farm", "fishingbase", "fitness", "fuel", "hairdressing", "incinerator_power", "lab", "laundry", "medicine", "mill", "mine", "office", "oil_power", "oilpump", "orchard", "repair", "restaurant", "sawmill", "shop", "villa", "warehouse", "workshop"]);
		
		xlist.push(function(){
			for(var i = 0; i < xvar.main.xcId.length; i++){
				xcGet("ncwGet", xvar.realm+"/window/unit/changename/"+xvar.main.xcId[i]);			
			}	
			xcUser("Give your subdivisions a new name!", "name")
		});			
		
		xlist.push(function(){
			for(var i = 0; i < xvar.main.xcId.length; i++){	
				xvar.play.name = [xvar.play.name || xvar.ncwGet[i].intName];
				xcPost("ncwPost", xvar.ncwGet[i], [["intName", xvar.play.name]], "save");
			}
		});
		
		xcList();
	}
});
XSCL.push({
	row: "Miscellaneous",
	name: "Delete Subdivision",
	description: "Deletes the selected subdivisions. No-one will know it was there. Asks for confirmation before actually closing your subdivision. Disabled for state-enterprises.",
	code: function(){
		
		xcMain(["animalfarm", "coal_power", "fitness", "fuel", "hairdressing", "incinerator_power", "lab", "laundry", "medicine", "mill", "office", "oil_power", "repair", "restaurant", "shop", "warehouse", "workshop"]);
		
		xlist.push(function(){
			for(var i = 0; i < xvar.main.xcId.length; i++){
				xcGet("closeGet", xvar.realm+"/window/unit/close/"+xvar.main.xcId[i]);
			}	
			xcUser("Are you sure you want to close these subdivisions? There is no way back. Type 'XIODELETE' (without the quotes) if you want to close the subdivisions", "confirm");
		});
		
		xlist.push(function(){
			if(xvar.play.confirm === "XIODELETE"){
				for(var i = 0; i < xvar.main.xcId.length; i++){				
					xcPost("closePost", xvar.closeGet[i], [], "close");
				}
			}
		});	
		
		xcList();	
	}
});