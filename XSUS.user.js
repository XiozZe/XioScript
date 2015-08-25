// ==UserScript==
// @name           XioScript
// @namespace      Virtonomics
// @description    XioScript using XioLibraries forked by Mike
// @version        10.0
// @require        http://ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js
// @require        http://ajax.googleapis.com/ajax/libs/jqueryui/1.11.0/jquery-ui.min.js
// @require        https://raw.githubusercontent.com/XiozZe/XioScript/master/XSCF.js
// @require        https://raw.githubusercontent.com/XiozZe/XioScript/master/XSML.js
// @exclude        https://raw.githubusercontent.com/XiozZe/XioScript/master/XSCL/SupplyXioStock.js
// @require        https://raw.githubusercontent.com/XiozZe/XioScript/master/XSCL/ZeroPrice.js
// @require        https://raw.githubusercontent.com/XiozZe/XioScript/master/XSCL/PrimeCostPrice.js
// @exclude        https://raw.githubusercontent.com/XiozZe/XioScript/master/XSCL/IPPrice.js
// @exclude        https://raw.githubusercontent.com/XiozZe/XioScript/master/XSCL/30IPPrice.js
// @require        https://raw.githubusercontent.com/XiozZe/XioScript/master/XSCL/CTIEPrice.js
// @exclude        https://raw.githubusercontent.com/XiozZe/XioScript/master/XSCL/ProfitTaxPrice.js
// @require        https://raw.githubusercontent.com/XiozZe/XioScript/master/XSCL/PriceEmptyStock.js
// @exclude        https://raw.githubusercontent.com/XiozZe/XioScript/master/XSCL/NotForSale.js
// @exclude        https://raw.githubusercontent.com/XiozZe/XioScript/master/XSCL/ToAnyCostumer.js
// @require        https://raw.githubusercontent.com/XiozZe/XioScript/master/XSCL/ToMyCompany.js
// @require        https://raw.githubusercontent.com/XiozZe/XioScript/master/XSCL/ToCorporation.js
// @require        https://raw.githubusercontent.com/XiozZe/XioScript/master/XSCL/FullService.js
// @exclude        https://raw.githubusercontent.com/XiozZe/XioScript/master/XSCL/RequiredAds.js
// @exclude        https://raw.githubusercontent.com/XiozZe/XioScript/master/XSCL/CancelAds.js
// @exclude        https://raw.githubusercontent.com/XiozZe/XioScript/master/XSCL/UserAds.js
// @exclude        https://raw.githubusercontent.com/XiozZe/XioScript/master/XSCL/UserCampaign.js
// @exclude        https://raw.githubusercontent.com/XiozZe/XioScript/master/XSCL/RequiredCampaign.js
// @exclude        https://raw.githubusercontent.com/XiozZe/XioScript/master/XSCL/StopCampaign.js
// @exclude        https://raw.githubusercontent.com/XiozZe/XioScript/master/XSCL/UserSalary.js
// @exclude        https://raw.githubusercontent.com/XiozZe/XioScript/master/XSCL/RequiredSalary.js
// @exclude        https://raw.githubusercontent.com/XiozZe/XioScript/master/XSCL/TopSalary.js
// @exclude        https://raw.githubusercontent.com/XiozZe/XioScript/master/XSCL/BonusSalary.js
// @require        https://raw.githubusercontent.com/XiozZe/XioScript/master/XSCL/FullTraining.js
// @require        https://raw.githubusercontent.com/XiozZe/XioScript/master/XSCL/HolidayOn.js
// @require        https://raw.githubusercontent.com/XiozZe/XioScript/master/XSCL/HolidayOff.js
// @require        https://raw.githubusercontent.com/XiozZe/XioScript/master/XSCL/EquipmentImproveRepair.js
// @require        https://raw.githubusercontent.com/XiozZe/XioScript/master/XSCL/ImproveFullRepair.js
// @exclude        https://raw.githubusercontent.com/XiozZe/XioScript/master/XSCL/RequiredFullRepair.js
// @exclude        https://raw.githubusercontent.com/XiozZe/XioScript/master/XSCL/RequiredRepair.js
// @require        https://raw.githubusercontent.com/XiozZe/XioScript/master/XSCL/DeleteSubdivision.js
// @require        https://raw.githubusercontent.com/XiozZe/XioScript/master/XSCL/SubdivisionNameChanger.js
// @require        https://raw.githubusercontent.com/XiozZe/XioScript/master/XSEL/TopManagerStats.js
// @require        https://raw.githubusercontent.com/XiozZe/XioScript/master/XSEL/BrandLink.js
// @require        https://raw.githubusercontent.com/XiozZe/XioScript/master/XSEL/RealmQuality.js
// @require        https://raw.githubusercontent.com/XiozZe/XioScript/master/XSEL/UnitListSubCount.js
// @require        https://raw.githubusercontent.com/XiozZe/XioScript/master/XSEL/BuildShortener.js
// @resource       jQuiCss     https://raw.githubusercontent.com/XiozZe/XioScript/master/jquery-ui.css
// @resource       myCss       https://raw.githubusercontent.com/XiozZe/XioScript/master/XSCSS.css
// @include        http://*virtonomic*.*/*/*
// @exclude        http://virtonomics.wikia.com*
// @grant          GM_getResourceText
// @grant          GM_addStyle
// ==/UserScript==

this.$ = this.jQuery = jQuery.noConflict(true);

var developer = true;

document.onreadystatechange = function () {
    if (document.readyState == "complete") {
        XioScript();
    }
}
document.onreadystatechange();
