/**
 * Created by kyle on 6/16/17.
 */
var debug = (function (isDebugOn){
    var debug = isDebugOn;
    return function (msg){
        if(debug)
            alert(JSON.stringify(msg));
    };
})(true);

function initListener() {

    chrome.browserAction.onClicked.addListener(function (tab) {
        chrome.browserAction.getPopup();
    });

//chrome.browserAction
//popup stuff
///////////////////////////////
    chrome.runtime.onMessage.addListener(
        function (msg, sender, sendResponse) {

            if( msg.method == 'addTab') {
                var size = addTab({url: msg.url, title: msg.title});
                sendResponse({status: 200, queueLen: size});
            }
            if( msg.method == 'saveSession') {
                saveToLocalStorage(msg.name, tabSessionsToSave, true);
                setTimeout(resetTabSession, 1000);
            }
            if( msg.method == 'getSessions'){
                var getSessionsPromise = loadTabs();
               // alert(getSessionsPromise.toString);
                sendResponse(getSessionsPromise);
            }
            if( msg.method == 'getTmpSession'){
                //alert("JOJO");
                //sends copy of tabSessionsToSave
                sendResponse(tabSessionsToSave);
            }
            if( msg.method == 'openTabs'){
                msg.urls.map(function(url){
                    chrome.tabs.create({"url": url});
                })
            }
            if( msg.method == 'deleteTmpTab'){
                var indexOfTabToDel = 0;
                var newArray = [];
                for( ; indexOfTabToDel < tabSessionsToSave.length; indexOfTabToDel++){
                    if( tabSessionsToSave[indexOfTabToDel].url == msg.url)
                        break;
                    newArray.push(tabSessionsToSave[indexOfTabToDel]);
                }
                tabSessionsToSave = newArray.concat(tabSessionsToSave.slice(indexOfTabToDel+1));
                sendResponse({status:200, queueLen: tabSessionsToSave.length});
            }
            if(msg.method == 'deleteSession'){
                chrome.storage.sync.remove(msg.name, function(){
                    if(chrome.runtime.lastError)
                        sendResponse({status: "404"});
                    else
                        sendResponse({status: "200"});
                });
            }
          // sendResponse({"status": "200"});
        }
    );

}
initListener();

function openTabSession(tabs){
    var tab;
    for(var i = 0; i < tabs.length; i++) {
        tab = tabs[i];
        chrome.tabs.create({"url": tab.url});
    }
}
/*
chrome.runtime.addTabEvent.addListener(
    function(request, sender, sendResponse) {
        console.log(sender.tab ?
        "from a content script:" + sender.tab.url :
            "from the extension");
        if (request.greeting == "hello")
            sendResponse({farewell: "goodbye"});
    });
*/


/*************  Tab Manager  *************/

// I dont expect > 100 elements ( realistically i don't expect > 30)
// so no piont in sorting/binary
    var tabSessionsToSave = [];

    function resetTabSession() {
        tabSessionsToSave = [];
    }
    function addTab(tab) {
        // validation if need be
        tabSessionsToSave.push(tab);
        return tabSessionsToSave.length;
    }
    function deleteTab(tab, tabArray) {
        var tempTab;
        var tabArrayLength = tabArray.length;
        for (var i = 0; i < tabArrayLength; i++) {
            if (tabArray[i] === tab) {
// overrides <tab's> position w/ the last element. then uses pop to delete the now duplicated last elem
                tabArray[i] = tabArray[tabArrayLength - 1];
                tabArray.pop();
                return true;
            }
        }
        return false;
    }

    function noKeyValuePairExist(name, isOverrideAllowed) {
        return new Promise(function (resolve, reject) {
            chrome.storage.sync.get(name, function (value) {
                if (value && !isOverrideAllowed) {
                    reject();
                }
                else {
                    resolve();
                }
            });
        });
    }
    // key is name of tabSession
    function saveToLocalStorage(key, value, override) {
        if (!value || !key) {
            debug("Debug: either no key or no value given to save");
            return false;
            // return new Error('No tabs or name to save', 0);
        }
        //if(!icon ) icon = null;
        if (!override) override = false;

        var p_keyValueExistance = noKeyValuePairExist(key, override);
        var dontSaveValue = function () {
            debug("Debug: there is a series of tabs already saved w/ that name");
            return false;
            //  return new Error('Name is already in use', -1);
        };
        var saveValue = function () {
            var keyValuePair = {};
            keyValuePair[key] = value;
            alert(JSON.stringify(keyValuePair));
            chrome.storage.sync.set(keyValuePair);
            return true;
        };
        return p_keyValueExistance.then(saveValue, dontSaveValue);
    }