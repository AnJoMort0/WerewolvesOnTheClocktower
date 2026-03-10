import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Moon } from "lucide-react";
import { toast } from "sonner";

const JoinRoom = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!code) return;
    const fetchRoom = async () => {
      const { data } = await supabase
        .from("rooms")
        .select("id, status")
        .eq("code", code.toUpperCase())
        .single();

      if (!data) {
        setError("Sala não encontrada");
        return;
      }
      if (data.status !== "lobby") {
        setError("Este jogo já começou");
        return;
      }
      setRoomId(data.id);
    };
    fetchRoom();
  }, [code]);

  const joinGame = async () => {
    if (!roomId || !name.trim()) return;
    setLoading(true);

    const { data, error: err } = await supabase
      .from("players")
      .insert({ room_id: roomId, name: name.trim() })
      .select()
      .single();

    if (data && !err) {
      localStorage.setItem(`player_token_${data.id}`, data.player_token);
      localStorage.setItem(`player_room`, roomId);
      localStorage.setItem(`player_id`, data.id);
      navigate(`/play/${data.id}`);
    } else {
      toast.error("Erro ao entrar na sala");
    }
    setLoading(false);
  };

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center space-y-4"
        >
          <Moon className="mx-auto h-10 w-10 text-muted-foreground opacity-40" />
          <p className="font-display text-xl text-primary">{error}</p>
          <Button variant="secondary" onClick={() => navigate("/")}>
            Voltar ao Início
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-sm space-y-8 text-center"
      >
        <div className="space-y-2">
          <Moon className="mx-auto h-10 w-10 text-moon opacity-60" />
          <h1 className="font-display text-2xl font-bold text-gradient-blood">
            Juntar-se à Caçada
          </h1>
          <p className="text-muted-foreground">
            Sala <span className="font-display tracking-widest">{code?.toUpperCase()}</span>
          </p>
        </div>

        <div className="space-y-4">
          <Input
            placeholder="O teu nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && joinGame()}
            maxLength={20}
            className="h-14 text-center text-xl bg-secondary border-border placeholder:text-muted-foreground/50"
          />
          <Button
            onClick={joinGame}
            disabled={!name.trim() || loading}
            className="w-full h-14 text-lg font-display tracking-wider bg-primary hover:bg-blood-glow glow-blood"
          >
            Entrar
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default JoinRoom;
