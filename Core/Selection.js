"use strict";
/**
 * A selection represents an collection of choices made by the user for different modules under one name.
 */
function Selection(name){
    this.name = name;
    this.color = "blue";
    this.choices = [];
    this.subdivisions = [];
}

/**
 * Adds a new selection with a generic name that is unique and has no settings
 */
Selection.addGeneric = async () => {

    const selections = await Storage.getSelections();
    let nameIsFree = false;
    let counter = 0;
    let newName = "";
    while(!nameIsFree){
        counter++;
        newName = "yourChoice"+counter;
        if(selections.every(selection => selection.name !== newName))
            nameIsFree = true;
    }

    //Make the Selection and add it to storage
    const newSelection = new Selection(newName);
    newSelection.cleanUp();
    selections.push(newSelection);
    await Storage.saveSelections(selections);
    return selections;
}

/**
 * Change the active value of the selection name given
 */

Selection.changeActive = async (selectionName, moduleId, active) => {
    const selections = await Storage.getSelections();
    const selection = selections.find(selection => selection.name === selectionName);
    for(const choice of selection.choices){
        if(choice.id === moduleId)
            choice.active = active;
    }
    await Storage.saveSelections(selections);
}

/**
 * Change the pick (the value corresponding with an option) of a selection
 */
Selection.changePick = async(selectionName, moduleId, optionId, newValue) => {
    
    const selections = await Storage.getSelections();
    const selection = selections.find(selection => selection.name === selectionName);    
    for(const choice of selection.choices){
        if(choice.id === moduleId){
            const formattedValue = Module.get(moduleId).options.find(option => option.id === optionId).applyFormat(newValue);
            choice.picks[optionId] = formattedValue;
        }                
    }
    await Storage.saveSelections(selections);
}

/**
 * Change the name of a selection. Returns false if the name is not changed because the new name would create a name duplicate.
 */
Selection.changeName = async(oldName, newName) => {
    
    const selections = await Storage.getSelections();
    
    if(selections.some(selection => selection.name === newName)){        
        return false;
    }

    const selection = selections.find(selection => selection.name === oldName);
    selection.name = newName;

    await Storage.saveSelections(selections);

    return true;
}

/**
 * Remove the selection
 */
Selection.removeName = async(selectionName) => {
        
    let selections = await Storage.getSelections();        
    selections = selections.filter(selection => selection.name !== selectionName); 
    await Storage.saveSelections(selections);
}

/**
 * Change the active color of the selection
 */
Selection.changeColor = async (selectionName, color) => {
    const selections = await Storage.getSelections();
    const selection = selections.find(selection => selection.name === selectionName);
    selection.color = color;
    await Storage.saveSelections(selections);
}

/**
 * Add a choice to the selection
 */
Selection.prototype.add = function(newChoice){

    console.assert(newChoice instanceof Choice, "Tried to add a object to selection that is not Choice: ", newChoice);

    //Replace existing
    for(let choice of this.choices){
        if(choice.id == newChoice.id){
            choice = newChoice;
            return;
        }
    }

    //Add new
    this.choices.push(newChoice);
}

/**
 * If being received from the local storage, javascript does not know that selections consists of choices
 * Make sure that it now does.
 */
Selection.createFromObject = function(selectionObject){
    
    const selection = Object.create(Selection.prototype);
    
    selection.name = selectionObject.name;
    selection.color = selectionObject.color;
    selection.choices = [];
    selection.subdivisions = [];

    for(const choice of selectionObject.choices){   
        const newChoice = Choice.createFromObject(choice, "Module");
        selection.choices.push(newChoice);
    }

    for(const subdivision of selectionObject.subdivisions){        
        const newSubdivision = Subdivision.createFromObject(subdivision);
        selection.subdivisions.push(newSubdivision);
    }

    return selection;
}

/**
 * Makes the content of this Selection compatible with the modules of this XS version 
 */
Selection.prototype.cleanUp = function(){

    this.color = this.color || "blue";
    this.choices = this.choices || [];
    this.subdivisions = this.subdivisions || [];

    for(let choice of this.choices){
                
        console.assert(choice instanceof Choice, "choice", choice, "Not an instance of Choice");

        if(!choice.hasRecognizedId()){
            let index = this.choices.indexOf(choice);
            this.choices.splice(index, 1);
            continue;
        }

        if(choice.active == undefined){
            choice.active = false;
        }

        choice.cleanPicks();
    }

    //Check if all modules are present
    for(const module of Module.getAll()){
        if(!this.choices.filter(choice => choice.id === module.id).length){            
            const choice = new Choice(module.id, "Module");
            this.add(choice);
        }
    }
}

Selection.getAllChoices = function(selections){
    const array = [];
    for(const selection of selections){
        array.push(selection.name);
    }
    return array;
}

Selection.prototype.getRealms = function(){
    const array = [];
    for(let subdivision of this.subdivisions){
        array.push(subdivision.realm);
    }
    return [...new Set(array)];
}

Selection.getAllRealms = function(selections){
    const array = [];
    for(const selection of selections){
        array.push(...selection.getRealms());
    }
    return [...new Set(array)];
}

Selection.prototype.getModules = function(){
    const array = [];
    for(let choice of this.choices){
        array.push(choice.id);
    }
    return [...new Set(array)];
}

Selection.getAllModules = function(selections){
    const array = [];
    for(const selection of selections){
        array.push(...selection.getModules());
    }
    return [...new Set(array)];
}

Selection.prototype.getTypes = function(){
    const array = [];
    for(let subdivision of this.subdivisions){
        array.push(subdivision.type);
    }
    return [...new Set(array)];
}

Selection.getAllTypes = function(selections){
    const array = [];
    for(const selection of selections){
        array.push(...selection.getTypes());
    }
    return [...new Set(array)];
}

Selection.prototype.getSubdivisions = function(){
    const array = [];
    for(let subdivision of this.subdivisions){
        array.push(subdivision.id);
    }
    return [...new Set(array)];
}

Selection.getAllSubdivisions = function(selections){
    const array = [];
    for(const selection of selections){
        array.push(...selection.getSubdivisions());
    }
    return [...new Set(array)];
}