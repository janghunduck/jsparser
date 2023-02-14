
var llog = '';


var logger = function(){
    llog = '============================= start log ====================================';
}

logger.prototype.log = function(str1, str2){
   llog = llog + '\n' + str1 + str2;
   
}

logger.prototype.lo = function(str1){
   llog = llog + '\n' + str1;

}

function loa(){
  llog = llog + '\n' + str1;
}

var logger = new logger();

