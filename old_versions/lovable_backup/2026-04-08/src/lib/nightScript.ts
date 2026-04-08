import type { RoleId } from "./roles";

export interface ScriptLine {
  text: string;
  requires?: RoleId[];
}

export const firstNightScript: ScriptLine[] = [
  { text: "Esta noite não terá mortos." },
  { text: "(Lançar um d12)" },
  {
    text: "O {Cupido} acorda e escolhe dois jogadores que serão Namorados. O {Cupido} adormece e os Namorados serão agora tocados e podem se conhecer. Se um Namorado morre, o outro se suicida. O objetivo dos Namorados e do {Cupido} é que os Namorados sejam os últimos sobreviventes.",
    requires: ["s01"],
  },
  {
    text: "O {Cupido Malvado} acorda e escolhe dois jogadores que serão Inimigos. O {Cupido Malvado} adormece e os Inimigos serão tocados e podem se conhecer. Se um Inimigo consegue condenar o outro a execução, o primeiro recebe imunidade na próxima tentativa de assassinato.",
    requires: ["m05"],
  },
  {
    text: "As {Irmãs} acordam para se conhecerem.",
    requires: ["l03"],
  },
  {
    text: "Os {Irmãos} acordam para se conhecerem.",
    requires: ["l04"],
  },
  {
    text: "O {Ator} acorda e escolhe um Ídolo cujo poder copiará quando o Ídolo morrer. Só lhe será revelado o poder do Ídolo, na noite a seguir à morte do Ídolo.",
    requires: ["a04"],
  },
  {
    text: "O {Domador do Corvo} acorda e é-lhe revelado o número de Criaturas Malvadas que vivem na Aldeia.",
    requires: ["v03"],
  },
  {
    text: "O {Domador da Raposa} acorda e indica três vizinhos. Será-lhe revelado, com o polegar, se um desses três jogadores é uma Criatura Malvada.",
    requires: ["v04"],
  },
  {
    text: "O {Urso} rosna/não rosna.",
    requires: ["v02"],
  },
  {
    text: "O {Chefe da Aldeia} acorda e escolhe um jogador que automaticamente terá 2 votos contra ele no próximo Tribunal.",
    requires: ["v11"],
  },
  {
    text: "No fim desta noite ouve-se um uivar. A Aldeia sabe então que os Lobisomens se revelaram e estão com fome. A Aldeia acorda desconfiada de toda a gente.",
  },
];

export const secondNightScript: ScriptLine[] = [
  {
    text: "O {Ladrão} acorda e escolhe com o polegar se quer jogar do lado dos Aldeões ou do lado dos Lobisomens.",
    requires: ["f01"],
  },
  {
    text: "O {Cão-Lobo} acorda e diz com o polegar se quer ser um Cão ou um Lobisomem. Se escolher ser um Cão vai indicar um dono, que vai ser tocado e que poderá acordar para conhecer o seu cachorro. É revelado ao Cão o papel do seu dono. A partir deste momento, o Cão acorda sempre com o seu dono e deve também usar o seu poder independentemente do dono. Se escolher ser um Lobisomem, pode voltar a dormir.",
    requires: ["a02"],
  },
  {
    text: "A {Criança Selvagem} acorda e escolhe o seu Pai Adotivo. Se este morrer durante o jogo, a {Criança Selvagem} se tornará um Lobisomem.",
    requires: ["l02"],
  },
  {
    text: "Os Lobisomens acordam e são-lhe apresentados as Criaturas Malvadas.",
  },
];

export const normalNightScript: ScriptLine[] = [
  { text: "(Lançar um d12)" },
  {
    text: "(Ressuscitar o jogador salvo pelo {Anjo})",
    requires: ["v18"],
  },
  {
    text: "O {Ator} acorda. Se o seu Ídolo morreu, é-lhe mostrado o papel ao qual irá responder de agora em diante, senão o {Ator} indica ao apontar outra pessoa se quer trocar de Ídolo.",
    requires: ["a04"],
  },
  {
    text: "(Se um Inimigo for executado pelo outro) O {Cupido Malvado} acorda e escolhe um segundo Inimigo. O {Cupido Malvado} adormece e os Inimigos serão tocados e podem se conhecer. Se um Inimigo consegue condenar o outro a execução, o primeiro recebe imunidade na próxima tentativa de assassinato.",
    requires: ["m05"],
  },
  {
    text: "O {Sonâmbulo} acorda e escolhe um jogador para visitar, uma vez a escolha feita, adormece na casa dessa pessoa. Essa pessoa vai ser tocada e sabe que mesmo se for chamada, não acordará.",
    requires: ["v16"],
  },
  {
    text: "A {Bruxa Malvada} acorda e escolhe um jogador que irá envenenar esta noite.",
    requires: ["e02"],
  },
  {
    text: "A {Empregada} acorda e é-lhe revelada a distância até a pessoa envenenada.",
    requires: ["v20"],
  },
  {
    text: "A {Cigana} acorda e indica 3 vizinhos. Se um deles estiver envenenado, ele perde o veneno e a {Cigana} passa a estar envenenada.",
    requires: ["v12"],
  },
  {
    text: "O {Ilusionista} acorda e indica o jogador cuja a identidade será obstruída.",
    requires: ["a06"],
  },
  {
    text: "(Se alguém morreu) A {Vidente} acorda e é-lhe revelado o papel dos mortos de ontem.",
    requires: ["e04"],
  },
  {
    text: "O {Domador do Corvo} acorda e é-lhe revelado o número de Criaturas Malvadas que ainda vivem na Aldeia (ou o {Corvo} está confuso).",
    requires: ["v03"],
  },
  {
    text: "O {Domador da Raposa} acorda e indica três vizinhos. Será-lhe revelado, com o polegar, se um desses três jogadores é uma Criatura Malvada (ou se a {Raposa} está confusa).",
    requires: ["v04"],
  },
  {
    text: "O {Urso} rosna/não rosna (/está confuso).",
    requires: ["v02"],
  },
  {
    text: "O {Chefe da Aldeia} acorda e escolhe um jogador que automaticamente terá 2 votos contra ele no próximo Tribunal.",
    requires: ["v11"],
  },
  {
    text: "O {Ladrão} acorda e indica a quem quer retirar o voto no próximo Tribunal.",
    requires: ["f01"],
  },
  {
    text: "O {Capitão} acorda e escolhe um jogador que será um SOLDADO durante esta noite e o próximo dia.",
    requires: ["v09"],
  },
  {
    text: "O {Cupido} acorda e decide com o polegar se quer usar uma das suas duas flechas de proteção para dar imunidade aos Namorados esta noite.",
    requires: ["s01"],
  },
  {
    text: "O {Amante Secreto} acorda e aponta para um jogador, e será revelado se é um dos Namorados. Se for o caso, esse Namorado será tocado e pode acordar para lhe ser revelado o seu Amante, que substitui o antigo Namorado.",
    requires: ["a07"],
  },
  {
    text: "O {Salvador} acorda e indica quem será imune durante esta noite e o dia.",
    requires: ["v17"],
  },
  {
    text: "O {Lobisomem Mau} acorda e escolhe com o polegar se quer se mascarar de Avózinha esta noite e dia, ou não. Pode usar esse poder duas vezes durante todo o jogo.",
    requires: ["m01"],
  },
  {
    text: "O {Piromaníaco} acorda/não acorda. São-lhe mostradas as pessoas inocentadas no último tribunal. Ele decide, ao indicar ou mostrar o polegar para baixo, se quer ou não incendiar a casa de uma delas.",
    requires: ["v15"],
  },
  {
    text: "O {Pedro} acorda (todas as noites). Se ele acusou alguém em Tribunal, é-lhe indicado se essas pessoas são Lobisomens. Relembro que o {Pedro} não pode levar a mesma pessoa a Tribunal duas vezes.",
    requires: ["v22"],
  },
  {
    text: "Os Lobisomens acordam/não acordam se envenenados e escolhem em conjunto uma vítima que irão assassinar esta noite.",
    requires: ["e01", "m01", "m02", "m03", "s02"],
  },
  {
    text: "O {Lobisomem Vidente} acorda/não acorda se envenenados e decide com o polegar se quer salvar a vítima para ver o seu papel ou deixá-la morrer.",
    requires: ["m02"],
  },
  {
    text: "O {Lobisomem Vampiro} acorda/não acorda se salvo pela Vidente ou se envenenados e diz com o polegar se quer transformar a vítima em Lobisomem. Se for o caso, a vítima será tocada, e passará a acordar sempre com os Lobisomens. A vítima diz com o polegar se quer guardar os seus poderes ou não.",
    requires: ["m03"],
  },
  {
    text: "(A cada 3 noites) O {Lobisomem Branco} acorda e escolhe o Lobisomem que quer matar.",
    requires: ["s02"],
  },
  {
    text: "O {Domador dos Coelhos} ouviu os {Coelhos} assustados esta noite. / [nada] (/os {Coelhos} estão confusos)",
    requires: ["v05"],
  },
  {
    text: "O {Chaman} acorda e são-lhe apresentadas as vítimas. Ele escolhe então com o polegar se as quer salvar ou não. Relembro que pode salvar duas pessoas durante o jogo todo.",
    requires: ["e03"],
  },
  {
    text: "O {Faroleiro} acorda e é-lhe mostrado um personagem em jogo com um poder limitado e é informado de quantos usos esse personagem ainda tem.",
    requires: ["v21"],
  },
  {
    text: "O {Mimo} acorda e é-lhe mostrado um papel em jogo. Ele age silenciosamente segundo esse papel ou recebe as informações que esse papel receberia.",
    requires: ["a03"],
  },
  {
    text: "O {Rouba-Túmulos} acorda/não acorda se não houver vítimas e lhe são apresentadas as vítimas. Ele decide, ao indicar ou mostrar com o polegar para baixo, se quer ou não tomar o lugar de uma delas. Se escolher substituir uma das vítimas, o {Rouba-Túmulos} troca de poder com esse fantasma.",
    requires: ["a05"],
  },
  {
    text: "A {Menina} acorda/não acorda se não houver vítimas e são-lhe apresentadas as vítimas. Ela escolhe então quem ela quer saber a causa de morte.",
    requires: ["v01"],
  },
  {
    text: "O {Profeta} acorda/não acorda se não houver vítimas e indica, ao apontar um jogador que acha que morreu esta noite. Se estiver correto, o jogador será tocado, para saber que pode guardar o seu poder, mesmo como Fantasma, durante o próximo dia e a noite.",
    requires: ["v19"],
  },
];

/**
 * Render script text with character names wrapped in blue spans.
 * Names are enclosed in {curly braces} in the source text.
 */
export function parseScriptText(text: string): { segments: Array<{ text: string; isRole: boolean }> } {
  const segments: Array<{ text: string; isRole: boolean }> = [];
  const regex = /\{([^}]+)\}/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ text: text.slice(lastIndex, match.index), isRole: false });
    }
    segments.push({ text: match[1], isRole: true });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    segments.push({ text: text.slice(lastIndex), isRole: false });
  }

  return { segments };
}