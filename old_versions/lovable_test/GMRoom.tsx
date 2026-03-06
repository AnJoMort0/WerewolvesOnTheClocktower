import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { QRCodeSVG } from "qrcode.react";
import { motion, AnimatePresence } from "framer-motion";
import { PlayerCircle } from "@/components/game/PlayerCircle";
import { Copy, Check, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Player = {
  id: string;
  name: string;
  seat_position: number | null;
  character: string | null;
  is_alive: boolean;
};

type Room = {
  id: string;
  code: string;
  status: string;
};

const GMRoom = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [copied, setCopied] = useState(false);

  const joinUrl = room ? `${window.location.origin}/join/${room.code}` : "";

  // Fetch room
  useEffect(() => {
    if (!roomId) return;
    const fetchRoom = async () => {
      const { data } = await supabase
        .from("rooms")
        .select("id, code, status")
        .eq("id", roomId)
        .single();
      if (data) setRoom(data);
    };
    fetchRoom();
  }, [roomId]);

  // Fetch & subscribe to players
  useEffect(() => {
    if (!roomId) return;

    const fetchPlayers = async () => {
      const { data } = await supabase
        .from("players")
        .select("id, name, seat_position, character, is_alive")
        .eq("room_id", roomId)
        .order("created_at");
      if (data) setPlayers(data);
    };
    fetchPlayers();

    const channel = supabase
      .channel(`room-${roomId}-players`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "players", filter: `room_id=eq.${roomId}` },
        () => fetchPlayers()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [roomId]);

  const copyCode = useCallback(() => {
    if (room) {
      navigator.clipboard.writeText(room.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [room]);

  const updateSeatPosition = async (playerId: string, position: number | null) => {
    await supabase
      .from("players")
      .update({ seat_position: position })
      .eq("id", playerId);
  };

  const startGame = async () => {
    if (!roomId) return;
    const unseated = players.filter((p) => p.seat_position === null);
    if (unseated.length > 0) {
      toast.error("All players must be seated before starting!");
      return;
    }
    await supabase.from("rooms").update({ status: "assigning" }).eq("id", roomId);
    setRoom((prev) => prev ? { ...prev, status: "assigning" } : prev);
    toast.success("Time to assign roles!");
  };

  if (!room) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground font-display">Loading…</div>
      </div>
    );
  }

  const seatedPlayers = players.filter((p) => p.seat_position !== null);
  const unseatedPlayers = players.filter((p) => p.seat_position === null);
  const totalSlots = players.length;

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-gradient-blood">
              Game Master
            </h1>
            <p className="text-muted-foreground mt-1">
              <Users className="inline h-4 w-4 mr-1" />
              {players.length} player{players.length !== 1 ? "s" : ""} joined
            </p>
          </div>

          {/* Room Code & QR */}
          <div className="flex items-center gap-4">
            <button
              onClick={copyCode}
              className="flex items-center gap-2 bg-secondary px-4 py-2 rounded-lg border border-border hover:border-primary/50 transition-colors"
            >
              <span className="font-display text-xl tracking-[0.2em]">{room.code}</span>
              {copied ? <Check className="h-4 w-4 text-gold" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
            </button>
            <div className="bg-parchment p-2 rounded-lg">
              <QRCodeSVG value={joinUrl} size={64} bgColor="hsl(40, 30%, 85%)" fgColor="hsl(30, 10%, 8%)" />
            </div>
          </div>
        </div>

        {/* Main layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
          {/* Circle */}
          <div className="flex items-center justify-center">
            {totalSlots > 0 ? (
              <PlayerCircle
                players={players}
                totalSlots={totalSlots}
                onDropPlayer={updateSeatPosition}
                isGM
              />
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <p className="text-muted-foreground font-display text-lg">
                  Waiting for players to join…
                </p>
                <p className="text-muted-foreground/60 text-sm mt-2">
                  Share the room code or QR code
                </p>
              </motion.div>
            )}
          </div>

          {/* Sidebar: unseated players */}
          <div className="space-y-4">
            <h2 className="font-display text-sm tracking-widest uppercase text-muted-foreground">
              Players
            </h2>
            <AnimatePresence>
              {unseatedPlayers.map((player) => (
                <motion.div
                  key={player.id}
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-card border border-border rounded-lg p-3 cursor-grab active:cursor-grabbing"
                  draggable
                  onDragStartCapture={(e: React.DragEvent<HTMLDivElement>) => {
                    e.dataTransfer.setData("playerId", player.id);
                  }}
                >
                  <span className="font-body text-lg">{player.name}</span>
                </motion.div>
              ))}
            </AnimatePresence>

            {unseatedPlayers.length === 0 && players.length > 0 && (
              <p className="text-muted-foreground/60 text-sm">All players seated</p>
            )}

            {/* Start button */}
            {players.length >= 2 && room.status === "lobby" && (
              <Button
                onClick={startGame}
                disabled={unseatedPlayers.length > 0}
                className="w-full h-12 font-display tracking-wider bg-primary hover:bg-blood-glow glow-blood mt-6"
              >
                Start Game
              </Button>
            )}

            {room.status === "assigning" && (
              <div className="bg-card border border-primary/30 rounded-lg p-4 text-center">
                <p className="font-display text-primary">Assigning Roles…</p>
                <p className="text-muted-foreground text-sm mt-1">
                  Share your custom roles to continue
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GMRoom;
