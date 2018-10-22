const fs = require('fs');
class FileWatcher {
    constructor(){
        fs.watch('./wp-dist', function (event, filename) {
            console.log('event is: ' + event);
            if (filename) {
                console.log('filename provided: ' + filename);
                if(filename==="app.css"){
                    let $link=$("[data-file='"+filename+"']");
                    if($link.length){
                        $link.attr("href",$link.attr("data-dir")+"/"+filename+"?"+Math.random());
                    }
                }
            } else {
                console.log('filename not provided');
            }
        });
    }
}
module.exports = FileWatcher;