<script>
    import { ensembleMatrix, classLabels, trueLabels, partitionLines } from './store.js';
    import { derived } from 'svelte/store';
    import * as d3 from 'd3';

    // SVG layout constants
    const CELL = 42;   // cell size in px
    const ML   = 48;   // left margin (row labels)
    const MT   = 48;   // top margin (col labels)
    const n    = classLabels.length;
    const SVG_W = ML + n * CELL + 4;
    const SVG_H = MT + n * CELL + 4;

    // Reactive max value for scaling
    $: maxVal = Math.max(1, ...$ensembleMatrix.flatMap(r => r));

    // D3 color scales — recalculate when maxVal changes
    $: diagScale  = d3.scaleSequential([0, maxVal], d3.interpolateGreens);
    $: errScale   = d3.scaleSequential([0, maxVal], d3.interpolateReds);

    // Pre-computed color grid — recalculates when matrix or scales change
    $: colorGrid = $ensembleMatrix.map((row, i) =>
        row.map((val, j) => {
            if (i === j)  return diagScale(val);
            if (val > 0)  return errScale(val);
            return '#f0f2f5';
        })
    );

    // Ensemble accuracy
    const accuracy = derived(ensembleMatrix, ($m) => {
        const correct = $m.reduce((s, r, i) => s + r[i], 0);
        return trueLabels.length > 0 ? (correct / trueLabels.length * 100).toFixed(1) : '0.0';
    });

    // --- Tooltip ---
    let mouseX = 0, mouseY = 0;
    let ttText = '';
    let ttVis  = false;

    function onSVGMove(e) {
        const r = e.currentTarget.getBoundingClientRect();
        mouseX = e.clientX - r.left + 14;
        mouseY = e.clientY - r.top  - 10;
    }

    // --- Partition line toggling ---
    function toggleRow(i) {
        if (i >= n - 1) return;
        partitionLines.update(pl => {
            const rows = pl.rows.includes(i)
                ? pl.rows.filter(r => r !== i)
                : [...pl.rows, i].sort((a, b) => a - b);
            return { ...pl, rows };
        });
    }

    function toggleCol(j) {
        if (j >= n - 1) return;
        partitionLines.update(pl => {
            const cols = pl.cols.includes(j)
                ? pl.cols.filter(c => c !== j)
                : [...pl.cols, j].sort((a, b) => a - b);
            return { ...pl, cols };
        });
    }
</script>

<div class="wrap">
    <h2>Ensemble Confusion Matrix</h2>
    <p class="desc">
        Accuracy: <strong>{$accuracy}%</strong>
        <span class="hint">· click row/column labels to add partition lines</span>
    </p>

    <div class="svg-wrap">
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <svg
            width={SVG_W}
            height={SVG_H}
            on:mousemove={onSVGMove}
            on:mouseleave={() => (ttVis = false)}
        >
            <!-- Predicted label (column headers) -->
            <text x={ML + (n * CELL) / 2} y={12} text-anchor="middle"
                  font-size="10" fill="#aaa">Predicted →</text>
            {#each classLabels as lbl, j}
                {@const active = $partitionLines.cols.includes(j) && j < n - 1}
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <text
                    x={ML + j * CELL + CELL / 2}
                    y={MT - 10}
                    text-anchor="middle"
                    font-size="13"
                    font-weight="bold"
                    fill={active ? '#e67e22' : '#34495e'}
                    cursor={j < n - 1 ? 'pointer' : 'default'}
                    on:click={() => toggleCol(j)}
                >{lbl}</text>
            {/each}

            <!-- True label (row headers) -->
            <text
                x={10} y={MT + (n * CELL) / 2}
                text-anchor="middle" dominant-baseline="middle"
                font-size="10" fill="#aaa"
                transform="rotate(-90, 10, {MT + (n * CELL) / 2})"
            >True ↓</text>

            {#each $ensembleMatrix as row, i}
                {@const active = $partitionLines.rows.includes(i) && i < n - 1}
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <text
                    x={ML - 8}
                    y={MT + i * CELL + CELL / 2 + 5}
                    text-anchor="end"
                    font-size="13"
                    font-weight="bold"
                    fill={active ? '#e67e22' : '#34495e'}
                    cursor={i < n - 1 ? 'pointer' : 'default'}
                    on:click={() => toggleRow(i)}
                >{classLabels[i]}</text>

                {#each row as val, j}
                    <!-- svelte-ignore a11y-mouse-events-have-key-events -->
                    <g
                        transform="translate({ML + j * CELL + 1}, {MT + i * CELL + 1})"
                        on:mouseenter={() => {
                            ttText = `True: ${classLabels[i]}  →  Pred: ${classLabels[j]}   (${val})`;
                            ttVis = true;
                        }}
                        on:mouseleave={() => (ttVis = false)}
                        style="cursor:default"
                    >
                        <rect
                            width={CELL - 3}
                            height={CELL - 3}
                            fill={colorGrid[i]?.[j] ?? '#f0f2f5'}
                            rx="3"
                            stroke={i === j ? 'rgba(39,174,96,0.35)' : 'none'}
                            stroke-width="1.5"
                            style="transition: opacity 0.2s"
                        />
                        <text
                            x={(CELL - 3) / 2}
                            y={(CELL - 3) / 2}
                            dy=".35em"
                            text-anchor="middle"
                            font-family="'Courier New', Courier, monospace"
                            font-size="11"
                            font-weight={val > 0 ? 'bold' : 'normal'}
                            fill={val === 0
                                ? '#c8cdd2'
                                : (val / maxVal) > 0.55
                                    ? '#ffffff'
                                    : '#2c3e50'}
                            pointer-events="none"
                        >{val}</text>
                    </g>
                {/each}
            {/each}

            <!-- Horizontal partition lines -->
            {#each $partitionLines.rows as ri}
                <line
                    x1={ML + 1}             y1={MT + (ri + 1) * CELL - 1}
                    x2={ML + n * CELL - 2}  y2={MT + (ri + 1) * CELL - 1}
                    stroke="#e67e22" stroke-width="2.5"
                />
                <!-- Small triangle marker on the left -->
                <polygon
                    points="{ML - 5},{MT + (ri + 1) * CELL - 4}
                            {ML - 5},{MT + (ri + 1) * CELL + 2}
                            {ML + 1},{MT + (ri + 1) * CELL - 1}"
                    fill="#e67e22"
                />
            {/each}

            <!-- Vertical partition lines -->
            {#each $partitionLines.cols as ci}
                <line
                    x1={ML + (ci + 1) * CELL - 1}  y1={MT + 1}
                    x2={ML + (ci + 1) * CELL - 1}  y2={MT + n * CELL - 2}
                    stroke="#e67e22" stroke-width="2.5"
                />
                <!-- Small triangle marker on the top -->
                <polygon
                    points="{ML + (ci + 1) * CELL - 4},{MT - 5}
                            {ML + (ci + 1) * CELL + 2},{MT - 5}
                            {ML + (ci + 1) * CELL - 1},{MT + 1}"
                    fill="#e67e22"
                />
            {/each}
        </svg>

        <!-- Floating tooltip -->
        {#if ttVis}
            <div class="tooltip" style="left:{mouseX}px; top:{mouseY}px">{ttText}</div>
        {/if}
    </div>

    <!-- Colour legend + gradient bar -->
    <div class="legend">
        <span class="li">
            <span class="grad-bar correct-bar"></span>
            Correct (diagonal)
        </span>
        <span class="li">
            <span class="grad-bar error-bar"></span>
            Error (off-diagonal)
        </span>
        <span class="note">low → high intensity</span>
    </div>

    {#if $partitionLines.rows.length > 0 || $partitionLines.cols.length > 0}
        <p class="partition-info">
            <span class="part-badge">⬜ Partitioned</span>
            {$partitionLines.rows.length} horizontal · {$partitionLines.cols.length} vertical lines
            — <button class="clear-btn" on:click={() => partitionLines.set({ rows: [], cols: [] })}>Clear all</button>
        </p>
    {/if}
</div>

<style>
    .wrap {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 0.75rem;
        height: 100%;
        box-sizing: border-box;
        overflow: auto;
    }

    h2 { margin: 0; color: #2c3e50; font-size: 1.3rem; }

    .desc {
        font-size: 0.88rem;
        color: #7f8c8d;
        margin: 0.25rem 0 0.75rem;
    }

    .hint { font-size: 0.78rem; color: #bbb; }

    .svg-wrap { position: relative; display: inline-block; }

    .tooltip {
        position: absolute;
        background: rgba(20, 20, 30, 0.82);
        color: #fff;
        padding: 5px 10px;
        border-radius: 5px;
        font-size: 0.78rem;
        font-family: 'Courier New', monospace;
        pointer-events: none;
        white-space: nowrap;
        z-index: 20;
        box-shadow: 0 2px 8px rgba(0,0,0,0.25);
    }

    .legend {
        margin-top: 0.7rem;
        display: flex;
        align-items: center;
        gap: 18px;
        font-size: 0.8rem;
        color: #7f8c8d;
    }

    .li { display: flex; align-items: center; gap: 6px; }

    .grad-bar {
        display: inline-block;
        width: 60px;
        height: 10px;
        border-radius: 3px;
        border: 1px solid rgba(0,0,0,0.08);
    }

    .correct-bar {
        background: linear-gradient(to right, #f7fcf5, #00441b);
    }

    .error-bar {
        background: linear-gradient(to right, #fff5f0, #67000d);
    }

    .note { font-size: 0.7rem; color: #ccc; }

    .partition-info {
        margin: 0.5rem 0 0;
        font-size: 0.78rem;
        color: #7f8c8d;
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .part-badge {
        background: #fef3e2;
        border: 1px solid #e67e22;
        color: #e67e22;
        padding: 1px 6px;
        border-radius: 3px;
        font-size: 0.75rem;
        font-weight: 600;
    }

    .clear-btn {
        background: none;
        border: 1px solid #ccc;
        border-radius: 3px;
        padding: 1px 6px;
        font-size: 0.75rem;
        cursor: pointer;
        color: #666;
    }

    .clear-btn:hover { background: #f8f8f8; border-color: #e67e22; color: #e67e22; }
</style>
