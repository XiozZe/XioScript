(function(){

    const extensionPage = document.getElementById("extensionsPage");
    const editChoiceList = document.getElementById("extensionChoice");

    const clickTitle = async element => {
        const extensionDiv = element.target.parentElement;
        console.log(extensionDiv);
        extensionDiv.toggleActive();
        const selectionName = document.getElementById("selectionName").value;
        const extensionId = extensionDiv.getAttribute("data");
        const active = extensionDiv.isActiveProcedure;

        const choices = await Storage.getExtensions();
        choices.find(choice => choice.id === extensionId).active = active;
        await Storage.saveExtensions(choices);        
    } 

    const changeSelect = async element => {
        
        const select = element.target;
        const extensionId = select.procedureId;
        const optionId = select.optionId;
        const newValue = select.value;

        const choices = await Storage.getExtensions();
        console.log(choices, extensionId);
        choices.find(choice => choice.id === extensionId).picks[optionId] = newValue;
        await Storage.saveExtensions(choices);
        
    }

    const setWidth = element => {
        const extensionDivs = extensionPage.querySelectorAll(".procedureDiv[data]");

        for(const extensionDiv of extensionDivs){
            extensionDiv.setMaxInputWidth();
        }  
    }

    const createExtensionEditList = () => {

        for(const extension of Extension.getAll()){        
            const extensionDiv = Procedure.createEditChoice(extension, clickTitle, changeSelect);
            editChoiceList.appendChild(extensionDiv);
        }
    }

    /**
     * Load the settings saved in Storage and put them on the page.
     */
    const editExtensionEditList = async () => {

        const choices = await Storage.getExtensions();        
        for(const choice of choices){

            const extensionDiv = extensionPage.querySelector(`[data='${choice.id}']`);
            
            //XOR operation
            if( extensionDiv.isActiveProcedure ? !choice.active : choice.active ){ 
                extensionDiv.querySelector(".subTitle").click();
            }

            for(const optionId in choice.picks){
                const select = document.getElementById(choice.id+optionId);
                select.value = choice.picks[optionId];
            }
        }
    }

    createExtensionEditList();
    editExtensionEditList();

})();