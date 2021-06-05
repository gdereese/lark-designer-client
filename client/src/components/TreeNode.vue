<template>
  <div class="tree-node">
    <p class="tree-node-value">{{ value.value }}</p>
    <ul class="tree-node-list" v-if="value.nodes">
      <li :key="node" v-for="node in value.nodes">
        <TreeNode :value="node" />
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: "TreeNode",
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
    padding-bottom: 0.25rem;
    padding-top: 0.25rem;
  }
}
</style>
