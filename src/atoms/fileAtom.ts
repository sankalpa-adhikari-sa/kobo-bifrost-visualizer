import { atom } from "jotai";

export const fileAtom = atom<{ name: string; size: number } | null>(null);
