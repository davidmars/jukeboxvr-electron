const os = require('os');
const fs = require('fs');
/**
 * Permet d'obtenir l'adresse MAC et le nom de l'ordi
 */
class Machine {
    constructor(){
        let me=this;
        /**
         * L'adresse mac
         * @type {string}
         */
        this.macAddress="";
        /**
         * Le nom de l'ordi
         * @type {string}
         */
        this.name=os.hostname();

        /**
         * Chemin vers le dossier racine pour le stockage
         * @type {string}
         */
        this.appStoragePath=os.homedir()+"/jukeboxvr";
        if (!fs.existsSync(me.appStoragePath)) {
            fs.mkdirSync(me.appStoragePath);
        }

        let networks=os.networkInterfaces();
        Object.keys(networks).forEach(function(key,index) {
            let net=networks[key];
            for(let adr of net){
                if(!adr.internal){
                    if(adr.mac){
                        me.macAddress=adr.mac;
                        break;
                    }
                }

            }
        });
    }
}
module.exports = Machine;