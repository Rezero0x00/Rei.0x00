<script>
  // ---------------------------------------------------------------------
  // PROJECT DETAIL / BLOG PAGE — src/routes/project/[slug]/+page.svelte
  //
  // Data-driven via `data.project` (see the sibling +page.js loader).
  // Instead of fixed sections (abstract/materials/design/data/analysis),
  // the body is a flexible `project.blocks` array. Each block has a
  // `type` and is rendered by the matching branch below. Order and mix
  // of block types is entirely up to each project's JSON file, so one
  // project can be a single paragraph + one photo, another can be a
  // long narrative with a formula in the middle and a 3-photo gallery.
  //
  // Supported block types: heading, paragraph, image, gallery, formula,
  // table, quote. Add a new type by adding one more {#if} branch here —
  // it becomes available to every project automatically.
  // ---------------------------------------------------------------------
  let { data } = $props();
  const project = data.project;
</script>

<div class="min-h-screen text-[var(--text)] font-sans">
  <!-- simple top bar, no blur / scroll effects -->
  <header class="border-b border-[var(--border)]/70">
    <nav class="max-w-3xl mx-auto flex items-center justify-between px-6 h-16">
      <a href="/#project" class="flex items-center gap-2 font-mono text-sm text-[var(--text-dim)] hover:text-[var(--text)] transition-colors">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        Back to Projects
      </a>
      <span class="font-display font-bold text-lg tracking-tight">
        <span class="text-[var(--accent)]">Rei</span>.0x00
      </span>
    </nav>
  </header>

  <article class="max-w-3xl mx-auto px-6 py-16">
    <!-- JUDUL -->
    <header class="mb-14">
      <div class="flex flex-wrap items-center gap-3 mb-4 font-mono text-xs text-[var(--text-dim)]">
        <span class="px-3 py-1 rounded-full border border-[var(--border)]">{project.category}</span>
        <span>{project.date}</span>
        <span>·</span>
        <span>{project.role}</span>
      </div>
      <h1 class="font-display font-bold text-3xl sm:text-4xl leading-tight mb-5">{project.title}</h1>
      {#if project.excerpt}
        <p class="text-[var(--text-dim)] leading-relaxed mb-5">{project.excerpt}</p>
      {/if}
      <div class="flex flex-wrap gap-2">
        {#each project.tags as tag}
          <span class="font-mono text-[11px] px-2 py-1 rounded-full border border-[var(--border)] text-[var(--text-dim)]">{tag}</span>
        {/each}
      </div>
    </header>

    {#if project.coverImage}
      <img
        src={project.coverImage}
        alt={project.title}
        class="w-full rounded-xl border border-[var(--border)] object-cover mb-14"
      />
    {/if}

    <!-- BLOCKS — flexible body, order/mix defined per project in its JSON -->
    <div class="flex flex-col gap-10">
      {#each project.blocks as block}
        {#if block.type === 'heading'}
          <svelte:element
            this={block.level === 3 ? 'h3' : 'h2'}
            class={block.level === 3
              ? 'font-display font-semibold text-lg text-[var(--text-dim)]'
              : 'font-display font-semibold text-2xl'}
          >
            {block.text}
          </svelte:element>

        {:else if block.type === 'paragraph'}
          <p class="text-[var(--text-dim)] leading-relaxed -mt-6">{block.text}</p>

        {:else if block.type === 'image'}
          <figure>
            <img
              src={block.src}
              alt={block.alt ?? block.caption ?? project.title}
              class="w-full rounded-lg border border-[var(--border)] object-cover"
            />
            {#if block.caption}
              <figcaption class="font-mono text-xs text-[var(--text-faint)] mt-2 text-center">{block.caption}</figcaption>
            {/if}
          </figure>

        {:else if block.type === 'gallery'}
          <div>
            <div
              class="grid gap-3"
              style="grid-template-columns: repeat({Math.min(block.images.length, 3)}, minmax(0, 1fr));"
            >
              {#each block.images as img}
                <img
                  src={img.src}
                  alt={img.caption ?? project.title}
                  class="w-full h-full rounded-lg border border-[var(--border)] object-cover aspect-square"
                />
              {/each}
            </div>
            {#if block.caption}
              <p class="font-mono text-xs text-[var(--text-faint)] mt-2 text-center">{block.caption}</p>
            {/if}
          </div>

        {:else if block.type === 'formula'}
          <div class="rounded-lg border border-[var(--border)] bg-[var(--surface)]/40 px-5 py-4">
            <p class="font-mono text-sm text-center mb-2">{block.value}</p>
            {#if block.note}
              <p class="font-mono text-xs text-[var(--text-faint)] text-center">{block.note}</p>
            {/if}
          </div>

        {:else if block.type === 'table'}
          <div>
            <div class="rounded-lg border border-[var(--border)] overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="bg-[var(--surface)]/60 font-mono text-xs text-[var(--text-dim)] text-left">
                    {#each block.columns as col}
                      <th class="px-4 py-3 font-medium whitespace-nowrap">{col}</th>
                    {/each}
                  </tr>
                </thead>
                <tbody>
                  {#each block.rows as row, i}
                    <tr class="border-t border-[var(--border)] {i % 2 === 1 ? 'bg-[var(--surface)]/20' : ''}">
                      {#each row as cell}
                        <td class="px-4 py-3 font-mono text-xs whitespace-nowrap">{cell}</td>
                      {/each}
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
            {#if block.note}
              <p class="text-[var(--text-dim)] text-sm leading-relaxed mt-3">{block.note}</p>
            {/if}
          </div>

        {:else if block.type === 'quote'}
          <blockquote class="border-l-2 border-[var(--border)] pl-5 italic text-[var(--text-dim)] leading-relaxed">
            {block.text}
          </blockquote>
        {/if}
      {/each}
    </div>

    <footer class="border-t border-[var(--border)]/70 pt-8 mt-14">
      <a href="/#project" class="inline-flex items-center gap-2 font-mono text-sm text-[var(--text-dim)] hover:text-[var(--text)] transition-colors">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        Back to Projects
      </a>
    </footer>
  </article>
</div>

<style>
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

  /* Same monochrome variables as the main page, dark by default.
     No theme toggle here — keep this page static and simple. */
  :global(:root) {
    --bg: #030304;
    --surface: #0a0a0d;
    --border: #1a1b21;
    --text: #f2f2f4;
    --text-dim: #85878f;
    --text-faint: #46474e;
    --accent: #ffffff;
    color-scheme: dark;
  }
  :global(html),
  :global(body) {
    background-color: var(--bg);
  }
  :global(.font-display) {
    font-family: 'Space Grotesk', sans-serif;
  }
  :global(.font-mono) {
    font-family: 'JetBrains Mono', monospace;
  }
  :global(.font-sans) {
    font-family: 'Inter', sans-serif;
  }
</style>