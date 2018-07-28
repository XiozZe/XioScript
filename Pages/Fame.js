//Ajax thingie that can calculate what happens with advertisement budgets
Page.add(new Page({

    id: "Fame",

    getUrl: (domain, realm, subid) => {
        return `${domain}/${realm}/ajax/unit/virtasement/${subid}/fame`
    }

}));

/**
 * You send:
 * {
 *      moneyCost: 0,
 *      population: 32423423,
 *      type[0]: 2264
 * 
 * }
 * 
 * It returns:
 * {
 *      "contactCost":0,
 *      "minCost":0,
 *      "population":null,
 *      "contactCount":0,
 *      "totalCost":0,
 *      "productivity":0
 * } 
 */