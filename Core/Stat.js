function Stat({id, display, format}){
    //ID this stat will be referred to in the module execution. Should be unique within a module.
    this.id = id;
    //What the user sees on the page
    this.display = display
    //Different formats, such as "Plain" and "Dollar".
    this.format = format;
}

Stat.prototype.checkValid = function(){

    console.assert(this.id && this.display, "This stat does not have an id or a display: ", this);
    console.assert(this.format === "Plain" || this.format === "Dollar", "Format of this stat is incorrect: ", this);

}

Stat.prototype.applyFormat = function(value){
    if(this.format === "Plain")
        return value;
    else if(this.format === "Dollar")
        return "$ "+value.toFixed(2);
}