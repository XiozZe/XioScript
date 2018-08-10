function Value({id, name}){
    //Id of the value, is used to refer to it from the inside of the Module execute function, and to save it in the storage
    this.id = id;
    //Name of the value, is used to be shown to the user.
    this.name = name;

    this.checkValid();
}

Value.prototype.checkValid = function(){
    console.assert(this.id && this.name, "Value Object is not valid: ", this);
}