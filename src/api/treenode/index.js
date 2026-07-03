const MOCK_ENTITY_TREE = [
  {
    id: 'site-01',
    name: 'Site 1',
    mode: 'site',
    expanded: true,
    children: [
      {
        id: 'site-01-smartlogger',
        name: 'SmartLogger3000',
        mode: 'smartLogger',
        expanded: true,
        children: [
          {
            id: 'site-01-smartlogger-local',
            name: 'Logger(Local)',
            mode: 'logger',
            status: 'online',
            children: [],
          },
        ],
      },
      {
        id: 'site-01-inverter',
        name: 'Inverter',
        mode: 'inverterGroup',
        expanded: true,
        children: [
          {
            id: 'site-01-inverter-com1-1',
            name: 'Inverter(COM1-1)',
            mode: 'inverter',
            status: 'online',
            children: [],
          },
          {
            id: 'site-01-inverter-com1-12',
            name: 'Inverter(COM1-12)',
            mode: 'inverter',
            status: 'online',
            children: [],
          },
          {
            id: 'site-01-inverter-com1-13',
            name: 'Inverter(COM1-13)',
            mode: 'inverter',
            status: 'online',
            children: [],
          },
          {
            id: 'site-01-inverter-com1-14',
            name: 'Inverter(COM1-14)',
            mode: 'inverter',
            status: 'online',
            children: [],
          },
        ],
      },
      {
        id: 'site-01-meter',
        name: 'Meter',
        mode: 'meterGroup',
        expanded: true,
        children: [
          {
            id: 'site-01-meter-com2-11',
            name: 'Meter(COM2-11)',
            mode: 'meter',
            status: 'online',
            children: [],
          },
        ],
      },
    ],
  },
];

function cloneMockEntityTree() {
  return JSON.parse(JSON.stringify(MOCK_ENTITY_TREE));
}

export async function getEntityTreeRaw() {
  return cloneMockEntityTree();
}

export async function getEntityTree() {
  const data = await getEntityTreeRaw();
  const result = Array.isArray(data) ? data.map(normalizeNode) : [];
  return result;
}

// Chuẩn hóa node
export function normalizeNode(n = {}) {
  return {
    id: n.id ?? null,
    name: n.name ?? "",
    mode: n.mode ?? "",
    description: n.description ?? null,
    value: n.value ?? null,
    unit: n.unit ?? null,
    convertedValue: n.convertedValue ?? null,
    primaryValue: n.primaryValue ?? null,
    convertedMinVal: n.convertedMinVal ?? null,
    convertedMaxVal: n.convertedMaxVal ?? null,
    convertedUnit: n.convertedUnit ?? null,
    minVal: n.minVal ?? null,
    maxVal: n.maxVal ?? null,
    options: Array.isArray(n.options) ? [...n.options] : [],
    children: Array.isArray(n.children) ? n.children.map(normalizeNode) : [],
  };
}

export function findNodeById(tree = [], id) {
  const t = String(id);
  const stack = [...tree];
  while (stack.length) {
    const n = stack.pop();
    if (!n) continue;
    if (String(n.id) === t) {
      return n;
    }
    if (n.children?.length) stack.push(...n.children);
  }
  return null;
}

// Làm phẳng cây
export function flattenTree(tree = []) {
  const out = [];
  (function walk(arr) {
    if (!Array.isArray(arr)) return;
    for (const n of arr) {
      out.push(n);
      if (n?.children?.length) walk(n.children);
    }
  })(tree);
  return out;
}

export function filterTreeByName(tree = [], keyword = '') {
  const q = keyword.trim().toLowerCase();
  if (!q) return tree;
  const dfs = (n) => {
    const hit = (n?.name || '').toLowerCase().includes(q);
    const kids = (n?.children || []).map(dfs).filter(Boolean);
    return hit || kids.length ? { ...n, children: kids } : null;
  };
  const res = [];
  for (const r of tree) {
    const n = dfs(r);
    if (n) res.push(n);
  }
  return res;
}

function findPathById(tree = [], id) {
  const target = String(id);
  const path = [];
  let ok = false;

  function dfs(n) {
    if (!n || ok) return;
    path.push(n);
    if (String(n.id) === target) {
      ok = true;
      return;
    }
    for (const k of n.children || []) {
      dfs(k);
      if (ok) return;
    }
    path.pop();
  }

  for (const root of tree) {
    if (ok) break;
    dfs(root);
  }
  return ok ? path : null;
}

// Get properties by ID
export function getPropertiesById(tree = [], nodeId) {
  const props = {
    Owner1: '',
    Owner2: '',
    Owner3: '',
    Location: '',
    VoltageLevel: '',
    Feeder: '',
  };

  const normalized = Array.isArray(tree) ? tree.map(normalizeNode) : [];
  const path = findPathById(normalized, nodeId);
  if (!path) {
    return props;
  }

  let ownerIdx = 0;
  for (const n of path) {
    switch (n.mode) {
      case 'organisation':
        if (ownerIdx < 3) props[`Owner${ownerIdx + 1}`] = n.name || '';
        ownerIdx++;
        break;
      case 'substation':
        props.Location = n.name || '';
        break;
      case 'voltageLevel':
        props.VoltageLevel = n.name || '';
        break;
      case 'bay':
        props.Feeder = n.name || '';
        break;
      default:
        break;
    }
  }
  return props;
}

export async function getPropertiesByIdAsync(nodeId) {
  const tree = await getEntityTree();
  const props = getPropertiesById(tree, nodeId);
  return props;
}

export function getParentById(tree = [], nodeId) {
  const normalized = Array.isArray(tree) ? tree.map(normalizeNode) : [];
  const path = findPathById(normalized, nodeId);
  const parent = (!path || path.length < 2) ? null : path[path.length - 2];
  return parent;
}

export function getAncestorsById(tree = [], nodeId) {
  const normalized = Array.isArray(tree) ? tree.map(normalizeNode) : [];
  const path = findPathById(normalized, nodeId);
  const ancestors = Array.isArray(path) && path.length > 1 ? path.slice(0, -1) : [];
  return ancestors;
}

export function getAncestorByMode(tree = [], nodeId, targetMode) {
  const ancestors = getAncestorsById(tree, nodeId);
  for (let i = ancestors.length - 1; i >= 0; i--) {
    if (ancestors[i]?.mode === targetMode) {
      return ancestors[i];
    }
  }
  return null;
}

export async function getParentByIdAsync(nodeId) {
  const tree = await getEntityTree();
  const parent = getParentById(tree, nodeId);
  return parent;
}

export async function getAncestorByModeAsync(nodeId, targetMode) {
  const tree = await getEntityTree();
  const ancestor = getAncestorByMode(tree, nodeId, targetMode);
  return ancestor;
}

export function getGroupByIedId(tree = [], iedId) {
  const t = String(iedId);
  const normalized = Array.isArray(tree) ? tree.map(normalizeNode) : [];
  const iedNode = findNodeById(normalized, t);
  if (!iedNode || iedNode.mode !== 'ied') {
    return null;
  }
  const result = {
    ...iedNode,
    children: (iedNode.children || []).filter(c => c.mode === 'protectionGroup')
  };
  return result;
}

export function findSubPathById(tree = [], nodeId, targetMode) {
  const normalized = Array.isArray(tree) ? tree.map(normalizeNode) : [];
  const fullPath = findPathById(normalized, nodeId);
  if (!fullPath) {
    return null;
  }
  let startIdx = -1;
  for (let i = fullPath.length - 1; i >= 0; i--) {
    if (fullPath[i]?.mode === targetMode) {
      startIdx = i;
      break;
    }
  }
  const result = startIdx === -1 ? null : fullPath.slice(startIdx);
  return result;
}

export default {
  getGroupByIedId,
  getEntityTreeRaw,
  getEntityTree,
  normalizeNode,
  findNodeById,
  flattenTree,
  filterTreeByName,
  getPropertiesById,
  getPropertiesByIdAsync,
  getParentById,
  getAncestorsById,
  getAncestorByMode,
  getParentByIdAsync,
  getAncestorByModeAsync,
  findSubPathById,
};
