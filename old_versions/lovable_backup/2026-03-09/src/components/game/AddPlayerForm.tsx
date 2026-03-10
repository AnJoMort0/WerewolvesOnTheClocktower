import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";

interface AddPlayerFormProps {
  onAdd: (name: string) => void;
  existingNames?: string[];
}

export const AddPlayerForm = ({ onAdd, existingNames = [] }: AddPlayerFormProps) => {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    if (existingNames.some((n) => n.toLowerCase() === trimmed.toLowerCase())) {
      toast.error("Já existe um jogador com esse nome. Escolhe outro.");
      return;
    }
    onAdd(trimmed);
    setName("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nome do jogador…"
        className="flex-1 font-body"
      />
      <Button type="submit" size="icon" variant="secondary" disabled={!name.trim()}>
        <Plus className="h-4 w-4" />
      </Button>
    </form>
  );
};
