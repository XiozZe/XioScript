// ==UserScript==
// @name           XioScript
// @namespace      Virtonomics
// @description    XioScript using XioLibraries
// @version        10.0
// @require        http://ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js
// @require        http://ajax.googleapis.com/ajax/libs/jqueryui/1.11.0/jquery-ui.min.js
// @require        https://raw.githubusercontent.com/XiozZe/XioScript/masterXSCF.js
// @require        https://raw.githubusercontent.com/XiozZe/XioScript/masterXSML.js
// @require        https://raw.githubusercontent.com/XiozZe/XioScript/masterXSCL/SupplyXioStock.js
// @require        https://raw.githubusercontent.com/XiozZe/XioScript/masterXSCL/ZeroPrice.js
// @require        https://raw.githubusercontent.com/XiozZe/XioScript/masterXSCL/PrimeCostPrice.js
// @require        https://raw.githubusercontent.com/XiozZe/XioScript/masterXSCL/PriceEmptyStock.js
// @require        https://raw.githubusercontent.com/XiozZe/XioScript/masterXSCL/NotForSale.js
// @require        https://raw.githubusercontent.com/XiozZe/XioScript/masterXSCL/ToAnyCostumer.js
// @require        https://raw.githubusercontent.com/XiozZe/XioScript/masterXSCL/ToMyCompany.js
// @require        https://raw.githubusercontent.com/XiozZe/XioScript/masterXSCL/ToCorporation.js
// @require        https://raw.githubusercontent.com/XiozZe/XioScript/masterXSCL/FullService.js
// @require        https://raw.githubusercontent.com/XiozZe/XioScript/masterXSCL/RequiredAds.js
// @require        https://raw.githubusercontent.com/XiozZe/XioScript/masterXSCL/CancelAds.js
// @require        https://raw.githubusercontent.com/XiozZe/XioScript/masterXSCL/RequiredSalary.js
// @require        https://raw.githubusercontent.com/XiozZe/XioScript/masterXSCL/FullTraining.js
// @require        https://raw.githubusercontent.com/XiozZe/XioScript/masterXSCL/HolidayOn.js
// @require        https://raw.githubusercontent.com/XiozZe/XioScript/masterXSCL/HolidayOff.js
// @require        https://raw.githubusercontent.com/XiozZe/XioScript/masterXSCL/EquipmentImproveRepair.js
// @resource       jQuiCss     http://ajax.googleapis.com/ajax/libs/jqueryui/1.11.0/themes/smoothness/jquery-ui.css
// @resource       myCss       https://raw.githubusercontent.com/XiozZe/XioScript/master/XSCSS.css
// @include        http://*virtonomic*.*/*/*
// @exclude        http://virtonomics.wikia.com*
// @grant          GM_getResourceText
// @grant          GM_addStyle
// ==/UserScript==

this.$ = this.jQuery = jQuery.noConflict(true);

var developer = false;

window.addEventListener("load", XioScript);