<template>
  <div class="energy-monitoring-tab">
    <div class="energy-monitoring-header">
      <div>
        <div class="energy-monitoring-title">{{ nodeName }}</div>
        <div class="energy-monitoring-subtitle">Mode: {{ nodeMode }}</div>
      </div>
      <div class="energy-monitoring-badge">Monitoring</div>
    </div>

    <div class="energy-monitoring-tabs">
      <span class="energy-monitoring-tab-item active">Running Info.</span>
      <span class="energy-monitoring-tab-item">Active Alarm</span>
      <span class="energy-monitoring-tab-item">About</span>
    </div>

    <div class="energy-monitoring-table-wrap">
      <table class="energy-monitoring-table">
        <thead>
          <tr>
            <th class="col-no">No.</th>
            <th>Signal Name</th>
            <th>Value</th>
            <th>Unit</th>
            <th class="col-help">Help</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, index) in rows" :key="row.signal">
            <td class="col-no">{{ index + 1 }}</td>
            <td>{{ row.signal }}</td>
            <td>{{ row.value }}</td>
            <td>{{ row.unit }}</td>
            <td class="col-help"></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
const LOGGER_ROWS = [
  { signal: "Grid-tied active power", value: "350.200", unit: "kW" },
  { signal: "Grid-tied reactive power", value: "109.050", unit: "kVar" },
  { signal: "Load power", value: "423.673", unit: "kW" },
  { signal: "Active power", value: "73.473", unit: "kW" },
  { signal: "Reactive power", value: "-0.237", unit: "kVar" },
  { signal: "Energy yield of current day", value: "1220.38", unit: "kWh" },
  { signal: "Current Day Supply From Grid", value: "4737.31", unit: "kWh" },
  { signal: "Current Day Feed-in to Grid", value: "0.00", unit: "kWh" },
  { signal: "Current Day Consumption", value: "5957.34", unit: "kWh" },
  { signal: "Total energy yield", value: "253718.08", unit: "kWh" },
  { signal: "Total supply from grid", value: "795875.06", unit: "kWh" },
  { signal: "Total feed-in to grid", value: "762.89", unit: "kWh" },
  { signal: "Total power consumption", value: "1048830.25", unit: "kWh" },
  { signal: "Reduced CO2 emission", value: "252956.9", unit: "kg" },
  { signal: "Input power", value: "74.699", unit: "kW" },
  { signal: "Power factor", value: "-0.999", unit: "" },
  { signal: "DC current", value: "112.4", unit: "A" },
  { signal: "Grid A phase current", value: "104", unit: "A" },
  { signal: "Grid B phase current", value: "103", unit: "A" },
  { signal: "Grid C phase current", value: "104", unit: "A" },
];

const INVERTER_ROWS = [
  { signal: "Running status", value: "On-grid", unit: "" },
  { signal: "Active power", value: "86.420", unit: "kW" },
  { signal: "Reactive power", value: "0.318", unit: "kVar" },
  { signal: "DC voltage", value: "758.6", unit: "V" },
  { signal: "DC current", value: "112.4", unit: "A" },
  { signal: "Grid A phase voltage", value: "228.7", unit: "V" },
  { signal: "Grid B phase voltage", value: "229.1", unit: "V" },
  { signal: "Grid C phase voltage", value: "228.9", unit: "V" },
  { signal: "Temperature", value: "42.6", unit: "degC" },
  { signal: "Daily energy yield", value: "305.21", unit: "kWh" },
];

const METER_ROWS = [
  { signal: "Active power", value: "423.673", unit: "kW" },
  { signal: "Reactive power", value: "109.050", unit: "kVar" },
  { signal: "Power factor", value: "0.982", unit: "" },
  { signal: "A phase voltage", value: "228.7", unit: "V" },
  { signal: "B phase voltage", value: "229.1", unit: "V" },
  { signal: "C phase voltage", value: "228.9", unit: "V" },
  { signal: "A phase current", value: "104", unit: "A" },
  { signal: "B phase current", value: "103", unit: "A" },
  { signal: "C phase current", value: "104", unit: "A" },
  { signal: "Total power consumption", value: "1048830.25", unit: "kWh" },
];

const OVERVIEW_ROWS = [
  { signal: "Device count", value: "6", unit: "pcs" },
  { signal: "Online devices", value: "6", unit: "pcs" },
  { signal: "Active power", value: "350.200", unit: "kW" },
  { signal: "Load power", value: "423.673", unit: "kW" },
  { signal: "Daily energy yield", value: "1220.38", unit: "kWh" },
];

export default {
  name: "EnergyMonitoringTab",
  props: {
    ownerData: { type: Object, default: () => ({}) },
  },
  computed: {
    node() {
      return this.ownerData?.node || this.ownerData || {};
    },
    nodeName() {
      return this.node?.name || "Energy Node";
    },
    nodeMode() {
      return this.node?.mode || "";
    },
    rows() {
      if (this.nodeMode === "logger") return LOGGER_ROWS;
      if (this.nodeMode === "inverter") return INVERTER_ROWS;
      if (this.nodeMode === "meter") return METER_ROWS;
      return OVERVIEW_ROWS;
    },
  },
};
</script>

<style scoped>
.energy-monitoring-tab {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  color: #233044;
  box-sizing: border-box;
}

.energy-monitoring-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #d9d9d9;
}

.energy-monitoring-title {
  font-size: 18px;
  font-weight: 700;
}

.energy-monitoring-subtitle {
  margin-top: 2px;
  font-size: 12px;
  color: #667085;
}

.energy-monitoring-badge {
  padding: 4px 10px;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  color: #475569;
  font-size: 12px;
}

.energy-monitoring-tabs {
  display: flex;
  gap: 4px;
  padding: 8px 12px 0;
  border-bottom: 1px solid #d0d7e2;
}

.energy-monitoring-tab-item {
  padding: 6px 18px;
  border: 1px solid #cbd5e1;
  border-bottom: none;
  border-radius: 8px 8px 0 0;
  color: #475569;
  background: #f8fafc;
  font-size: 13px;
}

.energy-monitoring-tab-item.active {
  color: #1f2937;
  background: #ffffff;
  font-weight: 700;
}

.energy-monitoring-table-wrap {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 10px 12px 16px;
}

.energy-monitoring-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  font-size: 14px;
}

.energy-monitoring-table th {
  text-align: left;
  padding: 8px;
  background: #f1f5f9;
  border: 1px solid #dbe1ea;
  font-weight: 700;
}

.energy-monitoring-table td {
  padding: 7px 8px;
  border: 1px solid #e1e5eb;
}

.energy-monitoring-table tbody tr:nth-child(odd) {
  background: #e5e5e5;
}

.energy-monitoring-table tbody tr:nth-child(even) {
  background: #ffffff;
}

.col-no {
  width: 52px;
}

.col-help {
  width: 80px;
  text-align: center;
}
</style>
