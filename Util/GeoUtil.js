const GeoUtil = {

    getGeoIdFromSubid: async (domain, realm, companyid, subid) => {
        const companySummary = await Page.get("CompanySummary").load(domain, realm, companyid)
        const cityName = companySummary.data[subid].city_name
        return await GeoUtil.getGeoIdFromCityName(domain, realm, cityName)
    },

    getGeoIdFromCityName: async (domain, realm, cityName) => {
        const cityOverview = await Page.get("CityOverview").load(domain, realm)
        const city = Object.keys(cityOverview).map(k => cityOverview[k]).find(o => o.city_name === cityName)
        return {
            cityId: city.city_id,
            regionId: city.region_id,
            countryId: city.country_id
        }
    }    

}