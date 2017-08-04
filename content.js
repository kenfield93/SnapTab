/**
 * Created by kyle on 6/11/17.
 */

console.dir(chrome.storage);
var currentUrl =  $(location).attr('href');
//console.log(document.title)
//console.log(firstHref);
//console.log(typeof firstHref);
//chrome.storage.sync.clear();
var DEFAULT_PAGE = "Google Home Page";


function addTabToSessionQueue(responseFunc) {
    console.log("addTabToSessionQueue");
    //  var port = chrome.runtime.connect({name: sender.id});
    //  port.postMessage({test: "Testing port.postMessage"});
    var query = {method: "addTab", url: currentUrl, title: document.title};
    if(!query.title || query.title == " "){
        query.title = DEFAULT_PAGE
    }
    chrome.runtime.sendMessage(query, responseFunc);

    /* Very Important. returning true lets callee know you're going to call sendResponse asynch. Otherwise channel/port lifetime ends and it wont work
     https://stackoverflow.com/questions/20077487/chrome-extension-message-passing-response-not-sent
     */
    //return true;
};

/*
 todo refactor or curry this somehow so sendResponse is w/ in scope
 */
function addTabResponse (response) {
    console.log("addTabResponse");
    console.log(response);
    if (response.status == 200) {
        sendResponse({url: currentUrl, title: document.title, tabQueueLen: response.queueLen});
    }
};


function addTabToSessionQueueAndResponse(){
    return addTabToSessionQueue(addTabResponse);
}

/*listens to popup for user adding tab manually*/
function addTabs() {
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {

        if (request.method == 'addTabManually') {
            console.log("addTabs");
            addTabToSessionQueueAndResponse()
        }

    });
}
addTabs();


function tabOnClosing(responseFunc){
    console.log("TabOnClosing");
    var query = {method: "isAddTabOnDeleteActive"};
    chrome.runtime.sendMessage(query, function(response){
        console.log(response);
        if( response.status == 200 && response.isSet ) {
            // maybe curry addTabToSessionQueue w/ same responseFunc as the 'addTabManually' above
            responseFunc();
    //        return true;
        }
    });
    return true;
}

var addTabOnClosing = function(){
    console.log('addTabOnCLosing');
    tabOnClosing( addTabToSessionQueueAndResponse)
};

window.addEventListener("unload", addTabOnClosing);
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