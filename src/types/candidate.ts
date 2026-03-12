import { Badge } from "./badge";

export interface Candidate {
  id: string;
  name: string;
  initials: string;
  photo?: string | null;
  wiki?: string | null;
  title: string;
  badges: Badge[];
  background: string;
  platform: string[];
  funding: string;
  fundingPct: number;
  poll: number | null;
  pollNote: string;
}