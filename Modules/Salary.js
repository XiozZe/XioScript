Module.add( new Module({
    
    id: "Salary",
    name: "Salary",
    explanation: `Sets the salary of the employees. The first option is the value of the salary in dollars, with Minimum = 80% of the city average, City Average = 100% of the city average, and Required is the salary to match the required skill. The required salary cannot go below 80% of the city average. The next option is the maximum salary the script is allowed to set, in order to protect you from extremely high values. Default input is 5000 meaning the salary cannot go beyond 5000 dollars. Note that if you set the maximum to zero nothing happens, because you can't set the salary to zero.`,
    subTypes: ['animalfarm', 'apiary', 'coal_power', 'cellular', 'farm', 'fishingbase', 'fitness', 'fuel', 'hairdressing', 'incinerator_power', 'kindergarten', 'lab', 'laundry', 'medicine', 'mill', 'mine', 'network', 'office', 'oil_power', 'oilpump', 'orchard', 'repair', 'restaurant', 'sawmill', 'shop', 'sun_power', 'workshop'],
    predecessors: ["Equipment"],
    options: [         
        new Option({
            id: "salary",
            name: "Salary",
            type: "select",
            start: "required",
            values: [
                new Value({ id: "minimum", name: "Minimum" }),
                new Value({ id: "required", name: "Required" }),
                new Value({ id: "city", name: "City Average" }),
            ]
        }),
        new Option({
            id: "maximum",
            name: "Maximum",
            type: "textbox",
            format: "Float",
            start: 5000
        }),
    ],
    stats: [
        new Stat({ id: "salary", display: "Salaries Set", format: "Plain"}),
        new Stat({ id: "raise", display: "Loan Raises", format: "Plain"}),
        new Stat({ id: "cut", display: "Loan Cuts", format: "Plain"})
    ],
    precleaner: ["EmployeeList"],
    execute: async function(domain, realm, companyid, subid, type, choice){

        const determineSalaryValue = async (employeeInfo) => {
            const minimumSalary = (employeeInfo.salaryCity+0.005) * 0.8
            switch(choice.salary){
                case "minimum": 
                    return minimumSalary
                case "required":
                    const cityOverview = await Page.get("CityOverview").load(domain, realm)
                    const {cityId} = await GeoUtil.getGeoIdFromSubid(domain, realm, companyid, subid)
                    const citySkill = parseFloat(cityOverview[cityId].education)
                    const sw = employeeInfo.salaryWorking
                    const sc = employeeInfo.salaryCity
                    const kw = employeeInfo.skillWorking
                    const kr = employeeInfo.skillRequired
                    const requiredSalary = Formulas.salary( sw, sc, kw, citySkill, kr )
                    return Math.max(minimumSalary, requiredSalary)
                case "city":
                    return employeeInfo.salaryCity
                default:
                    console.error("The salary module does not recognize this choice for salary: "+choice.salary) 
            }
        }

        const determineMaximumSalary = () => {
            return choice.maximum
        }

        const determineSalary = async (employeeInfo) => {

            if (!employeeInfo.employeesWorking) {
                return 0
            }

            let salary = await determineSalaryValue(employeeInfo)
            const maxSalary = determineMaximumSalary()
            salary = Math.min(salary, maxSalary)
            salary = Math.ceil(salary*100)/100
            return salary
        }

        const updateStats = (newSalary, oldSalary) => {
           
            if (newSalary > oldSalary) {
                Results.addStats(this.id, "salary", 1)
                Results.addStats(this.id, "raise", 1)
            }
            else if (newSalary < oldSalary) {
                Results.addStats(this.id, "salary", 1)
                Results.addStats(this.id, "cut", 1)
            }
        }

        const employeeList = await Page.get("EmployeeList").load(domain, realm, companyid)

        //For the training module
        employeeList.salaryModule = true

        const r = ListUtil.restructById("subid", employeeList)
        const employeeInfo = r[subid]
        const oldSalary = employeeInfo.salaryWorking
        const newSalary = await determineSalary(employeeInfo)

        if (newSalary !== oldSalary) {

            const data = {
                "unitEmployeesData[quantity]": employeeInfo.employeesWorking,
                "unitEmployeesData[salary]": newSalary
            }

            await Page.get("SalaryWindow").send(data, domain, realm, subid)
            updateStats(newSalary, oldSalary)
        }

    }
}))