XSEL.push({
	name: "Brand Link",
	description: "In the trade hall of a store, it attaches a link to the brand value which leads to the advertising in the office of that specific product, if that product is found.",
	regex: "\/.*\/main\/unit\/view\/[0-9]+\/trading_hall$",
	code: function(){
		
		xcHere();
		
		if(xvar.here.brandStore){
			xlist.push(function(){
				xcGet("officeGet", xvar.realm+"/main/unit/view/"+xvar.here.officeId+"/virtasement");
			});
			xlist.push(function(){				
				xvar.play.productUrl = [];
				for(var i = 0; i < xvar.officeGet[0].productUrl.length; i++){
					xvar.play.productUrl.push(parseFloat(xvar.officeGet[0].productUrl[i].match(/[0-9]+/)));
				}			
				for(var i = 0; i < xvar.here.itemId.length; i++){
					var productIndex = xvar.play.productUrl.indexOf(xvar.here.itemId[i]);
					if(productIndex !== -1){
						var $brandStore = xc$("brandStore").eq(i);
						var html = $brandStore.html();
						var url = xvar.realm+"/main/unit/view/"+xvar.here.officeId+"/virtasement"+xvar.officeGet[0].productUrl[productIndex];
						$brandStore.html("<a href='"+url+"'>"+html+"</a>");
					}
				}				
			});
			xcList();
		}
		else{
			console.log("No goods in the trade hall!");
		}
		
	}
});