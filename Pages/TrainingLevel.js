//One of virtonomics Ajax calls. Only meant to get data from by sending data to
Page.add(new Page({

    id: "TrainingLevel",

    getUrl: (domain, realm, subid) => {
        return `${domain}/${realm}/ajax/unit/employees/calc_new_lvl_after_train/${subid}`;
    }

}))

/**
 * Send something with structure:
 * {
 *    employees: 300
 *    weeks: 4
 * }
 * 
 * and you get back:
 * 
 * {
*     employee_level: 9.56
 * }
 * 
 * which is the new skill of the employees after 4 weeks
 * 
 */
