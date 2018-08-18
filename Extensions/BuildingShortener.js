Extension.add( new Extension({

	id: "BuildingShortener",
	name: "Building Shortener",
	explanation: `Shortens building by loading the page in the back instead of completely reloading the page. This way building will be faster because you waste less time on waiting.`,
	test: () => {
		return new RegExp("\/main\/unit\/create").test(document.URL)
	},
	options: [],
	execute: async (choice) => {

        let form = document.querySelector("#mainContent form")
        let currentUrl = document.URL
        
        const formReplacer =  async (e) => {

            e.preventDefault()
            console.log(e)

            const data = new URLSearchParams()
            for (const pair of new FormData(form)) {
                data.append(pair[0], pair[1])
            }

            const button = e.explicitOriginalTarget
            data.append(button.getAttribute("name"), button.getAttribute("value"))

            const page = await fetch(currentUrl, {
                method: 'post',
                body: data,
                credentials: "include"
            })

            const t = await page.text()
            const p = new DOMParser()
            const d = p.parseFromString(t, "text/html")
            const newForm = d.querySelector("#mainContent form")

            console.log(form, newForm)

            if (newForm) {

                currentUrl = page.url

                form.closest("div").parentNode.replaceChild(newForm.closest("div"), form.closest("div"))
                form = newForm
                
                form.addEventListener("submit", formReplacer, false)
            }
            else {
                window.location.replace(page.url)
            }
            
        }

        form.addEventListener("submit", formReplacer, false)

    }
}))