<template>
  <span class="las" :class="cls"></span>
</template>

<script>
export default {
  name: "LineAwesomeIcon",
  props: {
    name: String,
  },
  computed: {
    cls() {
      const cls = {};

      if (this.name) {
        const nameClassName = `la-${this.name.toLowerCase()}`;
        cls[nameClassName] = true;
      }

      return cls;
    },
  },
};
</script>

<style></style>
