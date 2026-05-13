
## This is a very large set of changes. I'll break it into phases for manageable implementation.

### Phase 1 — Critical Fixes & Quick Wins
1. **Fix Vidente poison sync** — Send the actual fake role mapping from GM to player device instead of regenerating randomly
2. **Touch screen drag-drop** — Add touch event handlers (touchstart/touchmove/touchend) for tablet GM usage
3. **Self-drag-drop** — Allow characters to drag onto themselves
4. **Dead character kill tracking** — Store who/what killed each player (drag source role or "manual"/"executado")
5. **Lobisomens script line** — Keep visible as long as any Lobisomem character is alive
6. **Blue animal names in script** — Highlight {Urso}, {Raposa}, {Coelhos}, {Corvo} in blue
7. **Capuchinho/Caçador dependency** — Warn when one exists without the other
8. **Auto-remove poison** — Remove poison night after Bruxa dies (with script-order exception)
9. **Remove player button** — Add "-" button in join lobby player list
10. **Dev test button** — Add 8 random players + auto-seat for testing
11. **Add v16 Sonâmbulo & v17 Salvador images** — Copy uploaded art and register in roles

### Phase 2 — Day/Night Cycle & Tribunal
12. **Day timer** — After ending night, show configurable day timer (default 5min) with alarm
13. **Tribunal timer** — After day ends, show 3min tribunal timer with vote count
14. **Executado option** — Kill during tribunal with ghost_executed icon, tracked as "executado"
15. **Night/Day counter** — Track "1st Night → 1st Day → 2nd Night → ..."

### Phase 3 — Conditional Script Lines
16. **Cavaleiro Enferrujado** — Show script line only when he dies that night
17. **Caçador death/Capuchinho execution** — Conditional script lines with drag-drop kill
18. **Capuchinho Vermelho werewolf immunity** — Shield icon, immune to wolf attacks while Caçador alive

### Phase 4 — New Status Effects & Drag-Drop Actions
19. **Capitão → Soldado status** — Pop-up option + drag-drop, with death script line
20. **Paranoico** — 2 charges, drag-drop kill, tribunal death announcement
21. **Chefe da Aldeia → "2 votos contra"** — Pop-up + drag-drop, poisoned = "vota a dobrar"
22. **Cigana poisoned** → "vota a dobrar"
23. **Juiz dead (non-execution)** → permanent "vota a dobrar"
24. **Piromaníaco → Inocentado/Incendiado** — Complex multi-step status
25. **Sonâmbulo → Hóspede** — Makes target inactive (strikethrough script)
26. **Salvador → Imunidade Total** — Full immunity effect
27. **Anjo** — Drag onto perma-dead to resurrect, 2 charges, resets target's uses
28. **Empregada script** — Distance to poisoned player, wrong if poisoned
29. **Lobisomem Mau** — Self-immunity 2 charges
30. **Lobisomem Vidente** — Reveal victim's card (like Vidente modal)
31. **Ankou** — Permanent "vota a dobrar" if executed
32. **Lobisomem Branco** — Every 3rd night script + drag-drop kill wolves
33. **Rouba-Túmulos** — Swap characters with dead player
34. **Irmãos survival** — Auto-save if 2+ alive, unless poisoned

### Phase 5 — PDF Rulebook & Session Persistence
35. **PDF rulebook pop-up** — Embed PDF viewer as modal on player/GM screens
36. **Session reconnection** — Allow players to rejoin via stored token (localStorage)

---

**Recommendation:** I suggest we start with **Phase 1** (fixes + quick wins) since it addresses current bugs and quality-of-life improvements. Each phase will be a separate conversation turn. Does this plan work for you?
