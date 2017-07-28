/**
 * Created by kyle on 6/11/17.
 */

console.dir(chrome.storage);
var firstHref =  $(location).attr('href');
console.log(document.title)
console.log(firstHref);
console.log(typeof firstHref);
//chrome.storage.sync.clear();


//chrome.storage.sync.get('rich', function(item){console.log("suck a toe"); console.log(item);});


/*listens for popup */
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      //  var port = chrome.runtime.connect({name: sender.id});
      //  port.postMessage({joke: "Knock knock"});
        var query = {method: "addTab", url: firstHref, title: document.title};
        console.log("request" + JSON.stringify(request));
        console.log("sender " + JSON.stringify(sender));
        chrome.runtime.sendMessage(query,function(response){
              if( response.status == 200) {
                  sendResponse( {url: firstHref, title: document.title, tabQueueLen: response.queueLen});
              }
        });
        /* Very Important. returning true lets callee know you're going to call sendResponse asynch. Otherwise channel/port lifetime ends and it wont work
         https://stackoverflow.com/questions/20077487/chrome-extension-message-passing-response-not-sent
         */
        //return true;
    });

/*
window.addEventListener("unload", function(){
    console.log("titts ");
    chrome.runtime.sendMessage([{"url": "https://google.com"},{"url": firstHref}], function(response) {
        console.log("obey me");
        console.log(response);
    });
  //  chrome.storage.sync.set({'link1': firstHref }, function(){console.log("Hank Hill");});
  //  chrome.storage.sync.get('link1', function(item){console.log(item);});
});
*/

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