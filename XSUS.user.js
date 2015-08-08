// ==UserScript==
// @name           XioScript
// @namespace      Virtonomics
// @description    XioScript using XioLibraries
// @version        10.0
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
// @include        http://*virtonomic*.*/*/*
// @exclude        http://virtonomics.wikia.com*
// ==/UserScript==

var script = document.createElement("script");
script.textContent = '(' + XioScript.toString() + ')();';
document.documentElement.appendChild(script);