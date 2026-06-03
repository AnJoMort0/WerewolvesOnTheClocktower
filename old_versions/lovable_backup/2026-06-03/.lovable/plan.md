# Implementation plan

Large request — grouping into 5 passes, all in one go.

## Pass A — Small fixes
1. **Tribunal timer on player side**: extend phase/timer block in `PlayerView.tsx` so Tribunal also renders the live countdown (mirror Day logic). Verify `room-timer-${roomId}` broadcast in `GMRoom.tsx` runs during Tribunal.
2. **Poisoned Chaman**: keep his checkbox tickable; only block the drag-drop-to-resurrect action (skip ressurect effect when poisoned but still toggle checkbox state).
3. **i18n leftovers**: replace remaining hardcoded PT strings (`A carregar`, `Partilha o código ou adiciona jogadores manualmente`, `8 jogadores teste adicionados`, etc.) with `t()` keys. Add keys to `i18n/types.ts`, `pt.ts`, `fr.ts`.

## Pass B — Rework v07 (Cavaleiro Enferrujado / Tetanus)
- Tetanus effect uses `tetanus.png` (already exists) — confirm `effectIcons` map points to it.
- **Trigger**: any death applied to v07 (werewolf kill, witch kill, poison resolution, execution) applies `tetanus` to closest *alive, non-perma-dead* werewolf. Remove instant-death code; add helper `applyTetanusFromCavaleiro(victimId)` invoked from each kill path including execution in `executePlayer`.
- **Resolution timing**:
  - At "Começar Tribunal" (`startTribunal`): players with `tetanus` get red-X (`dead-this-night`, `killSources='v07'`), like Paranoico.
  - At "Próxima Noite" (`nextNight`): those red-X → permanently dead (existing flow already handles dead-this-night → perma).
- Ressurecting Cavaleiro **does NOT** remove tetanus from victim — strip that line from `resurrectPlayer`.

## Pass C — New character v23 Domador da Aranha
- Add `v23` to `RoleId`, `ROLES`, `INFO_ROLES`, `VILLAGER_UNIQUE`.
- Upload `v23_final.png` as role image asset; upload `webbed.png` and `caught.png` as effect icons.
- Add effects `webbed`, `caught` to `EffectKey`, `effectIcons`, `effectLabels` (PT/FR), popover.
- Drag-drop logic in `GMRoom.tsx` `applyDragDrop`:
  - v23 onto target → set `webbed` (only one player can be webbed; remove from previous).
  - Any drag-drop onto webbed player → tag dragger (and any non-special drag-drop target action) with `caught` effect.
  - `caught` is cleared at end of night.
- Script lines:
  - First night after Ator (a04).
  - Normal-night-start line "Domador da Aranha acorda e escolhe novo jogador" with `conditionKey: 'webbedTargetPermaDead'`.
  - Normal-night-end line "é-lhe mostrado todas as caught" with `conditionKey: 'hasCaughtPlayers'`, includes an eye icon button.
- Eye icon opens reveal modal showing roles of all `caught` players (or random roles if v23 poisoned). Synced to v23 player's device like Menina via `pendingReveal` channel.
- Illusion swap: caught player under `ilusao` shows as a06.

## Pass D — New character f02 Espião
- Add `f02` to roles, `INFO_ROLES`, `OTHER_UNIQUE` (or new pool — keep in unique villager-side singles).
- Upload `f02_final.png` and `spied_on.png` assets.
- Add effect `spied_on` to keys/icons/labels/popover.
- Script lines:
  - Second night after Ladrão (`f01`): choice script.
  - Normal night after Vidente (`e04`): eye icon line, hidden when all in-game players have `spied_on`.
- Eye click → modal showing one random in-game role not yet spied (role only, no name). Mark that player `spied_on`. If chosen role is under `ilusao` → show a06. If f02 poisoned → show random role NOT in game (or `l01` if all in game).

## Pass E — Existing-character actions
- **Rouba-Túmulos (a05)**: drag-drop onto red-X player → swap role assignments (target becomes a05, a05 becomes target's role); reset limited-use checkbox state for a05's new role. If poisoned: block drag-drop and add strikethrough to his script line.
- **Amante Secreto (as01b)**: add 1 checkbox in circle/list/script. When checked → strikethrough his script line. Add conditional extra script line `traidoTexto` when as01b is in game AND poisoned AND has `namorado` effect.

## Pass F — Rulebook button
- Add small `BookOpen` icon button (top-right of GM page header & PlayerView header) linking to GitHub raw rulebook depending on current `lang` (PT/FR URLs from request). Opens in new tab.

## Technical notes
- `pendingReveal` channel already used for Menina/Vidente — extend with `target: 'v23' | 'f02'` discriminator carrying `cards[]`.
- All new effect keys added to `EffectKey` union, with `effectIcons` map updates and `effectLabels.pt`/`.fr` entries.
- New i18n keys batched into single edit per language file.
- Asset uploads via `lovable-assets` CLI from `/mnt/user-uploads/` → pointer JSONs imported in `roles.ts` / `GMRoom.tsx`.

## Files (estimated)
`src/lib/roles.ts`, `src/lib/i18n/types.ts`, `src/lib/i18n/pt.ts`, `src/lib/i18n/fr.ts`, `src/pages/GMRoom.tsx`, `src/pages/PlayerView.tsx`, `src/components/game/PlayerCircle.tsx`, `src/components/game/PlayerStatusPopover.tsx`, `src/components/game/NightScript.tsx`, `src/components/game/RevealModal.tsx`, plus new asset pointers in `src/assets/roles/` and `src/assets/icons/`.
