const electron = require('electron');
const win = electron.remote.getCurrentWindow();
const fs = require("fs");
const path = require('path');
const ContenuModel = require("./ContenuModel");
/**
 * L'interface utilisateur
 * @type {Electron}
 */
class UI{
    constructor(){
        //injecte la nav
        let $nav=this.$template("jukebox/nav.html");
        $body.prepend($nav);
        //charge le catalogue
        this.chargeCatalogueOnline();
        //initialise les écouteurs
        this._initDomListeners();
        /**
         * Conteneur des contenus
         */
        this.$contenus=$body.find("#contenus");

        /**
         * Element html où sont inscrites les logs
         * @type {*|jQuery|HTMLElement}
         */
        this.$logs=$("#logs");



        this.$navOnline=$('[data-nav-screen="online"]');
        this.$navSync=$('.js-sync');
    }

    /**
     *
     * @param {array} contenus
     */
    updateContenus(contenus){
        this.$contenus.empty();
        for(let contenu of contenus){
            this.addContenu(contenu);
        }
    }

    /**
     * @private
     * @param data
     */
    addContenu(data){
        let contenu=new ContenuModel(data);
        this.$contenus.append(contenu.$display());
    }

    setOnline(online){
        if(online){
            this.$navOnline.removeClass("d-none");
            this.$navSync.removeClass("text-danger");
            this.chargeCatalogueOnline();
        }else{
            this.$navSync.addClass("text-danger");
            this.$navOnline.addClass("d-none");
            this.chargeCatalogueOnline();
        }
    }


    /**
     * Pour charger un template html
     * @param {string} htmlFilePath Chemin vers le fichier html
     * @return {*|jQuery|HTMLElement}
     */
    $template(htmlFilePath){
        let template = fs.readFileSync(htmlFilePath,{encoding: 'utf-8'});
        return $(template);
    }

    /**
     * Affiche l'écran spécifié
     * @param screenName
     */
    goScreen(screenName){
        $("[data-screen]").removeClass("active");
        this.$screen(screenName).addClass("active");
        $("[data-nav-screen]").parent().removeClass("active");
        $("[data-nav-screen='"+screenName+"']").parent().addClass("active");
        if(screenName==="online"){
            this.chargeCatalogueOnline();
        }
    }

    /**
     * Renvoie le nom de l'écran courrant
     * @return {string}
     */
    getCurrentScreen(){
        return $("[data-screen].active").attr("data-screen");
    }

    /**
     *
     * @param {string} screenName
     * @return {*|jQuery|HTMLElement}
     */
    $screen(screenName){
        return $("[data-screen='"+screenName+"']");
    }

    chargeCatalogueOnline(){
        let $iframe=this.$screen("online").find("iframe");
        $iframe.attr("src",window.webServer.urlCatalogueOnline);
        if($iframe.attr("src")==="webserveur.urlCatalogueOnline"){

        }else{

        }

    }

    /**
     * Initialise les écouteurs sur le dom
     * @private
     */
    _initDomListeners(){
        let me =this;

        $(".js-toggle-fs").on("click",function(e){
            UI.toggleFS();
        });
        $("[data-nav-screen]").on("click",function(e){
            me.goScreen($(this).attr("data-nav-screen"));
        });

    }
    /**
     * Entre ou sort du full screen
     */
    static toggleFS(){
        win.setFullScreen(!win.isFullScreen());
        win.setMenuBarVisibility(!win.isFullScreen());
    }
}
module.exports = UI;




