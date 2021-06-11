import flask
import lark

import transformer


app = flask.Flask(__name__)

@app.route("/validate", methods=["POST"])
def validate():
    req = flask.request.get_json()

    _, parse_res = _parse_grammar(req["grammar"])

    return {
        "grammar": parse_res
    }


@app.route("/parse", methods=["POST"])
def parse():
    req = flask.request.get_json()

    parser, parse_res = _parse_grammar(req["grammar"])

    try:
        trans = transformer.NodeTransformer()
        ast = trans.transform(parser.parse(req["input"]))

        return {
            "grammar": parse_res,
            "input": {
                "is_valid": True,
                "error": None
            },
            "output": {
                "ast": ast
            }
        }
    except lark.exceptions.UnexpectedEOF as eof_err:
        return {
            "grammar": parse_res,
            "input": {
                "is_valid": False,
                "error": {
                    "line": eof_err.line,
                    "column": eof_err.column,
                    "message": str(eof_err)
                }
            },
            "output": None
        }
    except lark.exceptions.UnexpectedCharacters as char_err:
        return {
            "grammar": parse_res,
            "input": {
                "is_valid": False,
                "error": {
                    "line": char_err.line,
                    "column": char_err.column,
                    "message": str(char_err)
                }
            },
            "output": None
        }

def _parse_grammar(grammar):
    try:
        parser = lark.Lark(grammar, 
            #cache=True,
            propagate_positions=True
        )

        return (parser, {
            "is_valid": True,
            "error": None
        })
    except lark.GrammarError as grammar_err:
        return (None, {
            "is_valid": False,
            "error": {
                "message": str(grammar_err)
            }
        })
    except lark.exceptions.UnexpectedToken as token_err:
        return (None, {
            "is_valid": False,
            "error": {
                "message": str(token_err)
            }
        })
