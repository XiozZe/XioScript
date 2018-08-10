Module.add( new Module({
    
    id: "Employee",
    name: "Employee",
    explanation: `Changes the number of employees of a subdivision given by 'Number'. If set to 'current', it doesn't do anything. If set to 'Maximum' it will hire the maximum number of employees.`,
    subTypes: ['animalfarm', 'apiary', 'coal_power', 'cellular', 'farm', 'fishingbase', 'fitness', 'fuel', 'hairdressing', 'incinerator_power', 'kindergarten', 'lab', 'laundry', 'medicine', 'mill', 'mine', 'network', 'office', 'oil_power', 'oilpump', 'orchard', 'repair', 'restaurant', 'sawmill', 'shop', 'sun_power', 'workshop'],
    predecessors: [],
    options: [                 
        new Option({
            id: "number",
            name: "Number",
            type: "select",
            start: "current",
            values: [
                new Value({ id: "current", name: "Current" }),
                new Value({ id: "maximum", name: "Maximum" }),
            ]
        }),
    ],
    stats: [
        new Stat({ id: "hired", display: "Employees Hired", format: "Plain"}),
        new Stat({ id: "fired", display: "Employees Fired", format: "Plain"})
    ],
    precleaner: ["EmployeeList", "EquipmentList"],
    execute: async function(domain, realm, companyid, subid, type, choice){

        const updateStats = (oldEmployees, newEmployees) => {
           
            if (newEmployees > oldEmployees) {
                Results.addStats(this.id, "hired", newEmployees - oldEmployees)
            }
            else if (newEmployees < oldEmployees) {                
                Results.addStats(this.id, "fired", oldEmployees - newEmployees)
            }

        }

        const getNewEmployees = (employeeInfo) => {

            switch (choice.number) {
                case "current": return employeeInfo.employeesWorking                
                case "maximum": return employeeInfo.employeesMaximum
                default: Results.errorLog(`Employees Module does not know the setting ${choice.number} for employees`)
            }

        }

        const employeeList = await Page.get("EmployeeList").load(domain, realm, companyid)
        const r = ListUtil.restructById("subid", employeeList)
        const employeeInfo = r[subid]

        const oldEmployees = employeeInfo.employeesWorking
        const newEmployees = await getNewEmployees(employeeInfo)
        const salary = employeeInfo.salaryWorking || employeeInfo.salaryCity

        if (newEmployees !== oldEmployees) {
            const data = {
                "unitEmployeesData[quantity]": newEmployees,
                "unitEmployeesData[salary]": salary
            }
            await Page.get("SalaryWindow").send(data, domain, realm, subid)
            updateStats(oldEmployees, newEmployees)
        }
    }
}))