console.log("Clio helper content script is running");
chrome.runtime.onMessage.addListener(gotMessage);

/**
 * This injects button on OAuthClientAppPage and subscribes to button click
 */
function injectButton(){
	var placeholder = document.getElementById("OAuthClientAppPageSecurityInfoControlGroupControlGroup-tools");
	placeholder.innerHTML = placeholder.innerHTML + `
	<div style="position:relative; margin-left:30px;" id="clioMagnetButton">
		<span id="clioMagnetButton-textEl" class="t-btn-wrapper t-btn-text t-btn-style-green">Clio Magnet</span>
	</div>`
	
	const btn = document.getElementById('clioMagnetButton');
	
	/**
	 * Generates clio URI and send it to clio. Clio-Cli will handle it
	 * See C# -> Clio.Requests.RegisterOAuthCredentialsHandler
	 */
	btn.addEventListener('click',function(){
		let clientSecret = document.getElementById("OAuthClientAppPageClientSecretTextEdit-el").value;
		let clientId = document.getElementById("OAuthClientAppPageClientIdTextEdit-el").value
		let name = document.getElementById("OAuthClientAppPageNameTextEdit-el").value
		let isNetCore = window.location.pathname.startsWith("/0");
		let clioUrl = `clio://RegisterOAuthCredentials/?protocol=${window.location.protocol}&host=${window.location.host}&name=${name}&clientId=${clientId}&clientSecret=${clientSecret}`;	
		window.open(clioUrl,"_blank");
	});
}

function gotMessage(request, sender, sendResponse){
	
	if(request.command === "getClioUrl"){
		let interval  = setInterval(function(){
			let clientSecret = document.getElementById("OAuthClientAppPageClientSecretTextEdit-el").value;
			let clientId = document.getElementById("OAuthClientAppPageClientIdTextEdit-el").value;
			let name = document.getElementById("OAuthClientAppPageNameTextEdit-el").value;
			let isNetCore = this.window.location.pathname.startsWith("/0");
			if(clientSecret && clientId && name && isNetCore){
				clearInterval(interval);
				let clioUrl = `clio://RegisterOAuthCredentials/?protocol=${this.window.location.protocol}&host=${this.window.location.host}&name=${encodeURIComponent(name)}&clientId=${clientId}&clientSecret=${clientSecret}`;	
				
				if(clioUrl.length>10){
					sendResponse({ clioUrl: clioUrl });
					
					//Finally inject
					this.injectButton();

					//Return to runtime a user want to press button there
					chrome.runtime.sendMessage(null, clioUrl, null, null);
				}
			}
		}, 1000);
	}
	
	if(request.command === "openClioUrl"){
		window.open(request.clioUrl,"_blank");
	}
}