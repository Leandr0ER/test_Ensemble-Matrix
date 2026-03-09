# Ensemble Matrix Visualizer

An interactive SPA for visualizing and exploring ensemble classifier confusion matrices built with **Svelte 5** and **Vite**.

## What it does

- Displays **8 base classifiers**, each with a randomly generated 3×3 confusion matrix
- Lets you adjust **per-classifier weights** (0–10) via sliders
- Computes and renders the **weighted ensemble confusion matrix** in real time using a color-coded heatmap

## Project Structure

```
src/
├── App.svelte                        # Root layout (main panel + sidebar)
├── app.css                           # Global base styles
└── lib/
    ├── store.js                      # Svelte stores + shared constants
    ├── EnsembleMatrix.svelte         # Heatmap visualization of the ensemble result
    ├── LinearCombinationWidget.svelte # Weight sliders for each classifier
    └── ComponentClassifiers.svelte   # List of base classifiers with mini matrices
```

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Available Scripts

| Command           | Description                        |
|-------------------|------------------------------------|
| `npm run dev`     | Start development server           |
| `npm run build`   | Build for production (outputs to `dist/`) |
| `npm run preview` | Preview the production build       |

## Configuration Constants

Key values are defined in `src/lib/store.js` and shared across components:

| Constant          | Default | Description                        |
|-------------------|---------|------------------------------------|
| `MATRIX_SIZE`     | `3`     | Dimensions of each confusion matrix |
| `NUM_CLASSIFIERS` | `8`     | Number of base classifiers         |
| `MAX_CELL_VALUE`  | `50`    | Maximum cell value (used for color scale) |
| `MAX_WEIGHT`      | `10`    | Maximum classifier weight          |

## Tech Stack

- [Svelte 5](https://svelte.dev/) — reactive UI framework
- [Vite 7](https://vite.dev/) — fast build tool and dev server
