class Casque {

    constructor(){
        /**
         * Identifiant du casque
         * @type {string}
         */
        this.identifier="";

        /**
         * Contenu en cours de lecture
         * @type {ContenuModel}
         */
        this.contenu=null;


        /**
         * Est en cours de lecture ou non
         * @type {boolean}
         */
        this.isPlaying=false;
        /**
         * position de lecture en secondes
         * @type {number}
         */
        this.playTime=0;

        /**
         * Duréen en seconde de la lecture
         * @type {number}
         */
        this.totalTime=120;

        /**
         * Niveau de batterie de 0 à 100
         * @type {number}
         */
        this.batteryLevel=0;
        /**
         * Est en cours de charge ou non
         * @type {boolean}
         */
        this.isChaging=false;

        /**
         * true si le casque est selectionné
         * @type {boolean}
         */
        this.isSelected=false;


    }

    setContenu(contenu){
        this.contenu=contenu;
        if(this.contenu){
            this.$display().find(".contenu img").attr("src",this.contenu.localThumbAbsolute);
            this.$display().find(".contenu .name").text(this.contenu.name);
            this.$display().find(".contenu").removeClass("invisible");
        }else{
            this.$display().find(".contenu").addClass("invisible");
        }

    }


    /**
     * Renvoie l'élément DOM de ce casque
     * @return {*|jQuery|HTMLElement}
     */
    $display(){
        let me=this;
        let $template=$("[data-casque='"+me.identifier*+"']");
        if(!$template.length){
            let $template=window.ui.$template("jukebox/casque.html");
            $template.attr("data-casque",me.identifier);
            $template.find(".identifier").text(me.identifier);

        }
        return $template;
    }



}

module.exports=Casque;