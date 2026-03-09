<script>
    import { baseClassifiers, classLabels } from './store.js';

    // Compute max value of a confusion matrix for opacity scaling
    function getMax(matrix) {
        return Math.max(1, ...matrix.flatMap(row => row));
    }
</script>

<div class="classifiers-list">
    <h3>Base Classifiers</h3>
    <div class="list-container">
        {#each $baseClassifiers as cls}
            {@const maxVal = getMax(cls.confusion_matrix)}
            <div class="classifier-item">
                <div class="clf-info">
                    <span class="dot"></span>
                    <div class="clf-text">
                        <strong>{cls.name}</strong>
                        <span class="accuracy">{(cls.accuracy * 100).toFixed(1)}% accuracy</span>
                    </div>
                </div>
                <div class="mini-matrix">
                    {#each cls.confusion_matrix as row, i}
                        <div class="mini-row">
                            {#each row as val, j}
                                <span
                                    class="mini-cell"
                                    class:mini-diagonal={i === j}
                                    style="opacity: {val / maxVal * 0.9 + 0.1}"
                                    title="{classLabels[i]}→{classLabels[j]}: {val}"
                                ></span>
                            {/each}
                        </div>
                    {/each}
                </div>
            </div>
        {/each}
    </div>
</div>

<style>
    .classifiers-list h3 {
        margin-top: 0;
        font-size: 1.1rem;
        color: #333;
        border-bottom: 2px solid #eee;
        padding-bottom: 0.5rem;
    }

    .list-container {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .classifier-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem;
        padding: 0.5rem;
        background: #fdfdfd;
        border: 1px solid #eee;
        border-radius: 4px;
        font-size: 0.9rem;
    }

    .clf-info {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex: 1;
        min-width: 0;
    }

    .clf-text {
        display: flex;
        flex-direction: column;
    }

    .clf-text strong {
        font-size: 0.82rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .accuracy {
        font-size: 0.72rem;
        color: #27ae60;
        font-weight: 600;
    }

    .dot {
        flex-shrink: 0;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: #3498db;
    }

    .mini-matrix {
        display: flex;
        flex-direction: column;
        gap: 1px;
        flex-shrink: 0;
    }

    .mini-row {
        display: flex;
        gap: 1px;
    }

    .mini-cell {
        width: 5px;
        height: 5px;
        background: #e74c3c;
        border-radius: 1px;
    }

    .mini-cell.mini-diagonal {
        background: #27ae60;
    }
</style>
