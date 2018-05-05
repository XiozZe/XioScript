/**
 * Represents a 'Page' on Virtonomics.
 */
function Page(pageObject){
    
    //With the ID we can find our page back in the collection.
    this.id = pageObject.id;
    //Pages have two types: HTML and JSON, based on what we need.
    this.type = pageObject.type;
    //Every page has it's own url with it's own parameters to make that url.
    this.getUrl = pageObject.getUrl;
    //In order to check whether the page we are on is the same as the page corresponding with this object we can test the page. The arguments must be the Document object and the url. If you don't plan to use this, return undefined.
    this.test = pageObject.test
    //Scrape contains data that is needed to scrape the page. Values are the data retrieved from the page, settings are the required settings on a page so that everything's visible (for example that all subdivision types show up). Settings has to parameters: check returns true if the setting is correct and url gives the place to send data to (or get data from) to set the setting. Repetition will load pages with a maximum number of subdivision/goods per page, repetitively. The array shows which values to continue to scrape, all values not in this array will only be scraped on the first page visited. If you do not plan to use settings or repetition, pass an empty array. The arguments of scrape are "doc" + the arguments for getUrl.
    this.scrape = pageObject.scrape;
    //Object with loaded urls and their data, because we can use the same data twice if asked for it.
    this.loadedUrls = {};
    
    this.checkComplete();
}
Collection.call(Page);
Object.assign(Page, Collection.prototype);

/**
 * A very basic check to make sure I did not make a mistake in writing a module.
 */
Page.prototype.checkComplete = function(){
    console.assert(this.id && this.type && this.getUrl && this.test && this.scrape , "Somethings wrong in the script: tried to make a Page with incomplete object: ", this);
}

/**
 * Removes the data given by this url from the database
 */
Page.prototype.clean = function(...urlArguments){
    const url = this.getUrl(...urlArguments);
    delete this.loadedUrls[url];
}

/**
 * Removes the data of all urls from the database
 */
Page.prototype.cleanAll = function(){
    this.loadedUrls = {};
}

/**
 * Fetches the url from the server
 */
Page.prototype.fetch = async function(url, fetchArguments){

    if(!url)
        console.error("Tried to fetch data but an url is not given: ", url);

    fetchArguments = fetchArguments || {};
    fetchArguments.credentials = "include";

    Results.startCall(this.id, url);
    const page = await fetch(url, fetchArguments);
    Results.finishCall(this.id, url);

    if(!page.ok){
        console.error("Loaded a page that did not respond with succes: "+url);
        setTimeout(() => this.fetch(url, fetchArguments), 3000);
        return;
    }

    return page;
}

/**
 * A function to check if the return values of scraped follow the pattern as should be used with scraped
 */
Page.checkCorrectScrapeReturns = (scrapedArguments) => {

    const values = scrapedArguments.values;
    const settings = scrapedArguments.settings;
    const repetition = scrapedArguments.repetition;
    console.assert(values && settings && repetition, `Error: incomplete scraped arguments: `, scrapedArguments);    
}

Page.prototype.send = async function(data, ...urlArguments){
    
    const url = this.getUrl(...urlArguments);
    
    urlSP = new URLSearchParams();
    for(const key in data){
        urlSP.append(key, data[key]);
    }
    
    await this.fetch(url, {
        method: "POST",
        body: urlSP
    });
}

Page.prototype.loadHTML = async function(url, ...urlArguments){

    const page = await this.fetch(url);
    const docText = await page.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(docText, "text/html");
    const scraped = Tools.try(() => this.scrape(doc, ...urlArguments));
    Page.checkCorrectScrapeReturns(scraped);
        
    if(scraped === null){
        Results.errorLog(`An error occured while scraping the page of type ${this.id}`);
        return {};
    }

    //Undefined would pass
    if(this.test(doc, url) === false)
        Results.errorLog(`Loaded the page ${this.id} that did not pass it's own test of whether we are on the correct page.`);

    //The right settings have to be applied to the page, such as filters or sorting
    for(let setting of scraped.settings){

        console.assert(setting.wrong !== undefined, setting.url !== undefined, `The settings of this Page are specified incorrectly: `, this);

        //If a setting has data it means we need to send that data to set the filter
        if(setting.wrong && setting.data){
            await this.fetch(setting.url, {
                method: "POST",
                body: setting.data
            });
            return await this.loadHTML(url, ...urlArguments);
        }
        //If a setting does not have data we just need to let it know we visited it
        else if(setting.wrong){
            await this.fetch(setting.url);
            console.log("data fetched: ", setting.url);
            return await this.loadHTML(url, ...urlArguments);
        }
    }

    //With repetition, virtonomics always uses the exact same "pager list" to browse different pages. We make use of that.
    const nextUrl = Tools.try(() => doc.querySelector(".pager_list li.selected").nextElementSibling.querySelector("a").href);
    const firstUrl = Tools.try(() => doc.querySelector(".pager_list li:nth-child(2) a").href);

    //If there is repetition, we need to start on the first page
    if(scraped.repetition.length && firstUrl){
        await this.fetch(firstUrl);
        return this.load(...urlArguments);
    }

    const data = scraped.values;

    //Needs repetition (information spread out over different pages)
    //If nextUrl and firstUrl are both null, then it means that there is only one page
    if(scraped.repetition.length && (nextUrl || firstUrl)){

        //For every page, check if there is a next page
        resolveRecursively = async (currentUrl) => {
          
            await this.fetch(currentUrl);
            const rePage = await this.fetch(url);
            const reDocText = await rePage.text();
            const reDoc = parser.parseFromString(reDocText, "text/html");
            const reScraped = Tools.try(() => this.scrape(reDoc, ...urlArguments));
            const reNextUrl = Tools.try(() => reDoc.querySelector(".pager_list li.selected").nextElementSibling.querySelector("a").href);
            const reFirstUrl = Tools.try(() => reDoc.querySelector(".pager_list li:nth-child(2) a").href);

            Page.checkCorrectScrapeReturns(reScraped);

            if(reScraped === null){
                Results.errorLog(`An error occured while scraping the page of type ${this.id}`);
                return {};
            }

            //Connect the newly gotten information to the old
            for(repVal of reScraped.repetition){
                if(!(repVal in data)){
                    Results.errorLog(`Error in page ${this.id}: Repetition values do not match standard values (${repVal})`);
                    return {};
                }						
                data[repVal] = data[repVal].concat(reScraped.values[repVal]);
            }							

            if(reNextUrl)
                //There is still a new page left
                return await resolveRecursively(reNextUrl);
            else{
                //We reached the end. Go back to the first page
                return await this.fetch(reFirstUrl);
            }	
        }

        if(firstUrl){            
            //We are not currently on the first page, remove all data and start on the first page.
            for(repVal of reScraped.repetition){						
                data[repVal] = [];
            }	            
            await resolveRecursively(firstUrl);				
        }
        else
            //We are on the first page.
            await resolveRecursively(nextUrl);
    }	

    return data;

}

Page.prototype.loadJSON = async function(url){

    const page = await this.fetch(url);
    const pageJson = await page.json();
    const scrapedJson = Tools.try(() => this.scrape(pageJson));
        
    if(scrapedJson === null){
        Results.errorLog(`An error occured while scraping the page of type ${this.id}`);
        return {};
    }
    
    this.loadedUrls[url] = scrapedJson;
    return scrapedJson;
}

/**
 * Loads this page with the required urlArguments. Make sure those urlArguments match the arguments passed to the getUrl function. Then the page is scraped using the scrape parameters.
 */
Page.prototype.load = async function(...urlArguments){

    const url = this.getUrl(...urlArguments);

    //Don't duplicate already gotten material
    if(url in this.loadedUrls)
        return await this.loadedUrls[url];    

    const pageToLoad = async () => {
        if(this.type === "HTML")
            return await this.loadHTML(url, ...urlArguments);   
        else if(this.type === "JSON")
            return await this.loadJSON(url);        
    }

    this.loadedUrls[url] = pageToLoad();
    return await this.loadedUrls[url];    
}

/**
 * Function just for testing purposes. Loads the acquiered document text on the screen
 */
Page.prototype.show = function(docText){
    document.querySelector("html").innerHTML = docText;
    window.doc = document; //To be able to copy paste Page scrapers in the console.log
}