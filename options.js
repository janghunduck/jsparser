


// 파서 프로세스를 구성하려면 두 번째 인수를 지정해야 합니다.
// 다음 옵션이 인식됩니다(`ecmaVersion`만 필요함).

const defaultOptions = {

  ecmaVersion: null,          //`ecmaVersion`은 파싱할 ECMAScript 버전을 나타냅니다. ( 3, 5, 6 (or 2015), 7 (2016), 8 (2017), 9 (2018), 10 (2019), 11 (2020), 12 (2021), 13 (2022), 14 (2023), or `"latest"`)
                              //(라이브러리가 지원하는 최신 버전). 이는 엄격 모드 지원, 예약어 집합 및 새로운 구문 기능 지원에 영향을 미칩니다.
  sourceType: "script",       //`sourceType`은 코드를 파싱해야 하는 모드를 나타냅니다.
                              //`"script"` 또는 `"module"`일 수 있다. 이는 전역 엄격 모드와 'import' 및 'export' 선언의 구문 분석에 영향을 미칩니다.
  onInsertedSemicolon: null,  //`onInsertedSemicolon`은 세미콜론이 자동으로 삽입될 때 호출되는 콜백일 수 있습니다.
                              //쉼표의 위치를 오프셋으로 전달하며 `locations`가 활성화된 경우 두 번째 인수로 `{line, column}` 객체로 위치가 제공됩니다.
  onTrailingComma: null,      //`onTrailingComma`는 `onInsertedSemicolon`과 유사하지만 후행 쉼표에 사용됩니다.
  allowReserved: null,        //기본적으로 예약어는 ecmaVersion >= 5인 경우에만 적용됩니다.
                              //`allowReserved`를 부울 값으로 설정하여 명시적으로 켜거나 끕니다. 이 옵션의 값이 "never"이면 예약어 및 키워드도 속성 이름으로 사용할 수 없습니다.
  allowReturnOutsideFunction: false,   //활성화되면 최상위 수준의 반환은 오류로 간주되지 않습니다.
  allowImportExportEverywhere: false,  //활성화되면 import/export 문이 프로그램 상단에 표시되도록 제한되지 않으며 스크립트의 import.meta 표현식은 오류로 간주되지 않습니다.
  allowAwaitOutsideFunction: null,     //기본적으로 대기 식별자(await identifiers)는 ecmaVersion >= 2022인 경우에만 최상위 범위에 나타날 수 있습니다.
                                       //활성화되면 await 식별자가 최상위 범위에 나타날 수 있지만 비동기가 아닌 함수(non-async functions)에서는 여전히 허용되지 않습니다.
  allowSuperOutsideMethod: null,       // 활성화되면 수퍼 식별자는 메서드에 표시되도록 제한되지 않으며 다른 위치에 표시될 때 오류를 발생시키지 않습니다.
  allowHashBang: false,      //활성화되면 파일 시작 부분의 hashbang 지시문이 허용되고 라인 주석으로 처리됩니다. `ecmaVersion` >= 2023일 때 기본적으로 활성화됩니다.
  locations: false,          //`locations`가 켜져 있으면 `{line, column}`(line being 1-based and column 0-based) 형식의 `start` 및 `end` 속성을 가진 객체를 포함하는 `loc` 속성이 노드에 연결됩니다.
  onToken: null,             //함수는 `onToken` 옵션으로 전달될 수 있으며, 이는 Acorn이 `tokenizer().getToken()`에서 반환된 토큰과 동일한 형식의 객체로 해당 함수를 호출하도록 합니다.
                             //내부 상태를 손상시키는 콜백에서 파서를 호출할 수 없습니다.
  onComment: null,           //함수는 `onComment` 옵션으로 전달될 수 있습니다.
                             //그러면 Acorn이 주석을 건너뛸 때마다 `(block, text, start, end)` 매개변수로 해당 함수를 호출하게 됩니다.
                             //`block`은 이것이 블록(`/* */`) 주석인지 여부를 나타내는 부울이고, `text`는 주석의 내용이며, `start`와 `end`는 시작과 끝을 나타내는 문자 오프셋입니다.
                             //의견. `locations` 옵션이 켜져 있으면 주석의 시작과 끝의 전체 `{line, column}` 위치라는 두 개의 매개변수가 더 전달됩니다.
                             //내부 상태를 손상시키는 콜백에서 파서를 호출할 수 없습니다.
  ranges: false,             //노드에는 `start` 및 `end` 속성에 기록된 시작 및 끝 문자 오프셋이 있습니다(행/열 데이터를 보유하는 `loc` 개체가 아닌 노드에 직접 있음).
                             //또한 [semi-standardized]를 추가하려면 [range] `range` 속성은 동일한 숫자의 `[start, end]` 배열을 보유하고 `ranges` 옵션을 `true`로 설정합니다.
                             //[range]: https://bugzilla.mozilla.org/show_bug.cgi?id=745678
  program: null,             //첫 번째 파일을 파싱하여 생성된 트리를 후속 파싱에서 `program` 옵션으로 전달하면 여러 파일을 하나의 AST로 파싱할 수 있습니다.
                             //이렇게 하면 구문 분석된 파일의 최상위 형식이 기존 구문 분석 트리의 '프로그램'(최상위) 노드에 추가됩니다.
  sourceFile: null,          //`locations`가 켜져 있으면 이를 전달하여 모든 노드의 `loc` 객체에 소스 파일을 기록할 수 있습니다.
  directSourceFile: null,    //이 값이 주어지면 `locations`가 켜져 있든 꺼져 있든 관계없이 모든 노드에 저장됩니다.
  preserveParens: false      //활성화되면 괄호 안의 표현식은 (비표준) ParenthesizedExpression 노드로 표현됩니다.
}

let warnedAboutEcmaVersion = false

function getOptions(opts) {
  let options = {}

  for (let opt in defaultOptions)
    options[opt] = opts && hasOwn(opts, opt) ? opts[opt] : defaultOptions[opt]

  if (options.ecmaVersion === "latest") {
    options.ecmaVersion = 1e8
  } else if (options.ecmaVersion == null) {
    if (!warnedAboutEcmaVersion && typeof console === "object" && console.warn) {
      warnedAboutEcmaVersion = true
      console.warn("Since Acorn 8.0.0, options.ecmaVersion is required.\nDefaulting to 2020, but this will stop working in the future.")
    }
    options.ecmaVersion = 11
  } else if (options.ecmaVersion >= 2015) {
    options.ecmaVersion -= 2009
  }

  if (options.allowReserved == null)
    options.allowReserved = options.ecmaVersion < 5

  if (!opts || opts.allowHashBang == null)
    options.allowHashBang = options.ecmaVersion >= 14

  if (isArray(options.onToken)) {
    let tokens = options.onToken
    options.onToken = (token) => tokens.push(token)
  }
  if (isArray(options.onComment))
    options.onComment = pushComment(options, options.onComment)

  return options
}


function pushComment(options, array) {
  return function(block, text, start, end, startLoc, endLoc) {
    let comment = {
      type: block ? "Block" : "Line",
      value: text,
      start: start,
      end: end
    }
    if (options.locations)
      comment.loc = new SourceLocation(this, startLoc, endLoc)
    if (options.ranges)
      comment.range = [start, end]
    array.push(comment)
  }
}





