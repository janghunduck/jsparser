


// �ļ� ���μ����� �����Ϸ��� �� ��° �μ��� �����ؾ� �մϴ�.
// ���� �ɼ��� �νĵ˴ϴ�(`ecmaVersion`�� �ʿ���).

const defaultOptions = {

  ecmaVersion: null,          //`ecmaVersion`�� �Ľ��� ECMAScript ������ ��Ÿ���ϴ�. ( 3, 5, 6 (or 2015), 7 (2016), 8 (2017), 9 (2018), 10 (2019), 11 (2020), 12 (2021), 13 (2022), 14 (2023), or `"latest"`)
                              //(���̺귯���� �����ϴ� �ֽ� ����). �̴� ���� ��� ����, ����� ���� �� ���ο� ���� ��� ������ ������ ��Ĩ�ϴ�.
  sourceType: "script",       //`sourceType`�� �ڵ带 �Ľ��ؾ� �ϴ� ��带 ��Ÿ���ϴ�.
                              //`"script"` �Ǵ� `"module"`�� �� �ִ�. �̴� ���� ���� ���� 'import' �� 'export' ������ ���� �м��� ������ ��Ĩ�ϴ�.
  onInsertedSemicolon: null,  //`onInsertedSemicolon`�� �����ݷ��� �ڵ����� ���Ե� �� ȣ��Ǵ� �ݹ��� �� �ֽ��ϴ�.
                              //��ǥ�� ��ġ�� ���������� �����ϸ� `locations`�� Ȱ��ȭ�� ��� �� ��° �μ��� `{line, column}` ��ü�� ��ġ�� �����˴ϴ�.
  onTrailingComma: null,      //`onTrailingComma`�� `onInsertedSemicolon`�� ���������� ���� ��ǥ�� ���˴ϴ�.
  allowReserved: null,        //�⺻������ ������ ecmaVersion >= 5�� ��쿡�� ����˴ϴ�.
                              //`allowReserved`�� �ο� ������ �����Ͽ� ��������� �Ѱų� ���ϴ�. �� �ɼ��� ���� "never"�̸� ����� �� Ű���嵵 �Ӽ� �̸����� ����� �� �����ϴ�.
  allowReturnOutsideFunction: false,   //Ȱ��ȭ�Ǹ� �ֻ��� ������ ��ȯ�� ������ ���ֵ��� �ʽ��ϴ�.
  allowImportExportEverywhere: false,  //Ȱ��ȭ�Ǹ� import/export ���� ���α׷� ��ܿ� ǥ�õǵ��� ���ѵ��� ������ ��ũ��Ʈ�� import.meta ǥ������ ������ ���ֵ��� �ʽ��ϴ�.
  allowAwaitOutsideFunction: null,     //�⺻������ ��� �ĺ���(await identifiers)�� ecmaVersion >= 2022�� ��쿡�� �ֻ��� ������ ��Ÿ�� �� �ֽ��ϴ�.
                                       //Ȱ��ȭ�Ǹ� await �ĺ��ڰ� �ֻ��� ������ ��Ÿ�� �� ������ �񵿱Ⱑ �ƴ� �Լ�(non-async functions)������ ������ ������ �ʽ��ϴ�.
  allowSuperOutsideMethod: null,       // Ȱ��ȭ�Ǹ� ���� �ĺ��ڴ� �޼��忡 ǥ�õǵ��� ���ѵ��� ������ �ٸ� ��ġ�� ǥ�õ� �� ������ �߻���Ű�� �ʽ��ϴ�.
  allowHashBang: false,      //Ȱ��ȭ�Ǹ� ���� ���� �κ��� hashbang ���ù��� ���ǰ� ���� �ּ����� ó���˴ϴ�. `ecmaVersion` >= 2023�� �� �⺻������ Ȱ��ȭ�˴ϴ�.
  locations: false,          //`locations`�� ���� ������ `{line, column}`(line being 1-based and column 0-based) ������ `start` �� `end` �Ӽ��� ���� ��ü�� �����ϴ� `loc` �Ӽ��� ��忡 ����˴ϴ�.
  onToken: null,             //�Լ��� `onToken` �ɼ����� ���޵� �� ������, �̴� Acorn�� `tokenizer().getToken()`���� ��ȯ�� ��ū�� ������ ������ ��ü�� �ش� �Լ��� ȣ���ϵ��� �մϴ�.
                             //���� ���¸� �ջ��Ű�� �ݹ鿡�� �ļ��� ȣ���� �� �����ϴ�.
  onComment: null,           //�Լ��� `onComment` �ɼ����� ���޵� �� �ֽ��ϴ�.
                             //�׷��� Acorn�� �ּ��� �ǳʶ� ������ `(block, text, start, end)` �Ű������� �ش� �Լ��� ȣ���ϰ� �˴ϴ�.
                             //`block`�� �̰��� ���(`/* */`) �ּ����� ���θ� ��Ÿ���� �ο��̰�, `text`�� �ּ��� �����̸�, `start`�� `end`�� ���۰� ���� ��Ÿ���� ���� �������Դϴ�.
                             //�ǰ�. `locations` �ɼ��� ���� ������ �ּ��� ���۰� ���� ��ü `{line, column}` ��ġ��� �� ���� �Ű������� �� ���޵˴ϴ�.
                             //���� ���¸� �ջ��Ű�� �ݹ鿡�� �ļ��� ȣ���� �� �����ϴ�.
  ranges: false,             //��忡�� `start` �� `end` �Ӽ��� ��ϵ� ���� �� �� ���� �������� �ֽ��ϴ�(��/�� �����͸� �����ϴ� `loc` ��ü�� �ƴ� ��忡 ���� ����).
                             //���� [semi-standardized]�� �߰��Ϸ��� [range] `range` �Ӽ��� ������ ������ `[start, end]` �迭�� �����ϰ� `ranges` �ɼ��� `true`�� �����մϴ�.
                             //[range]: https://bugzilla.mozilla.org/show_bug.cgi?id=745678
  program: null,             //ù ��° ������ �Ľ��Ͽ� ������ Ʈ���� �ļ� �Ľ̿��� `program` �ɼ����� �����ϸ� ���� ������ �ϳ��� AST�� �Ľ��� �� �ֽ��ϴ�.
                             //�̷��� �ϸ� ���� �м��� ������ �ֻ��� ������ ���� ���� �м� Ʈ���� '���α׷�'(�ֻ���) ��忡 �߰��˴ϴ�.
  sourceFile: null,          //`locations`�� ���� ������ �̸� �����Ͽ� ��� ����� `loc` ��ü�� �ҽ� ������ ����� �� �ֽ��ϴ�.
  directSourceFile: null,    //�� ���� �־����� `locations`�� ���� �ֵ� ���� �ֵ� ������� ��� ��忡 ����˴ϴ�.
  preserveParens: false      //Ȱ��ȭ�Ǹ� ��ȣ ���� ǥ������ (��ǥ��) ParenthesizedExpression ���� ǥ���˴ϴ�.
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





