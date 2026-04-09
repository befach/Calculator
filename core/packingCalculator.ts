// Standard box packing calculator
// Auto-selects the best standard box for a product and calculates packing estimates

export interface StandardBox {
  id: 'small' | 'medium' | 'large' | 'xlarge';
  label: string;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  tareWeightKg: number;
}

export const STANDARD_BOXES: StandardBox[] = [
  { id: 'small',  label: 'Small Box',       lengthCm: 35, widthCm: 25, heightCm: 15, tareWeightKg: 0.5 },
  { id: 'medium', label: 'Medium Box',      lengthCm: 45, widthCm: 35, heightCm: 25, tareWeightKg: 0.7 },
  { id: 'large',  label: 'Large Box',       lengthCm: 60, widthCm: 40, heightCm: 40, tareWeightKg: 0.9 },
  { id: 'xlarge', label: 'Extra Large Box', lengthCm: 70, widthCm: 50, heightCm: 45, tareWeightKg: 1.0 },
];

/** Padding per side in cm (accounts for bubble wrap, foam, cardboard lining) */
const PADDING_PER_SIDE_CM = 2;

export interface PackingResult {
  box: StandardBox;
  productsPerBox: number;
  totalBoxes: number;
  estimatedWeightPerBoxKg: number;
  totalEstimatedWeightKg: number;
}

/**
 * All 6 permutations of [a, b, c] to try every product orientation in a box.
 */
function orientations(a: number, b: number, c: number): [number, number, number][] {
  return [
    [a, b, c], [a, c, b],
    [b, a, c], [b, c, a],
    [c, a, b], [c, b, a],
  ];
}

/**
 * Calculate the best packing for a product into standard boxes.
 *
 * Returns the smallest standard box that fits at least 1 product,
 * with the number of products per box maximised across all orientations.
 * Returns null if the product doesn't fit in any standard box.
 */
export function calculatePacking(
  productL: number,
  productW: number,
  productH: number,
  productWeightKg: number,
  totalQuantity: number,
): PackingResult | null {
  if (productL <= 0 || productW <= 0 || productH <= 0 || totalQuantity <= 0) {
    return null;
  }

  for (const box of STANDARD_BOXES) {
    const usableL = box.lengthCm - PADDING_PER_SIDE_CM * 2;
    const usableW = box.widthCm  - PADDING_PER_SIDE_CM * 2;
    const usableH = box.heightCm - PADDING_PER_SIDE_CM * 2;

    if (usableL <= 0 || usableW <= 0 || usableH <= 0) continue;

    let maxFit = 0;

    for (const [pL, pW, pH] of orientations(productL, productW, productH)) {
      const fitL = Math.floor(usableL / pL);
      const fitW = Math.floor(usableW / pW);
      const fitH = Math.floor(usableH / pH);
      maxFit = Math.max(maxFit, fitL * fitW * fitH);
    }

    if (maxFit >= 1) {
      const productsPerBox = maxFit;
      const totalBoxes = Math.ceil(totalQuantity / productsPerBox);
      const estimatedWeightPerBoxKg = Math.round((productWeightKg * productsPerBox + box.tareWeightKg) * 100) / 100;
      const totalEstimatedWeightKg = Math.round(estimatedWeightPerBoxKg * totalBoxes * 100) / 100;

      return {
        box,
        productsPerBox,
        totalBoxes,
        estimatedWeightPerBoxKg,
        totalEstimatedWeightKg,
      };
    }
  }

  return null;
}
