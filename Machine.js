const os = require('os');

export default class Machine {
    constructor(){
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

        let networks=os.networkInterfaces().Ethernet;
        for(let adr of networks){
            if(adr.mac){
                this.macAddress=adr.mac;
                break;
            }
        }


    }
}