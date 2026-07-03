<template>
  <ul
    v-for="section in sections"
    :key="section.key"
    class="context-menu-section"
  >
    <li
      v-for="item in section.items"
      :key="`${section.key}-${item.action || item.label}`"
      class="context-menu-item"
      :class="{ danger: item.danger }"
      @click.stop="$emit('action', item.action)"
    >
      <span>{{ item.label }}</span>
    </li>
  </ul>
</template>

<script>
export default {
  name: "ContextMenuList",
  props: {
    sections: { type: Array, default: () => [] },
  },
  emits: ["action"],
};
</script>

<style scoped>
.context-menu-section {
  list-style: none;
  margin: 0;
  padding: 0;
}

.context-menu-item {
  padding: 10px 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: background 0.2s;
  white-space: nowrap;
}

.context-menu-item:hover {
  background-color: #f5f5f5;
}

.context-menu-item.danger {
  color: #d93025;
  font-weight: 600;
}
</style>
