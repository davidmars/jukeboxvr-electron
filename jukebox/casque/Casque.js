const FileSystemUtils = require("../../utils/FileSystemUtils");
const fs = require("fs");
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http , { wsEngine: 'ws' , pingInterval:1000});

let switchplay = true;


class Casque {

    constructor(identifier, deviceId) {

        let me=this;

        Casque.all.push(this);
        Casque.allByDeviceId[deviceId] = this;
        Casque.allByIdentifier[identifier] = this;

        /**
         * Identifiant du casque
         * @type {string}
         */
        this.identifier = identifier;
        /**
         * Identifiant adb
         * @type {string}
         */
        this.deviceId = deviceId;

        /**
         * Liste des fichiers présents sur le casque
         * @type {String[]}
         * @private
         */
        this._files = [];

        /**
         * Identifiant socket du casque
         * @type {int}
         */
        this.sockID = 0;


        /**
         * Contenu en cours de lecture
         * @type {ContenuModel}
         */
        this.contenu = null;

        /**
         * position de lecture en secondes
         * @type {number}
         */
        this.playTime = 0;

        /**
         * Duréen en seconde de la lecture
         * @type {number}
         */
        this.totalTime = 120;

        /**
         * Niveau de batterie de 0 à 100
         * @type {number}
         */
        this.batteryLevel = 0;
        /**
         * Est en cours de charge ou non
         * @type {boolean}
         */
        this.isCharging = true;
        /**
         * Si true le casque est connecté en ADB
         * @type {boolean}
         */
        this.adbConnected=false;
        /**
         * Si > 0 c'est que le socket semble fonctionner
         * @type {int}
         */
        this.socketConnected=0;


        /**
         * true si tous les fichiers sont copiés sur le casque
         * @type {boolean}
         */
        this.isSyncro=false;


        /**
         * true si un ou des fichiers sont en cours de copie
         * @type {boolean}
         */
        this.isSynchroBusy=false;


        setInterval(function () {
            //me._fakeData();
            //me.isSyncro=Math.random()>0.5;
            me.socketConnected--;
            me.refreshDisplay();
        }, 100);


        this.$el = null;
        this.$battery = null;
        this.$batteryText = null;
        this.$playCurrent = null;
        this.$playTotal = null;
        this.$playProgress = null;
        this.$contenuName = null;
        this.$contenuImg = null;
        this.$adb=null;
        this.$socket=null;
        this.$synchroBusy=null;
        this.$synchro=null;
        //ajoute le casque dans le HTML
        window.ui.addCasque(this);

        /**
         *
         * @type {mixed}
         */
        this.adbClient = null;
    }

    /**
     * Ajoute le contenu sur le casque
     * @param {ContenuModel} contenu
     * @param {function} onComplete appelé quand c'est ok
     */
    addContenu(contenu,onComplete){
        alert("add contenu !!");
        let me=this;
        let files=[];
        files.push(contenu.localFileAbsolute);
        let toCopy=files.length;
        /**
         * Teste si tous les fichiers sont copiés
         */
        let testFinished=function(){
            if(toCopy<=0){
                onComplete();
            }
        };

        for(let file of files){
            if(this._fileExists(file)){
               toCopy--;
                testFinished();
            }else{
                this._adbPushFile(
                    file
                    ,function(){
                        console.log("copie en cours "+file+" sur casque "+me.identifier);
                    },
                    function(){
                        toCopy--;
                        console.log("copie terminée de "+file+" sur casque "+me.identifier);
                        testFinished();
                    }
                );
            }

        }




    }

    /**
     * Teste si un fichier existez
     * @param {string} file
     * @return {bool}
     * @private
     */
    _fileExists(file){
        return this._files.indexOf(file)> -1;
    }


    /**
     *
     * @private
     */
    _adbPushFile(filePath, onProgress, onComplete){

        let me=this;

        if(!this._fileExists(filePath)){
            console.log("copie "+filePath + "sur " + me.deviceId);
            console.log("File exist pas !");
            me.isSynchroBusy=true;
            //TODO utiliser cette méthode pour la copie de fichiers

            Casque.adbClient.push(me.deviceId, window.machine.appStoragePath+"/"+filePath,'/sdcard/Download/'+filePath)
                .then(function (transfer) {
                    return new Promise(function (resolve, reject) {
                        transfer.on('progress', function (stats) {
                            console.log('[%s] Pushed %d bytes so far',
                                me.deviceId,
                                stats.bytesTransferred)
                        });
                        transfer.on('end', function () {
                            console.log('[%s] Push complete', me.deviceId);
                            me.isSynchroBusy=false;
                            resolve()
                        });
                        transfer.on('error', reject)
                    })
                })
                .catch(function(error){
                    console.error("erreur transfer = ",error);
                    me.isSynchroBusy=false;
                });
        }else{
            me.isSynchroBusy=false;
        }


    }

    /**
     *
     * @private
     */
    _adbDelete(filePath , onComplete){

        let me=this;

        if(this._fileExists(filePath)){
            console.log("remove "+filePath);

            Casque.adbClient.shell(me.deviceId, 'rm -f '+'/sdcard/Download/'+filePath, function(err, output){

                console.log("delete outpout" , output );
                if ( err === null )
                {
                    console.log("Delete Successeful " , filePath);
                    me.isSynchroBusy=false;
                }
                else
                {
                    console.log("delete = " ,e );
                }


            });
            //this.isCop
            //do it
        }
    }

    /**
     *
     * @private
     */
    _adbGetFiles(Path){

    }



    /**
     *
     * Génère de fausses données pour tester
     * @private
     */
    _fakeData() {
        if (this.isCharging) {
            this.batteryLevel += Math.random() * 0.3;
        } else {
            this.batteryLevel -= Math.random() * 0.3;
        }
        this.batteryLevel = Math.max(0, this.batteryLevel);
        this.batteryLevel = Math.min(100, this.batteryLevel);
        if (Math.random() > 0.99) {
            this.isCharging = !this.isCharging;
        }

        //play progress
        if (this.contenu) {
            /*
             if(Math.random()>0.999){
             this.playTime=0;
             this.totalTime=Math.round(60+Math.random()*(60*2));
             }
             */
            this.playTime += 1 / 10;
            this.playTime = Math.min(this.totalTime, this.playTime);

        }

    }

    /**
     * Renvoie true si le casque est sélectionné
     * @return {boolean}
     */
    isSelected() {
        return this.$el.is('.selected');
    }

    /**
     * Défini le contenu du casque
     * @param {ContenuModel} contenu
     */
    setContenu(contenu) {
        this.contenu = contenu;
        //teste si le fichier est sur le casque
        if(!this._fileExists(contenu.localFile)){
            alert("pas sur le casque "+this.identifier);
            return;
        }


        if (this.contenu) {
            this.playTime = 0;
            this.totalTime = 60;
            this.$contenuImg.attr("src", this.contenu.localThumbAbsolute);
            this.$contenuName.text(this.contenu.name);
        } else {
            this.$contenuImg.attr("src", "jukebox/casque/placeholder.jpg");
            this.$contenuName.text(this.contenu.name);
        }
        //TODO VICTOR lancer une commande Socket pour afficher le contenu dans le casque

        function ServerMessage(){
            this.id = 0;
            this.battery = false;
            this.changelanguage = false;
            this.language = "";
            this.startsession = false;
            this.stopsession = false;
            this.calibrate = false;
            this.opencalibration = false;
            this.videoPath ="";
            this.msg = "default";
        }

        var tmp = new ServerMessage();
        tmp.id = this.identifier;
        tmp.videoPath = contenu.localFile;
        tmp.startsession = true;
        console.log(contenu.localFile);

        io.to(this.sockID).emit('chat' , tmp );

    }

    /**
     * Rafraichit l'affichage html du casque
     */
    refreshDisplay() {
        this.displayBattery();
        this.displayPlayProgress();
        if(this.adbConnected){
            this.$adb.addClass("active");
        }else{
            this.$adb.removeClass("active");
        }
        if(this.socketConnected>0){
            this.$socket.addClass("active");
            this.$display().removeClass("disabled")
        }else{
            this.$socket.removeClass("active");
            this.$display().addClass("disabled")
        }
        if(this.isSynchroBusy){
            this.$synchroBusy.addClass("active");
        }else{
            this.$synchroBusy.removeClass("active");
        }
        if(this.isSyncro){
            this.$synchro.addClass("active");
        }else{
            this.$synchro.removeClass("active");
        }
    }

    /**
     * Affiche le niveau de batterie et si c'est en charge ou non
     * @private
     */
    displayBattery() {
        let level = Math.round(this.batteryLevel);
        if (this.isCharging) {
            this.$battery.addClass("charging");
        } else {
            this.$battery.removeClass("charging");
        }
        this.$batteryText.text(level + "%");
        this.$battery.attr("data-level", Math.round(level / 10) * 10);
    }

    /**
     * Affiche l'état de lecture
     * @private
     */
    displayPlayProgress() {
        this.$playTotal.text(Casque.toHHMMSS(this.totalTime, false));
        this.$playCurrent.text(Casque.toHHMMSS(this.playTime, false));
        this.$playProgress.css("width", "" + (100 / this.totalTime * this.playTime) + "%")
    }

    /**
     * Selectionne ou désélection le casque
     */
    toggleSelected() {
        this.$el.toggleClass("selected");
    }

    /**
     * Renvoie l'élément DOM de ce casque
     * @return {*|jQuery|HTMLElement}
     */
    $display() {
        let me = this;
        if (!me.$el) {
            me.$el = window.ui.$template("jukebox/casque/casque.html");
            me.$el.attr("data-casque", me.identifier);
            me.$el.find(".identifier").text(me.identifier);
        }
        this.$battery = me.$el.find(".battery");
        this.$batteryText = me.$el.find(".battery .text");
        this.$playTotal = me.$el.find(".play-total-time");
        this.$playCurrent = me.$el.find(".play-current-time");
        this.$playProgress = me.$el.find(".play-progress");
        this.$contenuName = me.$el.find(".contenu-name");
        this.$contenuImg = me.$el.find(".img");
        this.$adb = me.$el.find(".adb");
        this.$socket = me.$el.find(".socket");
        this.$synchro = me.$el.find(".synchro");
        this.$synchroBusy = me.$el.find(".synchroBusy");
        window.ui.setImgSrc("jukebox/casque/placeholder.jpg", this.$contenuImg);
        me.$el.on("click", function () {
            me.toggleSelected()
        });
        return me.$el;
    }

    /**
     * Convertit des secondes en heures minutes secondes
     * @private
     * @param timeSeconds
     * @param h
     * @param m
     * @param s
     * @returns {string}
     */
    static toHHMMSS(timeSeconds, h = true, m = true, s = true) {
        var sec_num = parseInt(timeSeconds, 10); // don't forget the second param
        var hours = Math.floor(sec_num / 3600);
        var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
        var seconds = sec_num - (hours * 3600) - (minutes * 60);

        if (hours < 10) {
            hours = "0" + hours;
        }
        if (minutes < 10) {
            minutes = "0" + minutes;
        }
        if (seconds < 10) {
            seconds = "0" + seconds;
        }
        let r = [];
        if (h) {
            r.push(hours);
        }
        if (m) {
            r.push(minutes);
        }
        if (s) {
            r.push(seconds);
        }

        return r.join(":");
    }

    //-----------------statiques---------------------------------------

    /**
     * Retourne un Casque par son numéro.
     * Il faut que le casque soit référencé préalablement pour que ça marche
     * @param identifier
     * @returns {Casque|null}
     */
    static getCasqueByIdentifier(identifier) {
        if (Casque.allByIdentifier[identifier]) {
            return Casque.allByIdentifier[identifier];
        }
        console.error("Le casque ayant pour numéro "+identifier+" n'existe pas");
        return null;
    }

    /**
     * Retourne un Casque par son id ADB.
     * - Si le casque est instancié, le renvoie
     * - Si le casque est dans le json mais pas instancié, l'instancie et le renvoie
     * - Si le casque n'existe pas dans le json demandera à l'utilisateur son numéro, enregistrera le json, l'instanciera et le renverra
     * @param {string} deviceId L'identifiant ADB
     * @return {Casque}
     */
    static getCasqueByDeviceId(deviceId) {
        console.log("deviceId", deviceId);
        if (Casque.allByDeviceId[deviceId]) {
            return Casque.allByDeviceId[deviceId];
        }
        if (Casque.configJson.casques[deviceId]) {
            return new Casque(Casque.configJson.casques[deviceId].identifier, deviceId);
        }
        else {
            const dialog = require('electron').remote.dialog;
            const options = {
                type: 'question',
                buttons: ['1', '2', '3', '4', '5', "annuler"],
                defaultId: 5,
                title: 'Question',
                message: 'Veuillez inquer le numéro du casque que vous vennez de brancher pour la première fois'
            };
            dialog.showMessageBox(null, options, (response) => {
                if (response === 6) {
                    return null;
                }
                else {
                    Casque.configJson.casques[deviceId] = {
                        "identifier":response + 1
                    };
                    Casque._saveConfig();
                    return Casque.getCasqueByDeviceId(deviceId);
                }
            });
        }
    }

    /**
     * Initialise la liste des casques, lance les écouteurs ADB et socket etc...
     */
    static initAll() {
        //teste si le json existe
        if (!fs.existsSync(window.machine.jsonCasquesConfigPath)) {
            //save le config vierge
            Casque._saveConfig();
            return Casque.initAll(); //appel récursif
        }
        let json = fs.readFileSync(window.machine.jsonCasquesConfigPath);
        json=JSON.parse(json);
        //teste si la structure du json est correcte
        if(typeof json !== 'object' || !json.casques){
            //si incorrecte efface le json et le recréra proprement au prochaiun appel.
            fs.unlinkSync(window.machine.jsonCasquesConfigPath);
            return Casque.initAll(); //appel récursif
        }

        //si tout va bien on va utiliser la config chargée
        Casque.configJson = json;

        //initialise les casques à partir de ce qui a été trouvé dans le json
        for (let deviceId in Casque.configJson.casques) {
            if (!Casque.configJson.casques.hasOwnProperty(deviceId)) continue;
            Casque.getCasqueByDeviceId(deviceId);
        }
        //initilise les écouteurs ADB
        Casque._initADB();
        //initialise les échanges socket
        setTimeout(function(){

            Casque._initSocket();

        }, 100);

    }

    /**
     * Initialise l'écoute ADB
     */
    static _initADB() {
        let adb = require('adbkit');
        let Promise = require('bluebird');
        Casque.adbClient = adb.createClient();
        Casque.adbClient.trackDevices()

            .then(function (tracker) {
                tracker.on('add', function (device) {

                    console.log('Device %s was plugged in', device.id);

                    let casque=Casque.getCasqueByDeviceId(device.id);
                    casque.adbConnected=true;
                    casque.refreshDisplay();

                });
                tracker.on('remove', function (device) {
                    console.log('Device %s was unplugged', device.id)
                    let casque=Casque.getCasqueByDeviceId(device.id);
                    casque.adbConnected=false;
                    casque.refreshDisplay();
                });
                tracker.on('end', function () {
                    console.log('Tracking stopped')
                });
            })
            .catch(function (err) {
                console.error('Something went wrong:', err.stack)
            });

    }

    /**
     * initialise les sockets des casques
     * @private
     */
    static _initSocket(){


        http.listen(3000, function(){
            console.log('listening on *:3000');
        });



        io.on('connection', function(socket){
            let identifier = socket.handshake.address.toString().substring(socket.handshake.address.toString().length-2 , socket.handshake.address.toString().length);
            console.log("device connected " + identifier);
            let casque = Casque.getCasqueByIdentifier(identifier);
            casque.sockID = socket.id;
            io.to(socket.id).emit('setid', identifier );

            //Connection here
            function ServerMessage(){
                this.id = 0;
                this.battery = false;
                this.changelanguage = false;
                this.language = "";
                this.startsession = false;
                this.stopsession = false;
                this.calibrate = false;
                this.opencalibration = false;
                this.videoPath = "";
                this.msg = "default";
            }


            setTimeout(function(){

                var tmp = new ServerMessage();
                tmp.id = identifier;
                tmp.msg = "Connected to server !";
                io.emit( 'chat', tmp )

            }, 500);




            socket.on('chat', function(msg){ // exemple receive

                //io.emit('chat', msg); // exemple emit
                var json = JSON.parse(msg);
                console.log("msg json from ", json.id," = ",json);
                //let casque = Casque.getCasqueByIdentifier(json.id);
                if(casque){
                    casque.socketConnected=1000;
                    if(json.batterylevel){
                        casque.batteryLevel=json.batterylevel;
                    }
                    if ( json.currentPlayTime > -1 ){
                        //console.log("json.currentPlayTime = " + json.currentPlayTime);
                        casque.playTime = json.currentPlayTime;
                    }

                    if ( json.totalPlaytime > 0 ){
                        //console.log("json.totalPlaytime = " + json.totalPlaytime);
                        casque.totalTime = json.totalPlaytime;
                    }

                    if ( json.fileList && json.fileList.length)
                    {
                        casque._files =json.fileList;
                        for ( let i = 0 ; i<casque._files.length ;  i++)
                        {
                            casque._files[i] =casque._files[i].split("\\").join("/");

                        }
                    }

                    casque._syncContenus();

                    //console.error(casque._files);
                    casque.refreshDisplay();
                }


                if ( json.id === 40 && json.msg !== "test" && json.msg !== "ApplicationQuit") // testing start and stop;
                {
                    console.log("40 send message");
                    var tmp = new ServerMessage();
                    //tmp.id = -1;

                    if ( switchplay)
                    {
                        tmp.startsession = true;
                        tmp.msg = "Starting session";
                    }
                    else
                    {
                        tmp.stopsession = true;
                        tmp.videoPath = Math.floor(Math.random() * 3);
                        tmp.msg = "Stoppting session";
                    }
                    switchplay = !switchplay;


                    Casque.all.forEach(function(element)
                    {
                     if ( element.isSelected() )
                     {
                         console.log("Send message to " , element);
                         tmp.id = element.identifier;
                         io.to(element.sockID).emit('chat', tmp);
                     }

                    });

                }


            });

            socket.on('disconnect', function(){
                let casque = Casque.getCasqueByIdentifier(identifier);
                casque.socketConnected = 0;
                console.log('user disconnected '+ identifier);
            });


        });


    }

    /**
     * Enregistre la configuration des casques dans le json
     * @private
     */
    static _saveConfig() {
        console.error("Enregistre le json de config des casques",Casque.configJson);
        fs.writeFileSync(window.machine.jsonCasquesConfigPath, JSON.stringify(Casque.configJson,undefined, 2));
    }

    /**
     * Renvoie la liste des casques selectionnés dans l'ui
     * @returns {Casque[]}
     */
    static selecteds() {
        let r = [];
        for (let c of Casque.all) {
            if (c.isSelected()) {
                r.push(c);
            }
        }
        return r;
    }

    /**
     * Déselectionne tous les casques
     */
    static unselectAll() {
        for (let c of Casque.all) {
            c.$el.removeClass("selected");
        }
    }



    /**
     * Attribue le contenu donné à tous les casques selectionnés
     * @param {ContenuModel} contenu
     */
    static setContenuSelecteds(contenu) {
        for (let c of Casque.selecteds()) {
            c.setContenu(contenu);
        }
        Casque.unselectAll();
    }

    /**
     * Copie le contenu sur tous les casques
     * @param {ContenuModel} contenu
     */
    static pushContenu(contenu){
        if(!Casque.configJson.contenusCopied){
            Casque.configJson.contenusCopied={}
        }
        Casque.configJson.contenusCopied[contenu.localFile]="1";
        Casque._saveConfig();
    }
    /**
     * Supprime le contenu sur tous les casques
     * @param {ContenuModel} contenu
     */
    static removeContenu(contenu){
        if(!Casque.configJson.contenusCopied){
            Casque.configJson.contenusCopied={}
        }
        if(Casque.configJson.contenusCopied[contenu.localFile]){
            delete Casque.configJson.contenusCopied[contenu.localFile];
        }
        Casque._saveConfig();
    }


    /**
     * Synchronise les contenus qui doivent l'être sur le casques
     */
    _syncContenus(){
        let casque=this;


        if ( this.isSynchroBusy )
        {
            return false;
        }

        console.log("Synchro contenu ?");

        //ajoute les fichiers
        for (var file in Casque.configJson.contenusCopied) {
            if (Casque.configJson.contenusCopied.hasOwnProperty(file)) {
                if(!this._fileExists(file)){
                    this.isSyncro=false;
                    if(this.adbConnected){
                        this.isSynchroBusy= true;
                        casque._adbPushFile(file);
                        return false;
                    }
                }
            }
        }


        //efface les fichiers innutiles
        for (var casqueFile of casque._files) {
                if (!Casque.configJson.contenusCopied[casqueFile]) {
                    if(this._fileExists(file)) {
                        this.isSyncro = false;
                        if(this.adbConnected) {
                            this.isSynchroBusy = true;
                            casque._adbDelete(casqueFile);
                            return false;
                        }
                    }
                }

        }

        this.isSyncro = true;
        this.refreshDisplay();
        return true;
    }



    /**
     * Dit si un contenu est copié sur tous les casques ou pas
     * (se base sur le json pour dire ça)
     * @param {ContenuModel} contenu
     * @returns {boolean}
     */
    static isContenuCopied(contenu){
        return Casque.configJson.contenusCopied[contenu.localFile]? true : false;
    }


}

/**
 * Structure de ce qui est enregistré dans le json de config des casques
 * @type {{casques: {}}}
 */
Casque.configJson = {
    casques: {},
    contenusCopied:{}
};
/**
 * Tous les casques référencés
 * @type {Casque[]}
 */
Casque.all = [];

/**
 * Liste des casques indexée par deviceid (ADB)
 */
Casque.allByDeviceId = {};
/**
 *
 * Liste des casques indexée par numéros (ip, socket)
 */
Casque.allByIdentifier = {};


module.exports = Casque;

