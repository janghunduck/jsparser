//(function(){



//html 문서가 정확해야 하지만, 그 전에 정확한 문서인지 체크가 되어야 한다.

var Parhtml = function (html, targetfile) {

         this.orglines       = '';    // source
         this.lines          = html;
         this.ftype          = [];   // file=js, html
         this.token          = '';   // html, head
         this.nexttoken      = '';   // temp token
         this.currindex      = 0;    // 현재위치
         this.comment        = '';
         this.fname = targetfile;

         this.tokenobj = []; //[ {tagname: depth: data:},{} ... {n} ] 배열에 그냥 object를 나열한다.
         this.depth = 0;
         this.tagdata = '';

         this.fixedtags = makearray("html,head,title,body,table,tr,td,div,meta,link,script");
         this.closetags = makearray("meta,link");  // <  /> 시작과 함께 닽힘
         var depthend = false;
         var bcontinue = false;
         var btag     = false;  // < => true,  > => false
        /**
         ex : <html><head></head><body>abcd</body></html>
         token : function, procedure, 지시자들  = tagName ( html, head, body etc )
                                                = var, fuction
         nexttoken :

        */

         this.getnexttoken = function () {

             //var index;
             //this.token = this.nexttoken;
             //nexttoken = '';
             //eatwhitespace();


             var a = this.lines.charAt(0);
             //console.log("charat = [%s]",a);

             // tab 처리 할것

             switch (true) {
                 case a === '#0':                     //EOF \n
                     this.skiptoken();
                     break;
                 case a === "'":  // 아래 주석치리 한 " 는 ' 의 코딩과 같다. 추후에 주석을 풀것 (개발상 하이라이트가 먹지 않아 주석처리해 놓은 것임 )
                     this.addone();
                     break;
                 /*case a === '"':
                     this.addone();
                     break;
                     */
                 case a === '\n' || a === '\t':
                     this.skiptoken();
                     break;
                 case a === ' ':   // 공백처리

                     //console.log("========>", this.fixedtags, this.nexttoken);

                     if (btag) {
                         /* keywords 로서 존재하는지 체크 */
                         if (this.checkfixedtag(this.nexttoken)){

                             var index = this.findtoken(this.lines, '>');  // tagdata 를 얻는다.
                             //alert('index=>' + index);
                             if (index > 0) {
                                this.tagdata = this.lines.substring(0, index);
                                this.lines = this.lines.substring(index);
                                //alert(this.tagdata);

                                if (this.checkclosetag(this.nexttoken)) {     // <link  ..../> 형태 처리
                                     this.depth--;
                                }

                                //console.log("tagdata:[%s]   lines:[%s]", this.tagdata, this.lines);
                             } else {
                                this.addone();
                             }
                         } else {
                             this.skiptoken();
                         }
                     } else {
                        this.addone();
                     }

                     break;
                 case a === '#':
                 case a === '$':
                 case a === ':':
                     this.addone();
                     break;
                 case (a >= '0' && a <= '9') || a === '+':
                     //console.log("number part = [%s]",a);
                     this.addone();
                     break;
                 case a === '<':
                     //this.nexttoken = this.nexttoken.trim();
                     //var reg = new RegExp('^\s+|\s+$', 'gm');
                     //this.nexttoken = reg.exec(this.nexttoken);
                     
                     if ((this.nexttoken !== '') && (this.depth > 0)) {           //!depthend ) {
                        //console.log("updatetoken :  ", this.nexttoken);
                        this.updatetoken(this.tokenobj.length-1, 'data');                             // data update */
                     }
                     this.skiptoken();

                     if((depthend) && (this.lines.charAt(0) !== '/')) {
                        bcontinue = true;                                                             // 중간 상위 노드가 존재하는 지 쳌,
                     }
                     btag = true;
                     break;
                 case a === '>':

                     if (depthend && !bcontinue) { this.skiptoken(); break; };                        // depth 가 마지막이면 나감 depth === 0 경우

                     this.token = this.nexttoken;
                     //alert(this.token);
                     //llog = llog + '    (' + this.token + ')    ';
                     this.inserttoken();                                                              // token 생성, token 마다 계속 생성된다.
                     if (this.tagdata !== '') this.updatetagdata(this.tokenobj.length-1, 'tagdata');  // tagdata update

                     if (this.nexttoken === 'script'){
                         var index = this.lines.indexOf('</script>');
                         var scriptdata = this.lines.substring(1, index);
                         this.lines = this.lines.substring(index + 9);
                         //llog = llog + this.lines + '\n';
                         this.updatetokendata(this.tokenobj.length-1, 'data', scriptdata);            // script data update
                         //console.log("nexttoken : [%s] [%s] [%d]",  this.nexttoken, this.lines, index);
                     }

                     this.addone();
                     this.emptytoken();
                     this.depth++
                     bcontinue = false;
                     btag = false;
                     //console.log("nexttoken : [%s] [%s]",  this.nexttoken, this.lines);
                     break;
                 case a === '/':        // '/' 는 depth 를 판단하는 기준
                     this.skiptoken();
                     depthend !== 0 ? depthend = true : depthend = false;
                     this.depth--;
                     //console.log("depth [/] %d", this.depth);
                     //bcontinue = false;
                     break;
                 case a === '(' || a === ')' || a === '[' || a === ']' || a === ';' || a === ',' || a === '.' || a === '^' || a === '*' || a === '=':

                 case (a >= 'A' && a <= 'Z') || (a >= 'a' && a <= 'z') || a === '_' || a === '@' || a === '-':  // 문자
                     //console.log("%s    %d", a, this.depth);
                     if (depthend && !bcontinue) {
                        if (btag) {
                          this.skiptoken();
                        } else {
                          this.addone();
                        }
                     } else {
                        //console.log("Add Char = [%s]",a, this.nexttoken);
                        this.addone();
                     }

                     break;

                 default:  break;

             }
             return true;
         };

}


Parhtml.prototype.findtoken = function(str, char) {

         for(var i=0; i < str.length-1; i++) {
             if (str.charAt(i) === char){
             //if (str[i] === char) {               /* IE8 이하에서는 string 을 배열과 같이 접근할 수 없다. */
                return i;
             }
         }
         return -1;
}


Parhtml.prototype.checkfixedtag = function (str) {

         for(var i=0; i < this.fixedtags.length; i++) {
             //console.log("%s  === %s", this.fixedtags[i], str);
             if (this.fixedtags[i] === str) {
                return true;
             }
         }
         return false;

}

Parhtml.prototype.checkclosetag = function (str) {

         for(var i=0; i < this.closetags.length; i++) {
             //console.log("%s  === %s", this.closetags[i], str);
             if (this.closetags[i] === str) {
                return true;
             }
         }
         return false;
}



Parhtml.prototype.updatetoken = function (index, key) {
         node = this.tokenobj[index];
         node[key] = this.nexttoken;
         

}

Parhtml.prototype.updatetokendata = function (index, key, data) {
         node = this.tokenobj[index];
         node[key] = data;
}


Parhtml.prototype.updatetagdata = function (index, key) {
         node = this.tokenobj[index];
         node[key] = this.tagdata;
         this.tagdata = '';
}


Parhtml.prototype.inserttoken = function () {
         node = new Object();
         node.tagname = this.token;
         node.depth   = this.depth;
         node.data    = '';
         node.tagdata = '';
         this.tokenobj.push(node);

         return node;

}


Parhtml.prototype.skiptoken = function() {

             this.addone();
             this.emptytoken();
}

Parhtml.prototype.addone = function() {

        //console.log("nexttoken= %s, lines= %s, index= %d", this.nexttoken, this.lines, this.currindex);

        this.nexttoken = this.nexttoken + this.lines.charAt(0);   // line 의 한문자를 가져온다.
        this.lines = this.lines.substring(1);                     // line 에서 한문자를 제거

        this.currindex++;
}

Parhtml.prototype.emptytoken = function(){
        this.token = '';
        this.nexttoken = '';
}

Parhtml.prototype.parserunit = function() {  // parserunit
        var i = 0;
        //console.log("lines=",this.lines);
        //console.log("lines length =", this.lines.length);
        llog = llog + 'this.lines.length : ' + this.lines.length + '\n';
        llog = llog + 'this.lines : ' + this.lines + '\n';

        while (this.lines) {
           this.getnexttoken();
           if (this.lines.length === 0)  break;

           //if (i == 246) break;
           i++;
        }
}

// getnexttoken 함수 안에서 사용하지 말고 밖에서 사용한다.
Parhtml.prototype.deleteallcomment = function(str) {
    var purestr ='';
    var i = 0;

    while( str ) {
        var istart = str.indexOf('<!--');
        if (istart < 0) {
            purestr = purestr + str;
            break;
        }
        purestr = purestr + str.substr(0, istart);   // 0 부터 <-- 넣고
        str = str.substring(istart);          // 0 부터 <-- 삭제


        var iend = str.indexOf('-->');        //
        str = str.substring(iend+3);
    }

    return purestr;

}


Parhtml.prototype.tostringtokens = function () {

        var n = {};
        var str = '';

	for ( var i = 0; i < this.tokenobj.length; i++ ){
           //n = new Object();
           n = this.tokenobj[i];
           if (n.data == undefined) n.data = '';
           str = str + n.depth + ' | ' + n.tagname + ' | ' + n.data + '\n';

           //console.log("=>", this.tokenobj[i]);


	};

	if (this.depth == 0) {
           //console.log("Succes depth: %d", this.depth);
	} else {
           //console.log("Error depth: %d", this.depth);
	}

        return str;
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
        if(foundPos == -1) break;
        pos = foundPos + 1;	// as를 찾게 되면, 다음 위치에서 다시 찾습니다.

        i++;
    }

    return i;
}

// 역순으로 delmiter에 해당되는 것을 지워나간다.
function delRepeatLastStr(str, delimiter, count) {  // ('x@y@z', '@', 2 )  에서 x 만 남는다.
    var i = 0;
    for (var i=0; i < count; i++){
        var foundPos = str.lastIndexOf(delimiter);
        str = str.substr(0, foundPos);

    }
    return str;
}


// <script type='text/javascript' src='../../fckeditor.js'></script> 에서 절대 디렉토리로 /D:/fckeditor.js 식으로 구성한다.
Parhtml.prototype.tostringtagdata = function () {

	for ( var i = 0; i < this.tokenobj.length; i++ ){
           var node = this.tokenobj[i];
           if (node.tagname === 'script'){
              var idx = node.tagdata.indexOf('src');
              if (idx !== -1){
                  var str = node.tagdata.substr(idx, node.tagdata.length - idx);

                  str = rangestr (str, "'", "'");                                // ../../aaa.js, ./ab.js
                  var ddotcnt = countRepeatStr(str, '..');
                  var currdir = getFileAbsolutePath();                           // ddotcnt 만큼 상위로 올라간다. /D:/flowjs/Html/
                  currdir = delRepeatLastStr(currdir, '/', 2);

                  var idx2 = str.lastIndexOf('/');
                  str = str.substr(idx2, str.length - idx2);

                  //console.log("tagdata = [%s]", currdir + str);  // flowchart로 토스 하고 flowchar에서 다시 소스를 jsparser로 넘김
              } else {
                  //console.log("data = [%s]", node.data);  // jsparser로 들어감
              }
           }

        }
}

// html 의 묘듈리스트 를 뽐아옴.  <script type='text/javascript' src='../../fckeditor.js'></script>
Parhtml.prototype.getTracefilelst = function () {
    var arr = [];
    for ( var i = 0; i < this.tokenobj.length; i++ ){
           var node = this.tokenobj[i];
           if (node.tagname === 'script'){
              var idx = node.tagdata.indexOf('src');
              if (idx !== -1){
                  var str = node.tagdata.substr(idx, node.tagdata.length - idx);
                  str = rangestr (str, "'", "'");                                // ../../aaa.js, ./ab.js
                  var ddotcnt = countRepeatStr(str, '..');

                  var currdir = '';
                  if (this.fname === ''){
                      currdir = getFileAbsolutePath();                           // ddotcnt 만큼 상위로 올라간다. /D:/flowjs/Html/
                  } else {
                      currdir = getFileAbsolutePath(this.fname);
                  }
                  currdir = delRepeatLastStr(currdir, '/', 2);

                  var idx2 = str.lastIndexOf('/');
                  str = str.substr(idx2, str.length - idx2);
                  arr.push(currdir + str);

                  //console.log("tagdata = [%s]", currdir + str);  // flowchart로 토스 하고 flowchar에서 다시 소스를 jsparser로 넘김
              }
           }

    }
    return arr;
}

// html 의 <script> 부분 소스 text , jsparser에 넣을 것
// <script> 가 2개가 오는 경우는 result 를 배열에 담는다.
Parhtml.prototype.getInlineScript_ = function () {
    var result = '';
    for ( var i = 0; i < this.tokenobj.length; i++ ){
           var node = this.tokenobj[i];
           if (node.tagname === 'script'){
              var idx = node.tagdata.indexOf('src');
              if (idx === -1){
                  //console.log("data = [%s]", node.data);  // jsparser로 들어감
                  result = result + node.data
              }
           }

    }
    return result;
}

Parhtml.prototype.getInlineScript = function () {
    var result = [];
    for ( var i = 0; i < this.tokenobj.length; i++ ){
           var node = this.tokenobj[i];
           if (node.tagname === 'script'){
              var idx = node.tagdata.indexOf('src');
              if (idx === -1){
                  result.push(node.data);
              }
           }

    }
    return result;
}


var sss=
             "<html> \n" +
             " <head>" +
             " <title>  abcd -efg</title>" +
             "    <script type='text/javascript' src='../../fckeditor.js'></script> \n "+
             "</head>   \n" +
             "<body>  qqq    "+
	     "  <script>"+
             "     <!--function-->"+
	     "  </script>\n"+
             "</body> \n"+
             "</html>\n";



//var PP = new Parhtml("<html xmlns='http://www.w3.org/1999/xhtml'><head><title>abcd -efg</title></head><body><table></table></body></html>");
//var PP = new Parhtml("<html><head></head><body  topmargin='0'></body></html>");
//var PP = new Parhtml("<html><head></head><body  topmargin='0'><table><tr></tr></table></body></html>");
//var PP = new Parhtml("<html><head></head><body  topmargin='0'><table class='jang' id='xfaa'><tr id='dija'><td size='877'></td></tr></table></body></html>");
//var PP = new Parhtml("<html><head><meta http-equiv='Content-Type' content='text/html; charset=utf-8'/></head><body><table></table></body></html>");
//var PP = new Parhtml("<html><head><link href='../sample.css' rel='stylesheet' type='text/css' /></head><body></body></html>");
//var PP = new Parhtml("<html><head><script type='text/javascript' src='../../fckconfig.js'>aaaaaaffff</script></head><body></body></html>");

// <!DOCTYPE html><html></html> 처리 ==> 처음에 comment와 같이 지워버림

//var PP = new Parhtml("");

/**
var PP = new Parhtml(sss);
PP.parserunit();
console.log("=>", '\n' + PP.tostringtokens());

*/
//console.log(">", '\n' + PP.tostringtagdata());

//console.log("sss=>[%s]",PP.deleteallcomment(sss));
//var c = P.pickchar(P.lines, 0);

//console.log("[%s]", c);
//console.log("===>", eval("getFileAbsolutePath()"));
//console.log("===>%d", countRepeatStr('../../aaa.js', '..'));





//})();
