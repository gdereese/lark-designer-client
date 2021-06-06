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

      <Block v-if="output.ast">
        <TreeNode :value="output.ast" />
      </Block>
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
        text: `?start: sum
      | NAME "=" sum    -> assign_var

?sum: product
    | sum "+" product   -> add
    | sum "-" product   -> sub

?product: atom
    | product "*" atom  -> mul
    | product "/" atom  -> div

?atom: NUMBER           -> number
     | "-" atom         -> neg
     | NAME             -> var
     | "(" sum ")"

%import common.CNAME -> NAME
%import common.NUMBER
%import common.WS_INLINE
%ignore WS_INLINE`,
      },
      input: {
        error: null,
        isParsing: false,
        text: null,
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

        this.output.ast = resBody.output.ast;
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
