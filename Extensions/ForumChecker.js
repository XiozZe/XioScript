//Check if there are new forum messages
let ForumChecker = (() => {
	
	let getForumUrl = () => `/${Vital.getRealm()}/forum/forumcategory/list`;

	let getForumValues = async () => {
		
		return await new Promise((resolve, reject) => {
			$.get(getForumUrl()).done((html) => {
				resolve(VirtoMap.ForumMain($(html)).values);
			});
		});
	}

	let canAppendMessage = () => {
		return $("li.right").length;
	}

	let addForumMessage = () => {
		return $(`<a href='${getForumUrl()}' id=XSforum style='margin-right: 10px'>Forum!</a>`).prependTo("li.right");
	}

	let initLocalStorageForum = (propertyArray) => {

		let XSforum = JSON.parse(localStorage.getItem("XSforum"));
		
		if(!XSforum)
			XSforum = {};

		for(let property of propertyArray){
			if(!XSforum[property])
				XSforum[property] = 0;
		}

		localStorage.setItem("XSforum", JSON.stringify(XSforum));
	}

	let getLocalStorageForum = (propertyName) => {
		
		let XSforum = JSON.parse(localStorage.getItem("XSforum"));
		return XSforum[propertyName];
	}

	let updateLocalStorageForum = (propertyName, propertyValue) => {

		let XSforum = JSON.parse(localStorage.getItem("XSforum"));		

		XSforum[propertyName] = propertyValue;

		localStorage.setItem("XSforum", JSON.stringify(XSforum));
	}

	let findMostRecentMessage = (forumValues) => {

		//Forums have topics and posts, both could be the most recent
		let topic = 0;
		let post = 0;

		for(let index in forumValues.id){

			if(forumValues.isTopic[index] && forumValues.id[index] > topic)
				topic = forumValues.id[index];
			if(!forumValues.isTopic[index] && forumValues.id[index] > post)
				post = forumValues.id[index];

		}

		return [topic, post];
	}

	let checkNewMessage = ($message) => {

		getForumValues().then((values) => {

			[topicBest, postBest] = findMostRecentMessage(values);

			if(topicBest > getLocalStorageForum("topic") || postBest > getLocalStorageForum("post"))
				$message.show();
			else
				$message.hide();

		});

	}

	let updateRecentForumValues = () => {

		initLocalStorageForum(["topic", "post"]);

		let values = VirtoMap.ForumMain($(document)).values;
		[topic, post] = findMostRecentMessage(values);

		updateLocalStorageForum("topic", topic);
		updateLocalStorageForum("post", post);

	}

	let trackNewForumMessage = () => {

		initLocalStorageForum(["topic", "post"]);

		let $message = addForumMessage();
		$message.hide();

		let recursiveTimeout = () => {
			checkNewMessage($message);
			setTimeout(recursiveTimeout, 50000);
		}

		recursiveTimeout();

	}

	return {updateRecentForumValues, canAppendMessage, trackNewForumMessage};

})();