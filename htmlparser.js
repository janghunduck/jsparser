/*
filename : htmlparser.js
author : yoobi
project : chartflow
company :

*/

var Parhtml = function (html, targetfile) {

        //if (!validHTML(html)) { alert('Invalid HTML, HTML 문서 형식이 아닙니다. ') }  // Html validation check

        this.orglines       = '';    // source
        this.lines          = html;
        this.ftype          = [];   // file=js, html
        this.token          = '';   // html, head
        this.nexttoken      = '';   // temp token
        this.currindex      = 0;    // 현재위치
        this.comment        = '';
        this.fname = targetfile;
        this.prevchar       = '';
        this.nextchar       = '';

        this.tokenobj = []; //[ {tagname: depth: data:},{} ... {n} ] 배열에 그냥 object를 나열한다.
        this.depth = 0;
        this.tagdata = '';

        var isDepthEnd = false;                               // depth 가 0 이면 True 아니면 false
        var isMetalink = false;                               // <meta .../> 와 같은 유형 처리에서 isDepthEnd =0 이고 </ 형식이 아닌 경우 true
        var isBracketInOut = false;                           // <> 안이면 true, <> 밖이면 false

        this.getnexttoken = function () {

            var a = this.lines.charAt(0);
            this.prevchar = a;
            this.nextchar = this.lines.charAt(1);
            var code = this.lines.charCodeAt(0);

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
                case a === '!':                                           // <!-- --> comment , <!DOCTYPE HTML ....>
                     if (this.nextchar === '-') {
                         var idx = this.lines.indexOf('-->') + 1;
                         this.lines = this.lines.substring(idx + '-->'.length);
                     } else if(this.nextchar === 'D') {
                         var idx = this.lines.indexOf('>') + 1;
                         this.lines = this.lines.substring(idx);
                     } else {
                         this.addone();
                     }

                    break;
                case a === '\n' || a === '\t':

                    this.nexttoken = this.nexttoken.c_trim(this.nexttoken);
                    //console.log("A: [%s]", this.nexttoken);
                    if (this.nexttoken !== '') {
                        this.updatetokendata(this.tokenobj.length-1, 'data', this.nexttoken);
                    }

                    this.skiptoken();
                    break;
                case a === ' ':   // 공백처리
                    if (isBracketInOut) {                            // < > 안에 있다.

                        if (checkKeywords(this.nexttoken)){                /* keywords 로서 존재하는지 체크  checkStringInArray(this.keywords, this.nexttoken) 로 변경요함  */
                            var index = findChar(this.lines, '>');              // tagdata 를 얻는다.
                            if (index !== -1) {
                               this.tagdata = this.lines.substring(0, index);
                               this.lines = this.lines.substring(index);

                               if (checkMetalinktags(this.nexttoken)) { this.depth--; }   // <link  ..../> 형태 처리
                            }
                        } else {
                            try { throw Error(' Keywords 에 존재하지 않습니다. '); } catch(e) { this.skiptoken(); };
                        }
                    } else {
                       //console.log("this.nexttoken [%s]", this.nexttoken);
                       this.addone();                                           // < > 안이 아니면 공백를 data 항목으로 본다.
                    }
                    break;
                case a === '#' || a === '$' || a === ':' || a === '&':
                     this.addone();
                    break;
                case (a >= '0' && a <= '9') || a === '+':
                    this.addone();
                    break;
                case a === '<':

                    this.nexttoken = this.nexttoken.c_trim(this.nexttoken);
                    if (this.isCommentordoctype(a)) {                                 // <!-- --> comment , <!DOCTYPE HTML ....>  skip, 처리는 ! 에서 삭제
                         this.skiptoken();
                         break;
                    }

                    if ((this.nexttoken !== '') && (this.depth !== 0)) {
                        this.updatetoken(this.tokenobj.length-1, 'data');  // data update */
                    }

                    this.skiptoken();
                    if((isDepthEnd) && (this.lines.charAt(0) !== '/')) {
                      isMetalink = true;    // <meta .../>
                    }
                    isBracketInOut = true;
                    break;
                case a === '>':

                    //if (this.nexttoken.c_trim(this.nexttoken) === ''){  this.skiptoken(); break; }
                    if ((isDepthEnd) && (!isMetalink)) { this.skiptoken(); break; };                 // depth 가 마지막이면 나감 depth === 0 경우
                    this.nexttoken = this.nexttoken.c_trim(this.nexttoken);
                    this.token = this.nexttoken;

                    if (this.nexttoken !== '') this.inserttoken();                                                              // token 생성, token 마다 계속 생성된다.
                    if (this.tagdata !== '') {
                        this.updatetagdata(this.tokenobj.length-1, 'tagdata');  // tagdata update

                    }
                    if (this.nexttoken === 'script'){
                        var index = this.lines.indexOf('</script>');
                        var scriptdata = this.lines.substring(1, index);

                        this.updatetokendata(this.tokenobj.length-1, 'data', scriptdata);            // script data update
                        //console.log("[scriptdata[%s]",  scriptdata);
                        this.lines = this.lines.substring(index + '</script>'.length);
                        this.depth--;
                    } else {
                        //this.lines = this.lines.replace(/<br\s*\/>/, "<br>")   // <br /> => <br>
                        if (this.nexttoken === 'br') { this.depth--; }  // ? 종결자가 없는 tag 의 경우
                        if (this.nexttoken === 'hr') { this.depth--; }  // ?
                    }


                    this.skiptoken();
                    this.depth++
                    isMetalink = false;
                    isBracketInOut = false;

                    break;
                case a === '/':        // '/' 는 depth 를 판단하는 기준
                    this.skiptoken();
                    this.depth !== 0 ? isDepthEnd = true : isDepthEnd = false;
                    this.depth--;

                    var idx = findChar(this.lines, '>');
                    this.lines = this.lines.substring(idx);  // </ ...> 를 지움

                    break;
                case a === '(' || a === ')' || a === '[' || a === ']' || a === ';' || a === ',' || a === '.' || a === '^' || a === '*' || a === '=':

                case (a >= 'A' && a <= 'Z') || (a >= 'a' && a <= 'z') || a === '_' || a === '@' || a === '-':  // 문자
                    if ((isDepthEnd) && (!isMetalink)) {
                       if (isBracketInOut) {
                         this.skiptoken();
                       } else {
                         this.addone();
                       }
                    } else {
                       //console.log("Add Char = [%s]",a, this.nexttoken);
                       this.addone();
                    }

                    break;
                case code === 8220 || code === 8221 || code === 167 || code === 63 || code === 8217 || code === 37:     //“, ”, §, ? , ` , % 특수문자
                       if (isBracketInOut) {
                         this.skiptoken();
                       } else {
                         this.addone();
                       }
                       break;
                default:
                    //throw Error("Error : swich default, char is not definition, [%s]", a);
                    //window.alert("[Fatal Error] : swich default, char is not definition, [" + a + "]" );
                    console.log("[Fatal Error] : swich default, char is not definition, [%s][code = %d]", a, code);
                    this.skiptoken();
                    break;

            }
            return true;
        };

}

// 정확한지 테스트 요함.
Parhtml.prototype.isCommentordoctype = function(char){
     var c = this.lines.charAt(2);
     //console.log("char ==============>>>>>>%s, %s , %s ", char, this.nextchar, c);
     return (((this.nextchar === '!') && (c === '-')) || ((this.nextchar === '!') && (c === 'D')));
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

    var idx1 = this.tagdata.indexOf('onclick');
    if (idx1 !== -1){
         var str1 = this.tagdata.substr(idx1, this.tagdata.length - idx1);
         var idx2 = str1.indexOf(';');
         var str2 = str1.substr(0, idx2);
         node['tagevent'] = str2;
    }
    this.tagdata = '';
}

Parhtml.prototype.inserttoken = function () {
    node = new Object();
    node.tagname = this.token;
    node.depth   = this.depth;
    node.data    = '';
    node.tagdata = '';
    node.tagevent = '';
    this.tokenobj.push(node);

    return node;
}


Parhtml.prototype.skiptoken = function() {
    this.addone();
    this.emptytoken();
}

Parhtml.prototype.addone = function() {
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
           str = str + n.depth + ' | ' + n.tagname + ' | ' + n.data + ' | ' + n.tagevent + '\n';
           console.log("=>", this.tokenobj[i]);
    }

    if (this.depth == 0) {
           console.log("Succes depth: %d", this.depth);
    } else {
           console.log("Error depth: %d", this.depth);
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

function countString(s, checkstr){
    var pos = 0;
    var i = 0;

    while(true) {
        var foundPos = s.indexOf(checkstr, pos);
        if(foundPos == -1) break;
        pos = foundPos + 1;	// 를 찾게 되면, 다음 위치에서 다시 찾습니다.
        i++;
    }
    return i;
}

function deleteCountString(s, checkstr, count){
    var matchcount = 0;
    for (var i=s.length-1; i >= 0; i--){
         var c = s.charAt(i);
         if (c === checkstr){
             matchcount++;
             if (count === matchcount){
                 return s;
             }
         }
         s = s.substring(i,0);
    }
}

function getRealPath(dir, jsfile){
    var matchcount = 0;
    var result = '';
    
    var acount = countString(jsfile, '../');
    var bcount = countString(jsfile, './');
    
    if ((acount > 0) && (bcount === 0)) {
        result = jsfile.c_replaceAll('../', '');
        return deleteCountString(dir, '/', acount) + result;
    } else if ((acount > 0) && (bcount > 0)){
        result = jsfile.c_replaceAll('./', '');
        return deleteCountString(dir, '/', bcount) + result;
    } else {
        return dir + '/' + jsfile;
    }
    
}

// html 의 묘듈리스트 를 뽐아옴.  <script type='text/javascript' src='../../fckeditor.js'></script>
Parhtml.prototype.getTracefilelst = function () {
    var arr = [];
    
    var currdir = '';
    this.fname === '' ? currdir = getFileAbsolutePath() : currdir = getFileAbsolutePath(this.fname);
              
    for ( var i = 0; i < this.tokenobj.length; i++ ){
           var node = this.tokenobj[i];
           if (node.tagname === 'script'){
              var idx = node.tagdata.indexOf('src');
              if (idx !== -1){
                  var jsfile = node.tagdata.substr(idx, node.tagdata.length - idx);
                  jsfile = rangestr (jsfile, "'", "'");                                // ../../aaa.js, ./ab.js
                  if (jsfile.indexOf('http') !== -1){
                      arr.push(jsfile);
                  } else {
                      arr.push(getRealPath(currdir, jsfile));
                  }
              }
           }

    }
    return arr;
}

// html 의 <script> 부분 소스 text , jsparser에 넣을 것
// <script> 가 2개가 오는 경우는 result 를 배열에 담는다.
Parhtml.prototype.getInlineScript = function () {
    var result = [];
    for ( var i = 0; i < this.tokenobj.length; i++ ){
           var node = this.tokenobj[i];
           if (node.tagname === 'script'){
              var idx = node.tagdata.indexOf('src');
              if (idx === -1){

                  result.push(node.data);
                  //console.log("data = [%d][%s]", i, node.data);
              }
           }
    }
    return result;
}
