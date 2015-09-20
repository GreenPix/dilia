// Parse entry point
{
  var globals = arguments[1];
  var locals = {};

  function combine(first, rest, combiners) {
    var result = first, i;

    for (i = 0; i < rest.length; i++) {
      result = combiners[rest[i][1]](result, rest[i][3]);
    }

    return result;
  }

  //////////////////////////////////////////////////////////////////
  /// Setters/Getters for stores
  ///
  function get_local(ident)         { return __get(ident, locals); }
  function get_global(ident)        { return __get(ident.substring(1), globals); }
  function set_local(ident, expr)   { locals[ident] = expr; }
  function set_global(ident, expr)  {
    var gident = ident.substring(1);
    if (gident in globals) {
      globals[gident] = expr;
    } else {
      gen_error(ident);
    }
  }
  function __get(ident, store) {
    if (ident in store) {
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

Program "aariba script"
  = prog:AssignOrComment* {
    return locals;
  }

AssignOrComment
  = _ Assignment
  / _ Comment

Comment "single line comment"
  = "//" [^\n\r]* [\n\r]?

Assignment "assignment"
  = ident:LocalIdent _ "=" _ expr:Expression ";" _ {
    set_local(ident, expr);
  }
  / ident:GlobalIdent _ "=" _ expr:Expression ";" _ {
    set_global(ident, expr);
  }

Expression "expression"
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
  / ident:LocalIdent { return get_local(ident); }
  / gident:GlobalIdent { return get_global(gident); }
  / Number

LocalIdent "ident"
  = [a-zA-Z_\u00a1-\uffff][\.\da-zA-Z_\u00a1-\uffff]* {
    return text();
  }

GlobalIdent "globalIdent"
  = [\$][a-zA-Z_\u00a1-\uffff][\.\da-zA-Z_\u00a1-\uffff]* {
    return text();
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
