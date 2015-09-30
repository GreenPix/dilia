// Parse entry point
{
  var globals = arguments[1];
  var locals = new Locals();

  function combine(first, rest, combiners) {
    var result = first, i;

    for (i = 0; i < rest.length; i++) {
      result = combiners[rest[i][1]](result, rest[i][3]);
    }

    return result;
  }
  function Locals() {
    this.stack = [{}];
    this.skipInstruction = [false];
    this.get = function (ident) {
      for (var i = this.stack.length - 1; i >= 0; --i) {
        if (ident in this.stack[i]) {
          return this.stack[i][ident];
        }
      }
      gen_error(ident);
    }
    // Proposal 2
    this.set = function (ident, expr) {
      for (var i = 0; i < this.stack.length; i++) {
        if (ident in this.stack[i]) {
          this.stack[i][ident] = expr;
          return;
        }
      }
      this.stack[this.stack.length - 1][ident] = expr;
    }
    this.push_scope = function (exec) {
      var s = this.skipInstruction[this.skipInstruction.length - 1] || !exec;
      this.skipInstruction.push(s)
      this.stack.push({});
    }
    this.pop_scope = function () { this.stack.pop(); }
    this.should_exec = function () {
      return !this.skipInstruction[this.skipInstruction.length - 1]
    }
  }
  //////////////////////////////////////////////////////////////////
  /// Scopes
  ///
  function push_scope(should_exec) {
    locals.push_scope(should_exec);
  }
  function pop_scope() {
    locals.pop_scope();
  }
  function should_exec() {
    return locals.should_exec();
  }

  //////////////////////////////////////////////////////////////////
  /// Setters/Getters for stores
  ///
  function get_local(ident)  { return should_exec() ? locals.get(ident): 0;     }
  function get_global(ident) { return should_exec() ? __get(ident, globals): 0; }
  function set_local(ident, expr)   { locals.set(ident, expr); }
  function set_global(ident, expr)  {
    if (ident in globals) {
      globals[ident] = expr;
    } else {
      gen_error('$' + ident);
    }
  }
  function is_gdef(ident)          { return __defined(ident, globals); }
  function __defined(ident, store) { return ident in store; }
  function __get(ident, store) {
    if (__defined(ident, store)) {
      return store[ident];
    }
    gen_error(ident);
  }

  //////////////////////////////////////////////////////////////////
  /// Error handling
  ///
  function gen_error(ident) {
    var pos = peg$reportedPos;
    var posDetails = peg$computePosDetails(pos);
    throw new IllFormedError(
      "`" + ident + "` doesn't exists.",
      "",
      "",
      pos,
      posDetails.line,
      posDetails.column
    )
  }
  function IllFormedError(message, expected, found, offset, line, column) {
    this.message  = message;
    this.expected = expected;
    this.found    = found;
    this.offset   = offset;
    this.line     = line;
    this.column   = column;
    this.name     = "IllFormedError";
  }
  function subclass(child, parent) {
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
  }
  subclass(IllFormedError, Error);
}

//////////////////////////////////////////////////////////////////
/// PEG Grammar for AaribaScript
///

Program
  = InstructionList {
    return locals.stack;
  }

InstructionList
  = ins_list:(_ Instruction _)*

Instruction
  = Comment
  / Assignment
  / IfStatement

Comment "comment"
  = "//" [^\n\r]* [\n\r]?

Assignment
  = ident:LocalIdent _ "=" _ expr:Expression ";" {
    if (should_exec()) {
      set_local(ident, expr);
    }
  }
  / ident:GlobalIdent _ "=" _ expr:Expression ";" {
    if (should_exec()) {
      set_global(ident, expr);
    }
  }

IfStatement
  = "if" _ ident:GlobalIdent _ "{" ! { push_scope(is_gdef(ident)); }
      _? InstructionList
  "}" ! { pop_scope(); }

Expression
  = first:Term rest:(_ ("+" / "-") _ Term)* {
      return combine(first, rest, {
        "+": function(left, right) { return left + right; },
        "-": function(left, right) { return left - right; }
      });
    }

Term
  = first:Factor rest:(_ ("*" / "/" / "^") _ Factor)* {
      return combine(first, rest, {
        "*": function(left, right) { return left * right; },
        "/": function(left, right) { return left / right; },
        "^": function(left, right) { return Math.pow(left, right); }
      });
    }

Factor
  = "(" _ expr:Expression _ ")" { return expr; }
  / ident:LocalIdent            { return get_local(ident); }
  / gident:GlobalIdent          { return get_global(gident); }
  / Number

LocalIdent "local variable"
  = [a-zA-Z_\u00a1-\uffff][\.\da-zA-Z_\u00a1-\uffff]* {
    return text();
  }

GlobalIdent "global variable"
  = [\$][a-zA-Z_\u00a1-\uffff\d][\.\da-zA-Z_\u00a1-\uffff]* {
    return text().substring(1);
  }


Number "number"
  = Minus? Int Frac? Exp? { return parseFloat(text()); }

DecimalPoint  = "."
Digit1_9      = [1-9]
Digit         = [0-9]
E             = [eE]
Exp           = E (Minus / Plus)? Digit+
Frac          = DecimalPoint Digit+
Int           = Zero / (Digit1_9 Digit*)
Minus         = "-"
Plus          = "+"
Zero          = "0"

_ "whitespace"
  = [ \t\n\r]*
