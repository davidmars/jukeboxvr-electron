const Casque = require("../casque/Casque");
/**
 * Représente un contenu
 */
class ContenuModel {

    constructor(data){
        this.uid=data.uid;
        this.fileUid=data.fileUid;
        this.contenuUid=data.contenuUid;
        this.name=data.name;
        this.serverFile=data.serverFile;
        this.localFile=data.localFile;
        this.serverThumb=data.serverThumb;
        this.localThumb=data.localThumb;
        this.isCopied=false;
        /**
         * Url absolue du fichier à jouer dans le système de fichiers
         * @type {string}
         */
        this.localFileAbsolute=machine.appStoragePath+"/"+data.localFile;
        /**
         * Url absolue de la vignette dans le système de fichiers
         * @type {string}
         */
        this.localThumbAbsolute=machine.appStoragePath+"/"+data.localThumb;
        /**
         *
         * @type {null}
         */
        this.$copied=null;

    }

    /**
     * Renvoie l'élément DOM de ce contenu
     * @return {*|jQuery|HTMLElement}
     */
    $display(){
        let me=this;
        let $template=window.ui.$template("jukebox/contenu/contenu.html");
        $template.find(".js-title").text(this.name);
        $template.find("img.card-img-top").attr("src",this.localThumbAbsolute);
        $template.on("click",function(e){
           Casque.setContenuSelecteds(me);
        });
        this.$copied=$template.find("[casque-copied]");
        if(this.isCopied){
            this.$copied.addClass("copied");
        }else{
            this.$copied.removeClass("copied");
        }
        this.$copied.on("click",function(e){
            e.preventDefault();
            e.stopPropagation();
            //$(this).toggleClass("copied");
            me.setIsCopied(!me.isCopied);
        });

        me.setIsCopied(Casque.isContenuCopied(me));




        return $template;



    }

    setIsCopied(copied=false){
        this.isCopied=copied;
        if(this.isCopied){
            this.$copied.addClass("copied");
        }else{
            this.$copied.removeClass("copied");
        }
        if(this.isCopied){
            Casque.pushContenu(this);
        }else{
            Casque.removeContenu(this);
        }
    }

}
module.exports = ContenuModel;