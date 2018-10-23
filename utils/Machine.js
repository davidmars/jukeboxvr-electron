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
         * L'adresse mac
         * @type {string}
         */
        this.machineId="";
        /**
         * Le nom de l'ordi
         * @type {string}
         */
        this.name=os.hostname();

        var exec = require('child_process').exec;
        let test=exec("wmic CPU get ProcessorId",function(error, stdout, stderr){
            let regex = /[\n]([A-Z0-9]*)/m;
            let m;
            if ((m = regex.exec(stdout)) !== null) {
                console.log("test",m[1]);
                me.machineId=m[1];
            }
            me.emit("EVENT_READY");
        });
        /**
         * Chemin vers le dossier racine pour le stockage
         * @type {string}
         */
        this.appStoragePath=os.homedir()+"/jukeboxvr";
        if (!fs.existsSync(me.appStoragePath)) {
            fs.mkdirSync(me.appStoragePath);
        }
        /*
        let networks=os.networkInterfaces();
        console.log("networkInterfaces",networks);
        Object.keys(networks).forEach(function(key,index) {
            let net=networks[key];
            for(let adr of net){
                if(!adr.internal){
                    if(adr.mac){
                        me.machineId=adr.mac;
                        break;
                    }
                }

            }
        });
        */
    }
}
module.exports = Machine;