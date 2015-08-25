XSCL.push({
    row: "Production",
    name: "Required Supply",
    description: "For the selected subdivisions on the main page, set the supply equal to the amount they require.",
    code: function(){

        xcMain(["workshop"]);

        xlist.push(function(){
            for ( var i = 0; i < xvar.main.xcId.length; i++ ){
                xcGet( "supplyGet" , xvar.realm + "/main/unit/view/" + xvar.main.xcId[i] + "/supply" );       
            }
        }


        xlist.push(function(){
            for ( var i = 0; i < xvar.main.xcId.length; i++ ){
                xvar.play.required = [];
                for ( var j = 0 < xvar.supplyGet[i].required.length; j++){
                    xvar.play.required.push( xvar.supplyGet[i].required[j] );
                }
                xcPost( "supplyPost" , xvar.supplyGet[i] , [["parcel", xvar.play.required]], "edit" );       
            }
        }

        xcList();

    }
});