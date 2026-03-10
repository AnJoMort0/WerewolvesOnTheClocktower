import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Heart, Skull } from "lucide-react";
import poisonedIcon from "@/assets/icons/poisoned.png";
import ghostIcon from "@/assets/icons/ghost.png";

export type PlayerStatus = "alive" | "poisoned" | "dead-this-night" | "dead";

interface PlayerStatusPopoverProps {
  children: React.ReactNode;
  status: PlayerStatus;
  isPermanentlyDead?: boolean;
  onSetPoisoned: () => void;
  onSetDead: () => void;
  onSetAlive: () => void;
  onSetPermaDead?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const PlayerStatusPopover = ({
  children,
  status,
  isPermanentlyDead,
  onSetPoisoned,
  onSetDead,
  onSetAlive,
  onSetPermaDead,
  open,
  onOpenChange,
}: PlayerStatusPopoverProps) => {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-auto p-2 flex flex-col gap-1" side="top" align="center">
        {isPermanentlyDead ? (
          <Button
            size="sm"
            variant="ghost"
            className="justify-start gap-2 text-green-400 hover:text-green-300"
            onClick={onSetAlive}
          >
            <Heart className="h-4 w-4" />
            Ressuscitar
          </Button>
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
          </>
        ) : (
          <>
            <Button
              size="sm"
              variant="ghost"
              className={`justify-start gap-2 ${status === "poisoned" ? "text-green-400" : "text-muted-foreground"} hover:text-green-300`}
              onClick={onSetPoisoned}
            >
              <img src={poisonedIcon} alt="" className="h-4 w-4" />
              {status === "poisoned" ? "Remover Veneno" : "Envenenar"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="justify-start gap-2 text-destructive hover:text-destructive/80"
              onClick={onSetDead}
            >
              <img src={ghostIcon} alt="" className="h-4 w-4" />
              Matar
            </Button>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
};
