import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import poisonedIcon from "@/assets/icons/poisoned.png";
import ghostIcon from "@/assets/icons/ghost.png";
import illusionIcon from "@/assets/icons/illusion.png";

export type PlayerStatus = "alive" | "poisoned" | "dead-this-night" | "dead";

interface PlayerStatusPopoverProps {
  children: React.ReactNode;
  status: PlayerStatus;
  isPermanentlyDead?: boolean;
  isPoisoned?: boolean;
  onSetPoisoned: () => void;
  onSetDead: () => void;
  onSetAlive: () => void;
  onSetPermaDead?: () => void;
  onSetIllusion?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showPoison?: boolean;
  showIllusion?: boolean;
  isIllusion?: boolean;
}

export const PlayerStatusPopover = ({
  children,
  status,
  isPermanentlyDead,
  isPoisoned = false,
  onSetPoisoned,
  onSetDead,
  onSetAlive,
  onSetPermaDead,
  onSetIllusion,
  open,
  onOpenChange,
  showPoison = true,
  showIllusion = false,
  isIllusion = false,
}: PlayerStatusPopoverProps) => {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-auto p-2 flex flex-col gap-1" side="top" align="center">
        {isPermanentlyDead ? (
          <>
            <Button
              size="sm"
              variant="ghost"
              className="justify-start gap-2 text-green-400 hover:text-green-300"
              onClick={onSetAlive}
            >
              <Heart className="h-4 w-4" />
              Ressuscitar
            </Button>
            {showPoison && isPoisoned && (
              <Button
                size="sm"
                variant="ghost"
                className="justify-start gap-2 text-green-400 hover:text-green-300"
                onClick={onSetPoisoned}
              >
                <img src={poisonedIcon} alt="" className="h-4 w-4" />
                Remover Veneno
              </Button>
            )}
            {onSetIllusion && isIllusion && (
              <Button
                size="sm"
                variant="ghost"
                className="justify-start gap-2 text-purple-400 hover:text-purple-300"
                onClick={onSetIllusion}
              >
                <img src={illusionIcon} alt="" className="h-4 w-4" />
                Remover Ilusão
              </Button>
            )}
          </>
        ) : status === "dead-this-night" ? (
          <>
            <Button
              size="sm"
              variant="ghost"
              className="justify-start gap-2 text-green-400 hover:text-green-300"
              onClick={onSetAlive}
            >
              <Heart className="h-4 w-4" />
              Ressuscitar
            </Button>
            {onSetPermaDead && (
              <Button
                size="sm"
                variant="ghost"
                className="justify-start gap-2 text-muted-foreground hover:text-muted-foreground/80"
                onClick={onSetPermaDead}
              >
                <img src={ghostIcon} alt="" className="h-4 w-4 opacity-50" />
                Morte Permanente
              </Button>
            )}
            {showPoison && (
              <Button
                size="sm"
                variant="ghost"
                className={`justify-start gap-2 ${isPoisoned ? "text-green-400" : "text-muted-foreground"} hover:text-green-300`}
                onClick={onSetPoisoned}
              >
                <img src={poisonedIcon} alt="" className="h-4 w-4" />
                {isPoisoned ? "Remover Veneno" : "Envenenar"}
              </Button>
            )}
            {showIllusion && onSetIllusion && (
              <Button
                size="sm"
                variant="ghost"
                className={`justify-start gap-2 ${isIllusion ? "text-purple-400" : "text-muted-foreground"} hover:text-purple-300`}
                onClick={onSetIllusion}
              >
                <img src={illusionIcon} alt="" className="h-4 w-4" />
                {isIllusion ? "Remover Ilusão" : "Ilusão"}
              </Button>
            )}
          </>
        ) : (
          <>
            {showPoison && (
              <Button
                size="sm"
                variant="ghost"
                className={`justify-start gap-2 ${isPoisoned ? "text-green-400" : "text-muted-foreground"} hover:text-green-300`}
                onClick={onSetPoisoned}
              >
                <img src={poisonedIcon} alt="" className="h-4 w-4" />
                {isPoisoned ? "Remover Veneno" : "Envenenar"}
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              className="justify-start gap-2 text-destructive hover:text-destructive/80"
              onClick={onSetDead}
            >
              <img src={ghostIcon} alt="" className="h-4 w-4" />
              Matar
            </Button>
            {showIllusion && onSetIllusion && (
              <Button
                size="sm"
                variant="ghost"
                className={`justify-start gap-2 ${isIllusion ? "text-purple-400" : "text-muted-foreground"} hover:text-purple-300`}
                onClick={onSetIllusion}
              >
                <img src={illusionIcon} alt="" className="h-4 w-4" />
                {isIllusion ? "Remover Ilusão" : "Ilusão"}
              </Button>
            )}
          </>
        )}
      </PopoverContent>
    </Popover>
  );
};
