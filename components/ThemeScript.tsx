export function ThemeScript() {
  const script = `
    (function() {
      try {
        // Theme
        var t = localStorage.getItem('ms-theme') || 'dark';
        if (t === 'dark') document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');

        // Accent palettes
        var palettes = {
          emerald: { light: '#0f8a55', dark: '#3ab87f', negLight: '#c93a3a', negDark: '#ee7d96' },
          indigo:  { light: '#4f46e5', dark: '#818cf8', negLight: '#c93a3a', negDark: '#ee7d96' },
          rose:    { light: '#e11d48', dark: '#fb7185', negLight: '#7c3aed', negDark: '#a78bfa' },
          amber:   { light: '#d97706', dark: '#fbbf24', negLight: '#c93a3a', negDark: '#ee7d96' },
          sky:     { light: '#0284c7', dark: '#38bdf8', negLight: '#c93a3a', negDark: '#ee7d96' },
          violet:  { light: '#7c3aed', dark: '#a78bfa', negLight: '#c93a3a', negDark: '#ee7d96' },
        };
        var key = localStorage.getItem('ms-accent-key') || 'emerald';
        var p = palettes[key] || palettes.emerald;
        var accent = t === 'dark' ? p.dark : p.light;
        var neg    = t === 'dark' ? p.negDark : p.negLight;
        var r = document.documentElement;
        r.style.setProperty('--ms-accent', accent);
        r.style.setProperty('--pos',       accent);
        r.style.setProperty('--neg',       neg);
        r.style.setProperty('--ring',      accent);
      } catch(e) {
        document.documentElement.classList.add('dark');
      }
    })();
  `
  return <script dangerouslySetInnerHTML={{ __html: script }} />
}
