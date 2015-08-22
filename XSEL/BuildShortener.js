XSEL.push({
	name: "Build Shortener",
	description: "Makes building easier and shorter. Loads the new parts of the page directly onto the old, without the need of redirecting. Removes all cancel and back buttons, as these are hard to deal with scripting-wise.",
	regex: "\/.*\/main\/unit\/create\/[0-9]+",
	code: function(){
		
		$( document ).ajaxSuccess(function( event, xhr, settings ) {
			var newUrl = $(xhr.responseText).find("#mainContent form").attr("action")
			
			if(new RegExp("\/.*\/main\/unit\/create\/[0-9]+").test(newUrl)){
				
				$("#mainContent").html($(xhr.responseText).find("#mainContent").html());
			
				var $form = $("form:eq(1)");
				$(":submit:not([name=next])").remove();
			
				$form.submit(function(event){
					event.preventDefault();
					$.post(newUrl, $form.serialize());
				});				
				
			}	
			else{
				window.location.replace(newUrl);
			}
			
		});
		
        var $form = $("form:eq(1)");
		$(":submit:not([name=next])").remove();
		
		$form.submit(function(event){
			event.preventDefault();
			$.post(document.URL, $form.serialize());
		});
		
		xcList();
	}
});