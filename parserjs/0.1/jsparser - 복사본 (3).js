(function(){




//var mp = new MatchParser('<title>FCKeditor - Sample</title> <script type="text/javascript" src="p1.js"></script>');
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



// var jsparser = this.jsparser = function(hj) { // �Լ��ȿ� this�� �Ƚᵵ ��.
var jsparser = function (hj) {

         this.orglines       = '';    // source
         this.lines          = hj;
         this.currline       = '';
         this.ftype          = [];   // file=js, html
         this.token          = '';   // html, head
         this.prevtoken      - '';
         this.nexttoken      = '';   // temp token
         this.nntoken = '';
         this.prevchar       = '';
         this.nextchar       = '';
         this.currindex      = 0;    // ������ġ
         this.comment        = '';
         this.currobjseq      = -1;
         this.tokenseq       = 0;    // ���κ� token ��
         this.tokenarray = [];
         this.tokens = [];            // ���κ��� ��� ��ū�� ����
         this.linenumber = 0;

         //this.Tokens = new Arboreal(0, {}, 'root');
         this.tokenobj = []; //[ {tagname: depth: data:},{} ... {n} ] �迭�� �׳� object�� �����Ѵ�.
         this.depth = 0;     // �Լ� ���� �Լ�

         this.isglobal = true;

         this.keywords = makeobject("var,let,const,function,new");


         //this.lines = "ab    =   function  () {  \n  alert('ab')  {         {}        } } ";
         //this.lines = " function ab   () {   \n } ";
         //this.lines = " var x=  8 ; var y  ; z = 'sex' ";
        // this.lines = "var obj =new ab()  ;";
         
         this.getnexttoken = function () {

             //eatwhitespace();

             var a = this.lines.charAt(0);
             var code = this.lines.charCodeAt(0);
             this.prevchar = a;
             this.nextchar = this.lines.charAt(1);



             //console.log("%s, %d", a, b);
             switch (true) {

                 case a === "'":
                     this.addone();
                     break;
                 /*case a === '"':
                     this.addone();
                     break;
                     */
                 case (a >= 'A' && a <= 'Z') || (a >= 'a' && a <= 'z') || a === '_' || a === '@' || a === '-':  // ����
                     console.log("a=", a);
                     this.addone();
                     break;

                 case code === 59 || code === 0 || code === 10 || code === 13 || code === 0x2028 || code === 0x2029: // 0: eof, 59: ;
                     console.log("a====================%s, code=%d", a, code);
                     //if (code !== 0) {
                        //if (this.eatwhitespace()) break;
                     //}

                     if (this.nexttoken != '') this.tokenarray.push(this.nexttoken);

                     this.inserttoken();                                            // tokens �� �ִ´�.
                     this.inittoken();                                              // ��� �ʱ�ȭ
                     
                     this.skiptoken();
                     break;

                 case a === ' ' || a === '=' || a === '(':             // code = 32
                      //console.log("empty or = :", a);
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
                 case a === ')':
                     console.log("a=", a);
                     this.skiptoken();
                     break;
                 case a === '{':
                     console.log("a=", a);
                     if (this.keywords.function) {                                   // �Լ�  { { {  } } } �κ��� ��� ����
                        
                        var arr = this.lines.match(/\{(.*)\}/s);
                        this.lines = this.lines.substring (arr[0].length);
                        console.log("aa=", this.lines);
                     }
                     this.skiptoken(); 
                     break;
                 case (a >= '0' && a <= '9') || a === '+':
                     this.addone();
                     break;
                 case a === '}':
                     this.skiptoken();
                     break;
                 case a === '#':
                 case a === '$':
                 case a === ':':

                     this.addone();
                     break;

                 case a === '<':


                 case a === '>':


                     break;
                 case a === '/':

                     break;
                 /*
                 case a === ';':
                     if (this.eatwhitespace()) break;
                     this.token = this.nexttoken;

                     this.tokenseq = 0;
                     this.prevtoken = '';
                     this.skiptoken();
                     break;
                 */
                     /*
                 case a === '(' || a === ')':                                              // || a === '[' || a === ']' || a === ',' || a === '.' || a === '^' || a === '*':
                     if (this.eatwhitespace()) break;
                     this.token = this.nexttoken;
                     this.nntoken = this.getnnttoken(this.lines);
                     this.tokenarray.push(this.token);
                     this.prevtoken = this.tokenarray[this.tokenarray.length-2];
                     console.log("token : [%s], prevtoken: [%s], nntoken: [%s] ==> ", this.token, this.prevtoken, this.nntoken);


                     console.log("parameter start  skip");
                     this.tokenseq++;
                     this.skiptoken();
                     break;
                  */
                 /*
                 case a === '=':
                     if (this.eatwhitespace()) break;
                     this.token = this.nexttoken;       // ù �����϶�
                     this.tokenarray.push(this.token);
                     this.prevtoken = this.tokenarray[this.tokenarray.length-2];
                     this.nntoken = this.getnnttoken(this.lines);
                     console.log("(=)token : [%s], prevtoken: [%s], nntoken: [%s] ==> ", this.token, this.prevtoken, this.nntoken);

                     this.skiptoken()
                     this.tokenseq++;
                     break;
                */
                 default:  break;
             }


             return true;
         };



}

jsparser.prototype.inserttoken = function() {
                      
                     if (this.tokenarray.length != 0) {
                       this.tokenarray.unshift(++this.linenumber);
                       this.tokens.push(this.tokenarray);
                       console.log("(%d) =====> [%s]", this.linenumber, this.tokenarray.toString());
                     } else {
                       console.log("This is Empty array, so not inserted.");
                     }
}

jsparser.prototype.setuptoken = function() {
                     
                     this.token = this.nexttoken;       // ù �����϶�
                     this.tokenarray.push(this.token);
                     this.prevtoken = this.tokenarray[this.tokenarray.length-2];
                     this.nntoken = this.getnnttoken(this.lines);

                     //console.log("line==>[%s]", this.lines);
                     console.log("token: %s", this.token);

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
jsparser.prototype.skipstrings = function (laststr) {

    var index = this.lines.indexOf(laststr);
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
