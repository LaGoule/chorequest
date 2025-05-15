<template>
  <span 
    class="points-badge"
    :class="{
      'small': size === 'small',
      'medium': size === 'medium',
      'large': size === 'large',
      'positive': showPlus
    }"
  >
    {{ showPlus ? '+' : '' }}{{ value }} {{ suffix }}
  </span>
</template>

<script>
export default {
  name: 'PointsBadge',
  props: {
    value: {
      type: [Number, String],
      required: true
    },
    showPlus: {
      type: Boolean,
      default: false
    },
    size: {
      type: String,
      default: 'medium',
      validator: (value) => ['small', 'medium', 'large'].includes(value)
    },
    suffix: {
      type: String,
      default: 'pts'
    }
  }
}
</script>

<style scoped>
.points-badge {
  background-color: var(--color-primary);
  color: white;
  border-radius: var(--border-radius-large);
  font-weight: var(--font-weight-semibold);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
}

.points-badge.small {
  font-size: 0.75rem;
  padding: 2px 8px;
}

.points-badge.medium {
  font-size: var(--font-size-small);
  padding: var(--spacing-vsmall) 12px;
}

.points-badge.large {
  font-size: var(--font-size-base);
  padding: var(--spacing-small) var(--spacing-medium);
}

.points-badge.positive {
  background-color: var(--color-success);
}
</style>
