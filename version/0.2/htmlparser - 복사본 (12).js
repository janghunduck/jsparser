(function(){




//var mp = new MatchParser('<title>FCKeditor - Sample</title> <script type="text/javascript" src="p1.js"></script>');
function makearray(str){
	 var arr = [], items = String(str).split(",");
	 for ( var i = 0; i < items.length; i++ )
		arr[i] = items[i];
	 return arr;
}



//html 문서가 정확해야 하지만, 그 전에 정확한 문서인지 체크가 되어야 한다.

var Parhtml = function (hj) {
         
         this.orglines       = '';    // source
         this.lines          = hj;
         this.ftype          = [];   // file=js, html
         this.token          = '';   // html, head
         this.nexttoken      = '';   // temp token
         this.currindex      = 0;    // 현재위치
         this.comment        = '';

         this.tokenobj = []; //[ {tagname: depth: data:},{} ... {n} ] 배열에 그냥 object를 나열한다.
         this.depth = 0;
         this.tagdata = '';
         
         this.fixedtags = makearray("html,head,title,body,table,tr,td,div,meta,link,script");
         this.closetags = makearray("meta,link");  // <  /> 시작과 함께 닽힘
         var depthend = false;
         var bcontinue = false;
         var btag     = false;  // < => true,  > => false
        /**
         ex : <html><head></head><body>abcd</body></html>
         token : function, procedure, 지시자들  = tagName ( html, head, body etc )
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
                 case a === "'":
                     this.addone();
                     break;
                 /*case a === '"':
                     this.addone();
                     break;
                     */
                 case a === '\n':
                 case a === ' ':   // 공백처리
                     
                     //console.log("========>", this.fixedtags, this.nexttoken);

                     if (btag) {
                         console.log("========>", this.fixedtags, this.nexttoken);
                         if (this.checkfixedtag(this.nexttoken)){
                             var index = this.findtoken(this.lines, '>');
                             if (index > 0) {
                                this.tagdata = this.lines.substring(0, index);
                                this.lines = this.lines.substring(index);
                                
                                
                                if (this.checkclosetag(this.nexttoken)) {     // <link  ..../> 형태 처리
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
                        bcontinue = true;                                                             // 중간 상위 노드가 존재하는 지 쳌,
                     }
                     btag = true;
                     break;
                 case a === '>':
                     
                     if (depthend && !bcontinue) { this.skiptoken(); break; };                        // depth 가 마지막이면 나감 depth === 0 경우

                     this.token = this.nexttoken;
                     this.inserttoken();                                                              // token 생성, token 마다 계속 생성된다.
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
                 case a === '/':        // '/' 는 depth 를 판단하는 기준
                     this.skiptoken();
                     depthend !== 0 ? depthend = true : depthend = false;
                     this.depth--;
                     //console.log("depth [/] %d", this.depth);
                     //bcontinue = false;
                     break;
                 case a === '(' || a === ')' || a === '[' || a === ']' || a === ';' || a === ',' || a === '.' || a === '^' || a === '*' || a === '=':

                 case (a >= 'A' && a <= 'Z') || (a >= 'a' && a <= 'z') || a === '_' || a === '@' || a === '-':  // 문자
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


Parhtml.prototype.skiptoken = function() {

             this.addone();
             this.emptytoken();
}

Parhtml.prototype.addone = function() {  // parserunit

        //console.log("nexttoken= %s, lines= %s, index= %d", this.nexttoken, this.lines, this.currindex);
         
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
        console.log("lines=",this.lines);
        console.log("lines length =", this.lines.length);

        while (this.lines) {
           this.getnexttoken();
           if (this.lines.length === 0)  break;
           
           //if (i == 101) break;
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

var PP = new Parhtml("<html xmlns='http://www.w3.org/1999/xhtml'><head><title>abcd -efg</title><script type='text/javascript' src='../../fckeditor.js'></script></head><body><script type='text/javascript'>var oFCKeditor = '<a href='http://www.fckeditor.net/'>FCKeditor<\/a>'</script></body></html>");

PP.parserunit();

console.log("=>", '\n' + PP.tostringtokens());


             
console.log("sss=>[%s]",PP.deleteallcomment(sss));
//var c = P.pickchar(P.lines, 0);

//console.log("[%s]", c);




//html 문서가 정확해야 하지만, 그 전에 정확한 문서인지 체크가 되어야 한다.

var Parjs = function (hj) {

         this.orglines       = '';    // source
         this.lines          = hj;
         this.ftype          = [];   // file=js, html
         this.token          = '';   // html, head
         this.prevtoken      - '';
         this.nexttoken      = '';   // temp token
         this.prevchar       = '';
         this.nextchar       = '';
         this.currindex      = 0;    // 현재위치
         this.comment        = '';

         //this.Tokens = new Arboreal(0, {}, 'root');
         this.tokenobj = []; //[ {tagname: depth: data:},{} ... {n} ] 배열에 그냥 object를 나열한다.
         this.depth = 0;
         this.tagdata = '';

         this.keywords = makearray("var,let,const");

         this.getnexttoken = function () {

             //eatwhitespace();
             
             var a = this.lines.charAt(0);
             var b = this.lines.charCodeAt(0);
             this.prevchar = a;
             this.nextchar = this.lines.charAt(1);
             
             //console.log("%s, %d", a, b);
             switch (true) {
                 case b === 0:   // EOF (end of file)  ?
                     alert('eof');           
                     break;
                 case a === "'":
                     this.addone();
                     break;
                 /*case a === '"':
                     this.addone();
                     break;
                     */
                 case a === '\n':
                 //case b == 32:
                 //    console.log("empty 32",);
                 //    break;
                 case a === ' ':   // 공백처리
                     this.token = this.nexttoken;
                     
                     
                     this.skiptoken();
                     break;
                 case a === '#':
                 case a === '$':
                 case a === ':':
                     this.addone();
                     break;
                 case (a >= '0' && a <= '9') || a === '+':

                 case a === '<':


                 case a === '>':


                     break;
                 case a === '/':       

                     break;
                 case a === '(' || a === ')' || a === '[' || a === ']' || a === ';' || a === ',' || a === '.' || a === '^' || a === '*' || a === '=':

                 case (a >= 'A' && a <= 'Z') || (a >= 'a' && a <= 'z') || a === '_' || a === '@' || a === '-':  // 문자
                     this.addone();
                     break;

                 default:  break;
             }


             return true;
         };


         // 주석처리
         function eatwhitespace() {
             var incomment, countinuelastcomment,state;  // boolean

             function eatone(){
                 if (incomment) comment = comment + lines;

             }
         };

}

/*
Parjs.prototype.inserttoken = function () {
         node = new Object();
         node.tagname = this.token;
         node.depth   = this.depth;
         node.data    = '';
         node.tagdata = '';
         this.tokenobj.push(node);

         return node;
}
*/

Parjs.prototype.newcollector = function () {
    var node = new Object();
    node.typeid = -1;
    node.typeof = '';
    node.mame   = '';
    node.rtnval = '';
    node.localval = [];
    node.globalfun  = [];
    node.globalval  = [];
    node.bootobj    = function () {
            };
    node.bootfun    = function () {};
    this.tokenobj.push(node);
    
    return node;
}

Parjs.prototype.getcollector = function (typeid) {
    if (this.tokenobj.length >= 0) {
        //
        // loop를 돌아 typeid에 맞는 node를 return 한다.
    }
}

Parjs.prototype.setcollector = function (typeid, data) {
    if (this.tokenobj.length >= 0) {
        //
        // loop를 돌아 typeid에 맞는 node를 return 한다.
    }
}

Parjs.prototype.skiptoken = function() {

    this.addone();
    this.emptytoken();
}

Parjs.prototype.addone = function() {  // parserunit

    //console.log("nexttoken= %s, lines= %s, index= %d", this.nexttoken, this.lines, this.currindex);
    if (this.nexttoken.length > 1) {
        this.prevtoken = this.nexttoken;
    }
    this.nexttoken = this.nexttoken + this.lines.charAt(0);   // line 의 한문자를 가져온다.
    this.lines = this.lines.substring(1);                     // line 에서 한문자를 제거

    this.currindex++;
}

Parjs.prototype.emptytoken = function(){
    this.token = '';
    this.nexttoken = '';
}

Parjs.prototype.parserjs = function() {  // parserunit
        var i = 0;
        console.log("Parserjs starting --------------------------------------------------------------------> \n this.lines=[%s]", this.lines);
        console.log("lines length =", this.lines.length);

        while (this.lines) {
           this.getnexttoken();
           if (this.lines.length === 0)  break;

           if (i == 10) break;
           i++;
        }
}


var pj = new Parjs("var x;");

pj.parserjs();

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
			if ( !stack.last() || !special[ stack.last() ] ) {   // stack 의 마지막이 없으므로 undifined

				// Comment
				if ( html.indexOf("<!--") == 0 ) {    // html 처음시작을 가져온다. 없을때는 -1 를 리턴하고
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
