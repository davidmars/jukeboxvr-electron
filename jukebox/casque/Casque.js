
class Casque {

    constructor(identifier){

        let me=this;
        Casque.all.push(this);

        /**
         * Identifiant du casque
         * @type {string}
         */
        this.identifier=identifier;

        /**
         * Contenu en cours de lecture
         * @type {ContenuModel}
         */
        this.contenu=null;

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
        this.isCharging=true;

        setInterval(function(){
           me.fakeData();
           me.refreshDisplay();
        },100);

        this.$el=null;
        this.$battery=null;
        this.$batteryText=null;

        this.$playCurrent=null;
        this.$playTotal=null;
        this.$playProgress=null;

        this.$contenuName=null;
        this.$contenuImg=null;

    }

    /**
     * @private
     * Génère de fausses données pour tester
     */
    fakeData(){
        if(this.isCharging){
            this.batteryLevel+=Math.random()*0.3;
        }else{
            this.batteryLevel-=Math.random()*0.3;
        }
        this.batteryLevel=Math.max(0,this.batteryLevel);
        this.batteryLevel=Math.min(100,this.batteryLevel);
        if(Math.random()>0.99){
            this.isCharging=!this.isCharging;
        }

        //play progress
        if(this.contenu){
            /*
            if(Math.random()>0.999){
                this.playTime=0;
                this.totalTime=Math.round(60+Math.random()*(60*2));
            }
            */
            this.playTime+=1/10;
            this.playTime=Math.min(this.totalTime,this.playTime);

        }

    }

    refreshDisplay(){
        this.displayBattery();
        this.displayPlayProgress();
    }


    setContenu(contenu){
        this.contenu=contenu;
        if(this.contenu){
            this.playTime=0;
            this.totalTime=60;
            this.$contenuImg.attr("src",this.contenu.localThumbAbsolute);
            this.$contenuName.text(this.contenu.name);
            //this.$display().find(".contenu").removeClass("invisible");
        }else{
            this.$contenuImg.attr("src","jukebox/casque/placeholder.jpg");
            this.$contenuName.text(this.contenu.name);
        }

    }

    /**
     * @private
     * Affiche le niveau de batterie et si c'est en charge ou non
     */
    displayBattery(){
        let level=Math.round(this.batteryLevel);
        if(this.isCharging){
            this.$battery.addClass("charging");
        }else{
            this.$battery.removeClass("charging");
        }
        this.$batteryText.text(level+"%");
        this.$battery.attr("data-level",Math.round(level/10)*10);
    }

    /**
     * @private
     * Affiche le niveau de batterie et si c'est en charge ou non
     */
    displayPlayProgress(){
        this.$playTotal.text(this.toHHMMSS(this.totalTime,false));
        this.$playCurrent.text(this.toHHMMSS(this.playTime,false));
        this.$playProgress.css("width",""+(100/this.totalTime*this.playTime)+"%")
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
    toHHMMSS(timeSeconds,h=true,m=true,s=true) {
        var sec_num = parseInt(timeSeconds, 10); // don't forget the second param
        var hours   = Math.floor(sec_num / 3600);
        var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
        var seconds = sec_num - (hours * 3600) - (minutes * 60);

        if (hours   < 10) {hours   = "0"+hours;}
        if (minutes < 10) {minutes = "0"+minutes;}
        if (seconds < 10) {seconds = "0"+seconds;};
        let r=[];
        if(h){
            r.push(hours);
        }
        if(m){
            r.push(minutes);
        }
        if(s){
            r.push(seconds);
        }

        return r.join(":");
    }

    toggleSelected(){
        this.$el.toggleClass("selected");
    }



    /**
     * Renvoie l'élément DOM de ce casque
     * @return {*|jQuery|HTMLElement}
     */
    $display(){
        let me=this;
        if(!me.$el){
            me.$el=window.ui.$template("jukebox/casque/casque.html");
            me.$el.attr("data-casque",me.identifier);
            me.$el.find(".identifier").text(me.identifier);
        }

        this.$battery=me.$el.find(".battery");
        this.$batteryText=me.$el.find(".battery .text");
        this.$playTotal=me.$el.find(".play-total-time");
        this.$playCurrent=me.$el.find(".play-current-time");
        this.$playProgress=me.$el.find(".play-progress");
        this.$contenuName=me.$el.find(".contenu-name");
        this.$contenuImg=me.$el.find(".img");
        window.ui.setImgSrc("jukebox/casque/placeholder.jpg",this.$contenuImg);

        me.$el.on("click",function(){
            me.toggleSelected()
        });

        return me.$el;



    }

    /**
     * Renvoie la liste des casques selectionnés
     * @returns {Casque[]}
     */
    static selecteds(){
        let r=[];
        for(let c of Casque.all){
            if(c.isSelected()){
                r.push(c);
            }
        }
        return r;
    }

    isSelected(){
        return this.$el.is('.selected');
    }

    /**
     *
     * @param {ContenuModel} contenu
     */
    static setContenuSelecteds(contenu){
        for(let c of Casque.selecteds()){
            c.setContenu(contenu);
        }
        Casque.unselectAll();
    }

    /**
     * Déselectionne tous les casques
     */
    static unselectAll(){
        for(let c of Casque.all){
            c.$el.removeClass("selected");
        }
    }










}

/**
 *
 * @type {Casque[]}
 */
Casque.all=[];

module.exports=Casque;