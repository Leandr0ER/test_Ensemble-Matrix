<script>
  import EnsembleMatrix from './lib/EnsembleMatrix.svelte';
  import LinearCombinationWidget from './lib/LinearCombinationWidget.svelte';
  import ComponentClassifiers from './lib/ComponentClassifiers.svelte';
</script>

<main class="dashboard">
  <header class="topbar">
    <span class="logo">⬡</span>
    <h1 class="title">Ensemble Matrix</h1>
  </header>

  <div class="content">
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
  </div>
</main>

<style>
  :global(body) {
    margin: 0;
    font-family: sans-serif;
    background-color: #f4f4f9;
  }

  .dashboard {
    display: flex;
    flex-direction: column;
    height: 100vh;
    box-sizing: border-box;
  }

  .topbar {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    background: #2c3e50;
    padding: 0.55rem 1.25rem;
    flex-shrink: 0;
  }

  .logo {
    font-size: 1.3rem;
    color: #3498db;
    line-height: 1;
  }

  .title {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 700;
    color: #ecf0f1;
    letter-spacing: 0.04em;
  }

  .content {
    display: flex;
    flex: 1;
    padding: 1rem;
    gap: 1rem;
    overflow: hidden;
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