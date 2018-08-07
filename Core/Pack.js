/**
 * In comparison with Choice and Selection, Pack is an alternative way of representing data about which subdivisions are performing which modules with which choices. This representation is chosen so it is easy to execute by the Executor
 */
function Pack(subdivision, choices){

    console.assert(subdivision instanceof Subdivision, `Tried to create a Pack with subdivision ${subdivision} that is not a Subdivision`)

    this.subdivision = subdivision
    this.choices = choices
}

/**
 * Makes an object from the passed selections that has the module ID's as key and the subdivisions as value. Based on the options in the toggle (from Storage), it filters out the subdivisions that do not have the requirements.
 */
Pack.createPackage = async (selections) => {

    const toggle = await Storage.getToggle()
    const package = {}

    for(const selection of selections){

        //Does not fulfill selection criteria
        if(!toggle["Choices"].includes(selection.name))
            continue

        for(const choice of selection.choices){

            const moduleId = choice.id
            //Does not fulfill module criteria, or is not active
            if(!toggle["Modules"].includes(moduleId) || !choice.active){
                continue
            }                

            for(const subdivision of selection.subdivisions){

                const hasRealm = toggle["Realms"].includes(subdivision.realm)
                //We disabled the Subdivision selection
                const hasSubdivisionID = toggle["Subdivisions"].includes(subdivision.id) || true
                const hasType = toggle["Types"].includes(subdivision.type)

                const module = Module.get(moduleId)
                const correctType = module.subTypes.includes(subdivision.type)

                console.log(selection, toggle)

                if(hasRealm && hasSubdivisionID && hasType && correctType){

                    const pack = new Pack(subdivision, choice.picks)
                    package[moduleId] = package[moduleId] || []
                    package[moduleId].push(pack)
                }
            }
        }
    }

    return package
};


/**
 * Find all realms that are in the package
 */
Pack.getRealms = (package) => {
    const realms = new Set()
    for(const moduleId in package){
        const packs = package[moduleId]
        for(const pack of packs){
            realms.add(pack.subdivision.realm)     
        }      
    }
    return Array.from(realms)
}

/**
 * Return all module ID's of the package
 */
Pack.getModuleIds = (package) => {
    return Object.keys(package)
}


