import type { TeamCode } from "./teams";

interface WeightedPlayer {
  name: string;
  weight: number;
}

// Real 2026 World Cup squads (outfield players only — goalkeepers essentially
// never score, so they're left out of the scorer pool). Weight is a rough
// "how likely to get on the scoresheet" tier: forwards > wide/attacking
// mids > midfielders > defenders.
export const PLAYERS: Record<TeamCode, WeightedPlayer[]> = {
  FRA: [
    { name: "Mbappé", weight: 7 },
    { name: "Dembélé", weight: 6 },
    { name: "Olise", weight: 5 },
    { name: "Doué", weight: 5 },
    { name: "Barcola", weight: 4 },
    { name: "Thuram", weight: 5 },
    { name: "Cherki", weight: 3 },
    { name: "Akliouche", weight: 3 },
    { name: "Mateta", weight: 3 },
    { name: "Zaïre-Emery", weight: 3 },
    { name: "Tchouaméni", weight: 2 },
    { name: "Koné", weight: 2 },
    { name: "Rabiot", weight: 2 },
    { name: "Kanté", weight: 2 },
    { name: "Koundé", weight: 1 },
    { name: "Saliba", weight: 1 },
    { name: "T. Hernandez", weight: 1 },
    { name: "Upamecano", weight: 1 },
  ],
  ESP: [
    { name: "Yamal", weight: 7 },
    { name: "Oyarzabal", weight: 6 },
    { name: "Dani Olmo", weight: 5 },
    { name: "Nico Williams", weight: 5 },
    { name: "Pedri", weight: 4 },
    { name: "Gavi", weight: 3 },
    { name: "Fabián Ruiz", weight: 3 },
    { name: "Rodri", weight: 3 },
    { name: "Baena", weight: 3 },
    { name: "Merino", weight: 3 },
    { name: "Zubimendi", weight: 2 },
    { name: "Pedro Porro", weight: 1 },
    { name: "Cucurella", weight: 1 },
    { name: "Laporte", weight: 1 },
    { name: "Cubarsí", weight: 1 },
  ],
  ENG: [
    { name: "Kane", weight: 7 },
    { name: "Saka", weight: 6 },
    { name: "Bellingham", weight: 6 },
    { name: "Rashford", weight: 5 },
    { name: "Gordon", weight: 4 },
    { name: "Watkins", weight: 4 },
    { name: "Eze", weight: 4 },
    { name: "Madueke", weight: 3 },
    { name: "Toney", weight: 3 },
    { name: "Rogers", weight: 3 },
    { name: "Mainoo", weight: 2 },
    { name: "Rice", weight: 2 },
    // { name: "J. Henderson", weight: 2 },
    { name: "Anderson", weight: 2 },
    { name: "Stones", weight: 1 },
    { name: "Guéhi", weight: 1 },
    { name: "Reece James", weight: 1 },
  ],
  ARG: [
    { name: "Messi", weight: 7 },
    { name: "Lautaro Martínez", weight: 6 },
    { name: "Julián Álvarez", weight: 6 },
    { name: "Nico González", weight: 4 },
    { name: "Thiago Almada", weight: 4 },
    { name: "José M. López", weight: 4 },
    { name: "Giuliano Simeone", weight: 3 },
    { name: "Nico Paz", weight: 3 },
    { name: "De Paul", weight: 3 },
    { name: "Enzo Fernández", weight: 3 },
    { name: "Paredes", weight: 2 },
    { name: "Barco", weight: 2 },
    { name: "Molina", weight: 1 },
    { name: "Lisandro Martínez", weight: 1 },
    { name: "Otamendi", weight: 1 },
    { name: "Romero", weight: 1 },
  ],
};

export function pickScorer(code: TeamCode): string {
  const pool = PLAYERS[code];
  const total = pool.reduce((sum, p) => sum + p.weight, 0);
  let roll = Math.random() * total;
  for (const player of pool) {
    if (roll < player.weight) return player.name;
    roll -= player.weight;
  }
  return pool[pool.length - 1].name;
}
