console.log("Hello from background");
chrome.action.onClicked.addListener(buttonClicked);
chrome.runtime.onMessage.addListener(gotMessageResponse);

chrome.action.disable();
let clioUrl;
let currentTab;
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
	//url only visible after adding permissions
	//https://developer.chrome.com/docs/extensions/reference/tabs/#perms
	if (changeInfo.url) {
		this.sendToContent(changeInfo, tabId);
	}
});

function gotMessageResponse(clioUrl){
	console.log("got response");
	this.clioUrl = clioUrl;
	chrome.action.enable();

}

function sendToContent(changeInfo,tabId){

	if(changeInfo.url.includes('#CardModuleV2/OAuthClientAppPage/edit/')){
		chrome.tabs.sendMessage(tabId,{command: "getClioUrl"}, function(response){
			console.log(response);
			if(response && response.clioUrl){
				this.clioUrl = response.clioUrl;
				chrome.action.enable();
			}
		});
	}
}

function buttonClicked(tab){
	this.sendToOpenUrlToContent(tab.id)
}


function sendToOpenUrlToContent(tabId){
	chrome.tabs.sendMessage(
		tabId,{
			command: "openClioUrl", 
			clioUrl: this.clioUrl
		}, 
	null);
	chrome.action.disable();
}
