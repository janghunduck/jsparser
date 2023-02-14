//(function(){



//html ������ ��Ȯ�ؾ� ������, �� ���� ��Ȯ�� �������� üũ�� �Ǿ�� �Ѵ�.

var Parhtml = function (html, targetfile) {

         this.orglines       = '';    // source
         this.lines          = html;
         this.ftype          = [];   // file=js, html
         this.token          = '';   // html, head
         this.nexttoken      = '';   // temp token
         this.currindex      = 0;    // ������ġ
         this.comment        = '';
         this.fname = targetfile;

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

             // tab ó�� �Ұ�

             switch (true) {
                 case a === '#0':                     //EOF \n
                     this.skiptoken();
                     break;
                 case a === "'":  // �Ʒ� �ּ�ġ�� �� " �� ' �� �ڵ��� ����. ���Ŀ� �ּ��� Ǯ�� (���߻� ���̶���Ʈ�� ���� �ʾ� �ּ�ó���� ���� ���� )
                     this.addone();
                     break;
                 /*case a === '"':
                     this.addone();
                     break;
                     */
                 case a === '\n' || a === '\t':
                     this.skiptoken();
                     break;
                 case a === ' ':   // ����ó��

                     //console.log("========>", this.fixedtags, this.nexttoken);

                     if (btag) {
                         /* keywords �μ� �����ϴ��� üũ */
                         if (this.checkfixedtag(this.nexttoken)){

                             var index = this.findtoken(this.lines, '>');  // tagdata �� ��´�.
                             //alert('index=>' + index);
                             if (index > 0) {
                                this.tagdata = this.lines.substring(0, index);
                                this.lines = this.lines.substring(index);
                                //alert(this.tagdata);

                                if (this.checkclosetag(this.nexttoken)) {     // <link  ..../> ���� ó��
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
                        bcontinue = true;                                                             // �߰� ���� ��尡 �����ϴ� �� �n,
                     }
                     btag = true;
                     break;
                 case a === '>':

                     if (depthend && !bcontinue) { this.skiptoken(); break; };                        // depth �� �������̸� ���� depth === 0 ���

                     this.token = this.nexttoken;
                     //alert(this.token);
                     //llog = llog + '    (' + this.token + ')    ';
                     this.inserttoken();                                                              // token ����, token ���� ��� �����ȴ�.
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
             if (str.charAt(i) === char){
             //if (str[i] === char) {               /* IE8 ���Ͽ����� string �� �迭�� ���� ������ �� ����. */
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
IE8 ������ �� �ͱ۾ ����Ѵ�.
<!--[if lte IE 8]>
<script type="text/javascript">
String.prototype.trim = function() {
    return this.replace(/^\s+|\s+$/g,"");
}
</script>
<![endif]-->
*/



// ������ ��ü���� ���� ���� ������ �����Ѵ�.
// Console UI���� ���ϸ��� �޾ƿ� ���

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
function delRepeatLastStr(str, delimiter, count) {  // ('x@y@z', '@', 2 )  ���� x �� ���´�.
    var i = 0;
    for (var i=0; i < count; i++){
        var foundPos = str.lastIndexOf(delimiter);
        str = str.substr(0, foundPos);

    }
    return str;
}


// <script type='text/javascript' src='../../fckeditor.js'></script> ���� ���� ���丮�� /D:/fckeditor.js ������ �����Ѵ�.
Parhtml.prototype.tostringtagdata = function () {

	for ( var i = 0; i < this.tokenobj.length; i++ ){
           var node = this.tokenobj[i];
           if (node.tagname === 'script'){
              var idx = node.tagdata.indexOf('src');
              if (idx !== -1){
                  var str = node.tagdata.substr(idx, node.tagdata.length - idx);

                  str = rangestr (str, "'", "'");                                // ../../aaa.js, ./ab.js
                  var ddotcnt = countRepeatStr(str, '..');
                  var currdir = getFileAbsolutePath();                           // ddotcnt ��ŭ ������ �ö󰣴�. /D:/flowjs/Html/
                  currdir = delRepeatLastStr(currdir, '/', 2);

                  var idx2 = str.lastIndexOf('/');
                  str = str.substr(idx2, str.length - idx2);

                  //console.log("tagdata = [%s]", currdir + str);  // flowchart�� �佺 �ϰ� flowchar���� �ٽ� �ҽ��� jsparser�� �ѱ�
              } else {
                  //console.log("data = [%s]", node.data);  // jsparser�� ��
              }
           }

        }
}

// html �� ���⸮��Ʈ �� �˾ƿ�.  <script type='text/javascript' src='../../fckeditor.js'></script>
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
                      currdir = getFileAbsolutePath();                           // ddotcnt ��ŭ ������ �ö󰣴�. /D:/flowjs/Html/
                  } else {
                      currdir = getFileAbsolutePath(this.fname);
                  }
                  currdir = delRepeatLastStr(currdir, '/', 2);

                  var idx2 = str.lastIndexOf('/');
                  str = str.substr(idx2, str.length - idx2);
                  arr.push(currdir + str);

                  //console.log("tagdata = [%s]", currdir + str);  // flowchart�� �佺 �ϰ� flowchar���� �ٽ� �ҽ��� jsparser�� �ѱ�
              }
           }

    }
    return arr;
}

// html �� <script> �κ� �ҽ� text , jsparser�� ���� ��
// <script> �� 2���� ���� ���� result �� �迭�� ��´�.
Parhtml.prototype.getInlineScript_ = function () {
    var result = '';
    for ( var i = 0; i < this.tokenobj.length; i++ ){
           var node = this.tokenobj[i];
           if (node.tagname === 'script'){
              var idx = node.tagdata.indexOf('src');
              if (idx === -1){
                  //console.log("data = [%s]", node.data);  // jsparser�� ��
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

// <!DOCTYPE html><html></html> ó�� ==> ó���� comment�� ���� ��������

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
