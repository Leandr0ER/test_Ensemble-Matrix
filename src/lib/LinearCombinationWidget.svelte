<script>
    import { classifierWeights, baseClassifiers, MAX_WEIGHT } from './store.js';

    function updateWeight(id, value) {
        classifierWeights.update(w => ({
            ...w,
            [id]: parseFloat(value) || 0
        }));
    }
</script>

<div class="weights-widget">
    <h3>Classifier Weights</h3>
    <div class="sliders">
        {#each $baseClassifiers as cls}
            <div class="slider-group">
                <label for="w-{cls.id}">W{cls.id + 1}: {($classifierWeights[cls.id] ?? 0).toFixed(1)}</label>
                <input 
                    type="range" 
                    id="w-{cls.id}"
                    min="0" 
                    max={MAX_WEIGHT}
                    step="0.1" 
                    value={$classifierWeights[cls.id] ?? 0}
                    on:input={(e) => updateWeight(cls.id, e.currentTarget.value)}
                />
            </div>
        {/each}
    </div>
</div>

<style>
    .weights-widget h3 {
        margin-top: 0;
        font-size: 1.1rem;
        color: #333;
    }

    .sliders {
        display: flex;
        flex-direction: column;
        gap: 0.8rem;
    }

    .slider-group {
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
    }

    .slider-group label {
        font-size: 0.8rem;
        color: #666;
        font-weight: bold;
    }

    input[type="range"] {
        width: 100%;
        cursor: pointer;
    }
</style>
