// ==UserScript==
// @name           XioScript
// @namespace      Virtonomics
// @description    XioScript using XioLibraries
// @version        10.0
// @require        http://ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js
// @require        http://ajax.googleapis.com/ajax/libs/jqueryui/1.11.0/jquery-ui.min.js
// @require        https://raw.githubusercontent.com/XiozZe/XioScript/XSCF.js
// @require        https://raw.githubusercontent.com/XiozZe/XioScript/XSML.js
// @require        https://raw.githubusercontent.com/XiozZe/XioScript/XSCL/SupplyXioStock.js
// @require        https://raw.githubusercontent.com/XiozZe/XioScript/XSCL/ZeroPrice.js
// @require        https://raw.githubusercontent.com/XiozZe/XioScript/XSCL/PrimeCostPrice.js
// @require        https://raw.githubusercontent.com/XiozZe/XioScript/XSCL/IPPrice.js
// @require        https://raw.githubusercontent.com/XiozZe/XioScript/XSCL/30IPPrice.js
// @require        https://raw.githubusercontent.com/XiozZe/XioScript/XSCL/CTIEPrice.js
// @require        https://raw.githubusercontent.com/XiozZe/XioScript/XSCL/ProfitTaxPrice.js
// @require        https://raw.githubusercontent.com/XiozZe/XioScript/XSCL/PriceEmptyStock.js
// @require        https://raw.githubusercontent.com/XiozZe/XioScript/XSCL/NotForSale.js
// @require        https://raw.githubusercontent.com/XiozZe/XioScript/XSCL/ToAnyCostumer.js
// @require        https://raw.githubusercontent.com/XiozZe/XioScript/XSCL/ToMyCompany.js
// @require        https://raw.githubusercontent.com/XiozZe/XioScript/XSCL/ToCorporation.js
// @require        https://raw.githubusercontent.com/XiozZe/XioScript/XSCL/FullService.js
// @require        https://raw.githubusercontent.com/XiozZe/XioScript/XSCL/RequiredAds.js
// @require        https://raw.githubusercontent.com/XiozZe/XioScript/XSCL/CancelAds.js
// @require        https://raw.githubusercontent.com/XiozZe/XioScript/XSCL/RequiredSalary.js
// @require        https://raw.githubusercontent.com/XiozZe/XioScript/XSCL/TopSalary.js
// @require        https://raw.githubusercontent.com/XiozZe/XioScript/XSCL/BonusSalary.js
// @require        https://raw.githubusercontent.com/XiozZe/XioScript/XSCL/FullTraining.js
// @require        https://raw.githubusercontent.com/XiozZe/XioScript/XSCL/HolidayOn.js
// @require        https://raw.githubusercontent.com/XiozZe/XioScript/XSCL/HolidayOff.js
// @require        https://raw.githubusercontent.com/XiozZe/XioScript/XSCL/EquipmentImproveRepair.js
// @require        https://raw.githubusercontent.com/XiozZe/XioScript/XSCL/DeleteSubdivision.js
// @require        https://raw.githubusercontent.com/XiozZe/XioScript/XSEL/TopManagerStats.js
// @resource       jQuiCss     https://raw.githubusercontent.com/XiozZe/XioScript/master/jquery-ui.css
// @resource       myCss       https://raw.githubusercontent.com/XiozZe/XioScript/master/XSCSS.css
// @include        http://*virtonomic*.*/*/*
// @exclude        http://virtonomics.wikia.com*
// @grant          GM_getResourceText
// @grant          GM_addStyle
// ==/UserScript==

this.$ = this.jQuery = jQuery.noConflict(true);

var developer = false;

window.addEventListener("load", XioScript);