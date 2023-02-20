# jsparser

## pure html & javascript parser

### flowjs.html   (main) <br/>

        var PP = new Parhtml(ssa); 
        PP.parserunit(); 

        console.log("=>[tokens: ]", '\n' + PP.tostringtokens()); 
        console.log("=>[traces: ]", PP.getTracefilelst()); 
        console.log("=>[script: ]", PP.getInlineScript()); 

        var scripts = PP.getInlineScript();
        for(var i=0; i < scripts.length; i++){

                var pj = new jsparser(String(scripts[i]), false);
                pj.parserjs();
                pj.tostringtokens(); 
        }


### htmlparser.js (html parser) <br/>
### jsparser.js   (javascript parser)  <br/>
