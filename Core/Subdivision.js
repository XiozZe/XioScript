function Subdivision(id, realm, type){
    this.id = id;
    this.realm = realm;
    this.type = type;

    Object.freeze(this);
}

/**
 * Makes a new Subdivision with all the information of passed object, to make sure that the new object is an instance of Subdivision
 */
Subdivision.createFromObject = function(subdivisionObject){
    const subdivision = Object.create(Subdivision.prototype);
    subdivision.id = subdivisionObject.id;
    subdivision.realm = subdivisionObject.realm;
    subdivision.type = subdivisionObject.type;
    return subdivision;
}

Subdivision.prototype.isEqual = function(subdivision){
    const idEqual = this.id === subdivision.id;
    const realmEqual = this.realm === subdivision.realm;
    const typeEqual = this.type === subdivision.type;
    return idEqual && realmEqual && typeEqual;
}