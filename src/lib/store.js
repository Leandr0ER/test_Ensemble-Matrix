import { writable, derived } from 'svelte/store';

// Configuration constants
export const MATRIX_SIZE = 3;
export const NUM_CLASSIFIERS = 8;
export const MAX_CELL_VALUE = 50;
export const MAX_WEIGHT = 10;

// Generate a random MATRIX_SIZE x MATRIX_SIZE confusion matrix
const generateMockMatrix = () => {
    return Array.from({ length: MATRIX_SIZE }, () =>
        Array.from({ length: MATRIX_SIZE }, () => Math.floor(Math.random() * MAX_CELL_VALUE))
    );
};

// 1. Raw data: base classifiers with names and confusion matrices
export const baseClassifiers = writable(
    Array.from({ length: NUM_CLASSIFIERS }, (_, i) => ({
        id: i,
        name: `Classifier ${i + 1}`,
        matrix: generateMockMatrix()
    }))
);

// 2. Current weights: initialized to 1 for all classifiers
export const classifierWeights = writable(
    Object.fromEntries(Array.from({ length: NUM_CLASSIFIERS }, (_, i) => [i, 1]))
);

// 3. Combined matrix: weighted average of all base classifier matrices
export const ensembleMatrix = derived(
    [baseClassifiers, classifierWeights],
    ([$baseClassifiers, $classifierWeights]) => {
        if ($baseClassifiers.length === 0) return [];

        // Initialize result matrix with zeros
        let result = Array.from({ length: MATRIX_SIZE }, () => Array(MATRIX_SIZE).fill(0));
        let totalWeight = Object.values($classifierWeights).reduce((a, b) => a + b, 0) || 1;

        $baseClassifiers.forEach(cls => {
            const weight = $classifierWeights[cls.id] ?? 0;
            for (let i = 0; i < MATRIX_SIZE; i++) {
                for (let j = 0; j < MATRIX_SIZE; j++) {
                    result[i][j] += (cls.matrix[i][j] * weight) / totalWeight;
                }
            }
        });

        return result;
    }
);
