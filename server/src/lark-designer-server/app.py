import flask
import flask_cors
import lark


app = flask.Flask(__name__)
cors = flask_cors.CORS(app)

@app.route("/validate", methods=["POST"])
def validate():
    req = flask.request.get_json()

    try:
        parser = lark.Lark(req["grammar"], 
            #"cache": True,
        )

        return {
            "is_valid": True,
            "error": None
        }
    except lark.GrammarError as grammar_err:
        return {
            "is_valid": False,
            "error": grammar_err.args[0]
        }

@app.route("/parse", methods=["POST"])
def parse():
    req = flask.request.get_json()

    try:
        parser = lark.Lark(req["grammar"], 
            propagate_positions=True,
            #"cache": True,
        )
    except lark.GrammarError as grammar_err:
        return {
            "ast": None,
            "error": {
                "type": "grammar",
                "message": grammar_err.args[0]
            }
        }

    ast = parser.parse(req["input"])

    return {
        "ast": ast,
        "error": None
    }
