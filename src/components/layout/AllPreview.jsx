const previewSlots = [
  (row) => row.sectionKey === "header",
  (row) => row.sectionKey === "hero",
  (row) => row.sectionKey === "about",
  (row) => /vision|mission/i.test(`${row.sectionKey} ${row.sectionName ?? ""}`),
  (row) => /goals/i.test(`${row.sectionKey} ${row.sectionName ?? ""}`),
  (row) => row.sectionKey === "services",
  (row) => /landscape/i.test(`${row.sectionKey} ${row.sectionName ?? ""}`),
  (row) => row.sectionKey === "testimonials",
  (row) => row.sectionKey === "contact",
  (row) => row.sectionKey === "footer",
];

function isActiveSection(row) {
  return row?.isActive !== false;
}

function pickRow(rows, used, match) {
  const row = rows
    .filter((item) => !used.has(item.sectionKey) && match(item))
    .sort((left, right) => (Number(left.order) || 0) - (Number(right.order) || 0))[0];
  if (row) used.add(row.sectionKey);
  return row;
}

export function previewRows(saved) {
  const rows = (Array.isArray(saved) ? saved : []).filter((row) => row?.sectionKey && isActiveSection(row));
  const used = new Set();
  const placed = previewSlots.map((match) => pickRow(rows, used, match)).filter(Boolean);
  const landscapeIndex = placed.findIndex((row) => /landscape/i.test(`${row.sectionKey} ${row.sectionName ?? ""}`));
  const servicesIndex = placed.findIndex((row) => row.sectionKey === "services");
  const extras = rows
    .filter((row) => !used.has(row.sectionKey))
    .sort((left, right) => (Number(left.order) || 0) - (Number(right.order) || 0));
  const insertAt = landscapeIndex !== -1 ? landscapeIndex : servicesIndex === -1 ? placed.length : servicesIndex + 1;
  return [...placed.slice(0, insertAt), ...extras, ...placed.slice(insertAt)];
}
