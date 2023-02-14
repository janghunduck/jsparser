
function getFileAbsolutePath(){
    var currfile = window.location.pathname;

    var idx = currfile.lastIndexOf('/');
    return currfile.substr(0, idx);
}

// �ݺ��Ǵ� ���ڿ��� �s������ ī���� �Ѵ�.   ('../../aaa', '..') �� 2���̴�.
function countRepeatStr(str, target) {
    var pos = 0;
    var i = 0;

    while(true) {
        var foundPos = str.indexOf(target, pos);
        if(foundPos == -1) break;
        pos = foundPos + 1;	// as�� ã�� �Ǹ�, ���� ��ġ���� �ٽ� ã���ϴ�.

        i++;
    }

    return i;
}

// �������� delmiter�� �ش�Ǵ� ���� ����������.
function delRepeatLastStr(str, delimiter, count) {  // ('x@y@z', '@', 2 )  @y@z �� �����  x �� ���´�.
    var i = 0;
    for (var i=0; i < count; i++){
        var foundPos = str.lastIndexOf(delimiter);
        str = str.substr(0, foundPos);

    }
    return str;
}


function rangestr(s, c1, c2){

    //var str = s.trim();             /* trim() �� IE8 �̻󿡼� �����Ѵ�. */
    var str = s;
    var starti = str.indexOf(c1) + 1;

    str = str.substring(starti);
    var endi = str.indexOf(c2);

    return str.substr(0, endi);
}

// ���ڿ� s ���� Ư������ c �� �t���� �ִ°�?
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