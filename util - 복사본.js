
function getFileAbsolutePath(){
    var currfile = window.location.pathname;

    var idx = currfile.lastIndexOf('/');
    return currfile.substr(0, idx);
}

// 반복되는 문자열이 몊개인지 카운터 한다.   ('../../aaa', '..') 는 2개이다.
function countRepeatStr(str, target) {
    var pos = 0;
    var i = 0;

    while(true) {
        var foundPos = str.indexOf(target, pos);
        if(foundPos == -1) break;
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


function trim_l(s){
    while(s){
        var c = s.charAt(0);
        if (c === ' '){
            s = s.substring(1);
        } else {
            return s;
        }
        if (s.length === 0)  break;
    }
}

function trim_r(s){
    while(s){
        var idx = s.lastIndexOf(' ');
        var c = s.charAt(idx);

        if (c === ' '){
            s = s.substring(0, s.length-1);
        } else {
            return s;
        }
        if (s.length === 0)  break;
   }
}

function trim(s){
    s = trim_l(s);
    s = trim_r(s);
    return s;
}