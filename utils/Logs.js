const EventEmitter = require("event-emitter-es6");

class Logs extends EventEmitter{
    constructor(){
        super();
        this.html="";
    }

    /**
     *
     * @param string
     */
    log(string){
        this.html = "<div class='log'>" + string + "</div>" + this.html;
        this.emit(EVENT_CHANGE);
    }
    error(string) {
        this.html = "<div class='error'>" + string + "</div>" + this.html;
        this.emit(EVENT_CHANGE);
    }
    success(string) {
        this.html = "<div class='success'>" + string + "</div>" + this.html;
        this.emit(EVENT_CHANGE);
    }

}
module.exports=Logs;