/**
 * Module represents a procedure that executes some things regarding a subdivision, such as setting it's price or it's supply.
 */
function Module({id, name, explanation, subTypes, parallel, predecessors, options, stats, precleaner, execute}){
    this.name = name;

    Procedure.call(this, {id, name, explanation, options, execute});

   
    //These are the subdivision types the module is operating on. Any subdivision that is not one of these types will not be executed. Note that the values should correspond with those found in SubTypes.
    this.subTypes = subTypes;
    //Boolean value that is true if the subdivisions executed are allowed to be executed in parallel: meaning all at the same time without interfering with each other.
    this.parallel = parallel;
    //An array with module ID's that determine which modules have to be completed before this module is allowed to be called.
    this.predecessors = predecessors;
    //An array of Stat object that represent statistics that are showed on the results screen. Have to be updated inside the execute function to have any effect    
    this.stats = stats;
    //An array of ID's of Pages that have to be cleaned before the module should be run. That's because modules before could change data on it and we then need the latest data.
    this.precleaner = precleaner;

    this.checkComplete();
}
Module.prototype = Object.create(Procedure.prototype);
Collection.call(Module);
Object.assign(Module, Collection.prototype);

/*
Module.bucket = [];
Module.add = (module) => {
    Module.bucket.push(module);
}

Module.get = (moduleId) => {
    return Module.bucket.find(module => module.id === moduleId);
}
*/

/**
 * A very basic check to make sure I did not make a mistake in writing a module.
 */
Module.prototype.checkComplete = function(){

    const allPresent1 = this.id && this.name && this.explanation && this.subTypes && this.options && this.predecessors;
    const allPresent2 = this.stats && this.precleaner && this.execute && this.parallel !== undefined;
    console.assert(allPresent1 && allPresent2, "Somethings wrong in the script: Module is incomplete: ", this);

    const correctOptions = this.options instanceof Array && this.options.reduce((acc, e) => acc && e instanceof Option);
    console.assert(correctOptions, "Module object invalid: options are not an array of options");
    
    const correctStats = this.stats instanceof Array && this.stats.reduce((acc, e) => acc && e instanceof Stat);
    console.assert(correctStats, "Module object invalid: stats are not an array of stats");

    this.subTypes.forEach(subType => SubTypes.checkType(subType));
    this.options.forEach(option => option.checkValid());
    this.stats.forEach(stat => stat.checkValid());

}

/**
 * Get the stat from the module with ID statId
 */
Module.prototype.getStat = function(statId){
    const stat = this.stats.find(stat => stat.id === statId);
    console.assert(stat, `Asked for a stat with statID '${statId}', but could not find such stat in module '${this.id}'.`);
    return stat;
}

Module.prototype.createStatNodes = function(){

    const li = document.createElement("li");
    const divTitleRow = li.createChild("div");  
    const divTitle = divTitleRow.createChild("div");
    divTitle.innerText = this.name;
    divTitle.classList.add("statTitle");

    for(const stat of this.stats){
        const tr = li.createChild("div");
        const tdName = tr.createChild("div");
        tdName.innerText = stat.display;
        const tdValue = tr.createChild("div");
        tdValue.id = "stat"+this.id + stat.id;
        tdValue.statValue = 0;
        tdValue.innerText = stat.applyFormat(0);
    }

    return li;
}