	
//For getting the Realm and the Company ID
const Vital = (() => {
	
	let varRealm = "";
	let companyId;
	
	const findRealm = () => {
		//save the current realm (mary/lien/etc.) in a variable
		let ca = document.cookie.split(';'), rlm;
		for(let i = 0; i < ca.length; i++){
			let c = ca[i];
			while (c.charAt(0) == ' ') c = c.substring(1, c.length);
			if (c.indexOf("last_realm=") === 0) 
				varRealm = c.substring(11, c.length);
		}
	}
	
	const getRealm = () => {
		if(varRealm === ""){
			findRealm();
		}
		return varRealm;
	}	

	const getCompanyId = () => {
		if(!companyId)
			companyId = $("a.dashboard").attr("href").match(/\d+/)[0];

		return companyId;
	}

	return {		
		getRealm,
		getCompanyId	
	}	
	
})();