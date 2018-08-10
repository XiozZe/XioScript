//The small popup window where you can set the training.
Page.add(new Page({

    id: "TrainingWindow",

    getUrl: (domain, realm, subid) => {
        return `${domain}/${realm}/window/unit/employees/education/${subid}`;
    },

    scrape: (doc) => ({
        salaryWorking: Tools.parse(doc.extract(".list td")[8].innerText),
        salaryCity: Tools.parse(doc.extract(".list td")[9].innerText.split("$")[1]),
        trainingCosts: Tools.parse(doc.getElementById("educationCost").innerText),
        employeesWorking: Tools.parse(doc.getElementById("unitEmployeesData_employees").value),	
        skillWorking: Tools.parse(doc.extract(".list span")[0].innerText),			
        skillCity: Tools.parse(doc.extract(".list span")[1].innerText),
    })

}))