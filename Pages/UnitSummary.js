//This is the place we can refresh the "UnitSummary" page in order to have the latest data
//Instead of cleaning, this page always cleans before loading because of caching problems
Page.add(new Page({

    id: "UnitSummary",

    getUrl: (domain, realm, subid) => {
        return `${domain}/api/${realm}/main/unit/summary?id=${subid}`
    }   
    
}))

/*
 * Having a seperate cleaning function is not safe: if the UnitSummary is loaded
 * by an external source (or just this script before a page load) it means that
 * old outdated information is in cache. Therefore we always clean.
 */
Page.get("UnitSummary").load = async function (domain, realm, subid) {
    Page.prototype.clean.call(this, domain, realm, subid)
    await APIUtil.cleanUnitSummary(domain, realm, subid)
    return await Page.prototype.load.call(this, domain, realm, subid)
}

/* 
Has the following layout:

{
  "id": "2248440",
  "size": "50",
  "unit_class_kind": "workshop",
  "unit_type_produce_name": "Canned meat ",
  "technology_level": "18",
  "equipment_count": "5000",
  "equipment_max": "5000",
  "equipment_quality": "30.26",
  "equipment_quality_required": "30.22",
  "equipment_wear": "0.14",
  "employee_count": "5000",
  "employee_max": "5000",
  "employee_required_by_equipment": "5000",
  "employee_salary": "400.00",
  "city_salary": "264.44",
  "salary_cost": "2000000.00",
  "employee_level": "17.9",
  "city_education": "8.07",
  "employee_level_required": "10.1",
  "office_productivity": "1",
  "equipment_productivity": "1",
  "employee_productivity": "1",
  "manager_productivity": "1",
  "knowledge_area_id": "2231",
  "knowledge_area_name": "Production",
  "knowledge_area_kind": "manufacture",
  "competence_value": "61",
  "competence_value_wo_bonus": "56",
  "all_staff": "25000",
  "manager_level_required": "37.3248",
  "productivity": "1",
  "loading": "100.00",
  "upgrade_time_to_finish": "0",
  "upgrade_size": "0",
  "upgrade_unit_type_employee_max": null,
  "supply_warning": "1",
  "training": "7.1712",
  "unit_type_name": null,
  "unit_type_id": "1855",
  "name": "Factory Canned Products",
  "labor_max": "5000",
  "labor_qty": "5000",
  "speedup_cost": 0,
  "company_id": "3395454",
  "user_id": "1036219",
  "unit_type_produce_id": "3899",
  "symbol": "workshop",
  "city_id": "15974",
  "market_price": "0",
  "exclusive_market_price": "0",
  "auction_lot_id": "0",
  "is_bankrupt": "f",
  "on_bill": "f",
  "corp_id": "3030115",
  "office_id": "4096377",
  "on_holiday": "t",
  "is_student": "f",
  "unit_id": null,
  "text": null,
  "office_name": "Office Anatolia",
  "notice": null,
  "already_learn": null
}

*/