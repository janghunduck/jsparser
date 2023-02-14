(function(){




//var mp = new MatchParser('<title>FCKeditor - Sample</title> <script type="text/javascript" src="p1.js"></script>');
function makearray(str){
	 var arr = [], items = String(str).split(",");
	 for ( var i = 0; i < items.length; i++ )
		arr[i] = items[i];
	 return arr;
}



//html ������ ��Ȯ�ؾ� ������, �� ���� ��Ȯ�� �������� üũ�� �Ǿ�� �Ѵ�.

var Parhtml = function (hj) {
         
         this.orglines       = '';    // source
         this.lines          = hj;
         this.ftype          = [];   // file=js, html
         this.token          = '';   // html, head
         this.nexttoken      = '';   // temp token
         this.currindex      = 0;    // ������ġ
         this.comment        = '';

         this.tokenobj = []; //[ {tagname: depth: data:},{} ... {n} ] �迭�� �׳� object�� �����Ѵ�.
         this.depth = 0;
         this.tagdata = '';
         
         this.fixedtags = makearray("html,head,title,body,table,tr,td,div,meta,link,script");
         this.closetags = makearray("meta,link");  // <  /> ���۰� �Բ� ����
         var depthend = false;
         var bcontinue = false;
         var btag     = false;  // < => true,  > => false
        /**
         ex : <html><head></head><body>abcd</body></html>
         token : function, procedure, �����ڵ�  = tagName ( html, head, body etc )
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

             switch (true) {
                 //case a === '#0':                         //EOF \n
                 case a === "'":  // �Ʒ� �ּ�ġ�� �� " �� ' �� �ڵ��� ����. ���Ŀ� �ּ��� Ǯ�� (���߻� ���̶���Ʈ�� ���� �ʾ� �ּ�ó���� ���� ���� )
                     this.addone();
                     break;
                 /*case a === '"':
                     this.addone();
                     break;
                     */
                 case a === '\n':
                 case a === ' ':   // ����ó��
                     
                     //console.log("========>", this.fixedtags, this.nexttoken);

                     if (btag) {
                         console.log("========>", this.fixedtags, this.nexttoken);
                         if (this.checkfixedtag(this.nexttoken)){
                             var index = this.findtoken(this.lines, '>');
                             if (index > 0) {
                                this.tagdata = this.lines.substring(0, index);
                                this.lines = this.lines.substring(index);
                                
                                
                                if (this.checkclosetag(this.nexttoken)) {     // <link  ..../> ���� ó��
                                     this.depth--;
                                } 
                                
                                console.log("tagdata:[%s]   lines:[%s]", this.tagdata, this.lines);
                             } else {
                                this.addone();
                             }
                         } else {
                             this.addone();
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
                     console.log("number part = [%s]",a);
                     this.addone();
                     break;
                 case a === '<':
                     
                     if ((this.nexttoken !== '') && (this.depth > 0)) {           //!depthend ) {
                        console.log("updatetoken :  ", this.nexttoken);
                        this.updatetoken(this.tokenobj.length-1, 'data');                             // data update */
                     }
                     this.skiptoken();
                     
                     if((depthend) && (this.lines.charAt(0) !== '/')) {
                        bcontinue = true;                                                             // �߰� ���� ��尡 �����ϴ� �� �n,
                     }
                     btag = true;
                     break;
                 case a === '>':
                     
                     if (depthend && !bcontinue) { this.skiptoken(); break; };                        // depth �� �������̸� ���� depth === 0 ���

                     this.token = this.nexttoken;
                     this.inserttoken();                                                              // token ����, token ���� ��� �����ȴ�.
                     if (this.tagdata !== '') this.updatetagdata(this.tokenobj.length-1, 'tagdata');  // tagdata update
  
                     if (this.nexttoken === 'script'){
                         var index = this.lines.indexOf('</script>');
                         var scriptdata = this.lines.substring(1, index);
                         this.lines = this.lines.substring(index);
                         this.updatetokendata(this.tokenobj.length-1, 'data', scriptdata);            // script data update
                         console.log("nexttoken : [%s] [%s] [%d]",  this.nexttoken, this.lines, index);
                     }
                     
                     this.addone();
                     this.emptytoken();
                     this.depth++
                     bcontinue = false;
                     btag = false;
                     //console.log("nexttoken : [%s] [%s]",  this.nexttoken, this.lines);
                     break;
                 case a === '/':        // '/' �� depth �� �Ǵ��ϴ� ����
                     this.skiptoken();
                     depthend !== 0 ? depthend = true : depthend = false;
                     this.depth--;
                     //console.log("depth [/] %d", this.depth);
                     //bcontinue = false;
                     break;
                 case a === '(' || a === ')' || a === '[' || a === ']' || a === ';' || a === ',' || a === '.' || a === '^' || a === '*' || a === '=':

                 case (a >= 'A' && a <= 'Z') || (a >= 'a' && a <= 'z') || a === '_' || a === '@' || a === '-':  // ����
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
             if (str[i] === char) {
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

Parhtml.prototype.addone = function() {  // parserunit

        //console.log("nexttoken= %s, lines= %s, index= %d", this.nexttoken, this.lines, this.currindex);
         
        this.nexttoken = this.nexttoken + this.lines.charAt(0);   // line �� �ѹ��ڸ� �����´�.
        this.lines = this.lines.substring(1);                     // line ���� �ѹ��ڸ� ����
        
        this.currindex++;
}

Parhtml.prototype.emptytoken = function(){
        this.token = '';
        this.nexttoken = '';
}

Parhtml.prototype.parserunit = function() {  // parserunit
        var i = 0;
        console.log("lines=",this.lines);
        console.log("lines length =", this.lines.length);

        while (this.lines) {
           this.getnexttoken();
           if (this.lines.length === 0)  break;
           
           //if (i == 101) break;
           i++;
        }
}

// getnexttoken �Լ� �ȿ��� ������� ���� �ۿ��� ����Ѵ�.
Parhtml.prototype.deleteallcomment = function(str) {
    var purestr ='';
    var i = 0;
    
    while( str ) {
        var istart = str.indexOf('<!--');
        if (istart < 0) {
            purestr = purestr + str;
            break;
        }
        purestr = purestr + str.substr(0, istart);   // 0 ���� <-- �ְ�
        str = str.substring(istart);          // 0 ���� <-- ����


        var iend = str.indexOf('-->');        //
        str = str.substring(iend+3);
    }
    
    return purestr;

}


Parhtml.prototype.tostringtokens = function () {

        var n = {};
        var str = '';
	for ( var i = 0; i < this.tokenobj.length; i++ ){
           n = this.tokenobj[i];
           if (n.data == undefined) n.data = '';
           str = str + n.depth + ' | ' + n.tagname + ' | ' + n.data + '\n';

           console.log("=>", this.tokenobj[i]);
	};

	if (this.depth == 0) {
           console.log("Succes depth: %d", this.depth);
	} else {
           console.log("Error depth: %d", this.depth);
	}

        return str;
}


function rangestr(s, c1, c2){

    let str = s.trim();
    let starti = str.indexOf(c1) + 1;

    str = str.substring(starti);
    let endi = str.indexOf(c2);

    return str.substr(0, endi);
}

function getFileAbsolutePath(){
    let currfile = window.location.pathname;
    
    let idx = currfile.lastIndexOf('/');
    return currfile.substr(0, idx);
}

// �ݺ��Ǵ� ���ڿ��� �s������ ī���� �Ѵ�.   ('../../aaa', '..') �� 2���̴�.
function countRepeatStr(str, target) {
    let pos = 0;
    let i = 0;
    
    while(true) {
        let foundPos = str.indexOf(target, pos);
        if(foundPos == -1) break;
        pos = foundPos + 1;	// as�� ã�� �Ǹ�, ���� ��ġ���� �ٽ� ã���ϴ�.
        
        i++;
    }

    return i;
}

// �������� delmiter�� �ش�Ǵ� ���� ����������.
function delRepeatLastStr(str, delimiter, count) {  // ('x@y@z', '@', 2 )  ���� x �� ���´�.
    let i = 0;
    for (let i=0; i < count; i++){
        let foundPos = str.lastIndexOf(delimiter);
        str = str.substr(0, foundPos);
        
    }
    return str;
}


// <script type='text/javascript' src='../../fckeditor.js'></script> ���� ���� ���丮�� /D:/fckeditor.js ������ �����Ѵ�.
Parhtml.prototype.tostringtagdata = function () {

	for ( var i = 0; i < this.tokenobj.length; i++ ){
           let node = this.tokenobj[i];
           if (node.tagname === 'script'){
              let idx = node.tagdata.indexOf('src');
              if (idx !== -1){
                  let str = node.tagdata.substr(idx, node.tagdata.length - idx);
                  str = rangestr (str, "'", "'");                                // ../../aaa.js, ./ab.js
                  let ddotcnt = countRepeatStr(str, '..');
                  let currdir = getFileAbsolutePath();                           // ddotcnt ��ŭ ������ �ö󰣴�. /D:/flowjs/Html/
                  currdir = delRepeatLastStr(currdir, '/', 2);
                  
                  let idx2 = str.lastIndexOf('/');
                  str = str.substr(idx2, str.length - idx2);
                  
                  console.log("tagdata = [%s]", currdir + str);  // flowchart�� �佺 �ϰ� flowchar���� �ٽ� �ҽ��� jsparser�� �ѱ�
              } else {
                  console.log("data = [%s]", node.data);  // jsparser�� ��
              }
           }

        }
}




        var sss=
             '<html>' +
             //'   <script type='text/javascript' src='../../fckeditor.js'></script>'+
             '<body>'+
	     '<script>'+
             '   <!--function-->'+
	     '</script>'+
             '</body> '+
             '</html>';

             

//var PP = new Parhtml("<html xmlns='http://www.w3.org/1999/xhtml'><head><title>abcd -efg</title></head><body><table></table></body></html>");
//var PP = new Parhtml("<html><head></head><body  topmargin='0'></body></html>");
//var PP = new Parhtml("<html><head></head><body  topmargin='0'><table><tr></tr></table></body></html>");
//var PP = new Parhtml("<html><head></head><body  topmargin='0'><table class='jang' id='xfaa'><tr id='dija'><td size='877'></td></tr></table></body></html>");
//var PP = new Parhtml("<html><head><meta http-equiv='Content-Type' content='text/html; charset=utf-8'/></head><body><table></table></body></html>");
//var PP = new Parhtml("<html><head><link href='../sample.css' rel='stylesheet' type='text/css' /></head><body></body></html>");
//var PP = new Parhtml("<html><head><script type='text/javascript' src='../../fckconfig.js'>aaaaaaffff</script></head><body></body></html>");

// <!DOCTYPE html><html></html> ó�� ==> ó���� comment�� ���� ��������

var PP = new Parhtml("<html xmlns='http://www.w3.org/1999/xhtml'><head><title>abcd -efg</title><script type='text/javascript' src='../../fckeditor.js'></script><script type='text/javascript' src='../../fckconfig.js'>aaaaaaffff</script></head><body><script type='text/javascript'>var oFCKeditor = '<a href='http://www.fckeditor.net/'>FCKeditor<\/a>'</script></body></html>");

PP.parserunit();

console.log("=>", '\n' + PP.tostringtokens());
console.log(">", '\n' + PP.tostringtagdata());

console.log("sss=>[%s]",PP.deleteallcomment(sss));
//var c = P.pickchar(P.lines, 0);

//console.log("[%s]", c);
console.log("===>", eval("getFileAbsolutePath()"));
console.log("===>%d", countRepeatStr('../../aaa.js', '..'));





function makeobject(str){
    var obj = {}, items = str.split(",");
    for ( var i = 0; i < items.length; i++ )
        obj[ items[i] ] = false;
    return obj;
}



// var Parjs = this.Parjs = function(hj) { // �Լ��ȿ� this�� �Ƚᵵ ��.
var Parjs = function (hj) {

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
         
         //this.Tokens = new Arboreal(0, {}, 'root');
         this.tokenobj = []; //[ {tagname: depth: data:},{} ... {n} ] �迭�� �׳� object�� �����Ѵ�.
         this.depth = 0;     // �Լ� ���� �Լ�

         this.isglobal = true;

         this.keywords = makeobject("var,let,const,function,new");
         

         this.getnexttoken = function () {

             //eatwhitespace();
             
             var a = this.lines.charAt(0);
             var code = this.lines.charCodeAt(0);
             this.prevchar = a;
             this.nextchar = this.lines.charAt(1);

             
             
             //console.log("%s, %d", a, b);
             switch (true) {
                 case code === 0:   // EOF (end of file)  ?
                     alert('eof');           
                     break;
                 case a === "'":
                     this.addone();
                     break;
                 /*case a === '"':
                     this.addone();
                     break;
                     */
                 //case a === '\n':
                 case code === 10 || code === 13 || code === 0x2028 || code === 0x2029:
                     this.tokenseq = 0;
                     this.prevtoken = '';
                     this.tokenarray = [];
                     this.skiptoken();
                     break;
                 //case b == 32:
                 //    console.log("empty 32",);
                 //    break;
                 
                 case a === ' ':
                     if (this.eatwhitespace()) break;   // ù �������� �ٽ� ������ ������ (���ӵ� ������ �����ش�.) var  x ;
                     this.token = this.nexttoken;       // ù �����϶�
                     this.tokenarray.push(this.token);
                     this.prevtoken = this.tokenarray[this.tokenarray.length-2];
                     this.nntoken = this.getnnttoken(this.lines);
                     
                     
                     console.log("line==>[%s]", this.lines);
                     //console.log("keywords", this.keywords);

                     // =========================== var obj = new ab() =============================
                     console.log("token : [%s], prevtoken: [%s], nntoken: [%s] ==> ", this.token, this.prevtoken, this.nntoken);
                    
                     if (this.nntoken == 'new') {
                           this.functionrule(true, 'objlist', this.token);
                     }
                     // ======================== ab = function() , function ab () {   \n } ==========================
                     
                     if ((this.token != 'function') && (this.token != 'var')
                                                    && (this.token != 'new')
                                                    && (this.nntoken != 'new')
                                                    && (this.token != this.prevtoken)
                                                    && (this.prevtoken != 'undefined')){
                           if (this.prevtoken == 'new') {
                               this.token = this.tokenarray[this.tokenarray.length-3] + ':' + this.token;
                               this.keywords.function = true;
                               this.functionrule(true, 'funlist', this.token);
                           } else {
                               this.keywords.function = true;
                               this.functionrule(true, 'funlist', this.token);
                           }
                     }

                     // =========================== var a = 9;=============================
                     //if (!this.checkkeywordinline('var', this.token)) {
                     if ((this.token != 'function') && (this.token != 'var')
                                                    && (this.token != 'new')
                                                    && (this.nntoken != 'new')
                                                    && (this.token != this.prevtoken)
                                                    && (this.prevtoken != 'undefined')){
                          this.varrule(false);                                           // token�� keywords�� �����ϴ��� üũ  keyword�� �ڷῡ �������� �ʴ´�.
                     }                                                                  //    (var x����;)  (var x����= 9;) �� ��° ������ ���� ��� �̰��� true �̴�. �Լ����ο��� keywords�� üũ�ϱ� ������ üũ�� ���� �� �ʿ����

                     if (this.token == 'var') { this.keywords.var = true; } else {  this.keywords.var = false; }
                     if (this.token == 'function') { this.keywords.function = true; } else {  this.keywords.function = false; }
                     this.tokenseq++;
                     this.skiptoken();
                     break;
                     
                 case a === ';':
                     if (this.eatwhitespace()) break;
                     this.token = this.nexttoken;
                     if (!this.keywordexist(this.token)) { this.varrule(false); }                                       // var x;
                     //console.log("data token ==>", this.nexttoken);
                     //this.keywords.function = false;
                     this.tokenseq = 0;
                     this.prevtoken = '';
                     this.skiptoken();
                     break;

                 case a === ',':                     
                     this.token = this.nexttoken;
                     this.varrule(true);                                                                                // var z, m;   // this.keywords.var �� ���� true �����Ѵ�.
                     this.tokenseq++;
                     this.skiptoken();
                     break;

                 case a === '=':
                     if (this.eatwhitespace()) break;
                     this.token = this.nexttoken;       // ù �����϶�
                     this.tokenarray.push(this.token);
                     this.prevtoken = this.tokenarray[this.tokenarray.length-2];
                     this.nntoken = this.getnnttoken(this.lines);
                     console.log("(=)token : [%s], prevtoken: [%s], nntoken: [%s] ==> ", this.token, this.prevtoken, this.nntoken);
                     // =========================== var obj = new ab() =============================
                     if (this.nntoken == 'new') {
                           this.functionrule(true, 'objlist', this.token);
                     }

                     // =========================== var a = 9;=============================
                     //if (!this.keywordexist(this.token)) { if (this.keywords.var) { this.varrule2() } }                 // var   x=9;  = ���� skipstrings ����
                     // =========================== var a = 9;=============================
                     if ((this.token != 'function') && (this.token != 'var')
                                                    && (this.token != 'new')
                                                    && (this.nntoken != 'new')
                                                    && (this.token != this.prevtoken)
                                                    && (this.prevtoken != 'undefined')
                                                    && (this.keywords.var)){
                          this.varrule2();                                           // token�� keywords�� �����ϴ��� üũ  keyword�� �ڷῡ �������� �ʴ´�.
                     }
                     //if (this.keywords.function) {
                     //   console.log("this.lines==>[%s]", this.lines);
                     //   this.skiptoken()
                     //}
                     this.skiptoken()
                     this.tokenseq++;
                     break;
                 case a === '{':
                     // function ab(){  // '{' ���� ó��
                     if (this.keywords.function) this.skiptoken(); // �Լ� ���� ����, �Լ� �ȿ����� {} �� ���� �̾� �ʿ��� ������ �̴´�.
                     break;
                 case a === '#':
                 case a === '$':
                 case a === ':':
                     
                     this.addone();
                     break;
                 case (a >= '0' && a <= '9') || a === '+':
                     
                     //this.addone();
                     break;
                 case a === '<':


                 case a === '>':


                     break;
                 case a === '/':       

                     break;
                 case a === '(' || a === ')':                                              // || a === '[' || a === ']' || a === ',' || a === '.' || a === '^' || a === '*':
                     if (this.eatwhitespace()) break;
                     this.token = this.nexttoken;
                     this.nntoken = this.getnnttoken(this.lines);
                     this.tokenarray.push(this.token);
                     this.prevtoken = this.tokenarray[this.tokenarray.length-2];
                     console.log("token : [%s], prevtoken: [%s], nntoken: [%s] ==> ", this.token, this.prevtoken, this.nntoken);
 
                     
                     // ======================== ab = function() , function ab () {   \n } ==========================
                     
                     if ((this.token != 'function') && (this.token != 'var')
                                                    && (this.token != 'new')
                                                    && (this.token != this.prevtoken)
                                                    && (this.prevtoken != 'undefined')){
                           if (this.prevtoken == 'new') {
                               this.token = this.tokenarray[this.tokenarray.length-3]  + ':' +  this.token;
                               this.keywords.function = true;
                               this.functionrule(true, 'funlist', this.token);
                           } else {
                               this.keywords.function = true;
                               this.functionrule(true, 'funlist', this.token);
                           }
                           
                     }
                     
                     console.log("parameter start  skip");
                     this.tokenseq++;
                     this.skiptoken();
                     break;
                 case (a >= 'A' && a <= 'Z') || (a >= 'a' && a <= 'z') || a === '_' || a === '@' || a === '-':  // ����
                     //console.log("a=", a);
                     this.addone();
                     break;

                 default:  break;
             }


             return true;
         };


         // �ּ�ó��
         function eatwhitespace() {
             var incomment, countinuelastcomment,state;  // boolean

             function eatone(){
                 if (incomment) comment = comment + lines;

             }
         };

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


Parjs.prototype.skipLineComment = function() {
  //var line = substrnewline(this.lines);
  let istart = this.lines.indexOf('//');
  let iend = this.lines.indexOf('\n');
  
  return this.lines.substring(istart, iend);
}

// Ư������ ���� ��Ʈ���� �Ծ� ġ���.
Parjs.prototype.skipstrings = function (laststr) {
    var index = this.lines.indexOf(laststr);
    this.lines = this.lines.substring(index);
}


Parjs.prototype.getnnttoken = function(input) {
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


Parjs.prototype.getcurrline = function(){
     var idx = this.lines.indexOf('\n');
     return this.lines.substr(0, idx);
}

// ���ο��� 'function' ���� keyword�� �ִ��� üũ �۵����� ����.
Parjs.prototype.checkkeywordinline = function(keystr, tok){

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

Parjs.prototype.checkkeyword = function(){

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
Parjs.prototype.eatwhitespace = function(){
    if (this.nexttoken== '') {       // ù �������� �ٽ� ������ ������ (���ӵ� ������ �����ش�.) var  x ;
        this.token = this.prevtoken;
        //console.log("white space==>", this.nexttoken);
        this.skiptoken();
        return true;
   }
   return false;
}

// skipstrings ������
Parjs.prototype.varrule2 = function(){   //
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
Parjs.prototype.varrule = function(b){
    if (this.isglobal) {
        if (this.keywords.var) {
            this.currobjseq < 0 ? this.newandupdate('vallist') : this.updatedata(this.tokenobj.length-1, 'vallist', this.token); // currobjseq < 0 : ������ ������Ʈ�� ����.
            this.keywords.var = b;
            this.tokenseq++;
        }
    }
}

Parjs.prototype.functionrule = function(b, key, token){
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
Parjs.prototype.keywordexist = function (key) {
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
Parjs.prototype.newandupdate = function(key) {
    this.newcollector();
    this.updatedata(this.tokenobj.length-1, 'objid', 0);
    this.updatedata(this.tokenobj.length-1, 'typeid', 0);
    this.updatedata(this.tokenobj.length-1, 'typeof', 'globaljs');
    this.updatedata(this.tokenobj.length-1, key, this.token);
    this.currobjseq++;  //  currobjseq = this.tokenobj.length-1;
}

// Ư������ ���� ��Ʈ���� �Ծ� ġ���.
Parjs.prototype.skipstrings = function (laststr) {
    var index = this.lines.indexOf(laststr);
    this.lines = this.lines.substring(index);
}

// ��� �������� �����ұ�
Parjs.prototype.newcollector = function () {
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



Parjs.prototype.updatedata = function (index, key, data) {
         node = this.tokenobj[index];
         if ((key == 'vallist') || (key == 'funlist') || (key == 'objlist')) {
             //console.log("key========>>>>", key);
             node[key].push(data);
         } else {
             node[key] = data;
         }
}

Parjs.prototype.getcollector = function (typeid) {
    if (this.tokenobj.length >= 0) {
        //
        // loop�� ���� typeid�� �´� node�� return �Ѵ�.
    }
}

Parjs.prototype.setcollector = function (typeid, data) {
    if (this.tokenobj.length >= 0) {
        //
        
    }
}

Parjs.prototype.skiptoken = function() {

    this.addone();
    this.emptytoken();
}

Parjs.prototype.addone = function() {  // parserunit

    //console.log("nexttoken= %s, lines= %s, index= %d", this.nexttoken, this.lines, this.currindex);
    //if ((this.tokenseq != 0) && (this.nexttoken.length > 1)) {
    //    this.prevtoken = this.nexttoken + this.lines.charAt(0);
    //}
    
    this.nexttoken = this.nexttoken + this.lines.charAt(0);   // line �� �ѹ��ڸ� �����´�.
    this.lines = this.lines.substring(1);                     // line ���� �ѹ��ڸ� ����
    this.currindex++;
}

Parjs.prototype.emptytoken = function(){
    this.token = '';
    this.nexttoken = '';
}

Parjs.prototype.parserjs = function() {  // parserunit
        var i = 0;
        console.log("===================================== Jsparsing starting =========================================== \n this.lines=[%s]", this.lines);
        console.log("lines length =", this.lines.length);

        while (this.lines) {
           this.getnexttoken();
           if (this.lines.length === 0)  break;

           if (i == 100) break;
           i++;
        }
}

Parjs.prototype.tostringtokens = function () {

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



var testjs1 =
             "var x; \n" +
             "function ab () {   \n"+
	     "     alert('ab') \n"+
             "}  \n"+
             '';


//var pj = new Parjs("var x; var y; var z= 100000;");
//var pj = new Parjs("var x=9 ;var y; var a,b;");
//var pj = new Parjs("ab = function() {  \n   alert('ab') }");
//var pj = new Parjs(" function ab () {   \n } ");
//var pj = new Parjs(testjs1);
var pj = new Parjs("var obj= new ab  (); ");
pj.parserjs();

console.log("=>", '\n' + pj.tostringtokens());



// ====================================================================================================================================================

/*
 * HTML Parser By John Resig (ejohn.org)
 * Original code by Erik Arvidsson, Mozilla Public License
 * http://erik.eae.net/simplehtmlparser/simplehtmlparser.js
 *
 * // Use like so:
 * HTMLParser(htmlString, {
 *     start: function(tag, attrs, unary) {},
 *     end: function(tag) {},
 *     chars: function(text) {},
 *     comment: function(text) {}
 * });
 *
 * // or to get an XML string:
 * HTMLtoXML(htmlString);
 *
 * // or to get an XML DOM Document
 * HTMLtoDOM(htmlString);
 *
 * // or to inject into an existing document/DOM node
 * HTMLtoDOM(htmlString, document);
 * HTMLtoDOM(htmlString, document.body);
 *
 */
 



	// Regular Expressions for parsing tags and attributes
	var startTag = /^<([-A-Za-z0-9_]+)((?:\s+\w+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)>/,
	    endTag   = /^<\/([-A-Za-z0-9_]+)[^>]*>/,
	    attr     = /([-A-Za-z0-9_]+)(?:\s*=\s*(?:(?:"((?:\\.|[^"])*)")|(?:'((?:\\.|[^'])*)')|([^>\s]+)))?/g;
		
	// Empty Elements - HTML 4.01
	var empty = makeMap("area,base,basefont,br,col,frame,hr,img,input,isindex,link,meta,param,embed");
	//console.log("empty=", empty);

	// Block Elements - HTML 4.01
	var block = makeMap("address,applet,blockquote,button,center,dd,del,dir,div,dl,dt,fieldset,form,frameset,hr,iframe,ins,isindex,li,map,menu,noframes,noscript,object,ol,p,pre,script,table,tbody,td,tfoot,th,thead,tr,ul");

	// Inline Elements - HTML 4.01
	var inline = makeMap("a,abbr,acronym,applet,b,basefont,bdo,big,br,button,cite,code,del,dfn,em,font,i,iframe,img,input,ins,kbd,label,map,object,q,s,samp,script,select,small,span,strike,strong,sub,sup,textarea,tt,u,var");

	// Elements that you can, intentionally, leave open
	// (and which close themselves)
	var closeSelf = makeMap("colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr");

	// Attributes that have their values filled in disabled="disabled"
	var fillAttrs = makeMap("checked,compact,declare,defer,disabled,ismap,multiple,nohref,noresize,noshade,nowrap,readonly,selected");

	// Special Elements (can contain anything)
	var special = makeMap("script,style");

        var str=
             '<html xmlns="http://www.w3.org/1999/xhtml">' +
             '<head>'+
             '   <title>FCKeditor - Sample</title>'+
             //'   <script type="text/javascript" src="p1.js"></script>'+
             '          '+
             '</head>'+
             '<body topmargin="0">'+
	     '<script type="text/javascript">'+
             '   '+
             '   function recivefname(fname){'+
             '       alert(fname[0]);'+
             '   }'+
             '   '+
	     '</script>'+
             '    '+
             '	'+
             '<!-- -->'+
             '</body> '+
             '</html>';

        
	var HTMLParser = this.HTMLParser = function( html, handler ) {
		var index, chars, match, stack = [], last = html;
                    
		stack.last = function(){
			return this[ this.length - 1 ];  // this = stack = []
		};
		
		//console.log("handler", handler);

		while ( html ) {
			chars = true;

			// Make sure we're not in a script or style element
			if ( !stack.last() || !special[ stack.last() ] ) {   // stack �� �������� �����Ƿ� undifined

				// Comment
				if ( html.indexOf("<!--") == 0 ) {    // html ó�������� �����´�. �������� -1 �� �����ϰ�
					index = html.indexOf("-->");
	
					if ( index >= 0 ) {
						if ( handler.comment )
							handler.comment( html.substring( 4, index ) );
						html = html.substring( index + 3 );
						chars = false;
					}

				// end tag
				} else if ( html.indexOf("</") == 0 ) {
					match = html.match( endTag );
	
					if ( match ) {
						html = html.substring( match[0].length );
						//console.log("end match 0 ======",match[0]);
						match[0].replace( endTag, parseEndTag );
						chars = false;
					}
	
				// start tag
				} else if ( html.indexOf("<") == 0 ) {
					match = html.match( startTag );
                                        
					if ( match ) {
						html = html.substring( match[0].length );
						//console.log("start match 0 ======",match[0]);
						match[0].replace( startTag, parseStartTag );

						chars = false;
					}
				}

				if ( chars ) {
					index = html.indexOf("<");
					
					var text = index < 0 ? html : html.substring( 0, index );
					//console.log("chars ======", text);
					//console.log("html ======", html);
					html = index < 0 ? "" : html.substring( index );
					
					if ( handler.chars )
						handler.chars( text );
				}

			} else {
				html = html.replace(new RegExp("(.*)<\/" + stack.last() + "[^>]*>"), function(all, text){
					text = text.replace(/<!--(.*?)-->/g, "$1")
						.replace(/<!\[CDATA\[(.*?)]]>/g, "$1");

					if ( handler.chars )
						handler.chars( text );
                                        //console.log("else ---------", html);
					return "";
				});

				parseEndTag( "", stack.last() );
			}

			if ( html == last ){
                                //alert("Parse Error: " + html);
                                //console.log("", html);
				throw "Parse Error: " + html;
                        }
			last = html;
		}  // end while
		
		// Clean up any remaining tags
		parseEndTag();

		function parseStartTag( tag, tagName, rest, unary ) {
			tagName = tagName.toLowerCase();
			
			//console.log("parseStartTag============================>",tag, tagName);

			if ( block[ tagName ] ) {
				while ( stack.last() && inline[ stack.last() ] ) {
					parseEndTag( "", stack.last() );
				}
			}

			if ( closeSelf[ tagName ] && stack.last() == tagName ) {
				parseEndTag( "", tagName );
			}

			unary = empty[ tagName ] || !!unary;

			if ( !unary )
				stack.push( tagName );
			
			if ( handler.start ) {
				var attrs = [];
	
				rest.replace(attr, function(match, name) {
					var value = arguments[2] ? arguments[2] :
						arguments[3] ? arguments[3] :
						arguments[4] ? arguments[4] :
						fillAttrs[name] ? name : "";
					
					attrs.push({
						name: name,
						value: value,
						escaped: value.replace(/(^|[^\\])"/g, '$1\\\"') //"
					});
				});
	
				if ( handler.start )
					handler.start( tagName, attrs, unary );
			}
		}

		function parseEndTag( tag, tagName ) {
			// If no tag name is provided, clean shop
			if ( !tagName )
				var pos = 0;
				
			// Find the closest opened tag of the same type
			else
				for ( var pos = stack.length - 1; pos >= 0; pos-- )
					if ( stack[ pos ] == tagName )
						break;
			
			if ( pos >= 0 ) {
				// Close all the open elements, up the stack
				for ( var i = stack.length - 1; i >= pos; i-- )
					if ( handler.end )
						handler.end( stack[ i ] );
				
				// Remove the open elements from the stack
				stack.length = pos;
			}
		}
	};
	
	this.HTMLtoXML = function( html ) {
		var results = "";
		
		HTMLParser(html, {
			start: function( tag, attrs, unary ) {
				results += "<" + tag;
		
				for ( var i = 0; i < attrs.length; i++ ) {
					results += " " + attrs[i].name + '="' + attrs[i].escaped + '"';
					//console.log("results.....",results);
                                }
		
				results += (unary ? "/" : "") + ">";
			},
			end: function( tag ) {
				results += "</" + tag + ">";
			},
			chars: function( text ) {
				results += text;
			},
			comment: function( text ) {
				results += "<!--" + text + "-->";
			}
		});
		
		return results;
	};
	
	this.HTMLtoDOM = function( html, doc ) {
		// There can be only one of these elements
		var one = makeMap("html,head,body,title");
		
		// Enforce a structure for the document
		var structure = {
			link: "head",
			base: "head"
		};
	
		if ( !doc ) {
			if ( typeof DOMDocument != "undefined" )
				doc = new DOMDocument();
			else if ( typeof document != "undefined" && document.implementation && document.implementation.createDocument )
				doc = document.implementation.createDocument("", "", null);
			else if ( typeof ActiveX != "undefined" )
				doc = new ActiveXObject("Msxml.DOMDocument");
			
		} else
			doc = doc.ownerDocument ||
				doc.getOwnerDocument && doc.getOwnerDocument() ||
				doc;
		
		var elems = [],
			documentElement = doc.documentElement ||
				doc.getDocumentElement && doc.getDocumentElement();
				
		// If we're dealing with an empty document then we
		// need to pre-populate it with the HTML document structure
		if ( !documentElement && doc.createElement ) (function(){
			var html = doc.createElement("html");
			var head = doc.createElement("head");
			head.appendChild( doc.createElement("title") );
			html.appendChild( head );
			html.appendChild( doc.createElement("body") );
			doc.appendChild( html );
		})();
		
		// Find all the unique elements
		if ( doc.getElementsByTagName )
			for ( var i in one )
				one[ i ] = doc.getElementsByTagName( i )[0];
		
		// If we're working with a document, inject contents into
		// the body element
		var curParentNode = one.body;
		
		HTMLParser( html, {
			start: function( tagName, attrs, unary ) {
				// If it's a pre-built element, then we can ignore
				// its construction
				if ( one[ tagName ] ) {
					curParentNode = one[ tagName ];
					if ( !unary ) {
						elems.push( curParentNode );
					}
					return;
				}
			
				var elem = doc.createElement( tagName );
				
				for ( var attr in attrs )
					elem.setAttribute( attrs[ attr ].name, attrs[ attr ].value );
				
				if ( structure[ tagName ] && typeof one[ structure[ tagName ] ] != "boolean" )
					one[ structure[ tagName ] ].appendChild( elem );
				
				else if ( curParentNode && curParentNode.appendChild )
					curParentNode.appendChild( elem );
					
				if ( !unary ) {
					elems.push( elem );
					curParentNode = elem;
				}
			},
			end: function( tag ) {
				elems.length -= 1;
				
				// Init the new parentNode
				curParentNode = elems[ elems.length - 1 ];
			},
			chars: function( text ) {
				curParentNode.appendChild( doc.createTextNode( text ) );
			},
			comment: function( text ) {
				// create comment node
			}
		});
		
		return doc;
	};

	function makeMap(str){
		var obj = {}, items = str.split(",");
		for ( var i = 0; i < items.length; i++ )
			obj[ items[i] ] = true;
		return obj;
	}
	
	
	var xml = HTMLtoXML(str);
	//console.log("xml=", xml);
	
	
	var d = HTMLtoDOM(str, d);
	//console.log("dom=", d );
	

})();
