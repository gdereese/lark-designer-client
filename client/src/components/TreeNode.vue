<template>
  <div class="tree-node">
    <p class="tree-node-value">
      <span class="mr-3" v-if="value.value">{{ value.value }}</span>
      <Tag>{{ value.type }}</Tag>
    </p>
    <ul class="tree-node-list" v-if="value.nodes">
      <li :key="node" v-for="node in value.nodes">
        <TreeNode :value="node" />
      </li>
    </ul>
  </div>
</template>

<script>
import { Tag } from "vue-bulma";

export default {
  name: "TreeNode",
  components: {
    Tag,
  },
  props: {
    value: Object,
  },
};
</script>

<style lang="scss">
.tree-node {
  & .tree-node-list {
    border-left: 2px solid #ccc;
    margin-left: 0.125rem;
    margin-bottom: 0.25rem;
    margin-top: 0.25rem;
    padding-left: 1.5rem;
  }
  & .tree-node-value {
    display: flex;
    padding-bottom: 0.25rem;
    padding-top: 0.25rem;
  }
}
</style>
