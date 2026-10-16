// Hero proof card: an informal statement is formalized, proved, and machine-checked in a loop.
// Static HTML holds the first example and remains intact without JS or with reduced motion.
(() => {
  const card = document.querySelector('.proof-card');
  if (!card || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const code = card.querySelector('code');
  const lang = card.querySelector('.proof-lang');
  const status = card.querySelector('.proof-status');

  const EXAMPLES = [
    {
      lang: 'Lean 4 · Mathlib',
      okText: 'goals accomplished',
      informal: '-- 1 + 3 + 5 + ⋯ + (2n − 1) = n²',
      statement: [
        'theorem odd_sum (n : ℕ) :',
        '    ∑ i ∈ range n, (2 * i + 1) = n ^ 2 := by'
      ],
      proof: [
        '  induction n with',
        '  | zero => simp',
        '  | succ n ih =>',
        '    rw [sum_range_succ, ih]; ring'
      ],
    },
    {
      lang: 'Lean 4 · Mathlib',
      okText: 'goals accomplished',
      informal: '-- There are infinitely many primes.',
      statement: [
        'theorem euclid (n : ℕ) :',
        '    ∃ p, n < p ∧ p.Prime := by'
      ],
      proof: [
        '  obtain ⟨p, hp, hpp⟩ :=',
        '    Nat.exists_infinite_primes (n + 1)',
        '  exact ⟨p, by omega, hpp⟩'
      ],
    },
    {
      lang: 'Stainless · Scala',
      okText: 'verified (SMT)',
      informal: '// Non-negative midpoint without overflow',
      statement: [
        'def mid(lo: Int, hi: Int): Int = {',
        '  require(0 <= lo && lo <= hi)'
      ],
      proof: [
        '  lo + (hi - lo) / 2',
        '}.ensuring(m => lo <= m && m <= hi)'
      ],
    },
    {
      lang: 'Lean 4 · Mathlib',
      okText: 'goals accomplished',
      informal: '-- Cantor: no f : α → Set α is surjective.',
      statement: [
        'theorem cantor {α : Type*}',
        '    (f : α → Set α) : ¬ f.Surjective := by'
      ],
      proof: [
        '  intro h',
        '  obtain ⟨a, ha⟩ := h {x | x ∉ f x}',
        '  exact iff_not_self (congrArg (a ∈ ·) ha).mp'
      ],
    },
  ];

  const KEYWORDS = new Set(['theorem', 'by', 'with', 'def', 'require', 'ensuring']);
  const TACTICS = new Set(['induction', 'simp', 'rw', 'ring', 'obtain', 'exact', 'intro', 'omega']);
  const TOKEN = /\s+|[\p{L}\p{N}_.'*]+|\S/gu;
  const STEP = 62;

  let onScreen = true;
  let hovered = false;
  new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; }).observe(card);
  card.addEventListener('mouseenter', () => { hovered = true; });
  card.addEventListener('mouseleave', () => { hovered = false; });

  const wait = async (ms) => {
    while (ms > 0) {
      const dt = Math.min(ms, 50);
      await new Promise((r) => setTimeout(r, dt));
      if (onScreen && !hovered && !document.hidden) ms -= dt;
    }
  };

  const caret = document.createElement('span');
  caret.className = 'caret';

  const put = (text, cls) => {
    caret.before(cls
      ? Object.assign(document.createElement('span'), { className: cls, textContent: text })
      : document.createTextNode(text));
  };

  const classify = (tok) => (KEYWORDS.has(tok) ? 'k' : TACTICS.has(tok) ? 't' : '');

  const stream = async (lines) => {
    for (const line of lines) {
      put('\n');
      for (const tok of line.match(TOKEN)) {
        put(tok, classify(tok));
        if (tok.trim()) await wait(STEP * (0.5 + Math.random()));
      }
    }
  };

  const setStatus = (text, state) => {
    status.textContent = text;
    status.dataset.state = state;
  };

  const play = async (ex) => {
    card.classList.add('is-fading');
    await wait(380);
    if (lang) lang.textContent = ex.lang;
    code.replaceChildren(caret);
    setStatus('', 'idle');
    card.classList.remove('is-fading');
    put(ex.informal, 'c');
    await wait(850);
    setStatus('formalizing', 'busy');
    await stream(ex.statement);
    await wait(300);
    setStatus('proving', 'busy');
    await stream(ex.proof);
    caret.remove();
    setStatus('checking', 'busy');
    await wait(750);
    setStatus(ex.okText, 'ok');
  };

  (async () => {
    setStatus('checking', 'busy');
    await wait(1100);
    setStatus('goals accomplished', 'ok');
    await wait(2600);
    for (let i = 0; ; ) {
      i = (i + 1) % EXAMPLES.length;
      await play(EXAMPLES[i]);
      await wait(5200);
    }
  })();
})();
