const ListUtil = {

    /**
     * Restructures an object of arrays that look like this:
     * {
     *      subid: [33333, 33334, 33335],
     *      salary: [100, 120, 110],
     *      education: [5.6, 8.2, 6.7]
     * }
     * 
     * to this:
     * 
     * {
     *     33333: {
     *          subid: 3333
     *          salary: 100
     *          education: 5.6
     *     }
     *     33334 : {
     *          ...
     *     },
     *     ...
     * }
     * 
     * Where keyid is the keyname of id, in the above example 'subid'
     * If you pass an object with arrays that have a different length then 'subid', these will be ignored.
     */
    restructById: (keyid, scrapedObject) => {

        const length = scrapedObject[keyid].length;
        const o = {};
        for(const id of scrapedObject[keyid]){
            o[id] = {};
        }

        for(const key in scrapedObject){
            if(Array.isArray(scrapedObject[key]) && scrapedObject[key].length === length){
                for(let i = 0; i < length; i++){
                    const id = scrapedObject[keyid][i];
                    const value = scrapedObject[key][i];
                    o[id][key] = value;
                }
            }
        }

        return o;
    }

}