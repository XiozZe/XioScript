/**
 * The Choice object represents the picks made (the values set) for a certain Module or Extension. The type should be "Module" or "Extension", based on what kind of Choice this is. This parameter is not stored in the Choice object to save Storage space, as the type is obvious from context.
 */
function Choice(id, type){

    //The ID here represents the ID of the Module or Extension.
    this.id = id;
    //If a Choice is inactive, it is never fired and the user sees it as greyed out. We can't just deleted inactive choices because that means we forget the set picks if activated again.
    this.active = false;

    this.type = type;

    //The picks object has as keys the optionIds of the procedure, and as values one of the valueIds of the option corresponding to that optionId.
    this.picks = {};

    this.setStandardPicks();
}

/**
 * The type is "Module" or "Extension". Pick the right collection for each.
 */
Choice.prototype.determineCollection = function(){
    if(this.type === "Module")
        return Module;
    else if(this.type === "Extension")
        return Extension;
    else
        console.error(`Tried to determine the collection ${this.type}, but that is not a type supported`);
}

/**
 * Checks if the id exists.
 * Necessary because future version may have different modules.
 */
Choice.prototype.hasRecognizedId = function(){   
    const collection = this.determineCollection();  
    return collection.has(this.id);
}

/**
 * Overwrite current choices to set the standard choices
 */
Choice.prototype.setStandardPicks = function(){    

    const collection = this.determineCollection();
    const procedure = collection.get(this.id);

    this.choices = {};
    for(const option of procedure.options){
        this.picks[option.id] = option.start;
    }
}

/**
 * Checks if every choice given by this Choice is feasible, and that all options of the procedure are present.
 */
Choice.prototype.cleanPicks = function(){

    console.assert(this.hasRecognizedId());

    const collection = this.determineCollection();
    const procedure = collection.get(this.id);

    for(const optionId in this.picks){
        
        //Check if all options are actual options
        if(!procedure.hasOption(optionId)){         
            delete this.picks[optionId];
            continue;
        }

        //Check if the choice picked for the option is a possible value that can be picked
        const valueId = this.picks[optionId];
        if( !procedure.getOption(optionId).hasValue(valueId) ){
            this.picks[optionId] = procedure.options[optionId].start;
        }
    }

    //Check if all possible options are present in Module Choice
    for(const option of procedure.options){
        if(!(option.id in this.picks)){
            this.picks[option.id] = option.start;
        }
    }

}

/**
 * Fills the current Choice with all the information of passed object, to make sure that the new object is an instance of Choice. Type should be "Module" or "Extension"
 */
Choice.createFromObject = (choiceObject, type) => {

    const choice = Object.create(Choice.prototype);
    choice.id = choiceObject.id;
    choice.active = choiceObject.active;
    choice.picks = choiceObject.picks;
    choice.type = type;
    return choice;
}