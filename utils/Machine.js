const os = require('os');
const fs = require('fs');
const EventEmitter = require("event-emitter-es6");
/**
 * Permet d'obtenir l'adresse MAC et le nom de l'ordi
 */
class Machine extends EventEmitter{
    constructor(){
        super();
        let me=this;


        /**
         * Le nom de l'ordi
         * @type {string}
         */
        this.name=os.hostname();

        /**
         * L'identifiant unique du processeur
         * @type {string}
         */
        this.machineId="";
        let exec = require('child_process').exec;
        exec("wmic CPU get ProcessorId",function(error, stdout, stderr){
            let regex = /[\n]([A-Z0-9]*)/m;
            let m;
            if ((m = regex.exec(stdout)) !== null) {
                me.machineId=m[1];
            }
            me.emit(EVENT_READY);
        });
        /**
         * Chemin vers le dossier racine pour le stockage
         * @type {string}
         */
        this.appStoragePath=os.homedir()+"/"+window.conf.appDirectoryStorageName;
        if (!fs.existsSync(me.appStoragePath)) {
            fs.mkdirSync(me.appStoragePath);
        }
    }
}
module.exports = Machine;