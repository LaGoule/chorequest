<template>
  <span class="app-icon" v-html="iconSvg" :class="iconClass"></span>
</template>

<script>
import { getCategoryIcon, getActionIcon } from '../utils/iconUtils';

export default {
  name: 'AppIcon',
  props: {
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      default: 'action',
      validator: (value) => ['category', 'action'].includes(value)
    }
  },
  computed: {
    iconSvg() {
      if (this.type === 'category') {
        return getCategoryIcon(this.name);
      } else {
        return getActionIcon(this.name);
      }
    },
    iconClass() {
      return `icon-${this.type}-${this.name}`;
    }
  }
}
</script>

<style scoped>
.app-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.app-icon :deep(svg) {
  width: 1em;
  height: 1em;
  vertical-align: middle;
}
</style>
