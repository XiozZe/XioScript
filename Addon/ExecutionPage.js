(function(){

    const execButton = document.getElementById("execButton");
    const execShow = document.getElementById("execShow");

    const run = async () => {


        execButton.style.visibility = 'hidden';
        execShow.style.display = '';

        await Executor.run();

        execButton.style.visibility = '';

    }

    execButton.addEventListener("click", run);
    execShow.style.display = 'none';

    document.getElementById("execStats").style.display = 'none';
    document.getElementById("execPages").style.display = 'none';    

})();