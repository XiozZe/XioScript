/**
 * This is the base class for the objects Module and Extension
 */
function Procedure({id, name, explanation, options, execute, Cultivar}){
     
    //ID of this procedure it will be saved by inside the script and storage
    this.id = id;
    //The explanation of the extension the user will see. Should give a general insight of what the extension does, and should explain in detail what every option does.
    this.explanation = explanation;
    //The options the user can set for this procedure. Should be an array of Option objects.
    this.options = options;
    //The function to execute the procedure.
    this.execute = execute;
    //Name of the procedure the user sees
    this.name = name;

    this.checkValidProcedure();
}

/**
 * A very basic check to make sure I did not make a mistake in writing a module or extension.
 */
Procedure.prototype.checkValidProcedure = function(){

    const allPresent = this.id && this.name && this.explanation && this.options && this.execute;
    console.assert(allPresent, "Somethings wrong in the script: Procedure is incomplete: ", this);

    const correctOptions = this.options instanceof Array && this.options.reduce((acc, e) => acc && e instanceof Option);
    console.assert(correctOptions, "Module object invalid: options are not an array of options");
    
    this.options.forEach(option => option.checkValid());
}

/**
 * Checks if the option ID given is part of one of the options of this module.
 */
Procedure.prototype.hasOption = function(optionId){
    return !!this.options.find(option => option.id === optionId);
}

/**
 * Get the option in this module with the given option ID
 */
Procedure.prototype.getOption = function(optionId){
    return this.options.find(option => option.id === optionId)
}

/**
 * Makes the HTML for the choices of one particular Procedure. Needs the procedure in question, and the event handlers for if the title is click or a select is changed.
 */
Procedure.createEditChoice = (procedure, clickTitle, changeSelect) => {

    const procedureDiv = document.createElement("div");  
    procedureDiv.classList.add("procedureDiv");
    procedureDiv.setAttribute("data", procedure.id);
    procedureDiv.isActiveProcedure = true;
    
    const procedureTitle = procedureDiv.createChild("div");
    procedureTitle.innerText = procedure.name;
    procedureTitle.classList.add("subTitle");
    procedureTitle.addEventListener("click", clickTitle);

    if(procedure instanceof Module){
        const procedureSubTypes = procedureDiv.createChild("div")
        procedureSubTypes.classList.add("procedureSubTypes");            
        procedureSubTypes.innerText = SubTypes.getNames(procedure.subTypes).join(", ");
    }

    const procedureExplanation = procedureDiv.createChild("p");
    procedureExplanation.innerText = procedure.explanation;

    const optionTable = procedureDiv.createChild("table");
    const header = optionTable.createChild("tr");
    const row = optionTable.createChild("tr");

    for(const option of procedure.options){

        const headerElement = header.createChild("th");
        const rowElement = row.createChild("td");
        headerElement.innerText = option.name;

        let element;
        if(option.type === "select"){
            element = rowElement.createChild("select");
            for(const value of option.values){
                const optionElement = element.createChild("option");
                optionElement.value = value.id;
                optionElement.innerText = value.name;
            }
        }
        else if(option.type === "textbox"){
            element = rowElement.createChild("input")
            element.classList.add("procedureInput");
            element.type = "text";
        }               

        element.id = procedure.id + option.id;
        element.procedureId = procedure.id;
        element.optionId = option.id;
        element.addEventListener("change", changeSelect);                    
    }

    return procedureDiv;

}