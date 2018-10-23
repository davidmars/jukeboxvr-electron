const FileSystemUtils=require("../utils/FileSystemUtils");
const fs = require("fs");
const EventEmitter = require("event-emitter-es6");

/**
 * Objet qui synchronise l'application avec le serveur web
 */
class Sync extends EventEmitter{
    /**
     *
     * @param {string} syncUrl Url vers le json de synchro
     * @param {Machine} machine La machine dont on déduira pas mal de trucs
     */
    constructor(syncUrl,machine){
        super();

        let me=this;

        /**
         * Selon si on est online ou pas
         * @type {boolean}
         */
        this.isOnline=null;

        /**
         * True si une mise à jour est en cours
         * @type {boolean}
         */
        this.syncing=false;

        /**
         * @private
         * @type {string} Répertoire de stockage des fichiers de l'application
         */
        this.localStoragePath=machine.appStoragePath;
        /**
         * @private
         * @type {string} Url vers le json de synchro
         */
        this.syncUrl=syncUrl;
        /**
         * @private
         * @type {Machine}
         */
        this.machine=machine;

        /**
         * @private
         * Version du contenu enregistrée en local
         * @type {string}
         */
        this.synchroId="";
        /**
         * @private
         * Les données du fichier de synchronisation
         * @type {{}}
         */
        this.data={};

        /**
         * @private
         * Chemin vers le fichier en local
         * @type {string}
         */
        this.jsonPath=machine.appStoragePath+"/sync.json";

        //teste si le json existe
        if (fs.existsSync(this.jsonPath)) {
            let json = fs.readFileSync(me.jsonPath);
            json = JSON.parse(json);
            me.data = json;
            me.synchroId = me.data.json.synchroId;
            logs.log("la version du contenu est " + this.synchroId);
        } else {
            logs.log("sync.json va être téléchargé pour la première fois...");
        }
        me.doIt();
        setInterval(function(){
            me.doIt();
        },1000*window.conf.synchroDelaySeconds)
    }

    doIt(){
        if(this.syncing){
            return;
        }

        let me=this;
        me.syncing=true;
        me.emit(EVENT_SYNCING);
        this.dwdJson(
            function(json){
                if(!me.isOnline){
                    me.emit(EVENT_ONLINE);
                    me.isOnline=true;
                }
                if(json.success){
                    if(json.json.synchroId !== me.synchroId){
                        me.setNewJson(json);
                        logs.error("Mise à jour du contenu nécessaire");
                    }else{
                        logs.success("Votre contenu est à jour");
                    }
                    me.dwdNext();
                }else{
                    for(let err of json.errors){
                        me.emit(EVENT_ERROR,err);
                    }
                }

            },
            function(){
                console.error("synchronisation impossible");
                console.error("impossible de télécharger "+me.syncUrl)
                me.emit(EVENT_ERROR,"impossible de télécharger "+me.syncUrl);

                if(me.isOnline!==false){
                    me.emit(EVENT_OFFLINE);
                    me.isOnline=false;
                }
                me.syncing=false;
                me.emit(EVENT_READY);

            }
        )
    }

    /**
     *
     * Définit un nouveau json et donc noucelles data et nouvelle version.
     * @private
     * @param json
     */
    setNewJson(json){
        fs.writeFileSync(this.jsonPath,JSON.stringify(json),{ encoding : 'utf8'});
        this.synchroId=json.json.synchroId;
        this.data=json;
        console.log("nouvelle version",this.synchroId);
        console.log("nouveau json",this.data);
    }

    /**
     * Télécharge le json
     * @private
     * @param successCb
     * @param errorCb
     */
    dwdJson(successCb,errorCb){
        let me = this;
        $.ajax(this.syncUrl,{
            data:{
                machinetoken:me.machine.machineId,
                machinename:me.machine.name,
            },
            success:function(data){
                console.log(data);
                successCb(data);
            },error:function(){
                errorCb();

            }
        })
    }

    /**
     * Télécharge récusivement les éléments à télécharger
     * @private
     */
    dwdNext(){
        this.emit(EVENT_UPDATING);
        let me=this;
        /** @property {ContenuModel} contenu */
        for(let contenu of me.data.json.contenus){

            //à chaque fois qu'un fichier doit être téléchargé rapelle la fonction en récusrsif.

            //dwd thumb
            contenu.localThumbAbsolute=this.localStoragePath+"/"+contenu.localThumb;
            FileSystemUtils.ensureDirectoryExistence(contenu.localThumbAbsolute);
            if(!fs.existsSync(contenu.localThumbAbsolute)){
                this.emit(EVENT_DOWNLOADING,"thumb " + contenu.serverThumb);
                FileSystemUtils.download(contenu.serverThumb,contenu.localThumbAbsolute,function(){
                    me.dwdNext();
                });
                return;
            }

            //dwd le gros fichier
            contenu.localFileAbsolute=this.localStoragePath+"/"+contenu.localFile;
            FileSystemUtils.ensureDirectoryExistence(contenu.localFileAbsolute);
            if(!fs.existsSync(contenu.localFileAbsolute)){
                this.emit(EVENT_DOWNLOADING,"file " + contenu.serverFile);
                FileSystemUtils.download(contenu.serverFile,contenu.localFileAbsolute,function(){
                    me.dwdNext();
                });
                return;
            }
        }
        me.emit(EVENT_UPDATED);
        me.emit(EVENT_READY);
        me.syncing=false;

    }

}
module.exports = Sync;