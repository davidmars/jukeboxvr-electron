// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
var $ = require("jquery");
require("./UI");


var syncUrl="http://localhost/github/jukebox-vr/fr/povApi/action/jukeboxSync";
var $btnSync=$(".js-sync");
var $logs=$("#logs");

function log(str){
    $logs.text($logs.text()+"\n"+str)
}

//------------ Machine name & MAC-----------------
const os = require('os');
var NAME=os.hostname();
log("MACHINE NAME: "+NAME);

var networks=os.networkInterfaces().Ethernet;
var MAC="";
for(let adr of networks){
    if(adr.mac){
        MAC=adr.mac;
        break;
    }
}
log("MACHINE MAC: "+MAC);
log("--------------");

//------------ Répertoire de stockage-----------------

var fs = require('fs');
var appStorage=os.homedir()+"/jukeboxvr";
log("Les fichiers de l'application sont stockés dans "+appStorage);
if (!fs.existsSync(appStorage)) {
    fs.mkdirSync(appStorage);
    log("Le répertoire vient d'être créé");
}else{
    log("Le répertoire existait déjà");
}


//------------- synchro ------------------------

/**
 * Version du contenu enregistrée en local
 * @type {string}
 */
var SYNCHRO_ID="";
var JSON_CONTENU={};

/**
 * Url vers le fichier local de syncronisation
 * @type {string}
 */
var localPathSync=appStorage+"/sync.json";

if(!fs.existsSync(localPathSync)){
    log("sync.json va être téléchargé pour la première fois...");
}else{
    log("sync.json va être mis à jour...");
    JSON_CONTENU=fs.readFileSync(localPathSync);
    JSON_CONTENU=JSON.parse(JSON_CONTENU);
    console.log("local json",JSON_CONTENU);
    SYNCHRO_ID=JSON_CONTENU.json.synchroId;
    log("la version précédente du contenu était "+SYNCHRO_ID)
}


getSync(
    function(json){
        if(json.json.synchroId !== SYNCHRO_ID){
            fs.writeFileSync(localPathSync,JSON.stringify(json),{ encoding : 'utf8'});
            SYNCHRO_ID=json.json.synchroId;
            log("Mise à jour du contenu nécessaire");
        }else{
            log("Votre contenu est à jour");
        }
        syncDwdNext();
    },
    function(){
        log("synchronisation impossible");
        log("impossible de télécharger "+syncUrl)
    }
);


function ensureDirectoryExistence(filePath) {
    var dirname = path.dirname(filePath);
    if (fs.existsSync(dirname)) {
        return true;
    }
    ensureDirectoryExistence(dirname);
    fs.mkdirSync(dirname);
}
var download = function(url, dest, cb) {
    var file = fs.createWriteStream(dest);
    var request = http.get(url, function(response) {
        response.pipe(file);
        file.on('finish', function() {
            file.close(cb);  // close() is async, call cb after close completes.
        });
    });
}

var http = require('http');
var path = require('path');
function syncDwdNext(){
    for(let contenu of JSON_CONTENU.json.contenus){
        console.log(contenu.name);
        let local=appStorage+"/"+contenu.localFile;
        ensureDirectoryExistence(local);
        if(!fs.existsSync(local)){
            log("Téléchargement depuis "+contenu.serverFile);
            download(contenu.serverFile,local,function(){
                syncDwdNext();
            });
        }
    }
}

/**
 * Télécharge le JSON de synchro
 * @param successCb
 * @param errorCb
 */
function getSync(successCb,errorCb){
    $.ajax(syncUrl,{
        data:{
            machinetoken:MAC,
            machinename:NAME,
        },
        success:function(data){
            console.log(data)
            successCb(data);
        },error:function(){
            errorCb();

        }
    })
}

















