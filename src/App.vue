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
      <template #menu-end>
        <span class="navbar-item">
          {{ `Version ${version}` }}
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
              <Buttons>
                <input
                  id="grammar-file-input"
                  type="file"
                  accept=".lark"
                  @change="loadGrammar"
                />
                <Button @click="promptGrammarFile">Load…</Button>
                <Button
                  :is-disabled="!canValidate || grammar.isValidating"
                  :is-loading="grammar.isValidating"
                  @click="validate"
                >
                  Validate
                </Button>
                <div class="mr-2 mb-2">
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
                </div>
              </Buttons>
            </Block>

            <Block v-if="grammar.error">
              <Message color="danger">
                <template #body>
                  <span v-html="grammar.error.message"></span>
                </template>
              </Message>
            </Block>
          </div>

          <div class="tab-column">
            <div class="tab-column-header">
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

            <div class="tab-column-content">
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
                      <code>(&lt;exp&gt; ...)</code>
                    </td>
                  </tr>
                  <tr>
                    <th>Optional</th>
                    <td>
                      <code>[&lt;exp&gt; ...]</code>
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
                      <code>%import &lt;module&gt; (&lt;name | NAME&gt;, ...)</code>
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
              <Buttons>
                <Button
                  :is-disabled="!canParse || grammar.isParsing"
                  :is-loading="input.isParsing"
                  @click="parseInput"
                  >Parse</Button
                >
                <div class="mr-2 mb-2">
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
                </div>
              </Buttons>
            </Block>

            <Block v-if="input.error">
              <Message color="danger">
                <template #body>
                  <span v-html="input.error.message"></span>
                </template>
              </Message>
            </Block>
          </div>

          <div class="tab-column">
            <div class="tab-column-header">
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

            <div class="tab-column-content">
              <TreeNode v-if="output.ast" :value="output.ast" />
              <div class="has-text-centered has-background-light has-text-grey p-6" v-else>
                Click <span class="has-text-weight-semibold">Parse</span> to process the input with the current grammar and view the output tree.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Block } from "vue-bulma";
import { Button } from "vue-bulma";
import { Buttons } from "vue-bulma";
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
    Buttons,
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
        text: null,
      },
      input: {
        error: null,
        isParsing: false,
        text: null,
      },
      output: {
        ast: null,
      },
      selectedTab: "develop",
      version: process.env.VUE_APP_VERSION,
    };
  },
  computed: {
    canParse() {
      return this.canValidate;
    },
    canValidate() {
      return (this.grammar.text || "") !== "";
    },
  },
  methods: {
    loadGrammar(evt) {
      const file = evt.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        this.grammar.text = e.target.result;
      };
      reader.readAsText(file, "UTF-8");
    },
    async parseInput() {
      try {
        this.input.isParsing = true;

        const res = await fetch("/api/parse", {
          body: JSON.stringify({
            grammar: this.grammar.text,
            input: this.input.text || "",
          }),
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
        });
        const isSuccess = res.status >= 200 && res.status <= 299;

        var resBody;
        try {
          resBody = await res.json();
        } catch {
          resBody = null;
        }
        const errorType = ((resBody || {}).error || {}).type;

        this.grammar.isValid = isSuccess && errorType !== "grammar";
        if (errorType === "grammar") {
          // TODO: make this a Vue filter
          this.grammar.error = {
            message: resBody.error.message.replaceAll("\n", "<br />"),
          };
        } else {
          this.grammar.error = null;
        }

        this.input.isValid = isSuccess && errorType !== "parse";
        if (errorType === "grammar") {
          this.input.error = {
            message: "Input could not be parsed due to a grammar error; check the Develop tab for details."
          };
        } else if (errorType === "parse") {
          // TODO: make this a Vue filter
          this.input.error = {
            message: resBody.error.message.replaceAll("\n", "<br />"),
          };
        } else {
          this.input.error = null;
        }

        if ((resBody || {}).result) {
          this.output.ast = resBody.result;
        } else {
          this.output.ast = null;
        }
      } finally {
        this.input.isParsing = false;
      }
    },
    promptGrammarFile() {
      const fileInput = document.getElementById("grammar-file-input");
      fileInput.click();
    },
    async validate() {
      try {
        this.grammar.isValidating = true;

        const res = await fetch("api/validate", {
          body: JSON.stringify({
            grammar: this.grammar.text,
          }),
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
        });
        const isSuccess = res.status >= 200 && res.status <= 299;

        this.grammar.isValid = isSuccess;
        if (!this.grammar.isValid) {
          const resBody = await res.json();

          // TODO: make this a Vue filter
          this.grammar.error = {
            message: resBody.error.message.replaceAll("\n", "<br />"),
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
$tab-column-height: calc(100vh - #{$navbar-height} - #{$tab-height} - #{$tab-margin} - (#{$tab-content-padding} * 2) - 30px - #{$block-spacing});

// Bulma style overrides
.is-family-monospace {
  font-variant-ligatures: none;
}

// custom styles
.tab-content {
  padding: $tab-content-padding;

  & > .tab-columns {
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

      & > .tab-column-header {
        align-items: center;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        margin-bottom: $block-spacing;
      }

      & > .tab-column-content {
        max-height: $tab-column-height;
        overflow: auto;
      }
    }
  }
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

#grammar-file-input {
  display: none;
}
</style>
