import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { ROLES, type RoleId } from "@/lib/roles";
import ghostExecutedIcon from "@/assets/icons/ghost_executed.png";
import villagerIcon from "@/assets/icons/villager.png";
import { Checkbox } from "@/components/ui/checkbox";

export type RevealCard = {
  /** Optional player name (Menina shows; Faroleiro hides) */
  name?: string;
  /** Image URL to display */
  image: string;
  /** Label under the image */
  label: string;
  /** Optional checkbox state for Faroleiro reveal */
  checkboxes?: boolean[];
};

interface RevealModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  cards: RevealCard[];
}

export const RevealModal = ({ open, onClose, title, subtitle, cards }: RevealModalProps) => {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-card border border-border rounded-2xl p-6 max-w-lg w-full space-y-4 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl text-blue-400">{title}</h2>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            {subtitle && <p className="text-muted-foreground text-sm">{subtitle}</p>}

            <div className="grid grid-cols-2 gap-4">
              {cards.map((c, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-secondary border border-border rounded-xl p-4 flex flex-col items-center gap-2"
                >
                  <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-primary/40 shadow-lg">
                    <img src={c.image} alt={c.label} className="w-full h-full object-cover" />
                  </div>
                  {c.name && <span className="font-body text-sm text-foreground">{c.name}</span>}
                  <span className="font-display text-xs text-blue-400 text-center">{c.label}</span>
                  {c.checkboxes && (
                    <div className="flex gap-1 mt-1">
                      {c.checkboxes.map((checked, idx) => (
                        <Checkbox key={idx} checked={checked} disabled className="h-4 w-4 border-primary data-[state=checked]:bg-primary" />
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/** Resolve killer card image + label from a kill source string */
export function resolveKillerCard(
  source: string | undefined,
  roleAssignments: Record<string, RoleId>,
  illusionPlayerId: string | null,
): { image: string; label: string } {
  if (!source || source === "manual") {
    return { image: villagerIcon, label: "(Manual)" };
  }
  if (source === "executado") {
    return { image: ghostExecutedIcon, label: "Execução" };
  }
  if (source === "soldado") {
    const role = ROLES["v09"];
    return { image: role.image, label: role.label };
  }
  // If killer player was under illusion, show ilusionista
  // (source value carries the role id of the killer)
  if (illusionPlayerId) {
    const illusionRole = roleAssignments[illusionPlayerId];
    if (illusionRole === source) {
      const role = ROLES["a06"];
      return { image: role.image, label: role.label };
    }
  }
  // Default: treat source as a role id
  const role = ROLES[source as RoleId];
  if (role) return { image: role.image, label: role.label };
  return { image: villagerIcon, label: "Desconhecido" };
}
