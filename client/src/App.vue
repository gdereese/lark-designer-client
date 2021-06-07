<template>
  <div class="app">
    <NavigationBar color="primary">
      <template #brand>
        <span class="navbar-item">Lark Designer</span>
      </template>
    </NavigationBar>

    <div id="app-content">
      <div class="tabs">
        <ul>
          <li :class="{ 'is-active': selectedTab === 'develop' }">
            <a @click="selectedTab = 'develop'">Develop</a>
          </li>
          <li :class="{ 'is-active': selectedTab === 'test' }">
            <a @click="selectedTab = 'test'">Test</a>
          </li>
        </ul>
      </div>

      <div id="develop-tab-content" class="tab-content" v-if="selectedTab === 'develop'">
        <Block class="develop-input-block">
          <textarea
            class="textarea is-family-monospace"
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
      </div>

      <div id="test-tab-content" class="tab-content" v-else-if="selectedTab === 'test'">
        <div class="columns">
          <div class="column">
            <Block class="test-input-block">
              <textarea
                class="textarea is-family-monospace"
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

          <div id="ast-column" class="column">
            <Block v-if="output.ast">
              <TreeNode :value="output.ast" />
            </Block>
          </div>
        </div>
      </div>
    </div>
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
        text: `start         : rule_list
rule_list     : rule+

rule          : rule_name defined_as elements comment? _NEWLINE
rule_name     : IDENTIFIER
defined_as    : OPERATOR
elements      : alternation
comment       : ";" VCHAR*

alternation   : concatenation (("/" | "|") concatenation)*

concatenation : repetition+

repetition    : repeat? element
repeat        : var_repeat | spec_repeat
var_repeat    : min_rep_count? "*" max_rep_count?
min_rep_count : INT
max_rep_count : INT
spec_repeat   : rep_count?
rep_count     : INT

group         : "(" alternation ")"

option        : "[" alternation "]"

prose_val     : "<" (comment | CHAR3)* ">"

element       : group | IDENTIFIER | option | STRING | NUM_VAL | prose_val

OPERATOR      : /=\\// | /=/ | /:=/
IDENTIFIER    : ALPHA (ALPHA | DIGIT | /[-_]/)*
STRING        : DQUOTE CHAR2* DQUOTE
INT           : DIGIT+
NUM_VAL       : "%" (BIN_VAL | DEC_VAL | HEX_VAL)
BIN_VAL       : "b" BIT+ (("." BIT+)+ | "-" BIT+)*
DEC_VAL       : "d" DIGIT+ (("." DIGIT+)+ | "-" DIGIT+)*
HEX_VAL       : "x" HEXDIG+ (("." HEXDIG+)+ | "-" HEXDIG+)*

ALPHA  : /[\\x41-\\x5a\\x61-\\x7a]/
DIGIT  : /[\\x30-\\x39]/
HEXDIG : DIGIT | /[A-Fa-f]/
DQUOTE : /\\x22/
VCHAR  : /[\\x21-\\x7e]/
CHAR   : /[\\x01-\\x7f]/
CHAR2  : /[\\x20\\x21\\x23-\\x73]/
CHAR3  : /[\\x0a\\x20-\\x3d\\x3f-\\x7e]/
OCTET  : /[\\x00-\\xff]/
CTL    : /[\\x00-\\x1f]|\\x7f/
BIT    : /[01]/

%import common.NEWLINE -> _NEWLINE
%import common.WS

%ignore _NEWLINE
%ignore WS
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
      selectedTab: "develop",
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
        } else {
          this.output.ast = null;
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
$family-monospace: "Fira Code", monospace;
$green: rgb(34, 139, 34);

@import "~bulma/bulma";

.is-family-monospace {
  font-variant-ligatures: none;
}

.tab-content {
  padding: 0.75rem;
}

#ast-column {
  max-height: calc(100vh - #{$navbar-height} - 2.5rem - 1.5rem - 1px);
  overflow: auto;
}
</style>
