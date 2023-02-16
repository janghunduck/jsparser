




function findChar(str, char){
    for(var i=0; i < str.length-1; i++) {
        if (str.charAt(i) === char){
              //if (str[i] === char) {               /* IE8 이하에서는 string 을 배열과 같이 접근할 수 없다. */
              return i;
        }
    }
    return -1;
}

function checkStringInArray(arr, checkString){
    for(var i=0; i < arr.length; i++) {
        if (arr[i] === checkString) {
          return true;
        }
    }
    return false;
}

function getFileAbsolutePath(){
    var currfile = window.location.pathname;

    var idx = currfile.lastIndexOf('/');
    return currfile.substr(0, idx);
}



// 브라우져 자체에서 현재 파일 정보를 접근한다.
// Console UI에서 파일명을 받아올 경우

function getFileAbsolutePath(fname){
    //console.log("fname = ", fname)
    var currfile = '';
    if (fname === undefined){
        currfile = window.location.pathname;
    } else {
        currfile = fname;
    }
    var idx = currfile.lastIndexOf('/');
    return currfile.substr(0, idx);
}


// 반복되는 문자열이 몊개인지 카운터 한다.   ('../../aaa', '..') 는 2개이다.
function countRepeatStr(str, target) {
    var pos = 0;
    var i = 0;

    while(true) {
        var foundPos = str.indexOf(target, pos);
        if(foundPos === -1) break;
        pos = foundPos + 1;	// as를 찾게 되면, 다음 위치에서 다시 찾습니다.

        i++;
    }

    return i;
}

// 역순으로 delmiter에 해당되는 것을 지워나간다.
function delRepeatLastStr(str, delimiter, count) {  // ('x@y@z', '@', 2 )  @y@z 를 지우고  x 만 남는다.
    var i = 0;
    for (var i=0; i < count; i++){
        var foundPos = str.lastIndexOf(delimiter);
        str = str.substr(0, foundPos);

    }
    return str;
}


function rangestr(s, c1, c2){

    //var str = s.trim();             /* trim() 은 IE8 이상에서 지원한다. */
    var str = s;
    var starti = str.indexOf(c1) + 1;

    str = str.substring(starti);
    var endi = str.indexOf(c2);

    return str.substr(0, endi);
}

// 문자열 s 에서 특정문자 c 가 몋개가 있는가?
function charcount(s, c){
  var count = 0;

  for (var i=0; i< s.length;i++){
     //console.log("", s.charAt(i));
     if (s.charAt(i) === c) {
         count = count + 1
     }
  }
  return count;
}

function makeobject(str){
    var obj = {}, items = str.split(",");
    for ( var i = 0; i < items.length; i++ )
        obj[ items[i] ] = false;
    return obj;
}

function makearray(str){
	 var arr = [], items = String(str).split(",");
	 for ( var i = 0; i < items.length; i++ )
		arr[i] = items[i];
	 return arr;
}



/**
IE8 이하일 때 맹글어서 써야한다.
<!--[if lte IE 8]>
<script type="text/javascript">
String.prototype.trim = function() {
    return this.replace(/^\s+|\s+$/g,"");
}
</script>
<![endif]-->
*/


function trim_l(s){
    if (s === '') return '';
    while(s){
        var c = s.charAt(0);
        if (c === ' '){
            s = s.substring(1);
        } else {
            return s;
        }
        
        if (s.length === 0)  return s;
    }
}

function trim_r(s){
    if (s === '') return '';
    while(s){
        var c = s.charAt(s.length-1);
        if (c === ' '){
            s = s.substring(s.length-1, 1);
        } else {
            return s;
        }
        if (s.length === 0)  return s;
   }
}

// flowjs를 통해서는 호출되지 않음.
function trim(s){
    s = trim_l(s);
    s = trim_r(s);
    
    return s;
}



/*
String.prototype.c_trim_l = function(s){
    if (s === '') return '';
    while(s){
        var c = s.charAt(0);
        if (c === ' '){
            s = s.substring(1);
        } else {
            break;
        }

        if (s.length === 0)  return s;
    }
    return s;
}

*/

String.prototype.c_trim_l = function(s){
    if (s === '') return '';
    //console.log("[%s]",s);
    var count = 0;
    for (var i=0; i <= s.length-1; i++){
       var c = s.charAt(i);
       //console.log("[%d][%s]", i, c);

       if (c === ' '){
           count++;
       } else {
           s = s.substring(count)
           break;
       }
    }
    return s;
}


String.prototype.c_trim_r = function(s){
    if (s === '') return '';
    //console.log("[%s]",s);
    for (var i=s.length-1; i >= 0; i--){
       var c = s.charAt(i);
       //console.log("[%d][%s]", i, c);
       
       if (c === ' '){
           s = s.substring(i, 0);
           
       } else {
           break;
       }
    }
    return s;
}

// 이것을 사용할 것
String.prototype.c_trim = function(s){
    s = s.c_trim_l(s);
    s = s.c_trim_r(s);

    return s;
}

// 한 문자만 바꿀수 있다.
String.prototype.c_replaceAllChar = function(s, tochar, fromchar){

    var result = '';
    //console.log("[%s]", fromchar);
    for (var i=0; i <= s.length-1; i++){
        var c = s.charAt(i);
        if (c === tochar){
           c = fromchar;
           result = result + c;
        } else {
           result = result + c;
        }
    }
    return result;
}

String.prototype.c_replaceAll = function(source,target){
   var val = this;
   while(val.indexOf(source)>-1){
      val = val.replace(source,target);
   }
   return val;
}

/*
java
public String replace(char oldChar, char newChar) {
       if (oldChar != newChar) {
           int len = value.length;
           int i = -1;
           char[] val = value; // avoid getfield opcode

           while (++i < len) {
               if (val[i] == oldChar) {
                   break;
               }
           }
           if (i < len) {
               char buf[] = new char[len];
               for (int j = 0; j < i; j++) {
                   buf[j] = val[j];
               }
               while (i < len) {
                   char c = val[i];
                   buf[i] = (c == oldChar) ? newChar : c;
                   i++;
               }
               return new String(buf, true);
           }
       }
       return this;
   }
   
   
c++
string replace(string word, string target, string replacement){
    int len, loop=0;
    string nword="", let;
    len=word.length();
    len--;
    while(loop<=len){
        let=word.substr(loop, 1);
        if(let==target){
            nword=nword+replacement;
        }else{
            nword=nword+let;
        }
        loop++;
    }
    return nword;

}

std::string str_replace(
    std::string sHaystack, std::string sNeedle, std::string sReplace,
    size_t nTimes=0)
{
    size_t found = 0, pos = 0, c = 0;
    size_t len = sNeedle.size();
    size_t replen = sReplace.size();
    std::string input(sHaystack);

    do {
        found = input.find(sNeedle, pos);
        if (found == std::string::npos) {
            break;
        }
        input.replace(found, len, sReplace);
        pos = found + replen;
        ++c;
    } while(!nTimes || c < nTimes);

    return input;
}
 */
   
   








