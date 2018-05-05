(function(){

    let selectedSelection = null;
    const modulePage = document.getElementById("modulesPage");
    const editChoiceList = document.getElementById("editChoice");

    const createSelectionList = async () => {

        const selections = await Storage.getSelections();
        const ul = modulePage.querySelector("#choices ul");
        ul.innerHTML = "";

        //Add new li's
        for(const selection of selections){
            const li = document.createElement("li");
            li.innerText = selection.name;
            li.style.color = selection.color;
            li.addEventListener("click", async () => {
                editChoiceList.style.display = "";
                selectedSelection = selection.name;
                await editModuleEditList();
            });
            li.addEventListener("click", setWidth, {once: true});
            ul.appendChild(li);
        }    

    }

    const clickTitle = async element => {
        const moduleDiv = element.target.parentElement;

        //Change visibility on page
        if(moduleDiv.isActiveProcedure){
            moduleDiv.style.backgroundColor = "#DDDDDD";
            moduleDiv.querySelector("p").style.fontStyle = "italic";
            moduleDiv.querySelectorAll("select, input").forEach(selectElement => selectElement.disabled = true);
        }
        else{            
            moduleDiv.style.backgroundColor = "#FFFFFF";
            moduleDiv.querySelector("p").style.fontStyle = "";
            moduleDiv.querySelectorAll("select, input").forEach(selectElement => selectElement.disabled = false);
        }
        moduleDiv.isActiveProcedure = !moduleDiv.isActiveProcedure;

        const selectionName = document.getElementById("selectionName").value;
        const moduleId = moduleDiv.getAttribute("data");
        const active = moduleDiv.isActiveProcedure;
        await Selection.changeActive(selectionName, moduleId, active);
        
    } 

    const changeSelect = async element => {
        
        const select = element.target;
        const selectionName = document.getElementById("selectionName").value;
        const moduleId = select.procedureId;
        const optionId = select.optionId;
        const newValue = select.value;

        await Selection.changePick(selectionName, moduleId, optionId, newValue);
        
    }

    const setWidth = element => {
        const moduleDivs = modulePage.querySelectorAll(".procedureDiv[data]");
        for(const moduleDiv of moduleDivs){
            moduleDiv.setMaxInputWidth();
        }
    }

    document.getElementById("selectionName").addEventListener("blur", async element => {

        const selectionNameElement = element.target;
        const oldName = selectionNameElement.selectionName;
        const newName = selectionNameElement.value;
        
        if(oldName === newName){
            //Nothing changed
            return;
        }

        const changeSuccessful = await Selection.changeName(oldName, newName);
        const duplicateWarning = document.getElementById("selectionNameDuplicate");

        if(changeSuccessful){
            selectedSelection = newName;
            await createSelectionList();
            await editModuleEditList();
            duplicateWarning.innerText = "";
        }
        else{
            duplicateWarning.innerText = "Name not updated: it already exists";
            selectionNameElement.value = oldName;
        }

    });

    document.getElementById("selectionColor").addEventListener("blur", async element => {

        const moduleColor = element.target;
        const selectionName = document.getElementById("selectionName").value;
        const newColor = moduleColor.value;

        await Selection.changeColor(selectionName, newColor);
        await createSelectionList();

    });

    const createModuleEditList = () => {

        for(const module of Module.getAll()){                        
            const moduleDiv = Procedure.createEditChoice(module, clickTitle, changeSelect);
            editChoiceList.appendChild(moduleDiv);
        }
    }

    /**
     * Load the settings saved in Storage and put them on the page.
     */
    const editModuleEditList = async () => {

        const selections = await Storage.getSelections();
        const selection = selections.find(selection => selection.name === selectedSelection);

        const selectionDiv = document.getElementById("selectionName");
        selectionDiv.value = selection.name;
        selectionDiv.selectionName = selection.name;
        document.getElementById("selectionColor").value = selection.color;
        
        for(const choice of selection.choices){

            const moduleDiv = modulePage.querySelector(`[data='${choice.id}']`);

            if( moduleDiv.isActiveProcedure ? !choice.active : choice.active ){ 
                moduleDiv.querySelector(".subTitle").click();
            }

            for(const optionId in choice.picks){
                const select = document.getElementById(choice.id+optionId);
                select.value = choice.picks[optionId];
            }
        }
        editChoiceList.style.display = "";

    }

    //When you click on create, there should be a new Selection object created and saved in the storage.
    modulePage.querySelector("#moduleCreate").addEventListener("click", async element => {        
        await Selection.addGeneric();
        await createSelectionList();
    });

    modulePage.querySelector("#moduleRemove").addEventListener("click", async element => {

        editChoiceList.style.display = "none";
        await Selection.removeName(selectedSelection);
        selectedSelection = null;
        await createSelectionList();

    });

    editChoiceList.style.display = "none";
    createSelectionList();
    createModuleEditList();

})();