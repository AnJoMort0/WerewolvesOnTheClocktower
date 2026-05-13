import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Eye, EyeOff, X, Moon, Sun, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROLES, type RoleId } from "@/lib/roles";
import { VidenteRevealModal } from "@/components/game/VidenteRevealModal";
import { RevealModal, type RevealCard } from "@/components/game/RevealModal";
import { LanguageContext, getRoleLabel, t, type Language } from "@/lib/i18n";
import villagerIcon from "@/assets/icons/villager.png";
import ghostImg from "@/assets/icons/ghost.png";

type RoomPlayer = {
  id: string;
  name: string;
  seat_position: number | null;
  is_alive: boolean;
  character: string | null;
};

const PlayerView = () => {
  const { playerId } = useParams<{ playerId: string }>();
  const navigate = useNavigate();
  const [player, setPlayer] = useState<{
    name: string;
    character: string | null;
    is_alive: boolean;
    room_id?: string;
  } | null>(null);
  const [removed, setRemoved] = useState(false);
  const [roomStatus, setRoomStatus] = useState<string>("lobby");
  const [hidden, setHidden] = useState(false);
  const [roomPlayers, setRoomPlayers] = useState<RoomPlayer[]>([]);
  const [characterKey, setCharacterKey] = useState(0);
  const [videnteReveal, setVidenteReveal] = useState(false);
  const [videnteData, setVidenteData] = useState<{
    deadPlayerIds: string[];
    illusionPlayerId: string | null;
    isVidentePoisoned: boolean;
    fakeMap: Record<string, string> | null;
  } | null>(null);
  const [meninaReveal, setMeninaReveal] = useState(false);
  const [meninaCards, setMeninaCards] = useState<RevealCard[]>([]);
  const [faroleiroReveal, setFaroleiroReveal] = useState(false);
  const [faroleiroCards, setFaroleiroCards] = useState<RevealCard[]>([]);
  const [lvReveal, setLvReveal] = useState(false);
  const [lvCards, setLvCards] = useState<RevealCard[]>([]);
  const [phaseInfo, setPhaseInfo] = useState<{ phase: "night" | "day" | "tribunal"; number: number } | null>(null);
  const [language, setLanguage] = useState<Language>("pt");

  useEffect(() => {
    if (!playerId) return;

    const fetchPlayer = async () => {
      const { data } = await supabase
        .from("players")
        .select("name, character, is_alive, room_id")
        .eq("id", playerId)
        .single();

      if (!data) {
        setRemoved(true);
        return;
      }
      setPlayer(data);

      const { data: roomData } = await supabase
        .from("rooms")
        .select("status, language")
        .eq("id", data.room_id)
        .single();
      if (roomData) {
        setRoomStatus(roomData.status);
        const lang = (roomData as { language?: string }).language;
        if (lang === "fr" || lang === "pt") setLanguage(lang);
      }

      const { data: allPlayers } = await supabase
        .from("players")
        .select("id, name, seat_position, is_alive, character")
        .eq("room_id", data.room_id)
        .order("created_at");
      if (allPlayers) setRoomPlayers(allPlayers);
    };
    fetchPlayer();

    const playerChannel = supabase
      .channel(`player-${playerId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "players", filter: `id=eq.${playerId}` },
        (payload) => {
          setPlayer((prev) => {
            if (!prev) return prev;
            const charChanged = prev.character !== payload.new.character;
            if (charChanged) setCharacterKey((k) => k + 1);
            return {
              ...prev,
              character: payload.new.character,
              is_alive: payload.new.is_alive,
            };
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "players", filter: `id=eq.${playerId}` },
        () => {
          setRemoved(true);
          try { localStorage.removeItem("player_id"); localStorage.removeItem("player_token"); localStorage.removeItem("player_room"); } catch { /* ignore */ }
        }
      )
      .subscribe();

    const roomId = localStorage.getItem("player_room");
    let roomChannel: ReturnType<typeof supabase.channel> | null = null;
    let playersChannel: ReturnType<typeof supabase.channel> | null = null;
    let videnteChannel: ReturnType<typeof supabase.channel> | null = null;

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

      playersChannel = supabase
        .channel(`room-${roomId}-all-players`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "players", filter: `room_id=eq.${roomId}` },
          async () => {
            const { data } = await supabase
              .from("players")
              .select("id, name, seat_position, is_alive, character")
              .eq("room_id", roomId)
              .order("created_at");
            if (data) setRoomPlayers(data);
          }
        )
        .subscribe();

      // Listen for Vidente reveal broadcasts
      videnteChannel = supabase
        .channel(`vidente-reveal-${roomId}`)
        .on("broadcast", { event: "vidente-reveal" }, (payload) => {
          const data = payload.payload;
          if (data.show) {
            setVidenteData({
              deadPlayerIds: data.deadPlayerIds,
              illusionPlayerId: data.illusionPlayerId,
              isVidentePoisoned: !!data.isVidentePoisoned,
              fakeMap: data.fakeMap || null,
            });
            setVidenteReveal(true);
          } else {
            setVidenteReveal(false);
          }
        })
        .subscribe();

      // Reveal channels: menina, faroleiro, lobisomem-vidente
      const meninaCh = supabase.channel(`menina-reveal-${roomId}`)
        .on("broadcast", { event: "menina-reveal" }, (payload) => {
          const d = payload.payload;
          if (d.show) { setMeninaCards(d.cards || []); setMeninaReveal(true); } else { setMeninaReveal(false); }
        }).subscribe();
      const faroleiroCh = supabase.channel(`faroleiro-reveal-${roomId}`)
        .on("broadcast", { event: "faroleiro-reveal" }, (payload) => {
          const d = payload.payload;
          if (d.show && d.role && ROLES[d.role as RoleId]) {
            const def = ROLES[d.role as RoleId];
            setFaroleiroCards([{ image: def.image, label: def.label, checkboxes: d.charges || [] }]);
            setFaroleiroReveal(true);
          } else { setFaroleiroReveal(false); }
        }).subscribe();
      const lvCh = supabase.channel(`lobisomem-vidente-reveal-${roomId}`)
        .on("broadcast", { event: "lv-reveal" }, async (payload) => {
          const d = payload.payload;
          if (d.show && d.victimId && d.role && ROLES[d.role as RoleId]) {
            const def = ROLES[d.role as RoleId];
            const { data: vp } = await supabase.from("players").select("name").eq("id", d.victimId).single();
            setLvCards([{ name: vp?.name, image: def.image, label: def.label }]);
            setLvReveal(true);
          } else { setLvReveal(false); }
        }).subscribe();

      // Phase sync from GM (Noite/Dia/Tribunal X)
      const phaseCh = supabase.channel(`room-phase-${roomId}`)
        .on("broadcast", { event: "phase" }, (payload) => {
          setPhaseInfo(payload.payload);
        }).subscribe();

      return () => {
        supabase.removeChannel(playerChannel);
        if (roomChannel) supabase.removeChannel(roomChannel);
        if (playersChannel) supabase.removeChannel(playersChannel);
        if (videnteChannel) supabase.removeChannel(videnteChannel);
        supabase.removeChannel(meninaCh);
        supabase.removeChannel(faroleiroCh);
        supabase.removeChannel(lvCh);
        supabase.removeChannel(phaseCh);
      };
    }

    return () => {
      supabase.removeChannel(playerChannel);
      if (roomChannel) supabase.removeChannel(roomChannel);
      if (playersChannel) supabase.removeChannel(playersChannel);
      if (videnteChannel) supabase.removeChannel(videnteChannel);
    };
  }, [playerId, navigate]);

  const roleDef = player?.character
    ? ROLES[player.character as RoleId] ?? null
    : null;

  // Build role assignments from roomPlayers for VidenteModal
  const roleAssignments: Record<string, RoleId> = {};
  roomPlayers.forEach((p) => {
    if (p.character && ROLES[p.character as RoleId]) {
      roleAssignments[p.id] = p.character as RoleId;
    }
  });

  const isVidente = player?.character === "e04";
  const isMenina = player?.character === "v01";
  const isFaroleiro = player?.character === "v21";
  const isLobisomemVidente = player?.character === "m02";

  if (removed) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-sm">
          <X className="h-16 w-16 text-destructive mx-auto" />
          <h1 className="font-display text-2xl font-bold text-gradient-blood">Sessão Terminada</h1>
          <p className="text-muted-foreground font-body">
            Foste removido da sala pelo Mestre de Jogo.
          </p>
          <Button onClick={() => navigate("/")} variant="secondary" className="font-display">
            Voltar ao Início
          </Button>
        </div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground font-display">A carregar…</div>
      </div>
    );
  }

  const isDead = !player.is_alive;
  const seatedPlayers = roomPlayers.filter((p) => p.seat_position !== null).sort((a, b) => (a.seat_position ?? 0) - (b.seat_position ?? 0));
  const totalSlots = seatedPlayers.length || roomPlayers.length;

  return (
    <LanguageContext.Provider value={language}>
    <div className="flex min-h-screen items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm text-center space-y-6"
      >
        <div className="space-y-2">
          <h1 className="font-display text-3xl font-bold">{player.name}</h1>
          <p className="text-muted-foreground/60 text-xs font-body">
            Lobisomens da Torre Sangrenta
          </p>
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
                ? "À espera que o jogo comece…"
                : "O Mestre de Jogo está a atribuir papéis…"}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="wait">
              {hidden ? (
                <motion.div
                  key="circle-view"
                  initial={{ opacity: 0, rotateY: -90 }}
                  animate={{ opacity: 1, rotateY: 0 }}
                  exit={{ opacity: 0, rotateY: 90 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-4"
                >
                  <div className="relative mx-auto" style={{ width: 280, height: 280 }}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      {isDead ? (
                        <img src={ghostImg} alt="" className="w-16 h-16 opacity-30" />
                      ) : (
                        <div className="w-10 h-10 rounded-full border border-border/30" />
                      )}
                    </div>
                    {seatedPlayers.map((p, i) => {
                      const angle = (2 * Math.PI * i) / totalSlots - Math.PI / 2;
                      const r = 120;
                      const cx = r * Math.cos(angle) + 140;
                      const cy = r * Math.sin(angle) + 140;
                      const isMe = p.id === playerId;
                      const pDead = !p.is_alive;
                      return (
                        <div
                          key={p.id}
                          className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
                          style={{ left: cx, top: cy }}
                        >
                          <div className={`relative w-9 h-9 rounded-full border-2 flex items-center justify-center ${isMe ? "border-primary bg-primary/20" : "border-border/50 bg-card"} ${pDead ? "opacity-40 grayscale" : ""}`}>
                            <span className="font-display text-xs font-bold">
                              {p.name.charAt(0).toUpperCase()}
                            </span>
                            {pDead && (
                              <X className="absolute w-6 h-6 text-muted-foreground" strokeWidth={3} />
                            )}
                          </div>
                          <span className={`text-[10px] font-body truncate max-w-[60px] mt-0.5 ${pDead ? "text-muted-foreground/50" : ""}`}>
                            {p.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  {phaseInfo && (
                    <div className="bg-card/50 border border-border/30 rounded-lg p-4 text-center flex flex-col items-center gap-2">
                      {phaseInfo.phase === "night" ? (
                        <Moon className="h-6 w-6 text-blue-400" />
                      ) : phaseInfo.phase === "day" ? (
                        <Sun className="h-6 w-6 text-yellow-400" />
                      ) : (
                        <Scale className="h-6 w-6 text-yellow-400" />
                      )}
                      <p className="font-display text-2xl tracking-widest">
                        {phaseInfo.phase === "night"
                          ? `${t("night", language)} ${phaseInfo.number}`
                          : phaseInfo.phase === "day"
                          ? `${t("day", language)} ${phaseInfo.number}`
                          : `${t("tribunal", language)} ${phaseInfo.number}`}
                      </p>
                      {phaseInfo.phase === "night" && (
                        <p className="text-xs text-muted-foreground italic">{t("nightFalls", language)}</p>
                      )}
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key={`role-${characterKey}`}
                  initial={{ opacity: 0, scale: 0.8, rotateY: 90 }}
                  animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                  exit={{ opacity: 0, scale: 0.8, rotateY: -90 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="space-y-4"
                >
                  <div className={`bg-card border border-border rounded-2xl p-6 paper-texture glow-blood space-y-4 ${isDead ? "grayscale opacity-60" : ""}`}>
                    {roleDef ? (
                      <div className="relative w-48 h-48 mx-auto rounded-xl overflow-hidden border-2 border-primary/40 shadow-lg">
                        <img
                          src={roleDef.image}
                          alt={roleDef.label}
                          className={`w-full h-full object-cover ${isDead ? "grayscale" : ""}`}
                        />
                        {isDead && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <X className="w-24 h-24 text-muted-foreground" strokeWidth={2} />
                          </div>
                        )}
                      </div>
                    ) : null}
                    <p className="text-muted-foreground text-sm font-display tracking-widest uppercase">
                      {t("yourRole", language)}
                    </p>
                    <h2 className="font-display text-3xl font-bold text-gradient-blood">
                      {roleDef ? getRoleLabel(roleDef.id, language) : player.character}
                    </h2>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {t("keepSecret", language)}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <Button
              variant="secondary"
              onClick={() => setHidden(!hidden)}
              className="w-full font-display tracking-wider"
            >
              {hidden ? (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Mostrar Papel
                </>
              ) : (
                <>
                  <EyeOff className="h-4 w-4 mr-2" />
                  Esconder Papel
                </>
              )}
            </Button>
          </div>
        )}
      </motion.div>

      {/* Vidente Reveal Modal - only for Vidente player */}
      {isVidente && videnteData && (
        <VidenteRevealModal
          open={videnteReveal}
          onClose={() => setVidenteReveal(false)}
          deadPlayerIds={videnteData.deadPlayerIds}
          illusionPlayerId={videnteData.illusionPlayerId}
          roleAssignments={roleAssignments}
          players={roomPlayers}
          isVidentePoisoned={videnteData.isVidentePoisoned}
          precomputedFakeMap={videnteData.fakeMap}
        />
      )}

      {isMenina && (
        <RevealModal open={meninaReveal} onClose={() => setMeninaReveal(false)} title="Visão da Menina" subtitle="Quem matou cada vítima desta noite" cards={meninaCards} />
      )}
      {isFaroleiro && (
        <RevealModal open={faroleiroReveal} onClose={() => setFaroleiroReveal(false)} title="Visão do Faroleiro" subtitle="Usos restantes" cards={faroleiroCards} />
      )}
      {isLobisomemVidente && (
        <RevealModal open={lvReveal} onClose={() => setLvReveal(false)} title="Visão do Lobisomem Vidente" subtitle="A vítima foi ressuscitada" cards={lvCards} />
      )}
    </div>
    </LanguageContext.Provider>
  );
};

export default PlayerView;