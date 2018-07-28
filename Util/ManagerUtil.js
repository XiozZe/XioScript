const ManagerUtil = {

    getLevel: async (domain, realm, type) => {        
        const qualification = await Page.get("Qualification").load(domain, realm);
        const image = SubTypes.getManagerImg(type);
        return ListUtil.restructById("image", qualification)[image].base;
    },

    getBonus: async (domain, realm, type) => {        
        const qualification = await Page.get("Qualification").load(domain, realm);
        const image = SubTypes.getManagerImg(type);
        return ListUtil.restructById("image", qualification)[image].bonus;
    }

}