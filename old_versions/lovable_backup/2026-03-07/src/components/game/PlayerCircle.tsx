import { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { ROLES, type RoleId } from "@/lib/roles";
import { PlayerStatusPopover, type PlayerStatus } from "./PlayerStatusPopover";

type Player = {
  id: string;
  name: string;
  seat_position: number | null;
  character: string | null;
  is_alive: boolean;
};

/** Roles that can be dragged to poison */
const POISON_DRAG_ROLE: RoleId = "e02";
/** Roles that can be dragged to kill */
const KILL_DRAG_ROLE: RoleId = "e01";

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
}: PlayerCircleProps) => {
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);
  const seatedPlayers = players.filter((p) => p.seat_position !== null);

  const baseSize = Math.min(260, 80 + totalSlots * 12);
  const radiusX = Math.min(520, baseSize * 2.0);
  const radiusY = Math.min(280, baseSize * 0.95);

  const handleDrop = (e: React.DragEvent, position: number) => {
    e.preventDefault();
    // Check for status action drops first
    const action = e.dataTransfer.getData("action");
    if (action && isPlaying && onPlayerStatusChange) {
      const seated = seatedPlayers.find((p) => p.seat_position === position);
      if (seated) {
        if (action === "poison") onPlayerStatusChange(seated.id, "poisoned");
        else if (action === "kill") onPlayerStatusChange(seated.id, "dead-this-night");
      }
      return;
    }
    // Original seating logic
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
    const isPermanentlyDead = permanentlyDead.has(playerId);
    if (isPermanentlyDead) return "grayscale opacity-50";
    if (status === "poisoned") return "ring-2 ring-green-500";
    if (status === "dead-this-night") return "";
    return "";
  };

  const getBorderClass = (playerId: string) => {
    const status = playerStatuses[playerId];
    if (status === "poisoned") return "border-green-500";
    if (status === "dead-this-night") return "border-destructive";
    return "border-primary/40";
  };

  const getDragProps = (playerId: string) => {
    if (!isPlaying || !roleAssignments) return {};
    const role = roleAssignments[playerId];
    if (role === POISON_DRAG_ROLE) {
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
          e.dataTransfer.setData("action", "kill");
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
              title={isGM && !roleAssignments ? "Click to unseat" : undefined}
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
            </div>
            <span className={`text-xs font-body max-w-[80px] truncate text-center mt-1 ${status === "poisoned" ? "text-green-400" : ""}`}>
              {seated.name}
            </span>
            {isGM && roleDef && (
              <span className={`text-[10px] font-display leading-tight ${status === "poisoned" ? "text-green-400" : "text-primary"}`}>
                {roleDef.label}
              </span>
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

        // Wrap seated players with status popover when playing
        const wrappedNode = seated && isGM && isPlaying && onPlayerStatusChange ? (
          <PlayerStatusPopover
            status={status}
            isPermanentlyDead={isPermanentlyDead}
            open={openPopoverId === seated.id}
            onOpenChange={(open) => setOpenPopoverId(open ? seated.id : null)}
            onSetPoisoned={() => {
              onPlayerStatusChange(seated.id, status === "poisoned" ? "alive" : "poisoned");
              setOpenPopoverId(null);
            }}
            onSetDead={() => {
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
