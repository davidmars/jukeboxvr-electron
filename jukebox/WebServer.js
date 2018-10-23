class WebServer {
    constructor(){
        /**
         * Url vers le catalogue (pour iframe)
         * @type {string}
         */
        this.urlCatalogueOnline=window.conf.serverRoot+"/?machinetoken="+machine.machineId;

        /**
         * Url vers le json de synchronisation
         * @type {string}
         */
        this.urlSynchro=window.conf.serverRoot+"/povApi/action/jukeboxSync";
    }
}
module.exports=WebServer;