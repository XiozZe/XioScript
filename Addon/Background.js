function openPage() {
    browser.tabs.create({
        url: "Addon/Main.html"
    });
}
  
browser.browserAction.onClicked.addListener(openPage);

console.log("XSAddon: Background.js");