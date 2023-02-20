ssa =

" <script> \n" +
 " let acorn = require('acorn'); \n" +
 "  \n" +
 " let aa = acorn.parse('var aa = function (x,y){ }', {ecmaVersion: 2020}); \n" +
 "  \n" +
" console.log(Object.entries(aa)); \n" +
" alert(Object.values(aa));\n" +
" </script> \n" ;

ssa =
"  \n" +
" <script> \n" +
" let babelParser = require('@babel/parser'); \n" +
"  \n" +
"  let ast = []; \n" +
"  \n" +
" //ast = babelParser.parse(code, mergeObjectStructures(defaultAstConfig, config)); \n" +
" ast = babelParser.parse('function ab() { }', {}); \n" +
"  \n" +
" console.log('=>',ast.toString()); \n" +
"  \n" +
" </script> \n" ;

 ssa =
" <script> \n" +

" var ab; \n" +
" var ab,cd; \n" +
"  var ab = '';           // general var   (gv) \n" +
"  let ab = '';           // general let   (gl) \n" +
"  const ab = '';         // general const (gc) \n" +
"  var ast = [   ];          // var array     (va) \n" +
"  let ast = [   ];          // let array     (la) \n " +
"  const ast = [ ];        // const array   (ca) \n" +
"  var ast = {   };          // var object     (vo) \n" +
"  let ast = {   };          // let object     (lo) \n " +
"  const ast = { };        // const object   (co) \n" +
" </script> \n" ;


ssa =
" <html> \n" +
"   <head> \n" +
"     <title>Read Text File Tutorial</title> \n" +
"  \n" +
"     <script type='text/javascript' src='htmlparser.js'></script> \n" +
"   </head> \n" +
"   <body> \n" +
"     <input type='file' onchange='loadFile(this.files[0])'> \n" +
"     <input type='file' name='inputFile' id='inputFile'> \n" +
"     <br> \n" +
"     <pre id='output'></pre> \n" +
"     <script> \n" +
"          var text; \n" +
"          async function loadFile(file) { \n" +
"             let text = await file.text(); \n" +
"             document.getElementById('output').textContent = text; \n" +
"  \n" +
"             var xml = HTMLtoXML(text); \n" +
"  \n" +
"             console.log('',xml); \n" +
"          } \n" +
"  \n" +
"  \n" +
"         document.getElementById('inputFile').addEventListener('change', function() { \n" +
"            var file = new FileReader(); \n" +
"            file.onload = () => { \n" +
"              document.getElementById('output').textContent = file.result; \n" +
"            } \n" +
"             file.readAsText(this.files[0]); \n" +
"         }); \n" +
"     </script> \n" +
"   </body> \n" +
" </html> \n" +
"  \n" ;

ssa=

" 	<script type='text/javascript'> " +
"  \n" +
" if ( window.top == window ){ \n" +
"  	document.location = 'default.html' ; \n" +
"  }\n" +

  " function OpenSample(sample)   \n" +
  " {\n" +
  " 	if ( aa > 0 ) \n" +
  " 		test( a, 'me!!!!' ) ; \n" +
  " }    \n" +
  "     \n" +
  " function ab() \n" +
  " {\n" +
  "    alert('~'); \n" +
  " } \n" +
 "  \n" +
" " +
" 	</script> \n" +

"  \n" ;



