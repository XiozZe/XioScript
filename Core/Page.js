/**
 * Represents a 'Page' on Virtonomics.
 */
function Page(pageObject){
    
    //With the ID we can find our page back in the collection.
    this.id = pageObject.id
    //Every page has it's own url with it's own parameters to make that url.
    this.getUrl = pageObject.getUrl
    //In order to check whether the page we are on is the same as the page corresponding with this object we can test the page. The arguments must be the Document object and the url. If you don't plan to use this, return undefined.
    this.test = pageObject.test
    //Scrape contains data that is needed to scrape the page. Values are the data retrieved from the page.
    this.scrape = pageObject.scrape
    //Settings are the required settings on a page so that everything's visible (for example that all subdivision types show up). Settings has at least two parameters: hasWrongSettings returns true if the settings are incorrect. To solve this problem we can send a server call: add url gives the place to send data to (or get data from) to set the setting. Or we can remove a cookie: 'removeCookie' is the name of the cookie to be removed. 
    this.settings = pageObject.settings
    //Repetition will load pages with a maximum number of subdivision/goods per page, repetitively. The array shows which values to continue to scrape, all values not in this array will only be scraped on the first page visited. If you do not plan to use settings or repetition, pass an empty array.
    this.repetition = pageObject.repetition
    //With repetition you don't want to load two pages at the same time because of a shared page number. That's why in that case it will be pushed to a queue.
    this.queue = Promise.resolve()

    //Object with loaded urls and their data, because we can use the same data twice if asked for it.
    this.loadedUrls = {}

    this.checkComplete()
}
Collection.call(Page)
Object.assign(Page, Collection.prototype)

/**
 * A very basic check to make sure I did not make a mistake in writing a module.
 */
Page.prototype.checkComplete = function(){
    console.assert(this.id && this.getUrl, "Somethings wrong in the script: tried to make a Page with incomplete object: ", this)
}

/**
 * Removes the data given by this url from the database
 */
Page.prototype.clean = function(...urlArguments){
    const url = this.getUrl(...urlArguments)
    delete this.loadedUrls[url]
}

/**
 * Removes the data of all urls from the database
 */
Page.prototype.cleanAll = function(){
    this.loadedUrls = {}
}

/**
 * Fetches the url from the server
 */
Page.prototype.fetch = async function(url, fetchArguments){

    if(!url)
        console.error("Tried to fetch data but an url is not given: ", url)

    fetchArguments = fetchArguments || {}
    fetchArguments.credentials = "include"

    Results.startCall(this.id, url)
    const page = await fetch(url, fetchArguments)
    Results.finishCall(this.id, url)

    if(!page.ok){
        console.error("Loaded a page that did not respond with succes: "+url)
        setTimeout(() => this.fetch(url, fetchArguments), 3000)
        return
    }

    return page
}

Page.prototype.send = async function(data, ...urlArguments){
    
    const url = this.getUrl(...urlArguments)
    
    const urlSP = new URLSearchParams()
    for(const key in data){
        urlSP.append(key, data[key])
    }
    
    const page = await this.fetch(url, {
        method: "POST",
        body: urlSP
    })

    //Try because it is very possible that this data that is send is not meant to give anything back
    try{
        if(this.scrape){
            //Normal
            const t = await page.text()
            const p = new DOMParser()
            const d = p.parseFromString(t, "text/html")
            const s = this.scrape(d)
            console.log(url, s)
            return s
        
        } else {
            //JSON
            const j = await page.json()
            console.log(url, j)
            return j
        }
        
    }
    catch(e){}
}

Page.prototype.fetchDocument = async function(...urlArguments){

    const url = this.getUrl(...urlArguments)
    const page = await this.fetch(url)
    const docText = await page.text()
    const parser = new DOMParser()
    const doc = parser.parseFromString(docText, "text/html")

    return await this.applySettings(doc, ...urlArguments)

}

Page.prototype.scrapeHTMLdocument = function(doc, url){

    const scraped = Tools.try(() => this.scrape(doc))

    if(scraped === null){
        Results.errorLog(`An error occured while scraping the page of type ${this.id}`)
        return {}
    }

    return scraped

}

Page.prototype.applySettings = async function(doc, ...urlArguments){
    
    if(!this.settings){
        //If the settings are undefined, it means that the page always has the right settings
        return doc
    }

    const settings = this.settings(doc, ...urlArguments)

    for(const setting of settings){

        const problemDefined = setting.hasWrongSettings !== undefined
        const solveDefined = setting.url !== undefined || setting.removeCookie !== undefined
        console.assert(problemDefined && solveDefined, `The settings of this Page are specified incorrectly: `, this)

        if(setting.hasWrongSettings){

            if(setting.removeCookie){
                console.log("RemoveCookie")

                const u = this.getUrl(...urlArguments)
                await browser.cookies.remove({
                    url: u,
                    name: setting.removeCookie
                })
            }
            //If a setting has data it means we need to send that data to set the filter
            else if(setting.data){

                const urlSP = new URLSearchParams()
                for(const key in setting.data){
                    urlSP.append(key, setting.data[key])
                }               
                
                await this.fetch(setting.url, {
                    method: "POST",
                    body: urlSP
                })
            }
            //If a setting does not have data we just need to let it know we visited it
            else{
                await this.fetch(setting.url)
            }

            return await this.fetchDocument(...urlArguments)

        }

        
    }

    return doc
}

Page.prototype.getFirstAndNextUrl = function (doc) {
    
    //With repetition, virtonomics always uses the exact same "pager list" to browse different pages. We make use of that.    
    const nextUrl = Tools.try(() => doc.querySelector(".pager_list li.selected").nextElementSibling.querySelector("a").href)
    const firstUrl = Tools.try(() => doc.querySelector(".pager_list li:nth-child(2) a").href)
    return {nextUrl, firstUrl}

}

Page.prototype.addToQueue = async function (promise) {
    return await this.queue.then(promise)
}

Page.prototype.scrapeWithRepetition = async function (...urlArguments) {

    const initialDoc = await this.fetchDocument(...urlArguments)
    let {firstUrl, nextUrl} = this.getFirstAndNextUrl(initialDoc)

    let firstDoc = initialDoc

    //If the firstUrl is present, it means we are not on the first page.
    if(firstUrl){
        await this.fetch(firstUrl)
        firstDoc = await this.fetchDocument(...urlArguments)
        ;({firstUrl, nextUrl} = this.getFirstAndNextUrl(firstDoc))
    }

    //We scrape all the data from the first page and for all other pages only the 'repetition' data
    const totalScraped = this.scrapeHTMLdocument(firstDoc)

    while(nextUrl){
        await this.fetch(nextUrl)
        const doc = await this.fetchDocument(...urlArguments)
        ;({firstUrl, nextUrl} = this.getFirstAndNextUrl(doc))
        const scraped = await this.scrapeHTMLdocument(doc)
        
        for(const repValue of this.repetition){

            if(!(repValue in scraped)){
                Results.errorLog(`Error in page ${this.id}: Repetition values do not match standard values (${repValue})`)
                return totalScraped
            }	

            totalScraped[repValue].push(...scraped[repValue])
        }
    }

    //If there is no first url, every subdivision is on the page, so no need to go back to the first page
    if(firstUrl)
        await this.fetch(firstUrl)

    return totalScraped
}

Page.prototype.loadHTML = async function(...urlArguments){

    let scraped

    if(this.repetition){
        scraped = await this.scrapeWithRepetition(...urlArguments)
    }
    else{
        const doc = await this.fetchDocument(...urlArguments)
        scraped = await this.scrapeHTMLdocument(doc)
    }

    return scraped
}

Page.prototype.loadJSON = async function(url){

    const page = await this.fetch(url)
    const pageJson = await page.json()
        
    if(pageJson === null){
        Results.errorLog(`An error occured while scraping the page of type ${this.id}`)
        return {}
    }
    
    this.loadedUrls[url] = pageJson
    return pageJson
}

/**
 * Loads this page with the required urlArguments. Make sure those urlArguments match the arguments passed to the getUrl function. Then the page is scraped using the scrape parameters.
 */
Page.prototype.load = async function(...urlArguments){

    const url = this.getUrl(...urlArguments)

    //Don't duplicate already gotten material
    if(url in this.loadedUrls)
        return await this.loadedUrls[url]    

    //This construction is needed because we do not want double requests
    const pageToLoad = async () => {

        if (this.scrape) {
            const f = () => this.loadHTML(...urlArguments)   
            //return await f()
            return await this.addToQueue(f)
        }
        else {
            return await this.loadJSON(url) 
        }
             
    }

    this.loadedUrls[url] = pageToLoad()
    const l = await this.loadedUrls[url]
    console.log(url, l)
    return l    
}

/**
 * Function just for testing purposes. Loads the acquiered document text on the screen
 */
Page.prototype.show = function(docText){
    document.querySelector("html").innerHTML = docText
    window.doc = document //To be able to copy paste Page scrapers in the console.log
}