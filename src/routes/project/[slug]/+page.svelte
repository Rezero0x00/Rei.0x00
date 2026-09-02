<script>
  // ---------------------------------------------------------------------
  // PROJECT DETAIL / BLOG PAGE — src/routes/project/[slug]/+page.svelte
  //
  // Data-driven via `data.project` (see the sibling +page.js loader).
  // Body is a flexible `project.blocks` array, one {#if} branch per type.
  // Supported block types: heading, paragraph, link, image, gallery,
  // formula, table, quote.
  //
  // Image / gallery blocks render a dashed placeholder box automatically
  // whenever `src` is empty — fill in the real path later and it swaps
  // to the actual <img> with no other changes needed.
  //
  // ASPECT RATIO: every image-like block accepts an optional `aspect`
  // field, e.g. "aspect": "4/3" or "aspect": "1/1". If omitted it falls
  // back to 16/9 for `image` blocks and 1/1 for images inside `gallery`.
  // Same idea for the cover image via `project.coverAspect` (default 21/9).
  //
  // PARAGRAPH WIDTH: paragraphs now stretch to the full article width
  // (same as the images above them) instead of being capped at 66ch,
  // and use justified alignment (`.paragraph-justify`) with `hyphens: auto`
  // so the wider column doesn't produce uneven word-spacing gaps.
  //
  // LINK BLOCK: { "type": "link", "text": "Lihat kode di GitHub", "url": "https://..." }
  // Renders as a clickable pill/card that opens in a new tab.
  // ---------------------------------------------------------------------
  let { data } = $props();
  const project = data.project;
</script>

<div class="min-h-screen text-[var(--text)] font-sans">
  <header class="topbar border-b border-[var(--border)]/70">
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
      <div class="flex flex-wrap items-center gap-2.5 mb-5 font-mono text-[11px] uppercase tracking-wide text-[var(--text-dim)]">
        <span class="pill">{project.category}</span>
        <span>{project.date}</span>
      </div>
      <h1 class="font-display font-bold text-[2.5rem] sm:text-[2.75rem] leading-[1.12] tracking-tight mb-5">{project.title}</h1>
      {#if project.excerpt}
        <p class="text-[var(--text-dim)] leading-relaxed text-[17px] max-w-[62ch] mb-6">{project.excerpt}</p>
      {/if}
      <div class="flex flex-wrap gap-2">
        {#each project.tags as tag}
          <span class="font-mono text-[11px] px-2.5 py-1 rounded-full border border-[var(--border)] text-[var(--text-dim)]">{tag}</span>
        {/each}
      </div>
    </header>

    {#if project.coverImage}
      <figure class="mb-14">
        <img
          src={project.coverImage}
          alt={project.title}
          class="w-full rounded-lg border border-[var(--border)] object-cover"
          style="aspect-ratio: {project.coverAspect ?? '21/9'};"
        />
      </figure>
    {/if}

    <!-- BLOCKS -->
    <div class="flex flex-col gap-10">
      {#each project.blocks as block}
        {#if block.type === 'heading'}
          <svelte:element
            this={block.level === 3 ? 'h3' : 'h2'}
            class={block.level === 3
              ? 'font-mono font-semibold text-xs uppercase tracking-widest text-[var(--text)] -mb-3'
              : 'block-heading font-display font-semibold text-[1.55rem] tracking-tight pt-2 -mb-4'}
          >
            {block.text}
          </svelte:element>

        {:else if block.type === 'paragraph'}
          <p class="paragraph-justify text-[var(--text-dim)] leading-[1.8] text-[16px] -mt-6">{block.text}</p>

        {:else if block.type === 'link'}
          <a
            href={block.url}
            target="_blank"
            rel="noopener noreferrer"
            class="link-card -mt-6"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
            <span>{block.text}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="link-arrow"><path d="M7 17L17 7M17 7H7M17 7V17"/></svg>
          </a>

        {:else if block.type === 'image'}
          <figure>
            {#if block.src}
              <img
                src={block.src}
                alt={block.alt ?? block.caption ?? project.title}
                class="w-full rounded-lg border border-[var(--border)] object-cover"
                style="aspect-ratio: {block.aspect ?? '16/9'};"
              />
            {:else}
              <div class="img-box" style="aspect-ratio: {block.aspect ?? '16/9'};">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                <span class="img-tag">image</span>
              </div>
            {/if}
            {#if block.caption}
              <figcaption class="font-mono text-xs text-[var(--text-faint)] mt-2.5 text-center leading-relaxed">{block.caption}</figcaption>
            {/if}
          </figure>

        {:else if block.type === 'gallery'}
          <div>
            <div
              class="grid gap-2.5"
              style="grid-template-columns: repeat({Math.min(block.images.length, 3)}, minmax(0, 1fr));"
            >
              {#each block.images as img}
                {#if img.src}
                  <img
                    src={img.src}
                    alt={img.caption ?? project.title}
                    class="w-full h-full rounded-lg border border-[var(--border)] object-cover"
                    style="aspect-ratio: {img.aspect ?? '1/1'};"
                  />
                {:else}
                  <div class="img-box" style="aspect-ratio: {img.aspect ?? '1/1'};">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                    <span class="img-tag">image</span>
                  </div>
                {/if}
              {/each}
            </div>
            {#if block.caption}
              <p class="font-mono text-xs text-[var(--text-faint)] mt-2.5 text-center leading-relaxed">{block.caption}</p>
            {/if}
          </div>

        {:else if block.type === 'formula'}
          <div class="formula-box">
            <p class="font-mono text-[15px] text-center mb-2 text-[var(--accent)]">{block.value}</p>
            {#if block.note}
              <p class="font-mono text-[11.5px] text-[var(--text-faint)] text-center leading-relaxed">{block.note}</p>
            {/if}
          </div>

        {:else if block.type === 'table'}
          <div>
            <div class="table-scroll rounded-lg border border-[var(--border)] overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="bg-[var(--surface-2)] font-mono text-[11px] uppercase tracking-wide text-[var(--text-dim)] text-left">
                    {#each block.columns as col}
                      <th class="px-4 py-3 font-medium whitespace-nowrap">{col}</th>
                    {/each}
                  </tr>
                </thead>
                <tbody>
                  {#each block.rows as row, i}
                    <tr class="border-t border-[var(--border)] {i % 2 === 1 ? 'bg-white/[0.015]' : ''}">
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
          <blockquote class="border-l-2 border-[var(--accent)] pl-5 italic text-[var(--text-dim)] leading-[1.8] text-[16px]">
            {block.text}
          </blockquote>
        {/if}
      {/each}
    </div>

    <footer class="border-t border-[var(--border)]/70 pt-8 mt-16">
      <a href="/#project" class="inline-flex items-center gap-2 font-mono text-sm text-[var(--text-dim)] hover:text-[var(--text)] transition-colors">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        Back to Projects
      </a>
    </footer>
  </article>
</div>

<style>
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

  :global(:root) {
    --bg: #08080a;
    --surface: #0f1013;
    --surface-2: #15161b;
    --border: #1e2027;
    --text: #f2f2f4;
    --text-dim: #8b8d97;
    --text-faint: #4a4c54;
    --accent: #f2f2f4;
    --accent-dim: #3a3c44;
    color-scheme: dark;
  }
  :global(:root.theme-light) {
    --bg: #f6f6f8;
    --surface: #ffffff;
    --surface-2: #eeeef2;
    --border: #e3e3e8;
    --text: #14151a;
    --text-dim: #55575f;
    --text-faint: #8a8d98;
    --accent: #14151a;
    --accent-dim: #c7c8cf;
    color-scheme: light;
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

  .topbar {
    position: sticky;
    top: 0;
    background: color-mix(in srgb, var(--bg) 85%, transparent);
    backdrop-filter: blur(8px);
    z-index: 10;
  }

  .pill {
    padding: 5px 12px;
    border-radius: 999px;
    border: 1px solid var(--accent-dim);
    color: var(--accent);
  }

  /* small accent tick above h2-level headings */
  .block-heading {
    position: relative;
    border-top: 1px solid var(--border);
  }
  .block-heading::before {
    content: '';
    position: absolute;
    top: -1px;
    left: 0;
    width: 40px;
    height: 1px;
    background: var(--accent);
  }

  /* body paragraphs: full width, justified, with hyphenation so the
     wider column doesn't create uneven word-gaps like a narrow
     justified column would */
  .paragraph-justify {
    text-align: justify;
    text-justify: inter-word;
    hyphens: auto;
    -webkit-hyphens: auto;
  }

  /* clickable link block — small pill/card, opens in new tab */
  .link-card {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 12px 16px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 13.5px;
    color: var(--text);
    background: var(--surface);
    transition: border-color 0.15s ease, background 0.15s ease;
    width: fit-content;
    text-decoration: none;
  }
  .link-card:hover {
    border-color: var(--accent-dim);
    background: var(--surface-2);
  }
  .link-arrow {
    color: var(--text-faint);
    margin-left: 2px;
  }

  /* formula / readout block */
  .formula-box {
    border: 1px solid var(--border);
    border-left: 2px solid var(--accent);
    background: var(--surface);
    border-radius: 8px;
    padding: 22px 24px;
  }

  /* image placeholder box — used whenever a src is empty.
     aspect-ratio is set inline per-instance (see markup above),
     so no fixed ratio is declared here. */
  .img-box {
    width: 100%;
    border: 1px dashed var(--border);
    border-radius: 10px;
    background:
      repeating-linear-gradient(135deg, transparent, transparent 10px, rgba(255,255,255,0.02) 10px, rgba(255,255,255,0.02) 11px),
      var(--surface);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    color: var(--text-faint);
  }
  .img-tag {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--text-faint);
  }

  /* slim, modern horizontal scrollbar for wide tables */
  .table-scroll {
    scrollbar-width: thin;
    scrollbar-color: var(--border) transparent;
  }
  .table-scroll::-webkit-scrollbar {
    height: 6px;
  }
  .table-scroll::-webkit-scrollbar-track {
    background: transparent;
  }
  .table-scroll::-webkit-scrollbar-thumb {
    background: var(--border);
    border-radius: 999px;
  }
  .table-scroll::-webkit-scrollbar-thumb:hover {
    background: var(--text-faint);
  }
</style>