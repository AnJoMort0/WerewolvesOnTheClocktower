import { ROLES, ALL_ROLE_IDS, type RoleId } from "@/lib/roles";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RoleSelectorProps {
  value: RoleId;
  onChange: (role: RoleId) => void;
}

export const RoleSelector = ({ value, onChange }: RoleSelectorProps) => (
  <Select value={value} onValueChange={(v) => onChange(v as RoleId)}>
    <SelectTrigger className="w-[140px] h-8 text-xs font-display">
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      {ALL_ROLE_IDS.map((id) => (
        <SelectItem key={id} value={id} className="text-xs font-display">
          <div className="flex items-center gap-2">
            <img src={ROLES[id].image} alt={ROLES[id].label} className="w-5 h-5 rounded" />
            {ROLES[id].label}
          </div>
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);
