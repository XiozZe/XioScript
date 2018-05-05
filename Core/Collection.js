/**
 * It's an object, or an array, but then less.
 * Collection of Pages, Modules or Extensions
 */
function Collection(){
    this.bucket = [];
}

Collection.prototype.add = function(apple) {                
    this.bucket.push(apple);    
}

Collection.prototype.has = function(id){
    for(const apple of this.bucket){
        if(apple.id == id)
            return true;
    }
    return false;
}

Collection.prototype.get = function(id){

    for(const apple of this.bucket){
        if(apple.id == id)
            return apple;
    }

    console.error(`Asked for: ${id}, but couldn't find it in the collection: `, this);        
}
    
Collection.prototype.getAll = function(){
    return this.bucket;
}

Collection.prototype.getAllIds = function (){

    const ids = [];
    for(const apple of this.bucket){
        ids.push(apple.id);
    }
    return ids;
}


