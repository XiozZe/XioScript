const GeoUtil = {

    getGeoId: async (domain, realm, companyid, subid) => {
        const unitListPromise = Page.get("UnitList").load(domain, realm, companyid);
        const laborPromise = Page.get("Labor").load(domain, realm);
        const unitList = await unitListPromise;
        const unitListIndex = unitList.subid.indexOf(subid);
        const cityName = unitList.cityName[unitListIndex];
        const labor = await laborPromise;
        const laborCity = Object.keys(labor.data).map(key => labor.data[key]).find(obj => obj.name === cityName);
        return {
            cityId: laborCity.id,
            regionId: laborCity.region_id, 
            countryId: laborCity.country_id
        };
    }
    

}