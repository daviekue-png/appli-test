/** Utilitaires partagés : recherche insensible aux accents et manipulation de dates. */

/** Minuscules + suppression des accents, sans toucher aux espaces. */
export function fold(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

/** Normalise une chaîne : minuscules + suppression des accents + trim. */
export function normalize(value) {
  return fold(value).trim()
}

/**
 * Découpe un texte en segments afin de surligner la partie recherchée.
 * La comparaison ignore les accents ; les index sont ramenés vers le texte
 * d'origine pour que le surlignage reste exact.
 */
export function splitHighlight(text, query) {
  const source = String(text ?? '')
  const search = normalize(query)
  if (!search) return [{ text: source, match: false }]

  let folded = ''
  const sourceIndexes = []
  for (let index = 0; index < source.length; index += 1) {
    for (const char of fold(source[index])) {
      folded += char
      sourceIndexes.push(index)
    }
  }

  const start = folded.indexOf(search)
  if (start === -1) return [{ text: source, match: false }]

  const from = sourceIndexes[start]
  const to = sourceIndexes[start + search.length - 1] + 1
  const segments = []
  if (from > 0) segments.push({ text: source.slice(0, from), match: false })
  segments.push({ text: source.slice(from, to), match: true })
  if (to < source.length) segments.push({ text: source.slice(to), match: false })
  return segments
}

/** Vrai si `haystack` contient `needle` en ignorant accents et casse. */
export function matches(haystack, needle) {
  const query = normalize(needle)
  if (!query) return true
  return normalize(haystack).includes(query)
}

/* ------------------------------------------------------------------ dates */

export const MONTHS_FR = [
  'janvier',
  'février',
  'mars',
  'avril',
  'mai',
  'juin',
  'juillet',
  'août',
  'septembre',
  'octobre',
  'novembre',
  'décembre',
]

/** Libellés abrégés, utilisés dans la grille de sélection des mois. */
export const MONTHS_SHORT_FR = [
  'janv.',
  'févr.',
  'mars',
  'avr.',
  'mai',
  'juin',
  'juil.',
  'août',
  'sept.',
  'oct.',
  'nov.',
  'déc.',
]

/** Première lettre en majuscule (utile pour les en-têtes). */
export function capitalize(value) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : ''
}

export const WEEKDAYS_FR = ['lun', 'mar', 'mer', 'jeu', 'ven', 'sam', 'dim']

const pad = (number) => String(number).padStart(2, '0')

/** Construit une date ISO (aaaa-mm-jj) sans passer par UTC. */
export function toISO(year, month, day) {
  return `${year}-${pad(month + 1)}-${pad(day)}`
}

/** Analyse une date ISO et retourne { year, month, day } ou null. */
export function fromISO(iso) {
  const result = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso ?? '')
  if (!result) return null
  const year = Number(result[1])
  const month = Number(result[2]) - 1
  const day = Number(result[3])
  const check = new Date(year, month, day)
  if (check.getFullYear() !== year || check.getMonth() !== month || check.getDate() !== day) {
    return null
  }
  return { year, month, day }
}

/** Date du jour au format ISO. */
export function todayISO() {
  const now = new Date()
  return toISO(now.getFullYear(), now.getMonth(), now.getDate())
}

/** Convertit une date ISO en affichage jj/mm/aaaa. */
export function formatFR(iso) {
  const parts = fromISO(iso)
  return parts ? `${pad(parts.day)}/${pad(parts.month + 1)}/${parts.year}` : ''
}

/** Analyse une saisie libre : jj/mm/aaaa, jj-mm-aa, aaaa-mm-jj… */
export function parseDateInput(text) {
  const cleaned = String(text ?? '').trim()
  if (!cleaned) return null

  const isoFirst = /^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/.exec(cleaned)
  if (isoFirst) {
    return fromISO(toISO(Number(isoFirst[1]), Number(isoFirst[2]) - 1, Number(isoFirst[3])))
      ? toISO(Number(isoFirst[1]), Number(isoFirst[2]) - 1, Number(isoFirst[3]))
      : null
  }

  const frFirst = /^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})$/.exec(cleaned)
  if (frFirst) {
    const day = Number(frFirst[1])
    const month = Number(frFirst[2]) - 1
    let year = Number(frFirst[3])
    if (year < 100) year += year < 70 ? 2000 : 1900
    const iso = toISO(year, month, day)
    return fromISO(iso) ? iso : null
  }

  return null
}

/** Ajoute (ou retire) une durée à une date ISO et retourne la nouvelle date ISO. */
export function addToISO(iso, { days = 0, months = 0, years = 0 }) {
  const parts = fromISO(iso)
  if (!parts) return null
  const date = new Date(parts.year + years, parts.month + months, parts.day + days)
  return toISO(date.getFullYear(), date.getMonth(), date.getDate())
}

/** Liste des cases d'un mois : 42 cases (6 semaines) pour une grille stable. */
export function buildMonthGrid(year, month) {
  const firstOfMonth = new Date(year, month, 1)
  // getDay() : 0 = dimanche. La semaine commence le lundi.
  const offset = (firstOfMonth.getDay() + 6) % 7
  const cells = []
  for (let index = 0; index < 42; index += 1) {
    const date = new Date(year, month, index - offset + 1)
    cells.push({
      iso: toISO(date.getFullYear(), date.getMonth(), date.getDate()),
      day: date.getDate(),
      inMonth: date.getMonth() === month && date.getFullYear() === year,
      weekend: date.getDay() === 0 || date.getDay() === 6,
    })
  }
  return cells
}

/** Étiquette longue d'une date ISO : « dimanche 18 octobre 2026 ». */
export function formatLongFR(iso) {
  const parts = fromISO(iso)
  if (!parts) return ''
  const date = new Date(parts.year, parts.month, parts.day)
  const weekday = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'][
    date.getDay()
  ]
  return `${weekday} ${parts.day} ${MONTHS_FR[parts.month]} ${parts.year}`
}
