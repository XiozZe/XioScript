const APIUtil = (() => {

    /**
     * The Unit Summary is only cleaned if the UnitRefresh is called
     */
    const cleanUnitSummary = async (domain, realm, subid) => {
        const token = await Page.get("Token").load(domain, realm)
        const data = {id: subid, token}
        await Page.get("UnitRefresh").send(data, domain, realm)    
    }

    let realmTimes = {}

    /*
     * These three companySummary function are used to bypass a cache problem.
     * If a new subdivision is rented or an old subdivision is removed, the CompanySummary does not see that.
     * That's why we have to force a new page by setting the page size to a unique ID
     * In this case that ID is the time in milliseconds
     * These functions present should not be used: they are build into the CompanySummary standard load and clean functions
     */

    const loadCompanySummary = async function (domain, realm, companyid) {

        if (!realmTimes[realm]) {
            realmTimes[realm] = new Date().getTime()
        }

        return await Page.prototype.load.call(this, domain, realm, companyid, realmTimes[realm])
    }

    const cleanCompanySummary = function (domain, realm, companyid) {
        
        if (realmTimes[realm]) {
            Page.prototype.clean.call(this, domain, realm, companyid, realmTimes[realm])
            delete realmTimes[realm]
        }
    }

    const cleanAllCompanySummary  = () => {
        realmTimes = {}
    }

    return {cleanUnitSummary, loadCompanySummary, cleanCompanySummary, cleanAllCompanySummary}

})()