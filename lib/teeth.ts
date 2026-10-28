export type ToothCategory = "adulto" | "infantil";
export type ToothType = "incisivo" | "canino" | "premolar" | "molar";

export interface ToothInfo {
  number: number;
  name: string;
  category: ToothCategory;
  type: ToothType;
}

export const TEETH_MAP: Record<number, ToothInfo> = {
  // --- ARCADA SUPERIOR ADULTO (Quadrantes 1 e 2) ---
  18: { number: 18, name: "Terceiro Molar Superior Direito", category: "adulto", type: "molar" },
  17: { number: 17, name: "Segundo Molar Superior Direito", category: "adulto", type: "molar" },
  16: { number: 16, name: "Primeiro Molar Superior Direito", category: "adulto", type: "molar" },
  15: { number: 15, name: "Segundo Pré-Molar Superior Direito", category: "adulto", type: "premolar" },
  14: { number: 14, name: "Primeiro Pré-Molar Superior Direito", category: "adulto", type: "premolar" },
  13: { number: 13, name: "Canino Superior Direito", category: "adulto", type: "canino" },
  12: { number: 12, name: "Incisivo Lateral Superior Direito", category: "adulto", type: "incisivo" },
  11: { number: 11, name: "Incisivo Central Superior Direito", category: "adulto", type: "incisivo" },
  21: { number: 21, name: "Incisivo Central Superior Esquerdo", category: "adulto", type: "incisivo" },
  22: { number: 22, name: "Incisivo Lateral Superior Esquerdo", category: "adulto", type: "incisivo" },
  23: { number: 23, name: "Canino Superior Esquerdo", category: "adulto", type: "canino" },
  24: { number: 24, name: "Primeiro Pré-Molar Superior Esquerdo", category: "adulto", type: "premolar" },
  25: { number: 25, name: "Segundo Pré-Molar Superior Esquerdo", category: "adulto", type: "premolar" },
  26: { number: 26, name: "Primeiro Molar Superior Esquerdo", category: "adulto", type: "molar" },
  27: { number: 27, name: "Segundo Molar Superior Esquerdo", category: "adulto", type: "molar" },
  28: { number: 28, name: "Terceiro Molar Superior Esquerdo", category: "adulto", type: "molar" },

  // --- ARCADA INFERIOR ADULTO (Quadrantes 4 e 3) ---
  48: { number: 48, name: "Terceiro Molar Inferior Direito", category: "adulto", type: "molar" },
  47: { number: 47, name: "Segundo Molar Inferior Direito", category: "adulto", type: "molar" },
  46: { number: 46, name: "Primeiro Molar Inferior Direito", category: "adulto", type: "molar" },
  45: { number: 45, name: "Segundo Pré-Molar Inferior Direito", category: "adulto", type: "premolar" },
  44: { number: 44, name: "Primeiro Pré-Molar Inferior Direito", category: "adulto", type: "premolar" },
  43: { number: 43, name: "Canino Inferior Direito", category: "adulto", type: "canino" },
  42: { number: 42, name: "Incisivo Lateral Inferior Direito", category: "adulto", type: "incisivo" },
  41: { number: 41, name: "Incisivo Central Inferior Direito", category: "adulto", type: "incisivo" },
  31: { number: 31, name: "Incisivo Central Inferior Esquerdo", category: "adulto", type: "incisivo" },
  32: { number: 32, name: "Incisivo Lateral Inferior Esquerdo", category: "adulto", type: "incisivo" },
  33: { number: 33, name: "Canino Inferior Esquerdo", category: "adulto", type: "canino" },
  34: { number: 34, name: "Primeiro Pré-Molar Inferior Esquerdo", category: "adulto", type: "premolar" },
  35: { number: 35, name: "Segundo Pré-Molar Inferior Esquerdo", category: "adulto", type: "premolar" },
  36: { number: 36, name: "Primeiro Molar Inferior Esquerdo", category: "adulto", type: "molar" },
  37: { number: 37, name: "Segundo Molar Inferior Esquerdo", category: "adulto", type: "molar" },
  38: { number: 38, name: "Terceiro Molar Inferior Esquerdo", category: "adulto", type: "molar" },

  // --- ARCADA INFANTIL (Quadrantes 5, 6, 7 e 8) ---
  55: { number: 55, name: "Segundo Molar Decíduo Superior Direito", category: "infantil", type: "molar" },
  54: { number: 54, name: "Primeiro Molar Decíduo Superior Direito", category: "infantil", type: "molar" },
  53: { number: 53, name: "Canino Decíduo Superior Direito", category: "infantil", type: "canino" },
  52: { number: 52, name: "Incisivo Lateral Decíduo Superior Direito", category: "infantil", type: "incisivo" },
  51: { number: 51, name: "Incisivo Central Decíduo Superior Direito", category: "infantil", type: "incisivo" },

  61: { number: 61, name: "Incisivo Central Decíduo Superior Esquerdo", category: "infantil", type: "incisivo" },
  62: { number: 62, name: "Incisivo Lateral Decíduo Superior Esquerdo", category: "infantil", type: "incisivo" },
  63: { number: 63, name: "Canino Decíduo Superior Esquerdo", category: "infantil", type: "canino" },
  64: { number: 64, name: "Primeiro Molar Decíduo Superior Esquerdo", category: "infantil", type: "molar" },
  65: { number: 65, name: "Segundo Molar Decíduo Superior Esquerdo", category: "infantil", type: "molar" },

  71: { number: 71, name: "Incisivo Central Decíduo Inferior Esquerdo", category: "infantil", type: "incisivo" },
  72: { number: 72, name: "Incisivo Lateral Decíduo Inferior Esquerdo", category: "infantil", type: "incisivo" },
  73: { number: 73, name: "Canino Decíduo Inferior Esquerdo", category: "infantil", type: "canino" },
  74: { number: 74, name: "Primeiro Molar Decíduo Inferior Esquerdo", category: "infantil", type: "molar" },
  75: { number: 75, name: "Segundo Molar Decíduo Inferior Esquerdo", category: "infantil", type: "molar" },

  85: { number: 85, name: "Segundo Molar Decíduo Inferior Direito", category: "infantil", type: "molar" },
  84: { number: 84, name: "Primeiro Molar Decíduo Inferior Direito", category: "infantil", type: "molar" },
  83: { number: 83, name: "Canino Decíduo Inferior Direito", category: "infantil", type: "canino" },
  82: { number: 82, name: "Incisivo Lateral Decíduo Inferior Direito", category: "infantil", type: "incisivo" },
  81: { number: 81, name: "Incisivo Central Decíduo Inferior Direito", category: "infantil", type: "incisivo" }
};

export function getToothInfo(number: number): ToothInfo {
  return TEETH_MAP[number] || {
    number,
    name: `Dente ${number}`,
    category: "adulto",
    type: "molar"
  };
}
