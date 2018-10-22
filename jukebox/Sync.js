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
            console.log("sync.json va être mis à jour...");
            let json = fs.readFileSync(me.jsonPath);
            json = JSON.parse(json);
            me.data = json;
            console.log("me.data", me.data);
            me.synchroId = me.data.json.synchroId;
            logs.log("la version précédente du contenu était " + this.synchroId)
        } else {
            logs.log("sync.json va être téléchargé pour la première fois...");
        }

        me.doIt();

    }

    doIt(){
        let me=this;
        this.dwdJson(
            function(json){
                if(json.json.synchroId !== me.synchroId){
                    me.setNewJson(json);
                    logs.error("Mise à jour du contenu nécessaire");
                }else{
                    logs.success("Votre contenu est à jour");
                }
                me.dwdNext();
            },
            function(){
                console.error("synchronisation impossible");
                console.error("impossible de télécharger "+me.syncUrl)
                this.emit('EVENT_ERROR');
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
                machinetoken:me.machine.macAddress,
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
        this.emit('EVENT_UPDATING');
        let me=this;
        console.log("me.data (again)",me.data);
        for(let contenu of me.data.json.contenus){
            console.log(contenu.name);
            let local=this.localStoragePath+"/"+contenu.localFile;
            FileSystemUtils.ensureDirectoryExistence(local);
            if(!fs.existsSync(local)){
                console.log("Téléchargement depuis "+contenu.serverFile);
                FileSystemUtils.download(contenu.serverFile,local,function(){
                    me.dwdNext();
                });
                return;
            }
        }
        this.emit('EVENT_UPDATED');

    }

}
module.exports = Sync;