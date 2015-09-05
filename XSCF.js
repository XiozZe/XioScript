console.log("XSCF Loaded!");
var XSCL = [];
var XSEL = [];
localStorage.XSEL = localStorage.XSEL || "{}";

function XioScript(version){
	//Bugs and ideas (TODO list):
			
	//Select goods remove filter
	//Warehouse distribution manager
		
	//Check for important XS materials
	if(typeof XSML !== "object"){
		console.log("No XSML!", typeof XSML);
		return false;
	}
	
	if(typeof XSCL !== "object"){
		console.log("No XSCL!", typeof XSCL);
		return false;
	}

	//Add styling sheets
	GM_addStyle(GM_getResourceText("jQuiCss"));	
    GM_addStyle(GM_getResourceText("myCss"));	
	
    console.log("XioScript is running!");	
    
	//XioCode functions
	function xcMain(typeArray, filter){
								
		xvar.main = {};
		xvar.main.doc = $(document);
		xvar.main.url = document.URL;		
		
		//Extract data based on map						
		for(var key in XSML["mainList"]){
			if(key !== "regExp"){
				xvar.main[key] = xpValue(xvar.main.doc, "mainList", key);	
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
	
	function xcHere(){
								
		xvar.here = {};
		xvar.here.doc = $(document);
		xvar.here.url = document.URL;
		xvar.here.map = xpMap(xvar.here.url, xvar.here.doc);		
		
		//Extract data based on map						
		for(var key in XSML[xvar.here.map]){
			if(key !== "regExp" && ( XSML[xvar.here.map][key].type === "item" || XSML[xvar.here.map][key].type === "input" ) ) {
				xvar.here[key] = xpValue(xvar.here.doc, xvar.here.map, key);	
			}
		}
		
	}
		
	function xc$(varName){
		if(XSML[xvar.here.map][varName]){
			return $(XSML[xvar.here.map][varName].path);
		}
		else{
			return $();
		}
		
	}
	
	function xcUser(text, varName){
		
		if(xforce){
			return false;
		}		
		
		xcount++;
		
		var html = '<div id="xfDialog" title="xcUser Dialog">'+
					'<p><span>'+text+'</span></p><p><label for=xfInput>'+varName+'</label><input id=xfInput></p>'+
					'</div>';
					
		$("body").append(html);
		
		$("#xfDialog").dialog({
			buttons: {
				"Go": function() {
					var input = $("#xfInput").val();
					xvar.play[varName] = /^\d+$/.test(input)? numberfy(input) : input;					
					$(this).dialog('close').dialog('destroy').remove();
				}
			},
			close: function(){
				if(typeof xvar.play[varName] === "undefined"){
					xforce = true;
				}	
				xcount--;	
				if(xcount === 0 && xport === true || xforce){
					xcList();
				}								
			}
		});
		
	}
	
	function xcGet(name, url){
		
		if(xforce){
			return false;
		}
		
		//save the p!
		xvar[name] = xvar[name] || [];
		var p = xvar[name].length;
		xvar[name][p] = {};
				
		xcount++;		
		
		$.ajax({
			url: url,				
			type: "GET",

			success: function(html, status, xhr){				
				
				if(xforce){
					return false;
				}
				
				//Save data in the xvar			
				var $html = $(html.replace("body", "bodya"));
				xvar[name][p].doc = $html;
				xvar[name][p].url = url;
				
				var map = xpMap(url, $html);
				xvar[name][p].map = map;
				
				//Extract data based on map						
				for(var i in XSML[map]){	
					if(i !== "regExp" && (XSML[map][i].type === "item" || XSML[map][i].type === "input")){						
						xvar[name][p][i] = xpValue(xvar[name][p].doc, map, i);	
					}
				}						
				
				//Rounding up the xcGet function
				console.log(name+" was successful!");
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
		
		if(xforce){
			return false;
		}
		
		var map = xpMap(get.url, get.doc);
		if(map === "notMapped"){
			console.log(name+": notMapped! xcPost cancelled!");
			return false;
		}			
		
		var docHTML = get.doc.clone();
		//Filling in the doc
		for(var i = 0; i < inputs.length; i++){
			var inputName = XSML[map][inputs[i][0]];
			if(inputName && inputName.edit){
				var objects = get.doc.find(inputName.path);
				for(var j = 0; j < objects.length; j++){
					inputName.edit(objects.eq([j]), inputs[i][1][j]);					
				}
			}
			else{
				
			}
		}
		
		if( typeof XSML[map][save] === "undefined" ){
			console.log(name+": Wrong map! xcPost cancelled!");
			return false;
		}
		
		//Finding and preparing the form
		var formName = XSML[map][ XSML[map][save].form ];
		var $form = get.doc.find(formName.path);
		$form = formName.mod($form);
		var form = $form.serialize();
				
		xcount++;
				
		$.ajax({
			url: get.url,	
			data: form,
			type: "POST",

			success: function(html, status, xhr){

				if(xforce){
					return false;
				}			
				
				//Rounding up the xcPost function
				console.log(name+" was successful!");
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
		
		if(xforce){
			return false;
		}
		
		xcount++;	
		
		$.ajax({
			url: url,	
			data: data,
			type: "POST",
			dataType: "JSON",

			success: function(html, status, xhr){
				
				if(xforce){
					return false;
				}
				
				//Rounding up the xcPost function
				console.log(name+" was successful!");
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
		if(!xlist.length || xforce){
			$(".xfButton").removeClass("xfButtonDisabled").prop("disabled", false);
			console.log("all done!");
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
	
	function xpCookie(name){
		var nameEQ = name + "=";
		var ca = document.cookie.split(';');
		for(var i = 0; i < ca.length; i++){
			var c = ca[i];
			while (c.charAt(0) == ' ') c = c.substring(1, c.length);
			if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
		}
		return null;
	}
	
	function xpStart(){
		xcount = 0;
		xport = false;
		xforce = false;
		xlist = [];
		xvar = {
			realm : "/"+xpCookie('last_realm'),
			play : {}
		};
		$(".xfButton").addClass("xfButtonDisabled").prop("disabled", true);
		console.log(xvar);
	}
	
    function xpValue($context, map, item){
        //Extract a JQuery object from the context, and receive the editFunction from the XSML
        //Use the edit function in the XSML on all elements in the object, if defined, and return their edits in an array
        return $context.find(XSML[map][item].path).map(function(){
            return XSML[map][item].mod($(this));			
        }).get();
    }
    
	//XioFunctions menu
	function xfShowMenu(){
		
		$("#xfMenu").removeClass("xfHide");	
		
		$('table.unit-list-2014').selectable({
			filter: "tr:not(.unit_comment)",
			tolerance: 'touch',
			cancel: ':input,option,a'
		});
		
		//Switch buttons
        $("#xfHideMenu").removeClass("xfHide");
        $("#xfShowMenu").addClass("xfHide");	
		
	}
	
	function xfHideMenu(){
		
		$("#xfMenu").addClass("xfHide");	
		
		$('table.unit-list-2014').selectable("destroy");
		$(".ui-selected").removeClass("ui-selected");
		
		//Switch buttons
        $("#xfHideMenu").addClass("xfHide");
        $("#xfShowMenu").removeClass("xfHide");	
		
	}
	
    function MenuButton(){		
		//Build the whole XF button menu
			
		//Build the basics		
        var menuHTML = ''+
            '<button id="xfShowMenu" class="xfButton">Show XF</button>'+
			'<button id="xfHideMenu" class="xfHide xfButton">Hide XF</button>'+
            '<div id="xfMenu" class="xfHide">'+
				'<div id="xfUnderTitle">v'+GM_info.script.version+'</div>'+
				'<div id="xfTitle" class="xfTitle">XioExtensions</div>'+				
				'<div id="xfEx"></div>'+
				'<div id="xfTitle" class="xfTitle">XioFunctions</div>'+
				'<div>'+
					'<table id="xfTable"></table>'+
				'</div>'+
				'<div id="xfTitle" class="xfTitle">XioConsole</div>'+				
				'<div id="xfDebug"></div>'+
            '</div>';		

        $("#topblock").append(menuHTML);		
				
		//Build the toggles
		rows = [];
		var XSELon = JSON.parse(localStorage.XSEL);
		for(var i = 0; i < XSEL.length; i++){						
					
			//Create button
			$("#xfEx")
				.append(
					"<label for='"+XSEL[i].name+"' class='xfLabel' title='"+XSEL[i].description+"'>"+XSEL[i].name+"</label>"+
					"<input type=checkbox id='"+XSEL[i].name+"' class='xfExtension'>"
				)	
			
			//State
			var state = XSELon[XSEL[i].name];
			if(!state){
				$("#xfEx :checkbox:last").attr("checked", true);
			}				
		}	

		//Toggle
		$("#xfEx label").click(function(){
			var data = JSON.parse(localStorage.XSEL);
			data[$(this).attr("for")] = !data[$(this).attr("for")];
			localStorage.XSEL = JSON.stringify(data);
		});		
		
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
					try{
						xpStart(); //Basic needs of preparation
						console.log( XSCL[$(this).attr("data")].name +" is running!");
						eval("(" + XSCL[$(this).attr("data")].code + ")()");	
					}									
					catch(error){
						console.log(error.message);
					}
				});			
		}	
		
		//Enable console log
		if (typeof console  != "undefined") 
			if (typeof console.log != 'undefined')
				console.olog = console.log;
			else
				console.olog = function() {};

		var logger = $('#xfDebug');	
		var time = new Date().getTime();
			
		console.log = function(message) {
			console.olog(message);
			if (typeof message !== 'object') {
				
				var bottom = logger[0].scrollTop + logger[0].offsetHeight === logger[0].scrollHeight;	
				$('#xfDebug').append(Math.floor((new Date().getTime() - time)/1000)+"s : "+message + '<br/>');				
				if(bottom){
					logger[0].scrollTop = logger[0].scrollHeight - logger[0].offsetHeight;
				}
				
			}
		};
		
		console.error = console.debug = console.info =  console.log
		
		
		
		//enable tooltips on buttons		
		$(".xfButton").tooltip({
			content: function() {
				return $(this).attr('title');
			}
		}).click(function(){
			$(this).tooltip("close");
		}).button();

		$(".xfLabel").tooltip({
			content: function() {
				return $(this).attr('title');
			}
		}).click(function(){
			$(this).tooltip("close");
		})
		
		$(".xfExtension").button();
        		
		//switch buttons
		$("#xfShowMenu").click(function(){ xfShowMenu(); });
		$("#xfHideMenu").click(function(){ xfHideMenu(); });
        
    }	
	
    //Global Variables
    var xvar = {}; //saving variables used by XioCode		
    var xlist = []; //saving Ajax calls order list
    var xcount = 0; //counting the Ajax calls
	var xport = false; //block of code is fully executed
	var xforce = false; //force stop

    //If we are on the main page, enable the XF menu
    if(new RegExp("\/.*\/main\/company\/view\/[0-9]+\/unit_list$").test(document.URL)){
        MenuButton();
    }
	
	//For every page, check through the XSEL for functions to execute
	for(var i = 0; i < XSEL.length; i++){
		if(new RegExp(XSEL[i].regex).test(document.URL) && JSON.parse(localStorage.XSEL)[XSEL[i].name]){
			try{
				xpStart(); //Basic needs of preparation
				console.log( XSEL[i].name +" is running!");
				eval("(" + XSEL[i].code + ")()");
				if(xlist.length === 0 && xcount === 0){
					$(".xfButton").removeClass("xfButtonDisabled").prop("disabled", false);
					console.log("all done!");
				}
			}									
			catch(error){
				console.log(error.message);
			}
		}
	}	
}
