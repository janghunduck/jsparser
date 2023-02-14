/*  Token types tokentype.js
1.모든 토큰 유형 변수는 쉽게 알아볼 수 있도록 밑줄로 시작합니다.
2.`beforeExpr` 속성은 정규식과 구분을 구분하는 데 사용됩니다.
  표현식이 뒤에 올 수 있는 모든 토큰 유형에 설정됩니다(따라서 뒤에 슬래시가 있으면 정규 표현식이 됩니다).
3.`startsExpr` 속성은 토큰이 `yield` 표현식을 종료하는지 확인하는 데 사용됩니다.
  표현식을 직접 시작하거나(예: 인용 부호) 표현식을 계속할 수 있는(예: 문자열 본문) 모든 토큰 유형에 설정됩니다.
4.`isLoop`는 키워드를 루프 시작으로 표시합니다. 이는 해당 레이블로 계속 점프를 허용하거나 허용하지 않기 위해 레이블을 구문 분석할 때 알아야 합니다.
*/

var TokenType = function (label, conf = {}) {
//export class TokenType {
//  constructor(label, conf = {}) {
    this.label = label
    this.keyword = conf.keyword
    this.beforeExpr = !!conf.beforeExpr
    this.startsExpr = !!conf.startsExpr
    this.isLoop = !!conf.isLoop
    this.isAssign = !!conf.isAssign
    this.prefix = !!conf.prefix
    this.postfix = !!conf.postfix
    this.binop = conf.binop || null
    this.updateContext = null
//  }
}

function binop(name, prec) {
  return new TokenType(name, {beforeExpr: true, binop: prec})
}
const beforeExpr = {beforeExpr: true}, startsExpr = {startsExpr: true}
//export const keywords = {}
const keywords = {}

function kw(name, options = {}) {
  options.keyword = name
  return keywords[name] = new TokenType(name, options)
}

//export const types = {
const types = {
  num: new TokenType("num", startsExpr),
  regexp: new TokenType("regexp", startsExpr),
  string: new TokenType("string", startsExpr),
  name: new TokenType("name", startsExpr),
  privateId: new TokenType("privateId", startsExpr),
  eof: new TokenType("eof"),

  // Punctuation token types.
  bracketL: new TokenType("[", {beforeExpr: true, startsExpr: true}),
  bracketR: new TokenType("]"),
  braceL: new TokenType("{", {beforeExpr: true, startsExpr: true}),
  braceR: new TokenType("}"),
  parenL: new TokenType("(", {beforeExpr: true, startsExpr: true}),
  parenR: new TokenType(")"),
  comma: new TokenType(",", beforeExpr),
  semi: new TokenType(";", beforeExpr),
  colon: new TokenType(":", beforeExpr),
  dot: new TokenType("."),
  question: new TokenType("?", beforeExpr),
  questionDot: new TokenType("?."),
  arrow: new TokenType("=>", beforeExpr),
  template: new TokenType("template"),
  invalidTemplate: new TokenType("invalidTemplate"),
  ellipsis: new TokenType("...", beforeExpr),
  backQuote: new TokenType("`", startsExpr),
  dollarBraceL: new TokenType("${", {beforeExpr: true, startsExpr: true}),

/*operator. 이것들은 파서가 적절하게 사용할 수 있도록 여러 종류의 속성을 가지고 있습니다(이러한 속성의 존재는 그것들을 연산자로 분류하는 것입니다).
 binop은 이 연산자가 이진 연산자임을 지정하고 우선 순위를 참조합니다.
`postfix` 는  접두사 또는 접미사로 표시하는 단항연산자(unary operator) 이다
`isAssign`은 `=`, `+=`, `-=` 등의 모든 항목을 표시하며 할당 표현식 노드를 생성해야 하는 매우 낮은 우선 순위의 이항 연산자 역할을 합니다.
*/
  eq: new TokenType("=", {beforeExpr: true, isAssign: true}),
  assign: new TokenType("_=", {beforeExpr: true, isAssign: true}),
  incDec: new TokenType("++/--", {prefix: true, postfix: true, startsExpr: true}),
  prefix: new TokenType("!/~", {beforeExpr: true, prefix: true, startsExpr: true}),
  logicalOR: binop("||", 1),
  logicalAND: binop("&&", 2),
  bitwiseOR: binop("|", 3),
  bitwiseXOR: binop("^", 4),
  bitwiseAND: binop("&", 5),
  equality: binop("==/!=/===/!==", 6),
  relational: binop("</>/<=/>=", 7),
  bitShift: binop("<</>>/>>>", 8),
  plusMin: new TokenType("+/-", {beforeExpr: true, binop: 9, prefix: true, startsExpr: true}),
  modulo: binop("%", 10),
  star: binop("*", 10),
  slash: binop("/", 10),
  starstar: new TokenType("**", {beforeExpr: true}),
  coalesce: binop("??", 1),

  // Keyword token types.
  _break: kw("break"),
  _case: kw("case", beforeExpr),
  _catch: kw("catch"),
  _continue: kw("continue"),
  _debugger: kw("debugger"),
  _default: kw("default", beforeExpr),
  _do: kw("do", {isLoop: true, beforeExpr: true}),
  _else: kw("else", beforeExpr),
  _finally: kw("finally"),
  _for: kw("for", {isLoop: true}),
  _function: kw("function", startsExpr),
  _if: kw("if"),
  _return: kw("return", beforeExpr),
  _switch: kw("switch"),
  _throw: kw("throw", beforeExpr),
  _try: kw("try"),
  _var: kw("var"),
  _const: kw("const"),
  _while: kw("while", {isLoop: true}),
  _with: kw("with"),
  _new: kw("new", {beforeExpr: true, startsExpr: true}),
  _this: kw("this", startsExpr),
  _super: kw("super", startsExpr),
  _class: kw("class", startsExpr),
  _extends: kw("extends", beforeExpr),
  _export: kw("export"),
  _import: kw("import", startsExpr),
  _null: kw("null", startsExpr),
  _true: kw("true", startsExpr),
  _false: kw("false", startsExpr),
  _in: kw("in", {beforeExpr: true, binop: 7}),
  _instanceof: kw("instanceof", {beforeExpr: true, binop: 7}),
  _typeof: kw("typeof", {beforeExpr: true, prefix: true, startsExpr: true}),
  _void: kw("void", {beforeExpr: true, prefix: true, startsExpr: true}),
  _delete: kw("delete", {beforeExpr: true, prefix: true, startsExpr: true})
}
