Extension.add( new Extension ({

	id: "PageSize",
	name: "Page Size Adder",
	explanation: `Many Virtonomics lists can be presented with different numbers of elements on that list. This extension extends the maximum number of element beyond 400. As options there are three input fields that represent the page sizes you would like to add to the 'Show By'. If you leave the input empty or put in a negative number, no page size will be added. The page numbers will be automatically sorted.`,
	test: () => {
		return !!document.getElementsByClassName("pager_options").length;
	},
	options: [
		new Option({id: "size1", name: "Size 1", type: "textbox", format: "Integer", start: 1000}),
		new Option({id: "size2", name: "Size 2", type: "textbox", format: "Integer", start: 2000}),
		new Option({id: "size3", name: "Size 3", type: "textbox", format: "Integer", start: 4000})
	],
	execute: async (picks) => {

		const pagerOptions = document.getElementsByClassName("pager_options")[0];

		console.log(pagerOptions);

		for(const optionId in picks){
			
			const pageSize = picks[optionId];

			if(pageSize <= 0)
				continue;

			const copiedLi = pagerOptions.querySelector("a").parentElement.cloneNode(true);
			console.log(copiedLi);
			const a = copiedLi.children[0];
			a.href = a.href.replace(/\d+/, pageSize);
			a.innerText = pageSize;

			pagerOptions.appendChild(copiedLi);
		}

		
		console.log(Array.from(pagerOptions.children));
		console.log(Array.from(pagerOptions.children).sort((lia, lib) => parseInt(lia.innerText) - parseInt(lib.innerText) ));

		//Sort the page numbers
		Array.from(pagerOptions.children)
			 .sort((lia, lib) => parseInt(lia.innerText) - parseInt(lib.innerText) )
			 .forEach(li => pagerOptions.appendChild(li));

		
	}

}));