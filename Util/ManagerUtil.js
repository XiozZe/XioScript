const ManagerUtil = {

    getLevel: async (domain, realm, type) => {        
        const qualification = await Page.get("Qualification").load(domain, realm);
        const image = SubTypes.getManagerImg(type);
        return ListUtil.restructById("image", qualification)[image].base;
    },

    getBonus: async (domain, realm, type) => {        
        const qualification = await Page.get("Qualification").load(domain, realm);
        const image = SubTypes.getManagerImg(type);
        return ListUtil.restructById("image", qualification)[image].bonus;
    },

    getManagerLevel: async (domain, realm, type, bonus) => {
        if (bonus) {
            return await getLevel(domain, realm, type) + await getBonus(domain, realm, type)
        }
        else {
            await getLevel(domain, realm, type)
        }
    },

    //Needs the UnitSummary page of a subdivision, and a boolean of whether to use bonus qualification
    getManagerLimits: async (unitSummary, bonus) => {
        
        const type = unitSummary.symbol
        const c = bonus ? unitSummary.competence_value : unitSummary.competence_value_wo_bonus        
        const managerLevel = parseInt(c)
        const factor1 = SubTypes.getTop1(type)
        const factor3 = SubTypes.getTop3(type)

        if (!SubTypes.checkType(type) || !managerLevel || !factor1 || !factor3) {
			const s = "TopManagerStats Error: Info about this type of subdivision is unkwown"
			console.error(s)
			return {}
        }

		const employeeCount = parseFloat(unitSummary.employee_count)
        const employeeLevel = parseFloat(unitSummary.employee_level)
        const equipmentMax = parseFloat(unitSummary.equipment_max)
        const techLevel = parseFloat(unitSummary.technology_level)
        
        const data = {
            maxTotalEmployees: Formulas.allEmployees(factor3, managerLevel),
            maxEmployees: Formulas.employees(employeeLevel, factor1, managerLevel),
            maxQualification: Formulas.skill(employeeCount, factor1, managerLevel)
        }

        if (equipmentMax) {
            data.maxEquipment = Formulas.equipment(data.maxQualification)
        }
        if (techLevel) {
            data.maxTechnologyLevel = Formulas.techLevel(managerLevel)
        }

        return data
    }

}