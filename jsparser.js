/*
filename : jsparser.js
author : yoobi
project : chartflow
company :
*/

/* level : ó�� <script>...</script>, js ������ ��ũ��Ʈ�� ���� ��� 0, Brace Part�� ���� ��� 1  */
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
         this.currindex      = 0;    // ������ġ

         this.tokenseq       = 0;    // ���κ� token ��

         this.tokenarray = [];
         this.tokens = [];            // ���κ��� ��� ��ū�� ����
         this.linenumber = 1;

         this.tokenobj = []; //[ {tagname: depth: data:},{} ... {n} ] �迭�� �׳� object�� �����Ѵ�.
         this.depth = 0;     // �Լ� ���� �Լ�


         this.keywords = makearray("var,let,const,function,new,prototype");
         this.skipkeywords = makearray("console,alert");

         //this.lines = "var ab    =   function  () {  \n  alert('ab')  {         {}        } } ";
         //this.lines = "   var xy = '';  \n function ab(){           x       }  ";
         //this.lines = " function ab   () {   \n } ";
         //this.lines = " var x=  8 ; var y  ; z = 'sex' ";
         //this.lines = " var x=  8";
         //this.lines = "var obj =new ab()  ;";
         //this.lines = "var emptyobject = { ";
         //this.lines = " function ab   () {    ";    // error ó��
         //this.lines = "var o ={}";
         //this.lines = "var arr = [       ]";
         //this.lines = "var arr =new array()";
         //this.lines = "obj.ab(x);";
         //this.lines = "ab.prototype.call = function(){  \n  alert('me!') } ";
         //this.lines = "//before comment\n function ab() { \n alert('me') } ";
         //this.lines = "function ab() { \n alert('me') } //after comment   ";
         //this.lines = " /*  before comment \n  It's: comment !  */  \n var x;   ";
         //this.lines = " if (true) {  \n let name = 'Luke'; \n } \n ";     // �������� ����� Block Scope
         //this.lines = " console.log('test...')";
         //this.lines = " for(var i=0; i < o.length; i++){ \n alert()} ";
         //this.lines = "var ab    =   function  () {    alert('ab')  \n{         {}        } } ";
         //this.lines = "var ab = (x) => {  test() } ";
         //this.lines = " var ab = () {}";
         //this.lines = "(function(ab){     })('foo'); ";  // ��� �����Լ�
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

         // ������ ���� �˸��� ���� eof �� ������ �־��ش�. �Ʒ����� �������� check ������ Test�� �����ϱ�  ���� ����
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
                      if (this.nextchar === '-') {                                 //<!-- --> comment, html ���� �ȿ��� <script> ��ũ �ȿ��� Html�ּ��� ���� �� �ִ�.
                           var idx = this.lines.indexOf('-->') + 1;
                           this.lines = this.lines.substring(idx + '-->'.length);
                      }
                     break;
                 case a === '<':
                     if (this.nextchar === '!') {                                 // <!-- --> comment , <!DOCTYPE HTML ....>  skip, ó���� ! ���� ����
                         this.skiptoken();
                     } else {
                         this.addone();
                     }
                     break;
                 case (a >= 'A' && a <= 'Z') || (a >= 'a' && a <= 'z') || a === '_' || a === '@' || a === '-':  // ����
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

                     this.inserttoken();                                            // tokens �� �ִ´�.
                     this.inittoken();                                              // ��� �ʱ�ȭ
                     this.skiptoken();
                     break;

                 case a === ' ' || a === '=' || a === '(' || a === '.':             // code = 32
                     if (this.eatwhitespace()) break;

                     this.nexttoken = this.nexttoken.c_trim(this.nexttoken);

                     //console.log("lines = %s", this.lines);
                     //console.log("backu = %s", this.backupline);
                     //console.log("this.nexttoken=====>", this.nexttoken);

                     this.setuptoken();                                             // ��ū�� ������ �ӽ� arr�� ����
                     this.skiptoken();

                     break;
                 case a === ',':
                     this.token = this.nexttoken;

                     this.tokenseq++;
                     this.skiptoken();
                     break;
                 case a === '{':                                                   // �Լ� or ��ü�� �ش� or let {ab, cd} = require('');

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
                             this.tokenarray.push(brace);                  // ��� ���λ����� �迭�� ���� �ִ´� ���⼭�� �������� �ʴ´�.
                             this.lines = this.lines.substring (brace.length-1);
                         //} else {

                         //}
                     }

                     if (this.currline.indexOf('try') !== -1 ){                     // try ó��

                     }

                     /*
                     if (this.tokenarray[1] === 'function') {                          // general function ( function ab(){} )  [seq|function|ab]
                         this.lines = this.lines.substring ((arr[0] || []).length);    // �Լ�  { { {  } } } �κ��� ��� ����, �Լ��� ���⼭ �������� �ʴ´�.
                     } else if ((this.findkeyfromarr('function') != -1)
                             && (this.findkeyfromarr('prototype') == -1)) {
                         this.lines = this.lines.substring ((arr[0] || []).length);    // var ab = function(){}
                     } else if(this.findkeyfromarr('prototype') != -1) {
                         this.lines = this.lines.substring ((arr[0] || []).length);    // prototype function
                     }

                     if (this.tokenarray[0] === 'var'){
                         console.log("regexr match====>", arr.toString(), (arr[0] || []).length);
                         if ((arr[0] || []).length > 0) {
                             //this.objectbraceparser(arr[1]);                            // arr[0] = { ....{}} arr[1] = ...{}  // tp_vo_structure �� ���� token �� ����
                             //this.lines = this.lines.substring ((arr[0] || []).length); // ������Ʈ   { { {  } } } �κ��� ��� ����, ���⼭ �ļ��ؼ� ������ ������ ��. ���� ������ key �� ������.
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


// function, if, for �� ������� �ϰ�, let, object �κ��� recursion ���� �ʴ´�.
jsparser.prototype.recursion = function(brace){

    var BRACE_END_TOKEN = '@';
    this.level = 1;
    var count = charcount(brace, '\n');
    this.linenumber = this.linenumber - count;

    // brace ���� ù {,  �� } �� �����.
    brace = brace.substring(0);
    brace = brace.substr(0, brace.length-1);
    this.lines = brace  + BRACE_END_TOKEN + this.lines;   // lines �� ���� data �� ����.

    while(this.lines){
        getnexttoken();
    }
}


/* �⺻������ Text �� ó���Ѵ�. */
/* require('aaa.js'); �� ��� require ��ū ó���� ���� ó���Ѵ�. */
/* Text �� Html �ΰ�� ���ӿ��� ' ���Եȴ�. */
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
       if (this.currline.indexOf(tag) !== -1){     // this.currline �� ���� '<a href='http:www.fckeditor.net/'>FCKeditor</a>'
          return keywords[i];
       }
    }
}

// object or function �� { {} } �� ���� ��ø brace�� count �ؼ� object�� ���� �Բ� Object ��ü ��Ʈ���� �̴´�.
// �Ʒ������� ��ü
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

/* s.match(/\{(.*)\}/s) �� ��ü�Ѵ�. ������ �־ getBraceEndCount �� ��ü��. */
// ���� �����
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

// ��ü�� {} �κ��� �Ľ��Ѵ�.
// 1. �ѱ��ڽ� �̵��ϸ� tokenȭ �ϴ� ���
// 2. String ���� �ٷ� tokenȭ �ϴ� ���
// 2. regexr �� ��ūȭ �ϴ� ���.
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
// �Լ��� ��� �պκп� f_ �� ���δ�.
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

    /* lineNumber �缳�� * �ּ��� �������� �� ������ \n �� count �ؼ� �����ش�. */
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

    /* lineNumber �缳�� * �ּ��� �������� �� ������ \n �� count �ؼ� �����ش�. */
    if (nextchar === '*') {
        var count = charcount(comment, '\n');
        count !== -1 ? this.linenumber = this.linenumber + count : this.linenumber = this.linenumber;
    }
}


// ��ū �迭���� keyword�� �ִ��� ã�´�.
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

// Ư�������� �Լ� ���� ������Ʈ���� ������ �� �ִ�. (���� �̻��)
jsparser.prototype.recognizebypath = function (){
    // function ab(){ }, var ab = function () {}  :  ( -> ) -> { -> } �̸� function
    // var o = {}

}

// global scope �� function �νĿ� ���ȴ�.
// �⺻������ ( ){ ������ �ν��Ѵ�.  fs �� function scope �� �����̴�.
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
    //var str = this.backupline.replace(/(\s*)/g, ''); // �������� �����.
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


// �ӽ� ��� �迭 1���� tokens �迭�� �մ´�.
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

            var count = this.braceExistAndLf('function');   // \n �Ǽ� count
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
        //          object �߿��� defined �� �� �ܿ� window, document
        //          ���� ������ü���� �����Ѵ�.
        //          window.onload = ab(), window.close()
        //          �� ��� ���⼭ ������ �Ѽ� �ִ�. ����) tp_oaw
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
        // ���� ���� (old)
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
        // ���� ���� (old)
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

                    this.tokenarray.unshift('tp_gv_?');                  // general variable : gv // �Ʒ��ɷ� ��ü ���� �Ұ�

        /* ----------------------------------------------------- */
        // ���� ����
        /* ----------------------------------------------------- */
        } else if ((this.findkeyfromarr('var') !== -1)
               && (!this.recognizejq())
                ) {
                //var arr = this.currline.split("=");
                var arr = this.backupline.split("=");                        //   var a; \n var b  �ΰ�� ó�� ������,  var a; var b; \n�� ��� ó�� �ȵ�.

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
                var arr = this.backupline.split("=");                        //   let a; \n var b  �ΰ�� ó�� ������,  var a; var b; \n�� ��� ó�� �ȵ�.

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
                var arr = this.backupline.split("=");                        //   let a; \n var b  �ΰ�� ó�� ������,  var a; var b; \n�� ��� ó�� �ȵ�.

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
        //           tp_if �� ���� ����
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
        // tp_comment  : �� �ܿ��� ó���ؼ� �־��ش�.  case code = '/':
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
            // �մܿ��� ��� ó����.
        /* ----------------------------------------------------- */
        // tp_require  : var ab = require('./ku.js');
        /* ----------------------------------------------------- */
        } else if (this.recognizerequire()){
                   this.tokenarray.unshift('tp_require');

        } else {
                   this.tokenarray.unshift('tp_non');
                   //console.log("Type is not supported.");

        }


        /* Last Process �̰� ����� ���̵��.? */
        if ((this.findArrformSkipkeywords() === -1)){
            this.tokenarray.unshift(this.linenumber);
            this.tokenarray.unshift(this.level);
            count !== -1 ? this.linenumber = this.linenumber + count : this.linenumber = this.linenumber;
            this.tokens.push(this.tokenarray);
        } else {
            console.log("alert, console ���� ���� �ʽ��ϴ�.");
        }

        //console.log("(%d) =====> [%s]", this.linenumber, this.tokenarray.toString());
    } else {
        //console.log("Token Array �� ����� �����Ͱ� �����ϴ�. , so not inserted.");
    }
}

// {} ó�� 1. { �� ù°�� �����ٿ� �� ���, 2. {} �� �������� ���� ���
// function, if, for, while ���� �����Լ��� ����.
jsparser.prototype.braceExistAndLf = function(strtype){

    if((!this.braceExist()) &&
       (this.braceNextlineExist()) &&
       (strtype === 'function')){                   // backupline �� { �� ����, nextline���� �ִ�.
        var brace = this.getbracepart("{","}");
        console.log("1111111[%s]", brace.c_replaceAll('\n','0'));
        this.tokenarray.push(brace);                                       // ��� ���λ����� �迭�� ���� �ִ´� ���⼭�� �������� �ʴ´�.
        this.lines = this.lines.substring (brace.length);

        return charcount(brace, '\n');                                     // linenumber �� ���� ����Ѵ�.
    } else if((!this.braceExist()) &&
              (!this.braceNextlineExist()) &&
              (strtype === 'gs')){           // if() console.log(..);    { } �� ���� ���, �Լ��� {} �κ��� ���� �� ����.
                                                                           // backuoline, nextline �� �� ����
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


// backupline ���� { �� ������ true ������ false
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

// ������� ����, braceExist �� ����.
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


// char ���� ���ڸ� �����´�.
jsparser.prototype.getnextchar = function (char) {
    var result = '';
    //var str = this.backupline.replace(/(\s*)/g, ''); // �������� �����.
    var str = this.backupline.c_replaceAllChar(this.backupline, ' ', '');
    var idx = str.indexOf(char) + 1;  // ')'

    if (idx !== -1) {                 // ���ڰ� �ִ� ��� ���� ���ڸ� �����´�.
        return str.charAt(idx);
    } else if (str.length = idx){     // idx�� ������ �������̸� ���� ������ ù ���ڸ� �����´�.
       //var str2 = this.nextline.replace(/(\s*)/g, ''); // �������� �����.
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
    //var str = this.backupline.replace(/(\s*)/g, ''); // �������� �����.
    var str = this.backupline.c_replaceAllChar(this.backupline, ' ', '');
    var idx = str.indexOf(char) + 1;  // ')'
    if (idx !== -1) {                 // ���ڰ� �ִ� ��� ���� ���ڸ� �����´�.
       if (str.charAt(idx) !== checkchar){  // backupline �� { �� ������
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

    this.token = this.nexttoken;       // ù �����϶�
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

        // str ���� ' ' or " " �� �ִ��� Ȯ�� => ó�� ���ö� " �� ' �� replace �ȴ�.
        var charcnt = charcount(str,"'");
        if (charcnt === 2) {
            str = rangestr(str, "'","'");      // ' ' �κ��� �����´�. "" �� �ɼ��� �ִ�.

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

        }  else { //  '  ' �� ���� ���
            // jq_dom,jq_function ó��
            str = rangestr(str, '(',')');
            if ((str === 'window') || (str === 'document')){
                this.tokenarray.push('jq_dom');                // ���� DOM
            } else if (str.indexOf('function') !== -1) {
                this.tokenarray.push('jq_function');           // $(function (){});
            }
            this.tokenarray.push(str);
            this.lines = this.lines.substring(idx);
        }

    }
}



// 0 ~ char ���ڱ��� �߶� ���ڿ��� ����
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
    var items = Object.keys(this.keywords);  // Keys �� �� IE���� �۵����� �ʴ´�.
    for (var i = 0; i < items.length; i++) {
        items[i] = false;

    }
}
*/



//�ϳ��� ���θ� �����´�.
function substrnewline(input) {
    var inewline = input.indexOf('\n');
    if (inewline <= 0) { return input.substr(0, input.length); } else { return input.substr(0, inewline); }
}


// �ϳ��� ���ο��� ����ȭ�� ���ڿ��� �ִ��� Ȯ���Ѵ�.
function checktokeninline(input){
   input = substrnewline(input)
   var regex = /[a-zA-Z]/g;
   var result = input.match(regex);
   //console.log("result", input, result);

   if (!(result || []).length) { return true } else {return false;}
}

// ����ȭ�� ù ���ڿ��� �����´� getnnttoken�� ����. (������� ����)
function getnnttokenreg(input){
   var result = null || [];

   input = substrnewline(input)  // �� ���θ� �����´�.
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

// Ư������ ���� ��Ʈ���� �Ծ� ġ���.
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


// ���ο��� 'function' ���� keyword�� �ִ��� üũ �۵����� ����.
jsparser.prototype.checkkeywordinline = function(keystr, tok){

    var line = tok + this.lines; //��ū�� ����� ���¿��� ���� token�� �־���.
    var idx = line.indexOf('\n');   // ���� ���ο� \n\r, ���� \n, ���н� \r
    var str = line.substr(0, idx);
    //console.log("chkek: [%s]",str);
    if (str.indexOf(keystr) < 0) {
        return true;
    } else { //������ -1 ����
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

// ���ӵ� ������ �Ծ� ġ���.
jsparser.prototype.eatwhitespace = function(){
    if (this.nexttoken== '') {       // ù �������� �ٽ� ������ ������ (���ӵ� ������ �����ش�.) var  x ;
        this.token = this.prevtoken;
        //console.log("white space==>", this.nexttoken);
        this.skiptoken();
        return true;
   }
   return false;
}






// token �� keyword�� �����ϴ��� üũ
jsparser.prototype.keywordexist = function (key) {
    //
    var keys = Object.keys(this.keywords)   // �迭�� �����ؼ� ���� �������� ���� ����  �ٽ� �迭�� ��ü�� �����....
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
        // loop�� ���� typeid�� �´� node�� return �Ѵ�.
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

    this.nexttoken = this.nexttoken + this.lines.charAt(0);   // line �� �ѹ��ڸ� �����´�.
    this.lines = this.lines.substring(1);                     // line ���� �ѹ��ڸ� ����
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