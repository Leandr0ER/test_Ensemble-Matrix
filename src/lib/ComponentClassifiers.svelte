<script>
    import { baseClassifiers, MAX_CELL_VALUE } from './store.js';
</script>

<div class="classifiers-list">
    <h3>Base Classifiers</h3>
    <div class="list-container">
        {#each $baseClassifiers as cls}
            <div class="classifier-item">
                <span class="dot"></span>
                <strong>{cls.name}</strong>
                <div class="mini-matrix">
                    {#each cls.matrix as row}
                        <div class="mini-row">
                            {#each row as val}
                                <span class="mini-cell" style="opacity: {val / MAX_CELL_VALUE + 0.2}"></span>
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
        gap: 1rem;
        padding: 0.5rem;
        background: #fdfdfd;
        border: 1px solid #eee;
        border-radius: 4px;
        font-size: 0.9rem;
    }

    .dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background-color: #3498db;
    }

    .mini-matrix {
        margin-left: auto;
        display: flex;
        flex-direction: column;
        gap: 1px;
    }

    .mini-row {
        display: flex;
        gap: 1px;
    }

    .mini-cell {
        width: 6px;
        height: 6px;
        background: #3498db;
        border-radius: 1px;
    }
</style>
