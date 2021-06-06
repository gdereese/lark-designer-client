import flask
import flask_cors
import lark


app = flask.Flask(__name__)
cors = flask_cors.CORS(app)

class NodeTransformer(lark.visitors.Transformer):
    def __default__(self, data, children, meta):
        return {
            "value": None,
            "type": data,
            "nodes": children
        }

    def __default_token__(self, token):
        return {
            "value": token.value,
            "type": token.type,
            "nodes": None
        }

@app.route("/validate", methods=["POST"])
def validate():
    req = flask.request.get_json()

    try:
        parser = lark.Lark(req["grammar"], 
            #"cache": True,
        )

        return {
            "grammar": {
                "is_valid": True,
                "error": None
            }
        }
    except lark.GrammarError as grammar_err:
        return {
            "grammar": {
                "is_valid": False,
                "error": {
                    "message": str(grammar_err)
                }
            }
        }
    except lark.exceptions.UnexpectedToken as token_err:
        return {
            "grammar": {
                "is_valid": False,
                "error": {
                    "message": str(token_err)
                }
            }
        }

@app.route("/parse", methods=["POST"])
def parse():
    req = flask.request.get_json()

    try:
        parser = lark.Lark(req["grammar"], 
            #"cache": True,
        )
    except lark.GrammarError as grammar_err:
        return {
            "grammar": {
                "is_valid": False,
                "error": {
                    "message": str(grammar_err)
                }
            },
            "input": None,
            "output": None
        }
    except lark.exceptions.UnexpectedToken as token_err:
        return {
            "grammar": {
                "is_valid": False,
                "error": {
                    "message": str(token_err)
                }
            },
            "input": None,
            "output": None
        }

    try:
        ast = NodeTransformer().transform(parser.parse(req["input"]))

        return {
            "grammar": {
                "is_valid": True,
                "error": None,
            },
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
            "grammar": {
                "is_valid": True,
                "error": None
            },
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
            "grammar": {
                "is_valid": True,
                "error": None
            },
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
