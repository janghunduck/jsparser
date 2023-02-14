//(function(){


// var jsparser = this.jsparser = function(hj) { // �Լ��ȿ� this�� �Ƚᵵ ��.
var jsparser = function (script) {

         this.lines          = script;
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
         this.linenumber = 0;

         this.tokenobj = []; //[ {tagname: depth: data:},{} ... {n} ] �迭�� �׳� object�� �����Ѵ�.
         this.depth = 0;     // �Լ� ���� �Լ�

         this.keywords = makeobject("var,let,const,function,new,prototype");


         //this.lines = "var ab    =   function  () {  \n  alert('ab')  {         {}        } } ";
         
         //this.lines = "   var xy = '';  \n function ab(){           x       }  ";
         //this.lines = " function ab   () {   \n } ";
         
         
         //this.lines = " var x=  8 ; var y  ; z = 'sex' ";
         //this.lines = " var x=  8";
         //this.lines = "var obj =new ab()  ;";
         //this.lines = "var emptyobject = { ";
         //this.lines = " function ab   () {    ";    // error ó��
         
         //this.lines = "var o ={}";
         //this.lines = "var arr =[]";
         //this.lines = "var arr =new array()";
         //this.lines = "obj.ab(x);";
         //this.lines = "ab.prototype.call = function(){  \n  alert('me!') } ";
         //this.lines = "//before comment \n function ab() { \n alert('me') } ";
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
         //this.lines = "$(document).ready( function (){}) ";
         //this.lines = "$('#img_btn').click( function(){  } )";
         //this.lines = "try { } finally {} ";
         //this.lines = " try { } catch (e) {} "
         //this.lines = " try { o = obj.init() } chatch (err) {} filnally {  } "
         //this.lines = "module.exports = { add:add, sub:sub } "      // module exports
         
         // ������ ���� �˸��� ���� eof �� ������ �־��ش�. �Ʒ����� �������� check ������ Test�� �����ϱ�  ���� ����
         var lastcode = this.lines.charCodeAt(this.lines.length);
         if (!isNewLine(lastcode)) this.lines = this.lines + String.fromCharCode(10);


         this.getnexttoken = function () {

             //eatwhitespace();

             var a = this.lines.charAt(0);
             var code = this.lines.charCodeAt(0);
             this.prevchar = a;
             this.nextchar = this.lines.charAt(1);


             //console.log("%s, %d", a, b);
             switch (true) {

                 case a === "'":
                     //console.log("this.nexttoken=", this.nexttoken);
                     /*
                     if (this.nexttoken !== ''){                      // require('aaa.js'); ó���� ���� �߰�, ������ �ִ��� Ȯ��
                        this.tokenarray.push(this.nexttoken);
                     }
                     */
                     this.skiptoken();//this.addone();  // skiptoken() ����
                     break;
                 /*case a === '"':
                     this.addone();
                     break;
                     */
                 case (a >= 'A' && a <= 'Z') || (a >= 'a' && a <= 'z') || a === '_' || a === '@' || a === '-':  // ����
                    // console.log("a=", a);
                     this.addone();
                     break;

                 case code === 59 || code === 0 || code === 10 || code === 13 || code === 0x2028 || code === 0x2029: // 0: eof, 59: ;
                     //console.log("a====================%s, code=%d", a, code);
                     //if (code !== 0) {
                        //if (this.eatwhitespace()) break;
                     //}
                     
                     //console.log("this.nexttoken=", this.nexttoken);
                     if (this.nexttoken != '') this.tokenarray.push(this.nexttoken);

                     this.inserttoken();                                            // tokens �� �ִ´�.
                     this.inittoken();                                              // ��� �ʱ�ȭ
                     this.skiptoken();
                     break;

                 case a === ' ' || a === '=' || a === '(' || a === '.':             // code = 32
                     //console.log("a====================[%s], code=%d", a, code);
                     if (this.eatwhitespace()) break;

                     this.setuptoken();                                             // ��ū�� ������ �ӽ� arr�� ����

                     //if (this.token == 'function') this.keywords.function = true;
                     //if (this.token == 'var') this.keywords.var = true;
                     
                     /*
                     if ((a === '=') && (this.keywords.var)) {                      // ������ = ���� ; ���� ��� ����
                         console.log("var --------------------------------------");
                         this.inserttoken();
                         this.inittoken();
                         this.skipstrings(";");
                     }
                     */
                     this.skiptoken();
                     break;
                 case a === ',':
                     this.token = this.nexttoken;

                     this.tokenseq++;
                     this.skiptoken();
                     break;
                 case a === '{':                                                   // �Լ� or ��ü�� �ش� or let {ab, cd} = require('');
                     
                     var arr = this.nextline.split("=");
                     console.log("currline = %s", this.currline);
                     console.log("lines = %s", this.lines);
                     console.log("backupline = %s", this.backupline);
                     console.log("nextline = %s", this.nextline);
                     
                     if (arr.length > 1){                                     // ok!  let {ab, cd} = require('');
                          var identreq = rangestr(arr[0], '{', '}');
                          var reqitems = identreq.split(',');
                          for(var i=0;i < reqitems.length; i++){
                              this.tokenarray.push(reqitems[i]);
                          }
                     } else {                                                  // ok! object, function

                         var brace = this.getbracepart('{','}');
                         console.log("brace=%s", brace);
                         this.tokenarray.push(brace);                  // ��� ���λ����� �迭�� ���� �ִ´� ���⼭�� �������� �ʴ´�.
                         this.lines = this.lines.substring (brace.length);
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
                     /*
                     var arr = this.lines.match(/\[(.*)\]/s);                           // regular expression { {  } }
                     if ((arr[0] || []).length > 0) {
                          this.tokenarray.push(arr[0]);
                          this.lines = this.lines.substring ((arr[0] || []).length);
                     }
                     */
                     
                     var brace = this.getbracepart('[',']');
                     this.tokenarray.push(brace);
                     this.lines = this.lines.substring (brace.length);
                     
                     this.skiptoken();
                     break;
                 case a === '/':                                                       // comment
                     this.insertcomment();
                     this.skiptoken();
                     break;
                 case (a >= '0' && a <= '9') || a === '+':
                     this.addone();
                     break;
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
                 case a === ':':

                     this.addone();
                     break;

                 case a === '<':
                     this.skiptoken();
                     break;
                 case a === '>':

                     this.skiptoken();
                     break;

                 default:  break;
             }  // end switch


             if ( this.linenumber === 0 ) {
                if (isNewLine(code)) {
                    this.backupline = '';
                    this.nextline = '';
                } else {
                    this.backupline = a;
                    this.nextline = this.getnextline();
                    this.currline = a + this.getcurrline();
                    //console.log("this.currline===>:", this.currline);
                }
                this.linenumber++;
             } else {
                this.backupline = this.backupline + a;  // line ���� paring ���� backup �Ѵ�.
             }

             return true;
         };
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


/* s.match(/\{(.*)\}/s) �� ��ü�Ѵ�.  */
/* c closechar, o openchar*/
jsparser.prototype.getbracepart = function(o, c){
    //var s = "ab = function() { alert('ab'); {  a  { c } b} } aaa{e}";
    var pos = 0;

    var closepos = this.lines.indexOf(c);
    var closestr = this.lines.substr(0, closepos);                   // { alert('ab'); {  a  { c
    var cnt = countRepeatStr(closestr, o);

    var nextstr = this.lines.substr(closepos, this.lines.length - closepos);  //  } b} } aaa{e}

    var foundPos = 0;
    for(var i=0; i<cnt;i++){
        foundPos = nextstr.indexOf(c, pos)
        //alert(foundPos +'   /'+ pos);
        if(foundPos == -1) break;
        pos = foundPos + 1;
    }

    return closestr + nextstr.substr(0, foundPos+1);       // } b} }
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
         && (this.getnextchar(')') === '{')
          );
}

// gf : general function
jsparser.prototype.reconizegf = function (){
    return ((this.recognizecommonfs())
        && (this.tokenarray[0] === 'function')
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
    var str = this.backupline.replace(/(\s*)/g, ''); // �������� �����.
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


    if (this.tokenarray.length != 0) {
        //console.log("tokenarray=========",this.tokenarray.toString());
        var nextc = this.getnextchar(')');
        //console.log("nextchar [%s] ", nextc);

        /* ----------------------------------------------------- */
        // tp_gf  : general function  ex: function ab()
        /* ----------------------------------------------------- */
        if (this.reconizegf()) {
            this.tokenarray.unshift('tp_gf');
            
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
        } else if ((this.backupline.indexOf('.') != -1)          //  : oa
                && (this.backupline.indexOf('(') != -1)
                && (this.findkeyfromarr('prototype') == -1)
                && (!this.recognizetfe())
                ){
                    if (this.backupline.indexOf('window') !== -1){
                        this.tokenarray.unshift('tp_oaw');
                    } else {
                        this.tokenarray.unshift('tp_oa');
                    }

        } else if (this.findkeyfromarr('new') > 0) {
            if (this.findkeyfromarr('array') > 0) {
                this.tokenarray.unshift('tp_na');               // new array   : na
            } else {
                this.tokenarray.unshift('tp_no');               // new object  : no
            }
        } else if ((this.findkeyfromarr('var') != -1)
                && (this.backupline.indexOf('{') != -1)
                && (this.findkeyfromarr('function') == -1)
                && (this.backupline.indexOf('.') == -1)
                && (this.backupline.indexOf('(') == -1)
                && (this.findkeyfromarr('new') == -1)
                && (this.findkeyfromarr('array') == -1)         // variable object : vo
                ) {
            this.tokenarray.unshift('tp_vo');
        } else if ((this.findkeyfromarr('var') != -1)
                && (this.findkeyfromarr('function') == -1)
                && (this.backupline.indexOf('.') == -1)
                && (this.backupline.indexOf('(') == -1)
                && (this.backupline.indexOf('{') == -1)
                && (this.backupline.indexOf('[') == -1)
                && (this.findkeyfromarr('new') == -1)
                && (this.findkeyfromarr('array') == -1)
                ){
                    this.tokenarray.unshift('tp_gv');                  // general variable : gv

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
                    this.tokenarray.unshift('gst_fo');
        } else if (this.findkeyfromarr('if') != -1) {
                   this.tokenarray.unshift('gst_if');
        } else if (this.findkeyfromarr('while') != -1) {
                   this.tokenarray.unshift('gst_wh');

        } else if ((this.findkeyfromarr('var') != -1)
                && (this.backupline.indexOf('[') != -1)
                ){
                   this.tokenarray.unshift('tp_ao');
                   
        /* ----------------------------------------------------- */
        // jq_id : $
        /* ----------------------------------------------------- */
        } else if (this.recognizejq()){
                   //this.tokenarray.unshift('jq_');
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
        
        
        this.tokenarray.unshift(this.linenumber);              // line number

        this.tokens.push(this.tokenarray);
        this.linenumber++;
        //console.log("(%d) =====> [%s]", this.linenumber, this.tokenarray.toString());
    } else {
        //console.log("This is Empty array, so not inserted.");
    }
}

jsparser.prototype.insertcomment = function () {

    if (this.nextchar == '/') {
        var idx = this.lines.indexOf('\n') + 1;
        if (idx == -1) idx = this.lines.indexOf(10) + 1;
    } else if (this.nextchar == '*') {
        var idx = this.lines.indexOf('*/') + 2;
    }
    var arr = [];
    arr.push(this.lines.substr(0, idx));
    
    
    arr.unshift('tp_comment');
    arr.unshift(this.linenumber);  // * �ΰ�� ���μ��� �����ð� �����.
    this.tokens.push(arr);
    this.lines = this.lines.substring(idx);
    
}

jsparser.prototype.setupjquery = function () {

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
    
    
    //console.log("line==>[%s]", this.lines);
    //console.log("-------token: %s", this.token);
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

function isNewLine(code) {
    return code === 10 || code === 13 || code === 0x2028 || code === 0x2029
}



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

// char ���� ���ڸ� �����´�.
jsparser.prototype.getnextchar = function (char) {
    var str1 = this.backupline.replace(/(\s*)/g, ''); // �������� �����.
    var idx1 = str1.indexOf(char);
    if (idx1 > -1) {
        return str1.charAt(idx1+1);
    } else if (str1.length = idx1){  // idx�� ������ �������̸� ���� ������ ù ���ڸ� �����´�.
       var str2 = this.nextline.replace(/(\s*)/g, ''); // �������� �����.
       return str2.charAt(0);
    } else {
       // error
    }

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

    //console.log("nexttoken= %s, lines= %s, index= %d", this.nexttoken, this.lines, this.currindex);
    //if ((this.tokenseq != 0) && (this.nexttoken.length > 1)) {
    //    this.prevtoken = this.nexttoken + this.lines.charAt(0);
    //}

    this.nexttoken = this.nexttoken + this.lines.charAt(0);   // line �� �ѹ��ڸ� �����´�.
    this.lines = this.lines.substring(1);                     // line ���� �ѹ��ڸ� ����
    this.currindex++;
}

jsparser.prototype.emptytoken = function(){
    this.token = '';
    this.nexttoken = '';
}

jsparser.prototype.parserjs = function() {  // parserunit
        var i = 0;
        console.log("===================================== Jsparsing starting =========================================== \n this.lines=[%s]", this.lines);
        //console.log("lines length =", this.lines.length);

        var code = this.lines.charCodeAt(this.lines.length);
        if (code === 0 || code === 10 || code === 13 || code === 0x2028 || code === 0x2029) {
        } else {
           this.lines = this.lines + String.fromCharCode(code);
        }

        while (this.lines) {
           this.getnexttoken();

           if (this.lines.length === 0)  break;

           //if (i == 100) break;
           i++;
        }
}



jsparser.prototype.tostringtokens = function () {
        var n = [];
        var result = '';
        console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
	for ( var i = 0; i < this.tokens.length; i++ ){
           n = this.tokens[i];
           
           if (i === this.tokens.length-1){
               result = result + n.toString();
           } else {
               result = result + n.toString() + '|';
           }

           
       
	};
	console.log("result: %s", result);
	return result;
        
}

jsparser.prototype.test = function(){
    //console.log("It's Testing ....................................................");
}

var testjs1 =
             "var x; \n" +
             "function ab () {   \n"+
	     "     alert('ab') \n"+
             "}  \n"+
             '';


//var pj = new jsparser("var x; var y; var z= 100000;");
//var pj = new jsparser("var x=9 ;var y; var a,b;");

//var pj = new jsparser(" function ab () {   \n } ");
//var pj = new jsparser(testjs1);
//var pj = new jsparser("var obj= new ab  (); ");
/*
var pj = new jsparser("ab = function() {  \n   alert('ab') }");
pj.parserjs();
pj.tostringtokens();
*/
//console.log("", eval("rangestr('${#aaf})', '{', '}')"));
/**/


//})();
