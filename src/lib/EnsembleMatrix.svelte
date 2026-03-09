<script>
    import { ensembleMatrix } from './store.js';
    import { MAX_CELL_VALUE } from './store.js';

    // Determine background color based on cell value
    function getCellColor(value) {
        const intensity = Math.min(Math.max(value / MAX_CELL_VALUE, 0), 1);
        return `rgba(52, 152, 219, ${intensity})`;
    }

    const classes = ['Class A', 'Class B', 'Class C'];
</script>

<div class="matrix-container">
    <h2>Ensemble Confusion Matrix</h2>
    <p class="description">Weighted combination of all base classifiers</p>

    <div class="matrix-grid">
        <div class="header-cell corner"></div>
        
        {#each classes as label}
            <div class="header-cell col-header">{label} (Pred)</div>
        {/each}

        {#each $ensembleMatrix as row, i}
            <div class="header-cell row-header">{classes[i]} (Real)</div>
            {#each row as val}
                <div class="data-cell" style="background-color: {getCellColor(val)}">
                    <span class="value">{val.toFixed(1)}</span>
                </div>
            {/each}
        {/each}
    </div>

    <div class="legend">
        <span>0</span>
        <div class="gradient"></div>
        <span>{MAX_CELL_VALUE}+</span>
    </div>
</div>

<style>
    .matrix-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 1rem;
    }

    h2 {
        margin: 0;
        color: #2c3e50;
    }

    .description {
        font-size: 0.9rem;
        color: #7f8c8d;
        margin-bottom: 2rem;
    }

    .matrix-grid {
        display: grid;
        grid-template-columns: 120px repeat(3, 100px);
        gap: 8px;
        background: #f8f9fa;
        padding: 15px;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.05);
    }

    .header-cell {
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 0.85rem;
        color: #34495e;
        padding: 10px;
    }

    .col-header {
        border-bottom: 2px solid #dee2e6;
    }

    .row-header {
        border-right: 2px solid #dee2e6;
        justify-content: flex-end;
        padding-right: 15px;
    }

    .data-cell {
        width: 100px;
        height: 100px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        border: 1px solid rgba(0,0,0,0.05);
        transition: background-color 0.2s ease, transform 0.1s ease;
    }

    .data-cell:hover {
        transform: scale(1.05);
        z-index: 1;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .value {
        font-family: 'Courier New', Courier, monospace;
        font-weight: bold;
        color: #2c3e50;
        text-shadow: 0 0 2px white;
    }

    .legend {
        margin-top: 2rem;
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 0.8rem;
        color: #7f8c8d;
    }

    .gradient {
        width: 200px;
        height: 12px;
        background: linear-gradient(to right, rgba(52, 152, 219, 0), rgba(52, 152, 219, 1));
        border-radius: 6px;
        border: 1px solid #eee;
    }
</style>
