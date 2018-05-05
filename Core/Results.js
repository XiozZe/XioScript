/**
 * Object responsible for displaying the results on the execution page 
 */
const Results = (function(){

    let timeStart = new Date();
    let timeIsRunning = false;
    let callsProcessing = 0;
    let callsTotal = 0;
    const timeDiv = document.getElementById("execTime");
    const callsTotalDiv = document.getElementById("execCallsTotal");
    const callsProcessingDiv = document.getElementById("execCallsProcess");
    const lastUrlDiv = document.getElementById("execUrl");
    const statusDiv = document.getElementById("execStatus");
    const logUl = document.getElementById("execLog");
    const statList = document.getElementById("execStatList");
    const statsDiv = document.getElementById("execStats");
    const pageList = document.getElementById("execPageList");
    const pageDiv = document.getElementById("execPages");

    (function updateTime(){

        if(timeIsRunning){
            const timeDiff = new Date() - timeStart;    
            const minutes = Math.floor(timeDiff / 1000 / 60);
            const seconds = timeDiff / 1000 - minutes * 60;
            const extraS = minutes === 1? '' : 's';
            timeDiv.innerText = `${minutes} minute${extraS} and ${seconds.toFixed(1)} seconds`;
        }

        setTimeout(updateTime, 20);
    
    })();

    const start = () => {
        timeStart = new Date();
        timeIsRunning = true;
        callsProcessing = 0;
        callsTotal = 0;
        logUl.innerHTML = "";
        statsDiv.style.display = 'none';
        resetPages();
    }    

    const stop = () => {
        timeIsRunning = false;
    }

    const resetPages = () => {        
        pageList.innerHTML = "";
        pageDiv.style.display = '';    
        const headerRow = pageList.createChild("div");
        const tdName = headerRow.createChild("div");
        const tdCount = headerRow.createChild("div");
        const tdUrl = headerRow.createChild("div");
        tdName.innerText = "Name";
        tdCount.innerText = "Count";
        tdUrl.innerText = "Last Finished Url";
        tdName.classList.add("statTitle");
        tdCount.classList.add("statTitle");
        tdUrl.classList.add("statTitle");
    }

    const startCall = (pageName, url) => {
        //StartCall can also be called from extensions. In order to track the results from the execution, only track the calls when the execution is running
        if(!timeIsRunning)
            return;

        callsProcessing++;
        callsProcessingDiv.innerText = callsProcessing;
        updatePage(pageName, url, "start");
    }

    const finishCall = (pageName, url) => {
        if(!timeIsRunning)
            return;
        
        callsProcessing--;
        callsProcessingDiv.innerText = callsProcessing;
        callsTotal++;
        callsTotalDiv.innerText = callsTotal;        
        lastUrlDiv.innerText = url; 
        updatePage(pageName, url, "finish"); 
    }

    const updatePage = (pageName, url, type) => {
        console.assert(type === "start" || type === "finish");

        let pageTd = document.getElementById("page"+pageName);

        if(!pageTd){
            pageTd = pageList.createChild("div");
            pageTd.id = "page"+pageName;
            pageTd.busyCount = 0;
            pageTd.finishedCount = 0;
            const divName = pageTd.createChild("div");
            const divCount = pageTd.createChild("div");
            const divUrl = pageTd.createChild("div");
            divName.innerText = pageName;            
        }

        if(type === "start"){
            pageTd.busyCount++;
        }
        else if(type === "finish"){
            pageTd.finishedCount++;
        }

        const childCount = pageTd.childNodes[1];
        childCount.innerText = `(${pageTd.finishedCount}/${pageTd.busyCount})`;
        if(type === "finish"){            
            const childUrl = pageTd.childNodes[2];
            childUrl.innerText = url;
        }
    }
    
    /**
     * Displays the error on the Results page.
     * Also puts it in the console so it also works not during execution
     */
    const errorLog = (message) => {
        console.error(message);
        if(!timeIsRunning)
            return;

        const li = logUl.createChild("li");
        li.innerText = message;
        li.style.color = "crimson";
    }

    const normalLog = (message) => {
        console.log(message);
        if(!timeIsRunning)
            return;

        const li = logUl.createChild("li");
        li.innerText = message;
        li.style.color = "blue";
    }

    const updateStatus = (statusMessage) => {
        statusDiv.innerText = statusMessage;
    }

    /**
     * When we know which modules to run, create the statistics list
     */
    const createStats = (package) => {

        statList.innerHTML = "";
        const moduleIds = Pack.getModuleIds(package);

        //General Stats
        const generalLi = statList.createChild("li");
        const divTitleRow = generalLi.createChild("div");  
        const divTitle = divTitleRow.createChild("div");
        divTitle.innerText = "Modules";
        divTitle.classList.add("statTitle");
        for(const moduleId of moduleIds){           
            const tr = generalLi.createChild("div");
            const tdName = tr.createChild("div");
            tdName.innerText = Module.get(moduleId).name;
            const tdValue = tr.createChild("div");
            tdValue.id = "statModule"+moduleId;
            tdValue.busyCount = 0
            tdValue.finishedCount = 0;
            tdValue.innerText = "(0/0)";
        }

        //Module Stats
        for(const moduleId of moduleIds){
            const module = Module.get(moduleId);
            const li = module.createStatNodes();
            statList.appendChild(li);
        }

        //Sort on list length?

        statsDiv.style.display = '';
        statList.equalWidth();
    }

    /**
     *  Updates the statistic of a certain stat from a module.
     */
    const addStats = (moduleId, statId, add) => {

        const statTd = document.getElementById("stat"+moduleId+statId);
        const module = Module.get(moduleId);
        const stat = module.getStat(statId);
        statTd.statValue += add;
        statTd.innerText = stat.applyFormat(statTd.statValue);   
        statList.equalWidth();    
    }

    /**
     * Update the number of busy and finished subdivisions of a module
     */
    const addModuleCount = (moduleId, type) => {
        console.assert(type === "busy" || type === "finished");
        const statModule = document.getElementById("statModule"+moduleId);
        if(type === "busy")
            statModule.busyCount++;
        else if(type === "finished")
            statModule.finishedCount++
        statModule.innerText = `(${statModule.finishedCount}/${statModule.busyCount})`;
        statList.equalWidth();
    }

    return {start, stop, startCall, finishCall, errorLog, normalLog, updateStatus, createStats, addStats, addModuleCount}

})();