const fs = require('node:fs');

function applyProfileUpdate(windowsConfig, payload) {
  const { profileId, bounds, panels } = payload || {};
  const profile = windowsConfig.profiles?.[profileId];
  if (!profile) throw new Error(`Unknown profile: ${profileId}`);
  const validIds = new Set((windowsConfig.windows || []).map((item) => item.id));
  const safePanels = Array.isArray(panels) ? panels.filter((id) => validIds.has(id)) : profile.panels;
  profile.bounds = {
    x: Number.isFinite(Number(bounds?.x)) ? Number(bounds.x) : 0,
    y: Number.isFinite(Number(bounds?.y)) ? Number(bounds.y) : 0,
    width: Math.max(980, Number(bounds?.width) || profile.bounds.width),
    height: Math.max(640, Number(bounds?.height) || profile.bounds.height)
  };
  profile.panels = safePanels.length ? safePanels : profile.panels;
  return profile;
}

function saveProfileFile(filePath, windowsConfig, payload) {
  applyProfileUpdate(windowsConfig, payload);
  fs.writeFileSync(filePath, `${JSON.stringify(windowsConfig, null, 2)}\n`, 'utf8');
  return windowsConfig.profiles[payload.profileId];
}

module.exports = { applyProfileUpdate, saveProfileFile };
