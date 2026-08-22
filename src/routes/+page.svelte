<script>
  import { onMount } from 'svelte';

  // ---------------------------------------------------------------------
  // THEME: dark / light toggle (dropdown in navbar)
  // ---------------------------------------------------------------------
  let theme = $state('dark');
  let themeMenuOpen = $state(false);
  let mobileMenuOpen = $state(false);

  function applyTheme(next) {
    theme = next;
    document.documentElement.classList.toggle('theme-light', next === 'light');
    try {
      localStorage.setItem('portfolio-theme', next);
    } catch (e) {
      /* ignore (private browsing, etc.) */
    }
    themeMenuOpen = false;
  }

  function handleWindowClick(e) {
    if (themeMenuOpen && !e.target.closest('.theme-switcher')) {
      themeMenuOpen = false;
    }
    if (mobileMenuOpen && !e.target.closest('.mobile-menu-wrap')) {
      mobileMenuOpen = false;
    }
  }

  // ---------------------------------------------------------------------
  // SCROLL REVEAL — lightweight IntersectionObserver action.
  // Elements fade + rise into place the first time they enter the viewport.
  // Respects prefers-reduced-motion (see the CSS media query below too).
  // ---------------------------------------------------------------------
  function reveal(node, params = {}) {
    const delay = params?.delay ?? 0;
    node.classList.add('reveal');
    node.style.transitionDelay = `${delay}ms`;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      node.classList.add('reveal-visible');
      return {};
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          entry.target.classList.toggle('reveal-visible', entry.isIntersecting);
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    );
    observer.observe(node);

    return {
      destroy() {
        observer.disconnect();
      },
    };
  }

  // ---------------------------------------------------------------------
  // WIREFRAME ICOSPHERE (hero background) — real icosahedron, subdivided
  // once for a denser triangulated look, projected to 2D orthographically.
  // ---------------------------------------------------------------------
  function buildSphereEdges() {
    const PHI = (1 + Math.sqrt(5)) / 2;
    const rawVerts = [
      [-1, PHI, 0], [1, PHI, 0], [-1, -PHI, 0], [1, -PHI, 0],
      [0, -1, PHI], [0, 1, PHI], [0, -1, -PHI], [0, 1, -PHI],
      [PHI, 0, -1], [PHI, 0, 1], [-PHI, 0, -1], [-PHI, 0, 1],
    ];
    const faceIdx = [
      [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
      [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
      [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
      [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1],
    ];

    const normalize = ([x, y, z]) => {
      const len = Math.sqrt(x * x + y * y + z * z);
      return [x / len, y / len, z / len];
    };
    const midpoint = (a, b) => normalize([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2]);

    const verts = rawVerts.map(normalize);
    let faces = faceIdx.map((f) => f.map((i) => verts[i]));

    // subdivide once: 20 faces -> 80 faces, for a denser geodesic look
    faces = faces.flatMap(([a, b, c]) => {
      const ab = midpoint(a, b);
      const bc = midpoint(b, c);
      const ca = midpoint(c, a);
      return [
        [a, ab, ca],
        [b, bc, ab],
        [c, ca, bc],
        [ab, bc, ca],
      ];
    });

    // rotate to a nice 3/4 viewing angle
    const ax = 0.35;
    const ay = 0.55;
    const rotate = ([x, y, z]) => {
      const y1 = y * Math.cos(ax) - z * Math.sin(ax);
      const z1 = y * Math.sin(ax) + z * Math.cos(ax);
      const x2 = x * Math.cos(ay) + z1 * Math.sin(ay);
      const z2 = -x * Math.sin(ay) + z1 * Math.cos(ay);
      return [x2, y1, z2];
    };

    // dedupe edges by rounded coordinate key
    const key = (p) => `${p[0].toFixed(3)},${p[1].toFixed(3)},${p[2].toFixed(3)}`;
    const seen = new Set();
    const edges = [];
    for (const face of faces) {
      for (let i = 0; i < 3; i++) {
        const a = face[i];
        const b = face[(i + 1) % 3];
        const ka = key(a);
        const kb = key(b);
        const edgeKey = ka < kb ? `${ka}|${kb}` : `${kb}|${ka}`;
        if (!seen.has(edgeKey)) {
          seen.add(edgeKey);
          edges.push([a, b]);
        }
      }
    }

    const R = 155;
    const CX = 200;
    const CY = 200;
    return edges.map(([a, b]) => {
      const ra = rotate(a);
      const rb = rotate(b);
      const avgZ = (ra[2] + rb[2]) / 2;
      return {
        x1: CX + ra[0] * R,
        y1: CY - ra[1] * R,
        x2: CX + rb[0] * R,
        y2: CY - rb[1] * R,
        opacity: 0.1 + ((avgZ + 1) / 2) * 0.28,
      };
    });
  }

  const sphereEdges = buildSphereEdges();

  // ---------------------------------------------------------------------
  // PROFILE — synced with resume
  // ---------------------------------------------------------------------
  const profile = {
    name: 'Muhammad Raihan Alifiandra',
    role: 'Electronics Engineering Technology Student',
    tagline: 'An instrumentation, control systems, electronics, and electrical enthusiast, with a focus on turning raw sensor data into precise, automated action.',
    resumeUrl: '#',
    githubUrl: 'https://github.com/rezero0x00',
    linkedinUrl: 'https://www.linkedin.com/in/muhammad-raihan-alifiandra-2332b9417/',
    email: 'raihan24trse@mahasiswa.pcr.ac.id',
    phone: '087741174222',
    // replace with your own photo path (square, ideally 1:1), e.g. '/images/profile.jpg'
    photoUrl: '/images/rei.jpg',
  };

  const about = {
    heading: 'An engineering student focused on instrumentation, control, and embedded systems.',
    paragraphs: [
      "A 5th-semester Electronics Engineering student at Politeknik Caltex Riau, specializing in instrumentation and control systems. I design closed-loop control systems, develop PID and fuzzy logic controllers, and calibrate sensors to ensure precise measurement in industrial and laboratory environments.",
      "I implement these systems on Arduino and ESP32, utilizing industrial communication protocols such as Modbus RTU/RS-485 and MQTT for reliable data acquisition and control, and integrate the resulting data into real-time monitoring platforms using LabVIEW, Python, and Node.js/TypeScript.",
    ],
    focusAreas: ['Instrumentation', 'Control Systems', 'Embedded Systems', 'IoT Protocols'],
  };

  const stats = [
    { label: 'Semester', value: '5th' },
    { label: 'GPA', value: '3.79/4.00' },
    { label: 'Major Projects', value: '4+' },
    { label: 'Organizations', value: '2' },
  ];

  // ---------------------------------------------------------------------
  // SKILLS — grouped by domain, synced with resume
  // Order: Instrumentation & Control -> Embedded Systems & Communication
  // Protocols (merged, since they go together) -> Programming -> Tools ->
  // Soft Skills (trimmed to the most relevant ones).
  // ---------------------------------------------------------------------
  const skillGroups = [
    { title: 'Instrumentation', icon: 'gauge', items: ['Sensor Calibration', 'Signal Conditioning', 'Data Acquisition'] },
    { title: 'Control', icon: 'loop', items: ['PID Control','Fuzzy Logic', 'Closed-Loop Feedback', 'Control System Design'] },
    { title: 'Embedded Systems', icon: 'chip', items: ['Arduino', 'ESP32', 'Raspberry Pi', 'UART', 'I2C', 'SPI', 'Modbus RTU/RS-485', 'MQTT'] },
    { title: 'Programming', icon: 'code', items: ['C/C++', 'Python', 'TypeScript', 'MySQL', 'SQLite'] },
    { title: 'Tools & Software', icon: 'wrench', items: ['LabVIEW', 'Multisim', 'MATLAB', 'Arduino IDE', 'Visual Studio Code', 'GitHub'] },
    { title: 'Soft Skills', icon: 'users', items: ['Leadership', 'Communication', 'Critical & Analytical Thinking', 'Teamwork'] },
  ];

  const skillIcons = {
    gauge: 'M12 3a9 9 0 1 0 6.36 15.36M12 12 8.5 15.5M12 12V7',
    loop: 'M17 2.1l4 4-4 4|M3 12.2v-2a4 4 0 0 1 4-4h12.8|M7 21.9l-4-4 4-4|M21 11.8v2a4 4 0 0 1-4 4H4.2',
    chip: 'M7 7h10v10H7z|M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3',
    link: 'M8 8H6.5a4.5 4.5 0 1 0 0 9H8|M16 8h1.5a4.5 4.5 0 1 1 0 9H16|M8.5 12.5h7',
    code: 'M9.5 7 4 12.5 9.5 18|M14.5 7 20 12.5 14.5 18',
    wrench: 'M14.7 6.3a4 4 0 0 1 1 4l4.3 4.3-2.4 2.4L13.3 12.7a4 4 0 0 1-4-1L4 17l-1-1 5.7-5.3a4 4 0 0 1 6-4.4z',
    users: 'M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6z|M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6|M17 8.5a2.3 2.3 0 1 0 0-4.6 2.3 2.3 0 0 0 0 4.6z|M15.5 13.7c2.3.5 4.5 2.4 4.5 6.3',
  };

  // ---------------------------------------------------------------------
  // EDUCATION — synced with resume
  // ---------------------------------------------------------------------
  const education = [
    {
      school: 'Politeknik Caltex Riau',
      location: 'Pekanbaru, Riau, Indonesia',
      date: 'Sep 2024 — Aug 2028 (Expected)',
      degree: 'Bachelor of Electronics Engineering',
      score: 'GPA 3.79 / 4.00',
      points: [
        'Coursework: Instrumentation, PLC, Control Systems, Electrical Circuit Analysis',
        'Research Assistant of IoMT & AI-Based Arrhythmia Monitoring System (data collection assistant)',
        'PKM — Digital Prayer Schedule Display System on Raspberry Pi, Masjid Baitul Maqdis (Electronics Technician)',
        'Robotics Training Instructor for P5 Program at SMAN 17 Pekanbaru',
      ],
    },
    {
      school: 'SMAN 2 Balikpapan',
      location: 'Balikpapan, Kalimantan Timur, Indonesia',
      date: 'Sep 2020 — Aug 2023',
      degree: 'High School Diploma in Science',
      score: '90.00 / 100.00',
      points: [
        'Documentation Staff, Mathematics Enthusiast Community',
        'Member, Islamic Student Organization (Rohis)',
      ],
    },
  ];

  const categories = ['All', 'Instrumentation', 'Control System', 'Embedded', 'Analog'];
  let activeCategory = $state('All');
  let visibleCount = $state(6);

  // href points to /blog/{slug} — the blog pages don't exist yet, this is just the link
  // NOTE: the first 4 are from the resume; the rest are placeholder examples —
  // swap in your own projects here.
  const projects = [
    { id: 1, title: 'Aero Pendulum', role: 'Control Systems Engineer', category: 'Control System', tags: ['PID Control', 'Embedded Firmware', 'Sensor Feedback'], slug: 'aero-pendulum' },
    { id: 2, title: 'Multi Stage Signal Conditioning', role: 'Full Stack Developer', category: 'Instrumentation', tags: ['Analog', 'Signal Conditioning', 'Amplifier'], slug: 'd' },
    { id: 3, title: 'Lab Environment Monitoring', role: 'Embedded & Backend Developer', category: 'Embedded', tags: ['TypeScript', 'MQTT', 'SQLite'], slug: 'lab-environment-monitoring' },
    { id: 4, title: 'Monostable NE555 Timer', role: 'Embedded Systems Developer', category: 'Analog', tags: ['Microcontroller', 'OLED', 'PCB Design'], slug: 'monostable-ne555-timer' },
    { id: 5, title: 'Project 1', role: 'Instrumentation Engineer', category: 'Instrumentation', tags: ['Modbus RTU', 'RS-485', 'Node.js'], slug: 'modbus-scada-data-bridge' },
    { id: 6, title: 'Project 2', role: 'Control Systems Engineer', category: 'Control System', tags: ['PID Control', 'IR Sensors', 'Arduino'], slug: 'line-following-robot' },
    { id: 7, title: 'Project 3', role: 'Embedded Systems Developer', category: 'Embedded', tags: ['ESP32', 'MQTT', 'WiFi'], slug: 'iot-weather-station' },
    { id: 8, title: 'Project 4', role: 'Analog Design', category: 'Analog', tags: ['Op-Amp', 'Filter Design', 'PCB'], slug: 'opamp-signal-conditioner' },
    { id: 9, title: 'Project 5', role: 'Control Systems Engineer', category: 'Control System', tags: ['PLC', 'Ladder Logic', 'Sensor Integration'], slug: 'plc-conveyor-sorting-system' },
  ];

  // reset the visible slice back to 6 whenever the category filter changes
  $effect(() => {
    activeCategory;
    visibleCount = 6;
  });

  let filteredProjects = $derived(
    activeCategory === 'All' ? projects : projects.filter((p) => p.category === activeCategory)
  );
  let visibleProjects = $derived(filteredProjects.slice(0, visibleCount));

  const navLinks = [
    { id: 'about', label: 'About' },
    { id: 'skill', label: 'Skills' },
    { id: 'education', label: 'Education' },
    { id: 'project', label: 'Projects' },
  ];

  // background stars for hero — each one falls slowly downward, fading
  // out as it goes, then loops back and reappears from the top.
  // Confined to the hero section only (see markup: rendered inside
  // #home with `absolute inset-0` instead of a viewport-wide `fixed` layer).
  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  const stars = Array.from({ length: 20 }, () => {
    const duration = rand(24, 42); // slower fall
    return {
      startTop: rand(-10, 15), // spawn near/above the top
      left: rand(0, 100),
      size: rand(1, 2.6),
      peakOpacity: rand(0.35, 0.85),
      dx: rand(-25, 25), // gentle horizontal sway while falling
      duration,
      delay: -rand(0, duration), // negative delay staggers stars mid-fall on load
    };
  });

  function scrollToId(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }

  // ---------------------------------------------------------------------
  // custom cursor: dot + short comet trail (no ring)
  // ---------------------------------------------------------------------
  let cursorDot;
  let trailCanvas;

  onMount(() => {
    let saved = null;
    try {
      saved = localStorage.getItem('portfolio-theme');
    } catch (e) {
      /* ignore */
    }
    const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    applyTheme(saved ?? (prefersLight ? 'light' : 'dark'));

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isFinePointer = window.matchMedia('(pointer: fine)').matches;
    if (reduceMotion || !isFinePointer) return;

    document.body.classList.add('custom-cursor-active');

    let points = [];
    let active = false;

    const ctx = trailCanvas.getContext('2d');

    const resize = () => {
      trailCanvas.width = window.innerWidth;
      trailCanvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const onMove = (e) => {
      active = true;
      cursorDot.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      points.push({ x: e.clientX, y: e.clientY });
      if (points.length > 14) points.shift();
    };
    window.addEventListener('mousemove', onMove);

    // clear the trail immediately when the cursor leaves the window or the
    // tab loses focus, so it never gets stuck mid-stroke
    const clearTrail = () => {
      active = false;
      points = [];
      ctx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);
    };
    window.addEventListener('mouseleave', clearTrail);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) clearTrail();
    });

    let raf;
    let shrinkTimer;
    const loop = () => {
      ctx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);
      const trailRgb = theme === 'light' ? '20, 21, 26' : '233, 234, 238';
      for (let i = 1; i < points.length; i++) {
        const p0 = points[i - 1];
        const p1 = points[i];
        const alpha = i / points.length;
        ctx.strokeStyle = `rgba(${trailRgb}, ${alpha * 0.45})`;
        ctx.lineWidth = alpha * 2.2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.stroke();
      }
      raf = requestAnimationFrame(loop);
    };
    loop();

    // trail fades out on its own when the mouse stops moving
    shrinkTimer = setInterval(() => {
      if (points.length > 0) points.shift();
    }, 45);

    return () => {
      cancelAnimationFrame(raf);
      clearInterval(shrinkTimer);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mouseleave', clearTrail);
      document.body.classList.remove('custom-cursor-active');
    };
  });
</script>

<svelte:window onclick={handleWindowClick} />

<!-- custom cursor layers -->
<canvas bind:this={trailCanvas} class="trail-canvas" aria-hidden="true"></canvas>
<div bind:this={cursorDot} class="cursor-dot" aria-hidden="true"></div>

<div class="min-h-screen text-[var(--text)] font-sans selection:bg-[var(--accent)]/30 selection:text-[var(--text)] relative z-10">
  <!-- NAV -->
  <header class="mobile-menu-wrap fixed top-0 inset-x-0 z-40 border-b border-[var(--border)]/70 bg-[var(--bg)]/70 backdrop-blur">
    <nav class="max-w-6xl mx-auto flex items-center justify-between px-6 h-16">
      <button class="cursor-hover flex items-center gap-2 font-display font-bold text-base tracking-tight" onclick={() => scrollToId('home')}>
        <span class="relative flex h-2 w-2">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-60"></span>
          <span class="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent)]"></span>
        </span>
        <span class="text-[var(--accent)]">Rei.0x00</span>
      </button>
      <div class="flex items-center gap-8">
        <ul class="hidden sm:flex items-center gap-8 font-mono text-xs text-[var(--text-dim)]">
          {#each navLinks as link}
            <li>
              <button class="cursor-hover nav-link hover:text-[var(--text)] transition-colors" onclick={() => scrollToId(link.id)}>
                {link.label}
              </button>
            </li>
          {/each}
        </ul>

        <div class="theme-switcher relative">
          <button
            class="cursor-hover flex items-center gap-2 px-3 py-1.5 rounded-md border border-[var(--border)] hover:border-[var(--text)]/30 transition-colors text-xs font-mono text-[var(--text-dim)]"
            onclick={() => (themeMenuOpen = !themeMenuOpen)}
          >
            {#if theme === 'dark'}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"/></svg>
              Dark
            {:else}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
              Light
            {/if}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="transition-transform {themeMenuOpen ? 'rotate-180' : ''}"><path d="m6 9 6 6 6-6"/></svg>
          </button>

          {#if themeMenuOpen}
            <div class="absolute right-0 mt-2 w-32 rounded-md border border-[var(--border)] bg-[var(--surface)] py-1 shadow-lg">
              <button
                class="cursor-hover w-full flex items-center gap-2 px-3 py-2 text-xs font-mono text-left hover:bg-[var(--bg)] transition-colors {theme === 'dark' ? 'text-[var(--accent)]' : 'text-[var(--text-dim)]'}"
                onclick={() => applyTheme('dark')}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"/></svg>
                Dark
              </button>
              <button
                class="cursor-hover w-full flex items-center gap-2 px-3 py-2 text-xs font-mono text-left hover:bg-[var(--bg)] transition-colors {theme === 'light' ? 'text-[var(--accent)]' : 'text-[var(--text-dim)]'}"
                onclick={() => applyTheme('light')}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
                Light
              </button>
            </div>
          {/if}
        </div>

        <button
          class="cursor-hover sm:hidden flex items-center justify-center h-9 w-9 rounded-md border border-[var(--border)] text-[var(--text-dim)] hover:border-[var(--text)]/30 transition-colors"
          onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
          aria-label="Toggle menu"
          aria-expanded={mobileMenuOpen}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            {#if mobileMenuOpen}
              <path d="M6 6l12 12M18 6 6 18" />
            {:else}
              <path d="M4 7h16M4 12h16M4 17h16" />
            {/if}
          </svg>
        </button>
      </div>
    </nav>

    {#if mobileMenuOpen}
      <div class="sm:hidden border-t border-[var(--border)]/70 bg-[var(--bg)]">
        <ul class="max-w-6xl mx-auto px-6 py-4 flex flex-col gap-1 font-mono text-xs text-[var(--text-dim)]">
          {#each navLinks as link}
            <li>
              <button
                class="cursor-hover w-full text-left py-2.5 hover:text-[var(--text)] transition-colors"
                onclick={() => {
                  mobileMenuOpen = false;
                  scrollToId(link.id);
                }}
              >
                {link.label}
              </button>
            </li>
          {/each}
        </ul>
      </div>
    {/if}
  </header>

  <!-- HOME / HERO -->
  <section id="home" class="relative overflow-hidden min-h-screen flex items-center pt-16">
    <!-- stars: confined to the hero section only, falls behind the content
         and gets clipped by this section's own overflow-hidden -->
    <div class="absolute inset-0 pointer-events-none z-0">
      {#each stars as s}
        <span
          class="absolute rounded-full bg-[var(--text)] star-fall"
          style="
            top:{s.startTop}%; left:{s.left}%; width:{s.size}px; height:{s.size}px;
            --dx:{s.dx}px; --peak-o:{s.peakOpacity};
            animation-duration: {s.duration}s;
            animation-delay: {s.delay}s;
          "
        ></span>
      {/each}
    </div>

    <div class="relative max-w-6xl mx-auto px-6 w-full">
      <!-- wireframe icosphere — kept inside the same centered container as the
           text so it stays balanced instead of hanging off the screen edge -->
      <div class="absolute right-0 top-1/2 -translate-y-1/2 w-[480px] h-[480px] opacity-60 pointer-events-none hidden md:block">
        <svg viewBox="0 0 400 400" class="w-full h-full sphere-wire">
          <circle cx="200" cy="200" r="155" fill="none" style="stroke: var(--text-dim); stroke-opacity: 0.15;" stroke-width="0.6" />
          {#each sphereEdges as e}
            <line x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} style="stroke: var(--text); stroke-opacity: {e.opacity};" stroke-width="0.6" />
          {/each}
        </svg>
      </div>

      <!-- small floating outline circle, decorative -->
      <div class="absolute right-[22%] top-[10%] w-9 h-9 rounded-full border border-[var(--text-dim)]/40 pointer-events-none hidden md:block float-circle"></div>

      <p class="font-mono text-xs text-[var(--accent)] mb-4 hero-in" style="animation-delay: 0ms">Hello world;</p>
      <h1 class="font-display font-bold text-3xl sm:text-5xl md:text-6xl leading-[1.1] sm:leading-[1.05] mb-4 hero-in" style="animation-delay: 80ms">{profile.name}</h1>
      <p class="text-lg text-[var(--text-dim)] mb-3 hero-in" style="animation-delay: 160ms">{profile.role}</p>
      <p class="max-w-xl text-sm text-[var(--text-dim)]/90 mb-10 leading-relaxed hero-in" style="animation-delay: 240ms">{profile.tagline}</p>

      <div class="flex flex-wrap gap-3 mb-16 hero-in" style="animation-delay: 320ms">
        <a href={profile.resumeUrl} class="cursor-hover flex items-center gap-2 px-4 py-2 rounded-md bg-[var(--text)] text-[var(--bg)] transition-all duration-200 hover:opacity-85 hover:-translate-y-0.5 text-xs font-mono font-medium">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
          Resume
        </a>
        <a href={profile.githubUrl} target="_blank" rel="noreferrer" class="cursor-hover flex items-center gap-2 px-4 py-2 rounded-md border border-[var(--border)] transition-all duration-200 hover:border-[var(--text)]/40 hover:bg-[var(--surface)] hover:-translate-y-0.5 text-xs font-mono">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5C5.73.5.98 5.24.98 11.52c0 5.02 3.26 9.28 7.78 10.78.57.1.78-.25.78-.55v-2.1c-3.17.69-3.84-1.34-3.84-1.34-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.14.08 1.75 1.17 1.75 1.17 1.02 1.75 2.68 1.24 3.33.95.1-.74.4-1.24.72-1.53-2.53-.29-5.2-1.27-5.2-5.65 0-1.25.44-2.27 1.17-3.07-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.14 1.17a10.8 10.8 0 0 1 5.72 0c2.18-1.48 3.14-1.17 3.14-1.17.62 1.58.23 2.75.11 3.04.73.8 1.17 1.82 1.17 3.07 0 4.39-2.68 5.36-5.22 5.64.41.36.77 1.07.77 2.15v3.19c0 .3.21.66.79.55 4.51-1.51 7.77-5.77 7.77-10.79C23.02 5.24 18.27.5 12 .5z"/></svg>
          GitHub
        </a>
        <a href={profile.linkedinUrl} target="_blank" rel="noreferrer" class="cursor-hover flex items-center gap-2 px-4 py-2 rounded-md border border-[var(--border)] transition-all duration-200 hover:border-[var(--text)]/40 hover:bg-[var(--surface)] hover:-translate-y-0.5 text-xs font-mono">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.15 1.45-2.15 2.94v5.67H9.35V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.59 0 4.25 2.36 4.25 5.44zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56z"/></svg>
          LinkedIn
        </a>
        <a href="mailto:{profile.email}" class="cursor-hover flex items-center gap-2 px-4 py-2 rounded-md border border-[var(--border)] transition-all duration-200 hover:border-[var(--text)]/40 hover:bg-[var(--surface)] hover:-translate-y-0.5 text-xs font-mono">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 6-10 7L2 6"/></svg>
          Email
        </a>
      </div>

      <button class="cursor-hover flex items-center gap-2 font-mono text-[11px] tracking-widest text-[var(--text-dim)] hover:text-[var(--text)] transition-colors hero-in" style="animation-delay: 400ms" onclick={() => scrollToId('about')}>
        <svg class="animate-bounce" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
        SCROLL DOWN
      </button>
    </div>
  </section>

  <!-- ABOUT -->
  <section id="about" class="border-t border-[var(--border)]/70 py-20 sm:py-28">
    <div class="max-w-6xl mx-auto px-6 grid md:grid-cols-[300px_1fr] gap-14">
      <!-- photo column: square frame, quick facts sit underneath -->
      <div class="flex flex-col gap-6" use:reveal>
        <div class="relative aspect-square w-full max-w-[300px] rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden cursor-hover">
          {#if profile.photoUrl}
            <img src={profile.photoUrl} alt={profile.name} class="w-full h-full object-cover" />
          {:else}
            <div class="w-full h-full flex flex-col items-center justify-center gap-2 text-[var(--text-faint)]">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 15-4.5-4.5a2 2 0 0 0-2.8 0L5 19"/></svg>
              <span class="font-mono text-[10px] text-center px-6 leading-relaxed">Set profile.photoUrl<br />to your own photo path</span>
            </div>
          {/if}
        </div>

        <div>
          <p class="font-mono text-xs text-[var(--accent)] mb-4">01 — About</p>
          <dl class="flex flex-col gap-3 font-mono text-[11px] text-[var(--text-dim)]">
            <div class="flex items-center gap-2">
              <svg class="shrink-0 text-[var(--text-faint)]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2 2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
              <span>Politeknik Caltex Riau</span>
            </div>
            <div class="flex items-center gap-2">
              <svg class="shrink-0 text-[var(--text-faint)]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 21s-7-5.33-7-11a7 7 0 0 1 14 0c0 5.67-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>
              <span>Pekanbaru, Riau, Indonesia</span>
            </div>
            <div class="flex items-center gap-2">
              <svg class="shrink-0 text-[var(--text-faint)]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
              <span>Open to Work / Internship</span>
            </div>
          </dl>
        </div>
      </div>

      <div use:reveal={{ delay: 100 }}>
        <h2 class="font-display font-bold text-2xl sm:text-3xl leading-tight mb-6">{about.heading}</h2>
        {#each about.paragraphs as p}
          <p class="paragraph-justify text-sm text-[var(--text-dim)] leading-relaxed mb-5">{p}</p>
        {/each}

        <div class="flex flex-wrap gap-2 mt-8 mb-10">
          {#each about.focusAreas as area}
            <span class="font-mono text-[11px] px-3 py-1.5 rounded-full border border-[var(--border)] text-[var(--text)]/90">{area}</span>
          {/each}
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {#each stats as s, i}
            <div class="rounded-lg border border-[var(--border)] px-4 py-4 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--accent)]/40" use:reveal={{ delay: 150 + i * 60 }}>
              <p class="font-display font-bold text-xl">{s.value}</p>
              <p class="font-mono text-[11px] text-[var(--text-dim)] mt-1">{s.label}</p>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </section>

  <!-- SKILLS -->
  <section id="skill" class="border-t border-[var(--border)]/70 py-20 sm:py-28">
    <div class="max-w-6xl mx-auto px-6">
      <p class="font-mono text-xs text-[var(--accent)] mb-3" use:reveal>02 — Skills</p>
      <h2 class="font-display font-bold text-3xl mb-14" use:reveal={{ delay: 60 }}>Skills</h2>

      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {#each skillGroups as group, i}
          <div
            class="skill-card group rounded-2xl border border-[var(--border)] bg-[var(--surface)]/40 p-6 transition-all duration-300 hover:border-[var(--accent)]/40 hover:bg-[var(--surface)] hover:-translate-y-1"
            use:reveal={{ delay: i * 70 }}
          >
            <div class="flex items-center gap-3 mb-5">
              <span class="flex items-center justify-center h-10 w-10 shrink-0 rounded-xl border border-[var(--border)] text-[var(--text-dim)] transition-colors group-hover:text-[var(--accent)] group-hover:border-[var(--accent)]/40">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                  {#each skillIcons[group.icon].split('|') as d}
                    <path d={d} />
                  {/each}
                </svg>
              </span>
              <p class="font-mono text-[11px] text-[var(--text-dim)] tracking-widest leading-tight">{group.title.toUpperCase()}</p>
            </div>
            <div class="flex flex-wrap gap-2">
              {#each group.items as item}
                <span class="font-mono text-[11px] px-3 py-1.5 rounded-full bg-[var(--bg)] border border-[var(--border)] text-[var(--text)]/90 transition-colors hover:border-[var(--accent)]/50 hover:text-[var(--accent)]">{item}</span>
              {/each}
            </div>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- EDUCATION -->
  <section id="education" class="border-t border-[var(--border)]/70 py-20 sm:py-28">
    <div class="max-w-6xl mx-auto px-6">
      <p class="font-mono text-xs text-[var(--accent)] mb-3" use:reveal>03 — Education</p>
      <h2 class="font-display font-bold text-3xl mb-14" use:reveal={{ delay: 60 }}>Education</h2>

      <div class="flex flex-col gap-14">
        {#each education as edu, i}
          <div class="grid md:grid-cols-[300px_1fr] gap-6 md:gap-14 border-t border-[var(--border)] pt-8" use:reveal={{ delay: i * 100 }}>
            <!-- date / location sidebar, mirrors the About photo column width -->
            <div class="flex flex-col gap-2">
              <p class="font-mono text-[11px] text-[var(--text-faint)]">{String(i + 1).padStart(2, '0')}</p>
              <p class="font-mono text-[11px] text-[var(--text-dim)] flex items-center gap-2">
                <span class="inline-flex h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--text)]"></span>
                {edu.date}
              </p>
              <p class="font-mono text-[11px] text-[var(--text-faint)]">{edu.location}</p>
              <p class="font-mono text-[11px] text-[var(--accent)] mt-1">{edu.score}</p>
            </div>

            <div>
              <h3 class="font-display font-semibold text-lg mb-1">{edu.degree}</h3>
              <p class="text-xs text-[var(--text-dim)] mb-5">{edu.school}</p>
              <ul class="flex flex-col gap-2">
                {#each edu.points as pt}
                  <li class="flex gap-2 text-xs text-[var(--text-dim)] leading-relaxed">
                    <span class="mt-2 h-1 w-1 shrink-0 rounded-full bg-[var(--text-faint)]"></span>
                    {pt}
                  </li>
                {/each}
              </ul>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- PROJECT -->
  <section id="project" class="border-t border-[var(--border)]/70 py-20 sm:py-28">
    <div class="max-w-6xl mx-auto px-6">
      <p class="font-mono text-xs text-[var(--accent)] mb-3" use:reveal>04 — Project</p>
      <h2 class="font-display font-bold text-3xl mb-4" use:reveal={{ delay: 60 }}>Projects</h2>
      <p class="text-sm text-[var(--text-dim)] max-w-xl mb-10" use:reveal={{ delay: 100 }}>A collection of things I've built along the way.</p>

      <div class="flex flex-wrap gap-2 mb-10" use:reveal={{ delay: 140 }}>
        {#each categories as cat}
          <button
            class="cursor-hover font-mono text-[11px] px-4 py-2 rounded-full border transition-all duration-200
              {activeCategory === cat ? 'bg-[var(--text)] text-[var(--bg)] border-[var(--text)]' : 'border-[var(--border)] text-[var(--text-dim)] hover:text-[var(--text)] hover:border-[var(--text)]/40'}"
            onclick={() => (activeCategory = cat)}
          >
            {cat}
          </button>
        {/each}
      </div>

      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {#each visibleProjects as project, i (project.id)}
          <a
            href="/project/{project.slug}"
            class="cursor-hover group rounded-2xl border border-[var(--border)] bg-[var(--surface)]/40 p-6 flex flex-col justify-between transition-all duration-300 hover:border-[var(--accent)]/50 hover:bg-[var(--surface)] hover:-translate-y-1.5 hover:shadow-lg"
            use:reveal={{ delay: (i % 6) * 80 }}
          >
            <div class="flex items-start justify-between mb-6">
              <span class="font-mono text-[11px] text-[var(--text-faint)]">{String(project.id).padStart(2, '0')}</span>
              <svg class="text-[var(--text-dim)] transition-transform duration-300 group-hover:text-[var(--accent)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M7 17 17 7M8 7h9v9"/></svg>
            </div>
            <div>
              <h3 class="font-display font-semibold text-base mb-1">{project.title}</h3>
              <p class="text-xs text-[var(--text-dim)] mb-4">{project.role}</p>
              <div class="flex flex-wrap gap-2">
                {#each project.tags as tag}
                  <span class="font-mono text-[10px] px-2 py-1 rounded-full border border-[var(--border)] text-[var(--text-dim)]">{tag}</span>
                {/each}
              </div>
            </div>
          </a>
        {/each}
      </div>

      {#if filteredProjects.length > visibleCount}
        <div class="flex justify-center mt-10">
          <button
            class="cursor-hover flex items-center gap-2 px-5 py-2.5 rounded-full border border-[var(--border)] text-xs font-mono text-[var(--text-dim)] transition-all duration-200 hover:text-[var(--text)] hover:border-[var(--text)]/40 hover:-translate-y-0.5"
            onclick={() => (visibleCount = filteredProjects.length)}
          >
            Show More
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
          </button>
        </div>
      {/if}
    </div>
  </section>

  <!-- FOOTER -->
  <footer class="border-t border-[var(--border)]/70 py-10">
    <div class="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
      <p class="font-mono text-[11px] text-[var(--text-faint)]">© {new Date().getFullYear()} {profile.name}. All rights reserved.</p>
      <div class="flex gap-5 font-mono text-[11px] text-[var(--text-dim)]">
        <a class="cursor-hover hover:text-[var(--text)] transition-colors" href={profile.githubUrl} target="_blank" rel="noreferrer">GitHub</a>
        <a class="cursor-hover hover:text-[var(--text)] transition-colors" href={profile.linkedinUrl} target="_blank" rel="noreferrer">LinkedIn</a>
        <a class="cursor-hover hover:text-[var(--text)] transition-colors" href="mailto:{profile.email}">Email</a>
      </div>
    </div>
  </footer>
</div>

<style>
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

  /* Monochrome theme — no blue accent, just black/white shades */
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
  :global(:root.theme-light) {
    --bg: #f6f6f8;
    --surface: #ffffff;
    --border: #e3e3e8;
    --text: #14151a;
    --text-dim: #55575f;
    --text-faint: #8a8d98;
    --accent: #14151a;
    color-scheme: light;
  }
  :global(html),
  :global(body) {
    background-color: var(--bg);
  }
  :global(html) {
    scroll-behavior: smooth;
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

  /* body paragraphs: justified alignment with hyphenation so the wider
     lines don't create uneven word-spacing gaps */
  .paragraph-justify {
    text-align: justify;
    text-justify: inter-word;
    hyphens: auto;
    -webkit-hyphens: auto;
  }

  /* custom cursor (desktop / fine-pointer only) */
  :global(body.custom-cursor-active),
  :global(body.custom-cursor-active a),
  :global(body.custom-cursor-active button) {
    cursor: none;
  }
  :global(.cursor-dot) {
    position: fixed;
    top: 0;
    left: 0;
    width: 6px;
    height: 6px;
    margin: -3px 0 0 -3px;
    background: var(--text);
    border-radius: 50%;
    pointer-events: none;
    z-index: 9999;
    will-change: transform;
  }
  :global(.trail-canvas) {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 9997;
  }
  @media (pointer: coarse) {
    :global(.cursor-dot),
    :global(.trail-canvas) {
      display: none;
    }
  }

  .sphere-wire {
    transform-origin: 200px 200px;
    animation: spin 50s linear infinite;
  }
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .float-circle {
    animation: float 6s ease-in-out infinite;
  }
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-14px); }
  }

  .star-fall {
    will-change: transform, opacity;
    animation-name: star-fall;
    animation-timing-function: linear;
    animation-iteration-count: infinite;
  }
  @keyframes star-fall {
    0% { transform: translate(0, 0); opacity: 0; }
    8% { opacity: var(--peak-o); }
    25% { opacity: var(--peak-o); }
    50% { opacity: calc(var(--peak-o) * 0.35); }
    100% { transform: translate(var(--dx), 100vh); opacity: 0; }
  }

  /* hero entrance: each line fades and rises in on load, staggered via
     inline animation-delay set per element */
  .hero-in {
    animation: hero-in 0.7s cubic-bezier(0.16, 1, 0.3, 1) both;
  }
  @keyframes hero-in {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* scroll reveal: applied via the `reveal` action, elements fade + rise
     the first time they cross into the viewport */
  :global(.reveal) {
    opacity: 0;
    transform: translateY(28px);
    transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
    will-change: opacity, transform;
  }
  :global(.reveal-visible) {
    opacity: 1;
    transform: translateY(0);
  }

  /* nav link underline sweeps in on hover */
  .nav-link {
    position: relative;
    padding-bottom: 2px;
  }
  .nav-link::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 1px;
    background: currentColor;
    transform: scaleX(0);
    transform-origin: right;
    transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .nav-link:hover::after {
    transform: scaleX(1);
    transform-origin: left;
  }

  @media (prefers-reduced-motion: reduce) {
    .sphere-wire { animation: none; }
    .star-fall { animation: none !important; opacity: 0.3 !important; }
    .hero-in { animation: none !important; opacity: 1 !important; transform: none !important; }
    :global(.reveal) { opacity: 1 !important; transform: none !important; transition: none !important; }
    :global(.animate-bounce), :galobal(.animate-ping) { animation: none !important; }
  }
</style>