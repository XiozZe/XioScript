Extension.add( new Extension ({

	id: "TopManagerStats",
	name: "Top Manager Stats",
	explanation: `This adds some TOP1 and TOP3 stats for the top manager on the main page of a subdivision. It doesn't look really pretty, especially the old style subdivisions, but at least it's language independent. With the 'Bonus' option, you can toggle whether the bonus qualification should be included in the calculation.`,
	test: () => {
		const isMainPage = Page.get("Main").test(document, document.URL)
		const newInterfaceEmployees = document.extract(".fa-users").length === 1
		const oldInterfaceEmployees = document.extract("[href*='/window/unit/employees/engage/']").length >= 1
		return isMainPage && (newInterfaceEmployees || oldInterfaceEmployees)
	},
	options: [
		new Option({
			id: "bonus", 
			name: "Bonus", 
			type: "select", 
			start: "on",
			values: [
				new Value({ id: "on", name: "On" }),
				new Value({ id: "off", name: "Off" })
			]
		}),
	],
	execute: async (choice) => {

		const addRow = ({text, value, rowBefore}) => {
			const row = document.createElement("tr")
			const td1 = row.createChild("td")
			td1.innerText = text
			td1.classList.add("XioTopManagerStats")
			const td2 = row.createChild("td")
			td2.innerText = value
			rowBefore.parentNode.insertBefore(row, rowBefore.nextElementSibling)
			return row
		}

		const domain = Vital.getDomain()
		const realm = Vital.getRealm()
		const subid = document.URL.match(/\d+/)[0]		
		const bonus = choice.bonus === "on"

        const unitSummary = await Page.get("UnitSummary").load(domain, realm, subid)
		const managerInfo = await ManagerUtil.getManagerLimits(unitSummary, bonus)
			
		const maxEmployeesString = managerInfo.maxTotalEmployees.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")
		const qualificationString = (Math.floor(managerInfo.maxQualification*100)/100).toFixed(2)
		const employeesString = Math.floor(managerInfo.maxEmployees).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")
		const equipmentString = (Math.floor(managerInfo.maxEquipment*100)/100).toFixed(2)
		const technologyString = Math.floor(managerInfo.maxTechnologyLevel)
		
		const newInterfaceEmployees = document.extract(".fa-users").length === 1

		if (newInterfaceEmployees) {

			const managementRow = document.querySelector(".fa-user").closest(".unit_box").querySelector("tr:nth-child(3)")
			addRow({
				text: "Maximum number of employees company-wide",
				value: maxEmployeesString,			
				rowBefore: managementRow
			})

			const employeeRow = document.querySelector(".fa-users").closest(".unit_box").querySelector("tr:nth-child(5)")
			const r = addRow({
				text: "Maximum number of employees with current qualification",
				value: employeesString,
				rowBefore: employeeRow
			})
			addRow({
				text: "Maximum qualification with current number of employees",
				value: qualificationString,
				rowBefore: r
			})

			if (managerInfo.maxEquipment) {
				const equipRow = document.querySelector(".fa-cogs").closest(".unit_box").querySelector("tr:nth-child(4)")
				addRow({
					text: "Maximum equipment quality with current number of employees to ensure low enough employee qualification",
					value: equipmentString,
					rowBefore: equipRow
				})
			}

			if (managerInfo.maxTechnologyLevel) {
				const techRow = document.querySelector(".fa-industry").closest(".unit_box").querySelector("tr:nth-child(4)")
				addRow({
					text: "Maximum technology level",
					value: technologyString,
					rowBefore: techRow
				})
			}

		}
		else {
			
			let row = document.querySelector("[href*=productivity_info]").closest("tr")
			row = addRow({
				text: "Maximum number of employees company-wide",
				value: maxEmployeesString,			
				rowBefore: row
			})
			row = addRow({
				text: "Maximum number of employees with current qualification",
				value: employeesString,
				rowBefore: row
			})
			row = addRow({
				text: "Maximum qualification with current number of employees",
				value: qualificationString,
				rowBefore: row
			})

			if (managerInfo.maxEquipment) {
				row = addRow({
					text: "Maximum equipment quality with current number of employees to ensure low enough employee qualification",
					value: equipmentString,
					rowBefore: row
				})
			}

			if (managerInfo.maxTechnologyLevel) {
				addRow({
					text: "Maximum technology level",
					value: technologyString,
					rowBefore: row
				})
			}

			for (const e of document.getElementsByClassName("XioTopManagerStats")) {
				e.style.fontWeight = "bold"
			}

		}

}}))
