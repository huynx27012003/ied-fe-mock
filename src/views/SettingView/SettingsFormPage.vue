<template>
  <div class="setting-direct-page">
    <div v-if="page.tabLabel" class="setting-direct-tab-row">
      <div class="setting-direct-tab">{{ page.tabLabel }}</div>
      <button type="button" class="setting-direct-tab-add">
        <i class="fa-solid fa-plus"></i>
      </button>
    </div>

    <div class="setting-direct-title">
      <span>{{ page.title }}</span>
      <span v-if="page.help" class="setting-help">
        <i class="fa-solid fa-circle-question"></i>
        Help
      </span>
    </div>

    <div class="setting-direct-body">
      <div v-if="page.table" class="setting-table-wrap">
        <table class="setting-table">
          <thead>
            <tr>
              <th v-for="column in page.table.columns" :key="column">
                {{ column }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(row, rowIndex) in page.table.rows"
              :key="`setting-row-${rowIndex}`"
            >
              <td v-for="(cell, cellIndex) in row" :key="`${rowIndex}-${cellIndex}`">
                <span v-if="cellIndex === 0">{{ cell }}</span>
                <select v-else-if="[1, 2, 3, 4].includes(cellIndex)" :value="cell">
                  <option>{{ cell }}</option>
                </select>
                <input v-else :value="cell" />
                <span v-if="cellIndex > 4" class="setting-hint">[1, 247]</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="page.rows" class="setting-form-table">
        <SettingFormRow
          v-for="row in page.rows"
          :key="row.label"
          :row="row"
        />
      </div>

      <template v-for="section in page.sections || []" :key="section.title">
        <div class="setting-section-title">{{ section.title }}</div>
        <div class="setting-form-table">
          <SettingFormRow
            v-for="row in section.rows"
            :key="`${section.title}-${row.label}`"
            :row="row"
          />
        </div>
      </template>

      <div class="setting-submit-row">
        <button type="button" class="setting-submit-button">Submit</button>
      </div>

      <div
        v-for="item in page.collapsed || []"
        :key="item"
        class="setting-collapsed-panel"
      >
        <i class="fa-solid fa-angles-down"></i>
        <span>{{ item }}</span>
      </div>
    </div>
  </div>
</template>

<script>
const SettingFormRow = {
  name: "SettingFormRow",
  props: {
    row: { type: Object, required: true },
  },
  template: `
    <div class="setting-form-row">
      <div class="setting-form-label">{{ row.label }}</div>
      <div class="setting-form-control">
        <select v-if="row.type === 'select'" :value="row.value">
          <option v-for="option in row.options" :key="option">{{ option }}</option>
        </select>
        <input
          v-else-if="row.type === 'input' || row.type === 'password'"
          :type="row.type === 'password' ? 'password' : 'text'"
          :value="row.value"
        />
        <span v-else class="setting-text-value">{{ row.value }}</span>
        <span v-if="row.hint" class="setting-hint">{{ row.hint }}</span>
        <button v-if="row.button" type="button" class="setting-inline-action">
          {{ row.button }}
        </button>
      </div>
    </div>
  `,
};

export default {
  name: "SettingsFormPage",
  components: { SettingFormRow },
  props: {
    page: { type: Object, required: true },
  },
};
</script>

<style scoped>
.setting-direct-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #cddcf0;
  color: #1f2f46;
  font-size: 13px;
}

.setting-direct-tab-row {
  height: 36px;
  display: flex;
  align-items: flex-end;
  gap: 6px;
  padding: 0 12px;
  border-bottom: 1px solid #9eb4d5;
  background: #d6e3f4;
  box-sizing: border-box;
}

.setting-direct-tab {
  min-width: 190px;
  height: 26px;
  display: flex;
  align-items: center;
  padding: 0 22px;
  border-radius: 14px 14px 0 0;
  background: linear-gradient(180deg, #6d8dbd 0%, #2c5795 100%);
  color: #fff;
  font-weight: 700;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.45);
}

.setting-direct-tab-add {
  width: 22px;
  height: 22px;
  margin-bottom: 3px;
  border: none;
  border-radius: 50%;
  background: linear-gradient(180deg, #30d5ff 0%, #0089ce 100%);
  color: #fff;
  cursor: default;
}

.setting-direct-title {
  min-height: 34px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  border-top: 1px solid #edf3fb;
  border-bottom: 1px solid #c7cdd8;
  background: linear-gradient(180deg, #f8f8fb 0%, #e8e8ed 100%);
  box-sizing: border-box;
  color: #1d355b;
  font-weight: 700;
}

.setting-help {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: #1f2f46;
  font-weight: 500;
}

.setting-help i {
  color: #16a6b6;
}

.setting-direct-body {
  flex: 1;
  min-height: 0;
  overflow: auto;
  background: #cddcf0;
}

.setting-form-table {
  width: 100%;
  border-bottom: 1px solid #d7dce5;
  background: #fff;
}

:deep(.setting-form-row) {
  min-height: 32px;
  display: grid;
  grid-template-columns: minmax(260px, 40%) minmax(0, 1fr);
  border-bottom: 1px solid #e2e5eb;
}

:deep(.setting-form-row:last-child) {
  border-bottom: none;
}

:deep(.setting-form-label) {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 14px;
  color: #2f3e52;
  box-sizing: border-box;
}

:deep(.setting-form-control) {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  box-sizing: border-box;
}

:deep(.setting-form-control input),
:deep(.setting-form-control select),
.setting-table input,
.setting-table select {
  height: 24px;
  min-width: 190px;
  border: 1px solid #9da7b5;
  background: #fff;
  color: #111;
  font-size: 13px;
  box-sizing: border-box;
}

:deep(.setting-form-control input),
:deep(.setting-form-control select) {
  width: min(420px, 72%);
}

:deep(.setting-text-value) {
  min-height: 24px;
  display: inline-flex;
  align-items: center;
  color: #2f3e52;
}

.setting-hint,
:deep(.setting-hint) {
  color: #7a8493;
  font-size: 12px;
  white-space: nowrap;
}

.setting-inline-action,
:deep(.setting-inline-action),
.setting-submit-button {
  border: 1px solid #16679e;
  background: linear-gradient(180deg, #1fb4e6 0%, #006aa4 100%);
  color: #fff;
  font-size: 13px;
  cursor: default;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.35);
}

:deep(.setting-inline-action) {
  height: 28px;
  min-width: 280px;
  margin-left: 8px;
}

.setting-submit-row {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.setting-submit-button {
  min-width: 82px;
  height: 28px;
  border-radius: 2px;
}

.setting-section-title,
.setting-collapsed-panel {
  min-height: 34px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  border-top: 1px solid #f5f5f8;
  border-bottom: 1px solid #c8ccd5;
  background: linear-gradient(180deg, #f9f9fb 0%, #e7e7ec 100%);
  color: #1d355b;
  font-weight: 700;
  box-sizing: border-box;
}

.setting-collapsed-panel i {
  color: #6782a7;
}

.setting-table-wrap {
  background: #fff;
}

.setting-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  color: #26364b;
}

.setting-table th,
.setting-table td {
  min-height: 32px;
  padding: 4px 8px;
  border: 1px solid #d7dce5;
  text-align: left;
  box-sizing: border-box;
}

.setting-table th {
  background: linear-gradient(180deg, #f9f9fb 0%, #e7e7ec 100%);
  color: #1d355b;
  font-weight: 700;
}

.setting-table input,
.setting-table select {
  min-width: 0;
  width: calc(100% - 52px);
}

@media (max-width: 900px) {
  :deep(.setting-form-row) {
    grid-template-columns: 190px minmax(0, 1fr);
  }

  :deep(.setting-inline-action) {
    min-width: 180px;
  }
}
</style>
