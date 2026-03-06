import { motion } from "framer-motion";

type Player = {
  id: string;
  name: string;
  seat_position: number | null;
  character: string | null;
  is_alive: boolean;
};

interface PlayerCircleProps {
  players: Player[];
  totalSlots: number;
  onDropPlayer: (playerId: string, position: number | null) => void;
  isGM?: boolean;
}

export const PlayerCircle = ({
  players,
  totalSlots,
  onDropPlayer,
  isGM,
}: PlayerCircleProps) => {
  const seatedPlayers = players.filter((p) => p.seat_position !== null);
  const radius = Math.min(200, 80 + totalSlots * 12);

  const handleDrop = (e: React.DragEvent, position: number) => {
    e.preventDefault();
    const playerId = e.dataTransfer.getData("playerId");
    if (playerId) {
      // Unseat any player currently in this position
      const existing = seatedPlayers.find((p) => p.seat_position === position);
      if (existing) {
        onDropPlayer(existing.id, null);
      }
      onDropPlayer(playerId, position);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleUnseat = (playerId: string) => {
    onDropPlayer(playerId, null);
  };

  return (
    <div
      className="relative"
      style={{
        width: radius * 2 + 100,
        height: radius * 2 + 100,
      }}
    >
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
        const x = radius * Math.cos(angle) + radius + 50;
        const y = radius * Math.sin(angle) + radius + 50;

        const seated = seatedPlayers.find((p) => p.seat_position === i);

        return (
          <div
            key={i}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: x, top: y }}
            onDrop={(e) => handleDrop(e, i)}
            onDragOver={handleDragOver}
          >
            {seated ? (
              <motion.div
                layout
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`
                  flex flex-col items-center gap-1 cursor-pointer
                  ${!seated.is_alive ? "opacity-40" : ""}
                `}
                onClick={() => isGM && handleUnseat(seated.id)}
                title={isGM ? "Click to unseat" : undefined}
              >
                <div className="w-12 h-12 rounded-full bg-card border-2 border-primary/40 flex items-center justify-center paper-texture">
                  <span className="font-display text-sm font-bold">
                    {seated.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-xs font-body max-w-[70px] truncate text-center">
                  {seated.name}
                </span>
                {isGM && seated.character && (
                  <span className="text-[10px] text-primary font-display">
                    {seated.character}
                  </span>
                )}
              </motion.div>
            ) : (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="w-12 h-12 rounded-full border-2 border-dashed border-border/50 flex items-center justify-center"
              >
                <span className="text-muted-foreground/30 text-xs">{i + 1}</span>
              </motion.div>
            )}
          </div>
        );
      })}
    </div>
  );
};
