// ==UserScript==
// @name           XioScript
// @namespace      Virtonomics
// @description    XioScript using XioLibraries
// @version        10.0
// @require        http://ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js
// @require        http://ajax.googleapis.com/ajax/libs/jqueryui/1.11.0/jquery-ui.min.js
// @require        https://raw.githubusercontent.com/XiozZe/XioScript/master/XSCF.js
// @require        https://raw.githubusercontent.com/XiozZe/XioScript/master/XSML.js
// @require        https://raw.githubusercontent.com/XiozZe/XioScript/master/XSCL/SupplyXioStock.js
// @require        https://raw.githubusercontent.com/XiozZe/XioScript/master/XSCL/ZeroPrice.js
// @require        https://raw.githubusercontent.com/XiozZe/XioScript/master/XSCL/ToMyCompany.js
// @require        https://raw.githubusercontent.com/XiozZe/XioScript/master/XSCL/PriceOnStock.js
// @require        https://raw.githubusercontent.com/XiozZe/XioScript/master/XSCL/FullService.js
// @require        https://raw.githubusercontent.com/XiozZe/XioScript/master/XSCL/RequiredSalary.js
// @require        https://raw.githubusercontent.com/XiozZe/XioScript/master/XSCL/PrimeCostPrice.js
// @require        https://raw.githubusercontent.com/XiozZe/XioScript/master/XSCL/FullTraining.js
// @require        https://raw.githubusercontent.com/XiozZe/XioScript/master/XSCL/EquipmentImproveRepair.js
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