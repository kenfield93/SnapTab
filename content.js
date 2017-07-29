/**
 * Created by kyle on 6/11/17.
 */

console.dir(chrome.storage);
var currentUrl =  $(location).attr('href');
//console.log(document.title)
//console.log(firstHref);
//console.log(typeof firstHref);
//chrome.storage.sync.clear();


function addTabToSessionQueue(responseFunc) {
    //  var port = chrome.runtime.connect({name: sender.id});
    //  port.postMessage({test: "Testing port.postMessage"});
    var query = {method: "addTab", url: currentUrl, title: document.title};
    chrome.runtime.sendMessage(query, responseFunc);

    /* Very Important. returning true lets callee know you're going to call sendResponse asynch. Otherwise channel/port lifetime ends and it wont work
     https://stackoverflow.com/questions/20077487/chrome-extension-message-passing-response-not-sent
     */
    //return true;
};

function butImNotAWraper(event){alert(JSON.stringify(event)); addTabToSessionQueue();}
/*listens to popup for user adding tab manually*/
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){

    if( request.method == 'addTabManually') {
        var tabManuallyAddedResponse = function (response) {
            if (response.status == 200) {
                sendResponse({url: currentUrl, title: document.title, tabQueueLen: response.queueLen});
            }
        };
        addTabToSessionQueue(tabManuallyAddedResponse);
    }
    //TODO unload doesn't differentiate between things like closing tab and refresh, and seems no available way to check
    // gonna decide if i want a start/stop or just start, where you click the button and enter the name and exit chrome, it then creates new session
    // if issue with saving new session try and save to local storage under name and create session on next open tab. Otherwise would have to do it bitch ass way of
    // saving every tab and deleting it when exited normally, and delete all tabs that were open when chrome was closed ( assuming the user follow steps to save them)
    //TODO want to broadcast these 2 messages to every open tab, unlike addTabManually
    else if(request.method == 'startAddTabOnDelete'){
        window.addEventListener("unload", butImNotAWraper);
    }
    else if(request.method == 'stopAddTabOnDelete'){
        window.removeEventListener('unload', butImNotAWraper);
    }

});


//window.addEventListener("unload", butImNotAWraper);


/*
chrome.app.runtime.onLaunched.addListener(function() {
    console.log('launched');
    alert("shit on a stick");
    chrome.app.window.create('index.html', {
        innerBounds: {
            width: 800,
            height: 600,
            minWidth: 200,
            minHeight: 200,
        }
    }, function(window){
        window.onClosed.addListener(function() {
            console.log('close bg');
            alert('fuck me mate');
        });
    });
});
    */