/*
filename : htmlparser.js
author : yoobi
project : chartflow
company :

*/

var Parhtml = function (html, targetfile) {

        //if (!validHTML(html)) { alert('Invalid HTML, HTML ���� ������ �ƴմϴ�. ') }  // Html validation check

        this.orglines       = '';    // source
        this.lines          = html;
        this.ftype          = [];   // file=js, html
        this.token          = '';   // html, head
        this.nexttoken      = '';   // temp token
        this.currindex      = 0;    // ������ġ
        this.comment        = '';
        this.fname = targetfile;
        this.prevchar       = '';
        this.nextchar       = '';

        this.tokenobj = []; //[ {tagname: depth: data:},{} ... {n} ] �迭�� �׳� object�� �����Ѵ�.
        this.depth = 0;
        this.tagdata = '';

        var isDepthEnd = false;                               // depth �� 0 �̸� True �ƴϸ� false
        var isMetalink = false;                               // <meta .../> �� ���� ���� ó������ isDepthEnd =0 �̰� </ ������ �ƴ� ��� true
        var isBracketInOut = false;                           // <> ���̸� true, <> ���̸� false

        this.getnexttoken = function () {

            var a = this.lines.charAt(0);
            this.prevchar = a;
            this.nextchar = this.lines.charAt(1);
            var code = this.lines.charCodeAt(0);

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
                case a === ' ':   // ����ó��
                    if (isBracketInOut) {                            // < > �ȿ� �ִ�.

                        if (checkKeywords(this.nexttoken)){                /* keywords �μ� �����ϴ��� üũ  checkStringInArray(this.keywords, this.nexttoken) �� �������  */
                            var index = findChar(this.lines, '>');              // tagdata �� ��´�.
                            if (index !== -1) {
                               this.tagdata = this.lines.substring(0, index);
                               this.lines = this.lines.substring(index);

                               if (checkMetalinktags(this.nexttoken)) { this.depth--; }   // <link  ..../> ���� ó��
                            }
                        } else {
                            try { throw Error(' Keywords �� �������� �ʽ��ϴ�. '); } catch(e) { this.skiptoken(); };
                        }
                    } else {
                       //console.log("this.nexttoken [%s]", this.nexttoken);
                       this.addone();                                           // < > ���� �ƴϸ� ���鸦 data �׸����� ����.
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
                    if (this.isCommentordoctype(a)) {                                 // <!-- --> comment , <!DOCTYPE HTML ....>  skip, ó���� ! ���� ����
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
                    if ((isDepthEnd) && (!isMetalink)) { this.skiptoken(); break; };                 // depth �� �������̸� ���� depth === 0 ���
                    this.nexttoken = this.nexttoken.c_trim(this.nexttoken);
                    this.token = this.nexttoken;

                    if (this.nexttoken !== '') this.inserttoken();                                                              // token ����, token ���� ��� �����ȴ�.
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
                        if (this.nexttoken === 'br') { this.depth--; }  // ? �����ڰ� ���� tag �� ���
                        if (this.nexttoken === 'hr') { this.depth--; }  // ?
                    }


                    this.skiptoken();
                    this.depth++
                    isMetalink = false;
                    isBracketInOut = false;

                    break;
                case a === '/':        // '/' �� depth �� �Ǵ��ϴ� ����
                    this.skiptoken();
                    this.depth !== 0 ? isDepthEnd = true : isDepthEnd = false;
                    this.depth--;

                    var idx = findChar(this.lines, '>');
                    this.lines = this.lines.substring(idx);  // </ ...> �� ����

                    break;
                case a === '(' || a === ')' || a === '[' || a === ']' || a === ';' || a === ',' || a === '.' || a === '^' || a === '*' || a === '=':

                case (a >= 'A' && a <= 'Z') || (a >= 'a' && a <= 'z') || a === '_' || a === '@' || a === '-':  // ����
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
                case code === 8220 || code === 8221 || code === 167 || code === 63 || code === 8217 || code === 37:     //��, ��, ��, ? , ` , % Ư������
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

// ��Ȯ���� �׽�Ʈ ����.
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

function countString(s, checkstr){
    var pos = 0;
    var i = 0;

    while(true) {
        var foundPos = s.indexOf(checkstr, pos);
        if(foundPos == -1) break;
        pos = foundPos + 1;	// �� ã�� �Ǹ�, ���� ��ġ���� �ٽ� ã���ϴ�.
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

// html �� ���⸮��Ʈ �� �˾ƿ�.  <script type='text/javascript' src='../../fckeditor.js'></script>
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

// html �� <script> �κ� �ҽ� text , jsparser�� ���� ��
// <script> �� 2���� ���� ���� result �� �迭�� ��´�.
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
