// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const isDevelopment = process.mainModule.filename.indexOf('app.asar') === -1;
console.log("isDevelopment",isDevelopment);
var $ = window.$ = require("jquery");

if(isDevelopment){
    const FileWatcher=require("./dev/FileWatcher");
    let watcher=new FileWatcher();
}

//logs
var Logs = require("./utils/Logs");
let logs=window.logs=new Logs();
var $logs=$("#logs");
logs.on("EVENT_CHANGE",function(){
    $logs.html(logs.html);
});

//app infos
logs.log("Node v: "+process.versions.node);
logs.log("Chromium v: "+process.versions.chrome);
logs.log("Electron v: "+process.versions.electron);

//machine
const Machine = require('./Machine.js');
let machine=new Machine();


//------------ Machine name & MAC-----------------
logs.log("MACHINE NAME: "+machine.name);
logs.log("MACHINE MAC: "+machine.macAddress);
logs.log("--------------");


require("./jukebox/UI");
var $btnSync=$(".js-sync");

//------------ Répertoire de stockage-----------------

var appStorage=machine.appStoragePath;
logs.log("Les fichiers de l'application sont stockés dans "+appStorage);

//------------- synchro ------------------------
var Sync=require("./jukebox/Sync");
let sync=new Sync(
    "http://localhost/github/jukebox-vr/fr/povApi/action/jukeboxSync",
    machine
);
sync.on("EVENT_UPDATED",function(){
   document.title="Dernière mise à jour: "+new Date().toLocaleTimeString();
});
sync.on("EVENT_UPDATING",function(){
    document.title="Mise à jour en cours...";
});
sync.on("EVENT_ERROR",function(){
    document.title="Mise à jour impossible !!!";
});

$btnSync.on("click",function(){
    sync.doIt();
});

















