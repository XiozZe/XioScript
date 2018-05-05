/**
 * Procedure meant for changing the HTML on pages you visit in virtonomics.
 */
function Extension({id, name, explanation, test, options, execute}){

    Procedure.call(this, {id, name, explanation, options, execute});

    //Test of which page the extension is supposed to fire. It should be a function that return a boolean true if we are on a page the extension should work. Don't forget that this function can directly access the Document object.
    this.test = test;

    Object.freeze(this);
    this.checkComplete();
}

Extension.prototype = Object.create(Procedure.prototype);
Collection.call(Extension);
Object.assign(Extension, Collection.prototype);

/**
 * A very basic check to make sure I did not make a mistake in writing a module.
 */
Extension.prototype.checkComplete = function(){

    const allPresent = !!this.test;
    console.assert(allPresent, "Somethings wrong in the script: Extension is incomplete: ", this);
    
}

/**
 * Runs all extensions that satisfy the page.
 */
Extension.run = async () => {

    const choices = await Storage.getExtensions();
    for(const choice of choices){
        extension = Extension.get(choice.id);
        if(choice.active && extension.test()){
            console.log(`Running Extension: ${extension.name}`);
            await extension.execute(choice.picks);
        }
    }

}