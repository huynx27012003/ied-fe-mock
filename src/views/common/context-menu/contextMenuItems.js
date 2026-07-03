const menuLabel = (language, english, vietnamese) =>
  language === "vi-vi" ? vietnamese : english;

export function buildContextMenuSections({ hasSelectedNode, language }) {
  if (!hasSelectedNode) return [];

  return [
    {
      key: "delete",
      items: [
        {
          label: menuLabel(language, "Delete", "Xóa"),
          action: "delete",
          danger: true,
        },
      ],
    },
  ];
}
