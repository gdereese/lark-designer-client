<template>
  <div class="tree-node">
    <p class="tree-node-value">
      <button class="button is-small is-white" v-if="value.nodes" @click="toggleExpanded(value)">
        <Icon v-if="isExpanded(value)">
          <span class="las la-minus"></span>
        </Icon>
        <Icon v-else>
          <span class="las la-plus"></span>
        </Icon>
      </button>
      <Tag size="medium" class="is-family-monospace" :class="getTagClass(value)">{{ value.type }}</Tag>
      <span class="is-family-monospace mr-3" v-if="value.value">{{ value.value }}</span>
    </p>
    <ul class="tree-node-list" v-if="value.nodes" v-show="isExpanded(value)">
      <li :key="node" v-for="node in value.nodes">
        <TreeNode :value="node" />
      </li>
    </ul>
  </div>
</template>

<script>
import { Icon } from "vue-bulma";
import { Tag } from "vue-bulma";

export default {
  name: "TreeNode",
  components: {
    Icon,
    Tag,
  },
  props: {
    value: Object,
  },
  data() {
    return {
      expandedNodes: new Set(),
    };
  },
  methods: {
    getTagClass(node) {
      if (node.value) {
        return "term-tag";
      } else {
        return "non-term-tag";
      }
    },
    isExpanded(node) {
      return this.expandedNodes.has(node);
    },
    toggleExpanded(node) {
      if (this.expandedNodes.has(node)) {
        this.expandedNodes.delete(node);
      } else {
        this.expandedNodes.add(node);
      }
    },
  },
};
</script>

<style lang="scss">
@import "~bulma/sass/helpers/color";

.tree-node {
  & .tree-node-list {
    border-left: 2px solid #ccc;
    margin-left: calc(0.75rem + 1px);
    margin-bottom: 0.25rem;
    margin-top: 0.25rem;
    padding-left: 1.5rem;
  }

  & .tree-node-value {
    align-items: center;
    display: flex;
    padding-bottom: 0.25rem;
    padding-top: 0.25rem;

    & button {
      margin-right: 0.5rem;
    }

    & .term-tag {
      background-color: $blue;
      color: $light;
      margin-left: 2.25rem;
      margin-right: 0.75rem;
    }

    & .non-term-tag {
    }
  }
}
</style>
