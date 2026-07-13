export type TeamCode = "FRA" | "ESP" | "ENG" | "ARG";

export interface Team {
  code: TeamCode;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  logo: string;
}

export const TEAMS: Record<TeamCode, Team> = {
  FRA: {
    code: "FRA",
    name: "France",
    primary: "#0055A4",
    secondary: "#EF4135",
    accent: "#FFFFFF",
    logo: "/france.webp",
  },
  ESP: {
    code: "ESP",
    name: "Spain",
    primary: "#AA151B",
    secondary: "#F1BF00",
    accent: "#AA151B",
    logo: "/spain.webp",
  },
  ENG: {
    code: "ENG",
    name: "England",
    primary: "#CE1124",
    secondary: "#FFFFFF",
    accent: "#CE1124",
    logo: "/england.webp",
  },
  ARG: {
    code: "ARG",
    name: "Argentina",
    primary: "#6CACE4",
    secondary: "#FFFFFF",
    accent: "#F6B40E",
    logo: "/argentina.webp",
  },
};
