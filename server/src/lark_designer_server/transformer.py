import lark


class NodeTransformer(lark.visitors.Transformer):
    def __default__(self, data, children, meta):
        return {
            "value": None,
            "type": data,
            "location": None,
            "nodes": children
        }

    def __default_token__(self, token):
        return {
            "value": token.value,
            "type": token.type,
            "location": {
                "start": {
                    "line": token.line,
                    "column": token.column,
                    "index": token.pos_in_stream
                },
                "end": {
                    "line": token.end_line,
                    "column": token.end_column,
                    "index": token.end_pos
                }
            },
            "nodes": None
        }
