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



// var jsparser = this.jsparser = function(hj) { // 함수안에 this를 안써도 됨.
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
         this.currindex      = 0;    // 현재위치
         this.comment        = '';
         this.currobjseq      = -1;
         this.tokenseq       = 0;    // 라인별 token 수
         this.tokenarray = [];
         this.tokens = [];            // 라인별로 모든 토큰을 가짐
         this.linenumber = 0;

         //this.Tokens = new Arboreal(0, {}, 'root');
         this.tokenobj = []; //[ {tagname: depth: data:},{} ... {n} ] 배열에 그냥 object를 나열한다.
         this.depth = 0;     // 함수 안의 함수

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
                 case (a >= 'A' && a <= 'Z') || (a >= 'a' && a <= 'z') || a === '_' || a === '@' || a === '-':  // 문자
                     console.log("a=", a);
                     this.addone();
                     break;

                 case code === 59 || code === 0 || code === 10 || code === 13 || code === 0x2028 || code === 0x2029: // 0: eof, 59: ;
                     console.log("a====================%s, code=%d", a, code);
                     //if (code !== 0) {
                        //if (this.eatwhitespace()) break;
                     //}

                     if (this.nexttoken != '') this.tokenarray.push(this.nexttoken);

                     this.inserttoken();                                            // tokens 에 넣는다.
                     this.inittoken();                                              // 모두 초기화
                     
                     this.skiptoken();
                     break;

                 case a === ' ' || a === '=' || a === '(':             // code = 32
                      //console.log("empty or = :", a);
                     if (this.eatwhitespace()) break;

                     this.setuptoken();                                             // 토큰을 가져와 임시 arr에 적재

                     if (this.token == 'function') this.keywords.function = true;
                     if (this.token == 'var') this.keywords.var = true;
                     
                     /*
                     if ((a === '=') && (this.keywords.var)) {                      // 변수의 = 부터 ; 까지 모두 삭제
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
                     if (this.keywords.function) {                                   // 함수  { { {  } } } 부분을 모두 삭제
                        
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
                     this.token = this.nexttoken;       // 첫 공백일때
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
                     
                     this.token = this.nexttoken;       // 첫 공백일때
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
  let istart = this.lines.indexOf('//');
  let iend = this.lines.indexOf('\n');

  return this.lines.substring(istart, iend);
}

// 특정문자 까지 스트링을 먹어 치운다.
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

// 라인에서 'function' 같은 keyword가 있는지 체크 작동하지 않음.
jsparser.prototype.checkkeywordinline = function(keystr, tok){

    var line = tok + this.lines; //토큰이 사라진 상태에서 현재 token를 넣어줌.
    var idx = line.indexOf('\n');   // 리턴 윈로우 \n\r, 도스 \n, 유닉스 \r
    var str = line.substr(0, idx);
    console.log("chkek: [%s]",str);
    if (str.indexOf(keystr) < 0) {
        return true;
    } else { //업으면 -1 리턴
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

// 연속된 공백을 먹어 치운다.
jsparser.prototype.eatwhitespace = function(){
    if (this.nexttoken== '') {       // 첫 공백이후 다시 공백이 들어오면 (연속된 공백은 지워준다.) var  x ;
        this.token = this.prevtoken;
        console.log("white space==>", this.nexttoken);
        this.skiptoken();
        return true;
   }
   return false;
}

// skipstrings 때문에
jsparser.prototype.varrule2 = function(){   //
    if (this.isglobal) {
        if (this.keywords.var) {
            this.currobjseq < 0 ? this.newandupdate('vallist') : this.updatedata(this.tokenobj.length-1, 'vallist', this.token); // currobjseq < 0 : 생성된 오브젝트가 없다.
            this.skipstrings(';');      // = 이후 데이터는 모두 지움.
            this.keywords.var = false;
            this.tokenseq++;
        }
    }
}

// var 처리 룰
jsparser.prototype.varrule = function(b){
    if (this.isglobal) {
        if (this.keywords.var) {
            this.currobjseq < 0 ? this.newandupdate('vallist') : this.updatedata(this.tokenobj.length-1, 'vallist', this.token); // currobjseq < 0 : 생성된 오브젝트가 없다.
            this.keywords.var = b;
            this.tokenseq++;
        }
    }
}

jsparser.prototype.functionrule = function(b, key, token){
    if (this.isglobal) {
        if (this.keywords.function) {
            this.currobjseq < 0 ? this.newandupdate('funlist') : this.updatedata(this.tokenobj.length-1, key, token); // currobjseq < 0 : 생성된 오브젝트가 없다.
            if (key != 'objlist') this.keywords.function = b;
            this.tokenseq++;
        } else {
            this.currobjseq < 0 ? this.newandupdate('objlist') : this.updatedata(this.tokenobj.length-1, key, token); // currobjseq < 0 : 생성된 오브젝트가 없다.
            //if (key != 'objlist') this.keywords.function = b;
            this.tokenseq++;
        }
    }
}

// token 이 keyword에 존재하는지 체크
jsparser.prototype.keywordexist = function (key) {
    //
    const keys = Object.keys(this.keywords)   // 배열로 변경해서 값을 가져오고 값을 변경  다시 배열을 객체로 만들어....
    for (let i = 0; i < keys.length; i++) {
        if (keys[i] == key) {
            return true;
        } else {
            return false;
        }
    }
}

// 자료를 새로 만들고 업데이트한다.
jsparser.prototype.newandupdate = function(key) {
    this.newcollector();
    this.updatedata(this.tokenobj.length-1, 'objid', 0);
    this.updatedata(this.tokenobj.length-1, 'typeid', 0);
    this.updatedata(this.tokenobj.length-1, 'typeof', 'globaljs');
    this.updatedata(this.tokenobj.length-1, key, this.token);
    this.currobjseq++;  //  currobjseq = this.tokenobj.length-1;
}


// 어느 시점에서 생성할까
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

    //console.log("nexttoken= %s, lines= %s, index= %d", this.nexttoken, this.lines, this.currindex);
    //if ((this.tokenseq != 0) && (this.nexttoken.length > 1)) {
    //    this.prevtoken = this.nexttoken + this.lines.charAt(0);
    //}

    this.nexttoken = this.nexttoken + this.lines.charAt(0);   // line 의 한문자를 가져온다.
    this.lines = this.lines.substring(1);                     // line 에서 한문자를 제거
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
