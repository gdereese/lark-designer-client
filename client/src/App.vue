<template>
  <div>
    <NavigationBar color="primary">
      <template #brand>
        <span class="navbar-item">Lark Designer</span>
      </template>
    </NavigationBar>

    <main class="section">
      <Block>
        <textarea
          class="textarea grammar-edit"
          placeholder="enter Lark grammar"
          v-model="grammar.text"
        ></textarea>
      </Block>

      <Block>
        <Button
          :is-disabled="!canValidate || grammar.isValidating"
          :is-loading="grammar.isValidating"
          @click="validate"
        >
          Validate
        </Button>
        <span class="icon-text has-text-success m-2" v-if="grammar.isValid">
          <Icon>
            <span class="las la-check"></span>
          </Icon>
          <span>Valid</span>
        </span>
        <span class="icon-text has-text-danger m-2" v-else-if="grammar.error">
          <Icon>
            <span class="las la-times"></span>
          </Icon>
          <span>Invalid</span>
        </span>
      </Block>

      <Block v-if="grammar.error">
        <Message color="danger">
          <template #body>
            <span v-html="grammar.error.message"></span>
          </template>
        </Message>
      </Block>

      <div class="columns">
        <div class="column">
          <Block>
            <textarea
              class="textarea input-edit"
              placeholder="enter test input"
              v-model.lazy="input.text"
            ></textarea>
          </Block>

          <Block>
            <Button
              :is-disabled="input.isParsing"
              :is-loading="input.isParsing"
              @click="parseInput"
              >Parse</Button
            >
            <span class="icon-text has-text-success m-2" v-if="input.isValid">
              <Icon>
                <span class="las la-check"></span>
              </Icon>
              <span>Valid</span>
            </span>
            <span class="icon-text has-text-danger m-2" v-else-if="input.error">
              <Icon>
                <span class="las la-times"></span>
              </Icon>
              <span>Invalid</span>
            </span>
          </Block>

          <Block v-if="input.error">
            <Message color="danger">
              <template #body>
                <span v-html="input.error.message"></span>
              </template>
            </Message>
          </Block>
        </div>

        <div class="column">
          <Block v-if="output.ast">
            <TreeNode :value="output.ast" />
          </Block>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { Block } from "vue-bulma";
import { Button } from "vue-bulma";
import { Icon } from "vue-bulma";
import { Message } from "vue-bulma";
import { NavigationBar } from "vue-bulma";
import TreeNode from "./components/TreeNode";

export default {
  name: "App",
  components: {
    Block,
    Button,
    Icon,
    Message,
    NavigationBar,
    TreeNode,
  },
  data() {
    return {
      grammar: {
        error: null,
        isValid: null,
        isValidating: false,
        text: `start         : rulelist
rulelist      : (rule | (c_wsp* c_nl))+
rule          : rulename defined_as elements c_nl
rulename      : ALPHA (ALPHA | DIGIT | "-" | "_")*
defined_as    : c_wsp* ("=/" | "=" | ":=") c_wsp*
elements      : alternation c_wsp*
c_wsp         : (c_nl WSP) | WSP
c_nl          : comment | NEWLINE
comment       : ";" (WSP | VCHAR)* (CR | LF)
alternation   : concatenation (c_wsp* ("/" | "|") c_wsp* concatenation)*
concatenation : repetition (c_wsp* repetition)*
repetition    : repeat? element
repeat        : (DIGIT* "*" DIGIT*) | DIGIT+
element       : group | rulename | option | char_val | num_val | prose_val
group         : "(" c_wsp* alternation c_wsp* ")"
option        : "[" c_wsp* alternation c_wsp* "]"
char_val      : DQUOTE CHAR2* DQUOTE
num_val       : "%" (bin_val | dec_val | hex_val)
bin_val       : "b" BIT+ (("." BIT+)+ | "-" BIT+)*
dec_val       : "d" DIGIT+ (("." DIGIT+)+ | "-" DIGIT+)*
hex_val       : "x" HEXDIG+ (("." HEXDIG+)+ | "-" HEXDIG+)*
prose_val     : "<" (comment | CHAR3)* ">"

ALPHA  : /[\\x41-\\x5a\\x61-\\x7a]/
DIGIT  : /[\\x30-\\x39]/
HEXDIG : DIGIT | /[A-Fa-f]/
DQUOTE : /\\x22/
SP     : /\\x20/
HTAB   : /\\x09/
WSP    : SP | HTAB
LWSP   : (WSP | NEWLINE | WSP)*
VCHAR  : /[\\x21-\\x7e]/
CHAR   : /[\\x01-\\x7f]/
CHAR2  : /[\\x20\\x21\\x23-\\x73]/
CHAR3  : /[\\x0a\\x20-\\x3d\\x3f-\\x7e]/
OCTET  : /[\\x00-\\xff]/
CTL    : /[\\x00-\\x1f]|\\x7f/
CR     : /\\x0d/
LF     : /\\x0a/
BIT    : /[01]/

%import common.NEWLINE
`,
      },
      input: {
        error: null,
        isParsing: false,
        text: `postal-address   = name-part street zip-part

name-part        = *(personal-part SP) last-name [SP suffix] CRLF
name-part        =/ personal-part CRLF

personal-part    = first-name / (initial ".")
first-name       = *ALPHA
initial          = ALPHA
last-name        = *ALPHA
suffix           = ("Jr." / "Sr." / 1*("I" / "V" / "X"))

street           = [apt SP] house-num SP street-name CRLF
apt              = 1*4DIGIT
house-num        = 1*8(DIGIT / ALPHA)
street-name      = 1*VCHAR

zip-part         = town-name "," SP state 1*2SP zip-code CRLF
town-name        = 1*(ALPHA / SP)
state            = 2ALPHA
zip-code         = 5DIGIT ["-" 4DIGIT]
`,
      },
      output: {
        ast: null,
      },
    };
  },
  computed: {
    canValidate() {
      return (this.grammar.text || "") !== "";
    },
  },
  methods: {
    async parseInput() {
      try {
        this.input.isParsing = true;

        const res = await fetch("http://localhost:5000/parse", {
          body: JSON.stringify({
            grammar: this.grammar.text,
            input: this.input.text || "",
          }),
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
        });
        const resBody = await res.json();

        this.grammar.isValid = resBody.grammar.is_valid;
        // TODO: make this a Vue filter
        if (resBody.grammar.error) {
          this.grammar.error = {
            message: resBody.grammar.error.message.replaceAll("\n", "<br />"),
          };
        } else {
          this.grammar.error = null;
        }

        this.input.isValid = resBody.input.is_valid;
        // TODO: make this a Vue filter
        if (resBody.input.error) {
          this.input.error = {
            message: resBody.input.error.message.replaceAll("\n", "<br />"),
          };
        } else {
          this.input.error = null;
        }

        if (resBody.output) {
          this.output.ast = resBody.output.ast;
        }

        // TODO: make this a Vue filter
        if (resBody.output.error) {
          this.output.error = {
            message: resBody.output.error.message.replaceAll("\n", "<br />"),
          };
        } else {
          this.output.error = null;
        }
      } finally {
        this.input.isParsing = false;
      }
    },
    async validate() {
      try {
        this.grammar.isValidating = true;

        const res = await fetch("http://localhost:5000/validate", {
          body: JSON.stringify({
            grammar: this.grammar.text,
          }),
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
        });
        const resBody = await res.json();

        this.grammar.isValid = resBody.grammar.is_valid;
        // TODO: make this a Vue filter
        if (resBody.grammar.error) {
          this.grammar.error = {
            message: resBody.grammar.error.message.replaceAll("\n", "<br />"),
          };
        } else {
          this.grammar.error = null;
        }
      } finally {
        this.grammar.isValidating = false;
      }
    },
  },
};
</script>

<style lang="scss">
@import "~bulma/bulma";

.grammar-edit {
  font-family: "Fira Code", monospace;
  font-variant-ligatures: none;
}

.input-edit {
  font-family: "Fira Code", monospace;
  font-variant-ligatures: none;
}
</style>
