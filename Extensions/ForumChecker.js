Extension.add( new Extension({

	id: "ForumCheck",
	name: "Forum Checker",
	explanation: `How do we know if there is a new message on the forum? Now we know: an extra icon next to the 'you got mail' icon will appear if there is a new message. Every time you visit the main page of the forum it will register all last posts send, and on every other page it will secretly check if the last posts send are still the same.`,
	test: () => {
		return !!document.getElementsByClassName("fa-envelope").length || Page.get("ForumMain").test(document, document.URL);
	},
	options: [],
	execute: async (picks) => {

		const createForumIcon = (forumUrl) => {
			const envelope = document.getElementsByClassName("fa-envelope")[0];
			const a = document.createElement("a");
			envelope.parentElement.parentElement.insertBefore(a, envelope.parentElement);
			a.href = forumUrl;
			a.style.marginRight = "10px";
			a.style.display = 'none';
			a.innerText = "Forum!";
			return a;
		}

		/**
		 * Checks if the timeStamps passed is exactly the same as the timeStamps saved in the local Storage.
		 */
		const isSavedTimeStamps = async (newTimeStamps) => {

			let oldTimeStamps = await Storage.getValue(this.id, "timeStamps");
			oldTimeStamps = oldTimeStamps || [];

			return oldTimeStamps.toString() === newTimeStamps.toString();

		}

		const forumMain = Page.get("ForumMain");
		const domain = Vital.getDomain();
		const realm = Vital.getRealm();

		if(forumMain.test(document, document.URL)){

			//We are on the forum page: save the time stamps;
			const forumValues = forumMain.scrape(document);
			const timeStamps = forumValues.timeStamps;
			await Storage.saveValue(this.id, "timeStamps", timeStamps);

		}
		else{

			//We are on any page: check if the time stamps saved is the same we fetch.
			const forumUrl = forumMain.getUrl(domain, realm);	
			const a = createForumIcon(forumUrl);			

			const recursiveTimeout = async () => {

				const forumValues = await forumMain.load(domain, realm);
				const timeStamps = forumValues.timeStamps;

				if(await isSavedTimeStamps(timeStamps)){
					a.style.display = 'none';
				}
				else{
					a.style.display = '';
				}

				setTimeout(recursiveTimeout, 30000);
			}	
			
			recursiveTimeout();
		}

	}


}));