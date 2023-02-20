# jsparser

## pure html & javascript parser

### flowjs.html   (main) <br/>

var PP = new Parhtml(ssa); <br/>
PP.parserunit(); <br/>

console.log("=>[tokens: ]", '\n' + PP.tostringtokens()); <br/>
console.log("=>[traces: ]", PP.getTracefilelst()); <br/>
console.log("=>[script: ]", PP.getInlineScript()); <br/>

var scripts = PP.getInlineScript(); <br/>
for(var i=0; i < scripts.length; i++){ <br/>
        var pj = new jsparser(String(scripts[i]), false); <br/>
        pj.parserjs(); <br/>
        pj.tostringtokens(); <br/>
}


### htmlparser.js (html parser) <br/>
### jsparser.js   (javascript parser)  <br/>
