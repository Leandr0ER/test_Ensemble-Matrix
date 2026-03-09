<script>
  import EnsembleMatrix from './lib/EnsembleMatrix.svelte';
  import LinearCombinationWidget from './lib/LinearCombinationWidget.svelte';
  import ComponentClassifiers from './lib/ComponentClassifiers.svelte';
</script>

<main class="dashboard">
  <section class="main-panel">
    <EnsembleMatrix />
  </section>

  <aside class="sidebar">
    <div class="widget-container">
      <LinearCombinationWidget />
    </div>
    <div class="classifiers-container">
      <ComponentClassifiers />
    </div>
  </aside>
</main>

<style>
  :global(body) {
    margin: 0;
    font-family: sans-serif;
    background-color: #f4f4f9;
  }

  .dashboard {
    display: flex;
    height: 100vh;
    padding: 1rem;
    gap: 1rem;
    box-sizing: border-box;
  }

  .main-panel {
    flex: 2; /* Takes 2/3 of the screen */
    background: white;
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 1rem;
    overflow: auto;
  }

  .sidebar {
    flex: 1; /* Takes 1/3 of the screen */
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .widget-container, .classifiers-container {
    background: white;
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 1rem;
  }

  .classifiers-container {
    flex-grow: 1; /* Takes remaining space in the sidebar */
    overflow-y: auto;
  }
</style>