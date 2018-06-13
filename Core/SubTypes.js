/**
 * Hardcoded virtonomics subdivision types data
 */
const SubTypes = (() => {

	//the TOP1 modifier, TOP3 modifier and the img for the top manager page
	const types = {
		mine: {name: "Mine", top1: 8, top3: 8, managerImg: "/img/qualification/mining.png"},	
		power: {name: "Power Plant", top1: 6, top3: 6, managerImg: "/img/qualification/power.png"},
		coal_power: {name: "Coal Plant", top1: 6, top3: 6, managerImg: "/img/qualification/power.png"},
		workshop: {name: "Factory", top1: 4, top3: 4, managerImg: "/img/qualification/manufacture.png"},	
		sawmill: {name: "Sawmill", top1: 4, top3: 4, managerImg: "/img/qualification/manufacture.png"},
		farm: {name: "Vegetable Farm", top1: 1.6, top3: 1.6, managerImg: "/img/qualification/farming.png"},
		orchard: {name: "Orchard", top1: 1.2, top3: 1.2, managerImg: "/img/qualification/farming.png"},				
		medicine: {name: "Hospital", top1: 1, top3: 1, managerImg: "/img/qualification/medicine.png"},
		fishingbase: {name: "Fishing Base", top1: 1, top3: 1, managerImg: "/img/qualification/fishing.png"},				
		animalfarm: {name: "Animal Farm", top1: 0.6, top3: 0.6, managerImg: "/img/qualification/animal.png"},
		lab: {name: "Laboratory", top1: 0.4, top3: 0.4, managerImg: "/img/qualification/research.png"},
		mill: {name: "Mill", top1: 0.4, top3: 4, managerImg: "/img/qualification/manufacture.png"},
		restaurant: {name: "Restaurant", top1: 0.4, top3: 0.4, managerImg: "/img/qualification/restaurant.png"},
		shop: {name: "Store", top1: 0.4, top3: 0.4, managerImg: "/img/qualification/trade.png"},
		repair: {name: "Repair Shop", top1: 0.2, top3: 0.2, managerImg: "/img/qualification/car.png"},
		fuel: {name: "Gas Station", top1: 0.2, top3: 0.2, managerImg: "/img/qualification/car.png"},
		service: {name: "Service", top1: 0.12, top3: 0.12, managerImg: "/img/qualification/service.png"},
		service_light: {name: "Service Light", top1: 0.12, top3: 0.12, managerImg: "/img/qualification/service.png"},
		office: {name: "Office", top1: 0.08, top3: 0.08, managerImg: "/img/qualification/management.png"},
		warehouse: {name: "Warehouse", top1: null, top3: null, managerImg: null}
	}

	const checkType = (type) => {
		if(!(type in types)){
			console.error(`XioScript doesn't support ${type} yet (Top Manager Info for this type not found)!`)
			return false;
		}
		return true;
	}

	const getTop1 = (type) => {
		if(checkType(type))
			return types[type].top1;
	}
	
	const getTop3 = (type) => {
		if(checkType(type))
			return types[type].top3;
	}
	
	const getManagerImg = (type) => {
		if(checkType(type))
			return types[type].managerImg;
	}

	const getName = (type) => {
		if(checkType(type))
			return types[type].name;
	}

	return {getTop1, getTop3, getManagerImg, getName, checkType};

})();
