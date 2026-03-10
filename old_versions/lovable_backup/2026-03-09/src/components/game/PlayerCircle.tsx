import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { ROLES, type RoleId } from "@/lib/roles";
import { PlayerStatusPopover, type PlayerStatus } from "./PlayerStatusPopover";
import poisonedIcon from "@/assets/icons/poisoned.png";
import illusionIcon from "@/assets/icons/illusion.png";
import imunityIcon from "@/assets/icons/imunity_full.png";
import { toast } from "sonner";

type Player = {
  id: string;
  name: string;
  seat_position: number | null;
  character: string | null;
  is_alive: boolean;
};

const POISON_DRAG_ROLE: RoleId = "e02";
const KILL_DRAG_ROLE: RoleId = "e01";
const CHAMAN_ROLE: RoleId = "e03";
const ILLUSION_DRAG_ROLE: RoleId = "a06";

interface PlayerCircleProps {
  players: Player[];
  totalSlots: number;
  onDropPlayer: (playerId: string, position: number | null) => void;
  isGM?: boolean;
  roleAssignments?: Record<string, RoleId>;
  playerStatuses?: Record<string, PlayerStatus>;
  permanentlyDead?: Set<string>;
  onPlayerStatusChange?: (playerId: string, status: PlayerStatus) => void;
  isPlaying?: boolean;
  poisonedPlayerId?: string | null;
  illusionPlayerId?: string | null;
  onSetIllusion?: (playerId: string) => void;
  isBruxaPermaDead?: boolean;
  isMarionetista?: boolean;
  chamanCharges?: number;
  onChamanChargeToggle?: (index: number) => void;
  onChamanDrop?: (targetPlayerId: string) => void;
  isBruxaPoisoned?: boolean;
  compact?: boolean;
  foxDisabled?: boolean;
  onFoxDisabledToggle?: () => void;
}

export const PlayerCircle = ({
  players,
  totalSlots,
  onDropPlayer,
  isGM,
  roleAssignments,
  playerStatuses = {},
  permanentlyDead = new Set(),
  onPlayerStatusChange,
  isPlaying,
  poisonedPlayerId,
  illusionPlayerId,
  onSetIllusion,
  isBruxaPermaDead = false,
  isMarionetista = false,
  chamanCharges = 0,
  onChamanChargeToggle,
  onChamanDrop,
  isBruxaPoisoned = false,
  compact = false,
  foxDisabled = false,
  onFoxDisabledToggle,
}: PlayerCircleProps) => {
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);
  const seatedPlayers = players.filter((p) => p.seat_position !== null);

  const scale = compact ? 0.65 : 1;
  const baseSize = Math.min(260, 80 + totalSlots * 12);
  const radiusX = Math.min(520, baseSize * 2.0) * scale;
  const radiusY = Math.min(280, baseSize * 0.95) * scale;

  const isChamanPoisoned = useMemo(() => {
    if (!poisonedPlayerId || !roleAssignments) return false;
    return roleAssignments[poisonedPlayerId] === CHAMAN_ROLE;
  }, [poisonedPlayerId, roleAssignments]);

  const handleDrop = (e: React.DragEvent, position: number) => {
    e.preventDefault();
    const action = e.dataTransfer.getData("action");
    if (action && isPlaying && onPlayerStatusChange) {
      const seated = seatedPlayers.find((p) => p.seat_position === position);
      if (seated) {
        if (action === "poison") onPlayerStatusChange(seated.id, "poisoned");
        else if (action === "kill") {
          // Check if target is Bruxa and poisoned (immune)
          if (roleAssignments?.[seated.id] === "e02" && poisonedPlayerId === seated.id) {
            toast.warning("A Bruxa está envenenada e tem imunidade total!");
            return;
          }
          onPlayerStatusChange(seated.id, "dead-this-night");
        }
        else if (action === "chaman") {
          if (isChamanPoisoned) {
            toast.warning("O Chaman está envenenado e não pode agir!");
            return;
          }
          onChamanDrop?.(seated.id);
        }
        else if (action === "illusion") onSetIllusion?.(seated.id);
      }
      return;
    }
    const playerId = e.dataTransfer.getData("playerId");
    if (playerId) {
      const existing = seatedPlayers.find((p) => p.seat_position === position);
      if (existing) onDropPlayer(existing.id, null);
      onDropPlayer(playerId, position);
    }
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const handleUnseat = (playerId: string) => {
    if (!roleAssignments) onDropPlayer(playerId, null);
  };

  const containerW = radiusX * 2 + 140;
  const containerH = radiusY * 2 + 160;

  const getStatusClasses = (playerId: string) => {
    const status = playerStatuses[playerId];
    const isPDead = permanentlyDead.has(playerId);
    if (isPDead) return "grayscale opacity-50";
    if (playerId === poisonedPlayerId) return "ring-2 ring-green-500";
    if (playerId === illusionPlayerId) return "ring-2 ring-purple-500";
    if (status === "dead-this-night") return "";
    return "";
  };

  const getBorderClass = (playerId: string) => {
    const status = playerStatuses[playerId];
    if (playerId === illusionPlayerId) return "border-purple-500";
    if (playerId === poisonedPlayerId) return "border-green-500";
    if (status === "dead-this-night") return "border-destructive";
    return "border-primary/40";
  };

  const getDragProps = (playerId: string) => {
    if (!isPlaying || !roleAssignments) return {};
    const role = roleAssignments[playerId];
    if (role === POISON_DRAG_ROLE && !permanentlyDead.has(playerId)) {
      return {
        draggable: true,
        onDragStart: (e: React.DragEvent) => {
          e.dataTransfer.setData("action", "poison");
          e.dataTransfer.effectAllowed = "move";
        },
      };
    }
    if (role === KILL_DRAG_ROLE) {
      return {
        draggable: true,
        onDragStart: (e: React.DragEvent) => {
          // Block if any werewolf (non-white) is poisoned
          if (poisonedPlayerId) {
            const poisonedRole = roleAssignments?.[poisonedPlayerId];
            if (poisonedRole && (["e01", "m01", "m02", "m03"] as RoleId[]).includes(poisonedRole)) {
              e.preventDefault();
              toast.warning("Os Lobisomens estão envenenados e não podem agir!");
              return;
            }
          }
          e.dataTransfer.setData("action", "kill");
          e.dataTransfer.effectAllowed = "move";
        },
      };
    }
    if (role === CHAMAN_ROLE && !permanentlyDead.has(playerId)) {
      return {
        draggable: true,
        onDragStart: (e: React.DragEvent) => {
          if (isChamanPoisoned) {
            e.preventDefault();
            toast.warning("O Chaman está envenenado e não pode agir!");
            return;
          }
          e.dataTransfer.setData("action", "chaman");
          e.dataTransfer.effectAllowed = "move";
        },
      };
    }
    if (role === ILLUSION_DRAG_ROLE && !permanentlyDead.has(playerId)) {
      return {
        draggable: true,
        onDragStart: (e: React.DragEvent) => {
          e.dataTransfer.setData("action", "illusion");
          e.dataTransfer.effectAllowed = "move";
        },
      };
    }
    return {};
  };

  return (
    <div className="relative" style={{ width: containerW, height: containerH }}>
      {/* Center label */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-16 h-16 rounded-full border border-border/50 flex items-center justify-center">
          <span className="text-muted-foreground/40 font-display text-xs tracking-wider">
            {seatedPlayers.length}/{totalSlots}
          </span>
        </div>
      </div>

      {/* Slots */}
      {Array.from({ length: totalSlots }).map((_, i) => {
        const angle = (2 * Math.PI * i) / totalSlots - Math.PI / 2;
        const x = radiusX * Math.cos(angle) + containerW / 2;
        const y = radiusY * Math.sin(angle) + containerH / 2;

        const seated = seatedPlayers.find((p) => p.seat_position === i);
        const role = seated && roleAssignments?.[seated.id];
        const roleDef = role ? ROLES[role] : null;
        const status = seated ? (playerStatuses[seated.id] || "alive") : "alive";
        const isPermanentlyDead = seated ? permanentlyDead.has(seated.id) : false;
        const dragProps = seated ? getDragProps(seated.id) : {};
        const hasDrag = !!dragProps.draggable;
        const isThisIllusion = seated ? seated.id === illusionPlayerId : false;
        const isThisPoisoned = seated ? seated.id === poisonedPlayerId : false;
        const isThisBruxaPoisoned = seated ? (role === "e02" && isThisPoisoned) : false;
        const isChaman = role === CHAMAN_ROLE;
        const isFox = role === ("v04" as RoleId);
        const playerNode = seated ? (
          <div
            draggable={hasDrag}
            onDragStart={dragProps.onDragStart}
          >
            <motion.div
              layout
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`flex flex-col items-center cursor-pointer ${getStatusClasses(seated.id)} ${hasDrag ? "cursor-grab active:cursor-grabbing" : ""}`}
              onClick={() => {
                if (isGM && isPlaying && onPlayerStatusChange) {
                  setOpenPopoverId(openPopoverId === seated.id ? null : seated.id);
                } else if (isGM && !roleAssignments) {
                  handleUnseat(seated.id);
                }
              }}
            >
              <div className="relative">
                {roleDef ? (
                  <div className={`w-14 h-14 rounded-xl overflow-hidden border-2 ${getBorderClass(seated.id)} shadow-lg flex-shrink-0`}>
                    <img
                      src={roleDef.image}
                      alt={roleDef.label}
                      className={`w-full h-full object-cover ${isPermanentlyDead ? "grayscale" : ""}`}
                    />
                  </div>
                ) : (
                  <div className={`w-12 h-12 rounded-full bg-card border-2 ${getBorderClass(seated.id)} flex items-center justify-center paper-texture flex-shrink-0`}>
                    <span className="font-display text-sm font-bold">
                      {seated.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                {/* Dead X overlay */}
                {(status === "dead-this-night" || isPermanentlyDead) && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <X
                      className={`w-10 h-10 ${isPermanentlyDead ? "text-muted-foreground" : "text-destructive"}`}
                      strokeWidth={3}
                    />
                  </div>
                )}
                {/* Illusion icon */}
                {isThisIllusion && (
                  <img src={illusionIcon} alt="ilusão" className="absolute -top-1 -right-1 w-5 h-5" />
                )}
                {/* Poison icon (shown even on dead players) */}
                {isThisPoisoned && !isThisBruxaPoisoned && (
                  <img src={poisonedIcon} alt="envenenado" className="absolute -bottom-1 -right-1 w-5 h-5" />
                )}
                {/* Bruxa immunity icon when poisoned */}
                {isThisBruxaPoisoned && (
                  <img src={imunityIcon} alt="imunidade" className="absolute -top-1 -left-1 w-5 h-5" />
                )}
              </div>
              <span className={`text-xs font-body max-w-[80px] truncate text-center mt-1 ${isThisPoisoned ? "text-green-400" : isThisIllusion ? "text-purple-400" : ""}`}>
                {seated.name}
              </span>
              {isGM && roleDef && (
                <span className={`text-[10px] font-display leading-tight ${isThisPoisoned ? "text-green-400" : isThisIllusion ? "text-purple-400" : "text-primary"}`}>
                  {roleDef.label}
                </span>
              )}
              {/* Chaman charge boxes */}
              {isGM && isChaman && !isPermanentlyDead && onChamanChargeToggle && (
                <div
                  className="flex gap-1 mt-0.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  {[0, 1].map((idx) => (
                    <Checkbox
                      key={idx}
                      checked={(chamanCharges ?? 0) > idx}
                      onCheckedChange={() => {
                        if (isChamanPoisoned) {
                          toast.warning("O Chaman está envenenado e não pode agir!");
                          return;
                        }
                        onChamanChargeToggle(idx);
                      }}
                      className="h-4 w-4 border-primary data-[state=checked]:bg-primary"
                    />
                  ))}
                </div>
              )}
              {/* Fox power checkbox */}
              {isGM && isFox && !isPermanentlyDead && onFoxDisabledToggle && (
                <div
                  className="flex items-center gap-1 mt-0.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Checkbox
                    checked={foxDisabled}
                    onCheckedChange={() => onFoxDisabledToggle()}
                    className="h-4 w-4 border-primary data-[state=checked]:bg-primary"
                  />
                  <span className="text-[9px] text-muted-foreground">Esgotado</span>
                </div>
              )}
            </motion.div>
          </div>
        ) : (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.05 }}
            className="w-12 h-12 rounded-full border-2 border-dashed border-border/50 flex items-center justify-center"
          >
            <span className="text-muted-foreground/30 text-xs">{i + 1}</span>
          </motion.div>
        );

        const showPoison = !isBruxaPermaDead;
        const showIllusion = isMarionetista && !isPermanentlyDead;

        const wrappedNode = seated && isGM && isPlaying && onPlayerStatusChange ? (
          <PlayerStatusPopover
            status={status}
            isPermanentlyDead={isPermanentlyDead}
            isPoisoned={isThisPoisoned}
            open={openPopoverId === seated.id}
            onOpenChange={(open) => setOpenPopoverId(open ? seated.id : null)}
            showPoison={showPoison}
            showIllusion={showIllusion}
            isIllusion={isThisIllusion}
            onSetPoisoned={() => {
              onPlayerStatusChange(seated.id, "poisoned");
              setOpenPopoverId(null);
            }}
            onSetDead={() => {
              if (role === "e02" && poisonedPlayerId === seated.id) {
                toast.warning("A Bruxa está envenenada e tem imunidade total!");
                setOpenPopoverId(null);
                return;
              }
              onPlayerStatusChange(seated.id, "dead-this-night");
              setOpenPopoverId(null);
            }}
            onSetAlive={() => {
              onPlayerStatusChange(seated.id, "alive");
              setOpenPopoverId(null);
            }}
            onSetPermaDead={() => {
              onPlayerStatusChange(seated.id, "dead");
              setOpenPopoverId(null);
            }}
            onSetIllusion={() => {
              onSetIllusion?.(seated.id);
              setOpenPopoverId(null);
            }}
          >
            {playerNode}
          </PlayerStatusPopover>
        ) : (
          playerNode
        );

        return (
          <div
            key={i}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: x, top: y }}
            onDrop={(e) => handleDrop(e, i)}
            onDragOver={handleDragOver}
          >
            {wrappedNode}
          </div>
        );
      })}
    </div>
  );
};
