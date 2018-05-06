function Option({id, name, type, start, values, format}){
    //Id of the value, is used to refer to it from the inside of the Module execute function, and to save it in the storage
    this.id = id;
    //Name of the value, is used to be shown to the user.
    this.name = name;
    //The type is the input type of the option. It can be "select" if the input type is a dropdown box or "textbox" if it is a regular input text value
    this.type = type;
    //The start value is the value the Option will be initialized with. If the type is "select" it is the ID that should match one of the values from this.values, if the type is "textbox" it should be just a value.
    this.start = start;
    //An array of Value Object. Is only necessary if the type is "select". Will be used to fill the selection box.
    this.values = values;
    //Format of the input if type is "textbox". Must be "Integer" or "Float"
    this.format = format

    this.checkValid();
}

Option.prototype.checkValid = function(){

    const correctID = this.id && this.name;
    console.assert(correctID, "Option Object is not valid: missing ID or Name", this);

    const correctType = this.type === "select" || this.type === "textbox";
    console.assert(correctType, "Option Object is not valid: type should be 'select' or 'textbox'", this);

    if(this.type === "select"){        
        const correctValues = this.values instanceof Array && this.values.reduce((acc, e) => acc && e instanceof Value);
        console.assert(correctValues, "Option Object is not valid: values array is not an array of Values", this);
        
        this.values.forEach(e => e.checkValid());

        const correctStartValue = this.values.find(value => value.id === this.start) !== undefined;
        console.assert(correctStartValue, "Option Object is not valid: starting value not part of values", this);
    }
    else if(this.type === "textbox"){
        console.assert(["Integer", "Float"].includes(this.format), "Option has a non-supported format:", this);
    }
    else{
        console.error("The type of this option is not select or textbox!", this);
    }
}

/**
 * Applies the format of this option on the passed value
 */
Option.prototype.applyFormat = function(value){

    if(this.type === "textbox"){
        if(this.format === "Integer"){
            return parseInt(value);
        }
        else if(this.format === "Float"){
            return parseFloat(value.replace(",", "."));
        }
    }
    else{
        return value;
    }

}

/**
 * Checks if this option has a value with the corresponding ID.
 */
Option.prototype.hasValue = function(valueId){
    if(this.type === "select")
        return !!this.values.find(value => value.id === valueId);
    if(this.type === "textbox")
        return true;
}