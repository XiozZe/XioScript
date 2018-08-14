//Formulas used to calculate values related to Virtonomics
const Formulas = Object.freeze({
	
	// The 'TrainingLevel' can be received from the API or calculated with the function trainingLevel below
	salary: ({skillRequired, trainingLevel, skillCity, salaryCity}) => {
		
		if (skillRequired > trainingLevel + skillCity) {
			return salaryCity * (Math.pow(2, ( skillRequired - trainingLevel ) / skillCity ) - 1)
		}
		else {
			return salaryCity * Math.sqrt( skillRequired / ( skillCity + trainingLevel ) )
		}
	},

	//Better to get this info via the API instead of using this function
	trainingLevel: ({salaryCurrent, salaryCity, skillCurrent, skillCity}) => {
		if (salaryCurrent > salaryCity) {
			return skillCurrent - skillCity * Math.log( 1 + salaryCurrent / salaryCity ) / Math.log(2)
		}
		else {
			return Math.pow( salaryCity / salaryCurrent , 2) * skillCurrent - skillCity
		}
	},

	employees: (skill, factor, manager) => {
		return Math.pow(5,1+skill) * Math.pow(7, 1-skill) * factor * Math.pow(manager, 2)	
	},

	skill: (employees, factor, manager) => {
		return -Math.log(employees/(35*factor*Math.pow(manager, 2)))/Math.log(7/5)
	},

	equip: (skill) => {
		return Math.pow(skill, 1.5)
	},

	techLevel: (manager) => {
		return Math.floor(Math.pow(manager*156.25, 1/3))
	},

	topTech: (tech) => {
		return Math.pow(tech, 3) / 156.25
	},

	allEmployees: (factor, manager) => {
		return 25 * factor * manager * (manager + 3)
	},

	top1: (empl, qual, factor) => {
		return Math.pow(5, 1/2*(-1-qual)) * Math.pow(7, 1/2*(-1+qual)) * Math.sqrt(empl / factor)
	},

	top3: (empl, factor) => {
		return (-15*factor+Math.sqrt(225*factor*factor + 4*factor*empl))/(10*factor)
	},

	efficiency: (employees, allEmployees, manager, factor1, factor3, qualification, techLevel) => {
		
		let effi = []
		effi[0] = 100
		effi[1] = manager / Formulas.top1(employees, qualification, factor1) * Formulas.allEmployees(factor3, manager) / allEmployees * 100
		effi[2] = manager / Formulas.top1(employees, qualification, factor1) * 6/5 * 100
		effi[3] = Formulas.allEmployees(factor3, manager) / allEmployees * 6/5 * 100
		effi[4] = manager / Formulas.topTech(techLevel) * Formulas.allEmployees(factor3, manager) / allEmployees * 100
		effi[5] = manager / Formulas.topTech(techLevel) * 6/5 * 100

		let smallestEffi = effi.reduce((acc, value) => Math.min(acc, value))
		
		return (Math.round(smallestEffi*10)/10).toFixed(2) + "%"
		
	},

	overflowTop1: (allEmployees, factor3, manager) => {
		return Math.max(Math.min(6/5, Formulas.allEmployees(factor3, manager) / allEmployees), 5/6)
	},

	overflowTop3: (employees, qualification, techLevel, factor1, manager) => {
		return Math.max(Math.min(6/5, manager / Formulas.topTech(techLevel), manager / Formulas.top1(employees, qualification, factor1)), 5/6)
	},
	
	maxAdsBudget: (manager) => {
		return 200010 * Math.pow(manager, 1.4)
	}
	
});
