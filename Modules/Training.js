Module.add( new Module({
    
    id: "Training",
    name: "Training",
    explanation: `Train your employees. First option will determine how many weeks the training should be. The second option 'Threshold' is a multiplier of the city average the current salary should be to be send to training. The default is 0.9, meaning that if the salary is less than 90% of city average the employees will not be send to training. The third option 'Skill Gain' sets a minimum amount of skill to be gained after the training is complete. With a default of 0.05 it means that the subdivision will only be set on training if after the complete training, the skill will increase with at least 0.05. The last option, 'Payback', is the maximum number of days the training should be 'payed back'. It will calculate the reduction of salary if the training is complete, and compares that to the training costs. A number of 365 means that training will only take place if after 365 updates, the total saved salary higher is than the training costs. If the Payback value is set to zero, the script will ignore this restriction.`,
    subTypes: ['animalfarm', 'apiary', 'coal_power', 'cellular', 'farm', 'fishingbase', 'fitness', 'fuel', 'hairdressing', 'incinerator_power', 'kindergarten', 'lab', 'laundry', 'medicine', 'mill', 'mine', 'network', 'office', 'oil_power', 'oilpump', 'orchard', 'repair', 'restaurant', 'sawmill', 'shop', 'sun_power', 'workshop'],
    predecessors: ["Salary"],
    options: [         
        new Option({
            id: "duration",
            name: "Duration",
            type: "select",
            start: "four",
            values: [
                new Value({ id: "one", name: "1" }),
                new Value({ id: "two", name: "2" }),
                new Value({ id: "three", name: "3" }),
                new Value({ id: "four", name: "4" }),
            ]
        }),
        new Option({
            id: "threshold",
            name: "Threshold",
            type: "textbox",
            format: "Float",
            start: 0.9
        }),        
        new Option({
            id: "skillGain",
            name: "Skill Gain",
            type: "textbox",
            format: "Float",
            start: 0.05
        }),        
        new Option({
            id: "payback",
            name: "Payback",
            type: "textbox",
            format: "Float",
            start: 365
        })
    ],
    stats: [
        new Stat({ id : "trainings", display : "Trainings Begun", format : "Plain"}),
        new Stat({ id : "employees", display : "Employees to training", format : "Plain"}),
        new Stat({ id : "weeks", display : "Weeks of training", format : "Plain"}),
    ],
    precleaner: ["EmployeeList"],
    execute: async function(domain, realm, companyid, subid, type, choice){
        
        const getDuration = () => {
            switch(choice.duration){
                case "one": return 1;
                case "two": return 2;
                case "three": return 3;
                case "four": return 4;
                default: console.error("Training duration error");
            }
        }

        const checkThreshold = (employeeList, subIndex) => {
            //Check if the salary is high enough compared to city average
            const thresholdMultiplier = choice.threshold;
            if (employeeList.salaryWorking[subIndex] > employeeList.salaryCity[subIndex] * thresholdMultiplier)
                return true;
            else
                return false;

        }

        const getNewSkill = async (employeesWorking, duration) => {

            const data = {
                employees: employeesWorking,
                weeks: duration
            }
            const f = await Page.get("TrainingLevel").send(data, domain, realm, subid);
            return f.employees_level;

        }

        const checkSkillGain = async (employeeList, subIndex, duration) => {

            const skillGain = choice.skillGain;

            //Setting it to zero means off
            if(!skillGain)
                return true;

            const e = employeeList.employeesWorking[subIndex];            
            const newSkill = await getNewSkill(e, duration);
            const oldSkill = employeeList.skillWorking[subIndex];

            if(newSkill - oldSkill > skillGain)
                return true;
            else 
                return false;

        }

        const checkPayback = async (employeeList, subIndex, duration) => {

            const paybackPeriod = choice.payback;
            if (!paybackPeriod)
                return true;

            const workingEmpl = employeeList.employeesWorking[subIndex];
            const p = getNewSkill(workingEmpl, duration);
            const q = Page.get("TrainingWindow").load(domain, realm, subid);
            const newSkill = await p;
            const trainingWindow = await q;

            const citySkill = trainingWindow.skillCity;
            const currentSalary = employeeList.salaryWorking[subIndex];
            const citySalary = employeeList.salaryCity[subIndex];
            const currentSkill = employeeList.skillWorking[subIndex];
            //Calculate the salary as if the training completed, and we reduce the salary to match the current skill
            const improvedSalary = Formulas.salary( currentSalary, citySalary, newSkill, citySkill, currentSkill );
            const gainedSalary = currentSalary - improvedSalary;

            const totalTrainingCosts = trainingWindow.trainingCosts * duration / workingEmpl;
            const totalSalaryGained = gainedSalary * choice.payback;

            if(totalSalaryGained > totalTrainingCosts)
                return true;
            else 
                return false
        }

        const determineTraining = async (employeeList, subIndex, duration) => {

            //Already on training does not have to be send to training
            if(employeeList.onTraining[subIndex])
                return false;

            const satisfiesThreshold = checkThreshold(employeeList, subIndex);
            const satisfiesSkillGain = await checkSkillGain(employeeList, subIndex, duration);
            const satisfiesPayback = await checkPayback(employeeList, subIndex, duration);

            if(satisfiesThreshold && satisfiesSkillGain && satisfiesPayback)
                return true;
            else
                return false;
        }

        const updateStats = (duration, numEmployees) => {
            Results.addStats(this.id, "trainings", 1);
            Results.addStats(this.id, "employees", numEmployees);
            Results.addStats(this.id, "weeks", numEmployees * duration);
        }
        
        const employeeList = await Page.get("EmployeeList").load(domain, realm, companyid);
        const subIndex = employeeList.subid.indexOf(subid);
        const duration = getDuration();
        const goesTraining = await determineTraining(employeeList, subIndex, duration);

        if(goesTraining){

            const employees = employeeList.employeesWorking[subIndex];
            const data = {
                "unitEmployeesData[time_count]": duration,
                "unitEmployeesData[employees]": employees
            }

            await Page.get("TrainingWindow").send(data, domain, realm, subid);
            updateStats(duration, employees);
        }

    }
}));