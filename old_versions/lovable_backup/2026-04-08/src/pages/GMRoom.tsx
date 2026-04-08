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
import { VidenteRevealModal } from "@/components/game/VidenteRevealModal";
import { Copy, Check, Users, Send, AlertTriangle, X, Minus, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { assignRoles, ROLES, isUniqueRole, type RoleId } from "@/lib/roles";
import poisonedIcon from "@/assets/icons/poisoned.png";
import illusionIcon from "@/assets/icons/illusion.png";
import imunityIcon from "@/assets/icons/imunity_full.png";

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
const CHAMAN_ROLE: RoleId = "e03";
const ILLUSION_DRAG_ROLE: RoleId = "a06";
const CAVALEIRO_ROLE: RoleId = "v07";

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
  const [illusionPlayerId, setIllusionPlayerId] = useState<string | null>(null);
  const [listPopoverId, setListPopoverId] = useState<string | null>(null);
  const [chamanCharges, setChamanCharges] = useState(0);
  const [lastNightDeadPlayerIds, setLastNightDeadPlayerIds] = useState<string[]>([]);
  const [videnteModalOpen, setVidenteModalOpen] = useState(false);
  const [foxDisabled, setFoxDisabled] = useState(false);
  const [nightTargetedPlayerIds, setNightTargetedPlayerIds] = useState<Set<string>>(new Set());
  const [cavalerioLinkedDeath, setCavalerioLinkedDeath] = useState<string | null>(null);
  
  // Kill tracking: maps playerId to kill source (role ID or "manual")
  const [killSources, setKillSources] = useState<Record<string, string>>({});
  
  // Pre-computed Vidente fake map for poisoned state (consistent between GM and player)
  const [videnteFakeMap, setVidenteFakeMap] = useState<Record<string, string> | null>(null);

  const joinUrl = room ? `${window.location.origin}/join/${room.code}` : "";

  // Derived states
  const isBruxaPermaDead = useMemo(() => {
    for (const [pid, role] of Object.entries(roleAssignments)) {
      if (role === "e02" && permanentlyDead.has(pid)) return true;
    }
    return false;
  }, [roleAssignments, permanentlyDead]);

  const isBruxaPoisoned = useMemo(() => {
    if (!poisonedPlayerId) return false;
    return roleAssignments[poisonedPlayerId] === "e02";
  }, [poisonedPlayerId, roleAssignments]);

  const isMarionetista = useMemo(() => {
    const assignedRoles = new Set(Object.values(roleAssignments));
    if (!assignedRoles.has("a06" as RoleId)) return false;
    for (const [pid, role] of Object.entries(roleAssignments)) {
      if (role === ("a06" as RoleId) && !permanentlyDead.has(pid)) return true;
    }
    return false;
  }, [roleAssignments, permanentlyDead]);

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

    // Capuchinho/Caçador dependency
    if (assignedRoles.has("v08b") && !assignedRoles.has("v08")) {
      warnings.push("Capuchinho Vermelho precisa do Caçador!");
    }

    return warnings;
  }, [roleAssignments, rolesAssigned]);

  const activeRoles = useMemo(() => {
    return new Set(Object.values(roleAssignments));
  }, [roleAssignments]);

  const rolesConfirmed = rolesAssigned && room?.status === "playing";

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

  const removePlayer = async (playerId: string) => {
    await supabase.from("players").delete().eq("id", playerId);
    toast.success("Jogador removido");
  };

  const addTestPlayers = async () => {
    if (!roomId) return;
    const names = ["Teste1", "Teste2", "Teste3", "Teste4", "Teste5", "Teste6", "Teste7", "Teste8"];
    const existing = players.map((p) => p.name.toLowerCase());
    const toAdd = names.filter((n) => !existing.includes(n.toLowerCase()));
    
    for (let i = 0; i < toAdd.length; i++) {
      await supabase.from("players").insert({ 
        name: toAdd[i], 
        room_id: roomId, 
        seat_position: i 
      });
    }
    toast.success(`${toAdd.length} jogadores de teste adicionados e posicionados!`);
  };

  const existingPlayerNames = useMemo(() => players.map((p) => p.name), [players]);

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
    // Capuchinho/Caçador warning
    if (role === "v08b") {
      const hasHunter = Object.values(roleAssignments).some((r) => r === "v08");
      if (!hasHunter) {
        toast.warning("Atenção: O Capuchinho Vermelho precisa do Caçador em jogo!");
      }
    }
    // If removing Caçador, warn if Capuchinho exists
    const oldRole = roleAssignments[playerId];
    if (oldRole === "v08" && role !== "v08") {
      const hasCapuchinho = Object.entries(roleAssignments).some(([pid, r]) => r === "v08b" && pid !== playerId);
      if (hasCapuchinho) {
        toast.warning("Atenção: O Capuchinho Vermelho está em jogo sem o Caçador!");
      }
    }

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

  // Helper: find closest werewolf to cavaleiro
  const findClosestWerewolf = useCallback((cavalerioId: string) => {
    const sorted = players
      .filter((p) => p.seat_position !== null)
      .sort((a, b) => a.seat_position! - b.seat_position!);
    const cavIdx = sorted.findIndex((p) => p.id === cavalerioId);
    if (cavIdx === -1) return null;

    for (let dist = 1; dist < sorted.length; dist++) {
      for (const dir of [1, -1]) {
        const idx = (cavIdx + dir * dist + sorted.length) % sorted.length;
        const p = sorted[idx];
        if (p.id === cavalerioId) continue;
        const r = roleAssignments[p.id];
        if (WEREWOLF_ROLES.includes(r) && !permanentlyDead.has(p.id)) return p;
      }
    }
    return null;
  }, [players, roleAssignments, permanentlyDead]);

  // Player status management
  const handlePlayerStatusChange = (playerId: string, newStatus: PlayerStatus, _source?: string) => {
    if (newStatus === "poisoned") {
      if (poisonedPlayerId === playerId) {
        setPoisonedPlayerId(null);
      } else {
        setPoisonedPlayerId(playerId);
        setNightTargetedPlayerIds((prev) => { const n = new Set(prev); n.add(playerId); return n; });
      }
      return;
    } else if (newStatus === "dead-this-night") {
      if (roleAssignments[playerId] === "e02" && poisonedPlayerId === playerId) {
        toast.warning("A Bruxa está envenenada e tem imunidade total!");
        return;
      }
      setPlayerStatuses((prev) => ({ ...prev, [playerId]: "dead-this-night" }));
      
      // Track kill source
      const source = _source || "manual";
      setKillSources((prev) => ({ ...prev, [playerId]: source }));

      setNightTargetedPlayerIds((prev) => {
        const next = new Set(prev);
        next.add(playerId);
        return next;
      });

      // Cavaleiro Enferrujado mechanic
      if (roleAssignments[playerId] === CAVALEIRO_ROLE && _source !== "cavaleiro-linked") {
        const isCavaleiroPoisoned = poisonedPlayerId === playerId;
        if (isCavaleiroPoisoned) {
          const nonWWAlive = players.filter(
            (p) => p.id !== playerId && !permanentlyDead.has(p.id) && !WEREWOLF_ROLES.includes(roleAssignments[p.id]) && playerStatuses[p.id] !== "dead-this-night"
          );
          if (nonWWAlive.length > 0) {
            const victim = nonWWAlive[Math.floor(Math.random() * nonWWAlive.length)];
            setPlayerStatuses((prev) => ({ ...prev, [victim.id]: "dead-this-night" }));
            setKillSources((prev) => ({ ...prev, [victim.id]: "v07-poisoned" }));
            setNightTargetedPlayerIds((prev) => { const n = new Set(prev); n.add(victim.id); return n; });
            setCavalerioLinkedDeath(victim.id);
            toast.info(`O Cavaleiro Enferrujado estava envenenado! ${victim.name} morre em vez do Lobisomem.`);
          }
        } else {
          const closestWW = findClosestWerewolf(playerId);
          if (closestWW) {
            setPlayerStatuses((prev) => ({ ...prev, [closestWW.id]: "dead-this-night" }));
            setKillSources((prev) => ({ ...prev, [closestWW.id]: "v07" }));
            setNightTargetedPlayerIds((prev) => { const n = new Set(prev); n.add(closestWW.id); return n; });
            setCavalerioLinkedDeath(closestWW.id);
            toast.info(`O Cavaleiro Enferrujado morreu! ${closestWW.name} (${ROLES[roleAssignments[closestWW.id]]?.label}) também morre.`);
          }
        }
      }
    } else if (newStatus === "dead") {
      setPlayerStatuses((prev) => ({ ...prev, [playerId]: "dead" }));
      setPermanentlyDead((prev) => {
        const next = new Set(prev);
        next.add(playerId);
        return next;
      });
      supabase.from("players").update({ is_alive: false }).eq("id", playerId);
    } else if (newStatus === "alive") {
      setPlayerStatuses((prev) => ({ ...prev, [playerId]: "alive" }));
      setPermanentlyDead((prev) => {
        const next = new Set(prev);
        next.delete(playerId);
        return next;
      });
      supabase.from("players").update({ is_alive: true }).eq("id", playerId);

      // Cavaleiro resurrection
      if (roleAssignments[playerId] === CAVALEIRO_ROLE && cavalerioLinkedDeath) {
        const linkedId = cavalerioLinkedDeath;
        setPlayerStatuses((prev) => ({ ...prev, [linkedId]: "alive" }));
        setPermanentlyDead((prev) => {
          const next = new Set(prev);
          next.delete(linkedId);
          return next;
        });
        supabase.from("players").update({ is_alive: true }).eq("id", linkedId);
        setCavalerioLinkedDeath(null);
        const linkedPlayer = players.find((p) => p.id === linkedId);
        toast.info(`${linkedPlayer?.name} também foi ressuscitado!`);
      }
    }
  };

  const handleSetIllusion = (playerId: string) => {
    if (illusionPlayerId === playerId) {
      setIllusionPlayerId(null);
    } else {
      setIllusionPlayerId(playerId);
    }
  };

  const handleChamanChargeToggle = (index: number) => {
    const chamanPoisoned = poisonedPlayerId ? roleAssignments[poisonedPlayerId] === CHAMAN_ROLE : false;
    if (chamanPoisoned) {
      toast.warning("O Chaman está envenenado e não pode agir!");
      return;
    }
    if (chamanCharges > index) {
      setChamanCharges(index);
    } else {
      setChamanCharges(index + 1);
    }
  };

  const handleChamanDrop = (targetPlayerId: string) => {
    if (chamanCharges >= 2) {
      toast.warning("O Chaman já usou os dois poderes!");
      return;
    }
    const status = playerStatuses[targetPlayerId];
    if (status === "dead-this-night") {
      handlePlayerStatusChange(targetPlayerId, "alive");
      setChamanCharges((c) => Math.min(c + 1, 2));
      toast.success("O Chaman ressuscitou um jogador!");
    } else {
      toast.error("Só podes arrastar o Chaman para jogadores mortos (X vermelho)!");
    }
  };

  const endNight = async () => {
    const newPermanentlyDead = new Set(permanentlyDead);
    const newStatuses = { ...playerStatuses };
    const newlyDead: string[] = [];

    const currentDeadThisNight = Object.entries(newStatuses)
      .filter(([, status]) => status === "dead-this-night")
      .map(([pid]) => pid);
    setLastNightDeadPlayerIds(currentDeadThisNight);

    Object.entries(newStatuses).forEach(([pid, status]) => {
      if (status === "dead-this-night") {
        newPermanentlyDead.add(pid);
        newStatuses[pid] = "dead";
        newlyDead.push(pid);
      }
    });

    // Auto-remove poison the night after Bruxa dies
    if (poisonedPlayerId && isBruxaPermaDead) {
      // Check if the poisoned player's role appears in the script BEFORE the Bruxa
      // For simplicity, we clear it (the script order exception will be handled in future)
      setPoisonedPlayerId(null);
    }

    setPermanentlyDead(newPermanentlyDead);
    setPlayerStatuses(newStatuses);
    setNightNumber((n) => n + 1);
    setNightTargetedPlayerIds(new Set());
    setCavalerioLinkedDeath(null);
    // Clear Vidente fake map for next night
    setVidenteFakeMap(null);

    if (newlyDead.length > 0) {
      await Promise.all(
        newlyDead.map((pid) =>
          supabase.from("players").update({ is_alive: false }).eq("id", pid)
        )
      );
    }

    toast.success(`Noite ${nightNumber} terminada. Amanheceu!`);
  };

  // Handle drops on list items
  const handleListDrop = (e: React.DragEvent, targetPlayerId: string) => {
    e.preventDefault();
    const action = e.dataTransfer.getData("action");
    if (action) {
      if (action === "poison") {
        handlePlayerStatusChange(targetPlayerId, "poisoned");
        setNightTargetedPlayerIds((prev) => { const n = new Set(prev); n.add(targetPlayerId); return n; });
      }
      else if (action === "kill") handlePlayerStatusChange(targetPlayerId, "dead-this-night", "e01");
      else if (action === "chaman") handleChamanDrop(targetPlayerId);
      else if (action === "illusion") handleSetIllusion(targetPlayerId);
    }
  };

  const handleListDragOver = (e: React.DragEvent) => e.preventDefault();

  const getListDragProps = (playerId: string) => {
    if (!isPlaying) return {};
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
      const isAnyWerewolfPoisoned = poisonedPlayerId ? (["e01", "m01", "m02", "m03"] as RoleId[]).includes(roleAssignments[poisonedPlayerId]) : false;
      return {
        draggable: true,
        onDragStart: (e: React.DragEvent) => {
          if (isAnyWerewolfPoisoned) {
            e.preventDefault();
            toast.warning("Os Lobisomens estão envenenados e não podem agir!");
            return;
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
          const chamanPoisoned = poisonedPlayerId ? roleAssignments[poisonedPlayerId] === CHAMAN_ROLE : false;
          if (chamanPoisoned) {
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

  // Vidente reveal handler
  const isVidentePoisoned = useMemo(() => {
    return !!poisonedPlayerId && roleAssignments[poisonedPlayerId] === "e04";
  }, [poisonedPlayerId, roleAssignments]);

  // Generate fake map once and reuse
  const generateFakeMap = useCallback(() => {
    if (!isVidentePoisoned || lastNightDeadPlayerIds.length === 0) return null;
    
    const inPlayRoles = Object.values(roleAssignments).filter((r) => r !== "e04");
    const uniqueInPlay = [...new Set(inPlayRoles)];
    const deadActualRoles = new Set(lastNightDeadPlayerIds.map((pid) => roleAssignments[pid]).filter(Boolean));
    const candidateRoles = uniqueInPlay.filter((r) => !deadActualRoles.has(r));

    const map: Record<string, string> = {};
    const usedIndices = new Set<number>();

    for (const pid of lastNightDeadPlayerIds) {
      if (candidateRoles.length === 0) break;
      let idx: number;
      do {
        idx = Math.floor(Math.random() * candidateRoles.length);
      } while (usedIndices.has(idx) && usedIndices.size < candidateRoles.length);
      usedIndices.add(idx);
      map[pid] = candidateRoles[idx];
    }
    return map;
  }, [isVidentePoisoned, lastNightDeadPlayerIds, roleAssignments]);

  const handleVidenteReveal = useCallback(async () => {
    // Generate fake map once and store it
    let fakeMap = videnteFakeMap;
    if (isVidentePoisoned && !fakeMap) {
      fakeMap = generateFakeMap();
      setVidenteFakeMap(fakeMap);
    }
    
    setVidenteModalOpen(true);
    if (!roomId) return;
    const videntePlayerId = Object.entries(roleAssignments).find(([, r]) => r === "e04")?.[0];
    if (videntePlayerId) {
      const channel = supabase.channel(`vidente-reveal-${roomId}`);
      channel.send({
        type: "broadcast",
        event: "vidente-reveal",
        payload: {
          deadPlayerIds: lastNightDeadPlayerIds,
          illusionPlayerId,
          isVidentePoisoned,
          fakeMap: fakeMap || null,
          show: true,
        },
      });
    }
  }, [roomId, roleAssignments, lastNightDeadPlayerIds, illusionPlayerId, isVidentePoisoned, videnteFakeMap, generateFakeMap]);

  const handleCloseVidenteModal = useCallback(() => {
    setVidenteModalOpen(false);
    if (roomId) {
      const channel = supabase.channel(`vidente-reveal-${roomId}`);
      channel.send({
        type: "broadcast",
        event: "vidente-reveal",
        payload: { show: false },
      });
    }
  }, [roomId]);

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
            <p className="text-muted-foreground/40 text-xs font-body">
              Lobisomens da Torre Sangrenta — por AnJoMorto e L_PT_1463
            </p>
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

        {/* Main content layout */}
        {isPlaying ? (
          <>
            {/* Circle - full width when playing */}
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
                  poisonedPlayerId={poisonedPlayerId}
                  illusionPlayerId={illusionPlayerId}
                  onSetIllusion={handleSetIllusion}
                  isBruxaPermaDead={isBruxaPermaDead}
                  isMarionetista={isMarionetista}
                  chamanCharges={chamanCharges}
                  onChamanChargeToggle={handleChamanChargeToggle}
                  onChamanDrop={handleChamanDrop}
                  isBruxaPoisoned={isBruxaPoisoned}
                  foxDisabled={foxDisabled}
                  onFoxDisabledToggle={() => setFoxDisabled((v) => !v)}
                />
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
                  <p className="text-muted-foreground font-display text-lg">À espera que jogadores entrem…</p>
                  <p className="text-muted-foreground/60 text-sm mt-2">Partilha o código ou adiciona jogadores manualmente</p>
                </motion.div>
              )}
            </div>

            {/* Below circle: Script left, Player list right */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
              {/* Night Script (left) */}
              <div>
                <NightScript
                  activeRoles={activeRoles}
                  permanentlyDead={permanentlyDead}
                  poisonedPlayerId={poisonedPlayerId}
                  illusionPlayerId={illusionPlayerId}
                  roleAssignments={roleAssignments}
                  nightNumber={nightNumber}
                  onEndNight={endNight}
                  chamanCharges={chamanCharges}
                  onChamanChargeToggle={handleChamanChargeToggle}
                  lastNightDeadPlayerIds={lastNightDeadPlayerIds}
                  players={players}
                  onVidenteReveal={handleVidenteReveal}
                  playerStatuses={playerStatuses}
                  foxDisabled={foxDisabled}
                  onFoxDisabledToggle={() => setFoxDisabled((v) => !v)}
                  nightTargetedPlayerIds={nightTargetedPlayerIds}
                />
              </div>

              {/* Player list (right) */}
              <div className="space-y-4">
                <h2 className="font-display text-sm tracking-widest uppercase text-muted-foreground">Jogadores</h2>

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
                      const isThisIllusion = player.id === illusionPlayerId;
                      const isThisPoisoned = player.id === poisonedPlayerId;
                      const isThisBruxaPoisoned = roleId === "e02" && isThisPoisoned;
                      const isChaman = roleId === CHAMAN_ROLE;
                      const isFox = roleId === ("v04" as RoleId);
                      const isChamanPoisoned = poisonedPlayerId ? roleAssignments[poisonedPlayerId] === CHAMAN_ROLE : false;

                      const borderClass = isDuplicate
                        ? "border-yellow-500"
                        : isThisIllusion
                        ? "border-purple-500"
                        : isThisPoisoned
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
                              {isThisIllusion && (
                                <img src={illusionIcon} alt="ilusão" className="absolute -top-1 -right-1 w-4 h-4" />
                              )}
                              {isThisPoisoned && !isThisBruxaPoisoned && (
                                <img src={poisonedIcon} alt="envenenado" className="absolute -bottom-1 -right-1 w-4 h-4" />
                              )}
                              {isThisBruxaPoisoned && (
                                <img src={imunityIcon} alt="imunidade" className="absolute -top-1 -left-1 w-4 h-4" />
                              )}
                            </div>
                          )}
                          <span className={`font-body text-sm flex-1 truncate ${isThisPoisoned ? "text-green-400" : isThisIllusion ? "text-purple-400" : ""}`}>{player.name}</span>
                          {isDuplicate && <AlertTriangle className="h-4 w-4 text-yellow-500 flex-shrink-0" />}
                          {/* Chaman charges in list */}
                          {isChaman && !isPermanentDead && (
                            <div className="flex gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                              {[0, 1].map((idx) => (
                                <Checkbox
                                  key={idx}
                                  checked={chamanCharges > idx}
                                  onCheckedChange={() => handleChamanChargeToggle(idx)}
                                  className="h-4 w-4 border-primary data-[state=checked]:bg-primary"
                                />
                              ))}
                              {isChamanPoisoned && (
                                <img src={poisonedIcon} alt="" className="h-4 w-4" />
                              )}
                            </div>
                          )}
                          {/* Fox power checkbox in list */}
                          {isFox && !isPermanentDead && (
                            <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                              <Checkbox
                                checked={foxDisabled}
                                onCheckedChange={() => setFoxDisabled((v) => !v)}
                                className="h-4 w-4 border-primary data-[state=checked]:bg-primary"
                              />
                              <span className="text-[9px] text-muted-foreground">Esgotado</span>
                            </div>
                          )}
                          <RoleSelector value={roleId} onChange={(role) => changeRole(player.id, role)} />
                        </div>
                      );

                      const showPoison = !isBruxaPermaDead;
                      const showIllusion = isMarionetista && !isPermanentDead;

                      return (
                        <PlayerStatusPopover
                          key={player.id}
                          status={status}
                          isPermanentlyDead={isPermanentDead}
                          isPoisoned={isThisPoisoned}
                          open={listPopoverId === player.id}
                          onOpenChange={(open) => setListPopoverId(open ? player.id : null)}
                          showPoison={showPoison}
                          showIllusion={showIllusion}
                          isIllusion={isThisIllusion}
                          onSetPoisoned={() => {
                            handlePlayerStatusChange(player.id, "poisoned");
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
                          onSetIllusion={() => {
                            handleSetIllusion(player.id);
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
          </>
        ) : (
          /* Lobby: Circle + player list side by side */
          <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto items-start">
            {/* Circle - shrinks to fit */}
            <div className="flex-1 min-w-0 flex justify-center">
              {players.length > 0 ? (
                <div className="w-full overflow-hidden flex justify-center">
                  <PlayerCircle
                    players={players}
                    totalSlots={players.length}
                    onDropPlayer={updateSeatPosition}
                    isGM
                    roleAssignments={rolesAssigned ? roleAssignments : undefined}
                    compact
                  />
                </div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
                  <p className="text-muted-foreground font-display text-lg">À espera que jogadores entrem…</p>
                  <p className="text-muted-foreground/60 text-sm mt-2">Partilha o código ou adiciona jogadores manualmente</p>
                </motion.div>
              )}
            </div>

            {/* Player list sidebar */}
            <div className="w-full lg:w-72 space-y-4">
              <h2 className="font-display text-sm tracking-widest uppercase text-muted-foreground">Jogadores</h2>

              {!rolesAssigned && <AddPlayerForm onAdd={addManualPlayer} existingNames={existingPlayerNames} />}

              {!rolesConfirmed && (
                <div className="flex items-center gap-2">
                  <Switch id="advanced-toggle" checked={advancedEnabled} onCheckedChange={setAdvancedEnabled} />
                  <Label htmlFor="advanced-toggle" className="font-display text-sm cursor-pointer">Modo Avançado</Label>
                </div>
              )}

              {/* Dev test button */}
              {!rolesAssigned && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addTestPlayers}
                  className="w-full text-xs opacity-50 hover:opacity-100"
                >
                  <FlaskConical className="h-3 w-3 mr-1" />
                  Dev: Adicionar 8 jogadores teste
                </Button>
              )}

              <AnimatePresence>
                {unseatedPlayers.map((player) => (
                  <motion.div
                    key={player.id}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex items-center gap-2 bg-card border border-border rounded-lg p-3"
                  >
                    <div
                      className="flex-1 cursor-grab active:cursor-grabbing"
                      draggable
                      onDragStartCapture={(e: React.DragEvent<HTMLDivElement>) => {
                        e.dataTransfer.setData("playerId", player.id);
                      }}
                    >
                      <span className="font-body text-lg">{player.name}</span>
                    </div>
                    {!rolesAssigned && (
                      <button
                        onClick={() => removePlayer(player.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors p-1"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {unseatedPlayers.length === 0 && players.length > 0 && !rolesAssigned && (
                <p className="text-muted-foreground/60 text-sm">Todos os jogadores sentados</p>
              )}

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
          </div>
        )}
      </div>

      {/* Vidente Reveal Modal */}
      <VidenteRevealModal
        open={videnteModalOpen}
        onClose={handleCloseVidenteModal}
        deadPlayerIds={lastNightDeadPlayerIds}
        illusionPlayerId={illusionPlayerId}
        roleAssignments={roleAssignments}
        players={players}
        isVidentePoisoned={isVidentePoisoned}
        precomputedFakeMap={videnteFakeMap}
      />
    </div>
  );
};

export default GMRoom;