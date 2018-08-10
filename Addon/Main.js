(function(){    

    //Manages which pages is open:
    const buttonPages = document.querySelectorAll(".pageButton");

    //Which button id belongs to which page id
    const buttonToPage = {
        "mainPageButton" : "mainPage",
        "executionPageButton" : "executionPage",
        "togglePageButton" : "togglePage",
        "modulesPageButton" : "modulesPage",
        "extensionsPageButton" : "extensionsPage",
    }

    const buttonPageClickFunction = element => {
        
        //Hide all pages
        for(const buttonPage of buttonPages){
            const buttonPageId = buttonPage.id;
            const pageId = buttonToPage[buttonPageId];
            const page = document.getElementById(pageId);
            
            page.style.display = "none";
        }

        //Show the one pressed
        const buttonPageId = element.target.id;
        const pageId = buttonToPage[buttonPageId];
        const page = document.querySelector("#"+pageId);
        page.style.display = "";

    };

    for(const buttonPage of buttonPages ){
        buttonPage.addEventListener("click", buttonPageClickFunction);
    }

    document.getElementById("mainPageButton").click();

    //Make visible if everything is loaded
    document.getElementById("mainContent").classList.remove("startInvisible");
    document.getElementById("contentLoader").remove();
    
})();
