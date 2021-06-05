<template>
  <div>
    <NavigationBar color="primary">
      <template #brand>
        <span class="navbar-item">Lark Designer</span>
      </template>
    </NavigationBar>

    <main class="section">
      <div class="columns">
        <div class="column">
          <Block>
            <textarea
              class="textarea grammar-edit"
              placeholder="enter Lark grammar"
              v-model="grammar.text"
            ></textarea>
          </Block>

          <Block>
            <Buttons>
              <Button :is-disabled="!canValidate" @click="validate">
                Validate
              </Button>
            </Buttons>
          </Block>

          <Block>
            <Message color="danger" v-if="grammar.error">
              <template #body>
                {{ grammar.error }}
              </template>
            </Message>
          </Block>
        </div>
        <div class="column">
          <Block>
            <textarea
              class="textarea"
              placeholder="enter test input"
              v-model.lazy="input"
            ></textarea>
          </Block>
        </div>
      </div>

      <Block>
        <Buttons alignment="centered"></Buttons>
      </Block>

      <Block v-if="ast">
        <TreeNode :value="ast" />
      </Block>
    </main>
  </div>
</template>

<script>
import { Block } from "vue-bulma";
import { Button } from "vue-bulma";
import { Buttons } from "vue-bulma";
import { Message } from "vue-bulma";
import { NavigationBar } from "vue-bulma";
import TreeNode from "./components/TreeNode";

export default {
  name: "App",
  components: {
    Block,
    Button,
    Buttons,
    Message,
    NavigationBar,
    TreeNode,
  },
  data() {
    return {
      ast: {
        value: "start",
        nodes: [
          {
            value: "foo",
            nodes: [
              {
                value: "fee",
                nodes: null,
              },
              {
                value: "fi",
                nodes: null,
              },
              {
                value: "fo",
                nodes: null,
              },
              {
                value: "fum",
                nodes: null,
              },
            ],
          },
          {
            value: "bar",
            nodes: null,
          },
          {
            value: "baz",
            nodes: null,
          },
        ],
      },
      grammar: {
        error: null,
        isValid: null,
        text: null,
      },
      input: null,
    };
  },
  computed: {
    canValidate() {
      return (this.grammar.text || "") !== "";
    },
  },
  methods: {
    async validate() {
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

      this.grammar.isValid = resBody.is_valid;
      this.grammar.error = resBody.error;
    },
  },
};
</script>

<style lang="scss">
@import "~bulma/bulma";

.grammar-edit {
  font-family: "Fira Code", monospace;
}
</style>
