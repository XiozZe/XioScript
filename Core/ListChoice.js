"use strict";
/**
 * Creates a list where we can set the choices to subdivisions
 * @param {String} listType "MainList" or "ManagementList"
 */
function ListChoice(listType){
    this.listType = listType;
}

ListChoice.prototype.createList = async function(){

    switch(this.listType){
        case "MainList":
            this.createMainList();
            break;
        case "ManagementList":
            this.createManagementList();
            break;
        default:
            console.error("Tried to create a ListChoice with unknown listType: ", this.listType);
            return;
    }

    await this.manageChoices();
}

ListChoice.prototype.createMainList = function(){

    //Add th to the header
    this.th= document.createElement("th");
    this.th.style.paddingRight = "5px";
    const positionTh = document.querySelector(".unit-list-2014 th:nth-last-child(2)");
    positionTh.parentElement.insertBefore(this.th, positionTh);

    //Deal with comments
    document.querySelectorAll(".unit_comment .u-n").forEach( commentNode => {
        commentNode.setAttribute("colspan", 8);
    });

    //Add tds to the list and save them together with their subdivision ID and type.
    this.subTds = {};
    const positionTds = document.querySelectorAll("td.spec");
    const idTds = document.getElementsByClassName("unit_id");
    const typeTds = document.getElementsByClassName("info");
    for(let i = 0; i < positionTds.length; i++){
        const td = document.createElement("td");
        const id = idTds[i].innerText;
        const type = typeTds[i].classList[1].substring(2); //Skip the 'info' class and remove the "i-" part
        this.subTds[id] = {
            td,
            id,
            type,
        };
        positionTds[i].parentElement.insertBefore(td, positionTds[i].nextSibling);
    }
}

/**
 * Create a list of the "Management"-page type, meaning that it works on the following pages:
 * Employee, Equipment, Animals
 */
ListChoice.prototype.createManagementList = function(){
        
    //Add th to the header
    document.querySelector("th[colspan='8'], th[colspan='7']").colSpan++;

    this.th= document.createElement("th");
    this.th.rowSpan = "2";
    this.th.style.paddingTop = "7px";
    const positionTh = document.querySelector(".list tr:nth-child(2) th:nth-last-child(2)");
    positionTh.parentElement.insertBefore(this.th, positionTh);

    //Add tds to the list and save them together with their subdivision ID and type.
    this.subTds = {};
    const positionTds = document.extract("td.nowrap:nth-last-child(2)");
    const ids = document.extract("input[type=checkbox]")
                        .filter(e => e.id.substring(0, 5) === "unit_")
                        .map(e => e.id.substring(5));
    const types = document.extract(".u-c").map(e => e.classList[1].substring(2) );
    for(let i = 0; i < positionTds.length; i++){
        const td = document.createElement("td");
        td.style.textAlign = "center";
        this.subTds[ids[i]] = {
            td,
            id : ids[i],
            type : types[i],
        };
        positionTds[i].parentElement.insertBefore(td, positionTds[i]);
    }
}

/**
 * Retrieves the selections from storage and put it in the right td's
 */
ListChoice.prototype.fillChoices = async function(){
    const selections = await Storage.getSelections();
    
    //Remove old
    for(const id in this.subTds){
        this.subTds[id].td.innerText = "";
    }

    //Set new
    for(const selection of selections){
        for(const subdivision of selection.subdivisions){
            if(subdivision.id in this.subTds && subdivision.realm == Vital.getRealm()){
                const subTd = this.subTds[subdivision.id];
                subTd.td.innerText = selection.name;
                subTd.td.style.color = selection.color;
            }
        }
    }

}

/**
 * Extending the Array prototype with the function getNext: given a value, find the value right after it.
 */
Object.defineProperty(Array.prototype, "getNext", {
    enumerable: false,
    configurable: false,
    writable: false,
    value: function(value){

        console.assert(this.includes(value), "Asked for a next value in array that is not in the array!");
    
        const index = this.indexOf(value);
    
        if(index === this.length-1)
            return this[0];
        else 
            return this[index+1];
    
    }
});

ListChoice.prototype.manageChoices = async function(){

    //The selection that is currently being hold by the mouse down press
    let holdSelectionName = null;

    const tdClick = async element => {

        const td = element.target;
        const currentSelectionName = td.innerText;
        const selections = await Storage.getSelections();
        const selectionNames = selections.map(selection => selection.name);
        selectionNames.unshift("");
        
        //If the selection is updated from the Add-on while we loaded the list it can happen
        //that we end up with a selection that 'does not exist anymore' because the name changed
        if(!selectionNames.includes(currentSelectionName)){
            await this.fillChoices();
            return;
        }
        
        const nextSelectionName = selectionNames.getNext(currentSelectionName);        

        //Remove the subdivision from the current selection
        if(currentSelectionName !== ""){
            const currentSelection = selections.find(selection => selection.name === currentSelectionName);
            const currentIndex = currentSelection.subdivisions.findIndex(subd => {
                return subd.id === td.subid && subd.realm == Vital.getRealm();
            });
            currentSelection.subdivisions.splice(currentIndex, 1);
        }
        
        //Adds the subdivision to the new selection
        if(nextSelectionName !== ""){
            const nextSelection = selections.find(selection => selection.name === nextSelectionName);
            const subdivision = new Subdivision(td.subid, Vital.getRealm(), td.subType);
            nextSelection.subdivisions.push(subdivision);
        }
        
        await Storage.saveSelections(selections);
        await this.fillChoices();
    };

    const tdMouseDown = async element => {
        element.preventDefault();

        //If the selection is updated from the Add-on while we loaded the list it can happen
        //that we end up with a selection that 'does not exist anymore' because the name changed
        const td = element.target;
        const selections = await Storage.getSelections();

        if(selections.some(selection => selection.name === td.innerText) || td.innerText === ""){
            holdSelectionName = td.innerText;
        }
        else{            
            await this.fillChoices();
        }        
    }

    const tdMouseOver = async element => {

        if(holdSelectionName === null)
            return

        const td = element.target
        const currentSelectionName = td.innerText      
        const selections = await Storage.getSelections()

        //Remove the subdivision from the current selection
        if(currentSelectionName !== "" && selections.some(selection => selection.name === currentSelectionName)){
            const currentSelection = selections.find(selection => selection.name === currentSelectionName)
            const currentIndex = currentSelection.subdivisions.findIndex(subd => {
                return subd.id === td.subid && subd.realm == Vital.getRealm()
            });
            currentSelection.subdivisions.splice(currentIndex, 1)
        }
        
        //Adds the subdivision to the new selection
        if(holdSelectionName != ""){
            const nextSelection = selections.find(selection => selection.name === holdSelectionName)
            const subdivision = new Subdivision(td.subid, Vital.getRealm(), td.subType)
            nextSelection.subdivisions.push(subdivision)
        }

        await Storage.saveSelections(selections)
        await this.fillChoices()
    }

    const docMouseUp = async () => {
        holdSelectionName = null;
    }


    this.th.innerText = "Choice";

    await this.fillChoices();

    for(const id in this.subTds){ 

        const subTd = this.subTds[id];
        subTd.td.subid = id;
        subTd.td.subType = subTd.type;
        //td.style.fontWeight = "bold";
        subTd.td.addEventListener("click", tdClick);
        subTd.td.addEventListener("mousedown", tdMouseDown,  false);
        subTd.td.addEventListener("mouseover", tdMouseOver);
    };
    document.addEventListener("mouseup", docMouseUp)


}