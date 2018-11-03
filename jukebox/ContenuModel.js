
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
    }

    /**
     * Renvoie l'élément DOM de ce contenu
     * @return {*|jQuery|HTMLElement}
     */
    $display(){
        let me=this;
        let $template=window.ui.$template("jukebox/contenu.html");
        $template.find(".js-title").text(this.name)
        $template.find("img.card-img-top").attr("src",this.localThumbAbsolute);
        $template.on("click",function(e){
           window.mediaPlayer.play(me.localFileAbsolute);
        });
        return $template;
    }

}
module.exports = ContenuModel;