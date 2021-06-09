<template>
  <div class="app">
    <NavigationBar color="primary">
      <template #brand>
        <span class="navbar-item">
          <span class="icon-text is-size-4 has-text-weight-bold">
            <Icon>
              <LineAwesomeIcon name="crow" />
            </Icon>
            <span>Lark Designer</span>
          </span>
        </span>
      </template>
    </NavigationBar>

    <div class="app-content">
      <Tabs>
        <Tab :is-active="selectedTab === 'develop'" @click="selectedTab = 'develop'">
          <Icon>
            <LineAwesomeIcon name="pen" />
          </Icon>
          <span>Develop</span>
        </Tab>
        <Tab :is-active="selectedTab === 'test'" @click="selectedTab = 'test'">
          <Icon>
            <LineAwesomeIcon name="flask" />
          </Icon>
          <span>Test</span>
        </Tab>
      </Tabs>

      <div class="tab-content" v-if="selectedTab === 'develop'">
        <div class="tab-columns">
          <div class="tab-column">
            <Block>
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
                  <LineAwesomeIcon name="check" />
                </Icon>
                <span>Valid</span>
              </span>
              <span class="icon-text has-text-danger m-2" v-else-if="grammar.error">
                <Icon>
                  <LineAwesomeIcon name="times" />
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

          <div class="tab-column scrollable-column">
            <Block>
              <div class="column-header">
                <h3 class="is-size-5">Grammar reference</h3>

                <a href="https://lark-parser.readthedocs.io/en/latest/grammar.html" target="_blank">
                  <span class="icon-text">
                    <span>Documentation</span>
                    <Icon>
                      <LineAwesomeIcon name="external-link-alt" />
                    </Icon>
                  </span>
                </a>
              </div>
            </Block>

            <h4 class="is-size-7">Definitions</h4>
            <table class="table is-fullwidth is-narrow">
              <tbody>
                <tr>
                  <th>Rule (non-terminal)</th>
                  <td>
                    <code>&lt;name&gt;: &lt;non-term-exp&gt;</code>
                  </td>
                </tr>
                <tr>
                  <th>Terminal</th>
                  <td>
                    <code>&lt;NAME&gt;: &lt;term-exp&gt;</code>
                  </td>
                </tr>
              </tbody>
            </table>

            <h4 class="is-size-7">Terminal expressions</h4>
            <table class="table is-fullwidth is-narrow">
              <tbody>
                <tr>
                  <th>String literal</th>
                  <td>
                    <code>"string"</code>
                  </td>
                </tr>
                <tr>
                  <th>Case-insensitive string literal</th>
                  <td>
                    <code>"string"i</code>
                  </td>
                </tr>
                <tr>
                  <th>Regular expression</th>
                  <td>
                    <code>/regular expression/</code>
                  </td>
                </tr>
              </tbody>
            </table>

            <h4 class="is-size-7">Non-terminal expressions</h4>
            <table class="table is-fullwidth is-narrow">
              <tbody>
                <tr>
                  <th>Rule reference</th>
                  <td>
                    <code>&lt;name&gt;</code>
                  </td>
                </tr>
                <tr>
                  <th>Terminal reference</th>
                  <td>
                    <code>&lt;NAME&gt;</code>
                  </td>
                </tr>
                <tr>
                  <th>Sequence group</th>
                  <td>
                    <code>(&lt;exp&gt; &lt;exp&gt; ...)</code>
                  </td>
                </tr>
                <tr>
                  <th>Optional</th>
                  <td>
                    <code>[&lt;exp&gt; &lt;exp&gt; ...]</code>
                  </td>
                </tr>
              </tbody>
            </table>

            <h4 class="is-size-7">Quantifiers</h4>
            <table class="table is-fullwidth is-narrow">
              <tbody>
                <tr>
                  <th>0 or 1</th>
                  <td>
                    <code>&lt;name | NAME&gt;?</code>
                  </td>
                </tr>
                <tr>
                  <th>0 or more</th>
                  <td>
                    <code>&lt;name | NAME&gt;*</code>
                  </td>
                </tr>
                <tr>
                  <th>1 or more</th>
                  <td>
                    <code>&lt;name | NAME&gt;+</code>
                  </td>
                </tr>
                <tr>
                  <th>Exactly n</th>
                  <td>
                    <code>&lt;name | NAME&gt; ~ n</code>
                  </td>
                </tr>
                <tr>
                  <th>Between n to m</th>
                  <td>
                    <code>&lt;name | NAME&gt; ~ n..m</code>
                  </td>
                </tr>
              </tbody>
            </table>

            <h4 class="is-size-7">Directives</h4>
            <table class="table is-fullwidth is-narrow">
              <tbody>
                <tr>
                  <th>Ignore a terminal when parsing</th>
                  <td>
                    <code>%ignore &lt;NAME&gt;</code>
                  </td>
                </tr>
                <tr>
                  <th>Import a definition from another grammar</th>
                  <td>
                    <code>%import &lt;module&gt;.&lt;name&gt;</code><br />
                    <code>%import &lt;module&gt;.&lt;NAME&gt;</code><br />
                    <code>%import &lt;module&gt;.&lt;name&gt; -> &lt;name&gt;</code><br />
                    <code>%import &lt;module&gt;.&lt;NAME&gt; -> &lt;NAME&gt;</code><br />
                    <code>%import &lt;module&gt; (&lt;name | NAME&gt;, &lt;name | NAME&gt; ...)</code>
                  </td>
                </tr>
                <tr>
                  <th>Declare a terminal without defining it</th>
                  <td>
                    <code>%declare &lt;NAME&gt;</code>
                  </td>
                </tr>
                <tr>
                  <th>Override a definition</th>
                  <td>
                    <code>%override &lt;name&gt;: &lt;non-term-exp&gt;</code><br />
                    <code>%override &lt;NAME&gt;: &lt;term-exp&gt;</code>
                  </td>
                </tr>
                <tr>
                  <th>Extend a definition</th>
                  <td>
                    <code>%extend &lt;name&gt;: &lt;non-term-exp&gt;</code><br />
                    <code>%extend &lt;NAME&gt;: &lt;term-exp&gt;</code>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="tab-content" v-else-if="selectedTab === 'test'">
        <div class="tab-columns">
          <div class="tab-column">
            <Block>
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
                  <LineAwesomeIcon name="check" />
                </Icon>
                <span>Valid</span>
              </span>
              <span class="icon-text has-text-danger m-2" v-else-if="input.error">
                <Icon>
                  <LineAwesomeIcon name="times" />
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

          <div class="tab-column scrollable-column">
            <Block>
              <div class="column-header">
                <h3 class="is-size-5">Output tree</h3>

                <a href="https://lark-parser.readthedocs.io/en/latest/tree_construction.html" target="_blank">
                  <span class="icon-text">
                    <span>Documentation</span>
                    <Icon>
                      <LineAwesomeIcon name="external-link-alt" />
                    </Icon>
                  </span>
                </a>
              </div>
            </Block>

            <Block>
              <TreeNode v-if="output.ast" :value="output.ast" />
              <div class="has-text-centered has-background-light has-text-grey p-6" v-else>
                Click <span class="has-text-weight-semibold">Parse</span> to process the input with the current grammar and view the output tree.
              </div>
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
import { Tab } from "vue-bulma";
import { Tabs } from "vue-bulma";
import LineAwesomeIcon from "./components/LineAwesomeIcon.vue";
import TreeNode from "./components/TreeNode";

export default {
  name: "App",
  components: {
    Block,
    Button,
    Icon,
    LineAwesomeIcon,
    Message,
    NavigationBar,
    Tab,
    Tabs,
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
// Bulma variable overrides
$family-monospace: "Fira Code", monospace;
$green: rgb(34, 139, 34);

@import "~bulma/bulma";

// new variables
$tab-height: calc(2.5rem + 1px);
$tab-margin: 1.5rem;
$tab-content-padding: 0.75rem;
$tab-column-height: calc(100vh - #{$navbar-height} - #{$tab-height} - #{$tab-margin} - (#{$tab-content-padding} * 2));

// Bulma style overrides
.is-family-monospace {
  font-variant-ligatures: none;
}

// custom styles
.column-header {
  align-items: center;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.scrollable-column {
  max-height: $tab-column-height;
  overflow: auto;
}

.tab-columns {
  display: flex;
  flex-direction: row;

  & > .tab-column {
    flex-basis: 0;
    flex-grow: 1;
    flex-shrink: 0;

    &:not(:last-child) {
      margin-right: calc(#{$block-spacing} / 2);
    }

    &:not(:first-child) {
      margin-left: calc(#{$block-spacing} / 2);
    }
  }
}

.tab-content {
  padding: $tab-content-padding;
}

.textarea {
  height: 40vh;
}

code {
  font-variant-ligatures: none;
}

td {
  width: 60%;
}
</style>
