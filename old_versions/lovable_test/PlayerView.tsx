import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Moon, Clock } from "lucide-react";

const PlayerView = () => {
  const { playerId } = useParams<{ playerId: string }>();
  const navigate = useNavigate();
  const [player, setPlayer] = useState<{
    name: string;
    character: string | null;
    is_alive: boolean;
  } | null>(null);
  const [roomStatus, setRoomStatus] = useState<string>("lobby");

  useEffect(() => {
    if (!playerId) return;

    const fetchPlayer = async () => {
      const { data } = await supabase
        .from("players")
        .select("name, character, is_alive, room_id")
        .eq("id", playerId)
        .single();

      if (!data) {
        navigate("/");
        return;
      }
      setPlayer(data);

      // Get room status
      const { data: roomData } = await supabase
        .from("rooms")
        .select("status")
        .eq("id", data.room_id)
        .single();
      if (roomData) setRoomStatus(roomData.status);
    };
    fetchPlayer();

    // Subscribe to player changes (character assignment)
    const playerChannel = supabase
      .channel(`player-${playerId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "players", filter: `id=eq.${playerId}` },
        (payload) => {
          setPlayer((prev) =>
            prev
              ? {
                  ...prev,
                  character: payload.new.character,
                  is_alive: payload.new.is_alive,
                }
              : prev
          );
        }
      )
      .subscribe();

    // Subscribe to room changes
    const roomId = localStorage.getItem("player_room");
    let roomChannel: ReturnType<typeof supabase.channel> | null = null;
    if (roomId) {
      roomChannel = supabase
        .channel(`room-${roomId}-status`)
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "rooms", filter: `id=eq.${roomId}` },
          (payload) => {
            setRoomStatus(payload.new.status);
          }
        )
        .subscribe();
    }

    return () => {
      supabase.removeChannel(playerChannel);
      if (roomChannel) supabase.removeChannel(roomChannel);
    };
  }, [playerId, navigate]);

  if (!player) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground font-display">Loading…</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm text-center space-y-8"
      >
        <div className="space-y-2">
          <p className="text-muted-foreground text-sm font-display tracking-widest uppercase">
            Welcome
          </p>
          <h1 className="font-display text-3xl font-bold">{player.name}</h1>
        </div>

        {!player.character ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4 py-8"
          >
            <Clock className="mx-auto h-10 w-10 text-muted-foreground animate-pulse" />
            <p className="text-muted-foreground text-lg">
              {roomStatus === "lobby"
                ? "Waiting for the game to start…"
                : "The Game Master is assigning roles…"}
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotateY: 90 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-4"
          >
            <div className="bg-card border border-border rounded-2xl p-8 paper-texture glow-blood">
              <Moon className="mx-auto h-12 w-12 text-primary mb-4" />
              <p className="text-muted-foreground text-sm font-display tracking-widest uppercase mb-2">
                Your Role
              </p>
              <h2 className="font-display text-3xl font-bold text-gradient-blood">
                {player.character}
              </h2>
            </div>
            <p className="text-muted-foreground text-sm">
              Keep this secret. The night is dark.
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default PlayerView;
