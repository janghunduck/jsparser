(function(){

function makearray(str){
	 var arr = [], items = String(str).split(",");
	 for ( var i = 0; i < items.length; i++ )
		arr[i] = items[i];
	 return arr;
}


function makeobject(str){
    var obj = {}, items = str.split(",");
    for ( var i = 0; i < items.length; i++ )
        obj[ items[i] ] = false;
    return obj;
}

// ���ڿ� s ���� Ư������ c �� �t���� �ִ°�?
function charcount(s, c){
  var count = 0;
  
  for (let i=0; i< s.length;i++){
     //console.log("", s.charAt(i));
     if (s.charAt(i) === c) {
         count = count + 1
     }
  }
  return count;
}

function rangestr(s, c1, c2){

    let str = s.trim();
    let starti = str.indexOf(c1) + 1;
    
    str = str.substring(starti);
    let endi = str.indexOf(c2);

    return str.substr(0, endi);
}


// var jsparser = this.jsparser = function(hj) { // �Լ��ȿ� this�� �Ƚᵵ ��.
var jsparser = function (hj) {

         this.lines          = hj;
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
         //this.lines = " function ab   () {   \n } ";
         //this.lines = " var x=  8 ; var y  ; z = 'sex' ";
         //this.lines = " var x=  8";
         //this.lines = "var obj =new ab()  ;";
         //this.lines = "var emptyobject = { ";
         //this.lines = " function ab   () {    ";    // error ó��
         //this.lines = " var o = {\n name: 'linda', \n sex: 'women', size, \n me: intro(){}, \n getOlder(){}, \n sayhello : function() { \n alert('hi');  }}" ;
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
         this.lines = "exports.add = (a,b) => { return a + b } "
         this.lines = "exports.add = function ab(){} "
         this.lines = "module.exports = { add:add, sub:sub } "
         this.lines = "const {add, sub} = require('./mode.js');"
         //this.lines = "let ab = require('js2flowchart'); ";
         //this.lines = "$('.frame_id, #frame_class').show()";
         //this.lines = "$(window).load( game.run() )";
         //this.lines = "$(document).ready( function (){}) ";
         //this.lines = "$('#img_btn').click( function(){  } )";
         
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
                     console.log("this.nexttoken=", this.nexttoken);  
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

                     if (this.token == 'function') this.keywords.function = true;
                     if (this.token == 'var') this.keywords.var = true;
                     
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
                 case a === '{':                                                       // �Լ� or ��ü�� �ش�
                     console.log("a=", a);
                     var arr = this.lines.match(/\{(.*)\}/s) || null || [];            // arr �� 0, 1 �ΰ��� ����.
                     this.tokenarray.push(arr[0]);                                     // ��� ���λ����� �迭�� ���� �ִ´� ���⼭�� �������� �ʴ´�.
                     this.lines = this.lines.substring ((arr[0] || []).length);
                     
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
                     var arr = this.lines.match(/\[(.*)\]/s);
                     if ((arr[0] || []).length > 0) {
                          this.tokenarray.push(arr[0]);
                          this.lines = this.lines.substring ((arr[0] || []).length);
                     }
                     
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
                    this.currline = '';
                } else {
                    this.backupline = a;
                    this.nextline = this.getnextline();
                    this.currline = this.getcurrline()
                    //console.log("this.nextline===>:", this.nextline);
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
  name: '������',
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
        console.log("(%d)==== %s",i, a[i].trim());
        var item = a[i].trim();
        var arr = item.split(':');
        
        if ((arr[arr.length-1].indexOf('(') > 0) && (arr[arr.length-1].indexOf('{')>0)){
            arr[0] = 'f_' + arr[0];
        }
        if (arr.length == 1) {
            var idx = arr[0].indexOf('(');
            arr[0] = arr[0].substr(0, idx);
        }

        console.log("%d, %s", arr.length, arr[0]);
        tmparr.push(arr[0]);
    }
    
    this.tokens.push(tmparr);
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
    let str = this.backupline.replace(/(\s*)/g, ''); // �������� �����.
    return ((this.recognizecommonfs())
         && (str[0] === '(')
         && (str.indexOf('(function') !== -1)
         );
}

// tp_ifa  : Anonymouse Immediately invoked function
jsparser.prototype.reconizeifa = function (){
    let str = this.backupline.replace(/(\s*)/g, ''); 
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

jsparser.prototype.recognizeallnotfunction = function (){
    return ((!this.reconizegf())
         && (!this.recognizeaf())
         && (!this.reconizetf())
         && (!this.reconizeif())
         && (!this.reconizeifa())
         && (!this.reconizevf())
         && (!this.recognizepf())
           );
}

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
        console.log("tokenarray=========",this.tokenarray.toString());
        let nextc = this.getnextchar(')');
        console.log("nextchar [%s] ", nextc);

        /* ----------------------------------------------------- */
        // tp_gf  : general function  ex: function ab()
        /* ----------------------------------------------------- */
        if (this.reconizegf()) {
            this.tokenarray.unshift('tp_gf');
            
        /* ----------------------------------------------------- */
        // tp_vf  : var function  ex: var ab = function(){}
        /* ----------------------------------------------------- */
        } else if (this.reconizevf()){
            this.tokenarray.unshift('tp_vf');                    
            
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
        // tp_tf  : traditional arrow function
        /* ----------------------------------------------------- */
        } else if (this.reconizetf()) {
                   this.tokenarray.unshift('tp_tf');

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
                   console.log("Type is not supported.");
        }
        
        
        this.tokenarray.unshift(this.linenumber);              // line number

        this.tokens.push(this.tokenarray);
        console.log("(%d) =====> [%s]", this.linenumber, this.tokenarray.toString());
    } else {
        console.log("This is Empty array, so not inserted.");
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
                     let idx = this.lines.indexOf(')') + 1;
                     let str = this.lines.substr(0, idx);

                     // str ���� ' ' or " " �� �ִ��� Ȯ�� => ó�� ���ö� " �� ' �� replace �ȴ�.
                     let charcnt = charcount(str,"'");
                     if (charcnt === 2) {
                         str = rangestr(str, "'","'");      // ' ' �κ��� �����´�. "" �� �ɼ��� �ִ�.

                         let arr = str.split(',');
                         //console.log("$===============>%d, %s", charcnt, arr[0]);
                         let typename = '';
                         let name = '';

                         for(let i=0; i<arr.length; i++){
                             let s = arr[i].trim();
                             let c = s.charAt(0);

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

    if ((this.token === 'for') || (this.token === 'if')){
        let str =this.zerotostrings(')');
        this.tokenarray.push(str);
        this.lines = this.lines.substring(str.length-1);
    } else if (this.token === 'require') {
        let idx = this.lines.indexOf(')');
        let str = this.lines.substr(0, idx);
        str = rangestr(str, "'", "'");
        this.tokenarray.push(str);
        this.lines = this.lines.substring(idx);
    }
    
    
    console.log("line==>[%s]", this.lines);
    console.log("-------token: %s", this.token);
}

// 0 ~ char ���ڱ��� �߶� ���ڿ��� ����
jsparser.prototype.zerotostrings = function(char){
    let idx = this.lines.indexOf(char) + 1;
    return this.lines.substr(0, idx);
    
}

jsparser.prototype.inittoken = function() {
    this.tokenseq = 0;
    this.prevtoken = '';
    this.tokenarray = [];
    this.initkeywords();  // keywords setting is all false.
}


jsparser.prototype.initkeywords = function(){

    const items = Object.keys(this.keywords);
    for (let i = 0; i < items.length; i++) {
        items[i] = false;
        
    }
}

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
  let istart = this.lines.indexOf('//');
  let iend = this.lines.indexOf('\n');

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


jsparser.prototype.getcurrline = function(){
     var idx = this.lines.indexOf('\n');
     return this.lines.substr(0, idx);
}

jsparser.prototype.getnextline = function(){
    let idx1 = this.lines.indexOf('\n') + 1;
    let str = this.lines.substr(idx1, this.lines.length - idx1);
    
    let idx2 = str.indexOf('\n') + 1;
    let str2 = str.substr(0, idx2);
    
    return str2;
}

jsparser.prototype.getcurrline = function(){
    let idx1 = this.lines.indexOf('\n') + 1;
    let str = this.lines.substr(idx1, this.lines.length - idx1);
    return str;
}

// char ���� ���ڸ� �����´�.
jsparser.prototype.getnextchar = function (char) {
    let str1 = this.backupline.replace(/(\s*)/g, ''); // �������� �����.
    let idx1 = str1.indexOf(char);
    if (idx1 > -1) {
        return str1.charAt(idx1+1);
    } else if (str1.length = idx1){  // idx�� ������ �������̸� ���� ������ ù ���ڸ� �����´�.
       let str2 = this.nextline.replace(/(\s*)/g, ''); // �������� �����.
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
    console.log("chkek: [%s]",str);
    if (str.indexOf(keystr) < 0) {
        return true;
    } else { //������ -1 ����
        return false;
    }

}

jsparser.prototype.checkkeyword = function(){

    const keys = Object.keys(this.keywords);
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const value = this.keywords[key];
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
        console.log("white space==>", this.nexttoken);
        this.skiptoken();
        return true;
   }
   return false;
}

// skipstrings ������
jsparser.prototype.varrule2 = function(){   //
    if (this.isglobal) {
        if (this.keywords.var) {
            this.currobjseq < 0 ? this.newandupdate('vallist') : this.updatedata(this.tokenobj.length-1, 'vallist', this.token); // currobjseq < 0 : ������ ������Ʈ�� ����.
            this.skipstrings(';');      // = ���� �����ʹ� ��� ����.
            this.keywords.var = false;
            this.tokenseq++;
        }
    }
}

// var ó�� ��
jsparser.prototype.varrule = function(b){
    if (this.isglobal) {
        if (this.keywords.var) {
            this.currobjseq < 0 ? this.newandupdate('vallist') : this.updatedata(this.tokenobj.length-1, 'vallist', this.token); // currobjseq < 0 : ������ ������Ʈ�� ����.
            this.keywords.var = b;
            this.tokenseq++;
        }
    }
}

jsparser.prototype.functionrule = function(b, key, token){
    if (this.isglobal) {
        if (this.keywords.function) {
            this.currobjseq < 0 ? this.newandupdate('funlist') : this.updatedata(this.tokenobj.length-1, key, token); // currobjseq < 0 : ������ ������Ʈ�� ����.
            if (key != 'objlist') this.keywords.function = b;
            this.tokenseq++;
        } else {
            this.currobjseq < 0 ? this.newandupdate('objlist') : this.updatedata(this.tokenobj.length-1, key, token); // currobjseq < 0 : ������ ������Ʈ�� ����.
            //if (key != 'objlist') this.keywords.function = b;
            this.tokenseq++;
        }
    }
}

// token �� keyword�� �����ϴ��� üũ
jsparser.prototype.keywordexist = function (key) {
    //
    const keys = Object.keys(this.keywords)   // �迭�� �����ؼ� ���� �������� ���� ����  �ٽ� �迭�� ��ü�� �����....
    for (let i = 0; i < keys.length; i++) {
        if (keys[i] == key) {
            return true;
        } else {
            return false;
        }
    }
}

// �ڷḦ ���� ����� ������Ʈ�Ѵ�.
jsparser.prototype.newandupdate = function(key) {
    this.newcollector();
    this.updatedata(this.tokenobj.length-1, 'objid', 0);
    this.updatedata(this.tokenobj.length-1, 'typeid', 0);
    this.updatedata(this.tokenobj.length-1, 'typeof', 'globaljs');
    this.updatedata(this.tokenobj.length-1, key, this.token);
    this.currobjseq++;  //  currobjseq = this.tokenobj.length-1;
}


// ��� �������� �����ұ�
jsparser.prototype.newcollector = function () {
    var node = new Object();
    node.objid = -1;        // sequence
    node.typeid = -1;       // 0: globla1js, 1: globalhtml,  2:function, 3:functionobj, 4:varobj, 5:class
    node.typeof = '';       // globaljs
    //node.filename = '';
    node.vallist = [];      // var list
    node.funlist = [];      // function list
    node.objlist = [];      // var obj = new ab();
    node.comment = [];      // ['token: this is comment', ... ]
    node.usefile = [];      // ['f.js', ...]
    node.useconnet = function () { // ['x -> testfunc()', .... ]
        return [];
    }

    node.bootobj    = function () {
            };
    node.bootfun    = function () {};
    this.tokenobj.push(node);

    return node;
}



jsparser.prototype.updatedata = function (index, key, data) {
         node = this.tokenobj[index];
         if ((key == 'vallist') || (key == 'funlist') || (key == 'objlist')) {
             //console.log("key========>>>>", key);
             node[key].push(data);
         } else {
             node[key] = data;
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
        console.log("lines length =", this.lines.length);

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

jsparser.prototype.tostringtokens_ = function () {

        var n = {};
        var str = '';
	for ( var i = 0; i < this.tokenobj.length; i++ ){
           n = this.tokenobj[i];
           str = str + n.objid + ' | ' + n.typeid  + ' | ' + n.typeof + ' | ';
           str = str + n.vallist.toString() + ' | ';
           str = str + n.funlist.toString() + ' | ';
           str = str + n.objlist.toString() + ' | ';
           str = str  + '\n';

           console.log("=>", this.tokenobj[i]);
	};


        return str;
}


jsparser.prototype.tostringtokens = function () {
        var n = [];
        console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
	for ( var i = 0; i < this.tokens.length; i++ ){
           n = this.tokens[i];
           console.log("result: [%s]", n.toString());
	};
        
}

var testjs1 =
             "var x; \n" +
             "function ab () {   \n"+
	     "     alert('ab') \n"+
             "}  \n"+
             '';


//var pj = new jsparser("var x; var y; var z= 100000;");
//var pj = new jsparser("var x=9 ;var y; var a,b;");
var pj = new jsparser("ab = function() {  \n   alert('ab') }");
//var pj = new jsparser(" function ab () {   \n } ");
//var pj = new jsparser(testjs1);
//var pj = new jsparser("var obj= new ab  (); ");
pj.parserjs();
pj.tostringtokens();



})();
