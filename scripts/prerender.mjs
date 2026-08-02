// Post-build prerender step. Runs after `vite build`.
//
// SplitApp is a client-rendered SPA: dist/index.html ships one empty
// <div id="root"></div> and one <title> for every URL, so crawlers see zero
// content and one duplicate page. This script takes the built index.html as a
// template and stamps out one real static HTML file per public route, with
// unique head meta, JSON-LD, and the actual page copy baked into the body.
//
// React's createRoot() wipes and replaces #root on mount, so the baked markup
// is never hydrated against — it exists purely for the initial HTML response.
// The hashed asset <script>/<link> tags are copied through untouched.

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { SITE_URL, ALL_SPLIT_SEO, ALL_MUSCLE_SEO } from '../src/data/seo.js'
import { SPLITS } from '../src/data/splits.js'
import { MUSCLE_GROUPS, ALL_EXERCISES } from '../src/data/exercises.js'
import { exercisesForDay } from '../src/lib/program.js'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const DIST = join(ROOT, 'dist')
const BUILD_DATE = new Date().toISOString().slice(0, 10)
const ORG = { '@type': 'Organization', name: 'SplitApp', url: `${SITE_URL}/` }

// ---------- escaping ----------

// Every interpolated value goes through this. Covers text nodes and
// double/single-quoted attribute values alike.
function esc(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// JSON-LD lives inside <script>, where the HTML parser looks for "</script>"
// before the JS parser ever sees the text. Escaping "<" makes that impossible.
function jsonLdScript(data) {
  const json = JSON.stringify(data, null, 2).replace(/</g, '\\u003c')
  return `<script type="application/ld+json">\n${json}\n</script>`
}

// ---------- head rewriting ----------

// Replace a single tag in the template. Throws when the tag is missing so a
// change to index.html fails the build instead of silently shipping wrong meta.
function replaceTag(html, pattern, replacement, label) {
  if (!pattern.test(html)) {
    throw new Error(`prerender: could not find ${label} in dist/index.html`)
  }
  return html.replace(pattern, replacement)
}

function renderHead(html, { url, title, description }) {
  let out = html
  out = replaceTag(out, /<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`, '<title>')
  out = replaceTag(
    out,
    /<meta name="description" content="[^"]*"\s*\/?>/,
    `<meta name="description" content="${esc(description)}" />`,
    'meta description'
  )
  out = replaceTag(
    out,
    /<link rel="canonical" href="[^"]*"\s*\/?>/,
    `<link rel="canonical" href="${esc(url)}" />`,
    'canonical link'
  )
  out = replaceTag(
    out,
    /<meta property="og:url" content="[^"]*"\s*\/?>/,
    `<meta property="og:url" content="${esc(url)}" />`,
    'og:url'
  )
  out = replaceTag(
    out,
    /<meta property="og:title" content="[^"]*"\s*\/?>/,
    `<meta property="og:title" content="${esc(title)}" />`,
    'og:title'
  )
  out = replaceTag(
    out,
    /<meta property="og:description" content="[^"]*"\s*\/?>/,
    `<meta property="og:description" content="${esc(description)}" />`,
    'og:description'
  )
  return out
}

function renderBody(html, { content, jsonLd }) {
  return replaceTag(
    html,
    /<div id="root"><\/div>/,
    `<div id="root"><main id="main">\n${content}\n</main></div>\n    ${jsonLdScript(jsonLd)}`,
    '<div id="root"></div>'
  )
}

// ---------- shared markup fragments ----------

function faqSection(faq) {
  const items = faq
    .map((item) => `<div><h3>${esc(item.q)}</h3><p>${esc(item.a)}</p></div>`)
    .join('\n        ')
  return `<section class="section-sm">
        <h2 class="section-title">Common questions</h2>
        ${items}
      </section>`
}

function chipLinks(items) {
  return items
    .map((item) => `<a class="chip" href="${esc(item.href)}">${esc(item.label)}</a>`)
    .join('\n          ')
}

function faqLd(faq) {
  return {
    '@type': 'FAQPage',
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  }
}

// ---------- page content ----------

function homePage() {
  const url = `${SITE_URL}/`
  const title = 'SplitApp — Build Muscle With a Plan'
  const description =
    'Pick a science-based training split, browse every exercise by muscle group with sets and reps, ' +
    'and track every workout. Free, no signup to browse.'

  const splitCards = SPLITS.map(
    (s) => `<a class="card" href="/splits/${esc(s.id)}">
            <div class="top">
              <div><h3>${esc(s.name)} Split</h3><span class="tagline">${esc(s.tagline)}</span></div>
              <span class="level-tag">${esc(s.level)}</span>
            </div>
            <p>${esc(s.description)}</p>
            <div class="split-meta">
              <div><div class="k">${esc(s.daysPerWeek)}</div><div class="v">DAYS / WEEK</div></div>
              <div><div class="k">${esc(s.days.length)}</div><div class="v">SESSIONS</div></div>
              <div><div class="k">${esc(s.frequency)}</div><div class="v">FREQUENCY</div></div>
            </div>
          </a>`
  ).join('\n          ')

  const content = `<div class="container">
      <div class="page-head">
        <p class="eyebrow">Build muscle with a plan</p>
        <h1>Stop guessing. Start growing.</h1>
        <p class="section-sub">SplitApp turns the science of muscle growth into a simple system:
        pick a proven training split, follow it muscle-by-muscle, and track every set you lift.
        ${esc(SPLITS.length)} splits, ${esc(MUSCLE_GROUPS.length)} muscle groups,
        ${esc(ALL_EXERCISES.length)} exercises with recommended sets and reps.</p>
        <p><a class="btn btn-primary" href="/splits">Choose Your Split</a></p>
      </div>

      <section class="section-sm">
        <h2 class="section-title">Training splits</h2>
        <div class="grid grid-2">
          ${splitCards}
        </div>
      </section>

      <section class="section-sm">
        <h2 class="section-title">Exercises by muscle group</h2>
        <p class="section-sub">Every major muscle group with its anatomy and the best exercises for
        building it — including recommended sets and reps for hypertrophy.</p>
        <div class="chips">
          ${chipLinks(MUSCLE_GROUPS.map((m) => ({ href: `/exercises/${m.id}`, label: `${m.name} exercises` })))}
        </div>
        <p><a href="/exercises">Browse the full exercise library</a></p>
      </section>
    </div>`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url,
        name: 'SplitApp',
        description,
        publisher: ORG,
      },
      {
        '@type': 'SoftwareApplication',
        '@id': `${SITE_URL}/#app`,
        name: 'SplitApp',
        url,
        applicationCategory: 'HealthApplication',
        operatingSystem: 'Any (web browser)',
        description,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        publisher: ORG,
      },
    ],
  }

  return { path: '/', out: 'index.html', url, title, description, content, jsonLd }
}

function splitsIndexPage() {
  const url = `${SITE_URL}/splits`
  const title = 'Training Splits — Full Body, Upper/Lower, PPL & Bro Split Compared'
  const description =
    `All ${SPLITS.length} training splits compared: how many days a week each takes, how often it ` +
    'trains every muscle, who it suits, and the full routine for each one.'

  const cards = SPLITS.map(
    (s) => `<div class="card split-card">
            <div class="top">
              <div><h3>${esc(s.name)}</h3><span class="tagline">${esc(s.tagline)}</span></div>
              <span class="level-tag">${esc(s.level)}</span>
            </div>
            <p>${esc(s.description)}</p>
            <div class="split-meta">
              <div><div class="k">${esc(s.daysPerWeek)}</div><div class="v">DAYS / WEEK</div></div>
              <div><div class="k">${esc(s.days.length)}</div><div class="v">SESSIONS</div></div>
              <div><div class="k">${esc(s.frequency)}</div><div class="v">FREQUENCY</div></div>
            </div>
            <div class="chips">${s.bestFor.map((b) => `<span class="pill">${esc(b)}</span>`).join('')}</div>
            <p><a href="/splits/${esc(s.id)}">Read the full ${esc(s.name)} guide</a></p>
          </div>`
  ).join('\n          ')

  const content = `<div class="container">
      <div class="page-head">
        <p class="eyebrow">Find your program</p>
        <h1>Training Splits</h1>
        <p class="section-sub">A split is how you divide muscle groups across your week. The best one
        is the one you'll do consistently — aim to train each muscle about twice a week.</p>
      </div>

      <div class="grid grid-2 section-sm">
        ${cards}
      </div>

      <section class="section-sm">
        <h2 class="section-title">Every split guide</h2>
        <div class="chips">
          ${chipLinks(SPLITS.map((s) => ({ href: `/splits/${s.id}`, label: `${s.name} split` })))}
        </div>
      </section>
    </div>`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${url}#page`,
        url,
        name: title,
        description,
        isPartOf: { '@id': `${SITE_URL}/#website` },
      },
      {
        '@type': 'ItemList',
        '@id': `${url}#list`,
        name: 'Training splits',
        numberOfItems: SPLITS.length,
        itemListElement: SPLITS.map((s, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: `${s.name} split`,
          url: `${SITE_URL}/splits/${s.id}`,
        })),
      },
    ],
  }

  return { path: '/splits', out: 'splits.html', url, title, description, content, jsonLd }
}

function exercisesIndexPage() {
  const url = `${SITE_URL}/exercises`
  const title = 'Exercise Library — Best Exercises for Every Muscle Group'
  const description =
    `${ALL_EXERCISES.length} exercises across ${MUSCLE_GROUPS.length} muscle groups, each with the ` +
    'equipment it needs and the sets and reps that build muscle.'

  const cards = MUSCLE_GROUPS.map(
    (m) => `<a class="card muscle-card" href="/exercises/${esc(m.id)}">
            <div class="bar" style="background:${esc(m.color)}"></div>
            <div class="body">
              <h3>${esc(m.name)}</h3>
              <div class="anat">${esc(m.anatomy)}</div>
              <p>${esc(m.blurb)}</p>
              <span class="count">${esc(m.exercises.length)} exercises</span>
            </div>
          </a>`
  ).join('\n          ')

  const content = `<div class="container">
      <div class="page-head">
        <p class="eyebrow">Know what to train</p>
        <h1>Exercise Library</h1>
        <p class="section-sub">Every major muscle group with its anatomy and the best exercises for
        building it — including recommended sets and reps for hypertrophy.</p>
      </div>

      <div class="chips">
        ${chipLinks(MUSCLE_GROUPS.map((m) => ({ href: `/exercises/${m.id}`, label: m.name })))}
      </div>

      <div class="grid grid-3 section-sm">
        ${cards}
      </div>
    </div>`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${url}#page`,
        url,
        name: title,
        description,
        isPartOf: { '@id': `${SITE_URL}/#website` },
      },
      {
        '@type': 'ItemList',
        '@id': `${url}#list`,
        name: 'Muscle groups',
        numberOfItems: MUSCLE_GROUPS.length,
        itemListElement: MUSCLE_GROUPS.map((m, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: `${m.name} exercises`,
          url: `${SITE_URL}/exercises/${m.id}`,
        })),
      },
    ],
  }

  return { path: '/exercises', out: 'exercises.html', url, title, description, content, jsonLd }
}

function splitPage(seo) {
  const { split } = seo
  const url = SITE_URL + seo.path

  const dayCards = split.days
    .map((day) => {
      const rows = exercisesForDay(day.focus)
        .map(
          (ex) => `<li class="day-ex">
                  <span class="nm"><span class="dot" style="background:${esc(ex.color)}"></span>${esc(ex.name)}</span>
                  <span class="reps">${esc(ex.sets)} × ${esc(ex.reps)}</span>
                </li>`
        )
        .join('\n                ')
      return `<div class="day-card">
              <div class="head">${esc(day.name)}</div>
              <ul>
                ${rows}
              </ul>
            </div>`
    })
    .join('\n          ')

  const content = `<div class="container">
      <div class="page-head">
        <p class="eyebrow"><a href="/splits">Training Splits</a> · ${esc(split.level)}</p>
        <h1>${esc(seo.heading)}</h1>
        <p class="section-sub">${esc(seo.intro)}</p>
      </div>

      <div class="split-meta">
        <div><div class="k">${esc(split.daysPerWeek)}</div><div class="v">DAYS / WEEK</div></div>
        <div><div class="k">${esc(split.days.length)}</div><div class="v">SESSIONS</div></div>
        <div><div class="k">${esc(split.frequency)}</div><div class="v">FREQUENCY</div></div>
      </div>

      <p><a class="btn btn-primary" href="/splits">Start the ${esc(split.name)} Split</a></p>

      <section class="section-sm">
        <h2 class="section-title">${esc(seo.whoHeading)}</h2>
        <div class="chips">${split.bestFor.map((b) => `<span class="pill">${esc(b)}</span>`).join('')}</div>
      </section>

      <section class="section-sm">
        <h2 class="section-title">The full ${esc(split.daysPerWeek)}-day routine</h2>
        <div class="day-grid">
          ${dayCards}
        </div>
      </section>

      <section class="section-sm">
        <h2 class="section-title">${esc(seo.progressHeading)}</h2>
        <p>${esc(seo.progressBody)}</p>
      </section>

      <section class="section-sm">
        <h2 class="section-title">Muscles this split trains</h2>
        <div class="chips">
          ${chipLinks(seo.muscles.map((m) => ({ href: `/exercises/${m.id}`, label: `${m.name} exercises` })))}
        </div>
      </section>

      ${faqSection(seo.faq)}

      <section class="section-sm">
        <h2 class="section-title">Other splits</h2>
        <div class="chips">
          ${chipLinks(
            SPLITS.filter((s) => s.id !== split.id).map((s) => ({
              href: `/splits/${s.id}`,
              label: `${s.name} split`,
            }))
          )}
        </div>
      </section>
    </div>`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        '@id': `${url}#article`,
        headline: seo.title,
        description: seo.description,
        url,
        mainEntityOfPage: url,
        datePublished: BUILD_DATE,
        dateModified: BUILD_DATE,
        author: ORG,
        publisher: ORG,
        isPartOf: { '@id': `${SITE_URL}/#website` },
        about: seo.muscles.map((m) => ({ '@type': 'Thing', name: m.name })),
      },
      { '@id': `${url}#faq`, ...faqLd(seo.faq) },
    ],
  }

  return {
    path: seo.path,
    out: `splits/${split.id}.html`,
    url,
    title: seo.title,
    description: seo.description,
    content,
    jsonLd,
  }
}

function musclePage(seo) {
  const { group } = seo
  const url = SITE_URL + seo.path

  const rows = group.exercises
    .map(
      (ex) => `<tr>
                <td>${esc(ex.name)}</td>
                <td><span class="type-tag type-${esc(ex.type)}">${esc(ex.type)}</span></td>
                <td>${esc(ex.equipment)}</td>
                <td>${esc(ex.sets)}</td>
                <td>${esc(ex.reps)}</td>
              </tr>`
    )
    .join('\n              ')

  const splitCards = seo.sessions
    .map(
      ({ split, days }) => `<a class="card" href="/splits/${esc(split.id)}">
            <div class="top">
              <div>
                <h3>${esc(split.name)}</h3>
                <span class="tagline">${esc(days)}× per week · ${esc(split.daysPerWeek)} days total</span>
              </div>
              <span class="level-tag">${esc(split.level)}</span>
            </div>
            <p>${esc(split.tagline)}</p>
          </a>`
    )
    .join('\n          ')

  const content = `<div class="container">
      <div class="page-head">
        <p class="eyebrow"><a href="/exercises">Exercise Library</a> · ${esc(group.anatomy)}</p>
        <h1>${esc(seo.heading)}</h1>
        <p class="section-sub">${esc(seo.intro)}</p>
      </div>

      <section class="section-sm">
        <h2 class="section-title">Every ${esc(group.name.toLowerCase())} exercise, with sets and reps</h2>
        <div class="card">
          <table class="ex-table">
            <thead>
              <tr><th>Exercise</th><th>Type</th><th>Equipment</th><th>Sets</th><th>Reps</th></tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
        </div>
      </section>

      <section class="section-sm">
        <h2 class="section-title">${esc(seo.volumeHeading)}</h2>
        <p>${esc(seo.volumeBody)}</p>
      </section>

      <section class="section-sm">
        <h2 class="section-title">Splits that train ${esc(group.name.toLowerCase())}</h2>
        <div class="grid grid-2">
          ${splitCards}
        </div>
      </section>

      ${faqSection(seo.faq)}

      <section class="section-sm">
        <h2 class="section-title">Other muscle groups</h2>
        <div class="chips">
          ${chipLinks(
            MUSCLE_GROUPS.filter((m) => m.id !== group.id).map((m) => ({
              href: `/exercises/${m.id}`,
              label: m.name,
            }))
          )}
        </div>
      </section>
    </div>`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ItemList',
        '@id': `${url}#exercises`,
        name: seo.heading,
        description: seo.description,
        url,
        numberOfItems: group.exercises.length,
        itemListElement: group.exercises.map((ex, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: ex.name,
          description: `${ex.type} ${group.name.toLowerCase()} exercise using ${ex.equipment.toLowerCase()}. ${ex.sets} sets of ${ex.reps} reps.`,
        })),
      },
      { '@id': `${url}#faq`, ...faqLd(seo.faq) },
    ],
  }

  return {
    path: seo.path,
    out: `exercises/${group.id}.html`,
    url,
    title: seo.title,
    description: seo.description,
    content,
    jsonLd,
  }
}

// ---------- sitemap ----------

function sitemap(pages) {
  const urls = pages
    .map(
      (p) => `  <url>
    <loc>${esc(p.url)}</loc>
    <lastmod>${BUILD_DATE}</lastmod>
  </url>`
    )
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`
}

// ---------- run ----------

async function main() {
  const template = await readFile(join(DIST, 'index.html'), 'utf8')

  const pages = [
    homePage(),
    splitsIndexPage(),
    exercisesIndexPage(),
    ...ALL_SPLIT_SEO.map(splitPage),
    ...ALL_MUSCLE_SEO.map(musclePage),
  ]

  for (const page of pages) {
    const html = renderBody(renderHead(template, page), page)
    const target = join(DIST, page.out)
    await mkdir(dirname(target), { recursive: true })
    await writeFile(target, html, 'utf8')
  }

  await writeFile(join(DIST, 'sitemap.xml'), sitemap(pages), 'utf8')

  console.log(`prerender: wrote ${pages.length} HTML pages + sitemap.xml to dist/`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
