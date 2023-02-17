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
"  var ab = '';           // general var   (gv) \n" +
"  let ab = '';           // general let   (gl) \n" +
"  const ab = '';         // general const (gc) \n" +
"  var ast = [   ];          // var array     (va) \n" +
"  let ast = [   ];          // let array     (la) \n " +
"  const ast = [ ];        // const array   (ca) \n" +
" </script> \n" ;













