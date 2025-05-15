<template>
  <div class="profile-stat" :class="{ clickable: onClick }">
    <div class="stat-value" @click="handleClick">{{ formattedValue }}</div>
    <div class="stat-label">{{ label }}</div>
  </div>
</template>

<script>
export default {
  name: 'ProfileStat',
  props: {
    value: {
      type: [Number, String],
      required: true
    },
    label: {
      type: String,
      required: true
    },
    format: {
      type: Function,
      default: null
    },
    onClick: {
      type: Function,
      default: null
    }
  },
  computed: {
    formattedValue() {
      return this.format ? this.format(this.value) : this.value;
    }
  },
  methods: {
    handleClick() {
      if (this.onClick) {
        this.onClick();
      }
    }
  }
}
</script>

<style scoped>
.profile-stat {
  background-color: white;
  border-radius: var(--border-radius-medium);
  padding: var(--spacing-medium) var(--spacing-large);
  box-shadow: var(--shadow-small);
  text-align: center;
  min-width: 100px;
}

.stat-value {
  font-size: var(--font-size-xlarge);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
  margin-bottom: var(--spacing-vsmall);
}

.stat-label {
  font-size: var(--font-size-small);
  color: var(--color-gray-dark);
}

.clickable .stat-value {
  cursor: pointer;
  transition: color var(--transition-fast);
}

.clickable .stat-value:hover {
  color: var(--color-primary-dark);
}
</style>
