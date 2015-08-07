console.log("XSML Loaded!");
XSML = [];
XSCL = [];

function XioScript(){
		
	//Bugs and additions (TODO list):
			
	//Select goods remove filter
	//able to add html (TOP stats) --> XioOverview functions?
	//User input
	//Ask for all main pages
	
	//Hello!
	
	//Check and load important XS materials
	if(typeof XSML !== "object"){
		console.log("No XSML!");
		return false;
	}
	
	if(typeof XSCL !== "object"){
		console.log("No XSCL!");
		return false;
	}
	
    function addJQuery(){
        var script = document.createElement("script");
        script.setAttribute("src", '//ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js');
        script.addEventListener('load', function () {
            var script = document.createElement("script");
            script.textContent = "(" + XioScript.toString() + ")();";
            document.head.appendChild(script);
        }, false);
        document.head.appendChild(script);
    }

    function addJQueryUI(){
        var link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "//ajax.googleapis.com/ajax/libs/jqueryui/1.11.0/themes/smoothness/jquery-ui.css";
        document.head.appendChild(link);

        var script = document.createElement("script");
        script.setAttribute("src", '//ajax.googleapis.com/ajax/libs/jqueryui/1.11.0/jquery-ui.min.js');
        script.addEventListener('load', function() {
            var script = document.createElement("script");
            script.textContent = "(" + XioScript.toString() + ")();";
            document.head.appendChild(script);
        }, false);
        document.head.appendChild(script);
    }

    function addCustomStyle(){        
        var style = document.createElement("style");
        style.id = "xioStyle";
        style.type = 'text/css';
        style.innerHTML = ""+
            ".unselectable{ -webkit-touch-callout: none; -webkit-user-select: none; -khtml-user-select: none; -moz-user-select: none;  -ms-user-select: none; user-select: none;}\n"+

            ".ui-selected td { background-color: #FEE068 !important;} \n"+
            ".ui-selecting td { background-color: #FEE88F !important;} \n"+

            ".xfSelected{ border-color: gold }\n"+
            ".xfHide{ display: none; }\n"+
            ".xfTitle{ font-size: 22px; margin-top: 15px; margin-left: 30px; color: gold; }\n"+
            ".xfMinimize{ float: right; text-align: center; color: gold; font-size: 20px; width: 30px; height: 30px; }\n"+
			".xfTdTitle{ color: gold; font-size: 18px; }"+
			".xfButton{ margin-left: 8px; }\n"+
			".xfButtonDisabled {font-style: italic; color:grey; opacity:0.4} \n"+
            "#xfMenu{ border-style:ridge }\n"+
            "#xfMain{ margin-top: 15px; margin-left: 30px; margin-bottom: 20px; }\n"+

            ".mapTooltip { background-color: lightgreen !important }\n"+
            "input.mapTooltip, select.mapTooltip { outline: 4px ridge pink !important ; }\n"+			
			"#mapTable { font-size: 11px; color: #333333; border-width: 1px;  border-color: #36752D;  border-collapse: collapse; margin-bottom: 8px; margin-top: 8px; }\n"+
			"#mapTable th { border-width: 1px;  padding: 8px; border-style: solid; border-color: #275420; background-color: #36752D; color: #ffffff; }\n"+
			"#mapTable tr:nth-child(even) td{      background-color: #DFFFDE; }\n"+
			"#mapTable td { border-width: 1px; padding: 8px; border-style: solid; border-color: #36752D; background-color: #ffffff; } ";

        document.getElementsByTagName("head")[0].appendChild(style);      
    }

    if(!window.jQuery){
        addJQuery();
		console.log("jQuery added");
        return false;
    }	
	
    if(!window.jQuery.ui || !window.jQuery.ui.version){
		jQuery.ui = {};
        addJQueryUI();
		console.log("jQueryUI added");
        return false;
    }

    addCustomStyle();
	
	
    console.log("XioScript is running!");

    //Usefull stuff        
    function numberfy(variable){
        return parseFloat(String(variable).replace(/[\s\$\%]/g, "")) || 0;
    }

    function spaces(value){
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    }
    
    //Top1 and Top3      
    function subdType(){
        var link = $("#unitImage").find($("img")).attr('src');

        var n = link.indexOf('animalfarm');
        if (n > 0) return "farm";

        n = link.indexOf('orchard');
        if (n > 0) return "plantation";

        n = link.indexOf('restaurant');
        if (n > 0) return "restaurant";

        n = link.indexOf('service_light');
        if (n > 0) return "service";

        n = link.indexOf('medicine');
        if (n > 0) return "medical";

        n = link.indexOf('fishingbase');
        if (n > 0) return "fishing";

        n = link.indexOf('lab');
        if (n > 0) return "laboratory";

        n = link.indexOf('workshop');
        if (n > 0) return "factory";

        n = link.indexOf('shop');
        if (n > 0) return "shop";

        n = link.indexOf('office');
        if (n > 0) return "office";

        n = link.indexOf('mill');
        if (n > 0) return "mill";

        n = link.indexOf('mine');
        if (n > 0) return "mine";

        n = link.indexOf('farm');
        if (n > 0) return "agriculture";

        n = link.indexOf('power');
        if (n > 0) return "power";

        return "unknow";
    }

    function subdFactor(){
        var factor = 0;
        var mill = false;
        switch(subdType()){
            case "mine":
                factor = 8;
                break;
            case "power":
                factor = 6;
                break;
            case "factory":
                factor = 4;
                break;
            case "agriculture":  //fall-trough
                factor = 1.6;
                break;
            case "plantation":
                factor = 1.2;
                break;
            case "medical":  //fall-trough
            case "fishing":
                factor = 1;
                break;
            case "farm":
                factor = 0.6;
                break;
            case "restaurant": //fall-trough
            case "shop":
            case "laboratory":
                factor = 0.4;
                break;
            case "mill":                
                factor = 0.4;
                mill = true;
                break;
            case "service":
                factor = 0.12;
                break;
            case "office":
                factor = 0.08;
                break;            
        }   
        return [factor, mill];
    }

    function calcTop1(empl, qual, factor){
        return Math.pow(5, 1/2*(-1-qual)) * Math.pow(7, 1/2*(-1+qual)) * Math.sqrt(empl / factor);
    }

    function calcTop3(empl, factor){
        factor = factor * (1 + subdFactor()[1]*9);
        return (-15*factor+Math.sqrt(225*factor*factor + 4*factor*empl))/(10*factor);
    }

    function calcQualification(empl, manager, factor){
        var value = -Math.log(empl/(35*factor*manager*manager))/Math.log(7/5);
        return Math.floor(value*100)/100;
    }

    function calcEmployees(qual, manager, factor){
        var value = Math.pow(5,1+qual) * Math.pow(7, 1-qual) * factor * manager * manager;
        return Math.floor(value);
    }

    function calcMaxEmployees(manager, factor){        
        factor = factor * (1 + subdFactor()[1]*9); //Mills are specials       
        return 25 * factor * manager * (manager + 3);
    }

    function calcMaxTech(manager){
        return Math.floor(Math.pow(manager*156.25, 1/3));
    }

    function calcManagerTech(techLevel){
        return Math.pow(techLevel, 3)/156.25;
    }

    function calcEquipment(qualification){
        return Math.floor(Math.pow(qualification, 1.5)*100)/100;
    }

    function calcEfficiency(employees, allEmployees, manager, factor, qualification, techLevel){
        var effi = [];
        effi[0] = 100;
        effi[1] = manager * calcMaxEmployees(manager, factor) / allEmployees / calcTop1(employees, qualification, factor) * 100;
        effi[2] = manager / calcTop1(employees, qualification, factor) * 6/5 * 100;
        effi[3] = calcMaxEmployees(manager, factor) / allEmployees * 6/5 * 100;
        effi[4] = manager / calcManagerTech(techLevel) * calcMaxEmployees(manager, factor) / allEmployees * 100;
        effi[5] = manager / calcManagerTech(techLevel) * 6/5 * 100;

        console.log(effi);
        return (Math.round(Math.min.apply(null, effi)*10)/10).toFixed(2) + "%";
    }

    function placeText($place, text, value, special){
        if(special){
            $place.html("<span style='color:blue'>"+text+"<input id=customManager value="+value+" style='width:25px'></span><br>"+$place.html());
        }
        else{
            $place.html($place.html()+"<br><span style='color:purple' class='xioTop'><b>"+value+"</b>"+text+"</span>");
        }

    }

    function makeRed($place, value, maxValue){
        if(value > maxValue){
            $place.css("color", "red");
        }
    }

    function seeTops(){

        var $qualRow = $("tr:contains('Qualification of employees'), tr:contains('Qualification of scientists'),"+
                         "tr:contains('Workers qualification')");
        var $levelRow = $("tr:contains('Qualification of player')");
        var $empRow = $("tr:contains('Number of employees'), tr:contains('Number of scientists'),"+
                        "tr:contains('Number of workers')");
        var $totalEmpRow = $("tr:contains('profile qualification')");
        var $techRow = $("tr:contains('Technology level'), tr:contains('Current research')");
        var $equipRow = $("tr:contains('Equipment quality'), tr:contains('Computers quality'),"+
                          "tr:contains('Livestock quality'), tr:contains('Quality of agricultural machines')");
        var $effiRow =  $("tr:contains('Top manager efficiency')");       

        var amount = numberfy($empRow.find("td:eq(1)").text());
        var qual = numberfy($qualRow.find("td:eq(1)").text());
        var level = numberfy($levelRow.find("td:eq(1)").text());
        var factor = subdFactor()[0];
        var totalEmp = numberfy($totalEmpRow.find("td:eq(1)").text());
        var tech = numberfy($techRow.find("td:eq(1)").text());
        var eqQual = numberfy($equipRow.find("td:eq(1)").text());

        var topQual = calcQualification(amount, level, factor);
        var topEmp = spaces(calcEmployees(qual, level, factor));
        var maxEmp = spaces(calcMaxEmployees(level, factor));
        var topTech = calcMaxTech(level);
        var topEqQual = calcEquipment(qual);
        var effi = calcEfficiency(amount, totalEmp, level, factor, qual, tech);
        var top1 = Math.round(calcTop1(amount, qual, factor)*10)/10;
        var top3 = Math.round(calcTop3(totalEmp, factor)*10)/10;

        placeText($empRow.find("td:eq(1)")," (Maximum amount of employees with this employee qualification)", topEmp);       
        placeText($qualRow.find("td:eq(1)")," (Maximum employee qualification with this amount of employees)", topQual);
        placeText($totalEmpRow.find("td:eq(1)")," (Maximum amount of employees in all subdivisions)", maxEmp);
        placeText($techRow.find("td:eq(1)")," (Maximum technology level with this top manager qualification)", topTech);
        placeText($equipRow.find("td:eq(1)")," (Maximum equipment quality with this employee qualification)", topEqQual);
        placeText($effiRow.find("td:eq(1)")," (Expected top manager efficiency with these settings"+(subdFactor()[1]?", <b>but not correct for mills</b>":"")+")", effi);
        placeText($levelRow.find("td:eq(1)")," (Top 1)", top1);
        placeText($levelRow.find("td:eq(1)")," (Top 3)", top3);
        //        placeText($levelRow.find("td:eq(1)"), "Custom Qualification: ", level, true);

        makeRed($empRow.find("td:eq(0)"), amount, topEmp);
        makeRed($qualRow.find("td:eq(0)"), qual, topQual);
        makeRed($totalEmpRow.find("td:eq(0)"), totalEmp, maxEmp);
        makeRed($techRow.find("td:eq(0)"), tech, topTech);
        makeRed($equipRow.find("td:eq(0)"), eqQual, topEqQual);

        //        $("body").delegate("#customManager", "change", function(){
        //           $("span[style*=purple]").each(function(){
        //               this.css("color", "blue");
        //           });
        //        });       
    }

    //Mapping
    function xfShowMap(){		

        var key = xpMap(document.URL, $(document));	

		//Don't show table if the page is not mapped
		if(key === "notMapped"){  
			return false;
		}

        $("[title]").not(".xfButton").removeAttr("title");

        $(document).tooltip();			
        				
        var arrayLength = 0;		
        
		var typeJSON = {
			item : true,
			input : true,
			submit : true,
			form: false
		};				
		
		var html = "<table id=mapTable><tr><th></th>";

		//Show items and inputs tooltips
		//Build table basics for overview				
		for(var j in XSML[key]){

            //regExp is never an item
            if(j === "regExp"){
                continue;
            }

            var path = XSML[key][j].path;
            var curTitle = $(path).attr("title")? $(path).attr("title") + " & ":"";	

            typeJSON.submit = true;		
			
			//Highlight and tooltip
            if(typeJSON[XSML[key][j].type]){			
                $(path).not("[id^=xf]")
					.attr("title", curTitle + j)
					.addClass("mapTooltip");					
            }

			typeJSON.submit = false;

			//Save value for overview
			if(typeJSON[XSML[key][j].type]){				
				html += "<th>"+j+"</th>";
				arrayLength = Math.max(arrayLength, $(path).length);				
			}			
        }			
		
		html += "</tr>";
		
		for(var i = 0; i < arrayLength; i++){
			
			html += "<tr>";
			html += "<td>["+i+"]</td>";
			
			for(var j in XSML[key]){
				
				if(j !== "regExp" && typeJSON[XSML[key][j].type]){
					
					if($(XSML[key][j].path).length > i){
						html += "<td>"+XSML[key][j].mod( $(XSML[key][j].path).eq(i) )+"</td>";
					}
					else{
						html += "<td></td>";
					}
					
				}			
				
			}
			
			html += "</tr>";
			
		}
		
		html += "</table>";
		
		$("#topblock, #headerWithSeparator").append(html);

		//Switch buttons
        $("#xfShowMap").addClass("xfHide");
        $("#xfHideMap").removeClass("xfHide");		

    }

    function xfHideMap(){

        //remove map name en map table
        $("#mapName, #mapTable").remove();		

        //remove items and inputs tooltips
        $(".mapTooltip")
        .css("background-color", "")
        .removeAttr("title")
        .removeClass("mapTooltip");		

        //Switch buttons
        $("#xfHideMap").addClass("xfHide");
        $("#xfShowMap").removeClass("xfHide");		
    }
	
	function MapButton(){
		var menuHTML = ''+
			'<button id="xfShowMap">Show Map</button>'+
			'<button id="xfHideMap" class="xfHide">Hide Map</button>';       
		
		//Main pages
		if($("#topblock").length){
			$("#topblock").append(menuHTML);
		}		
		//Windows
		else{
			$("#headerWithSeparator").append(menuHTML);
			$("#headerWithSeparator").next().css("margin-top", "30px");
			$("body").css("padding-top", 0)
			$("#headerWithSeparator").css({"position" : "static", "height" : "initial"});
		}		

		$("#xfShowMap").click(function(){ xfShowMap(); });
		$("#xfHideMap").click(function(){ xfHideMap(); });
	}
	
	//XioCode functions
	function xcMain(typeArray, filter){
								
		xvar.main = {};
		xvar.main.document = $(document);				
		
		//Extract data based on map						
		for(var i in XSML["mainList"]){
			if(i !== "regExp"){
				xvar.main[i] = xpValue(xvar.main.document, "mainList", i);	
			}
		}
		
		//Make a new id list with only subdivisions matching the right type
		xvar.main.xcId = [];
		for(var i = 0; i < xvar.main.yelId.length; i++){
			if( typeArray.indexOf( xvar.main.yelType[i] ) >= 0 && ( !filter || filter( xvar.main.yelName[i] ) ) ){
				xvar.main.xcId.push( xvar.main.yelId[i] );
			}
		}	
	}
	
	function xcGet(name, url){
		
		xcount++;	
		
		//save the p!
		xvar[name] = xvar[name] || [];
		var p = xvar[name].length;
		xvar[name][p] = {};
				
		$.ajax({
			url: url,				
			type: "GET",

			success: function(html, status, xhr){				
				
				//Prepare the xvar for saving data				
				var $html = $(html.replace("body", "bodya"));
				xvar[name][p].doc = $html;
				xvar[name][p].url = url;
				
				var map = xpMap(url, $html);
				
				//Extract data based on map						
				for(var i in XSML[map]){	
					if(i !== "regExp" && (XSML[map][i].type === "item" || XSML[map][i].type === "input")){						
						xvar[name][p][i] = xpValue(xvar[name][p].doc, map, i);	
					}
				}						
				
				//Rounding up the xcGet function
				console.log(name+" has finished!");
				xcount--;	
				if(xcount === 0 && xport === true){
					xcList();
				}				

			},

			error: function(){
				//Resend ajax
				setTimeout(function(){
					$.ajax(this);
				}, 3000);
			}
		});				
			
	}
	
	function xcPost(name, get, inputs, save){
		
		xcount++;	
		
		var map = xpMap(get.url, get.doc);
		
		//Filling in the doc
		for(var i = 0; i < inputs.length; i++){
			var inputName = XSML[map][inputs[i][0]];
			if(inputName && inputName.edit){
				var objects = get.doc.find(inputName.path);
				for(var j = 0; j < objects.length; j++){
					inputName.edit(objects.eq([j]), inputs[i][1][j]);					
				}
			}
		}
		
		//Finding and preparing the form
		var formName = XSML[map][ XSML[map][save].form ];
		var $form = get.doc.find(formName.path);
		$form = formName.mod($form);
		var form = $form.serialize();
		
				
		$.ajax({
			url: get.url,	
			data: form,
			type: "POST",

			success: function(html, status, xhr){
							
				//Rounding up the xcPost function
				console.log(name+" has finished!");
				xcount--;	
				if(xcount === 0 && xport === true){
					xcList();
				}				

			},

			error: function(){
				//Resend ajax
				setTimeout(function(){
					$.ajax(this);
				}, 3000);
			}
		});	
	}
	
	function xcSupplierPost(name, url, data){
		
		xcount++;	
		
		$.ajax({
			url: url,	
			data: data,
			type: "POST",
			dataType: "JSON",

			success: function(html, status, xhr){
							
				//Rounding up the xcPost function
				console.log(name+" has finished!");
				xcount--;	
				if(xcount === 0 && xport === true){
					xcList();
				}				

			},

			error: function(){
				//Resend ajax
				setTimeout(function(){
					$.ajax(this);
				}, 3000);
			}
		});	
		
	}
		
	function xcList(){
		if(!xlist.length){
			$(".xfButton").removeClass("xfButtonDisabled").prop("disabled", false);
			console.log("all done!");
            console.log(xvar);
			return false;
		}
		
		xport = false;
		xlist.shift()();
		xport = true;
		if(xcount === 0){
			xcList();
		}
	}
	
    //XioProcessing functions
	function xpMap(url, doc){
        for(var key in XSML){

            //First, the document url has to match the regExp
            if(new RegExp(XSML[key].regExp).test(url)){

                var allElements = true;

                //Then, all elements have to be available on the page
                for(var j in XSML[key]){

                    //regExp is never an item
                    if(j === "regExp"){
                        continue;
                    }
					
					//mainList escape
					var escape = {
						yelName: true,
						yelType: true,
						yelId: true
					}

                    if(!$(doc).find(XSML[key][j].path).length && !escape[j] ){
                        allElements = false;
                        break;
                    }					
                }	

                if(allElements){
                    break;
                }
            }
        }
		
		return key;
	}
	
	function xpStart(){
		xvar = {
			realm : "/"+readCookie('last_realm'),
			play : {}
		};
		$(".xfButton").addClass("xfButtonDisabled").prop("disabled", true);
	}
	
    function xpValue($context, page, item){
        //Extract a JQuery object from the context, and receive the editFunction from the XSML
        //Use the edit function in the XSML on all elements in the object, if defined, and return their edits in an array
        return $context.find(XSML[page][item].path).map(function(){
            return XSML[page][item].mod($(this));			
        }).get();
    }
    
	//XioFunctions menu	
    function xfButton(){		
		//Build the whole XF button menu
		
		//Build the basics		
        var menuHTML = ''+
            '<button id="xfMenuButton">XioFunctions</button>'+
            '<div id="xfMenu" class="xfHide">'+
				'<span id="xfMin" class="xfMinimize">x</span>'+
				'<div id="xfTitle" class="xfTitle">XioFunctions</div>'+
				'<div id="xfMain" class="unselectable">'+
					'<table id="xfTable"></table>'+
				'</div>'+
            '</div>';		

        $("#topblock").append(menuHTML);
		
		//Build the buttons
		var rows = [];
		for(var i = 0; i < XSCL.length; i++){
			
			//Find/Create row
			var place = rows.indexOf(XSCL[i].row);
			if(place === -1){
				rows.push(XSCL[i].row);
				$("#xfTable").append("<tr><td class='xfTdTitle'>"+XSCL[i].row+"</td><td></td></tr>");
				place = rows.length - 1;
			}
			
			//Create button
			$("#xfTable tr")
				.eq(place)
				.find("td:eq(1)")
				.append("<input type=submit class='xfButton' data="+i+" value='"+XSCL[i].name+"' title='"+XSCL[i].description+"'>")
				.find("input:last")
				.click(function(){
					xpStart(); //Basic needs of preparation
					eval("(" + XSCL[$(this).attr("data")].code + ")()");
				});
			
		}		
		
		$(".xfButton").tooltip({
			content: function() {
				return $(this).attr('title');
			}
		}).click(function(){
			$(this).tooltip("close");
		});	
        $("#xfMin, #xfMenuButton").click(function(){ xfToggleMenu(); });
        
    }
	
	function xfToggleMenu(){
	
		//If the minimize button is pressed, remove the menu interface and 'replace' it with a button.
		//Also works the other way around.

		var $xfMenu = $("#xfMenu");
		var $xfMenuButton = $("#xfMenuButton");
		var list = $('table.unit-list-2014');

		if($xfMenu.hasClass("xfHide")){
			$xfMenu.removeClass("xfHide");
			$xfMenuButton.addClass("xfHide");
			
			//Enables the yellow selecting on the main page.
			list.selectable({
				filter: "tr:not(.unit_comment)",
				tolerance: 'touch',
				cancel: ':input,option,a'
			});
		}
		else{
			$xfMenu.addClass("xfHide");
			$xfMenuButton.removeClass("xfHide");
			list.selectable("destroy");
			$(".ui-selected").removeClass("ui-selected");
		}
	}

    //Global Variables
    var xvar = {}; //saving variables used by XioCode		
    var xlist = []; //saving Ajax calls order list
    var xcount = 0; //counting the Ajax calls
	var xport = false; //block of code is fully executed

    //Load the map button into the topblock    
    MapButton();

    //If we are on the main page, enable the XF menu
    if(new RegExp("\/.*\/main\/company\/view\/[0-9]+\/unit_list$").test(document.URL)){
        xfButton();
    }
	
}