/**
 * L'interface utilisateur
 * @type {Electron}
 */
var electron = require('electron');
var win = electron.remote.getCurrentWindow();
var $ = require("jquery");
var $btnFS=$(".js-toggle-fs");
/**
 * Entre ou sort du full screen
 */
function toggleFS(){
    win.setFullScreen(!win.isFullScreen());
    win.setMenuBarVisibility(!win.isFullScreen());
}
$btnFS.on("click",function(e){
    toggleFS();
});