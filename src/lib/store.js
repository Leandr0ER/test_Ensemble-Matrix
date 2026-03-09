import { writable, derived } from 'svelte/store';
import ensembleData from './data/ensemble_data.json';

// Configuration constants derived from the real dataset
export const MATRIX_SIZE = ensembleData.classes.length;        // 10 (digits 0–9)
export const NUM_CLASSIFIERS = ensembleData.classifiers.length; // 4
export const MAX_WEIGHT = 10;

// Static reference data
export const trueLabels = ensembleData.true_labels;
export const classLabels = ensembleData.classes;

// 1. Base classifiers with real sklearn data
export const baseClassifiers = writable(
    ensembleData.classifiers.map((clf, i) => ({
        id: i,
        name: clf.name,
        accuracy: clf.accuracy,
        confusion_matrix: clf.confusion_matrix,
        probabilities: clf.probabilities,
    }))
);

// 2. Weights: initialized equally for all classifiers
export const classifierWeights = writable(
    Object.fromEntries(ensembleData.classifiers.map((_, i) => [i, 1]))
);

// 3. Ensemble confusion matrix: derived from weighted probability vectors
//    Formula: y_pred = argmax( sum_i( w_i * P_i(y|x) ) )
export const ensembleMatrix = derived(
    [baseClassifiers, classifierWeights],
    ([$baseClassifiers, $classifierWeights]) => {
        const nInstances = trueLabels.length;
        const nClasses = classLabels.length;
        const totalWeight = Object.values($classifierWeights).reduce((a, b) => a + b, 0) || 1;

        // Compute weighted average probability vector per instance, then argmax
        const ensemblePreds = Array.from({ length: nInstances }, (_, inst) => {
            const weightedProbs = Array(nClasses).fill(0);
            $baseClassifiers.forEach(clf => {
                const w = ($classifierWeights[clf.id] ?? 0) / totalWeight;
                clf.probabilities[inst].forEach((p, c) => {
                    weightedProbs[c] += w * p;
                });
            });
            return weightedProbs.indexOf(Math.max(...weightedProbs));
        });

        // Build confusion matrix: rows = true labels, cols = predicted labels
        const cm = Array.from({ length: nClasses }, () => Array(nClasses).fill(0));
        trueLabels.forEach((trueLabel, inst) => {
            cm[trueLabel][ensemblePreds[inst]]++;
        });

        return cm;
    }
);

// 4. Partition lines: row indices (i) draw a line after row i, col indices (j) after col j
export const partitionLines = writable({ rows: [], cols: [] });
