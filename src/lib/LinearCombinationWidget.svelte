<script>
    import { classifierWeights, baseClassifiers, MAX_WEIGHT } from './store.js';

    // --- 2D polygon widget constants ---
    const SZ   = 190;   // SVG canvas size
    const PAD  = 22;    // padding from edge to corners
    const AREA = SZ - 2 * PAD;  // draggable area side length

    // Corner order (fixed): 0=top-left, 1=top-right, 2=bottom-right, 3=bottom-left
    const CORNERS = [
        { x: PAD,        y: PAD        },   // 0 top-left
        { x: PAD + AREA, y: PAD        },   // 1 top-right
        { x: PAD + AREA, y: PAD + AREA },   // 2 bottom-right
        { x: PAD,        y: PAD + AREA },   // 3 bottom-left
    ];

    // Corner colors for visual identity
    const COLORS = ['#3498db', '#e74c3c', '#2ecc71', '#9b59b6'];

    let dragging = false;

    function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

    // Bilinear interpolation: point → 4 normalised weights
    function weightsFromPoint(x, y) {
        const xn = (x - PAD) / AREA;
        const yn = (y - PAD) / AREA;
        return [
            (1 - xn) * (1 - yn),  // top-left
            xn       * (1 - yn),  // top-right
            xn       * yn,        // bottom-right
            (1 - xn) * yn,        // bottom-left
        ];
    }

    // Inverse bilinear: 4 normalised weights → point (xn, yn)
    // xn = w1 + w2,  yn = w2 + w3  (exact inverse for bilinear quad)
    function pointFromWeights(w) {
        const total = w.reduce((a, b) => a + b, 0) || 1;
        const n = w.map(v => v / total);
        const xn = clamp(n[1] + n[2], 0, 1);
        const yn = clamp(n[2] + n[3], 0, 1);
        return { x: PAD + xn * AREA, y: PAD + yn * AREA };
    }

    // Derive point position reactively from the store (so sliders also move the dot)
    $: pointPos = pointFromWeights(
        Array.from({ length: 4 }, (_, i) => $classifierWeights[i] ?? 0)
    );

    function applyPoint(x, y) {
        const cx = clamp(x, PAD, PAD + AREA);
        const cy = clamp(y, PAD, PAD + AREA);
        const ws = weightsFromPoint(cx, cy);
        classifierWeights.set(
            Object.fromEntries(ws.map((w, i) => [i, +(w * MAX_WEIGHT).toFixed(3)]))
        );
    }

    function onPointerDown(e) {
        dragging = true;
        e.currentTarget.setPointerCapture(e.pointerId);
        const r = e.currentTarget.getBoundingClientRect();
        applyPoint(e.clientX - r.left, e.clientY - r.top);
    }

    function onPointerMove(e) {
        if (!dragging) return;
        const r = e.currentTarget.getBoundingClientRect();
        applyPoint(e.clientX - r.left, e.clientY - r.top);
    }

    function onPointerUp() { dragging = false; }

    // Slider fine-tuning
    function updateWeight(id, value) {
        classifierWeights.update(w => ({ ...w, [id]: parseFloat(value) || 0 }));
    }

    // Display normalised weights as % for the badge
    $: normWeights = (() => {
        const vals = Array.from({ length: 4 }, (_, i) => $classifierWeights[i] ?? 0);
        const total = vals.reduce((a, b) => a + b, 0) || 1;
        return vals.map(v => (v / total * 100).toFixed(0));
    })();
</script>

<div class="widget">
    <h3>Classifier Weights</h3>

    <!-- 2D Polygon Panel -->
    <div class="panel-label">Linear Combination · Drag to explore</div>
    <div class="svg-wrap">
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <svg
            width={SZ} height={SZ}
            on:pointerdown={onPointerDown}
            on:pointermove={onPointerMove}
            on:pointerup={onPointerUp}
            on:pointercancel={onPointerUp}
            style="touch-action:none; cursor:crosshair; display:block;"
        >
            <!-- Background square -->
            <rect x={PAD} y={PAD} width={AREA} height={AREA}
                  fill="#fafbfc" stroke="#cdd" stroke-width="1.5" rx="4"/>

            <!-- Diagonal guide lines (subtle) -->
            <line x1={PAD} y1={PAD} x2={PAD+AREA} y2={PAD+AREA}
                  stroke="#dde" stroke-width="0.8" stroke-dasharray="4,4"/>
            <line x1={PAD+AREA} y1={PAD} x2={PAD} y2={PAD+AREA}
                  stroke="#dde" stroke-width="0.8" stroke-dasharray="4,4"/>
            <!-- Cross-hair guides -->
            <line x1={PAD+AREA/2} y1={PAD} x2={PAD+AREA/2} y2={PAD+AREA}
                  stroke="#dde" stroke-width="0.8" stroke-dasharray="2,4"/>
            <line x1={PAD} y1={PAD+AREA/2} x2={PAD+AREA} y2={PAD+AREA/2}
                  stroke="#dde" stroke-width="0.8" stroke-dasharray="2,4"/>

            <!-- Corner circles + labels -->
            {#each $baseClassifiers as clf, idx}
                {@const cx = CORNERS[idx].x}
                {@const cy = CORNERS[idx].y}
                {@const isTop = idx < 2}
                {@const isLeft = idx === 0 || idx === 3}
                <circle cx={cx} cy={cy} r="7" fill={COLORS[idx]} opacity="0.85"/>
                <!-- Weight % badge -->
                <text
                    x={cx + (isLeft ? -10 : 10)}
                    y={cy + (isTop ? -14 : 20)}
                    text-anchor={isLeft ? 'end' : 'start'}
                    font-size="9.5"
                    font-weight="bold"
                    fill={COLORS[idx]}
                >{normWeights[idx]}%</text>
                <!-- Classifier name -->
                <text
                    x={cx + (isLeft ? -10 : 10)}
                    y={cy + (isTop ? -4 : 10)}
                    text-anchor={isLeft ? 'end' : 'start'}
                    font-size="9"
                    fill="#555"
                >{clf.name.replace('Classifier','').replace('Regression','LR').trim()}</text>
            {/each}

            <!-- Draggable point — shadow first -->
            <circle cx={pointPos.x} cy={pointPos.y} r="9"
                    fill="rgba(0,0,0,0.15)" transform="translate(1,1)"/>
            <circle cx={pointPos.x} cy={pointPos.y} r="8"
                    fill="#e74c3c" stroke="white" stroke-width="2"
                    style="pointer-events:none"/>
        </svg>
    </div>

    <!-- Slider fine-tuning -->
    <div class="sliders-label">Fine-tune individual weights</div>
    <div class="sliders">
        {#each $baseClassifiers as cls, idx}
            <div class="slider-group">
                <div class="slider-header">
                    <span class="dot" style="background:{COLORS[idx]}"></span>
                    <span class="clf-name">{cls.name}</span>
                    <span class="clf-acc">{(cls.accuracy * 100).toFixed(1)}%</span>
                    <span class="w-val">{normWeights[idx]}%</span>
                </div>
                <input
                    type="range"
                    min="0"
                    max={MAX_WEIGHT}
                    step="0.05"
                    value={$classifierWeights[cls.id] ?? 0}
                    on:input={(e) => updateWeight(cls.id, e.currentTarget.value)}
                    style="accent-color: {COLORS[idx]}"
                />
            </div>
        {/each}
    </div>
</div>

<style>
    .widget h3 {
        margin: 0 0 0.4rem;
        font-size: 1.05rem;
        color: #2c3e50;
    }

    .panel-label, .sliders-label {
        font-size: 0.72rem;
        color: #aaa;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: 4px;
    }

    .sliders-label { margin-top: 0.75rem; }

    .svg-wrap {
        display: flex;
        justify-content: center;
        background: #f8f9fa;
        border: 1px solid #e8eaed;
        border-radius: 6px;
        padding: 4px;
    }

    .sliders {
        display: flex;
        flex-direction: column;
        gap: 0.6rem;
    }

    .slider-group {
        display: flex;
        flex-direction: column;
        gap: 3px;
    }

    .slider-header {
        display: flex;
        align-items: center;
        gap: 5px;
    }

    .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        flex-shrink: 0;
    }

    .clf-name {
        font-size: 0.78rem;
        font-weight: 600;
        color: #333;
        flex: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .clf-acc {
        font-size: 0.7rem;
        color: #27ae60;
        font-weight: 600;
    }

    .w-val {
        font-size: 0.7rem;
        color: #888;
        font-family: 'Courier New', monospace;
        min-width: 32px;
        text-align: right;
    }

    input[type="range"] {
        width: 100%;
        cursor: pointer;
        height: 3px;
    }
</style>
