(function(){

    const onLiClick = async element => {

        const toggle = await Storage.getToggle();
        const elementId = element.target.elementId;
        const titleId = element.target.titleId;
        toggle[titleId] = toggle[titleId] || [];
        
        if(element.target.classList.contains("selected")){
            const index = toggle[titleId].indexOf(elementId);            
            if(index === -1){
                //Index can only be -1 if something in the storage happened that should not have, so reset
                document.getElementById("togglePageButton").click();
                return;
            }
            toggle[titleId].splice(index, 1);
        }
        else{
            toggle[titleId].push(elementId);
        }
        element.target.classList.toggle("selected");
        await Storage.saveToggle(toggle);
    }

    const onTitleClick = async element => {

        const toggle = await Storage.getToggle();
        const titleId = element.target.titleId;
        const lis = element.target.nextSibling.childNodes;
        toggle[titleId] = toggle[titleId] || [];

        if(toggle[titleId].length === 0)
            element.target.selectAll = true;
        else if(toggle[titleId].length === lis.length)
            element.target.selectAll = false;

        toggle[titleId] = [];

        for(const li of lis){
            if(element.target.selectAll){
                toggle[titleId].push(li.elementId);
                li.classList.add("selected");
            }
            else{
                li.classList.remove("selected");
            }
        }
        
        element.target.selectAll = !element.target.selectAll;
        await Storage.saveToggle(toggle);
    }

    const generateList = async (title, ids, texts) => {
        //ids are language independent, thus the main way of saving.
        //texts are language dependent

        if(!ids.length || !texts.length || ids.length !== texts.length)
            return;

        const divLists = document.getElementById("generatedLists");
        const divWrapper = divLists.createChild("div");
        const divTitle = divWrapper.createChild("div");
        divTitle.classList.add("subTitle");
        divTitle.innerText = title;
        divTitle.titleId = title;
        divTitle.selectAll = true;
        divTitle.addEventListener("click", onTitleClick);
        const ul = divWrapper.createChild("ul");
        ul.classList.add("ulToggler");
        ul.style.columnWidth = 0;    

        const toggle = await Storage.getToggle();        
        if(!toggle[title])
            toggle[title] = [];

        //Appending li's
        const docFragment = document.createDocumentFragment();
        for(let i = 0; i < ids.length; i++){
            const li = docFragment.createChild("li");
            li.innerText = texts[i];
            li.elementId = ids[i];
            li.titleId = title;

            if(toggle[title].includes(ids[i]))
                li.classList.add("selected");
            
            li.addEventListener("click", onLiClick);
            //Prevent selecting
            li.addEventListener("mousedown", e => e.preventDefault());
        }
        ul.appendChild(docFragment);
        ul.equalWidth();        
    }

    const makeListFromStorage = async () => {

        document.getElementById("generatedLists").innerHTML = "";

        const selections = await Storage.getSelections();
    
        const realms = Selection.getAllRealms(selections).sort();
        
        const moduleIds = Selection.getAllModules(selections).sort();
        moduleIds.sort( (a, b) => Module.get(a).name < Module.get(b).name );
        const moduleNames = moduleIds.map( e => Module.get(e).name );

        const choices = Selection.getAllChoices(selections).sort();
        //const subdivisions = Selection.getAllSubdivisions(selections).sort();

        const typeIds = Selection.getAllTypes(selections);
        typeIds.sort( (a, b) => SubTypes.getName(a) < SubTypes.getName(b) );
        const typeNames = typeIds.map( e => SubTypes.getName(e) );
    
        generateList("Realms", realms, realms);
        generateList("Modules", moduleIds, moduleNames) ;
        generateList("Choices", choices, choices);
        generateList("Types", typeIds, typeNames);
        //generateList("Subdivisions", subdivisions, subdivisions);        
    }

    document.getElementById("togglePageButton").addEventListener("click", makeListFromStorage);

})();