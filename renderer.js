// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

//ne pas afficher les message de sécurité relous
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS=true;

window.EVENT_ERROR="EVENT_ERROR";
window.EVENT_READY="EVENT_READY";
window.EVENT_SYNCING="EVENT_SYNCING";
window.EVENT_ONLINE="EVENT_ONLINE";
window.EVENT_OFFLINE="EVENT_OFFLINE";
window.EVENT_UPDATING="EVENT_UPDATING";
window.EVENT_DOWNLOADING="EVENT_DOWNLOADING";
window.EVENT_UPDATED="EVENT_UPDATED";
window.EVENT_CHANGE="EVENT_CHANGE";


/**
 * Dev ou build ?
 * @type {boolean}
 */
const isDevelopment = process.mainModule.filename.indexOf('app.asar') === -1;
console.log("isDevelopment",isDevelopment);
/**
 * JQuery partout!
 */
var $ = window.$ = require("jquery");
/**
 *
 * @type {*|HTMLElement}
 */
var $body = window.$body=$("body");

if(isDevelopment){
    const FileWatcher=require("./dev/FileWatcher");
    let watcher=new FileWatcher();
}
//conf
const Conf=require("./jukebox/Conf");
let conf=window.conf=new Conf();
conf.serverRoot="http://localhost/github/jukebox-vr/fr";

//logs
var Logs = require("./utils/Logs");
let logs=window.logs=new Logs();

logs.on(EVENT_CHANGE,function(){
    ui.$logs.html(logs.html);
});

//machine
const Machine = require('./utils/Machine.js');
let machine=window.machine=new Machine();




machine.on(EVENT_READY,function(){

    const MediaPlayer=require("./jukebox/MediaPlayer");
    window.mediaPlayer = new MediaPlayer();

    const WebServer=require("./jukebox/WebServer");
    window.webServer = new WebServer();

    //UI
    const UI = require("./jukebox/UI");
    let ui=window.ui=new UI();

    //app infos
    logs.log("Node v: "+process.versions.node);
    logs.log("Chromium v: "+process.versions.chrome);
    logs.log("Electron v: "+process.versions.electron);

    //------------ Machine name & MAC-----------------

    logs.log("MACHINE NAME: "+machine.name);
    logs.log("MACHINE ID: "+machine.machineId);
    logs.log("--------------");

    //------------ Répertoire de stockage-----------------

    var appStorage=machine.appStoragePath;
    logs.log("Les fichiers de l'application sont stockés dans "+appStorage);

    //------------- synchro ------------------------
    var Sync=require("./jukebox/Sync");
    let sync=new Sync(window.webServer.urlSynchro,machine);
    sync.on(EVENT_UPDATED,function(){
        logs.success("Mise à jour réussie");
        document.title="Dernière mise à jour: "+new Date().toLocaleTimeString();
    });
    sync.on(EVENT_UPDATING,function(){
        document.title="Mise à jour en cours...";
    });
    sync.on(EVENT_DOWNLOADING,function(message){
        document.title="Mise à jour en cours...";
        logs.log(message);
    });
    sync.on(EVENT_ERROR,function(err){
        document.title="Sync "+err;
        logs.error(err);
    });
    sync.on("EVENT_READY",function(err){
        //document.title="Sync "+err;
        ui.updateContenus(sync.data.json.contenus);
        if(ui.getCurrentScreen()==="splash-screen"){
            setTimeout(function(){
                ui.goScreen("local");
            },5000)

        }
        ui.$navSync.removeClass("syncing");
    });

    sync.on(EVENT_OFFLINE,function(){
        ui.setOnline(false);
        if(ui.getCurrentScreen()==="online"){
            ui.goScreen("local");
        }
    });
    sync.on(EVENT_ONLINE,function(){
        ui.setOnline(true);
    });
    sync.on(EVENT_SYNCING,function(){
        ui.$navSync.addClass("syncing");
    });

    $body.on("click",".js-sync",function(){
        sync.doIt();
    });


});






















