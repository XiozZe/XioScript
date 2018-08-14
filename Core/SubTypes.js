/**
 * Hardcoded virtonomics subdivision types data
 */
const SubTypes = (() => {

	//the TOP1 modifier, TOP3 modifier and the img for the top manager page
	//Can be find as 'symbol' in UnitSummary and 'unit_type_symbol' in CompanySummary
	const types = {
		animalfarm: {name: "Animal Farm", top1: 0.6, top3: 0.6, managerImg: "/img/qualification/animal.png"},
		apiary: {name: "Apiary", top1: 0.6, top3: 0.6, managerImg: "/img/qualification/animal.png"},
		coal_power: {name: "Coal Plant", top1: 6, top3: 6, managerImg: "/img/qualification/power.png"},
		cellular: {name: "IT-center", top1: null, top3: null, managerImg: "/img/qualification/it.png"},
		farm: {name: "Vegetable Farm", top1: 1.6, top3: 1.6, managerImg: "/img/qualification/farming.png"},
		fishingbase: {name: "Fishing Base", top1: 1, top3: 1, managerImg: "/img/qualification/fishing.png"},
		fitness: {name: "Fitness", top1: 0.12, top3: 0.12, managerImg: "/img/qualification/service.png"},
		fuel: {name: "Gas Station", top1: 0.2, top3: 0.2, managerImg: "/img/qualification/car.png"},
		hairdressing: {name: "Hairdressing", top1: 0.12, top3: 0.12, managerImg: "/img/qualification/service.png"},
		incinerator_power: {name: "Incinerator", top1: 6, top3: 6, managerImg: "/img/qualification/power.png"},
		kindergarten: {name: "Kindergarten", top1: null, top3: null, managerImg: "/img/qualification/educational.png"},
		lab: {name: "Laboratory", top1: 0.4, top3: 0.4, managerImg: "/img/qualification/research.png"},
		laundry: {name: "Laundry", top1: 0.12, top3: 0.12, managerImg: "/img/qualification/service.png"},
		medicine: {name: "Hospital", top1: 1, top3: 1, managerImg: "/img/qualification/medicine.png"},
		mill: {name: "Mill", top1: 0.4, top3: 4, managerImg: "/img/qualification/manufacture.png"},
		mine: {name: "Mine", top1: 8, top3: 8, managerImg: "/img/qualification/mining.png"},	
		network: {name: "Radio Tower", top1: null, top3: null, managerImg: "/img/qualification/it.png"},
		office: {name: "Office", top1: 0.08, top3: 0.08, managerImg: "/img/qualification/management.png"},
		oil_power: {name: "Oil Plant", top1: 6, top3: 6, managerImg: "/img/qualification/power.png"},
		oilpump: {name: "Oil Pump", top1: 8, top3: 8, managerImg: "/img/qualification/mining.png"},	
		orchard: {name: "Orchard", top1: 1.2, top3: 1.2, managerImg: "/img/qualification/farming.png"},
		repair: {name: "Repair Shop", top1: 0.2, top3: 0.2, managerImg: "/img/qualification/car.png"},
		restaurant: {name: "Restaurant", top1: 0.4, top3: 0.4, managerImg: "/img/qualification/restaurant.png"},	
		sawmill: {name: "Sawmill", top1: 4, top3: 4, managerImg: "/img/qualification/manufacture.png"},
		shop: {name: "Store", top1: 0.4, top3: 0.4, managerImg: "/img/qualification/trade.png"},
		sun_power: {name: "Solar Plant", top1: 6, top3: 6, managerImg: "/img/qualification/power.png"},
		villa: {name: "Villa", top1: null, top3: null, managerImg: null},	
		warehouse: {name: "Warehouse", top1: null, top3: null, managerImg: null},
		workshop: {name: "Factory", top1: 4, top3: 4, managerImg: "/img/qualification/manufacture.png"},
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
