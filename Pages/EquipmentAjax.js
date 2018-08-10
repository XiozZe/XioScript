//This is the place where we send data to to buy, remove or repair equipment
Page.add(new Page({

    id: "EquipmentAjax",

    getUrl: (domain, realm) => {
        return `${domain}/${realm}/ajax/unit/supply/equipment`;
    }

}))

/**
 * This format has to be send:
 * 
 * {
 *     operation : "repair", //or "terminate" or "buy"
 *     offer : 3694847, //doesn't exist if operation is terminate
 *     unit : 123456,
 *     supplier : 3694847, //doesn't exist if operation is terminate
 *     amount : 5
 * } 
 */