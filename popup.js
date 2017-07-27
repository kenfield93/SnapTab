/**
 * Created by kyle on 6/21/17.
 */
//var firstHref =  $(location).attr('href');

function addTabClickHandler(e){
    var query = { active: true, currentWindow: true };

    function callback(tabs) {
        var currentTab = tabs[0]; // there will be only one in this array
        chrome.tabs.sendMessage(currentTab.id, {greeting: "hello"},  function(response) {
            if(response)
                displayTabInPopup(response);
        });
    }
    chrome.tabs.query(query, callback);
}

function saveTabSessionClickHandler(e){
    //get name to try and save
    var name = document.getElementById('sessionName').value;
    console.log(name);

    //for now just send a msg to background w/ name to save session
    // later on can worry about if name exists and if they wanna override or pick new name
    chrome.runtime.sendMessage({"method": "saveSession", "name": name}, function(response){
        console.log("i dont want to be like u");
    });
}

function displayTabInPopup(){

}
function displayTabSessions(displayFn) {
    chrome.storage.sync.get(null, function (items) {
        var session;
        var sessionObjs = [];
        for (var sessionName in items) {
            if (items.hasOwnProperty(sessionName) && Array.isArray(items[sessionName])) { //&& items[sessionName].isTabSession )
                session = items[sessionName];
                sessionObjs.push({sessionName: sessionName, sessions: session});
            }
        }
        //console.log(sessionObjs);
        displayFn(sessionObjs);
       // setTimeout(sendResponse(sessionObjs), 0);
    });
};
var nameOfTabSessionList = "tabSessionNames";

function loadFromLocalStorage(key, valueHandlerCb) {
    chrome.storage.sync.get(key, function (value) {
        if (!value) return valueHandlerCb(new Error("TabSessionList " + nameOfTabSessionList + " don't exist bitch"));
        valueHandlerCb( value);
    });
}

function displayTabs(sessions){
    sessions.forEach(function(ele) {
        var newUL = document.createElement('ul');
        var btn = document.createElement('button');

        var showTabs = function() {
             for(var i = 0; i < ele.sessions.length; i++) {
                 var newLI = document.createElement('li');
                newLI.appendChild(document.createTextNode(ele.sessions[i].title));
                newUL.appendChild(newLI);
             }

            // add ele.sessionName as btn txt
        };
        var clearTabDisplay = function(){
            ele.sessions.forEach(function() {
                newUL.removeChild(newUL.childNodes[newUL.childNodes.length - 1]);
            });
        };
        var openSession = function(){
            var urls = ele.sessions.map(function(tabAndTitle){
                return tabAndTitle.url;
            });
            chrome.runtime.sendMessage({method:"openTabs", urls: urls}, function(){});
        };

        btn.onclick = openSession;
        btn.onmouseover = showTabs;
        btn.onmouseout =  clearTabDisplay;
        btn.textContent = ele.sessionName;
        newUL.appendChild(btn);
        document.getElementById('savedSessions').appendChild(newUL);
    });
}

function deleteSessions(savedSessionDiv) {

    var turnDeleteSessionOn = true;

    function deleteBtnFunctionality(btn){
        if(turnDeleteSessionOn)
            decorateSessionsForDelete(btn);
        else
            stripDecorateSessionForDelete(btn);
      //  btn.textContent = (turnDeleteSessionOn) ? 'Cancel' : 'Delete';
        turnDeleteSessionOn = !turnDeleteSessionOn;
    };
    function decorateSessionsForDelete(btn) {
        var listElements = savedSessionDiv.childNodes;
        var UL_Element;
        for( var i = 0; i < listElements.length; i++){
            UL_Element = listElements[i];
            if(UL_Element.nodeName != "UL")
                continue;
            var checkBox  = document.createElement('input');
            checkBox.type = 'checkbox';
            checkBox.name = 'deleteCheckBoxes';
            console.log(checkBox);
            var sessionBtn = UL_Element.childNodes[0];
            checkBox.id = sessionBtn.textContent;
            if( UL_Element.childNodes[0].nodeName != 'INPUT')
                UL_Element.insertBefore(checkBox, UL_Element.childNodes[0]);
        }
    };
    function stripDecorateSessionForDelete(btn){

        var deleteRow = function(element){
            element.parentNode.parentNode.removeChild(element.parentNode);
        };
        var deleteSessionFromChromeMemory = function(sessionName){
            chrome.runtime.sendMessage({"method": "deleteSession", "name": sessionName}, function(status){
                console.log(status)
            });
        };
        var checkboxElementsToDelete = (function getIdsToDelete(funcForCheckedBoxes) {
            var liveCheckBoxList = document.getElementsByName('deleteCheckBoxes');
            //liveCheckBoxList is live/dynamic. manipulating dom changes liveCheckBoxList
            var nodeListFilter = Array.prototype.filter;
            var checkedBoxList = nodeListFilter.call(liveCheckBoxList, function (box) {
                //dont wanna alter here since changes to dom are reflected in liveCheckBoxList
                return box.checked;
            });
            return checkedBoxList;
        })();

        var toDeleteQueue = [];
        checkboxElementsToDelete.forEach(function(ele){
            deleteRow(ele);
            toDeleteQueue.push(ele.id);
        });
        deleteSessionFromChromeMemory(toDeleteQueue);

        (function stripCheckBoxes() {
            var listElements = savedSessionDiv.childNodes;
            for (var i = 0; i < listElements.length; i++) {
                Input_Element = listElements[i];
                if (Input_Element.nodeName != "UL")
                    continue;

                if (Input_Element.childNodes[0].nodeName == 'INPUT')
                    Input_Element.removeChild(Input_Element.childNodes[0]);
            }
        })();
    };
    return deleteBtnFunctionality;
}
// Add event listeners once the DOM has fully loaded by listening for the
// `DOMContentLoaded` event on the document, and adding your listeners to
// specific elements when it triggers.
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('addTab').addEventListener('click', addTabClickHandler);
    document.getElementById('saveSession').addEventListener('click', saveTabSessionClickHandler);
    displayTabSessions(displayTabs);
    document.getElementById('deleteSessions').addEventListener('click', deleteSessions(document.getElementById('savedSessions')));

    //main();
});
