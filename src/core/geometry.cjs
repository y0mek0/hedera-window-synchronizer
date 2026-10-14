function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function panelGrid(profile, panelIds) {
  const count = panelIds.length;
  const columns = count >= 7 ? 4 : 3;
  const rows = Math.ceil(count / columns);
  return { columns, rows };
}

function panelStyle(index, panelIds) {
  const { columns, rows } = panelGrid({}, panelIds);
  const row = Math.floor(index / columns);
  const column = index % columns;
  return {
    gridColumn: `${column + 1}`,
    gridRow: `${row + 1}`,
    minHeight: rows > 2 ? 190 : 230
  };
}

function safeBounds(bounds, display) {
  const width = clamp(bounds.width, 980, display.width);
  const height = clamp(bounds.height, 640, display.height);
  const x = clamp(bounds.x, display.x, display.x + display.width - width);
  const y = clamp(bounds.y, display.y, display.y + display.height - height);
  return { x, y, width, height };
}

module.exports = { panelGrid, panelStyle, safeBounds };
