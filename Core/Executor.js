const Executor = (function(){

    let running = false;

    const findDomain = async () => {
        //If you are logged in on the english domain, for some reason it can also get the values from the russian realms.
        return "https://virtonomics.com";
    }

    /**
     * Extract the company ID from the virtonomics page.
     */
    const findCompanyId = async (domain, realm) => {
        try{
            const url = `${domain}/${realm}/main/user/privat/headquarters`;
            Results.startCall("HeadQuarters", url);
            const response = await fetch(url, {credentials: "include"})
            Results.finishCall("HeadQuarters", url);
            const dashBoardUrl = response.url;
            const companyId = dashBoardUrl.match(/\d+/)[0];

            //Not logged in or no company on that realm
            if(companyId === "1" || companyId === "00001")
                throw new Error;

            return companyId;
        }
        catch(e){
            console.error(`Tried to find a company ID of domain ${domain} and of realm ${realm}, but could not find it`);
            throw new Error("CompanyID error");
            return null;
        }
    }

    /**
     * Get all company ids from the realms given
     */
    const getAllCompanyIds = async(domain, realms) => {
        const companyId = {};
        const promise = {};

        //First call on all the promises to fire
        for(const realm of realms){
            promise[realm] = findCompanyId(domain, realm);
        }
        //Then wait till they are all finished
        for(const realm of realms){
            companyId[realm] = await promise[realm];
        }
        
        return companyId;
    }

    /**
     * For all subdivisions that are waiting to be executed in the package, check on the unitList if they still exist. If they don't, then remove those from the selections and the storage.
     */
    const removeDeletedSubdivisions = async (selections, domain, realms, companyIds) => {

        const unitList = Page.get("UnitList");

        //Find deleted subdivisions and remove them from package
        for(const realm of realms){
            const data = await unitList.load(domain, realm, companyIds[realm]);
            for(const selection of selections){
                for(const subdivision of selection.subdivisions){
                    if(realm === subdivision.realm && !data.subid.includes(subdivision.id)){
                        const index = selection.subdivisions.indexOf(subdivision);
                        selection.subdivisions.splice(index, 1);
                        Results.normalLog(`Removed subdivision ${subdivision.id} (${subdivision.realm}) from Storage because it is not found in your company`);
                    }
                }
            }
        }

        await Storage.saveSelections(selections);
        return selections;
    }

    /**
     * Makes sure that all pages that are to be loaded are empty.
     * Especially important if the executor is going to run more than one time
     */
    const emptyAllPageData = () => {
        for(const page of Page.getAll()){
            page.cleanAll();
        }
    }


    /**
     * Execute the module on the given pack (that is: subdivision + choices)
     */
    const executeModule = async (moduleId, packs, domain, companyIds) => {
        
        //If we can't find the module in the packs, it means there are no subdivisions to run
        if(!packs)
            return;

        const promises = [];
        const module = Module.get(moduleId);
        for(const pack of packs){
            const realm = pack.subdivision.realm;
            const id = pack.subdivision.id;
            const type = pack.subdivision.type;
            const choices = pack.choices;
            const companyId = companyIds[realm];

            try{
                Results.addModuleCount(moduleId, "busy");
                const promise = module.execute(domain, realm, companyId, id, type, choices);
                promise.then(() => Results.addModuleCount(moduleId, "finished"));
                promises.push(promise);
            }            
            catch(e){                
                Results.errorLog(`Error occured in module ${module.name} for subdivision ${id}`);
                console.error(e.message);
            }
        }

        await Promise.all(promises);
        console.log(`Module ${moduleId} is Done!`);
    }

    /**
     * Based on the status of the modules, decide if the way is clear to run a module
     */
    const nextModuleToRun = (modulesQueued, modulesBusy, modulesFinished) => {

        const moduleToRun = [];
        for(const moduleId of modulesQueued){

            const module = Module.get(moduleId);

            let canRun = true;            
            for(const predecessor of module.predecessors){
                if(!modulesFinished.includes(predecessor)){
                    canRun = false;
                }
            }

            if(canRun)
                return moduleId;
        }

        return null;
    }

    /**
     * Execute all the packs that are inside the package
     */
    const executePackage = async (package, domain, companyIds) => {

        let modulesQueued = Module.getAllIds();
        let modulesBusy = [];
        let modulesFinished = [];

        const iterateModules = async () => {

            console.log(modulesQueued, modulesBusy);
            
            //We don't have to pick a new module, all modules busy or finished
            if(!modulesQueued.length)
                return;

            const moduleToRun = nextModuleToRun(modulesQueued, modulesBusy, modulesFinished);

            if(!moduleToRun && !modulesBusy.length){
                Results.errorLog("Something is wrong with the script: there are modules that are unreachable.");
                console.error(modulesQueued, modulesBusy, modulesFinished);
                return;
            }

            if(!moduleToRun)
                return;

            modulesBusy.push(moduleToRun);
            modulesQueued = modulesQueued.filter(moduleId => moduleId !== moduleToRun);
            
            //There may be more new modules to fire
            const iterate1 = iterateModules();

            const execute = executeModule(moduleToRun, package[moduleToRun], domain, companyIds);
            await execute;
            modulesFinished.push(moduleToRun);
            modulesBusy = modulesBusy.filter(moduleId => moduleId !== moduleToRun);

            //New finished module: check if there are more subject to fire
            const iterate2 = iterateModules();
            await iterate1;
            await iterate2; 
            
        }

        await iterateModules();
    }


    
    const isRunning = () => {
        return running;
    }

    /**
     * Runs all things necessary to execute the 'script'
     */
    const run = async () => {

        running = true;
        Results.start();
        Results.updateStatus("Initializing");

        emptyAllPageData();
        const domain = await findDomain();
        let selections = await Storage.getSelections();
        const realms = Selection.getAllRealms(selections);

        Results.updateStatus("Finding your Company");

        let companyIds;
        try{ 
            companyIds = await getAllCompanyIds(domain, realms); 
        }
        catch(e) { 
            Results.errorLog("Could not find your company ID. Check if you are logged in.");
            Results.stop();
            running = false;
            return; 
        }

        Results.updateStatus("Looking for subdivisions");
        selections = await removeDeletedSubdivisions(selections, domain, realms, companyIds);
        
        Results.updateStatus("Executing Modules");
        console.log(selections);
        const package = await Pack.createPackage(selections);
        console.log(package);
        Results.createStats(package);

        await executePackage(package, domain, companyIds);

        Results.updateStatus("All Done!");
        console.log("All Done!");

        Results.stop();
        running = false;

    }

    return {run, isRunning};

})();