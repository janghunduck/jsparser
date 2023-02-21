/*
filename : jsparser.js
author : yoobi
project : chartflow
company :
*/

/* level : 처음 <script>...</script>, js 파일의 스크립트가 들어올 경우 0, Brace Part가 들어올 경우 1  */
var jsparser = function (script, level, isShowComment) {

         this.lines          = script;
         this.level          = level;
         this.showComment = isShowComment;
         this.backupline     = '';
         this.nextline       = '';
         this.currline       = '';
         this.token          = '';   // html, head
         this.prevtoken      - '';
         this.nexttoken      = '';   // temp token
         this.nntoken = '';
         this.prevchar       = '';
         this.nextchar       = '';
         this.currindex      = 0;    // 현재위치

         this.tokenseq       = 0;    // 라인별 token 수

         this.tokenarray = [];
         this.tokens = [];            // 라인별로 모든 토큰을 가짐
         this.linenumber = 1;

         this.tokenobj = []; //[ {tagname: depth: data:},{} ... {n} ] 배열에 그냥 object를 나열한다.
         this.depth = 0;     // 함수 안의 함수


         this.keywords = makearray("var,let,const,function,new,prototype");
         this.skipkeywords = makearray("console,alert");

         //this.lines = "var ab    =   function  () {  \n  alert('ab')  {         {}        } } ";
         //this.lines = "   var xy = '';  \n function ab(){           x       }  ";
         //this.lines = " function ab   () {   \n } ";
         //this.lines = " var x=  8 ; var y  ; z = 'sex' ";
         //this.lines = " var x=  8";
         //this.lines = "var obj =new ab()  ;";
         //this.lines = "var emptyobject = { ";
         //this.lines = " function ab   () {    ";    // error 처리
         //this.lines = "var o ={}";
         //this.lines = "var arr = [       ]";
         //this.lines = "var arr =new array()";
         //this.lines = "obj.ab(x);";
         //this.lines = "ab.prototype.call = function(){  \n  alert('me!') } ";
         //this.lines = "//before comment\n function ab() { \n alert('me') } ";
         //this.lines = "function ab() { \n alert('me') } //after comment   ";
         //this.lines = " /*  before comment \n  It's: comment !  */  \n var x;   ";
         //this.lines = " if (true) {  \n let name = 'Luke'; \n } \n ";     // 전역으로 선언된 Block Scope
         //this.lines = " console.log('test...')";
         //this.lines = " for(var i=0; i < o.length; i++){ \n alert()} ";
         //this.lines = "var ab    =   function  () {    alert('ab')  \n{         {}        } } ";
         //this.lines = "var ab = (x) => {  test() } ";
         //this.lines = " var ab = () {}";
         //this.lines = "(function(ab){     })('foo'); ";  // 즉시 실행함수
         //this.lines = "(()=> {})();";
         //this.lines = "window.onload = ab(); ";
         //this.lines = "window.onload = function () {  }";
         //this.lines = "exports.add = (a,b) => { return a + b } "    // exports function
         //this.lines = "exports.add = function ab(){} "
         //this.lines = "const {add, sub} = require('./mode.js');"
         //this.lines = " var o = {\n name: 'linda', \n sex: 'women', size, \n me: intro(){}, \n getOlder(){}, \n sayhello : function() { \n alert('hi');  }}" ;
         //this.lines = "let ab = require('js2flowchart'); ";
         //this.lines = "$('.frame_id, #frame_class').show()";
         //this.lines = "$(window).load( game.run() )";
         //this.lines = " $titlePanels = [$('#title-panel-1'), $('#title-panel-2')]; \n";
         //this.lines = " var $titleField = $('#player-name'); \n";
         //this.lines = "$(document).ready( function (){}) ";
         //this.lines = "$('#img_btn').click( function(){  } )";
         //this.lines = "try { } finally {} ";
         //this.lines = " try { } catch (e) {} "
         //this.lines = " try { o = obj.init() } chatch (err) {} filnally {  } "
         //this.lines = "module.exports = { add:add, sub:sub } "      // module exports
         //this.lines = "var oFCKeditor = new FCKeditor( 'FCKeditor1' ) ;";

         // 마지막 끝을 알리는 문자 eof 가 없으면 넣어준다. 아래시작 시점에서 check 하지만 Test를 실행하기  위해 넣음
         var lastcode = this.lines.charCodeAt(this.lines.length);
         if (!isNewLine(lastcode)) this.lines = this.lines + String.fromCharCode(10);


         this.getnexttoken = function () {

             //eatwhitespace();

             var a = this.lines.charAt(0);
             var code = this.lines.charCodeAt(0);
             this.prevchar = a;
             this.nextchar = this.lines.charAt(1);

             //console.log("%s", a);
             switch (true) {

                 case a === "'":
                     this.skiptoken();
                     this.insertstring(a);
                     break;
                 /*case a === '"':
                     this.addone();
                     break;
                     */
                 case a === '\t':
                     this.skiptoken();
                     break;
                  case a === '!':
                      if (this.nextchar === '-') {                                 //<!-- --> comment, html 파일 안에서 <script> 태크 안에서 Html주석을 넣을 수 있다.
                           var idx = this.lines.indexOf('-->') + 1;
                           this.lines = this.lines.substring(idx + '-->'.length);
                      }
                     break;
                 case a === '<':
                     if (this.nextchar === '!') {                                 // <!-- --> comment , <!DOCTYPE HTML ....>  skip, 처리는 ! 에서 삭제
                         this.skiptoken();
                     } else {
                         this.addone();
                     }
                     break;
                 case (a >= 'A' && a <= 'Z') || (a >= 'a' && a <= 'z') || a === '_' || a === '@' || a === '-':  // 문자
                     //console.log("a=", a);
                     this.addone();
                     break;
                 case (a >= '0' && a <= '9') || a === '+' || a === '%' || a === ':' || a === '>':
                     this.addone();
                     break;
                 case code === 59 || code === 0 || code === 10 || code === 13 || code === 0x2028 || code === 0x2029: // 0: eof, 59: ;

                     this.nexttoken = this.nexttoken.c_trim(this.nexttoken);
                     //console.log("this.nexttoken=====>", this.nexttoken);
                     if (this.nexttoken != '') this.tokenarray.push(this.nexttoken);

                     this.inserttoken();                                            // tokens 에 넣는다.
                     this.inittoken();                                              // 모두 초기화
                     this.skiptoken();
                     break;

                 case a === ' ' || a === '=' || a === '(' || a === '.':             // code = 32
                     if (this.eatwhitespace()) break;

                     this.nexttoken = this.nexttoken.c_trim(this.nexttoken);

                     //console.log("lines = %s", this.lines);
                     //console.log("backu = %s", this.backupline);
                     //console.log("this.nexttoken=====>", this.nexttoken);

                     this.setuptoken();                                             // 토큰을 가져와 임시 arr에 적재
                     this.skiptoken();

                     break;
                 case a === ',':
                     this.token = this.nexttoken;

                     this.tokenseq++;
                     this.skiptoken();
                     break;
                 case a === '{':                                                   // 함수 or 객체에 해당 or let {ab, cd} = require('');

                     var arr = this.lines.split("=");

                     if ((this.recognizeallnotfunction()) && (arr.length > 1)){    // ok!  let {ab, cd} = require('');
                          var identreq = rangestr(arr[0], '{', '}');
                          var reqitems = identreq.split(',');
                          for(var i=0;i < reqitems.length; i++){
                              this.tokenarray.push(reqitems[i]);
                          }
                     } else {                                                      // ok! object, function
                         //if (this.braceCharExist()){
                             //var brace = this.getbracepart('{','}');
                             var brace = this.lines.substr(0, this.getBraceEndCount('{', '}'));
                             //console.log("[Main brace]=[%s]", brace);
                             this.tokenarray.push(brace);                  // 모든 세부사항은 배열의 끝에 넣는다 여기서는 추적하지 않는다.
                             this.lines = this.lines.substring (brace.length-1);
                         //} else {

                         //}
                     }

                     if (this.currline.indexOf('try') !== -1 ){                     // try 처리

                     }

                     /*
                     if (this.tokenarray[1] === 'function') {                          // general function ( function ab(){} )  [seq|function|ab]
                         this.lines = this.lines.substring ((arr[0] || []).length);    // 함수  { { {  } } } 부분을 모두 삭제, 함수는 여기서 추적하지 않는다.
                     } else if ((this.findkeyfromarr('function') != -1)
                             && (this.findkeyfromarr('prototype') == -1)) {
                         this.lines = this.lines.substring ((arr[0] || []).length);    // var ab = function(){}
                     } else if(this.findkeyfromarr('prototype') != -1) {
                         this.lines = this.lines.substring ((arr[0] || []).length);    // prototype function
                     }

                     if (this.tokenarray[0] === 'var'){
                         console.log("regexr match====>", arr.toString(), (arr[0] || []).length);
                         if ((arr[0] || []).length > 0) {
                             //this.objectbraceparser(arr[1]);                            // arr[0] = { ....{}} arr[1] = ...{}  // tp_vo_structure 가 먼저 token 에 들어간다
                             //this.lines = this.lines.substring ((arr[0] || []).length); // 오브젝트   { { {  } } } 부분을 모두 삭제, 여기서 파서해서 정보를 가져야 함. 정보 구성은 key 로 구성함.
                             //this.tokenarray.unshift('tp_vo');
                         }
                     }
                     */
                     this.skiptoken();
                     break;
                 case a === '[':                                                        // array
                     //var brace = this.getbracepart('[',']');
                     var brace = this.lines.substr(0, this.getBraceEndCount('[', ']'));
                     this.tokenarray.push(brace);
                     this.lines = this.lines.substring (brace.length-1);

                     this.skiptoken();
                     break;
                 case a === '/':
                     if ((this.nextchar === '/') || (this.nextchar === '*')){
                         if (this.showComment) {
                             this.insertcomment(this.nextchar);
                         } else {
                             this.skipcomment(this.nextchar);

                         }
                         this.skiptoken();
                         break;
                     } else {
                         this.addone();
                         break;
                     }

                 case a === '}' || a === ']' || a === ')':
                     this.skiptoken();
                     break;
                 //case a === '#':
                 //    this.skiptoken();
                 //    break;
                 case a === '$':                                                      // jquery
                     this.setupjquery();
                     this.skiptoken();
                     break;
                 case a === '@':                                                      // BRACE_END_TOKEN
                     this.setupjquery();
                     this.skiptoken();
                     break;
                 default:
                     //throw Error("Error : swich default, char is not definition, [%s]", a);
                     window.alert("[Fatal Error] : swich default, char is not definition, [" + a + "]" );
                     this.skiptoken();
                     break;
             };


             if (isNewLine(code)) {
                    this.backupline = '';
                    this.linenumber === 1 ? this.nextline = this.getcurrline() : this.nextline = this.getnextline();
                    this.currline = this.getcurrline();
                    this.linenumber++;
             } else {
                    this.backupline = this.backupline + a;
             }

             // return this;
         };
}


// function, if, for 를 대상으로 하고, let, object 부분은 recursion 하지 않는다.
jsparser.prototype.recursion = function(brace){

    var BRACE_END_TOKEN = '@';
    this.level = 1;
    var count = charcount(brace, '\n');
    this.linenumber = this.linenumber - count;

    // brace 에서 첫 {,  끝 } 를 지운다.
    brace = brace.substring(0);
    brace = brace.substr(0, brace.length-1);
    this.lines = brace  + BRACE_END_TOKEN + this.lines;   // lines 에 기존 data 가 있음.

    while(this.lines){
        getnexttoken();
    }
}


/* 기본적으로 Text 로 처리한다. */
/* require('aaa.js'); 의 경우 require 토큰 처리시 따로 처리한다. */
/* Text 가 Html 인경우 연속에서 ' 포함된다. */
jsparser.prototype.insertstring = function(char){
    var idx;
    var str = '';
    var matchtag = this.getmatchtag();
    if (matchtag !== undefined){
        idx = this.lines.indexOf(matchtag + '>') + (matchtag + '>').length;
        str = this.lines.substr(0,idx);
    } else {
       idx = this.lines.indexOf(char);
       str = this.lines.substr(0,idx);
    }
    this.tokenarray.push('text:' + str);
    this.lines = this.lines.substring(idx+1);
}

jsparser.prototype.getmatchtag = function(){
    var matchtag = '';
    for(var i=0; i < keywords.length; i++) {
       var tag = '<' + keywords[i];
       if (this.currline.indexOf(tag) !== -1){     // this.currline 에 주의 '<a href='http:www.fckeditor.net/'>FCKeditor</a>'
          return keywords[i];
       }
    }
}

// object or function 의 { {} } 와 같이 중첩 brace를 count 해서 object의 끝과 함께 Object 전체 스트링을 뽑는다.
// 아래것으로 대체
jsparser.prototype.getBraceEndCount___ = function(startchar, endchar){
    var depth = 0;
    var count = function (str) {
            for (var i=0; i<str.length; i++){
                var char = str.charAt(i);
                if (char === startchar){
                    depth++;
                } else if(char === endchar){
                    depth--;
                    if (depth === 0){
                        return i+1;
                    }
                }
            }
        }
    return count(this.lines);
}

jsparser.prototype.getBraceEndCount = function(startchar, endchar){
    var depth = 0;
    for (var i=0; i<this.lines.length; i++){
        var char = this.lines.charAt(i);
        if (char === startchar){
            depth++;
        } else if(char === endchar){
            depth--;
            if (depth === 0){
                return i+1;
            }
        }
    }
}

/* s.match(/\{(.*)\}/s) 를 대체한다. 에러가 있어서 getBraceEndCount 로 대체함. */
// 추후 지울것
jsparser.prototype.getbracepart = function(startc, endc){
    //var s = "ab = function() { alert('ab'); {  a  { c } b} } aaa{e}";
    var pos = 0;

    var closepos = this.lines.indexOf(endc);
    var str = this.lines.substr(0, closepos);                   // { alert('ab'); {  a  { c
    var cnt = countRepeatStr(str, startc);

    var nextstr = this.lines.substr(closepos, this.lines.length - closepos);  //  } b} } aaa{e}

    var foundPos = 0;
    for(var i=0; i<cnt;i++){
        foundPos = nextstr.indexOf(endc, pos)
        //alert(foundPos +'   /'+ pos);
        if(foundPos == -1) break;
        pos = foundPos + 1;
    }

    return str + nextstr.substr(0, foundPos+1);       // } b} }
}

// 객체의 {} 부분을 파싱한다.
// 1. 한글자식 이동하며 token화 하는 방법
// 2. String 으로 다루어서 token화 하는 방법
// 2. regexr 로 토큰화 하는 방법.
/**
const person = {
  name: 'Ku',
  age: 19,
  sex,
  me : introduce() { },
  getOlder() {
    this.age++;
  },
  hello: fucntion(){}
};
*/
// 함수인 경우 앞부분에 f_ 를 붙인다.
jsparser.prototype.objectbraceparser = function ( bracestr ) {
    var a = bracestr.split(',');
    var tmparr = [];
    tmparr.push(this.level);
    tmparr.push(this.linenumber);
    tmparr.push('tp_vo_struture');

    for (var i=0; i< a.length; i++){
        //console.log("(%d)==== %s",i, a[i].trim());
        var item = a[i].trim();
        var arr = item.split(':');

        if ((arr[arr.length-1].indexOf('(') > 0) && (arr[arr.length-1].indexOf('{')>0)){
            arr[0] = 'f_' + arr[0];
        }
        if (arr.length == 1) {
            var idx = arr[0].indexOf('(');
            arr[0] = arr[0].substr(0, idx);
        }

        //console.log("%d, %s", arr.length, arr[0]);
        tmparr.push(arr[0]);
    }

    this.tokens.push(tmparr);
}



jsparser.prototype.insertcomment = function (char) {

    if (char === '/') {
        var idx = this.lines.indexOf('\n');
        if (idx === -1) idx = this.lines.indexOf(10) + 1;   // ?
    } else if (char === '*') {
        var idx = this.lines.indexOf('*/') + 2;
    }

    var arr = [];
    var comment = this.lines.substr(0, idx);

    arr.push(comment);
    arr.unshift('tp_comment');
    arr.unshift(this.linenumber);
    arr.unshift(this.level);
    this.tokens.push(arr);
    this.lines = this.lines.substring(idx-1);

    /* lineNumber 재설정 * 주석은 여러줄일 수 있으니 \n 를 count 해서 더해준다. */
    if (char === '*') {
        var count = charcount(comment, '\n');
        count !== -1 ? this.linenumber = this.linenumber + count : this.linenumber = this.linenumber;
    }
}

jsparser.prototype.skipcomment = function (nextchar) {
    var idx = 0;
    if (nextchar === '/'){
        idx = this.lines.indexOf('\n');
    } else if (nextchar === '*'){
        idx = this.lines.indexOf('*/') + '*/'.length + 1;
    }
    var comment = this.lines.substr(0, idx);
    this.lines = this.lines.substring(idx-1);

    /* lineNumber 재설정 * 주석은 여러줄일 수 있으니 \n 를 count 해서 더해준다. */
    if (nextchar === '*') {
        var count = charcount(comment, '\n');
        count !== -1 ? this.linenumber = this.linenumber + count : this.linenumber = this.linenumber;
    }
}


// 토큰 배열에서 keyword가 있는지 찾는다.
jsparser.prototype.findkeyfromarr = function(keyword) {
    var str;
    for (var i=0; i < this.tokenarray.length; i++){
        str = this.tokenarray[i];
        if (str == keyword) {
            return i;
        }
    }
    return -1;
}

jsparser.prototype.findArrformSkipkeywords = function(){

    for(var i=0; i< this.skipkeywords.length+1; i++){
        var key = this.skipkeywords[i];

        if (this.findkeyfromarr(key) !== -1){
            return this.findkeyfromarr(key);
        }
    }
    return -1;
}

// 특정순서로 함수 인지 오브젝트인지 결정할 수 있다. (아직 미사용)
jsparser.prototype.recognizebypath = function (){
    // function ab(){ }, var ab = function () {}  :  ( -> ) -> { -> } 이면 function
    // var o = {}

}

// global scope 와 function 인식에 사용된다.
// 기본적으로 ( ){ 형식을 인식한다.  fs 는 function scope 의 약자이다.
jsparser.prototype.recognizecommonfs = function (){
    return ((this.backupline.indexOf('(') !== -1)
         && (this.backupline.indexOf(')') !== -1)
         //&& (this.getnextchar(')') === '{')
         && (this.nextlinefirstchar(')', '{'))
          );
}

// gf : general function
jsparser.prototype.reconizegf = function (){

    return ((this.recognizecommonfs())
        //&& (this.tokenarray[0] === 'function')
        && (this.backupline.indexOf("function") !== -1)
        && (this.backupline.indexOf("=") === -1)
        && (!this.reconizeif())
        );
}

// af : anonymouse function
jsparser.prototype.recognizeaf = function (){
    return ((this.recognizecommonfs())
        && (this.getnextchar('=') === '(')
        );
}

// tp_tf  : traditional arrow function
jsparser.prototype.reconizetf = function (){
    return ((this.backupline.indexOf('=>') !== -1)
         );
}

// tp_if  : Immediately invoked function
jsparser.prototype.reconizeif = function (){
    //var str = this.backupline.replace(/(\s*)/g, ''); // 모든공백을 지운다.
    var str = this.backupline.c_replaceAllChar(this.backupline, ' ', '');
    return ((this.recognizecommonfs())
         && (str[0] === '(')
         && (str.indexOf('(function') !== -1)
         );
}

// tp_ifa  : Anonymouse Immediately invoked function
jsparser.prototype.reconizeifa = function (){
    var str = this.backupline.replace(/(\s*)/g, '');
    return ((str[0] === '(')
         && (str.indexOf('(()') !== -1)
         );
}

// vf : var function
jsparser.prototype.reconizevf = function (){
    return ((this.recognizecommonfs())
        && (this.findkeyfromarr('function') != -1)
        && (this.findkeyfromarr('prototype') == -1)
        && (this.backupline.indexOf("=") !== -1)
        && (this.tokenarray[0] != 'function')
        && (!this.reconizeif())
        && (!this.recognizejq())
        );
}

// pf : prototype function
jsparser.prototype.recognizepf = function (){
    return ((this.recognizecommonfs())
        && (this.findkeyfromarr('prototype') != -1)
        );
}

// tfe : exports arrow function
jsparser.prototype.recognizetfe = function (){
    return ((this.backupline.indexOf('exports') !== -1)
         );
}

// vfe : exports var function
jsparser.prototype.recognizevfe = function (){
    return ((this.recognizetfe())
         );
}

jsparser.prototype.recognizeallnotfunction = function (){
    return ((this.recognizecommonfs())
         && (this.reconizegf())
         && (this.recognizeaf())
         && (this.reconizetf())
         && (this.reconizeif())
         && (this.reconizeifa())
         && (this.reconizevf())
         && (this.recognizepf())
           );
}

// jq : jquery
jsparser.prototype.recognizejq = function (){
    return (this.backupline.indexOf('$') !== -1);
}

// tp_require  : var ab = require('./ku.js');
jsparser.prototype.recognizerequire = function (){
    return (this.backupline.indexOf('require') !== -1);
}


// 임시 토근 배열 1행을 tokens 배열에 넝는다.
jsparser.prototype.inserttoken = function() {
    //console.log("this.backupline====================>>>[%s]", this.backupline);
    var count = -1;

    if (this.tokenarray.length != 0) {
        //console.log("tokenarray=========",this.tokenarray.toString());
        var nextc = this.getnextchar(')');
        //console.log("nextchar [%s] ", nextc);

        /* ----------------------------------------------------- */
        // tp_gf  : general function  ex: function ab()
        /* ----------------------------------------------------- */
        if ((this.reconizegf()) &&
            (!this.recognizejq())){

            var count = this.braceExistAndLf('function');   // \n 의수 count
            if (this.backupline.indexOf('forEach') !== -1){
                this.tokenarray.unshift('tp_gf_foreach');
            } else {
                this.tokenarray.unshift('tp_gf');
            }

        /* ----------------------------------------------------- */
        // tp_vf  : var function  ex: var ab = function(){}
        /* ----------------------------------------------------- */
        } else if (this.reconizevf()){
            if (this.recognizevfe()){
                this.tokenarray.unshift('tp_vfe');
            } else {
                this.tokenarray.unshift('tp_vf');
            }
        /* ----------------------------------------------------- */
        // tp_pf  : prototype function
        /* ----------------------------------------------------- */
        } else if(this.recognizepf()) {
             this.tokenarray.unshift('tp_pf');

        /* ----------------------------------------------------- */
        // tp_oa  : object access  obj.ab()
        //          object 중에는 defined 된 것 외에 window, document
        //          같은 전역객체들이 존재한다.
        //          window.onload = ab(), window.close()
        //          이 경우 여기서 하위로 둘수 있다. 예로) tp_oaw
        /* ----------------------------------------------------- */
        } else if ((this.backupline.indexOf('.') !== -1)          //  : oa
                //&& (this.backupline.indexOf('(') !== -1)

                && (!this.recognizepf())
                && (!this.recognizetfe())
                && (!this.recognizejq())
                ){
                    if (this.backupline.indexOf('window') !== -1){
                        this.tokenarray.unshift('tp_oaw');                    // window.doucment

                    } else if (this.backupline.indexOf('document') !== -1){
                        this.tokenarray.unshift('tp_oad');                    // document.getElementById

                    } else if((this.backupline.indexOf('=') !== -1)
                      && (this.findkeyfromarr('var') != -1)
                      ) {
                         this.tokenarray.unshift('tp_gv_oa');  // var x = obj.ab()
                    } else {
                        this.tokenarray.unshift('tp_oa');     // obj.ab()
                    }

        } else if (this.findkeyfromarr('new') > 0) {
            if (this.findkeyfromarr('array') > 0) {
                this.tokenarray.unshift('tp_na');               // new array   : na
            } else {
                this.tokenarray.unshift('tp_no');               // new object  : no
            }

        /* ----------------------------------------------------- */
        // 변수 정의 (old)
        /* ----------------------------------------------------- */
        } else if ((this.findkeyfromarr('var') != -1)
                && (this.backupline.indexOf('{') != -1)
                && (this.findkeyfromarr('function') == -1)
                && (this.backupline.indexOf('.') == -1)
                && (this.backupline.indexOf('(') == -1)
                && (this.findkeyfromarr('new') == -1)
                && (this.findkeyfromarr('array') == -1)         // variable object : vo
                ) {
            this.tokenarray.unshift('tp_vo');

        /* ----------------------------------------------------- */
        // 변수 정의 (old)
        /* ----------------------------------------------------- */
        } else if ((this.findkeyfromarr('var') != -1)
                && (this.backupline.indexOf('.') == -1)
                && (this.backupline.indexOf('(') == -1)
                && (this.backupline.indexOf('{') == -1)
                && (this.backupline.indexOf('[') == -1)
                && (this.findkeyfromarr('new') == -1)
                && (this.findkeyfromarr('array') == -1)
                && (!this.reconizegf())
                && (!this.recognizepf())
                && (!this.recognizetfe())
                && (!this.recognizejq())
                ){

                    this.tokenarray.unshift('tp_gv_?');                  // general variable : gv // 아래걸로 대체 삭제 할것

        /* ----------------------------------------------------- */
        // 변수 정의
        /* ----------------------------------------------------- */
        } else if ((this.findkeyfromarr('var') !== -1)
               && (!this.recognizejq())
                ) {
                //var arr = this.currline.split("=");
                var arr = this.backupline.split("=");                        //   var a; \n var b  인경우 처리 되지만,  var a; var b; \n인 경우 처리 안됨.

                if (arr.length === 2){
                    if (arr[1].c_trim(arr[1]).charAt(0) === '['){
                        this.tokenarray.unshift('tp_va');                    // var array  => var a = []
                    } else if (arr[1].c_trim(arr[1]).charAt(0) === '{'){
                        this.tokenarray.unshift('tp_vo');                    // var object => var a = {};
                    } else {
                        this.tokenarray.unshift('tp_gv');                    // geneal var => var a = ''; \n var b = 0
                    }
                } else {
                    this.tokenarray.unshift('tp_gv_non');                        // tp_gv_non  :  var a;
                }
        } else if ((this.findkeyfromarr('const') !== -1)
               && (!this.recognizejq())
                ) {
                //var arr = this.currline.split("=");
                var arr = this.backupline.split("=");                        //   let a; \n var b  인경우 처리 되지만,  var a; var b; \n인 경우 처리 안됨.

                if (arr.length === 2){
                    if (arr[1].c_trim(arr[1]).charAt(0) === '['){
                        this.tokenarray.unshift('tp_ca');                    // const array  => const a = []
                    } else if (arr[1].c_trim(arr[1]).charAt(0) === '{'){
                        this.tokenarray.unshift('tp_co');                    // const object => const a = {};
                    } else {
                        this.tokenarray.unshift('tp_gc');                    // geneal const => const a = ''; \n var b = 0
                    }
                } else {
                    this.tokenarray.unshift('tp_gc_non');                        // tp_gc_non  :  const a;
                }
        } else if ((this.findkeyfromarr('let') !== -1)
               && (!this.recognizejq())
                ) {
                //var arr = this.currline.split("=");
                var arr = this.backupline.split("=");                        //   let a; \n var b  인경우 처리 되지만,  var a; var b; \n인 경우 처리 안됨.

                if (arr.length === 2){
                    if (arr[1].c_trim(arr[1]).charAt(0) === '['){
                        this.tokenarray.unshift('tp_la');                    // let array  => var a = []
                    } else if (arr[1].c_trim(arr[1]).charAt(0) === '{'){
                        this.tokenarray.unshift('tp_lo');                    // let object => var a = {};
                    } else {
                        this.tokenarray.unshift('tp_gl');                    // geneal let => var a = ''; \n var b = 0
                    }
                } else {
                    this.tokenarray.unshift('tp_gl_non');                        // tp_gl_non  :  let a;
                }

        /* ----------------------------------------------------- */
        // tp_if  : Immediately invoked function
        /* ----------------------------------------------------- */
        } else if (this.reconizeif()) {
            this.tokenarray.unshift('tp_if');

        /* ----------------------------------------------------- */
        // tp_ifa  : Anonymouse Immediately invoked function,
        //           tp_if 의 하위 개념
        /* ----------------------------------------------------- */
        } else if (this.reconizeifa()) {
                   this.tokenarray.unshift('tp_ifa');

        /* ----------------------------------------------------- */
        // tp_af  : anonymouse function
        /* ----------------------------------------------------- */
        } else if (this.recognizeaf()) {
                   this.tokenarray.unshift('tp_af');

        /* ----------------------------------------------------- */
        // tp_tf  : traditional arrow function + exports
        /* ----------------------------------------------------- */
        //} else if (this.reconizetf() && !this.reconizeef()
        } else if (this.reconizetf()
                ) {
                if (this.recognizetfe()){
                    this.tokenarray.unshift('tp_tfe');
                } else {
                    this.tokenarray.unshift('tp_tf');
                }

        /* ----------------------------------------------------- */
        // tp_comment  : 앞 단에서 처리해서 넣어준다.  case code = '/':
        /* ----------------------------------------------------- */
        //} else if ((this.backupline.indexOf("//") != -1)
        //        && (this.backupline.indexOf("/*") == -1)
        //          ) {
        //     this.tokenarray.unshift('tp_comment');

        /* ----------------------------------------------------- */
        // gst_fo, gst_if, gst_wh  : for if while global scope statement
        /* ----------------------------------------------------- */
        } else if (this.findkeyfromarr('for') != -1) {
            var count = this.braceExistAndLf();
            this.tokenarray.unshift('gst_fo');
        } else if (this.findkeyfromarr('if') != -1) {

            var count = this.braceExistAndLf('gs');
            this.tokenarray.unshift('gst_if');

        } else if (this.findkeyfromarr('while') != -1) {
            var count = this.braceExistAndLf();
            this.tokenarray.unshift('gst_wh');

        } else if ((this.findkeyfromarr('var') != -1)
                && (this.backupline.indexOf('[') != -1)
                ){
             this.tokenarray.unshift('tp_ao');                   // array object

        /* ----------------------------------------------------- */
        // tp_jq : $
        /* ----------------------------------------------------- */
        } else if (this.recognizejq()){
            this.tokenarray.unshift('tp_jq');
            // 앞단에서 모두 처리함.
        /* ----------------------------------------------------- */
        // tp_require  : var ab = require('./ku.js');
        /* ----------------------------------------------------- */
        } else if (this.recognizerequire()){
                   this.tokenarray.unshift('tp_require');

        } else {
                   this.tokenarray.unshift('tp_non');
                   //console.log("Type is not supported.");

        }


        /* Last Process 이건 비용이 많이든다.? */
        if ((this.findArrformSkipkeywords() === -1)){
            this.tokenarray.unshift(this.linenumber);
            this.tokenarray.unshift(this.level);
            count !== -1 ? this.linenumber = this.linenumber + count : this.linenumber = this.linenumber;
            this.tokens.push(this.tokenarray);
        } else {
            console.log("alert, console 등은 넣지 않습니다.");
        }

        //console.log("(%d) =====> [%s]", this.linenumber, this.tokenarray.toString());
    } else {
        //console.log("Token Array 에 저장된 데이터가 없습니다. , so not inserted.");
    }
}

// {} 처리 1. { 가 첫째줄 다음줄에 올 경우, 2. {} 가 존재하지 않을 경우
// function, if, for, while 등의 공통함수로 사용됨.
jsparser.prototype.braceExistAndLf = function(strtype){

    if((!this.braceExist()) &&
       (this.braceNextlineExist()) &&
       (strtype === 'function')){                   // backupline 에 { 가 없고, nextline에는 있다.
        var brace = this.getbracepart("{","}");
        console.log("1111111[%s]", brace.c_replaceAll('\n','0'));
        this.tokenarray.push(brace);                                       // 모든 세부사항은 배열의 끝에 넣는다 여기서는 추적하지 않는다.
        this.lines = this.lines.substring (brace.length);

        return charcount(brace, '\n');                                     // linenumber 를 새로 계산한다.
    } else if((!this.braceExist()) &&
              (!this.braceNextlineExist()) &&
              (strtype === 'gs')){           // if() console.log(..);    { } 가 없는 경우, 함수는 {} 부분이 없을 수 없다.
                                                                           // backuoline, nextline 둘 다 없음
        var idx = this.nextline.indexOf(';') + 1;
        var str = this.lines.substr(0, idx);
        console.log("2222222[%s]", str);
        this.tokenarray.push('{' + str  + '}');
        this.lines = this.lines.substring(idx);
        return charcount(str, '\n');
        //return count = 1;

    } else if (this.braceExist()) {
        return this.linenumber;
        console.log("main processed!");
    }
}


// backupline 에서 { 가 있으면 true 없으면 false
jsparser.prototype.braceExist = function(){
    var str = this.currline.c_replaceAllChar(this.currline, ' ', '');
    var idx = str.indexOf(')') + 1;  // ')'
    //console.log("[%s], %d", str.charAt(idx), idx);
    if (idx !== 0){
        return (str.charAt(idx) === '{');
    } else {
        //alert("[braceCharExist]err");
    }
}

// 사용하지 않음, braceExist 와 같다.
jsparser.prototype.braceExist2 = function(){
    var str = this.backupline.c_replaceAllChar(this.backupline, ' ', '');
    var idx = str.indexOf('{');
    return idx !== -1;
}

jsparser.prototype.braceNextlineExist = function(){
    if (!this.braceExist()){
        var str = this.nextline.c_replaceAllChar(this.nextline, ' ', '');
        if(str.charAt(0) === '{'){
            return true;
        } else {
            return false;
        }
    }
}


// char 다음 문자를 가져온다.
jsparser.prototype.getnextchar = function (char) {
    var result = '';
    //var str = this.backupline.replace(/(\s*)/g, ''); // 모든공백을 지운다.
    var str = this.backupline.c_replaceAllChar(this.backupline, ' ', '');
    var idx = str.indexOf(char) + 1;  // ')'

    if (idx !== -1) {                 // 문자가 있는 경우 다음 문자를 가져온다.
        return str.charAt(idx);
    } else if (str.length = idx){     // idx가 라인의 마지막이면 다음 라인의 첫 문자를 가져온다.
       //var str2 = this.nextline.replace(/(\s*)/g, ''); // 모든공백을 지운다.
       var str2 = this.nextline.c_replaceAllChar(this.nextline, ' ', '');
       return str2.charAt(0);
    } else {
       // error
       alert("nextchar error");
    }
}

// getnextchar(')', '{')
/*
jsparser.prototype.getnextbarcechar = function (char, checkchar) {
    var result = '';
    //var str = this.backupline.replace(/(\s*)/g, ''); // 모든공백을 지운다.
    var str = this.backupline.c_replaceAllChar(this.backupline, ' ', '');
    var idx = str.indexOf(char) + 1;  // ')'
    if (idx !== -1) {                 // 문자가 있는 경우 다음 문자를 가져온다.
       if (str.charAt(idx) !== checkchar){  // backupline 에 { 가 없으면
           var str2 = this.nextline.c_replaceAllChar(this.nextline, ' ', '');
           var c = str2.charAt(0);
       }
    }
}
*/

jsparser.prototype.nextlinefirstchar = function (char, nchar) {
    if (this.getnextchar(char) !== nchar){
        var str = this.nextline.c_replaceAllChar(this.nextline, ' ', '');
        return str.charAt(0) === nchar;
    } else {
        return true;
    }
}



jsparser.prototype.setuptoken = function() {

    this.token = this.nexttoken;       // 첫 공백일때
    this.tokenarray.push(this.token);
    this.prevtoken = this.tokenarray[this.tokenarray.length-2];
    this.nntoken = this.getnnttoken(this.lines);

    if ((this.token === 'for') || (this.token === 'if') || (this.token === 'while')){

        var str =this.zerotostrings(')');
        this.tokenarray.push(str);
        this.lines = this.lines.substring(str.length-1);


    } else if (this.token === 'require') {
        var idx = this.lines.indexOf(')');
        var str = this.lines.substr(0, idx);
        str = rangestr(str, "'", "'");
        this.tokenarray.push(str);
        this.lines = this.lines.substring(idx);
    }

}

jsparser.prototype.setupjquery = function () {

    var str = this.zerotostrings("\n");
    var arr = str.split("=");

    if (arr.length === 2){
        this.tokenarray.push("jq_var");
        this.tokenarray.push(trim(arr[0]));
        this.lines = this.lines.substring(arr[0].length-1);
    } else {

        // ('#img_btn')  substring
        var idx = this.lines.indexOf(')') + 1;
        var str = this.lines.substr(0, idx);

        // str 에서 ' ' or " " 가 있는지 확인 => 처음 들어올때 " 는 ' 로 replace 된다.
        var charcnt = charcount(str,"'");
        if (charcnt === 2) {
            str = rangestr(str, "'","'");      // ' ' 부분을 가져온다. "" 가 될수도 있다.

            var arr = str.split(',');
            //console.log("$===============>%d, %s", charcnt, arr[0]);
            var typename = '';
            var name = '';

            for(var i=0; i<arr.length; i++){
                var s = arr[i].trim();
                var c = s.charAt(0);

                if(c === '#'){
                   i === 0 ? typename = typename + 'jq_id' : typename = typename + ',' + 'jq_id';
                } else if (c === '.'){
                   i === 0 ? typename = typename + 'jq_class' : typename = typename + ',' + 'jq_class';
                } else {
                   i === 0 ? typename = typename + 'jq_class' : typename = typename + ',' + 'jq_html';
                }

                s = s.substr(1, s.length-1);
                i === 0 ? name = name +s: name = name + ',' +s

                    //console.log("=======>>>>%s, %s", typename, name);
            } // end for
            //this.tokenarray.push(this.linenumber);
            this.tokenarray.push(typename);
            this.tokenarray.push(name);
            this.lines = this.lines.substring(idx);
            //console.log("lines:%s, %d", this.lines, idx);

        }  else { //  '  ' 가 없은 경우
            // jq_dom,jq_function 처리
            str = rangestr(str, '(',')');
            if ((str === 'window') || (str === 'document')){
                this.tokenarray.push('jq_dom');                // 전역 DOM
            } else if (str.indexOf('function') !== -1) {
                this.tokenarray.push('jq_function');           // $(function (){});
            }
            this.tokenarray.push(str);
            this.lines = this.lines.substring(idx);
        }

    }
}



// 0 ~ char 문자까지 잘라서 문자열을 리턴
jsparser.prototype.zerotostrings = function(char){
    var idx = this.lines.indexOf(char) + 1;
    return this.lines.substr(0, idx);

}

jsparser.prototype.inittoken = function() {
    this.tokenseq = 0;
    this.prevtoken = '';
    this.tokenarray = [];
    //this.initkeywords();  // keywords setting is all false.
}

/*
jsparser.prototype.initkeywords = function(){
    var items = Object.keys(this.keywords);  // Keys 는 구 IE에서 작동하지 않는다.
    for (var i = 0; i < items.length; i++) {
        items[i] = false;

    }
}
*/



//하나의 라인만 가져온다.
function substrnewline(input) {
    var inewline = input.indexOf('\n');
    if (inewline <= 0) { return input.substr(0, input.length); } else { return input.substr(0, inewline); }
}


// 하나의 라인에서 정규화로 문자열이 있는지 확인한다.
function checktokeninline(input){
   input = substrnewline(input)
   var regex = /[a-zA-Z]/g;
   var result = input.match(regex);
   //console.log("result", input, result);

   if (!(result || []).length) { return true } else {return false;}
}

// 정규화로 첫 문자열을 가져온다 getnnttoken와 같다. (사용하지 않음)
function getnnttokenreg(input){
   var result = null || [];

   input = substrnewline(input)  // 한 라인만 가져온다.
   var regex = /[a-zA-Z]/g;
   var result = input.match(regex);

   if (Array.isArray(result) && !result.length) { return result[0] } else {return [];}
}


jsparser.prototype.skipLineComment = function() {
  //var line = substrnewline(this.lines);
  var istart = this.lines.indexOf('//');
  var iend = this.lines.indexOf('\n');

  return this.lines.substring(istart, iend);
}

// 특정문자 까지 스트링을 먹어 치운다.
jsparser.prototype.skipstrings = function (str) {

    var index = this.lines.indexOf(str);
    this.lines = this.lines.substring(index+1);
}

jsparser.prototype.getnnttoken = function(input) {
       var i = 0;
       var str = '';
       //console.log("=============>[%s]", input);
       if (checktokeninline(input) ) return '';  //

       while (input) {
           var code = input.charCodeAt(i);
           var a = input.charAt(i);

           //console.log("=============>%d, [%s]", i,a);
           switch (true) {

              case (a >= 'A' && a <= 'Z') || (a >= 'a' && a <= 'z') || a === '_' || a === '@' || a === '-':
                    str = str + a;
                    break;
              case a === ' ' || a === '(' || a === ')' || a === '=':
                   if (str != '') return str;
                   str = '';
                   break;
              default: break;
           }
           if ((input.length === i) || isNewLine(code) )  break;
           i++;
      }
      return str;
}


jsparser.prototype.getnextline = function(){
    var idx1 = this.lines.indexOf('\n') + 1;
    var str = this.lines.substr(idx1, this.lines.length - idx1);

    var idx2 = str.indexOf('\n') + 1;
    var str2 = str.substr(0, idx2);

    return str2;
}

jsparser.prototype.getcurrline = function(){
    var idx1 = this.lines.indexOf('\n') + 1;
    var str = this.lines.substr(0, idx1);
    return str;
}


// 라인에서 'function' 같은 keyword가 있는지 체크 작동하지 않음.
jsparser.prototype.checkkeywordinline = function(keystr, tok){

    var line = tok + this.lines; //토큰이 사라진 상태에서 현재 token를 넣어줌.
    var idx = line.indexOf('\n');   // 리턴 윈로우 \n\r, 도스 \n, 유닉스 \r
    var str = line.substr(0, idx);
    //console.log("chkek: [%s]",str);
    if (str.indexOf(keystr) < 0) {
        return true;
    } else { //업으면 -1 리턴
        return false;
    }
}

jsparser.prototype.checkkeyword = function(){

    var keys = Object.keys(this.keywords);
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var value = this.keywords[key];
        if (value == true) {
            return key;
        } else {
            return '';
        }
        // this.keywords[key] ? key : '';
    }
}

// 연속된 공백을 먹어 치운다.
jsparser.prototype.eatwhitespace = function(){
    if (this.nexttoken== '') {       // 첫 공백이후 다시 공백이 들어오면 (연속된 공백은 지워준다.) var  x ;
        this.token = this.prevtoken;
        //console.log("white space==>", this.nexttoken);
        this.skiptoken();
        return true;
   }
   return false;
}






// token 이 keyword에 존재하는지 체크
jsparser.prototype.keywordexist = function (key) {
    //
    var keys = Object.keys(this.keywords)   // 배열로 변경해서 값을 가져오고 값을 변경  다시 배열을 객체로 만들어....
    for (var i = 0; i < keys.length; i++) {
        if (keys[i] == key) {
            return true;
        } else {
            return false;
        }
        // return keys[i] == key;
    }
}


jsparser.prototype.getcollector = function (typeid) {
    if (this.tokenobj.length >= 0) {
        //
        // loop를 돌아 typeid에 맞는 node를 return 한다.
    }
}

jsparser.prototype.setcollector = function (typeid, data) {
    if (this.tokenobj.length >= 0) {
        //

    }
}

jsparser.prototype.skiptoken = function() {

    this.addone();
    this.emptytoken();
}

jsparser.prototype.addone = function() {  // parserunit

    this.nexttoken = this.nexttoken + this.lines.charAt(0);   // line 의 한문자를 가져온다.
    this.lines = this.lines.substring(1);                     // line 에서 한문자를 제거
    this.currindex++;
}

jsparser.prototype.emptytoken = function(){
    this.token = '';
    this.nexttoken = '';
}

jsparser.prototype.parserjs = function() {  // parserunit
    console.log("========================== Jsparsing starting ======================= \n ");

    var code = this.lines.charCodeAt(this.lines.length);
    if (!isNewLine(code)){
        this.lines = this.lines + String.fromCharCode(code);
    }

    if (this.linenumber === 1) {
        this.nextline = this.getnextline();
        this.currline = this.getcurrline();
    }

    while (this.lines) {
        this.getnexttoken();
        if (this.lines.length === 0)  break;
    }
}

jsparser.prototype.tostringtokens = function () {
        var result = '';

	for ( var i = 0; i < this.tokens.length; i++ ){
           var n = this.tokens[i];
           i === this.tokens.length-1 ? result += n.toString() : result += n.toString() + '| \n';
	}
	console.log("result: [%d] \n [%s]", this.tokens.length, result);
	return result;
}