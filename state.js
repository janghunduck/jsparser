//(function(){


var Parserjs  = function (options, input, startPos) {
    this.options = options = getOptions(options);

    this.sourceFile = options.sourceFile;
    this.keywords = wordsRegexp(keywords[options.ecmaVersion >= 6 ? 6 : options.sourceType === "module" ? "5module" : 5]);
    
    let reserved = ""
    if (options.allowReserved !== true) {
      reserved = reservedWords[options.ecmaVersion >= 6 ? 6 : options.ecmaVersion === 5 ? 5 : 3]
      if (options.sourceType === "module") reserved += " await"
    }
    this.reservedWords = wordsRegexp(reserved)
    let reservedStrict = (reserved ? reserved + " " : "") + reservedWords.strict
    this.reservedWordsStrict = wordsRegexp(reservedStrict)
    this.reservedWordsStrictBind = wordsRegexp(reservedStrict + " " + reservedWords.strictBind)
    this.input = String(input)
    

    this.containsEsc = false  // 단어에 이스케이프 시퀀스가 ??포함되어 있는지 여부를 'readWord1' 호출자에게 알리는 데 사용됩니다.
                              // 이는 이스케이프 시퀀스가 ??있는 단어를 키워드로 해석해서는 안 되기 때문에 필요합니다.
    
    console.log("this.options==> ",this.options);
    
    if (startPos) {                                                // input 에서 토크나이저의 현재 위치.
      this.pos = startPos
      this.lineStart = this.input.lastIndexOf("\n", startPos - 1) + 1
      this.curLine = this.input.slice(0, this.lineStart).split(lineBreak).length
    } else {
      this.pos = this.lineStart = 0
      this.curLine = 1
    }

    this.type = tt.eof                                             // 현재 토큰의 속성: 유형 // tokenize.js import {types as tt, keywords as keywordTypes} from "./tokentype.js"
    //this.type = TokenType
    this.value = null                                              // 유형보다 더 많은 정보를 포함하는 토큰의 경우 값
    this.start = this.end = this.pos                               // 시작 및 끝 오프셋
    this.startLoc = this.endLoc = this.curPosition()               // 위치가 사용된 경우 해당 오프셋에 해당하는 {line, column} 객체 // location.js

    this.lastTokEndLoc = this.lastTokStartLoc = null               // 이전 토큰의 위치 정보
    this.lastTokStart = this.lastTokEnd = this.pos

    this.context = this.initialContext()                           // 컨텍스트 스택은 주어진 위치에서 정규 표현식이 허용되는지 여부를 예측하기 위해 구문 컨텍스트를 피상적으로 추적하는 데 사용됩니다.
    this.exprAllowed = true
    
    this.inModule = options.sourceType === "module"                // 모듈 코드인지 파악합니다.
    this.strict = this.inModule || this.strictDirective(this.pos)

    this.potentialArrowAt = -1                                     // 잠재적 화살표 함수의 시작을 나타내는 데 사용됩니다.
    this.potentialArrowInForAwait = false

    this.yieldPos = this.awaitPos = this.awaitIdentPos = 0         // 기본 매개변수에 yield/await가 존재하지 않는지 지연 확인 위치를 지정합니다.
    
    this.labels = []                                               // 범위 내의 레이블.
    this.undefinedExports = Object.create(null)                    // 지금까지 정의되지 않은 내보내기.

    if (this.pos === 0 && options.allowHashBang && this.input.slice(0, 2) === "#!") // If enabled, skip leading hashbang line.
      this.skipLineComment(2)

    this.scopeStack = []                                           // 중복 변수 이름에 대한 범위 추적(scope.js 참조)
    this.enterScope(SCOPE_TOP);

    this.regexpState = null                                        // RegExp 유효성 검사용
    this.privateNameStack = []                                     // 개인 이름 스택. 각 요소에는 '선언됨'과 '사용됨'이라는 두 가지 속성이 있습니다.
                                                                   // 가장 바깥쪽 클래스 정의에서 종료되면 사용된 모든 개인 이름을 선언해야 합니다.
                                                                   
                                                                   
    this.parse = function () {
      let node = this.options.program || this.startNode()
      this.nextToken()
      return this.parseTopLevel(node)
    }
}

/** -------------------------------------------------------------------- */
// 여기부분은 locutil.js 를 가져온다.
/** -------------------------------------------------------------------- */
//import {nextLineBreak} from "./whitespace.js"

// These are used when `options.locations` is on, for the
// `startLoc` and `endLoc` properties.

/*
export class Position {
  constructor(line, col) {
    this.line = line
    this.column = col
  }

  offset(n) {
    return new Position(this.line, this.column + n)
  }
}

export class SourceLocation {
  constructor(p, start, end) {
    this.start = start
    this.end = end
    if (p.sourceFile !== null) this.source = p.sourceFile
  }
}
*/

function Position(line, col){
    this.line = line
    this.column = col
  

  function offset(n) {
    return new Position(this.line, this.column + n)
  }
}

function SourceLocation (p, start, end) {
    this.start = start
    this.end = end
    if (p.sourceFile !== null) this.source = p.sourceFile
}


// The `getLineInfo` function is mostly useful when the
// `locations` option is off (for performance reasons) and you
// want to find the line/column position for a given character
// offset. `input` should be the code string that the offset refers
// into.

function getLineInfo(input, offset) {
  for (let line = 1, cur = 0;;) {
    let nextBreak = nextLineBreak(input, cur, offset)
    if (nextBreak < 0) return new Position(line, offset - cur)
    ++line
    cur = nextBreak
  }
}


/** -------------------------------------------------------------------- */
// 여기부분은 location.js 를 가져온다.
/** -------------------------------------------------------------------- */

//import {Parser} from "./state.js"
//import {Position, getLineInfo} from "./locutil.js"

// 이 함수는 구문 분석 오류에 대한 예외를 발생시키는 데 사용됩니다.
// 오류 위치를 나타내기 위해 오프셋 정수(현재 `input`으로)를 취하고 위치를 오류 메시지 끝에 첨부한 다음 해당 메시지와 함께 'SyntaxError'를 발생시킵니다.

Parserjs.prototype.raise = function(pos, message) {
  //let loc = getLineInfo(this.input, pos)
  //message += " (" + loc.line + ":" + loc.column + ")"
  //let err = new SyntaxError(message)
  //err.pos = pos; err.loc = loc; err.raisedAt = this.pos
  //throw err
}

Parserjs.prototype.raiseRecoverable = Parserjs.prototype.raise;

Parserjs.prototype.curPosition = function() {
  if (this.options.locations) {
    return new Position(this.curLine, this.pos - this.lineStart)
  }
}


/** -------------------------------------------------------------------- */
// 여기부분은 tokencontext.js 를 가져온다.
/** -------------------------------------------------------------------- */
// 정규 표현식이 프로그램의 특정 지점에 나타날 수 있는지 여부를 결정하는 데 사용되는 알고리즘은 sweet.js의 접근 방식을 느슨하게 기반으로 합니다.
// https://github.com/mozilla/sweet.js/wiki/design 참조
//import {Parser} from "./state.js"
//import {types as tt} from "./tokentype.js"
//import {lineBreak} from "./whitespace.js"

/**
export class TokContext {
  constructor(token, isExpr, preserveSpace, override, generator) {
    this.token = token
    this.isExpr = !!isExpr
    this.preserveSpace = !!preserveSpace
    this.override = override
    this.generator = !!generator
  }
}
*/
var tt = types;

var TokContext = function(token, isExpr, preserveSpace, override, generator) {
    this.token = token;
    this.isExpr = !!isExpr;
    this.preserveSpace = !!preserveSpace;
    this.override = override;
    this.generator = !!generator;
}

const contexttypes = {  // types 가 중복되어 변경
  b_stat: new TokContext("{", false),
  b_expr: new TokContext("{", true),
  b_tmpl: new TokContext("${", false),
  p_stat: new TokContext("(", false),
  p_expr: new TokContext("(", true),
  q_tmpl: new TokContext("`", true, true, p => p.tryReadTemplateToken()),
  f_stat: new TokContext("function", false),
  f_expr: new TokContext("function", true),
  f_expr_gen: new TokContext("function", true, false, null, true),
  f_gen: new TokContext("function", false, false, null, true)
}

Parserjs.prototype.initialContext = function() {
  return [contexttypes.b_stat]
}


Parserjs.prototype.curContext = function() {
  return this.context[this.context.length - 1]
}

Parserjs.braceIsBlock = function(prevType) {
  let parent = this.curContext()
  if (parent === contexttypes.f_expr || parent === contexttypes.f_stat)
    return true
  if (prevType === tt.colon && (parent === contexttypes.b_stat || parent === contexttypes.b_expr))
    return !parent.isExpr

  // The check for `tt.name && exprAllowed` detects whether we are
  // after a `yield` or `of` construct. See the `updateContext` for
  // `tt.name`.
  if (prevType === tt._return || prevType === tt.name && this.exprAllowed)
    return lineBreak.test(this.input.slice(this.lastTokEnd, this.start))
  if (prevType === tt._else || prevType === tt.semi || prevType === tt.eof || prevType === tt.parenR || prevType === tt.arrow)
    return true
  if (prevType === tt.braceL)
    return parent === contexttypes.b_stat
  if (prevType === tt._var || prevType === tt._const || prevType === tt.name)
    return false
  return !this.exprAllowed
}

Parserjs.prototype.inGeneratorContext = function() {
  for (let i = this.context.length - 1; i >= 1; i--) {
    let context = this.context[i]
    if (context.token === "function")
      return context.generator
  }
  return false
}

Parserjs.prototype.updateContext = function(prevType) {
  //let update, type = this.type;
  var update, type = TokenType;      // 변경함.
  
  if (type.keyword && prevType === tt.dot)
    this.exprAllowed = false
  else if (update = type.updateContext)
    update.call(this, prevType)
  else
    this.exprAllowed = type.beforeExpr
}

// Used to handle egde cases when token context could not be inferred correctly during tokenization phase
Parserjs.prototype.overrideContext = function(tokenCtx) {
  if (this.curContext() !== tokenCtx) {
    this.context[this.context.length - 1] = tokenCtx
  }
}

// Token-specific context update code

tt.parenR.updateContext = tt.braceR.updateContext = function() {
  if (this.context.length === 1) {
    this.exprAllowed = true
    return
  }
  let out = this.context.pop()
  if (out === contexttypes.b_stat && this.curContext().token === "function") {
    out = this.context.pop()
  }
  this.exprAllowed = !out.isExpr
}

tt.braceL.updateContext = function(prevType) {
  this.context.push(this.braceIsBlock(prevType) ? contexttypes.b_stat : contexttypes.b_expr)
  this.exprAllowed = true
}

tt.dollarBraceL.updateContext = function() {
  this.context.push(contexttypes.b_tmpl)
  this.exprAllowed = true
}

tt.parenL.updateContext = function(prevType) {
  let statementParens = prevType === tt._if || prevType === tt._for || prevType === tt._with || prevType === tt._while
  this.context.push(statementParens ? contexttypes.p_stat : contexttypes.p_expr)
  this.exprAllowed = true
}

tt.incDec.updateContext = function() {
  // tokExprAllowed stays unchanged
}

tt._function.updateContext = tt._class.updateContext = function(prevType) {
  if (prevType.beforeExpr && prevType !== tt._else &&
      !(prevType === tt.semi && this.curContext() !== contexttypes.p_stat) &&
      !(prevType === tt._return && lineBreak.test(this.input.slice(this.lastTokEnd, this.start))) &&
      !((prevType === tt.colon || prevType === tt.braceL) && this.curContext() === contexttypes.b_stat))
    this.context.push(contexttypes.f_expr)
  else
    this.context.push(contexttypes.f_stat)
  this.exprAllowed = false
}

tt.backQuote.updateContext = function() {
  if (this.curContext() === contexttypes.q_tmpl)
    this.context.pop()
  else
    this.context.push(contexttypes.q_tmpl)
  this.exprAllowed = false
}

tt.star.updateContext = function(prevType) {
  if (prevType === tt._function) {
    let index = this.context.length - 1
    if (this.context[index] === contexttypes.f_expr)
      this.context[index] = contexttypes.f_expr_gen
    else
      this.context[index] = contexttypes.f_gen
  }
  this.exprAllowed = true
}

tt.name.updateContext = function(prevType) {
  let allowed = false
  if (this.options.ecmaVersion >= 6 && prevType !== tt.dot) {
    if (this.value === "of" && !this.exprAllowed ||
        this.value === "yield" && this.inGeneratorContext())
      allowed = true
  }
  this.exprAllowed = allowed
}


/** -------------------------------------------------------------------- */
// 여기부분은 scopeflag.js 를 가져온다.
/** -------------------------------------------------------------------- */
// Each scope gets a bitset that may contain these flags
const
    SCOPE_TOP = 1,
    SCOPE_FUNCTION = 2,
    SCOPE_ASYNC = 4,
    SCOPE_GENERATOR = 8,
    SCOPE_ARROW = 16,
    SCOPE_SIMPLE_CATCH = 32,
    SCOPE_SUPER = 64,
    SCOPE_DIRECT_SUPER = 128,
    SCOPE_CLASS_STATIC_BLOCK = 256,
    SCOPE_VAR = SCOPE_TOP | SCOPE_FUNCTION | SCOPE_CLASS_STATIC_BLOCK

function functionFlags(async, generator) {
  return SCOPE_FUNCTION | (async ? SCOPE_ASYNC : 0) | (generator ? SCOPE_GENERATOR : 0)
}

// Used in checkLVal* and declareName to determine the type of a binding
const
    BIND_NONE = 0, // Not a binding
    BIND_VAR = 1, // Var-style binding
    BIND_LEXICAL = 2, // Let- or const-style binding
    BIND_FUNCTION = 3, // Function declaration
    BIND_SIMPLE_CATCH = 4, // Simple (identifier pattern) catch binding
    BIND_OUTSIDE = 5 // Special case for function names as bound inside the function

/** -------------------------------------------------------------------- */
// 여기부분은 scope.js 를 가져온다.
/** -------------------------------------------------------------------- */

// The functions in this module keep track of declared variables in the current scope in order to detect duplicate variable names.

/*
import {Parser} from "./state.js"
import {SCOPE_VAR, SCOPE_FUNCTION, SCOPE_TOP, SCOPE_ARROW, SCOPE_SIMPLE_CATCH, BIND_LEXICAL, BIND_SIMPLE_CATCH, BIND_FUNCTION} from "./scopeflags.js"

const pp = Parser.prototype

class Scope {
  constructor(flags) {
    this.flags = flags
    // A list of var-declared names in the current lexical scope
    this.var = []
    // A list of lexically-declared names in the current lexical scope
    this.lexical = []
    // A list of lexically-declared FunctionDeclaration names in the current lexical scope
    this.functions = []
    // A switch to disallow the identifier reference 'arguments'
    this.inClassFieldInit = false
  }
}
*/

function Scope (flags) {
    this.flags = flags
    // A list of var-declared names in the current lexical scope
    this.var = []
    // A list of lexically-declared names in the current lexical scope
    this.lexical = []
    // A list of lexically-declared FunctionDeclaration names in the current lexical scope
    this.functions = []
    // A switch to disallow the identifier reference 'arguments'
    this.inClassFieldInit = false
}
// The functions in this module keep track of declared variables in the current scope in order to detect duplicate variable names.

Parserjs.prototype.enterScope = function(flags) {
  this.scopeStack.push(new Scope(flags))
}



Parserjs.prototype.exitScope = function() {
  this.scopeStack.pop()
}

// The spec says:
// > At the top level of a function, or script, function declarations are
// > treated like var declarations rather than like lexical declarations.
Parserjs.prototype.treatFunctionsAsVarInScope = function(scope) {
  return (scope.flags & SCOPE_FUNCTION) || !this.inModule && (scope.flags & SCOPE_TOP)
}

Parserjs.prototype.declareName = function(name, bindingType, pos) {
  let redeclared = false
  if (bindingType === BIND_LEXICAL) {
    const scope = this.currentScope()
    redeclared = scope.lexical.indexOf(name) > -1 || scope.functions.indexOf(name) > -1 || scope.var.indexOf(name) > -1
    scope.lexical.push(name)
    if (this.inModule && (scope.flags & SCOPE_TOP))
      delete this.undefinedExports[name]
  } else if (bindingType === BIND_SIMPLE_CATCH) {
    const scope = this.currentScope()
    scope.lexical.push(name)
  } else if (bindingType === BIND_FUNCTION) {
    const scope = this.currentScope()
    if (this.treatFunctionsAsVar)
      redeclared = scope.lexical.indexOf(name) > -1
    else
      redeclared = scope.lexical.indexOf(name) > -1 || scope.var.indexOf(name) > -1
    scope.functions.push(name)
  } else {
    for (let i = this.scopeStack.length - 1; i >= 0; --i) {
      const scope = this.scopeStack[i]
      if (scope.lexical.indexOf(name) > -1 && !((scope.flags & SCOPE_SIMPLE_CATCH) && scope.lexical[0] === name) ||
          !this.treatFunctionsAsVarInScope(scope) && scope.functions.indexOf(name) > -1) {
        redeclared = true
        break
      }
      scope.var.push(name)
      if (this.inModule && (scope.flags & SCOPE_TOP))
        delete this.undefinedExports[name]
      if (scope.flags & SCOPE_VAR) break
    }
  }
  if (redeclared) this.raiseRecoverable(pos, `Identifier '${name}' has already been declared`)
}

Parserjs.prototype.checkLocalExport = function(id) {
  // scope.functions must be empty as Module code is always strict.
  if (this.scopeStack[0].lexical.indexOf(id.name) === -1 &&
      this.scopeStack[0].var.indexOf(id.name) === -1) {
    this.undefinedExports[id.name] = id
  }
}

Parserjs.prototype.currentScope = function() {
  return this.scopeStack[this.scopeStack.length - 1]
}

Parserjs.prototype.currentVarScope = function() {
  for (let i = this.scopeStack.length - 1;; i--) {
    let scope = this.scopeStack[i]
    if (scope.flags & SCOPE_VAR) return scope
  }
}

// Could be useful for `this`, `new.target`, `super()`, `super.property`, and `super[property]`.
Parserjs.prototype.currentThisScope = function() {
  for (let i = this.scopeStack.length - 1;; i--) {
    let scope = this.scopeStack[i]
    if (scope.flags & SCOPE_VAR && !(scope.flags & SCOPE_ARROW)) return scope
  }
}

/** -------------------------------------------------------------------- */
// 여기부분은 node.js 를 가져온다.
/** -------------------------------------------------------------------- */
/*
import {Parser} from "./state.js"
import {SourceLocation} from "./locutil.js"

export class Node {
  constructor(parser, pos, loc) {
    this.type = ""
    this.start = pos
    this.end = 0
    if (parser.options.locations)
      this.loc = new SourceLocation(parser, loc)
    if (parser.options.directSourceFile)
      this.sourceFile = parser.options.directSourceFile
    if (parser.options.ranges)
      this.range = [pos, 0]
  }
}
*/
// Start an AST node, attaching a start offset.

function Node(parser, pos, loc) {

    this.type = "";
    this.start = pos;
    this.end = 0;
    
    //if (parser.options.locations)
    //  this.loc = new SourceLocation(parser, loc);
    //if (parser.options.directSourceFile)
    //  this.sourceFile = parser.options.directSourceFile;

    //if (parser.options.ranges)
     // this.range = [pos, 0];
}

Parserjs.prototype.startNode = function() {
  return new Node(this, this.start, this.startLoc)
}

Parserjs.prototype.startNodeAt = function(pos, loc) {
  return new Node(this, pos, loc)
}

// Finish an AST node, adding `type` and `end` properties.
function finishNodeAt(node, type, pos, loc) {
  node.type = type
  node.end = pos
  if (this.options.locations)
    node.loc.end = loc
  if (this.options.ranges)
    node.range[1] = pos
  return node
}

Parserjs.prototype.finishNode = function(node, type) {
  return finishNodeAt.call(this, node, type, this.lastTokEnd, this.lastTokEndLoc)
}

// Finish node at given position
Parserjs.prototype.finishNodeAt = function(node, type, pos, loc) {
  return finishNodeAt.call(this, node, type, pos, loc)
}

Parserjs.prototype.copyNode = function(node) {
  let newNode = new Node(this, node.start, this.startLoc)
  for (let prop in node) newNode[prop] = node[prop]
  return newNode
}

/** -------------------------------------------------------------------- */
// tokenize.js 를 가져온다.
/** -------------------------------------------------------------------- */

/*

import {isIdentifierStart, isIdentifierChar} from "./identifier.js"
import {types as tt, keywords as keywordTypes} from "./tokentype.js"
import {Parser} from "./state.js"
import {SourceLocation} from "./locutil.js"
import {RegExpValidationState} from "./regexp.js"
import {lineBreak, nextLineBreak, isNewLine, nonASCIIwhitespace} from "./whitespace.js"
import {codePointToString} from "./util.js"
*/


// Object type used to represent tokens. Note that normally, tokens
// simply exist as properties on the parser object. This is only
// used for the onToken callback and the external tokenizer.

/*


export class Token {
  constructor(p) {
    this.type = p.type
    this.value = p.value
    this.start = p.start
    this.end = p.end
    if (p.options.locations)
      this.loc = new SourceLocation(p, p.startLoc, p.endLoc)
    if (p.options.ranges)
      this.range = [p.start, p.end]
  }
}
*/

function Token (p) {
    this.type = p.type
    this.value = p.value
    this.start = p.start
    this.end = p.end
    if (p.options.locations)
      this.loc = new SourceLocation(p, p.startLoc, p.endLoc)
    if (p.options.ranges)
      this.range = [p.start, p.end]
}

//const pp = Parserjs.prototype;

var tt = TokenType;


Parserjs.prototype.next = function(ignoreEscapeSequenceInKeyword) {
  //if (!ignoreEscapeSequenceInKeyword && this.type.keyword && this.containsEsc)
  //  this.raiseRecoverable(this.start, "Escape sequence in keyword " + this.type.keyword)
  if (this.options.onToken)
    this.options.onToken(new Token(this))

  this.lastTokEnd = this.end
  this.lastTokStart = this.start
  this.lastTokEndLoc = this.endLoc
  this.lastTokStartLoc = this.startLoc
  this.nextToken()
}




Parserjs.prototype.getToken = function() {
  this.next()
  return new Token(this)
}

// If we're in an ES6 environment, make parsers iterable
if (typeof Symbol !== "undefined")
  Parserjs.prototype[Symbol.iterator] = function() {
    return {
      next: () => {
        let token = this.getToken()
        return {
          done: token.type === tt.eof,
          value: token
        }
      }
    }
  }

// 엄격 모드를 토글합니다. 현학적 테스트를 만족시키기 위해 다음 숫자나 문자열을 다시 읽습니다(`"use strict"; 010;`은 실패해야 함).
// 단일 토큰을 읽고 파서 개체의 토큰 관련 속성을 업데이트합니다.
Parserjs.prototype.nextToken = function() {
  let curContext = this.curContext()
  if (!curContext || !curContext.preserveSpace) this.skipSpace()

  console.log("curContext =>",curContext);
  this.start = this.pos
  if (this.options.locations) this.startLoc = this.curPosition()
  
  console.log("start => %d startLoc=>%d",this.start, this.startLoc);

  if (this.pos >= this.input.length) return this.finishToken(tt.eof)

  console.log("input => %s ",this.input);
  if (curContext.override) return curContext.override(this)
  else this.readToken(this.fullCharCodeAtPos())
}

// Called at the end of every token. Sets `end`, `val`, and
// maintains `context` and `exprAllowed`, and skips the space after
// the token, so that the next one's `start` will point at the
// right position.

Parserjs.prototype.finishToken = function(type, val) {
  this.end = this.pos
  if (this.options.locations) this.endLoc = this.curPosition()
  let prevType = this.type
  this.type = type
  this.value = val

  console.log("finishToken :",this.type, this.value);
  this.updateContext(prevType)
}


Parserjs.prototype.readToken = function(code) {
  // Identifier or keyword. '\uXXXX' sequences are allowed in
  // identifiers, so '\' also dispatches to that.
  
  console.log("code :",code);

  //if (isIdentifierStart(code, this.options.ecmaVersion >= 6) || code === 92 /* '\' */){
  //  console.log("this.readWord() :",this.readWord());
  //  return this.readWord();
  //}

  return this.getTokenFromCode(code)
}

Parserjs.prototype.fullCharCodeAtPos = function() {
  let code = this.input.charCodeAt(this.pos)
  if (code <= 0xd7ff || code >= 0xdc00) return code
  let next = this.input.charCodeAt(this.pos + 1)
  return next <= 0xdbff || next >= 0xe000 ? code : (code << 10) + next - 0x35fdc00
}

Parserjs.prototype.skipBlockComment = function() {
  let startLoc = this.options.onComment && this.curPosition()
  let start = this.pos, end = this.input.indexOf("*/", this.pos += 2)
  if (end === -1) this.raise(this.pos - 2, "Unterminated comment")
  this.pos = end + 2
  if (this.options.locations) {
    for (let nextBreak, pos = start; (nextBreak = nextLineBreak(this.input, pos, this.pos)) > -1;) {
      ++this.curLine
      pos = this.lineStart = nextBreak
    }
  }
  if (this.options.onComment)
    this.options.onComment(true, this.input.slice(start + 2, end), start, this.pos,
                           startLoc, this.curPosition())
}

Parserjs.prototype.skipLineComment = function(startSkip) {
  let start = this.pos
  let startLoc = this.options.onComment && this.curPosition()
  let ch = this.input.charCodeAt(this.pos += startSkip)
  while (this.pos < this.input.length && !isNewLine(ch)) {
    ch = this.input.charCodeAt(++this.pos)
  }
  if (this.options.onComment)
    this.options.onComment(false, this.input.slice(start + startSkip, this.pos), start, this.pos,
                           startLoc, this.curPosition())
}

// Called at the start of the parse and after every token. Skips
// whitespace and comments, and.

Parserjs.prototype.skipSpace = function() {
  loop: while (this.pos < this.input.length) {
    let ch = this.input.charCodeAt(this.pos)
    switch (ch) {
    case 32: case 160: // ' '
      ++this.pos
      break
    case 13:
      if (this.input.charCodeAt(this.pos + 1) === 10) {
        ++this.pos
      }
    case 10: case 8232: case 8233:
      ++this.pos
      if (this.options.locations) {
        ++this.curLine
        this.lineStart = this.pos
      }
      break
    case 47: // '/'
      switch (this.input.charCodeAt(this.pos + 1)) {
      case 42: // '*'
        this.skipBlockComment()
        break
      case 47:
        this.skipLineComment(2)
        break
      default:
        break loop
      }
      break
    default:
      if (ch > 8 && ch < 14 || ch >= 5760 && nonASCIIwhitespace.test(String.fromCharCode(ch))) {
        ++this.pos
      } else {
        break loop
      }
    }
  }
}


// ### Token reading

// This is the function that is called to fetch the next token. It
// is somewhat obscure, because it works in character codes rather
// than characters, and because operator parsing has been inlined
// into it.
//
// All in the name of speed.
//
Parserjs.prototype.readToken_dot = function() {
  let next = this.input.charCodeAt(this.pos + 1)
  if (next >= 48 && next <= 57) return this.readNumber(true)
  let next2 = this.input.charCodeAt(this.pos + 2)
  if (this.options.ecmaVersion >= 6 && next === 46 && next2 === 46) { // 46 = dot '.'
    this.pos += 3
    return this.finishToken(tt.ellipsis)
  } else {
    ++this.pos
    return this.finishToken(tt.dot)
  }
}

Parserjs.prototype.readToken_slash = function() { // '/'
  let next = this.input.charCodeAt(this.pos + 1)
  if (this.exprAllowed) { ++this.pos; return this.readRegexp() }
  if (next === 61) return this.finishOp(tt.assign, 2)
  return this.finishOp(tt.slash, 1)
}

Parserjs.prototype.readToken_mult_modulo_exp = function(code) { // '%*'
  let next = this.input.charCodeAt(this.pos + 1)
  let size = 1
  let tokentype = code === 42 ? tt.star : tt.modulo

  // exponentiation operator ** and **=
  if (this.options.ecmaVersion >= 7 && code === 42 && next === 42) {
    ++size
    tokentype = tt.starstar
    next = this.input.charCodeAt(this.pos + 2)
  }

  if (next === 61) return this.finishOp(tt.assign, size + 1)
  return this.finishOp(tokentype, size)
}

Parserjs.prototype.readToken_pipe_amp = function(code) { // '|&'
  let next = this.input.charCodeAt(this.pos + 1)
  if (next === code) {
    if (this.options.ecmaVersion >= 12) {
      let next2 = this.input.charCodeAt(this.pos + 2)
      if (next2 === 61) return this.finishOp(tt.assign, 3)
    }
    return this.finishOp(code === 124 ? tt.logicalOR : tt.logicalAND, 2)
  }
  if (next === 61) return this.finishOp(tt.assign, 2)
  return this.finishOp(code === 124 ? tt.bitwiseOR : tt.bitwiseAND, 1)
}

Parserjs.prototype.readToken_caret = function() { // '^'
  let next = this.input.charCodeAt(this.pos + 1)
  if (next === 61) return this.finishOp(tt.assign, 2)
  return this.finishOp(tt.bitwiseXOR, 1)
}

Parserjs.prototype.readToken_plus_min = function(code) { // '+-'
  let next = this.input.charCodeAt(this.pos + 1)
  if (next === code) {
    if (next === 45 && !this.inModule && this.input.charCodeAt(this.pos + 2) === 62 &&
        (this.lastTokEnd === 0 || lineBreak.test(this.input.slice(this.lastTokEnd, this.pos)))) {
      // A `-->` line comment
      this.skipLineComment(3)
      this.skipSpace()
      return this.nextToken()
    }
    return this.finishOp(tt.incDec, 2)
  }
  if (next === 61) return this.finishOp(tt.assign, 2)
  return this.finishOp(tt.plusMin, 1)
}

Parserjs.prototype.readToken_lt_gt = function(code) { // '<>'
  let next = this.input.charCodeAt(this.pos + 1)
  let size = 1
  if (next === code) {
    size = code === 62 && this.input.charCodeAt(this.pos + 2) === 62 ? 3 : 2
    if (this.input.charCodeAt(this.pos + size) === 61) return this.finishOp(tt.assign, size + 1)
    return this.finishOp(tt.bitShift, size)
  }
  if (next === 33 && code === 60 && !this.inModule && this.input.charCodeAt(this.pos + 2) === 45 &&
      this.input.charCodeAt(this.pos + 3) === 45) {
    // `<!--`, an XML-style comment that should be interpreted as a line comment
    this.skipLineComment(4)
    this.skipSpace()
    return this.nextToken()
  }
  if (next === 61) size = 2
  return this.finishOp(tt.relational, size)
}

Parserjs.prototype.readToken_eq_excl = function(code) { // '=!'
  let next = this.input.charCodeAt(this.pos + 1)
  if (next === 61) return this.finishOp(tt.equality, this.input.charCodeAt(this.pos + 2) === 61 ? 3 : 2)
  if (code === 61 && next === 62 && this.options.ecmaVersion >= 6) { // '=>'
    this.pos += 2
    return this.finishToken(tt.arrow)
  }
  return this.finishOp(code === 61 ? tt.eq : tt.prefix, 1)
}

Parserjs.prototype.readToken_question = function() { // '?'
  const ecmaVersion = this.options.ecmaVersion
  if (ecmaVersion >= 11) {
    let next = this.input.charCodeAt(this.pos + 1)
    if (next === 46) {
      let next2 = this.input.charCodeAt(this.pos + 2)
      if (next2 < 48 || next2 > 57) return this.finishOp(tt.questionDot, 2)
    }
    if (next === 63) {
      if (ecmaVersion >= 12) {
        let next2 = this.input.charCodeAt(this.pos + 2)
        if (next2 === 61) return this.finishOp(tt.assign, 3)
      }
      return this.finishOp(tt.coalesce, 2)
    }
  }
  return this.finishOp(tt.question, 1)
}

Parserjs.prototype.readToken_numberSign = function() { // '#'
  const ecmaVersion = this.options.ecmaVersion
  let code = 35 // '#'
  if (ecmaVersion >= 13) {
    ++this.pos
    code = this.fullCharCodeAtPos()
    if (isIdentifierStart(code, true) || code === 92 /* '\' */) {
      return this.finishToken(tt.privateId, this.readWord1())
    }
  }

  this.raise(this.pos, "Unexpected character '" + codePointToString(code) + "'")
}

Parserjs.prototype.getTokenFromCode = function(code) {
  console.log("getTokenFromCode>>>>>", this.readString(code));
  switch (code) {
  // The interpretation of a dot depends on whether it is followed 점의 해석은 다음에 따라 다릅니다.
  // by a digit or another two dots.  뒤에 숫자가 오든 아니면 또 다른 두 개의 점이 오든.
  case 46: // '.'
    return this.readToken_dot()

  // Punctuation tokens.
  case 40: ++this.pos; return this.finishToken(tt.parenL)
  case 41: ++this.pos; return this.finishToken(tt.parenR)
  case 59: ++this.pos; return this.finishToken(tt.semi)
  case 44: ++this.pos; return this.finishToken(tt.comma)
  case 91: ++this.pos; return this.finishToken(tt.bracketL)
  case 93: ++this.pos; return this.finishToken(tt.bracketR)
  case 123: ++this.pos; return this.finishToken(tt.braceL)
  case 125: ++this.pos; return this.finishToken(tt.braceR)
  case 58: ++this.pos; return this.finishToken(tt.colon)

  case 96: // '`'
    if (this.options.ecmaVersion < 6) break
    ++this.pos
    return this.finishToken(tt.backQuote)

  case 48: // '0'
    let next = this.input.charCodeAt(this.pos + 1)
    if (next === 120 || next === 88) return this.readRadixNumber(16) // '0x', '0X' - hex number
    if (this.options.ecmaVersion >= 6) {
      if (next === 111 || next === 79) return this.readRadixNumber(8) // '0o', '0O' - octal number
      if (next === 98 || next === 66) return this.readRadixNumber(2) // '0b', '0B' - binary number
    }

  // Anything else beginning with a digit is an integer, octal
  // number, or float.
  case 49: case 50: case 51: case 52: case 53: case 54: case 55: case 56: case 57: // 1-9
    return this.readNumber(false)

  // Quotes produce strings.
  case 34: case 39: // '"', "'"
    console.log("this.readString(code)=>", this.readString(code));
    return this.readString(code);

  // Operators are parsed inline in tiny state machines. '=' (61) is
  // often referred to. `finishOp` simply skips the amount of
  // characters it is given as second argument, and returns a token
  // of the type given by its first argument.
  case 47: // '/'
    return this.readToken_slash()

  case 37: case 42: // '%*'
    return this.readToken_mult_modulo_exp(code)

  case 124: case 38: // '|&'
    return this.readToken_pipe_amp(code)

  case 94: // '^'
    return this.readToken_caret()

  case 43: case 45: // '+-'
    return this.readToken_plus_min(code)

  case 60: case 62: // '<>'
    return this.readToken_lt_gt(code)

  case 61: case 33: // '=!'
    return this.readToken_eq_excl(code)

  case 63: // '?'
    return this.readToken_question()

  case 126: // '~'
    return this.finishOp(tt.prefix, 1)

  case 35: // '#'
    return this.readToken_numberSign()
  }

  this.raise(this.pos, "Unexpected character '" + codePointToString(code) + "'")
}

Parserjs.prototype.finishOp = function(type, size) {
  let str = this.input.slice(this.pos, this.pos + size)
  this.pos += size
  return this.finishToken(type, str)
}

Parserjs.prototype.readRegexp = function() {
  let escaped, inClass, start = this.pos
  for (;;) {
    if (this.pos >= this.input.length) this.raise(start, "Unterminated regular expression")
    let ch = this.input.charAt(this.pos)
    if (lineBreak.test(ch)) this.raise(start, "Unterminated regular expression")
    if (!escaped) {
      if (ch === "[") inClass = true
      else if (ch === "]" && inClass) inClass = false
      else if (ch === "/" && !inClass) break
      escaped = ch === "\\"
    } else escaped = false
    ++this.pos
  }
  let pattern = this.input.slice(start, this.pos)
  ++this.pos
  let flagsStart = this.pos
  let flags = this.readWord1()
  if (this.containsEsc) this.unexpected(flagsStart)

  // Validate pattern
  const state = this.regexpState || (this.regexpState = new RegExpValidationState(this))
  state.reset(start, pattern, flags)
  this.validateRegExpFlags(state)
  this.validateRegExpPattern(state)

  // Create Literal#value property value.
  let value = null
  try {
    value = new RegExp(pattern, flags)
  } catch (e) {
    // ESTree requires null if it failed to instantiate RegExp object.
    // https://github.com/estree/estree/blob/a27003adf4fd7bfad44de9cef372a2eacd527b1c/es5.md#regexpliteral
  }

  return this.finishToken(tt.regexp, {pattern, flags, value})
}

// Read an integer in the given radix. Return null if zero digits
// were read, the integer value otherwise. When `len` is given, this
// will return `null` unless the integer has exactly `len` digits.

Parserjs.prototype.readInt = function(radix, len, maybeLegacyOctalNumericLiteral) {
  // `len` is used for character escape sequences. In that case, disallow separators.
  const allowSeparators = this.options.ecmaVersion >= 12 && len === undefined

  // `maybeLegacyOctalNumericLiteral` is true if it doesn't have prefix (0x,0o,0b)
  // and isn't fraction part nor exponent part. In that case, if the first digit
  // is zero then disallow separators.
  const isLegacyOctalNumericLiteral = maybeLegacyOctalNumericLiteral && this.input.charCodeAt(this.pos) === 48

  let start = this.pos, total = 0, lastCode = 0
  for (let i = 0, e = len == null ? Infinity : len; i < e; ++i, ++this.pos) {
    let code = this.input.charCodeAt(this.pos), val

    if (allowSeparators && code === 95) {
      if (isLegacyOctalNumericLiteral) this.raiseRecoverable(this.pos, "Numeric separator is not allowed in legacy octal numeric literals")
      if (lastCode === 95) this.raiseRecoverable(this.pos, "Numeric separator must be exactly one underscore")
      if (i === 0) this.raiseRecoverable(this.pos, "Numeric separator is not allowed at the first of digits")
      lastCode = code
      continue
    }

    if (code >= 97) val = code - 97 + 10 // a
    else if (code >= 65) val = code - 65 + 10 // A
    else if (code >= 48 && code <= 57) val = code - 48 // 0-9
    else val = Infinity
    if (val >= radix) break
    lastCode = code
    total = total * radix + val
  }

  if (allowSeparators && lastCode === 95) this.raiseRecoverable(this.pos - 1, "Numeric separator is not allowed at the last of digits")
  if (this.pos === start || len != null && this.pos - start !== len) return null

  return total
}

function stringToNumber(str, isLegacyOctalNumericLiteral) {
  if (isLegacyOctalNumericLiteral) {
    return parseInt(str, 8)
  }

  // `parseFloat(value)` stops parsing at the first numeric separator then returns a wrong value.
  return parseFloat(str.replace(/_/g, ""))
}

function stringToBigInt(str) {
  if (typeof BigInt !== "function") {
    return null
  }

  // `BigInt(value)` throws syntax error if the string contains numeric separators.
  return BigInt(str.replace(/_/g, ""))
}

Parserjs.prototype.readRadixNumber = function(radix) {
  let start = this.pos
  this.pos += 2 // 0x
  let val = this.readInt(radix)
  if (val == null) this.raise(this.start + 2, "Expected number in radix " + radix)
  if (this.options.ecmaVersion >= 11 && this.input.charCodeAt(this.pos) === 110) {
    val = stringToBigInt(this.input.slice(start, this.pos))
    ++this.pos
  } else if (isIdentifierStart(this.fullCharCodeAtPos())) this.raise(this.pos, "Identifier directly after number")
  return this.finishToken(tt.num, val)
}

// Read an integer, octal integer, or floating-point number.

Parserjs.prototype.readNumber = function(startsWithDot) {
  let start = this.pos
  if (!startsWithDot && this.readInt(10, undefined, true) === null) this.raise(start, "Invalid number")
  let octal = this.pos - start >= 2 && this.input.charCodeAt(start) === 48
  if (octal && this.strict) this.raise(start, "Invalid number")
  let next = this.input.charCodeAt(this.pos)
  if (!octal && !startsWithDot && this.options.ecmaVersion >= 11 && next === 110) {
    let val = stringToBigInt(this.input.slice(start, this.pos))
    ++this.pos
    if (isIdentifierStart(this.fullCharCodeAtPos())) this.raise(this.pos, "Identifier directly after number")
    return this.finishToken(tt.num, val)
  }
  if (octal && /[89]/.test(this.input.slice(start, this.pos))) octal = false
  if (next === 46 && !octal) { // '.'
    ++this.pos
    this.readInt(10)
    next = this.input.charCodeAt(this.pos)
  }
  if ((next === 69 || next === 101) && !octal) { // 'eE'
    next = this.input.charCodeAt(++this.pos)
    if (next === 43 || next === 45) ++this.pos // '+-'
    if (this.readInt(10) === null) this.raise(start, "Invalid number")
  }
  if (isIdentifierStart(this.fullCharCodeAtPos())) this.raise(this.pos, "Identifier directly after number")

  let val = stringToNumber(this.input.slice(start, this.pos), octal)
  return this.finishToken(tt.num, val)
}

// Read a string value, interpreting backslash-escapes.

Parserjs.prototype.readCodePoint = function() {
  let ch = this.input.charCodeAt(this.pos), code

  if (ch === 123) { // '{'
    if (this.options.ecmaVersion < 6) this.unexpected()
    let codePos = ++this.pos
    code = this.readHexChar(this.input.indexOf("}", this.pos) - this.pos)
    ++this.pos
    if (code > 0x10FFFF) this.invalidStringToken(codePos, "Code point out of bounds")
  } else {
    code = this.readHexChar(4)
  }
  return code
}

Parserjs.prototype.readString = function(quote) {
  let out = "", chunkStart = ++this.pos
  for (;;) {
    if (this.pos >= this.input.length) this.raise(this.start, "Unterminated string constant")
    let ch = this.input.charCodeAt(this.pos)
    if (ch === quote) break
    if (ch === 92) { // '\'
      out += this.input.slice(chunkStart, this.pos)
      out += this.readEscapedChar(false)
      chunkStart = this.pos
    } else if (ch === 0x2028 || ch === 0x2029) {
      if (this.options.ecmaVersion < 10) this.raise(this.start, "Unterminated string constant")
      ++this.pos
      if (this.options.locations) {
        this.curLine++
        this.lineStart = this.pos
      }
    } else {
      if (isNewLine(ch)) this.raise(this.start, "Unterminated string constant")
      ++this.pos
    }
  }
  out += this.input.slice(chunkStart, this.pos++)
  return this.finishToken(tt.string, out)
}

// Reads template string tokens.

const INVALID_TEMPLATE_ESCAPE_ERROR = {}

Parserjs.prototype.tryReadTemplateToken = function() {
  this.inTemplateElement = true
  try {
    this.readTmplToken()
  } catch (err) {
    if (err === INVALID_TEMPLATE_ESCAPE_ERROR) {
      this.readInvalidTemplateToken()
    } else {
      throw err
    }
  }

  this.inTemplateElement = false
}

Parserjs.prototype.invalidStringToken = function(position, message) {
  if (this.inTemplateElement && this.options.ecmaVersion >= 9) {
    throw INVALID_TEMPLATE_ESCAPE_ERROR
  } else {
    this.raise(position, message)
  }
}

Parserjs.prototype.readTmplToken = function() {
  let out = "", chunkStart = this.pos
  for (;;) {
    if (this.pos >= this.input.length) this.raise(this.start, "Unterminated template")
    let ch = this.input.charCodeAt(this.pos)
    if (ch === 96 || ch === 36 && this.input.charCodeAt(this.pos + 1) === 123) { // '`', '${'
      if (this.pos === this.start && (this.type === tt.template || this.type === tt.invalidTemplate)) {
        if (ch === 36) {
          this.pos += 2
          return this.finishToken(tt.dollarBraceL)
        } else {
          ++this.pos
          return this.finishToken(tt.backQuote)
        }
      }
      out += this.input.slice(chunkStart, this.pos)
      return this.finishToken(tt.template, out)
    }
    if (ch === 92) { // '\'
      out += this.input.slice(chunkStart, this.pos)
      out += this.readEscapedChar(true)
      chunkStart = this.pos
    } else if (isNewLine(ch)) {
      out += this.input.slice(chunkStart, this.pos)
      ++this.pos
      switch (ch) {
      case 13:
        if (this.input.charCodeAt(this.pos) === 10) ++this.pos
      case 10:
        out += "\n"
        break
      default:
        out += String.fromCharCode(ch)
        break
      }
      if (this.options.locations) {
        ++this.curLine
        this.lineStart = this.pos
      }
      chunkStart = this.pos
    } else {
      ++this.pos
    }
  }
}

// Reads a template token to search for the end, without validating any escape sequences
Parserjs.prototype.readInvalidTemplateToken = function() {
  for (; this.pos < this.input.length; this.pos++) {
    switch (this.input[this.pos]) {
    case "\\":
      ++this.pos
      break

    case "$":
      if (this.input[this.pos + 1] !== "{") {
        break
      }

    // falls through
    case "`":
      return this.finishToken(tt.invalidTemplate, this.input.slice(this.start, this.pos))

    // no default
    }
  }
  this.raise(this.start, "Unterminated template")
}

// Used to read escaped characters

Parserjs.prototype.readEscapedChar = function(inTemplate) {
  let ch = this.input.charCodeAt(++this.pos)
  ++this.pos
  switch (ch) {
  case 110: return "\n" // 'n' -> '\n'
  case 114: return "\r" // 'r' -> '\r'
  case 120: return String.fromCharCode(this.readHexChar(2)) // 'x'
  case 117: return codePointToString(this.readCodePoint()) // 'u'
  case 116: return "\t" // 't' -> '\t'
  case 98: return "\b" // 'b' -> '\b'
  case 118: return "\u000b" // 'v' -> '\u000b'
  case 102: return "\f" // 'f' -> '\f'
  case 13: if (this.input.charCodeAt(this.pos) === 10) ++this.pos // '\r\n'
  case 10: // ' \n'
    if (this.options.locations) { this.lineStart = this.pos; ++this.curLine }
    return ""
  case 56:
  case 57:
    if (this.strict) {
      this.invalidStringToken(
        this.pos - 1,
        "Invalid escape sequence"
      )
    }
    if (inTemplate) {
      const codePos = this.pos - 1

      this.invalidStringToken(
        codePos,
        "Invalid escape sequence in template string"
      )
    }
  default:
    if (ch >= 48 && ch <= 55) {
      let octalStr = this.input.substr(this.pos - 1, 3).match(/^[0-7]+/)[0]
      let octal = parseInt(octalStr, 8)
      if (octal > 255) {
        octalStr = octalStr.slice(0, -1)
        octal = parseInt(octalStr, 8)
      }
      this.pos += octalStr.length - 1
      ch = this.input.charCodeAt(this.pos)
      if ((octalStr !== "0" || ch === 56 || ch === 57) && (this.strict || inTemplate)) {
        this.invalidStringToken(
          this.pos - 1 - octalStr.length,
          inTemplate
            ? "Octal literal in template string"
            : "Octal literal in strict mode"
        )
      }
      return String.fromCharCode(octal)
    }
    if (isNewLine(ch)) {
      // Unicode new line characters after \ get removed from output in both
      // template literals and strings
      return ""
    }
    return String.fromCharCode(ch)
  }
}

// Used to read character escape sequences ('\x', '\u', '\U').

Parserjs.prototype.readHexChar = function(len) {
  let codePos = this.pos
  let n = this.readInt(16, len)
  if (n === null) this.invalidStringToken(codePos, "Bad character escape sequence")
  return n
}

// Read an identifier, and return it as a string. Sets `this.containsEsc`
// to whether the word contained a '\u' escape.
//
// Incrementally adds only escaped chars, adding other chunks as-is
// as a micro-optimization.

Parserjs.prototype.readWord1 = function() {
  this.containsEsc = false
  let word = "", first = true, chunkStart = this.pos
  let astral = this.options.ecmaVersion >= 6
  while (this.pos < this.input.length) {
    let ch = this.fullCharCodeAtPos()
    if (isIdentifierChar(ch, astral)) {
      this.pos += ch <= 0xffff ? 1 : 2
    } else if (ch === 92) { // "\"
      this.containsEsc = true
      word += this.input.slice(chunkStart, this.pos)
      let escStart = this.pos
      if (this.input.charCodeAt(++this.pos) !== 117) // "u"
        this.invalidStringToken(this.pos, "Expecting Unicode escape sequence \\uXXXX")
      ++this.pos
      let esc = this.readCodePoint()
      if (!(first ? isIdentifierStart : isIdentifierChar)(esc, astral))
        this.invalidStringToken(escStart, "Invalid Unicode escape")
      word += codePointToString(esc)
      chunkStart = this.pos
    } else {
      break
    }
    first = false
  }
  return word + this.input.slice(chunkStart, this.pos)
}

// Read an identifier or keyword token. Will check for reserved
// words when necessary.

Parserjs.prototype.readWord = function() {
  let word = this.readWord1()
  let type = tt.name
  if (this.keywords.test(word)) {
    type = keywordTypes[word]
  }
  return this.finishToken(type, word)
}
/** -------------------------------------------------------------------- */
// 여기부분은 expression.js 를 가져온다.
/** -------------------------------------------------------------------- */
// A recursive descent parser operates by defining functions for all
// syntactic elements, and recursively calling those, each function
// advancing the input stream and returning an AST node. Precedence
// of constructs (for example, the fact that `!x[1]` means `!(x[1])`
// instead of `(!x)[1]` is handled by the fact that the parser
// function that parses unary prefix operators is called first, and
// in turn calls the function that parses `[]` subscripts ? that
// way, it'll receive the node for `x[1]` already parsed, and wraps
// *that* in the unary operator node.
//
// Acorn uses an [operator precedence parser][opp] to handle binary
// operator precedence, because it is much more compact than using
// the technique outlined above, which uses different, nesting
// functions to specify precedence, for all of the ten binary
// precedence levels that JavaScript defines.
//
// [opp]: http://en.wikipedia.org/wiki/Operator-precedence_parser

/*
import {types as tt} from "./tokentype.js"
import {types as tokenCtxTypes} from "./tokencontext.js"
import {Parser} from "./state.js"
import {DestructuringErrors} from "./parseutil.js"
import {lineBreak} from "./whitespace.js"
import {functionFlags, SCOPE_ARROW, SCOPE_SUPER, SCOPE_DIRECT_SUPER, BIND_OUTSIDE, BIND_VAR} from "./scopeflags.js"

const pp = Parser.prototype
*/
// Check if property name clashes with already added.
// Object/class getters and setters are not allowed to clash ?
// either with each other or with an init property ? and in
// strict mode, init properties are also not allowed to be repeated.

Parserjs.prototype.checkPropClash = function(prop, propHash, refDestructuringErrors) {
  if (this.options.ecmaVersion >= 9 && prop.type === "SpreadElement")
    return
  if (this.options.ecmaVersion >= 6 && (prop.computed || prop.method || prop.shorthand))
    return
  let {key} = prop, name
  switch (key.type) {
  case "Identifier": name = key.name; break
  case "Literal": name = String(key.value); break
  default: return
  }
  let {kind} = prop
  if (this.options.ecmaVersion >= 6) {
    if (name === "__proto__" && kind === "init") {
      if (propHash.proto) {
        if (refDestructuringErrors) {
          if (refDestructuringErrors.doubleProto < 0) {
            refDestructuringErrors.doubleProto = key.start
          }
        } else {
          this.raiseRecoverable(key.start, "Redefinition of __proto__ property")
        }
      }
      propHash.proto = true
    }
    return
  }
  name = "$" + name
  let other = propHash[name]
  if (other) {
    let redefinition
    if (kind === "init") {
      redefinition = this.strict && other.init || other.get || other.set
    } else {
      redefinition = other.init || other[kind]
    }
    if (redefinition)
      this.raiseRecoverable(key.start, "Redefinition of property")
  } else {
    other = propHash[name] = {
      init: false,
      get: false,
      set: false
    }
  }
  other[kind] = true
}

// ### Expression parsing

// These nest, from the most general expression type at the top to
// 'atomic', nondivisible expression types at the bottom. Most of
// the functions will simply let the function(s) below them parse,
// and, *if* the syntactic construct they handle is present, wrap
// the AST node that the inner parser gave them in another node.

// Parse a full expression. The optional arguments are used to
// forbid the `in` operator (in for loops initalization expressions)
// and provide reference for storing '=' operator inside shorthand
// property assignment in contexts where both object expression
// and object pattern might appear (so it's possible to raise
// delayed syntax error at correct position).

Parserjs.prototype.parseExpression = function(forInit, refDestructuringErrors) {
  let startPos = this.start, startLoc = this.startLoc
  let expr = this.parseMaybeAssign(forInit, refDestructuringErrors)
  if (this.type === tt.comma) {
    let node = this.startNodeAt(startPos, startLoc)
    node.expressions = [expr]
    while (this.eat(tt.comma)) node.expressions.push(this.parseMaybeAssign(forInit, refDestructuringErrors))
    return this.finishNode(node, "SequenceExpression")
  }
  return expr
}

// Parse an assignment expression. This includes applications of
// operators like `+=`.

Parserjs.prototype.parseMaybeAssign = function(forInit, refDestructuringErrors, afterLeftParse) {
  if (this.isContextual("yield")) {
    if (this.inGenerator) return this.parseYield(forInit)
    // The tokenizer will assume an expression is allowed after
    // `yield`, but this isn't that kind of yield
    else this.exprAllowed = false
  }

  let ownDestructuringErrors = false, oldParenAssign = -1, oldTrailingComma = -1, oldDoubleProto = -1
  if (refDestructuringErrors) {
    oldParenAssign = refDestructuringErrors.parenthesizedAssign
    oldTrailingComma = refDestructuringErrors.trailingComma
    oldDoubleProto = refDestructuringErrors.doubleProto
    refDestructuringErrors.parenthesizedAssign = refDestructuringErrors.trailingComma = -1
  } else {
    refDestructuringErrors = new DestructuringErrors
    ownDestructuringErrors = true
  }

  let startPos = this.start, startLoc = this.startLoc
  if (this.type === tt.parenL || this.type === tt.name) {
    this.potentialArrowAt = this.start
    this.potentialArrowInForAwait = forInit === "await"
  }
  let left = this.parseMaybeConditional(forInit, refDestructuringErrors)
  if (afterLeftParse) left = afterLeftParse.call(this, left, startPos, startLoc)
  if (this.type.isAssign) {
    let node = this.startNodeAt(startPos, startLoc)
    node.operator = this.value
    if (this.type === tt.eq)
      left = this.toAssignable(left, false, refDestructuringErrors)
    if (!ownDestructuringErrors) {
      refDestructuringErrors.parenthesizedAssign = refDestructuringErrors.trailingComma = refDestructuringErrors.doubleProto = -1
    }
    if (refDestructuringErrors.shorthandAssign >= left.start)
      refDestructuringErrors.shorthandAssign = -1 // reset because shorthand default was used correctly
    if (this.type === tt.eq)
      this.checkLValPattern(left)
    else
      this.checkLValSimple(left)
    node.left = left
    this.next()
    node.right = this.parseMaybeAssign(forInit)
    if (oldDoubleProto > -1) refDestructuringErrors.doubleProto = oldDoubleProto
    return this.finishNode(node, "AssignmentExpression")
  } else {
    if (ownDestructuringErrors) this.checkExpressionErrors(refDestructuringErrors, true)
  }
  if (oldParenAssign > -1) refDestructuringErrors.parenthesizedAssign = oldParenAssign
  if (oldTrailingComma > -1) refDestructuringErrors.trailingComma = oldTrailingComma
  return left
}

// Parse a ternary conditional (`?:`) operator.

Parserjs.prototype.parseMaybeConditional = function(forInit, refDestructuringErrors) {
  let startPos = this.start, startLoc = this.startLoc
  let expr = this.parseExprOps(forInit, refDestructuringErrors)
  if (this.checkExpressionErrors(refDestructuringErrors)) return expr
  if (this.eat(tt.question)) {
    let node = this.startNodeAt(startPos, startLoc)
    node.test = expr
    node.consequent = this.parseMaybeAssign()
    this.expect(tt.colon)
    node.alternate = this.parseMaybeAssign(forInit)
    return this.finishNode(node, "ConditionalExpression")
  }
  return expr
}

// Start the precedence parser.

Parserjs.prototype.parseExprOps = function(forInit, refDestructuringErrors) {
/*
  let startPos = this.start, startLoc = this.startLoc
  let expr = this.parseMaybeUnary(refDestructuringErrors, false, false, forInit)
  if (this.checkExpressionErrors(refDestructuringErrors)) return expr
  return expr.start === startPos && expr.type === "ArrowFunctionExpression" ? expr : this.parseExprOp(expr, startPos, startLoc, -1, forInit)
  */
}

// Parse binary operators with the operator precedence parsing
// algorithm. `left` is the left-hand side of the operator.
// `minPrec` provides context that allows the function to stop and
// defer further parser to one of its callers when it encounters an
// operator that has a lower precedence than the set it is parsing.

Parserjs.prototype.parseExprOp = function(left, leftStartPos, leftStartLoc, minPrec, forInit) {
  let prec = this.type.binop
  if (prec != null && (!forInit || this.type !== tt._in)) {
    if (prec > minPrec) {
      let logical = this.type === tt.logicalOR || this.type === tt.logicalAND
      let coalesce = this.type === tt.coalesce
      if (coalesce) {
        // Handle the precedence of `tt.coalesce` as equal to the range of logical expressions.
        // In other words, `node.right` shouldn't contain logical expressions in order to check the mixed error.
        prec = tt.logicalAND.binop
      }
      let op = this.value
      this.next()
      let startPos = this.start, startLoc = this.startLoc
      let right = this.parseExprOp(this.parseMaybeUnary(null, false, false, forInit), startPos, startLoc, prec, forInit)
      let node = this.buildBinary(leftStartPos, leftStartLoc, left, right, op, logical || coalesce)
      if ((logical && this.type === tt.coalesce) || (coalesce && (this.type === tt.logicalOR || this.type === tt.logicalAND))) {
        this.raiseRecoverable(this.start, "Logical expressions and coalesce expressions cannot be mixed. Wrap either by parentheses")
      }
      return this.parseExprOp(node, leftStartPos, leftStartLoc, minPrec, forInit)
    }
  }
  return left
}

Parserjs.prototype.buildBinary = function(startPos, startLoc, left, right, op, logical) {
  if (right.type === "PrivateIdentifier") this.raise(right.start, "Private identifier can only be left side of binary expression")
  let node = this.startNodeAt(startPos, startLoc)
  node.left = left
  node.operator = op
  node.right = right
  return this.finishNode(node, logical ? "LogicalExpression" : "BinaryExpression")
}

// Parse unary operators, both prefix and postfix.

Parserjs.prototype.parseMaybeUnary = function(refDestructuringErrors, sawUnary, incDec, forInit) {
/*
  let startPos = this.start,
      startLoc = this.startLoc,
      expr;
  if (this.isContextual("await") && this.canAwait) {
    expr = this.parseAwait(forInit)
    sawUnary = true
  //} else if (this.type.prefix) {
  } else if (tt.prefix) {
    let node = this.startNode(), update = this.type === tt.incDec
    node.operator = this.value
    node.prefix = true
    this.next()
    node.argument = this.parseMaybeUnary(null, true, update, forInit)
    this.checkExpressionErrors(refDestructuringErrors, true)
    if (update) this.checkLValSimple(node.argument)
    else if (this.strict && node.operator === "delete" &&
             node.argument.type === "Identifier")
      this.raiseRecoverable(node.start, "Deleting local variable in strict mode")
    else if (node.operator === "delete" && isPrivateFieldAccess(node.argument))
      this.raiseRecoverable(node.start, "Private fields can not be deleted")
    else sawUnary = true
    expr = this.finishNode(node, update ? "UpdateExpression" : "UnaryExpression")
  } else if (!sawUnary && this.type === tt.privateId) {
    if (forInit || this.privateNameStack.length === 0) this.unexpected()
    expr = this.parsePrivateIdent()
    // only could be private fields in 'in', such as #x in obj
    if (this.type !== tt._in) this.unexpected()
  } else {
    expr = this.parseExprSubscripts(refDestructuringErrors, forInit)
    if (this.checkExpressionErrors(refDestructuringErrors)) return expr
    while (this.type.postfix && !this.canInsertSemicolon()) {
      let node = this.startNodeAt(startPos, startLoc)
      node.operator = this.value
      node.prefix = false
      node.argument = expr
      this.checkLValSimple(expr)
      this.next()
      expr = this.finishNode(node, "UpdateExpression")
    }
  }

  if (!incDec && this.eat(tt.starstar)) {
    if (sawUnary)
      this.unexpected(this.lastTokStart)
    else
      return this.buildBinary(startPos, startLoc, expr, this.parseMaybeUnary(null, false, false, forInit), "**", false)
  } else {
    return expr
  }
  */
}

function isPrivateFieldAccess(node) {
  return (
    node.type === "MemberExpression" && node.property.type === "PrivateIdentifier" ||
    node.type === "ChainExpression" && isPrivateFieldAccess(node.expression)
  )
}

// Parse call, dot, and `[]`-subscript expressions.

Parserjs.prototype.parseExprSubscripts = function(refDestructuringErrors, forInit) {
  let startPos = this.start, startLoc = this.startLoc
  let expr = this.parseExprAtom(refDestructuringErrors, forInit)
  if (expr.type === "ArrowFunctionExpression" && this.input.slice(this.lastTokStart, this.lastTokEnd) !== ")")
    return expr
  let result = this.parseSubscripts(expr, startPos, startLoc, false, forInit)
  if (refDestructuringErrors && result.type === "MemberExpression") {
    if (refDestructuringErrors.parenthesizedAssign >= result.start) refDestructuringErrors.parenthesizedAssign = -1
    if (refDestructuringErrors.parenthesizedBind >= result.start) refDestructuringErrors.parenthesizedBind = -1
    if (refDestructuringErrors.trailingComma >= result.start) refDestructuringErrors.trailingComma = -1
  }
  return result
}

Parserjs.prototype.parseSubscripts = function(base, startPos, startLoc, noCalls, forInit) {
  let maybeAsyncArrow = this.options.ecmaVersion >= 8 && base.type === "Identifier" && base.name === "async" &&
      this.lastTokEnd === base.end && !this.canInsertSemicolon() && base.end - base.start === 5 &&
      this.potentialArrowAt === base.start
  let optionalChained = false

  while (true) {
    let element = this.parseSubscript(base, startPos, startLoc, noCalls, maybeAsyncArrow, optionalChained, forInit)

    if (element.optional) optionalChained = true
    if (element === base || element.type === "ArrowFunctionExpression") {
      if (optionalChained) {
        const chainNode = this.startNodeAt(startPos, startLoc)
        chainNode.expression = element
        element = this.finishNode(chainNode, "ChainExpression")
      }
      return element
    }

    base = element
  }
}

Parserjs.prototype.parseSubscript = function(base, startPos, startLoc, noCalls, maybeAsyncArrow, optionalChained, forInit) {
  let optionalSupported = this.options.ecmaVersion >= 11
  let optional = optionalSupported && this.eat(tt.questionDot)
  if (noCalls && optional) this.raise(this.lastTokStart, "Optional chaining cannot appear in the callee of new expressions")

  let computed = this.eat(tt.bracketL)
  if (computed || (optional && this.type !== tt.parenL && this.type !== tt.backQuote) || this.eat(tt.dot)) {
    let node = this.startNodeAt(startPos, startLoc)
    node.object = base
    if (computed) {
      node.property = this.parseExpression()
      this.expect(tt.bracketR)
    } else if (this.type === tt.privateId && base.type !== "Super") {
      node.property = this.parsePrivateIdent()
    } else {
      node.property = this.parseIdent(this.options.allowReserved !== "never")
    }
    node.computed = !!computed
    if (optionalSupported) {
      node.optional = optional
    }
    base = this.finishNode(node, "MemberExpression")
  } else if (!noCalls && this.eat(tt.parenL)) {
    let refDestructuringErrors = new DestructuringErrors, oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldAwaitIdentPos = this.awaitIdentPos
    this.yieldPos = 0
    this.awaitPos = 0
    this.awaitIdentPos = 0
    let exprList = this.parseExprList(tt.parenR, this.options.ecmaVersion >= 8, false, refDestructuringErrors)
    if (maybeAsyncArrow && !optional && !this.canInsertSemicolon() && this.eat(tt.arrow)) {
      this.checkPatternErrors(refDestructuringErrors, false)
      this.checkYieldAwaitInDefaultParams()
      if (this.awaitIdentPos > 0)
        this.raise(this.awaitIdentPos, "Cannot use 'await' as identifier inside an async function")
      this.yieldPos = oldYieldPos
      this.awaitPos = oldAwaitPos
      this.awaitIdentPos = oldAwaitIdentPos
      return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), exprList, true, forInit)
    }
    this.checkExpressionErrors(refDestructuringErrors, true)
    this.yieldPos = oldYieldPos || this.yieldPos
    this.awaitPos = oldAwaitPos || this.awaitPos
    this.awaitIdentPos = oldAwaitIdentPos || this.awaitIdentPos
    let node = this.startNodeAt(startPos, startLoc)
    node.callee = base
    node.arguments = exprList
    if (optionalSupported) {
      node.optional = optional
    }
    base = this.finishNode(node, "CallExpression")
  } else if (this.type === tt.backQuote) {
    if (optional || optionalChained) {
      this.raise(this.start, "Optional chaining cannot appear in the tag of tagged template expressions")
    }
    let node = this.startNodeAt(startPos, startLoc)
    node.tag = base
    node.quasi = this.parseTemplate({isTagged: true})
    base = this.finishNode(node, "TaggedTemplateExpression")
  }
  return base
}

// Parse an atomic expression ? either a single token that is an
// expression, an expression started by a keyword like `function` or
// `new`, or an expression wrapped in punctuation like `()`, `[]`,
// or `{}`.

Parserjs.prototype.parseExprAtom = function(refDestructuringErrors, forInit) {
  // If a division operator appears in an expression position, the
  // tokenizer got confused, and we force it to read a regexp instead.
  if (this.type === tt.slash) this.readRegexp()

  let node, canBeArrow = this.potentialArrowAt === this.start
  switch (this.type) {
  case tt._super:
    if (!this.allowSuper)
      this.raise(this.start, "'super' keyword outside a method")
    node = this.startNode()
    this.next()
    if (this.type === tt.parenL && !this.allowDirectSuper)
      this.raise(node.start, "super() call outside constructor of a subclass")
    // The `super` keyword can appear at below:
    // SuperProperty:
    //     super [ Expression ]
    //     super . IdentifierName
    // SuperCall:
    //     super ( Arguments )
    if (this.type !== tt.dot && this.type !== tt.bracketL && this.type !== tt.parenL)
      this.unexpected()
    return this.finishNode(node, "Super")

  case tt._this:
    node = this.startNode()
    this.next()
    return this.finishNode(node, "ThisExpression")

  case tt.name:
    let startPos = this.start, startLoc = this.startLoc, containsEsc = this.containsEsc
    let id = this.parseIdent(false)
    if (this.options.ecmaVersion >= 8 && !containsEsc && id.name === "async" && !this.canInsertSemicolon() && this.eat(tt._function)) {
      this.overrideContext(tokenCtxTypes.f_expr)
      return this.parseFunction(this.startNodeAt(startPos, startLoc), 0, false, true, forInit)
    }
    if (canBeArrow && !this.canInsertSemicolon()) {
      if (this.eat(tt.arrow))
        return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), [id], false, forInit)
      if (this.options.ecmaVersion >= 8 && id.name === "async" && this.type === tt.name && !containsEsc &&
          (!this.potentialArrowInForAwait || this.value !== "of" || this.containsEsc)) {
        id = this.parseIdent(false)
        if (this.canInsertSemicolon() || !this.eat(tt.arrow))
          this.unexpected()
        return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), [id], true, forInit)
      }
    }
    return id

  case tt.regexp:
    let value = this.value
    node = this.parseLiteral(value.value)
    node.regex = {pattern: value.pattern, flags: value.flags}
    return node

  case tt.num: case tt.string:
    return this.parseLiteral(this.value)

  case tt._null: case tt._true: case tt._false:
    node = this.startNode()
    node.value = this.type === tt._null ? null : this.type === tt._true
    node.raw = this.type.keyword
    this.next()
    return this.finishNode(node, "Literal")

  case tt.parenL:
    let start = this.start, expr = this.parseParenAndDistinguishExpression(canBeArrow, forInit)
    if (refDestructuringErrors) {
      if (refDestructuringErrors.parenthesizedAssign < 0 && !this.isSimpleAssignTarget(expr))
        refDestructuringErrors.parenthesizedAssign = start
      if (refDestructuringErrors.parenthesizedBind < 0)
        refDestructuringErrors.parenthesizedBind = start
    }
    return expr

  case tt.bracketL:
    node = this.startNode()
    this.next()
    node.elements = this.parseExprList(tt.bracketR, true, true, refDestructuringErrors)
    return this.finishNode(node, "ArrayExpression")

  case tt.braceL:
    this.overrideContext(tokenCtxTypes.b_expr)
    return this.parseObj(false, refDestructuringErrors)

  case tt._function:
    node = this.startNode()
    this.next()
    return this.parseFunction(node, 0)

  case tt._class:
    return this.parseClass(this.startNode(), false)

  case tt._new:
    return this.parseNew()

  case tt.backQuote:
    return this.parseTemplate()

  case tt._import:
    if (this.options.ecmaVersion >= 11) {
      return this.parseExprImport()
    } else {
      return this.unexpected()
    }

  default:
    this.unexpected()
  }
}

Parserjs.prototype.parseExprImport = function() {
  const node = this.startNode()

  // Consume `import` as an identifier for `import.meta`.
  // Because `this.parseIdent(true)` doesn't check escape sequences, it needs the check of `this.containsEsc`.
  if (this.containsEsc) this.raiseRecoverable(this.start, "Escape sequence in keyword import")
  const meta = this.parseIdent(true)

  switch (this.type) {
  case tt.parenL:
    return this.parseDynamicImport(node)
  case tt.dot:
    node.meta = meta
    return this.parseImportMeta(node)
  default:
    this.unexpected()
  }
}

Parserjs.prototype.parseDynamicImport = function(node) {
  this.next() // skip `(`

  // Parse node.source.
  node.source = this.parseMaybeAssign()

  // Verify ending.
  if (!this.eat(tt.parenR)) {
    const errorPos = this.start
    if (this.eat(tt.comma) && this.eat(tt.parenR)) {
      this.raiseRecoverable(errorPos, "Trailing comma is not allowed in import()")
    } else {
      this.unexpected(errorPos)
    }
  }

  return this.finishNode(node, "ImportExpression")
}

Parserjs.prototype.parseImportMeta = function(node) {
  this.next() // skip `.`

  const containsEsc = this.containsEsc
  node.property = this.parseIdent(true)

  if (node.property.name !== "meta")
    this.raiseRecoverable(node.property.start, "The only valid meta property for import is 'import.meta'")
  if (containsEsc)
    this.raiseRecoverable(node.start, "'import.meta' must not contain escaped characters")
  if (this.options.sourceType !== "module" && !this.options.allowImportExportEverywhere)
    this.raiseRecoverable(node.start, "Cannot use 'import.meta' outside a module")

  return this.finishNode(node, "MetaProperty")
}

Parserjs.prototype.parseLiteral = function(value) {
  let node = this.startNode()
  node.value = value
  node.raw = this.input.slice(this.start, this.end)
  if (node.raw.charCodeAt(node.raw.length - 1) === 110) node.bigint = node.raw.slice(0, -1).replace(/_/g, "")
  this.next()
  return this.finishNode(node, "Literal")
}

Parserjs.prototype.parseParenExpression = function() {
  this.expect(tt.parenL)
  let val = this.parseExpression()
  this.expect(tt.parenR)
  return val
}

Parserjs.prototype.parseParenAndDistinguishExpression = function(canBeArrow, forInit) {
  let startPos = this.start, startLoc = this.startLoc, val, allowTrailingComma = this.options.ecmaVersion >= 8
  if (this.options.ecmaVersion >= 6) {
    this.next()

    let innerStartPos = this.start, innerStartLoc = this.startLoc
    let exprList = [], first = true, lastIsComma = false
    let refDestructuringErrors = new DestructuringErrors, oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, spreadStart
    this.yieldPos = 0
    this.awaitPos = 0
    // Do not save awaitIdentPos to allow checking awaits nested in parameters
    while (this.type !== tt.parenR) {
      first ? first = false : this.expect(tt.comma)
      if (allowTrailingComma && this.afterTrailingComma(tt.parenR, true)) {
        lastIsComma = true
        break
      } else if (this.type === tt.ellipsis) {
        spreadStart = this.start
        exprList.push(this.parseParenItem(this.parseRestBinding()))
        if (this.type === tt.comma) this.raise(this.start, "Comma is not permitted after the rest element")
        break
      } else {
        exprList.push(this.parseMaybeAssign(false, refDestructuringErrors, this.parseParenItem))
      }
    }
    let innerEndPos = this.lastTokEnd, innerEndLoc = this.lastTokEndLoc
    this.expect(tt.parenR)

    if (canBeArrow && !this.canInsertSemicolon() && this.eat(tt.arrow)) {
      this.checkPatternErrors(refDestructuringErrors, false)
      this.checkYieldAwaitInDefaultParams()
      this.yieldPos = oldYieldPos
      this.awaitPos = oldAwaitPos
      return this.parseParenArrowList(startPos, startLoc, exprList, forInit)
    }

    if (!exprList.length || lastIsComma) this.unexpected(this.lastTokStart)
    if (spreadStart) this.unexpected(spreadStart)
    this.checkExpressionErrors(refDestructuringErrors, true)
    this.yieldPos = oldYieldPos || this.yieldPos
    this.awaitPos = oldAwaitPos || this.awaitPos

    if (exprList.length > 1) {
      val = this.startNodeAt(innerStartPos, innerStartLoc)
      val.expressions = exprList
      this.finishNodeAt(val, "SequenceExpression", innerEndPos, innerEndLoc)
    } else {
      val = exprList[0]
    }
  } else {
    val = this.parseParenExpression()
  }

  if (this.options.preserveParens) {
    let par = this.startNodeAt(startPos, startLoc)
    par.expression = val
    return this.finishNode(par, "ParenthesizedExpression")
  } else {
    return val
  }
}

Parserjs.prototype.parseParenItem = function(item) {
  return item
}

Parserjs.prototype.parseParenArrowList = function(startPos, startLoc, exprList, forInit) {
  return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), exprList, false, forInit)
}

// New's precedence is slightly tricky. It must allow its argument to
// be a `[]` or dot subscript expression, but not a call ? at least,
// not without wrapping it in parentheses. Thus, it uses the noCalls
// argument to parseSubscripts to prevent it from consuming the
// argument list.

const empty = []

Parserjs.prototype.parseNew = function() {
  if (this.containsEsc) this.raiseRecoverable(this.start, "Escape sequence in keyword new")
  let node = this.startNode()
  let meta = this.parseIdent(true)
  if (this.options.ecmaVersion >= 6 && this.eat(tt.dot)) {
    node.meta = meta
    let containsEsc = this.containsEsc
    node.property = this.parseIdent(true)
    if (node.property.name !== "target")
      this.raiseRecoverable(node.property.start, "The only valid meta property for new is 'new.target'")
    if (containsEsc)
      this.raiseRecoverable(node.start, "'new.target' must not contain escaped characters")
    if (!this.allowNewDotTarget)
      this.raiseRecoverable(node.start, "'new.target' can only be used in functions and class static block")
    return this.finishNode(node, "MetaProperty")
  }
  let startPos = this.start, startLoc = this.startLoc, isImport = this.type === tt._import
  node.callee = this.parseSubscripts(this.parseExprAtom(), startPos, startLoc, true, false)
  if (isImport && node.callee.type === "ImportExpression") {
    this.raise(startPos, "Cannot use new with import()")
  }
  if (this.eat(tt.parenL)) node.arguments = this.parseExprList(tt.parenR, this.options.ecmaVersion >= 8, false)
  else node.arguments = empty
  return this.finishNode(node, "NewExpression")
}

// Parse template expression.

Parserjs.prototype.parseTemplateElement = function({isTagged}) {
  let elem = this.startNode()
  if (this.type === tt.invalidTemplate) {
    if (!isTagged) {
      this.raiseRecoverable(this.start, "Bad escape sequence in untagged template literal")
    }
    elem.value = {
      raw: this.value,
      cooked: null
    }
  } else {
    elem.value = {
      raw: this.input.slice(this.start, this.end).replace(/\r\n?/g, "\n"),
      cooked: this.value
    }
  }
  this.next()
  elem.tail = this.type === tt.backQuote
  return this.finishNode(elem, "TemplateElement")
}

Parserjs.prototype.parseTemplate = function({isTagged = false} = {}) {
  let node = this.startNode()
  this.next()
  node.expressions = []
  let curElt = this.parseTemplateElement({isTagged})
  node.quasis = [curElt]
  while (!curElt.tail) {
    if (this.type === tt.eof) this.raise(this.pos, "Unterminated template literal")
    this.expect(tt.dollarBraceL)
    node.expressions.push(this.parseExpression())
    this.expect(tt.braceR)
    node.quasis.push(curElt = this.parseTemplateElement({isTagged}))
  }
  this.next()
  return this.finishNode(node, "TemplateLiteral")
}

Parserjs.prototype.isAsyncProp = function(prop) {
  return !prop.computed && prop.key.type === "Identifier" && prop.key.name === "async" &&
    (this.type === tt.name || this.type === tt.num || this.type === tt.string || this.type === tt.bracketL || this.type.keyword || (this.options.ecmaVersion >= 9 && this.type === tt.star)) &&
    !lineBreak.test(this.input.slice(this.lastTokEnd, this.start))
}

// Parse an object literal or binding pattern.

Parserjs.prototype.parseObj = function(isPattern, refDestructuringErrors) {
  let node = this.startNode(), first = true, propHash = {}
  node.properties = []
  this.next()
  while (!this.eat(tt.braceR)) {
    if (!first) {
      this.expect(tt.comma)
      if (this.options.ecmaVersion >= 5 && this.afterTrailingComma(tt.braceR)) break
    } else first = false

    const prop = this.parseProperty(isPattern, refDestructuringErrors)
    if (!isPattern) this.checkPropClash(prop, propHash, refDestructuringErrors)
    node.properties.push(prop)
  }
  return this.finishNode(node, isPattern ? "ObjectPattern" : "ObjectExpression")
}

Parserjs.prototype.parseProperty = function(isPattern, refDestructuringErrors) {
  let prop = this.startNode(), isGenerator, isAsync, startPos, startLoc
  if (this.options.ecmaVersion >= 9 && this.eat(tt.ellipsis)) {
    if (isPattern) {
      prop.argument = this.parseIdent(false)
      if (this.type === tt.comma) {
        this.raise(this.start, "Comma is not permitted after the rest element")
      }
      return this.finishNode(prop, "RestElement")
    }
    // Parse argument.
    prop.argument = this.parseMaybeAssign(false, refDestructuringErrors)
    // To disallow trailing comma via `this.toAssignable()`.
    if (this.type === tt.comma && refDestructuringErrors && refDestructuringErrors.trailingComma < 0) {
      refDestructuringErrors.trailingComma = this.start
    }
    // Finish
    return this.finishNode(prop, "SpreadElement")
  }
  if (this.options.ecmaVersion >= 6) {
    prop.method = false
    prop.shorthand = false
    if (isPattern || refDestructuringErrors) {
      startPos = this.start
      startLoc = this.startLoc
    }
    if (!isPattern)
      isGenerator = this.eat(tt.star)
  }
  let containsEsc = this.containsEsc
  this.parsePropertyName(prop)
  if (!isPattern && !containsEsc && this.options.ecmaVersion >= 8 && !isGenerator && this.isAsyncProp(prop)) {
    isAsync = true
    isGenerator = this.options.ecmaVersion >= 9 && this.eat(tt.star)
    this.parsePropertyName(prop)
  } else {
    isAsync = false
  }
  this.parsePropertyValue(prop, isPattern, isGenerator, isAsync, startPos, startLoc, refDestructuringErrors, containsEsc)
  return this.finishNode(prop, "Property")
}

Parserjs.prototype.parsePropertyValue = function(prop, isPattern, isGenerator, isAsync, startPos, startLoc, refDestructuringErrors, containsEsc) {
  if ((isGenerator || isAsync) && this.type === tt.colon)
    this.unexpected()

  if (this.eat(tt.colon)) {
    prop.value = isPattern ? this.parseMaybeDefault(this.start, this.startLoc) : this.parseMaybeAssign(false, refDestructuringErrors)
    prop.kind = "init"
  } else if (this.options.ecmaVersion >= 6 && this.type === tt.parenL) {
    if (isPattern) this.unexpected()
    prop.kind = "init"
    prop.method = true
    prop.value = this.parseMethod(isGenerator, isAsync)
  } else if (!isPattern && !containsEsc &&
             this.options.ecmaVersion >= 5 && !prop.computed && prop.key.type === "Identifier" &&
             (prop.key.name === "get" || prop.key.name === "set") &&
             (this.type !== tt.comma && this.type !== tt.braceR && this.type !== tt.eq)) {
    if (isGenerator || isAsync) this.unexpected()
    prop.kind = prop.key.name
    this.parsePropertyName(prop)
    prop.value = this.parseMethod(false)
    let paramCount = prop.kind === "get" ? 0 : 1
    if (prop.value.params.length !== paramCount) {
      let start = prop.value.start
      if (prop.kind === "get")
        this.raiseRecoverable(start, "getter should have no params")
      else
        this.raiseRecoverable(start, "setter should have exactly one param")
    } else {
      if (prop.kind === "set" && prop.value.params[0].type === "RestElement")
        this.raiseRecoverable(prop.value.params[0].start, "Setter cannot use rest params")
    }
  } else if (this.options.ecmaVersion >= 6 && !prop.computed && prop.key.type === "Identifier") {
    if (isGenerator || isAsync) this.unexpected()
    this.checkUnreserved(prop.key)
    if (prop.key.name === "await" && !this.awaitIdentPos)
      this.awaitIdentPos = startPos
    prop.kind = "init"
    if (isPattern) {
      prop.value = this.parseMaybeDefault(startPos, startLoc, this.copyNode(prop.key))
    } else if (this.type === tt.eq && refDestructuringErrors) {
      if (refDestructuringErrors.shorthandAssign < 0)
        refDestructuringErrors.shorthandAssign = this.start
      prop.value = this.parseMaybeDefault(startPos, startLoc, this.copyNode(prop.key))
    } else {
      prop.value = this.copyNode(prop.key)
    }
    prop.shorthand = true
  } else this.unexpected()
}

Parserjs.prototype.parsePropertyName = function(prop) {
  if (this.options.ecmaVersion >= 6) {
    if (this.eat(tt.bracketL)) {
      prop.computed = true
      prop.key = this.parseMaybeAssign()
      this.expect(tt.bracketR)
      return prop.key
    } else {
      prop.computed = false
    }
  }
  return prop.key = this.type === tt.num || this.type === tt.string ? this.parseExprAtom() : this.parseIdent(this.options.allowReserved !== "never")
}

// Initialize empty function node.

Parserjs.prototype.initFunction = function(node) {
  node.id = null
  if (this.options.ecmaVersion >= 6) node.generator = node.expression = false
  if (this.options.ecmaVersion >= 8) node.async = false
}

// Parse object or class method.

Parserjs.prototype.parseMethod = function(isGenerator, isAsync, allowDirectSuper) {
  let node = this.startNode(), oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldAwaitIdentPos = this.awaitIdentPos

  this.initFunction(node)
  if (this.options.ecmaVersion >= 6)
    node.generator = isGenerator
  if (this.options.ecmaVersion >= 8)
    node.async = !!isAsync

  this.yieldPos = 0
  this.awaitPos = 0
  this.awaitIdentPos = 0
  this.enterScope(functionFlags(isAsync, node.generator) | SCOPE_SUPER | (allowDirectSuper ? SCOPE_DIRECT_SUPER : 0))

  this.expect(tt.parenL)
  node.params = this.parseBindingList(tt.parenR, false, this.options.ecmaVersion >= 8)
  this.checkYieldAwaitInDefaultParams()
  this.parseFunctionBody(node, false, true, false)

  this.yieldPos = oldYieldPos
  this.awaitPos = oldAwaitPos
  this.awaitIdentPos = oldAwaitIdentPos
  return this.finishNode(node, "FunctionExpression")
}

// Parse arrow function expression with given parameters.

Parserjs.prototype.parseArrowExpression = function(node, params, isAsync, forInit) {
  let oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldAwaitIdentPos = this.awaitIdentPos

  this.enterScope(functionFlags(isAsync, false) | SCOPE_ARROW)
  this.initFunction(node)
  if (this.options.ecmaVersion >= 8) node.async = !!isAsync

  this.yieldPos = 0
  this.awaitPos = 0
  this.awaitIdentPos = 0

  node.params = this.toAssignableList(params, true)
  this.parseFunctionBody(node, true, false, forInit)

  this.yieldPos = oldYieldPos
  this.awaitPos = oldAwaitPos
  this.awaitIdentPos = oldAwaitIdentPos
  return this.finishNode(node, "ArrowFunctionExpression")
}

// Parse function body and check parameters.

Parserjs.prototype.parseFunctionBody = function(node, isArrowFunction, isMethod, forInit) {
  let isExpression = isArrowFunction && this.type !== tt.braceL
  let oldStrict = this.strict, useStrict = false

  if (isExpression) {
    node.body = this.parseMaybeAssign(forInit)
    node.expression = true
    this.checkParams(node, false)
  } else {
    let nonSimple = this.options.ecmaVersion >= 7 && !this.isSimpleParamList(node.params)
    if (!oldStrict || nonSimple) {
      useStrict = this.strictDirective(this.end)
      // If this is a strict mode function, verify that argument names
      // are not repeated, and it does not try to bind the words `eval`
      // or `arguments`.
      if (useStrict && nonSimple)
        this.raiseRecoverable(node.start, "Illegal 'use strict' directive in function with non-simple parameter list")
    }
    // Start a new scope with regard to labels and the `inFunction`
    // flag (restore them to their old value afterwards).
    let oldLabels = this.labels
    this.labels = []
    if (useStrict) this.strict = true

    // Add the params to varDeclaredNames to ensure that an error is thrown
    // if a let/const declaration in the function clashes with one of the params.
    this.checkParams(node, !oldStrict && !useStrict && !isArrowFunction && !isMethod && this.isSimpleParamList(node.params))
    // Ensure the function name isn't a forbidden identifier in strict mode, e.g. 'eval'
    if (this.strict && node.id) this.checkLValSimple(node.id, BIND_OUTSIDE)
    node.body = this.parseBlock(false, undefined, useStrict && !oldStrict)
    node.expression = false
    this.adaptDirectivePrologue(node.body.body)
    this.labels = oldLabels
  }
  this.exitScope()
}

Parserjs.prototype.isSimpleParamList = function(params) {
  for (let param of params)
    if (param.type !== "Identifier") return false
  return true
}

// Checks function params for various disallowed patterns such as using "eval"
// or "arguments" and duplicate parameters.

Parserjs.prototype.checkParams = function(node, allowDuplicates) {
  let nameHash = Object.create(null)
  for (let param of node.params)
    this.checkLValInnerPattern(param, BIND_VAR, allowDuplicates ? null : nameHash)
}

// Parses a comma-separated list of expressions, and returns them as
// an array. `close` is the token type that ends the list, and
// `allowEmpty` can be turned on to allow subsequent commas with
// nothing in between them to be parsed as `null` (which is needed
// for array literals).

Parserjs.prototype.parseExprList = function(close, allowTrailingComma, allowEmpty, refDestructuringErrors) {
  let elts = [], first = true
  while (!this.eat(close)) {
    if (!first) {
      this.expect(tt.comma)
      if (allowTrailingComma && this.afterTrailingComma(close)) break
    } else first = false

    let elt
    if (allowEmpty && this.type === tt.comma)
      elt = null
    else if (this.type === tt.ellipsis) {
      elt = this.parseSpread(refDestructuringErrors)
      if (refDestructuringErrors && this.type === tt.comma && refDestructuringErrors.trailingComma < 0)
        refDestructuringErrors.trailingComma = this.start
    } else {
      elt = this.parseMaybeAssign(false, refDestructuringErrors)
    }
    elts.push(elt)
  }
  return elts
}

Parserjs.prototype.checkUnreserved = function({start, end, name}) {
  if (this.inGenerator && name === "yield")
    this.raiseRecoverable(start, "Cannot use 'yield' as identifier inside a generator")
  if (this.inAsync && name === "await")
    this.raiseRecoverable(start, "Cannot use 'await' as identifier inside an async function")
  if (this.currentThisScope().inClassFieldInit && name === "arguments")
    this.raiseRecoverable(start, "Cannot use 'arguments' in class field initializer")
  if (this.inClassStaticBlock && (name === "arguments" || name === "await"))
    this.raise(start, `Cannot use ${name} in class static initialization block`)
  if (this.keywords.test(name))
    this.raise(start, `Unexpected keyword '${name}'`)
  if (this.options.ecmaVersion < 6 &&
    this.input.slice(start, end).indexOf("\\") !== -1) return
  const re = this.strict ? this.reservedWordsStrict : this.reservedWords
  if (re.test(name)) {
    if (!this.inAsync && name === "await")
      this.raiseRecoverable(start, "Cannot use keyword 'await' outside an async function")
    this.raiseRecoverable(start, `The keyword '${name}' is reserved`)
  }
}

// Parse the next token as an identifier. If `liberal` is true (used
// when parsing properties), it will also convert keywords into
// identifiers.

Parserjs.prototype.parseIdent = function(liberal) {
  let node = this.startNode()
  if (this.type === tt.name) {
    node.name = this.value
  } else if (this.type.keyword) {
    node.name = this.type.keyword

    // To fix https://github.com/acornjs/acorn/issues/575
    // `class` and `function` keywords push new context into this.context.
    // But there is no chance to pop the context if the keyword is consumed as an identifier such as a property name.
    // If the previous token is a dot, this does not apply because the context-managing code already ignored the keyword
    if ((node.name === "class" || node.name === "function") &&
        (this.lastTokEnd !== this.lastTokStart + 1 || this.input.charCodeAt(this.lastTokStart) !== 46)) {
      this.context.pop()
    }
  } else {
    this.unexpected()
  }
  this.next(!!liberal)
  this.finishNode(node, "Identifier")
  if (!liberal) {
    this.checkUnreserved(node)
    if (node.name === "await" && !this.awaitIdentPos)
      this.awaitIdentPos = node.start
  }
  return node
}

Parserjs.prototype.parsePrivateIdent = function() {
  const node = this.startNode()
  if (this.type === tt.privateId) {
    node.name = this.value
  } else {
    this.unexpected()
  }
  this.next()
  this.finishNode(node, "PrivateIdentifier")

  // For validating existence
  if (this.privateNameStack.length === 0) {
    this.raise(node.start, `Private field '#${node.name}' must be declared in an enclosing class`)
  } else {
    this.privateNameStack[this.privateNameStack.length - 1].used.push(node)
  }

  return node
}

// Parses yield expression inside generator.

Parserjs.prototype.parseYield = function(forInit) {
  if (!this.yieldPos) this.yieldPos = this.start

  let node = this.startNode()
  this.next()
  if (this.type === tt.semi || this.canInsertSemicolon() || (this.type !== tt.star && !this.type.startsExpr)) {
    node.delegate = false
    node.argument = null
  } else {
    node.delegate = this.eat(tt.star)
    node.argument = this.parseMaybeAssign(forInit)
  }
  return this.finishNode(node, "YieldExpression")
}

Parserjs.prototype.parseAwait = function(forInit) {
  if (!this.awaitPos) this.awaitPos = this.start

  let node = this.startNode()
  this.next()
  node.argument = this.parseMaybeUnary(null, true, false, forInit)
  return this.finishNode(node, "AwaitExpression")
}
/** -------------------------------------------------------------------- */
// 여기부분은 statement.js 를 가져온다.
/** -------------------------------------------------------------------- */
/*
import {types as tt} from "./tokentype.js"
import {Parser} from "./state.js"
import {lineBreak, skipWhiteSpace} from "./whitespace.js"
import {isIdentifierStart, isIdentifierChar, keywordRelationalOperator} from "./identifier.js"
import {hasOwn, loneSurrogate} from "./util.js"
import {DestructuringErrors} from "./parseutil.js"
import {functionFlags, SCOPE_SIMPLE_CATCH, BIND_SIMPLE_CATCH, BIND_LEXICAL, BIND_VAR, BIND_FUNCTION, SCOPE_CLASS_STATIC_BLOCK, SCOPE_SUPER} from "./scopeflags.js"

const pp = Parser.prototype
*/
// ### Statement parsing

// Parse a program. Initializes the parser, reads any number of
// statements, and wraps them in a Program node.  Optionally takes a
// `program` argument.  If present, the statements will be appended
// to its body instead of creating a new node.

Parserjs.prototype.parseTopLevel = function(node) {
  let exports = Object.create(null)
  if (!node.body) node.body = []
  while (this.type !== tt.eof) {
    let stmt = this.parseStatement(null, true, exports)
    node.body.push(stmt)
  }
  if (this.inModule)
    for (let name of Object.keys(this.undefinedExports))
      this.raiseRecoverable(this.undefinedExports[name].start, `Export '${name}' is not defined`)
  this.adaptDirectivePrologue(node.body)
  this.next()
  node.sourceType = this.options.sourceType
  return this.finishNode(node, "Program")
}

const loopLabel = {kind: "loop"}, switchLabel = {kind: "switch"}

Parserjs.prototype.isLet = function(context) {
  if (this.options.ecmaVersion < 6 || !this.isContextual("let")) return false
  skipWhiteSpace.lastIndex = this.pos
  let skip = skipWhiteSpace.exec(this.input)
  let next = this.pos + skip[0].length, nextCh = this.input.charCodeAt(next)
  // For ambiguous cases, determine if a LexicalDeclaration (or only a
  // Statement) is allowed here. If context is not empty then only a Statement
  // is allowed. However, `let [` is an explicit negative lookahead for
  // ExpressionStatement, so special-case it first.
  if (nextCh === 91 || nextCh === 92) return true // '[', '/'
  if (context) return false

  if (nextCh === 123 || nextCh > 0xd7ff && nextCh < 0xdc00) return true // '{', astral
  if (isIdentifierStart(nextCh, true)) {
    let pos = next + 1
    while (isIdentifierChar(nextCh = this.input.charCodeAt(pos), true)) ++pos
    if (nextCh === 92 || nextCh > 0xd7ff && nextCh < 0xdc00) return true
    let ident = this.input.slice(next, pos)
    if (!keywordRelationalOperator.test(ident)) return true
  }
  return false
}

// check 'async [no LineTerminator here] function'
// - 'async /*foo*/ function' is OK.
// - 'async /*\n*/ function' is invalid.
Parserjs.prototype.isAsyncFunction = function() {
  if (this.options.ecmaVersion < 8 || !this.isContextual("async"))
    return false

  skipWhiteSpace.lastIndex = this.pos
  let skip = skipWhiteSpace.exec(this.input)
  let next = this.pos + skip[0].length, after
  return !lineBreak.test(this.input.slice(this.pos, next)) &&
    this.input.slice(next, next + 8) === "function" &&
    (next + 8 === this.input.length ||
     !(isIdentifierChar(after = this.input.charCodeAt(next + 8)) || after > 0xd7ff && after < 0xdc00))
}

// Parse a single statement.
//
// If expecting a statement and finding a slash operator, parse a
// regular expression literal. This is to handle cases like
// `if (foo) /blah/.exec(foo)`, where looking at the previous token
// does not help.

Parserjs.prototype.parseStatement = function(context, topLevel, exports) {
  let starttype = this.type, node = this.startNode(), kind

  if (this.isLet(context)) {
    starttype = tt._var
    kind = "let"
  }

  // Most types of statements are recognized by the keyword they
  // start with. Many are trivial to parse, some require a bit of
  // complexity.

  switch (starttype) {
  case tt._break: case tt._continue: return this.parseBreakContinueStatement(node, starttype.keyword)
  case tt._debugger: return this.parseDebuggerStatement(node)
  case tt._do: return this.parseDoStatement(node)
  case tt._for: return this.parseForStatement(node)
  case tt._function:
    // Function as sole body of either an if statement or a labeled statement
    // works, but not when it is part of a labeled statement that is the sole
    // body of an if statement.
    if ((context && (this.strict || context !== "if" && context !== "label")) && this.options.ecmaVersion >= 6) this.unexpected()
    return this.parseFunctionStatement(node, false, !context)
  case tt._class:
    if (context) this.unexpected()
    return this.parseClass(node, true)
  case tt._if: return this.parseIfStatement(node)
  case tt._return: return this.parseReturnStatement(node)
  case tt._switch: return this.parseSwitchStatement(node)
  case tt._throw: return this.parseThrowStatement(node)
  case tt._try: return this.parseTryStatement(node)
  case tt._const: case tt._var:
    kind = kind || this.value
    if (context && kind !== "var") this.unexpected()
    return this.parseVarStatement(node, kind)
  case tt._while: return this.parseWhileStatement(node)
  case tt._with: return this.parseWithStatement(node)
  case tt.braceL: return this.parseBlock(true, node)
  case tt.semi: return this.parseEmptyStatement(node)
  case tt._export:
  case tt._import:
    if (this.options.ecmaVersion > 10 && starttype === tt._import) {
      skipWhiteSpace.lastIndex = this.pos
      let skip = skipWhiteSpace.exec(this.input)
      let next = this.pos + skip[0].length, nextCh = this.input.charCodeAt(next)
      if (nextCh === 40 || nextCh === 46) // '(' or '.'
        return this.parseExpressionStatement(node, this.parseExpression())
    }

    if (!this.options.allowImportExportEverywhere) {
      if (!topLevel)
        this.raise(this.start, "'import' and 'export' may only appear at the top level")
      if (!this.inModule)
        this.raise(this.start, "'import' and 'export' may appear only with 'sourceType: module'")
    }
    return starttype === tt._import ? this.parseImport(node) : this.parseExport(node, exports)

    // If the statement does not start with a statement keyword or a
    // brace, it's an ExpressionStatement or LabeledStatement. We
    // simply start parsing an expression, and afterwards, if the
    // next token is a colon and the expression was a simple
    // Identifier node, we switch to interpreting it as a label.
  default:
    if (this.isAsyncFunction()) {
      if (context) this.unexpected()
      this.next()
      return this.parseFunctionStatement(node, true, !context)
    }
/*
    let maybeName = this.value, expr = this.parseExpression()
    if (starttype === tt.name && expr.type === "Identifier" && this.eat(tt.colon))
      return this.parseLabeledStatement(node, maybeName, expr, context)
    else return this.parseExpressionStatement(node, expr)
    */
  }
}

Parserjs.prototype.parseBreakContinueStatement = function(node, keyword) {
  let isBreak = keyword === "break"
  this.next()
  if (this.eat(tt.semi) || this.insertSemicolon()) node.label = null
  else if (this.type !== tt.name) this.unexpected()
  else {
    node.label = this.parseIdent()
    this.semicolon()
  }

  // Verify that there is an actual destination to break or
  // continue to.
  let i = 0
  for (; i < this.labels.length; ++i) {
    let lab = this.labels[i]
    if (node.label == null || lab.name === node.label.name) {
      if (lab.kind != null && (isBreak || lab.kind === "loop")) break
      if (node.label && isBreak) break
    }
  }
  if (i === this.labels.length) this.raise(node.start, "Unsyntactic " + keyword)
  return this.finishNode(node, isBreak ? "BreakStatement" : "ContinueStatement")
}

Parserjs.prototype.parseDebuggerStatement = function(node) {
  this.next()
  this.semicolon()
  return this.finishNode(node, "DebuggerStatement")
}

Parserjs.prototype.parseDoStatement = function(node) {
  this.next()
  this.labels.push(loopLabel)
  node.body = this.parseStatement("do")
  this.labels.pop()
  this.expect(tt._while)
  node.test = this.parseParenExpression()
  if (this.options.ecmaVersion >= 6)
    this.eat(tt.semi)
  else
    this.semicolon()
  return this.finishNode(node, "DoWhileStatement")
}

// Disambiguating between a `for` and a `for`/`in` or `for`/`of`
// loop is non-trivial. Basically, we have to parse the init `var`
// statement or expression, disallowing the `in` operator (see
// the second parameter to `parseExpression`), and then check
// whether the next token is `in` or `of`. When there is no init
// part (semicolon immediately after the opening parenthesis), it
// is a regular `for` loop.

Parserjs.prototype.parseForStatement = function(node) {
  this.next()
  let awaitAt = (this.options.ecmaVersion >= 9 && this.canAwait && this.eatContextual("await")) ? this.lastTokStart : -1
  this.labels.push(loopLabel)
  this.enterScope(0)
  this.expect(tt.parenL)
  if (this.type === tt.semi) {
    if (awaitAt > -1) this.unexpected(awaitAt)
    return this.parseFor(node, null)
  }
  let isLet = this.isLet()
  if (this.type === tt._var || this.type === tt._const || isLet) {
    let init = this.startNode(), kind = isLet ? "let" : this.value
    this.next()
    this.parseVar(init, true, kind)
    this.finishNode(init, "VariableDeclaration")
    if ((this.type === tt._in || (this.options.ecmaVersion >= 6 && this.isContextual("of"))) && init.declarations.length === 1) {
      if (this.options.ecmaVersion >= 9) {
        if (this.type === tt._in) {
          if (awaitAt > -1) this.unexpected(awaitAt)
        } else node.await = awaitAt > -1
      }
      return this.parseForIn(node, init)
    }
    if (awaitAt > -1) this.unexpected(awaitAt)
    return this.parseFor(node, init)
  }
  let startsWithLet = this.isContextual("let"), isForOf = false
  let refDestructuringErrors = new DestructuringErrors
  let init = this.parseExpression(awaitAt > -1 ? "await" : true, refDestructuringErrors)
  if (this.type === tt._in || (isForOf = this.options.ecmaVersion >= 6 && this.isContextual("of"))) {
    if (this.options.ecmaVersion >= 9) {
      if (this.type === tt._in) {
        if (awaitAt > -1) this.unexpected(awaitAt)
      } else node.await = awaitAt > -1
    }
    if (startsWithLet && isForOf) this.raise(init.start, "The left-hand side of a for-of loop may not start with 'let'.")
    this.toAssignable(init, false, refDestructuringErrors)
    this.checkLValPattern(init)
    return this.parseForIn(node, init)
  } else {
    this.checkExpressionErrors(refDestructuringErrors, true)
  }
  if (awaitAt > -1) this.unexpected(awaitAt)
  return this.parseFor(node, init)
}

Parserjs.prototype.parseFunctionStatement = function(node, isAsync, declarationPosition) {
  this.next()
  return this.parseFunction(node, FUNC_STATEMENT | (declarationPosition ? 0 : FUNC_HANGING_STATEMENT), false, isAsync)
}

Parserjs.prototype.parseIfStatement = function(node) {
  this.next()
  node.test = this.parseParenExpression()
  // allow function declarations in branches, but only in non-strict mode
  node.consequent = this.parseStatement("if")
  node.alternate = this.eat(tt._else) ? this.parseStatement("if") : null
  return this.finishNode(node, "IfStatement")
}

Parserjs.prototype.parseReturnStatement = function(node) {
  if (!this.inFunction && !this.options.allowReturnOutsideFunction)
    this.raise(this.start, "'return' outside of function")
  this.next()

  // In `return` (and `break`/`continue`), the keywords with
  // optional arguments, we eagerly look for a semicolon or the
  // possibility to insert one.

  if (this.eat(tt.semi) || this.insertSemicolon()) node.argument = null
  else { node.argument = this.parseExpression(); this.semicolon() }
  return this.finishNode(node, "ReturnStatement")
}

Parserjs.prototype.parseSwitchStatement = function(node) {
  this.next()
  node.discriminant = this.parseParenExpression()
  node.cases = []
  this.expect(tt.braceL)
  this.labels.push(switchLabel)
  this.enterScope(0)

  // Statements under must be grouped (by label) in SwitchCase
  // nodes. `cur` is used to keep the node that we are currently
  // adding statements to.

  let cur
  for (let sawDefault = false; this.type !== tt.braceR;) {
    if (this.type === tt._case || this.type === tt._default) {
      let isCase = this.type === tt._case
      if (cur) this.finishNode(cur, "SwitchCase")
      node.cases.push(cur = this.startNode())
      cur.consequent = []
      this.next()
      if (isCase) {
        cur.test = this.parseExpression()
      } else {
        if (sawDefault) this.raiseRecoverable(this.lastTokStart, "Multiple default clauses")
        sawDefault = true
        cur.test = null
      }
      this.expect(tt.colon)
    } else {
      if (!cur) this.unexpected()
      cur.consequent.push(this.parseStatement(null))
    }
  }
  this.exitScope()
  if (cur) this.finishNode(cur, "SwitchCase")
  this.next() // Closing brace
  this.labels.pop()
  return this.finishNode(node, "SwitchStatement")
}

Parserjs.prototype.parseThrowStatement = function(node) {
  this.next()
  if (lineBreak.test(this.input.slice(this.lastTokEnd, this.start)))
    this.raise(this.lastTokEnd, "Illegal newline after throw")
  node.argument = this.parseExpression()
  this.semicolon()
  return this.finishNode(node, "ThrowStatement")
}

// Reused empty array added for node fields that are always empty.

//const empty = []

Parserjs.prototype.parseTryStatement = function(node) {
  this.next()
  node.block = this.parseBlock()
  node.handler = null
  if (this.type === tt._catch) {
    let clause = this.startNode()
    this.next()
    if (this.eat(tt.parenL)) {
      clause.param = this.parseBindingAtom()
      let simple = clause.param.type === "Identifier"
      this.enterScope(simple ? SCOPE_SIMPLE_CATCH : 0)
      this.checkLValPattern(clause.param, simple ? BIND_SIMPLE_CATCH : BIND_LEXICAL)
      this.expect(tt.parenR)
    } else {
      if (this.options.ecmaVersion < 10) this.unexpected()
      clause.param = null
      this.enterScope(0)
    }
    clause.body = this.parseBlock(false)
    this.exitScope()
    node.handler = this.finishNode(clause, "CatchClause")
  }
  node.finalizer = this.eat(tt._finally) ? this.parseBlock() : null
  if (!node.handler && !node.finalizer)
    this.raise(node.start, "Missing catch or finally clause")
  return this.finishNode(node, "TryStatement")
}

Parserjs.prototype.parseVarStatement = function(node, kind) {
  this.next()
  this.parseVar(node, false, kind)
  this.semicolon()
  return this.finishNode(node, "VariableDeclaration")
}

Parserjs.prototype.parseWhileStatement = function(node) {
  this.next()
  node.test = this.parseParenExpression()
  this.labels.push(loopLabel)
  node.body = this.parseStatement("while")
  this.labels.pop()
  return this.finishNode(node, "WhileStatement")
}

Parserjs.prototype.parseWithStatement = function(node) {
  if (this.strict) this.raise(this.start, "'with' in strict mode")
  this.next()
  node.object = this.parseParenExpression()
  node.body = this.parseStatement("with")
  return this.finishNode(node, "WithStatement")
}

Parserjs.prototype.parseEmptyStatement = function(node) {
  this.next()
  return this.finishNode(node, "EmptyStatement")
}

Parserjs.prototype.parseLabeledStatement = function(node, maybeName, expr, context) {
  for (let label of this.labels)
    if (label.name === maybeName)
      this.raise(expr.start, "Label '" + maybeName + "' is already declared")
  let kind = this.type.isLoop ? "loop" : this.type === tt._switch ? "switch" : null
  for (let i = this.labels.length - 1; i >= 0; i--) {
    let label = this.labels[i]
    if (label.statementStart === node.start) {
      // Update information about previous labels on this node
      label.statementStart = this.start
      label.kind = kind
    } else break
  }
  this.labels.push({name: maybeName, kind, statementStart: this.start})
  node.body = this.parseStatement(context ? context.indexOf("label") === -1 ? context + "label" : context : "label")
  this.labels.pop()
  node.label = expr
  return this.finishNode(node, "LabeledStatement")
}

Parserjs.prototype.parseExpressionStatement = function(node, expr) {
  node.expression = expr
  this.semicolon()
  return this.finishNode(node, "ExpressionStatement")
}

// Parse a semicolon-enclosed block of statements, handling `"use
// strict"` declarations when `allowStrict` is true (used for
// function bodies).

Parserjs.prototype.parseBlock = function(createNewLexicalScope = true, node = this.startNode(), exitStrict) {
  node.body = []
  this.expect(tt.braceL)
  if (createNewLexicalScope) this.enterScope(0)
  while (this.type !== tt.braceR) {
    let stmt = this.parseStatement(null)
    node.body.push(stmt)
  }
  if (exitStrict) this.strict = false
  this.next()
  if (createNewLexicalScope) this.exitScope()
  return this.finishNode(node, "BlockStatement")
}

// Parse a regular `for` loop. The disambiguation code in
// `parseStatement` will already have parsed the init statement or
// expression.

Parserjs.prototype.parseFor = function(node, init) {
  node.init = init
  this.expect(tt.semi)
  node.test = this.type === tt.semi ? null : this.parseExpression()
  this.expect(tt.semi)
  node.update = this.type === tt.parenR ? null : this.parseExpression()
  this.expect(tt.parenR)
  node.body = this.parseStatement("for")
  this.exitScope()
  this.labels.pop()
  return this.finishNode(node, "ForStatement")
}

// Parse a `for`/`in` and `for`/`of` loop, which are almost
// same from parser's perspective.

Parserjs.prototype.parseForIn = function(node, init) {
  const isForIn = this.type === tt._in
  this.next()

  if (
    init.type === "VariableDeclaration" &&
    init.declarations[0].init != null &&
    (
      !isForIn ||
      this.options.ecmaVersion < 8 ||
      this.strict ||
      init.kind !== "var" ||
      init.declarations[0].id.type !== "Identifier"
    )
  ) {
    this.raise(
      init.start,
      `${
        isForIn ? "for-in" : "for-of"
      } loop variable declaration may not have an initializer`
    )
  }
  node.left = init
  node.right = isForIn ? this.parseExpression() : this.parseMaybeAssign()
  this.expect(tt.parenR)
  node.body = this.parseStatement("for")
  this.exitScope()
  this.labels.pop()
  return this.finishNode(node, isForIn ? "ForInStatement" : "ForOfStatement")
}

// Parse a list of variable declarations.

Parserjs.prototype.parseVar = function(node, isFor, kind) {
  node.declarations = []
  node.kind = kind
  for (;;) {
    let decl = this.startNode()
    this.parseVarId(decl, kind)
    if (this.eat(tt.eq)) {
      decl.init = this.parseMaybeAssign(isFor)
    } else if (kind === "const" && !(this.type === tt._in || (this.options.ecmaVersion >= 6 && this.isContextual("of")))) {
      this.unexpected()
    } else if (decl.id.type !== "Identifier" && !(isFor && (this.type === tt._in || this.isContextual("of")))) {
      this.raise(this.lastTokEnd, "Complex binding patterns require an initialization value")
    } else {
      decl.init = null
    }
    node.declarations.push(this.finishNode(decl, "VariableDeclarator"))
    if (!this.eat(tt.comma)) break
  }
  return node
}

Parserjs.prototype.parseVarId = function(decl, kind) {
  decl.id = this.parseBindingAtom()
  this.checkLValPattern(decl.id, kind === "var" ? BIND_VAR : BIND_LEXICAL, false)
}

const FUNC_STATEMENT = 1, FUNC_HANGING_STATEMENT = 2, FUNC_NULLABLE_ID = 4

// Parse a function declaration or literal (depending on the
// `statement & FUNC_STATEMENT`).

// Remove `allowExpressionBody` for 7.0.0, as it is only called with false
Parserjs.prototype.parseFunction = function(node, statement, allowExpressionBody, isAsync, forInit) {
  this.initFunction(node)
  if (this.options.ecmaVersion >= 9 || this.options.ecmaVersion >= 6 && !isAsync) {
    if (this.type === tt.star && (statement & FUNC_HANGING_STATEMENT))
      this.unexpected()
    node.generator = this.eat(tt.star)
  }
  if (this.options.ecmaVersion >= 8)
    node.async = !!isAsync

  if (statement & FUNC_STATEMENT) {
    node.id = (statement & FUNC_NULLABLE_ID) && this.type !== tt.name ? null : this.parseIdent()
    if (node.id && !(statement & FUNC_HANGING_STATEMENT))
      // If it is a regular function declaration in sloppy mode, then it is
      // subject to Annex B semantics (BIND_FUNCTION). Otherwise, the binding
      // mode depends on properties of the current scope (see
      // treatFunctionsAsVar).
      this.checkLValSimple(node.id, (this.strict || node.generator || node.async) ? this.treatFunctionsAsVar ? BIND_VAR : BIND_LEXICAL : BIND_FUNCTION)
  }

  let oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldAwaitIdentPos = this.awaitIdentPos
  this.yieldPos = 0
  this.awaitPos = 0
  this.awaitIdentPos = 0
  this.enterScope(functionFlags(node.async, node.generator))

  if (!(statement & FUNC_STATEMENT))
    node.id = this.type === tt.name ? this.parseIdent() : null

  this.parseFunctionParams(node)
  this.parseFunctionBody(node, allowExpressionBody, false, forInit)

  this.yieldPos = oldYieldPos
  this.awaitPos = oldAwaitPos
  this.awaitIdentPos = oldAwaitIdentPos
  return this.finishNode(node, (statement & FUNC_STATEMENT) ? "FunctionDeclaration" : "FunctionExpression")
}

Parserjs.prototype.parseFunctionParams = function(node) {
  this.expect(tt.parenL)
  node.params = this.parseBindingList(tt.parenR, false, this.options.ecmaVersion >= 8)
  this.checkYieldAwaitInDefaultParams()
}

// Parse a class declaration or literal (depending on the
// `isStatement` parameter).

Parserjs.prototype.parseClass = function(node, isStatement) {
  this.next()

  // ecma-262 14.6 Class Definitions
  // A class definition is always strict mode code.
  const oldStrict = this.strict
  this.strict = true

  this.parseClassId(node, isStatement)
  this.parseClassSuper(node)
  const privateNameMap = this.enterClassBody()
  const classBody = this.startNode()
  let hadConstructor = false
  classBody.body = []
  this.expect(tt.braceL)
  while (this.type !== tt.braceR) {
    const element = this.parseClassElement(node.superClass !== null)
    if (element) {
      classBody.body.push(element)
      if (element.type === "MethodDefinition" && element.kind === "constructor") {
        if (hadConstructor) this.raise(element.start, "Duplicate constructor in the same class")
        hadConstructor = true
      } else if (element.key && element.key.type === "PrivateIdentifier" && isPrivateNameConflicted(privateNameMap, element)) {
        this.raiseRecoverable(element.key.start, `Identifier '#${element.key.name}' has already been declared`)
      }
    }
  }
  this.strict = oldStrict
  this.next()
  node.body = this.finishNode(classBody, "ClassBody")
  this.exitClassBody()
  return this.finishNode(node, isStatement ? "ClassDeclaration" : "ClassExpression")
}

Parserjs.prototype.parseClassElement = function(constructorAllowsSuper) {
  if (this.eat(tt.semi)) return null

  const ecmaVersion = this.options.ecmaVersion
  const node = this.startNode()
  let keyName = ""
  let isGenerator = false
  let isAsync = false
  let kind = "method"
  let isStatic = false

  if (this.eatContextual("static")) {
    // Parse static init block
    if (ecmaVersion >= 13 && this.eat(tt.braceL)) {
      this.parseClassStaticBlock(node)
      return node
    }
    if (this.isClassElementNameStart() || this.type === tt.star) {
      isStatic = true
    } else {
      keyName = "static"
    }
  }
  node.static = isStatic
  if (!keyName && ecmaVersion >= 8 && this.eatContextual("async")) {
    if ((this.isClassElementNameStart() || this.type === tt.star) && !this.canInsertSemicolon()) {
      isAsync = true
    } else {
      keyName = "async"
    }
  }
  if (!keyName && (ecmaVersion >= 9 || !isAsync) && this.eat(tt.star)) {
    isGenerator = true
  }
  if (!keyName && !isAsync && !isGenerator) {
    const lastValue = this.value
    if (this.eatContextual("get") || this.eatContextual("set")) {
      if (this.isClassElementNameStart()) {
        kind = lastValue
      } else {
        keyName = lastValue
      }
    }
  }

  // Parse element name
  if (keyName) {
    // 'async', 'get', 'set', or 'static' were not a keyword contextually.
    // The last token is any of those. Make it the element name.
    node.computed = false
    node.key = this.startNodeAt(this.lastTokStart, this.lastTokStartLoc)
    node.key.name = keyName
    this.finishNode(node.key, "Identifier")
  } else {
    this.parseClassElementName(node)
  }

  // Parse element value
  if (ecmaVersion < 13 || this.type === tt.parenL || kind !== "method" || isGenerator || isAsync) {
    const isConstructor = !node.static && checkKeyName(node, "constructor")
    const allowsDirectSuper = isConstructor && constructorAllowsSuper
    // Couldn't move this check into the 'parseClassMethod' method for backward compatibility.
    if (isConstructor && kind !== "method") this.raise(node.key.start, "Constructor can't have get/set modifier")
    node.kind = isConstructor ? "constructor" : kind
    this.parseClassMethod(node, isGenerator, isAsync, allowsDirectSuper)
  } else {
    this.parseClassField(node)
  }

  return node
}

Parserjs.prototype.isClassElementNameStart = function() {
  return (
    this.type === tt.name ||
    this.type === tt.privateId ||
    this.type === tt.num ||
    this.type === tt.string ||
    this.type === tt.bracketL ||
    this.type.keyword
  )
}

Parserjs.prototype.parseClassElementName = function(element) {
  if (this.type === tt.privateId) {
    if (this.value === "constructor") {
      this.raise(this.start, "Classes can't have an element named '#constructor'")
    }
    element.computed = false
    element.key = this.parsePrivateIdent()
  } else {
    this.parsePropertyName(element)
  }
}

Parserjs.prototype.parseClassMethod = function(method, isGenerator, isAsync, allowsDirectSuper) {
  // Check key and flags
  const key = method.key
  if (method.kind === "constructor") {
    if (isGenerator) this.raise(key.start, "Constructor can't be a generator")
    if (isAsync) this.raise(key.start, "Constructor can't be an async method")
  } else if (method.static && checkKeyName(method, "prototype")) {
    this.raise(key.start, "Classes may not have a static property named prototype")
  }

  // Parse value
  const value = method.value = this.parseMethod(isGenerator, isAsync, allowsDirectSuper)

  // Check value
  if (method.kind === "get" && value.params.length !== 0)
    this.raiseRecoverable(value.start, "getter should have no params")
  if (method.kind === "set" && value.params.length !== 1)
    this.raiseRecoverable(value.start, "setter should have exactly one param")
  if (method.kind === "set" && value.params[0].type === "RestElement")
    this.raiseRecoverable(value.params[0].start, "Setter cannot use rest params")

  return this.finishNode(method, "MethodDefinition")
}

Parserjs.prototype.parseClassField = function(field) {
  if (checkKeyName(field, "constructor")) {
    this.raise(field.key.start, "Classes can't have a field named 'constructor'")
  } else if (field.static && checkKeyName(field, "prototype")) {
    this.raise(field.key.start, "Classes can't have a static field named 'prototype'")
  }

  if (this.eat(tt.eq)) {
    // To raise SyntaxError if 'arguments' exists in the initializer.
    const scope = this.currentThisScope()
    const inClassFieldInit = scope.inClassFieldInit
    scope.inClassFieldInit = true
    field.value = this.parseMaybeAssign()
    scope.inClassFieldInit = inClassFieldInit
  } else {
    field.value = null
  }
  this.semicolon()

  return this.finishNode(field, "PropertyDefinition")
}

Parserjs.prototype.parseClassStaticBlock = function(node) {
  node.body = []

  let oldLabels = this.labels
  this.labels = []
  this.enterScope(SCOPE_CLASS_STATIC_BLOCK | SCOPE_SUPER)
  while (this.type !== tt.braceR) {
    let stmt = this.parseStatement(null)
    node.body.push(stmt)
  }
  this.next()
  this.exitScope()
  this.labels = oldLabels

  return this.finishNode(node, "StaticBlock")
}

Parserjs.prototype.parseClassId = function(node, isStatement) {
  if (this.type === tt.name) {
    node.id = this.parseIdent()
    if (isStatement)
      this.checkLValSimple(node.id, BIND_LEXICAL, false)
  } else {
    if (isStatement === true)
      this.unexpected()
    node.id = null
  }
}

Parserjs.prototype.parseClassSuper = function(node) {
  node.superClass = this.eat(tt._extends) ? this.parseExprSubscripts(null, false) : null
}

Parserjs.prototype.enterClassBody = function() {
  const element = {declared: Object.create(null), used: []}
  this.privateNameStack.push(element)
  return element.declared
}

Parserjs.prototype.exitClassBody = function() {
  const {declared, used} = this.privateNameStack.pop()
  const len = this.privateNameStack.length
  const parent = len === 0 ? null : this.privateNameStack[len - 1]
  for (let i = 0; i < used.length; ++i) {
    const id = used[i]
    if (!hasOwn(declared, id.name)) {
      if (parent) {
        parent.used.push(id)
      } else {
        this.raiseRecoverable(id.start, `Private field '#${id.name}' must be declared in an enclosing class`)
      }
    }
  }
}

function isPrivateNameConflicted(privateNameMap, element) {
  const name = element.key.name
  const curr = privateNameMap[name]

  let next = "true"
  if (element.type === "MethodDefinition" && (element.kind === "get" || element.kind === "set")) {
    next = (element.static ? "s" : "i") + element.kind
  }

  // `class { get #a(){}; static set #a(_){} }` is also conflict.
  if (
    curr === "iget" && next === "iset" ||
    curr === "iset" && next === "iget" ||
    curr === "sget" && next === "sset" ||
    curr === "sset" && next === "sget"
  ) {
    privateNameMap[name] = "true"
    return false
  } else if (!curr) {
    privateNameMap[name] = next
    return false
  } else {
    return true
  }
}

function checkKeyName(node, name) {
  const {computed, key} = node
  return !computed && (
    key.type === "Identifier" && key.name === name ||
    key.type === "Literal" && key.value === name
  )
}

// Parses module export declaration.

Parserjs.prototype.parseExport = function(node, exports) {
  this.next()
  // export * from '...'
  if (this.eat(tt.star)) {
    if (this.options.ecmaVersion >= 11) {
      if (this.eatContextual("as")) {
        node.exported = this.parseModuleExportName()
        this.checkExport(exports, node.exported, this.lastTokStart)
      } else {
        node.exported = null
      }
    }
    this.expectContextual("from")
    if (this.type !== tt.string) this.unexpected()
    node.source = this.parseExprAtom()
    this.semicolon()
    return this.finishNode(node, "ExportAllDeclaration")
  }
  if (this.eat(tt._default)) { // export default ...
    this.checkExport(exports, "default", this.lastTokStart)
    let isAsync
    if (this.type === tt._function || (isAsync = this.isAsyncFunction())) {
      let fNode = this.startNode()
      this.next()
      if (isAsync) this.next()
      node.declaration = this.parseFunction(fNode, FUNC_STATEMENT | FUNC_NULLABLE_ID, false, isAsync)
    } else if (this.type === tt._class) {
      let cNode = this.startNode()
      node.declaration = this.parseClass(cNode, "nullableID")
    } else {
      node.declaration = this.parseMaybeAssign()
      this.semicolon()
    }
    return this.finishNode(node, "ExportDefaultDeclaration")
  }
  // export var|const|let|function|class ...
  if (this.shouldParseExportStatement()) {
    node.declaration = this.parseStatement(null)
    if (node.declaration.type === "VariableDeclaration")
      this.checkVariableExport(exports, node.declaration.declarations)
    else
      this.checkExport(exports, node.declaration.id, node.declaration.id.start)
    node.specifiers = []
    node.source = null
  } else { // export { x, y as z } [from '...']
    node.declaration = null
    node.specifiers = this.parseExportSpecifiers(exports)
    if (this.eatContextual("from")) {
      if (this.type !== tt.string) this.unexpected()
      node.source = this.parseExprAtom()
    } else {
      for (let spec of node.specifiers) {
        // check for keywords used as local names
        this.checkUnreserved(spec.local)
        // check if export is defined
        this.checkLocalExport(spec.local)

        if (spec.local.type === "Literal") {
          this.raise(spec.local.start, "A string literal cannot be used as an exported binding without `from`.")
        }
      }

      node.source = null
    }
    this.semicolon()
  }
  return this.finishNode(node, "ExportNamedDeclaration")
}

Parserjs.prototype.checkExport = function(exports, name, pos) {
  if (!exports) return
  if (typeof name !== "string")
    name = name.type === "Identifier" ? name.name : name.value
  if (hasOwn(exports, name))
    this.raiseRecoverable(pos, "Duplicate export '" + name + "'")
  exports[name] = true
}

Parserjs.prototype.checkPatternExport = function(exports, pat) {
  let type = pat.type
  if (type === "Identifier")
    this.checkExport(exports, pat, pat.start)
  else if (type === "ObjectPattern")
    for (let prop of pat.properties)
      this.checkPatternExport(exports, prop)
  else if (type === "ArrayPattern")
    for (let elt of pat.elements) {
      if (elt) this.checkPatternExport(exports, elt)
    }
  else if (type === "Property")
    this.checkPatternExport(exports, pat.value)
  else if (type === "AssignmentPattern")
    this.checkPatternExport(exports, pat.left)
  else if (type === "RestElement")
    this.checkPatternExport(exports, pat.argument)
  else if (type === "ParenthesizedExpression")
    this.checkPatternExport(exports, pat.expression)
}

Parserjs.prototype.checkVariableExport = function(exports, decls) {
  if (!exports) return
  for (let decl of decls)
    this.checkPatternExport(exports, decl.id)
}

Parserjs.prototype.shouldParseExportStatement = function() {
  return this.type.keyword === "var" ||
    this.type.keyword === "const" ||
    this.type.keyword === "class" ||
    this.type.keyword === "function" ||
    this.isLet() ||
    this.isAsyncFunction()
}

// Parses a comma-separated list of module exports.

Parserjs.prototype.parseExportSpecifiers = function(exports) {
  let nodes = [], first = true
  // export { x, y as z } [from '...']
  this.expect(tt.braceL)
  while (!this.eat(tt.braceR)) {
    if (!first) {
      this.expect(tt.comma)
      if (this.afterTrailingComma(tt.braceR)) break
    } else first = false

    let node = this.startNode()
    node.local = this.parseModuleExportName()
    node.exported = this.eatContextual("as") ? this.parseModuleExportName() : node.local
    this.checkExport(
      exports,
      node.exported,
      node.exported.start
    )
    nodes.push(this.finishNode(node, "ExportSpecifier"))
  }
  return nodes
}

// Parses import declaration.

Parserjs.prototype.parseImport = function(node) {
  this.next()
  // import '...'
  if (this.type === tt.string) {
    node.specifiers = empty
    node.source = this.parseExprAtom()
  } else {
    node.specifiers = this.parseImportSpecifiers()
    this.expectContextual("from")
    node.source = this.type === tt.string ? this.parseExprAtom() : this.unexpected()
  }
  this.semicolon()
  return this.finishNode(node, "ImportDeclaration")
}

// Parses a comma-separated list of module imports.

Parserjs.prototype.parseImportSpecifiers = function() {
  let nodes = [], first = true
  if (this.type === tt.name) {
    // import defaultObj, { x, y as z } from '...'
    let node = this.startNode()
    node.local = this.parseIdent()
    this.checkLValSimple(node.local, BIND_LEXICAL)
    nodes.push(this.finishNode(node, "ImportDefaultSpecifier"))
    if (!this.eat(tt.comma)) return nodes
  }
  if (this.type === tt.star) {
    let node = this.startNode()
    this.next()
    this.expectContextual("as")
    node.local = this.parseIdent()
    this.checkLValSimple(node.local, BIND_LEXICAL)
    nodes.push(this.finishNode(node, "ImportNamespaceSpecifier"))
    return nodes
  }
  this.expect(tt.braceL)
  while (!this.eat(tt.braceR)) {
    if (!first) {
      this.expect(tt.comma)
      if (this.afterTrailingComma(tt.braceR)) break
    } else first = false

    let node = this.startNode()
    node.imported = this.parseModuleExportName()
    if (this.eatContextual("as")) {
      node.local = this.parseIdent()
    } else {
      this.checkUnreserved(node.imported)
      node.local = node.imported
    }
    this.checkLValSimple(node.local, BIND_LEXICAL)
    nodes.push(this.finishNode(node, "ImportSpecifier"))
  }
  return nodes
}

Parserjs.prototype.parseModuleExportName = function() {
  if (this.options.ecmaVersion >= 13 && this.type === tt.string) {
    const stringLiteral = this.parseLiteral(this.value)
    if (loneSurrogate.test(stringLiteral.value)) {
      this.raise(stringLiteral.start, "An export name cannot include a lone surrogate.")
    }
    return stringLiteral
  }
  return this.parseIdent(true)
}

// Set `ExpressionStatement#directive` property for directive prologues.
Parserjs.prototype.adaptDirectivePrologue = function(statements) {
  for (let i = 0; i < statements.length && this.isDirectiveCandidate(statements[i]); ++i) {
    statements[i].directive = statements[i].expression.raw.slice(1, -1)
  }
}
Parserjs.prototype.isDirectiveCandidate = function(statement) {
  return (
    this.options.ecmaVersion >= 5 &&
    statement.type === "ExpressionStatement" &&
    statement.expression.type === "Literal" &&
    typeof statement.expression.value === "string" &&
    // Reject parenthesized strings.
    (this.input[statement.start] === "\"" || this.input[statement.start] === "'")
  )
}




/** -------------------------------------------------------------------- */
// 여기부분은 parserutil.js 를 가져온다.
/** -------------------------------------------------------------------- */

/*
import {types as tt} from "./tokentype.js"
import {Parser} from "./state.js"
import {lineBreak, skipWhiteSpace} from "./whitespace.js"

const pp = Parser.prototype
*/
// ## Parser utilities

const literal = /^(?:'((?:\\.|[^'\\])*?)'|"((?:\\.|[^"\\])*?)")/
Parserjs.prototype.strictDirective = function(start) {
  if (this.options.ecmaVersion < 5) return false
  for (;;) {
    // Try to find string literal.
    skipWhiteSpace.lastIndex = start
    start += skipWhiteSpace.exec(this.input)[0].length
    let match = literal.exec(this.input.slice(start))
    if (!match) return false
    if ((match[1] || match[2]) === "use strict") {
      skipWhiteSpace.lastIndex = start + match[0].length
      let spaceAfter = skipWhiteSpace.exec(this.input), end = spaceAfter.index + spaceAfter[0].length
      let next = this.input.charAt(end)
      return next === ";" || next === "}" ||
        (lineBreak.test(spaceAfter[0]) &&
         !(/[(`.[+\-/*%<>=,?^&]/.test(next) || next === "!" && this.input.charAt(end + 1) === "="))
    }
    start += match[0].length

    // Skip semicolon, if any.
    skipWhiteSpace.lastIndex = start
    start += skipWhiteSpace.exec(this.input)[0].length
    if (this.input[start] === ";")
      start++
  }
}

// Predicate that tests whether the next token is of the given
// type, and if yes, consumes it as a side effect.

Parserjs.prototype.eat = function(type) {
  if (this.type === type) {
    this.next()
    return true
  } else {
    return false
  }
}

// Tests whether parsed token is a contextual keyword.

Parserjs.prototype.isContextual = function(name) {
  return this.type === tt.name && this.value === name && !this.containsEsc
}

// Consumes contextual keyword if possible.

Parserjs.prototype.eatContextual = function(name) {
  if (!this.isContextual(name)) return false
  this.next()
  return true
}

// Asserts that following token is given contextual keyword.

Parserjs.prototype.expectContextual = function(name) {
  if (!this.eatContextual(name)) this.unexpected()
}

// Test whether a semicolon can be inserted at the current position.

Parserjs.prototype.canInsertSemicolon = function() {
  return this.type === tt.eof ||
    this.type === tt.braceR ||
    lineBreak.test(this.input.slice(this.lastTokEnd, this.start))
}

Parserjs.prototype.insertSemicolon = function() {
  if (this.canInsertSemicolon()) {
    if (this.options.onInsertedSemicolon)
      this.options.onInsertedSemicolon(this.lastTokEnd, this.lastTokEndLoc)
    return true
  }
}

// Consume a semicolon, or, failing that, see if we are allowed to
// pretend that there is a semicolon at this position.

Parserjs.prototype.semicolon = function() {
  if (!this.eat(tt.semi) && !this.insertSemicolon()) this.unexpected()
}

Parserjs.prototype.afterTrailingComma = function(tokType, notNext) {
  if (this.type === tokType) {
    if (this.options.onTrailingComma)
      this.options.onTrailingComma(this.lastTokStart, this.lastTokStartLoc)
    if (!notNext)
      this.next()
    return true
  }
}

// Expect a token of a given type. If found, consume it, otherwise,
// raise an unexpected token error.

Parserjs.prototype.expect = function(type) {
  this.eat(type) || this.unexpected()
}

// Raise an unexpected token error.

Parserjs.prototype.unexpected = function(pos) {
  this.raise(pos != null ? pos : this.start, "Unexpected token")
}

/*
export class DestructuringErrors {
  constructor() {
    this.shorthandAssign =
    this.trailingComma =
    this.parenthesizedAssign =
    this.parenthesizedBind =
    this.doubleProto =
      -1
  }
}
*/

function DestructuringErrors() {
    this.shorthandAssign =
    this.trailingComma =
    this.parenthesizedAssign =
    this.parenthesizedBind =
    this.doubleProto =
      -1
}

Parserjs.prototype.checkPatternErrors = function(refDestructuringErrors, isAssign) {
  if (!refDestructuringErrors) return
  if (refDestructuringErrors.trailingComma > -1)
    this.raiseRecoverable(refDestructuringErrors.trailingComma, "Comma is not permitted after the rest element")
  let parens = isAssign ? refDestructuringErrors.parenthesizedAssign : refDestructuringErrors.parenthesizedBind
  if (parens > -1) this.raiseRecoverable(parens, isAssign ? "Assigning to rvalue" : "Parenthesized pattern")
}

Parserjs.prototype.checkExpressionErrors = function(refDestructuringErrors, andThrow) {
  if (!refDestructuringErrors) return false
  let {shorthandAssign, doubleProto} = refDestructuringErrors
  if (!andThrow) return shorthandAssign >= 0 || doubleProto >= 0
  if (shorthandAssign >= 0)
    this.raise(shorthandAssign, "Shorthand property assignments are valid only in destructuring patterns")
  if (doubleProto >= 0)
    this.raiseRecoverable(doubleProto, "Redefinition of __proto__ property")
}

Parserjs.prototype.checkYieldAwaitInDefaultParams = function() {
  if (this.yieldPos && (!this.awaitPos || this.yieldPos < this.awaitPos))
    this.raise(this.yieldPos, "Yield expression cannot be a default value")
  if (this.awaitPos)
    this.raise(this.awaitPos, "Await expression cannot be a default value")
}

Parserjs.prototype.isSimpleAssignTarget = function(expr) {
  if (expr.type === "ParenthesizedExpression")
    return this.isSimpleAssignTarget(expr.expression)
  return expr.type === "Identifier" || expr.type === "MemberExpression"
}


//})();
