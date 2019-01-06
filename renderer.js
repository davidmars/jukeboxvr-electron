// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const {app, BrowserWindow} = require('electron');
const electron = require('electron');
require("jukebox-js-libs/dragscroll");

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
    new FileWatcher();
}else{


}



//confs
const Conf=require("jukebox-js-libs/Conf");

let confLocal=new Conf();
confLocal.serverRoot="http://localhost/github/jukebox-vr/fr";
confLocal.appDirectoryStorageName="jukeboxvr/localhost";

let confOnline=new Conf();
confOnline.serverRoot="https://jukeboxvr.fr"; //
confOnline.appDirectoryStorageName="jukeboxvr/prod";


window.conf=confOnline;

//logs
var Logs = require("jukebox-js-libs/utils/Logs");
let logs=window.logs=new Logs();

logs.on(EVENT_CHANGE,function(){
    ui.$logs.html(logs.html);
});

//machine
const Machine = require('jukebox-js-libs/utils/Machine.js');
let machine=window.machine=new Machine();




machine.on(EVENT_READY,function(){

    if(isDevelopment){
        $body.addClass("dev");
    }else{
        $body.addClass("prod");
    }
    const WebServer=require("jukebox-js-libs/WebServer");
    window.webServer = new WebServer();

    //UI
    const UI = require("./jukebox/UI");
    let ui=window.ui=new UI();

    //app infos
    logs.success("App v: "+electron.remote.app.getVersion());
    logs.log("Node v: "+process.versions.node);
    logs.log("Chromium v: "+process.versions.chrome);
    logs.log("Electron v: "+process.versions.electron);
    logs.log("Server: "+conf.serverRoot);

    //------------ Machine name & MAC-----------------

    logs.log("MACHINE NAME: "+machine.name);
    logs.log("MACHINE ID: "+machine.machineId);
    logs.log("--------------");

    //------------ Répertoire de stockage-----------------

    var appStorage=machine.appStoragePath;
    logs.log("Les fichiers de l'application sont stockés dans "+appStorage);

    //------------- synchro ------------------------
    var Sync=require("jukebox-js-libs/Sync");
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
        //ui.goScreen("splash-screen");
        ui.$navSync.removeClass("syncing");
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



    //--------------casques-----------------

    const Casque=require("./jukebox/casque/Casque");
    Casque.initAll();


    //reinstall
    $body.on("click","[href='#reinstall']",function(e){
        if(confirm("êtes vous certain de vouloir réinitialiser toute l'installation?")){
            machine.reInstall();
        }
    })



});






















