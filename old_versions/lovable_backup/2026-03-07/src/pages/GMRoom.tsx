import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { QRCodeSVG } from "qrcode.react";
import { motion, AnimatePresence } from "framer-motion";
import { PlayerCircle } from "@/components/game/PlayerCircle";
import { AddPlayerForm } from "@/components/game/AddPlayerForm";
import { RoleSelector } from "@/components/game/RoleSelector";
import { NightScript } from "@/components/game/NightScript";
import { PlayerStatusPopover, type PlayerStatus } from "@/components/game/PlayerStatusPopover";
import { Copy, Check, Users, Send, AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { assignRoles, ROLES, isUniqueRole, type RoleId } from "@/lib/roles";

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

const ESSENTIAL_ROLES: RoleId[] = ["e02", "e03", "e04"];
const WEREWOLF_ROLES: RoleId[] = ["e01", "m01", "m02", "m03", "s02"];
const POISON_DRAG_ROLE: RoleId = "e02";
const KILL_DRAG_ROLE: RoleId = "e01";

function getExpectedWerewolfCount(playerCount: number): number {
  if (playerCount < 12) return 2;
  if (playerCount < 18) return 3;
  return 3 + Math.floor((playerCount - 18) / 6);
}

const GMRoom = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [copied, setCopied] = useState(false);
  const [roleAssignments, setRoleAssignments] = useState<Record<string, RoleId>>({});
  const [rolesAssigned, setRolesAssigned] = useState(false);
  const [pendingChanges, setPendingChanges] = useState(false);
  const [advancedEnabled, setAdvancedEnabled] = useState(false);

  // Night & status tracking
  const [nightNumber, setNightNumber] = useState(1);
  const [playerStatuses, setPlayerStatuses] = useState<Record<string, PlayerStatus>>({});
  const [permanentlyDead, setPermanentlyDead] = useState<Set<string>>(new Set());
  const [poisonedPlayerId, setPoisonedPlayerId] = useState<string | null>(null);
  const [listPopoverId, setListPopoverId] = useState<string | null>(null);

  const joinUrl = room ? `${window.location.origin}/join/${room.code}` : "";

  // Detect duplicate unique roles
  const duplicateRoles = useMemo(() => {
    const counts: Record<string, number> = {};
    Object.values(roleAssignments).forEach((roleId) => {
      counts[roleId] = (counts[roleId] || 0) + 1;
    });
    const dupes = new Set<RoleId>();
    Object.entries(counts).forEach(([roleId, count]) => {
      if (count > 1 && isUniqueRole(roleId as RoleId)) {
        if (roleId === "l03" && count <= 2) return;
        if (roleId === "l04" && count <= 3) return;
        dupes.add(roleId as RoleId);
      }
    });
    return dupes;
  }, [roleAssignments]);

  // Validation warnings
  const validationWarnings = useMemo(() => {
    if (!rolesAssigned) return [];
    const warnings: string[] = [];
    const assignedRoles = new Set(Object.values(roleAssignments));

    for (const essential of ESSENTIAL_ROLES) {
      if (!assignedRoles.has(essential)) {
        warnings.push(`${ROLES[essential].label} em falta!`);
      }
    }

    const wwCount = Object.values(roleAssignments).filter((r) => WEREWOLF_ROLES.includes(r)).length;
    const seatedCount = Object.keys(roleAssignments).length;
    const expected = getExpectedWerewolfCount(seatedCount);
    if (wwCount < expected) {
      warnings.push(`Poucos Lobisomens (${wwCount}/${expected})`);
    }

    return warnings;
  }, [roleAssignments, rolesAssigned]);

  const activeRoles = useMemo(() => {
    return new Set(Object.values(roleAssignments));
  }, [roleAssignments]);

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
      if (data) {
        setPlayers(data);
        if (room?.status === "playing" || data.some((p) => p.character)) {
          const assignments: Record<string, RoleId> = {};
          data.forEach((p) => {
            if (p.character && ROLES[p.character as RoleId]) {
              assignments[p.id] = p.character as RoleId;
            }
          });
          if (Object.keys(assignments).length > 0) {
            setRoleAssignments(assignments);
            setRolesAssigned(true);
          }
        }
      }
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
    await supabase.from("players").update({ seat_position: position }).eq("id", playerId);
  };

  const addManualPlayer = async (name: string) => {
    if (!roomId) return;
    const { error } = await supabase.from("players").insert({ name, room_id: roomId });
    if (error) toast.error("Erro ao adicionar jogador");
  };

  const confirmRoom = () => {
    const unseated = players.filter((p) => p.seat_position === null);
    if (unseated.length > 0) {
      toast.error("Todos os jogadores devem estar sentados!");
      return;
    }
    if (players.length < 8) {
      toast.error("São precisos pelo menos 8 jogadores!");
      return;
    }

    const seatedPlayers = [...players].sort((a, b) => (a.seat_position ?? 0) - (b.seat_position ?? 0));
    const roles = assignRoles(seatedPlayers.length, advancedEnabled);
    const assignments: Record<string, RoleId> = {};
    seatedPlayers.forEach((p, i) => {
      assignments[p.id] = roles[i];
    });
    setRoleAssignments(assignments);
    setRolesAssigned(true);
    toast.success("Papéis atribuídos! Revê e modifica se necessário.");
  };

  const changeRole = (playerId: string, role: RoleId) => {
    setRoleAssignments((prev) => ({ ...prev, [playerId]: role }));
    if (room?.status === "playing") {
      setPendingChanges(true);
    }
  };

  const confirmPendingChanges = async () => {
    if (!roomId) return;
    const updates = Object.entries(roleAssignments).map(([playerId, roleId]) =>
      supabase.from("players").update({ character: roleId }).eq("id", playerId)
    );
    await Promise.all(updates);
    setPendingChanges(false);
    toast.success("Alterações enviadas aos jogadores!");
  };

  const sendRolesToPlayers = async () => {
    if (!roomId) return;
    const updates = Object.entries(roleAssignments).map(([playerId, roleId]) =>
      supabase.from("players").update({ character: roleId }).eq("id", playerId)
    );
    await Promise.all(updates);
    await supabase.from("rooms").update({ status: "playing" }).eq("id", roomId);
    setRoom((prev) => (prev ? { ...prev, status: "playing" } : prev));
    toast.success("Papéis enviados a todos os jogadores!");
  };

  // Player status management
  const handlePlayerStatusChange = (playerId: string, newStatus: PlayerStatus) => {
    if (newStatus === "poisoned") {
      const newStatuses = { ...playerStatuses };
      if (poisonedPlayerId && poisonedPlayerId !== playerId) {
        newStatuses[poisonedPlayerId] = "alive";
      }
      if (playerStatuses[playerId] === "poisoned") {
        newStatuses[playerId] = "alive";
        setPoisonedPlayerId(null);
      } else {
        newStatuses[playerId] = "poisoned";
        setPoisonedPlayerId(playerId);
      }
      setPlayerStatuses(newStatuses);
    } else if (newStatus === "dead-this-night") {
      setPlayerStatuses((prev) => ({ ...prev, [playerId]: "dead-this-night" }));
      if (poisonedPlayerId === playerId) setPoisonedPlayerId(null);
    } else if (newStatus === "dead") {
      // Immediate perma-death
      setPlayerStatuses((prev) => ({ ...prev, [playerId]: "dead" }));
      setPermanentlyDead((prev) => {
        const next = new Set(prev);
        next.add(playerId);
        return next;
      });
      if (poisonedPlayerId === playerId) setPoisonedPlayerId(null);
      // Sync to DB
      supabase.from("players").update({ is_alive: false }).eq("id", playerId);
    } else if (newStatus === "alive") {
      // Resurrect
      setPlayerStatuses((prev) => ({ ...prev, [playerId]: "alive" }));
      setPermanentlyDead((prev) => {
        const next = new Set(prev);
        next.delete(playerId);
        return next;
      });
      if (poisonedPlayerId === playerId) setPoisonedPlayerId(null);
      // Sync to DB
      supabase.from("players").update({ is_alive: true }).eq("id", playerId);
    }
  };

  const endNight = async () => {
    const newPermanentlyDead = new Set(permanentlyDead);
    const newStatuses = { ...playerStatuses };
    const newlyDead: string[] = [];

    Object.entries(newStatuses).forEach(([pid, status]) => {
      if (status === "dead-this-night") {
        newPermanentlyDead.add(pid);
        newStatuses[pid] = "dead";
        newlyDead.push(pid);
      }
    });

    // Clear poison
    if (poisonedPlayerId) {
      newStatuses[poisonedPlayerId] = newStatuses[poisonedPlayerId] === "dead" ? "dead" : "alive";
    }
    setPoisonedPlayerId(null);
    setPermanentlyDead(newPermanentlyDead);
    setPlayerStatuses(newStatuses);
    setNightNumber((n) => n + 1);

    // Sync deaths to DB
    if (newlyDead.length > 0) {
      await Promise.all(
        newlyDead.map((pid) =>
          supabase.from("players").update({ is_alive: false }).eq("id", pid)
        )
      );
    }

    toast.success(`Noite ${nightNumber} terminada. Amanheceu!`);
  };

  // Handle drops on list items (for drag-to-poison/kill)
  const handleListDrop = (e: React.DragEvent, targetPlayerId: string) => {
    e.preventDefault();
    const action = e.dataTransfer.getData("action");
    if (action) {
      if (action === "poison") handlePlayerStatusChange(targetPlayerId, "poisoned");
      else if (action === "kill") handlePlayerStatusChange(targetPlayerId, "dead-this-night");
    }
  };

  const handleListDragOver = (e: React.DragEvent) => e.preventDefault();

  // Get drag props for list items (Bruxa/Lobisomem)
  const getListDragProps = (playerId: string) => {
    if (!isPlaying) return {};
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

  if (!room) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground font-display">A carregar…</div>
      </div>
    );
  }

  const unseatedPlayers = players.filter((p) => p.seat_position === null);
  const isPlaying = room.status === "playing";

  return (
    <div className="min-h-screen p-4">
      <div className="w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 max-w-7xl mx-auto">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-gradient-blood">
              Game Master
            </h1>
            <p className="text-muted-foreground mt-1">
              <Users className="inline h-4 w-4 mr-1" />
              {players.length} jogador{players.length !== 1 ? "es" : ""} na sala
            </p>
          </div>

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

        {/* Validation warnings */}
        {validationWarnings.length > 0 && (
          <div className="flex flex-wrap gap-2 max-w-7xl mx-auto">
            {validationWarnings.map((w, i) => (
              <div key={i} className="flex items-center gap-1 bg-yellow-900/30 border border-yellow-500/50 rounded-lg px-3 py-1.5 text-xs font-display text-yellow-400">
                <AlertTriangle className="h-3 w-3" />
                {w}
              </div>
            ))}
          </div>
        )}

        {/* Circle - full width */}
        <div className="w-full flex justify-center overflow-x-auto">
          {players.length > 0 ? (
            <PlayerCircle
              players={players}
              totalSlots={players.length}
              onDropPlayer={updateSeatPosition}
              isGM
              roleAssignments={rolesAssigned ? roleAssignments : undefined}
              playerStatuses={playerStatuses}
              permanentlyDead={permanentlyDead}
              onPlayerStatusChange={handlePlayerStatusChange}
              isPlaying={isPlaying}
            />
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
              <p className="text-muted-foreground font-display text-lg">À espera que jogadores entrem…</p>
              <p className="text-muted-foreground/60 text-sm mt-2">Partilha o código ou adiciona jogadores manualmente</p>
            </motion.div>
          )}
        </div>

        {/* Below circle: Script left, Player list right when playing; centered when not */}
        {isPlaying ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
            {/* Night Script (left) */}
            <div>
              <NightScript
                activeRoles={activeRoles}
                permanentlyDead={permanentlyDead}
                poisonedPlayerId={poisonedPlayerId}
                roleAssignments={roleAssignments}
                nightNumber={nightNumber}
                onEndNight={endNight}
              />
            </div>

            {/* Player list (right) */}
            <div className="space-y-4">
              <h2 className="font-display text-sm tracking-widest uppercase text-muted-foreground">Jogadores</h2>

              <div className="flex items-center gap-2">
                <Switch id="advanced-toggle-play" checked={advancedEnabled} onCheckedChange={setAdvancedEnabled} />
                <Label htmlFor="advanced-toggle-play" className="font-display text-sm cursor-pointer">Modo Avançado</Label>
              </div>

              <div className="space-y-2">
                <h3 className="font-display text-xs tracking-widest uppercase text-muted-foreground">Atribuição de Papéis</h3>
                {players
                  .filter((p) => p.seat_position !== null)
                  .sort((a, b) => (a.seat_position ?? 0) - (b.seat_position ?? 0))
                  .map((player) => {
                    const roleId = roleAssignments[player.id];
                    const roleDef = roleId ? ROLES[roleId] : null;
                    const isDuplicate = roleId && duplicateRoles.has(roleId);
                    const status = playerStatuses[player.id] || "alive";
                    const isPermanentDead = permanentlyDead.has(player.id);
                    const listDragProps = getListDragProps(player.id);

                    const borderClass = isDuplicate
                      ? "border-yellow-500"
                      : status === "poisoned"
                      ? "border-green-500"
                      : status === "dead-this-night"
                      ? "border-destructive"
                      : "border-border";

                    const rowContent = (
                      <div
                        className={`flex items-center gap-2 bg-card border rounded-lg p-2 ${borderClass} ${isPermanentDead ? "opacity-40 grayscale" : ""} ${listDragProps.draggable ? "cursor-grab active:cursor-grabbing" : ""}`}
                        onDrop={(e) => handleListDrop(e, player.id)}
                        onDragOver={handleListDragOver}
                        {...listDragProps}
                      >
                        {roleDef && (
                          <div className="relative w-8 h-8 flex-shrink-0">
                            <img src={roleDef.image} alt={roleDef.label} className={`w-8 h-8 rounded ${isPermanentDead ? "grayscale" : ""}`} />
                            {(status === "dead-this-night" || isPermanentDead) && (
                              <X className={`absolute inset-0 m-auto w-6 h-6 ${isPermanentDead ? "text-muted-foreground" : "text-destructive"}`} strokeWidth={3} />
                            )}
                          </div>
                        )}
                        <span className={`font-body text-sm flex-1 truncate ${status === "poisoned" ? "text-green-400" : ""}`}>{player.name}</span>
                        {isDuplicate && <AlertTriangle className="h-4 w-4 text-yellow-500 flex-shrink-0" />}
                        <RoleSelector value={roleId} onChange={(role) => changeRole(player.id, role)} />
                      </div>
                    );

                    // Show popover for all statuses including perma-dead
                    return (
                      <PlayerStatusPopover
                        key={player.id}
                        status={status}
                        isPermanentlyDead={isPermanentDead}
                        open={listPopoverId === player.id}
                        onOpenChange={(open) => setListPopoverId(open ? player.id : null)}
                        onSetPoisoned={() => {
                          handlePlayerStatusChange(player.id, status === "poisoned" ? "alive" : "poisoned");
                          setListPopoverId(null);
                        }}
                        onSetDead={() => {
                          handlePlayerStatusChange(player.id, "dead-this-night");
                          setListPopoverId(null);
                        }}
                        onSetAlive={() => {
                          handlePlayerStatusChange(player.id, "alive");
                          setListPopoverId(null);
                        }}
                        onSetPermaDead={() => {
                          handlePlayerStatusChange(player.id, "dead");
                          setListPopoverId(null);
                        }}
                      >
                        {rowContent}
                      </PlayerStatusPopover>
                    );
                  })}
              </div>

              {/* Pending changes confirm button */}
              {pendingChanges && (
                <Button
                  onClick={confirmPendingChanges}
                  className="w-full h-12 font-display tracking-wider bg-yellow-600 hover:bg-yellow-700 text-white mt-4 animate-pulse"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Confirmar Alterações
                </Button>
              )}

              {!pendingChanges && (
                <div className="bg-card border border-primary/30 rounded-lg p-4 text-center">
                  <p className="font-display text-primary">Jogo em Curso</p>
                  <p className="text-muted-foreground text-sm mt-1">Altera papéis acima e confirma para enviar</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Not playing: centered sidebar */
          <div className="max-w-md mx-auto space-y-4">
            <h2 className="font-display text-sm tracking-widest uppercase text-muted-foreground">Jogadores</h2>

            {/* Manual add */}
            {!rolesAssigned && <AddPlayerForm onAdd={addManualPlayer} />}

            {/* Advanced toggle */}
            <div className="flex items-center gap-2">
              <Switch id="advanced-toggle" checked={advancedEnabled} onCheckedChange={setAdvancedEnabled} />
              <Label htmlFor="advanced-toggle" className="font-display text-sm cursor-pointer">Modo Avançado</Label>
            </div>

            {/* Unseated list */}
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

            {unseatedPlayers.length === 0 && players.length > 0 && !rolesAssigned && (
              <p className="text-muted-foreground/60 text-sm">Todos os jogadores sentados</p>
            )}

            {/* Role assignments list */}
            {rolesAssigned && (
              <div className="space-y-2">
                <h3 className="font-display text-xs tracking-widest uppercase text-muted-foreground mt-4">Atribuição de Papéis</h3>
                {players
                  .filter((p) => p.seat_position !== null)
                  .sort((a, b) => (a.seat_position ?? 0) - (b.seat_position ?? 0))
                  .map((player) => {
                    const roleId = roleAssignments[player.id];
                    const roleDef = roleId ? ROLES[roleId] : null;
                    const isDuplicate = roleId && duplicateRoles.has(roleId);

                    return (
                      <div
                        key={player.id}
                        className={`flex items-center gap-2 bg-card border rounded-lg p-2 ${isDuplicate ? "border-yellow-500" : "border-border"}`}
                      >
                        {roleDef && (
                          <img src={roleDef.image} alt={roleDef.label} className="w-8 h-8 rounded flex-shrink-0" />
                        )}
                        <span className="font-body text-sm flex-1 truncate">{player.name}</span>
                        {isDuplicate && <AlertTriangle className="h-4 w-4 text-yellow-500 flex-shrink-0" />}
                        <RoleSelector value={roleId} onChange={(role) => changeRole(player.id, role)} />
                      </div>
                    );
                  })}
              </div>
            )}

            {/* Action buttons */}
            {!rolesAssigned && players.length >= 2 && room.status === "lobby" && (
              <Button
                onClick={confirmRoom}
                disabled={unseatedPlayers.length > 0}
                className="w-full h-12 font-display tracking-wider bg-primary hover:bg-blood-glow glow-blood mt-6"
              >
                Confirmar &amp; Atribuir Papéis
              </Button>
            )}

            {rolesAssigned && room.status !== "playing" && (
              <Button
                onClick={sendRolesToPlayers}
                className="w-full h-12 font-display tracking-wider bg-primary hover:bg-blood-glow glow-blood mt-4"
              >
                <Send className="h-4 w-4 mr-2" />
                Enviar Papéis aos Jogadores
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GMRoom;
