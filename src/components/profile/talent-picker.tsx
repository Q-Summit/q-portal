import { Checkbox } from "@/components/ui/checkbox";
import { TALENT_LABELS, type TalentKey } from "@/domain/qsum/profile";
import { cn } from "@/lib/utils";

const TALENT_CATEGORY_LABELS = {
  driver_license: "Driver's Licenses",
  gastronomy: "Gastronomy Experience",
} as const;

type TalentCategory = keyof typeof TALENT_CATEGORY_LABELS;

interface Talent {
  id: string;
  category: TalentCategory;
  key: string;
}

interface TalentPickerProps {
  talents: Talent[];
  selectedIds: string[];
  onToggle: (talentId: string) => void;
}

export function TalentPicker({ talents, selectedIds, onToggle }: TalentPickerProps) {
  const driverTalents = talents.filter((talent) => talent.category === "driver_license");
  const gastronomyTalents = talents.filter((talent) => talent.category === "gastronomy");

  const groups = [
    {
      category: "driver_license" as const,
      label: TALENT_CATEGORY_LABELS.driver_license,
      items: driverTalents,
    },
    {
      category: "gastronomy" as const,
      label: TALENT_CATEGORY_LABELS.gastronomy,
      items: gastronomyTalents,
    },
  ];

  return (
    <div className="grid gap-4">
      {groups.map((group) => (
        <div key={group.category} className="rounded-xl border border-border/80 p-4">
          <div className="text-sm font-semibold text-foreground">{group.label}</div>
          <div className="mt-3 grid gap-2">
            {group.items.length === 0 ? (
              <div className="text-sm text-muted-foreground">No options available.</div>
            ) : (
              group.items.map((talent) => {
                const isChecked = selectedIds.includes(talent.id);
                const talentLabel = TALENT_LABELS[talent.key as TalentKey]?.label ?? talent.key;
                return (
                  <label
                    key={talent.id}
                    className={cn(
                      "flex items-center gap-3 rounded-lg border px-3 py-2 text-sm",
                      isChecked ? "border-primary/40 bg-primary/5" : "border-transparent",
                    )}
                  >
                    <Checkbox checked={isChecked} onCheckedChange={() => onToggle(talent.id)} />
                    <span>{talentLabel}</span>
                  </label>
                );
              })
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
