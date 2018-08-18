Module.add( new Module({

    id: "Holiday",
    name: "Holiday",
    explanation: `This function will turn the holiday for workers on and off. If 'Base' is set to holiday, the subdivision will go on holiday. If set to working, holiday will be off. Exceptions are made for certain buildings: if 'Stock' is set to 'Holiday' the subdivision will go on holiday if there are no goods of one of the items in stock (Production), and this overrides the 'Working' setting of 'Base'. Same thing for laboratories: 'Research' to 'Holiday' will force a laboratory to holiday if no research is being done or if no subdivision is attached.	`,
    subTypes: ['animalfarm', 'apiary', 'coal_power', 'cellular', 'farm', 'fishingbase', 'fitness', 'fuel', 'hairdressing', 'incinerator_power', 'kindergarten', 'lab', 'laundry', 'medicine', 'mill', 'mine', 'network', 'office', 'oil_power', 'oilpump', 'orchard', 'repair', 'restaurant', 'sawmill', 'shop', 'sun_power', 'workshop'],
    options: [
        new Option({
            id: "base",
            name: "Base",
            type: "select",
            start: "working",
            values: [
                new Value({ id: "holiday", name: "Holiday" }),
                new Value({ id: "working", name: "Working" })
            ]
        }),        
        new Option({
            id: "stock",
            name: "Stock",
            type: "select",
            start: "ignore",
            values: [
                new Value({ id: "holiday", name: "Holiday" }),
                new Value({ id: "ignore", name: "Ignore" })
            ]
        }),
        new Option({
            id: "research",
            name: "Research",
            type: "select",
            start: "ignore",
            values: [
                new Value({ id: "holiday", name: "Holiday" }),
                new Value({ id: "ignore", name: "Ignore" })
            ]
        })
    ],
    predecessors: ["ProductionSupply", "Research"],
    stats: [
        new Stat({ id: "holiday", display: "Send on Holiday", format: "Plain" }),
        new Stat({ id: "working", display: "Returned to Work", format: "Plain" })
    ],
    precleaner: [],
    execute: async function(domain, realm, companyid, subid, type, choice) {
        
        //Not finished: need Retail And Service supply

        const isOnHoliday = async () => {
            const employeeList = await Page.get("EmployeeList").load(domain, realm, companyid)
            const index = employeeList.subid.indexOf(subid)
            return employeeList.onHoliday[index]
        }

        let prodSupplyToHoliday = async () => {

            if (choice.stock === "ignore") return false

            const supply = await Page.get("FactorySupply").load(domain, realm, subid)
            const lowestAmount = Math.min(...supply.goodsBased.quantity)

            if (lowestAmount === 0) return true
            else return false

        }

        const researchToHoliday = async () => {

            if (choice.research === "ignore") return false

            const lab = await Page.get("Laboratory").load(domain, realm, subid)
            return lab.isFree || lab.hasAbsentFactory

        }

        const goingOnHoliday = async () => {

            let toHoliday = false
            if (choice.base === "holiday") {
                toHoliday = true
            }

            if (Module.get("Research").subTypes.includes(type)) {
                toHoliday = toHoliday || await researchToHoliday()
            } 
            else if (Module.get("ProductionSupply").subTypes.includes(type)) {
                toHoliday = toHoliday || await prodSupplyToHoliday()
            }
            
            return toHoliday
        }
        
        if(!await isOnHoliday() && await goingOnHoliday()){
            await Page.get("HolidaySet").load(domain, realm, subid)
            Results.addStats(this.id, "holiday", 1)
        } 
        else if(await isOnHoliday() && !await goingOnHoliday()){			
            await Page.get("HolidayUnset").load(domain, realm, subid)
            Results.addStats(this.id, "working", 1)
        }
        
    }
}))