# GS1 GPC (Global Product Classification)

Reference for the standard German retail product classification. Describes what
GPC is, how it is structured, and how to obtain the official German schema.

Facts and tables below are taken from GPC publication 279 (`v20251127`, language
`DE`, dated 27/11/2025). GPC republishes twice a year; re-derive the tables from
the schema rather than editing them by hand (`docs/gen-gpc-tables.mjs`).

## What it is

**GS1 Global Product Classification (GPC)** is the product classification
operated by GS1 and, for the German market, GS1 Germany. It gives every traded
good a code that identifies what the product _is_, independent of manufacturer,
brand, or trade name.

- **Free to use.** No licence fee, no account needed for the schema.
- **Published twice a year**, in 26 languages including German.
- **Successor to the older Warengruppen classification**, which German
  manufacturers and retailers are being migrated off.
- Used as the classification layer of GDSN (Global Data Synchronisation Network),
  which is how German retail exchanges master data.

**eCl@ss** is the other German-origin classification standard. It targets B2B and
industrial goods and is not the retail/grocery standard; GPC is.

## Structure

GPC is a rules-based hierarchy of four levels.

| Level     | German           | Example                                              |
| --------- | ---------------- | ---------------------------------------------------- |
| 1 Segment | Segment          | `50000000` Lebensmittel / Getränke                   |
| 2 Family  | Familie          | `50170000` Gewürze / Konservierungsstoffe / Extrakte |
| 3 Class   | Klasse           | `50171800` Saucen / Aufstriche / Dips / Würzsaucen   |
| 4 Brick   | Baustein / Brick | `10000057` Saucen (ohne Kühlung haltbar)             |

Levels 1 to 3 exist only to navigate to the Brick. **The Brick is the actual unit
of classification**; a product is classified _to a Brick_, and the Segment,
Family, and Class follow from it. A Brick carries up to ten **attributes**
(Brick Attributes) that refine it further.

Segment, Family, and Class codes are 8 digits and positional: `50170000` is a
Family of Segment `50`, `50171800` a Class within it. Brick codes are 8 digits
but **not** positional; they are opaque identifiers from a flat sequence
(`10000163`), so a Brick's parentage cannot be read off its code.

Schema size (publication 279): 45 segments, 162 families, 937 classes, 5306
bricks, 10100 attributes, 183933 attribute values. Segment `50000000` alone: 27
families, 135 classes, 879 bricks.

## Two axes that are never a category

Storage state and processing are the two distinctions most likely to be mistaken
for categories. Neither is one. Both matter when mapping an ad-hoc scheme onto
GPC.

### Storage state

There is **no "frozen" or "fresh" category anywhere in GPC**, at any level, for
any product. Storage state is instead resolved in one of three ways, and **which
one depends on the family**. This is the single most error-prone part of the
standard.

**1. At Family level, for raw produce.** Fruit, vegetables, and nuts have
parallel families per state:

| Code       | Familie                                                             |
| ---------- | ------------------------------------------------------------------- |
| `50250000` | Obst - nicht bearbeitet / verarbeitet (frisch)                      |
| `50270000` | Obst - nicht bearbeitet / verarbeitet (tiefgefroren)                |
| `50310000` | Obst - nicht bearbeitet / verarbeitet (ohne Kühlung haltbar)        |
| `50260000` | Gemüse (ohne Blattgemüse) – nicht bearbeitet / verarbeitet (frisch) |
| `50290000` | Gemüse - nicht bearbeitet / verarbeitet (tiefgefroren)              |
| `50320000` | Gemüse - nicht bearbeitet / verarbeitet (ohne Kühlung haltbar)      |
| `50330000` | Nüsse / Samen - nicht bearbeitet / verarbeitet (leicht verderblich) |
| `50340000` | Nüsse / Samen – nicht bearbeitet / verarbeitet (in der Schale)      |

Frozen peas and fresh peas are in different **families**.

**2. In the Brick title, for prepared foods and seafood.** Parallel bricks exist
per state, with the state in the name. 249 of segment 50's 879 bricks (28%) do
this. Under `50171800 Saucen / Aufstriche / Dips / Würzsaucen`:

| Brick      | Title                         |
| ---------- | ----------------------------- |
| `10000055` | Saucen (leicht verderblich)   |
| `10000057` | Saucen (ohne Kühlung haltbar) |
| `10000056` | Saucen (tiefgefroren)         |

Same under `50121700 Krustentiere / Muscheln / Schnecken - nicht bearbeitet /
verarbeitet`: frozen prawns are `10000020`, fresh prawns `10000019`. Different
**bricks**.

**3. As a Brick attribute, for meat and poultry.** Class `50240200 Fleisch /
Geflügel / sonstige Tiere - nicht bearbeitet / verarbeitet` has bricks per
**species**, with no storage state in the title at all: `10005790 Ente`,
`10005788 Huhn`, `10005786 Rindfleisch`. Frozen duck and fresh duck are the
**same brick**, separated by attribute `20000153 Kühlungsnotwendigkeit`:

| Value      | Title                          |
| ---------- | ------------------------------ |
| `30000090` | MUSS GEKÜHLT AUFBEWAHRT WERDEN |
| `30000517` | KANN GEKÜHLT AUFBEWAHRT WERDEN |
| `30002518` | NICHT IDENTIFIZIERBAR          |

So: frozen prawns and fresh prawns are different bricks, but frozen duck and
fresh duck are one brick plus an attribute. Any scheme that stores storage state
as a peer category contradicts all three mechanisms.

### Processed vs unprocessed

**bearbeitet / verarbeitet** vs **nicht bearbeitet / verarbeitet** _is_ a
class-level split, recurring across most food families (`50240100` vs `50240200`,
`50121900` vs `50121500`, and so on). Roast duck and raw duck breast are
different classes, not one class with an attribute. Classifying a product
requires knowing which side it falls on, which a product name often does not say.

### Attributes

3652 of 5306 bricks carry attributes; the rest have none. In the download they
continue the same `Childs` recursion two levels past the Brick: `Level` 5 nodes
are attributes, `Level` 6 their permitted values. Example, brick `10000054`:

```
20000157  Art von Dipsauce / Würzsauce / Feinkostsauce / Auftriche / Marinade
20000153  Kühlungsnotwendigkeit
20000142  Falls Biologisch
20000175  Angabe: Für Vegetarier / Veganer geeignet
20000002  Hinzugefügte Zutaten
20000352  Form / Beschaffenheit
```

## Obtaining the German schema

The [GPC Browser](https://gpc-browser.gs1.org/) is a JS app over an undocumented
but open API. There is no API key. Requests are rejected with
`{"statusCode":417,"isSuccess":false,"message":"Access denied"}` unless
browser-like headers are sent; that error means the headers are missing, not that
credentials are required.

Base URL: `https://gpc-api.gs1.org/api`

```bash
H=(-H "Content-Type: application/json;charset=utf-8"
   -H "Origin: https://gpc-browser.gs1.org"
   -H "Referer: https://gpc-browser.gs1.org/"
   -H "User-Agent: Mozilla/5.0")

# languages; German is languageId 6
curl -s "https://gpc-api.gs1.org/api/browser/language/all" "${H[@]}"

# publications available for a language
curl -s "https://gpc-api.gs1.org/api/browser/publication?languageId=6" "${H[@]}"

# whole schema for a publication (~33 MB as JSON)
curl -s "https://gpc-api.gs1.org/api/browser/download/publication/279/json" "${H[@]}" \
  -o gpc-de-279.json
```

Other routes: `/browser/segment?publicationId=`, `/browser/family`,
`/browser/class`, `/browser/brick`, `/browser/attribute`,
`/browser/attribute-value`, `/browser/brick-attribute-value`,
`/browser/publication/previous?publicationId=`,
`/browser/publication/islatest?publicationId=`.

Download formats: `/json`, `/xml`, `/xlsx`, `/zip`.

### Choosing a publication

`/browser/publication?languageId=6` lists several, and the newest is not always
the right one. Translations lag the English release, and an in-progress
translation is published and browsable while incomplete.

| id  | Name                           | Note                                             |
| --- | ------------------------------ | ------------------------------------------------ |
| 293 | GPC as of May 2026             | **Translation in progress**, do not use          |
| 279 | GPC as of November 2025 (GDSN) | latest complete German translation, **use this** |
| 243 | GPC as of May 2025 (GDSN)      | superseded                                       |

Check `publicationName` for "Translation in progress" before trusting a schema.

### Response shape

```jsonc
{
  "LanguageCode": "DE",
  "DateUtc": "27/11/2025",
  "Schema": [
    {
      "Level": 1, // 1 Segment, 2 Familie, 3 Klasse,
      // 4 Brick, 5 Attribut, 6 Attributwert
      "Code": 50000000, // number, not string
      "Title": "Lebensmittel / Getränke",
      "Definition": "",
      "DefinitionExcludes": null,
      "Active": true,
      "Childs": [/* same shape, one level down */],
    },
  ],
}
```

`Childs` (not `Children`) is the recursion key at every level. Segments arrive
unsorted; sort by `Code` if order matters.

## Naming gotchas

- **Tobacco is not in the food segment.** Segment `50000000` is titled
  **"Lebensmittel / Getränke"**. Tobacco lives in its own segment,
  `12000000 Tabakwaren / Cannabis`. Sources calling segment 50 "Food / Beverage /
  Tobacco" are describing a superseded schema.
- **Third-party family lists are unreliable.** Published summaries of segment
  50's families are frequently wrong or truncated. Derive from the API download.
- **A "Mischpackungen" class exists in most families** (mixed/variety packs) and
  is a real classification, not a dumping ground.
- **Non-food goods sold by a grocer leave segment 50000000.** Bin bags are
  `47210100 Produkte zur Abfalllagerung` (segment `47000000`); disposable food
  bags are `73040100 Küche - Aufbewahrung` (segment `73000000`). A food-only
  scheme cannot represent a shop's full catalogue.

## Reference tables

Verbatim from publication 279. Regenerate with:

```bash
node docs/gen-gpc-tables.mjs path/to/gpc-de-279.json
```

### All segments

| Code       | Segment                                                  |
| ---------- | -------------------------------------------------------- |
| `10000000` | Haustierbedarf / Haustiernahrung                         |
| `11000000` | Industrielle Flüssigkeitspumpen/-systeme                 |
| `12000000` | Tabakwaren / Cannabis                                    |
| `13000000` | Schädlingsbekämpfungsmittel / Pflanzenschutzmittel       |
| `14000000` | Beleuchtung                                              |
| `47000000` | Reinigungsmittel / Haushygiene                           |
| `50000000` | Lebensmittel / Getränke                                  |
| `51000000` | Gesundheitswesen                                         |
| `53000000` | Schönheit / Körperpflege / Hygieneartikel                |
| `58000000` | Segmentübergreifende Klassifikation                      |
| `60000000` | Druckmedien / Textmedien                                 |
| `61000000` | Musik                                                    |
| `62000000` | Schreibwaren / Bürobedarf / Büromaschinen / Partyartikel |
| `63000000` | Schuhe                                                   |
| `64000000` | Persönliche Accessoires                                  |
| `65000000` | Computer / PC- / Videospiele                             |
| `66000000` | Kommunikation                                            |
| `67000000` | Bekleidung                                               |
| `68000000` | Audio / Video / Foto                                     |
| `70000000` | Kunst / Kunsthandwerk / Basteln / Handarbeit             |
| `71000000` | Sportartikel                                             |
| `72000000` | Haushaltsgeräte                                          |
| `73000000` | Küchengeräte und Geschirr                                |
| `74000000` | Camping                                                  |
| `75000000` | Wohn- / Büromöbel / Innendekoration                      |
| `77000000` | Fahrzeuge                                                |
| `78000000` | Elektrozubehör / Beleuchtung                             |
| `79000000` | Sanitär- / Heizungs- / Klimatechnik                      |
| `80000000` | Werkzeuge / Geräte                                       |
| `81000000` | Gartenbedarf                                             |
| `83000000` | Baustoffe / Bauelemente / Baubedarf                      |
| `84000000` | Werkzeugaufbewahrung / Werkstattausstattung              |
| `85000000` | Sicherheit / Schutz - Do-it-yourself                     |
| `86000000` | Spielzeuge / Spiele                                      |
| `87000000` | Fluide / Brennstoffe / Gase                              |
| `88000000` | Schmierstoffe                                            |
| `89000000` | Lebende Tiere                                            |
| `91000000` | Sicherheit / Schutz / Überwachung                        |
| `92000000` | Lager- / Transportbehälter                               |
| `93000000` | Pflanzen (Gartenbau)                                     |
| `94000000` | Kulturpflanzen                                           |
| `95000000` | Dienstleistungen / Verkaufsmaschinen                     |
| `96000000` | Monetäre Vermögenswerte                                  |
| `98000000` | Rohmaterialien (nicht aus dem Lebensmittelbereich)       |
| `99000000` | Post-Mortem-Produkte                                     |

### Segment 50000000: families

| Code       | Familie                                                             | Klassen |
| ---------- | ------------------------------------------------------------------- | ------: |
| `50100000` | Obst / Gemüse / Nüsse / Samen - bearbeitet / verarbeitet            |       5 |
| `50120000` | Meeresfrüchte und Ersatzprodukte für Meeresfrüchte                  |      10 |
| `50130000` | Milch / Butter / Sahne / Käse / Eier / Ersatzprodukte               |       9 |
| `50150000` | Speiseöle / -Fette                                                  |       3 |
| `50160000` | Süßwaren / Süßungsmittel                                            |       3 |
| `50170000` | Gewürze / Konservierungsstoffe / Extrakte                           |       6 |
| `50180000` | Brot / Backwaren                                                    |       6 |
| `50190000` | Bearbeitete / Verarbeitete Nahrungsmittel                           |      13 |
| `50200000` | Getränke                                                            |       7 |
| `50220000` | Getreide- / Hülsenfruchtprodukte                                    |       3 |
| `50230000` | Lebensmittel / Getränke – Mischpackungen                            |       1 |
| `50240000` | Fleisch / Geflügel / sonstige Tiere                                 |       3 |
| `50250000` | Obst - nicht bearbeitet / verarbeitet (frisch)                      |      15 |
| `50260000` | Gemüse (ohne Blattgemüse) – nicht bearbeitet / verarbeitet (frisch) |      26 |
| `50270000` | Obst - nicht bearbeitet / verarbeitet (tiefgefroren)                |       1 |
| `50290000` | Gemüse - nicht bearbeitet / verarbeitet (tiefgefroren)              |       1 |
| `50310000` | Obst - nicht bearbeitet / verarbeitet (ohne Kühlung haltbar)        |       1 |
| `50320000` | Gemüse - nicht bearbeitet / verarbeitet (ohne Kühlung haltbar)      |       1 |
| `50330000` | Nüsse / Samen - nicht bearbeitet / verarbeitet (leicht verderblich) |       1 |
| `50340000` | Nüsse / Samen – nicht bearbeitet / verarbeitet (in der Schale)      |       1 |
| `50350000` | Blattgemüse - nicht bearbeitet / verarbeitet (frisch)               |       7 |
| `50360000` | Frische Garnierung (Lebensmittel)                                   |       1 |
| `50370000` | Obst/Gemüse Frisch & Fresh Cut                                      |       2 |
| `50380000` | Obst / Gemüse Fresh-Cut                                             |       2 |
| `50390000` | Ersatzprodukte für Fleisch/Fisch/Meeresfrüchte                      |       3 |
| `50400000` | Insekten (essbar)                                                   |       2 |
| `50410000` | Essbare Produkte tierischen Ursprungs                               |       2 |

### Segment 50000000: classes

**`50100000` Obst / Gemüse / Nüsse / Samen - bearbeitet / verarbeitet**

| Code       | Klasse                                         | Bricks |
| ---------- | ---------------------------------------------- | -----: |
| `50101800` | Nüsse / Samen - bearbeitet / verarbeitet       |      2 |
| `50101900` | Früchte- / Nüsse- / Samen-Mischungen           |      2 |
| `50102000` | Obst - bearbeitet / verarbeitet                |      3 |
| `50102100` | Gemüse - bearbeitet / verarbeitet              |      3 |
| `50102200` | Obst / Gemüse / Nüsse / Samen - Mischpackungen |      1 |

**`50120000` Meeresfrüchte und Ersatzprodukte für Meeresfrüchte**

| Code       | Klasse                                                               | Bricks |
| ---------- | -------------------------------------------------------------------- | -----: |
| `50121500` | Fisch - nicht bearbeitet / verarbeitet                               |      3 |
| `50121700` | Krustentiere / Muscheln / Schnecken - nicht bearbeitet / verarbeitet |      3 |
| `50121800` | Wasserpflanzen / Algen - nicht bearbeitet / verarbeitet              |      3 |
| `50121900` | Fisch - bearbeitet / verarbeitet                                     |      3 |
| `50122000` | Weichtiere - bearbeitet / verarbeitet                                |      3 |
| `50122100` | Krustentiere / Muscheln / Schnecken - bearbeitet / verarbeitet       |      3 |
| `50122200` | Wasserpflanzen / Algen - bearbeitet / verarbeitet                    |      3 |
| `50122300` | Weichtiere - nicht bearbeitet / verarbeitet                          |      3 |
| `50122400` | Fisch / Meeresfrüchte - Mischpackungen                               |      1 |
| `50122500` | Fisch / Meeresfrüchte - Mischungen                                   |      6 |

**`50130000` Milch / Butter / Sahne / Käse / Eier / Ersatzprodukte**

| Code       | Klasse                                                                 | Bricks |
| ---------- | ---------------------------------------------------------------------- | -----: |
| `50131700` | Milch / Milchersatz                                                    |      6 |
| `50131800` | Käse / Käseersatz                                                      |      6 |
| `50131900` | Butter / Butterersatz                                                  |     12 |
| `50132000` | Sahne / Sahneersatz                                                    |      6 |
| `50132100` | Joghurt / Joghurtersatz                                                |      6 |
| `50132200` | Milch / Butter / Sahne / Käse / Eier / Ersatzprodukte - Mischpackungen |      1 |
| `50132300` | Eier / Eierextrakte (industrielles Verfahren)                          |      3 |
| `50132500` | Eier / Eierersatz                                                      |      4 |
| `50132600` | Molkerei-Nebenerzeugnis / Molkereiderivate                             |      1 |

**`50150000` Speiseöle / -Fette**

| Code       | Klasse                                  | Bricks |
| ---------- | --------------------------------------- | -----: |
| `50151500` | Speiseöl                                |      2 |
| `50151600` | Speisefett                              |      7 |
| `50151700` | Speiseöl- / Speisefett - Mischpackungen |      1 |

**`50160000` Süßwaren / Süßungsmittel**

| Code       | Klasse                                    | Bricks |
| ---------- | ----------------------------------------- | -----: |
| `50161500` | Zucker- / Zuckerersatzprodukte            |      3 |
| `50161800` | Süßwaren                                  |      4 |
| `50161900` | Süßwaren / Süßungsmittel - Mischpackungen |      1 |

**`50170000` Gewürze / Konservierungsstoffe / Extrakte**

| Code       | Klasse                                                     | Bricks |
| ---------- | ---------------------------------------------------------- | -----: |
| `50171500` | Kräuter / Gewürze / Extrakte                               |     10 |
| `50171700` | Essig / Kochweine                                          |      3 |
| `50171800` | Saucen / Aufstriche / Dips / Würzsaucen                    |     23 |
| `50171900` | Eingelegtes Gemüse / Relishes / Chutneys / Oliven          |      7 |
| `50172000` | Gewürze / Konservierungsstoffe / Extrakte - Mischpackungen |      1 |
| `50172100` | Hüllen für Lebensmittel                                    |      2 |

**`50180000` Brot / Backwaren**

| Code       | Klasse                            | Bricks |
| ---------- | --------------------------------- | -----: |
| `50181700` | Back- / Kochmischungen / Zutaten  |      7 |
| `50181900` | Brot                              |      3 |
| `50182000` | Süße Backwaren                    |      7 |
| `50182100` | Kekse / Gebäck                    |      6 |
| `50182200` | Herzhafte Backwaren               |      3 |
| `50182300` | Brot / Backwaren - Mischpackungen |      1 |

**`50190000` Bearbeitete / Verarbeitete Nahrungsmittel**

| Code       | Klasse                                                                       | Bricks |
| ---------- | ---------------------------------------------------------------------------- | -----: |
| `50191500` | Fertigsuppen                                                                 |      7 |
| `50192100` | Snacks / Knabberartikel                                                      |      7 |
| `50192300` | Desserts / Dessertersatz / Dessertsaucen / Garnierungen                      |     10 |
| `50192400` | Süße Aufstriche                                                              |      6 |
| `50192500` | Sandwiches / belegte Brötchen / Wraps                                        |      3 |
| `50192900` | Teigwaren / Nudeln                                                           |      6 |
| `50193000` | Baby- / Kleinkindernahrung                                                   |      5 |
| `50193100` | Gemüse-/Kartoffelbasierte Produkte/ -Gerichte                                |      6 |
| `50193200` | Getreidebasierte Produkte /- Gerichte                                        |      6 |
| `50193300` | Teigbasierte Produkte/- Gerichte                                             |      6 |
| `50193400` | Bearbeitete / Verarbeitete Nahrungsmittel - Mischpackungen                   |      1 |
| `50193500` | Fertigprodukte / Gerichte auf Basis von Molkereierzeugnissen/Ei-Erzeugnissen |      8 |
| `50193800` | Fertiggerichte aus mehreren Zutaten                                          |      7 |

**`50200000` Getränke**

| Code       | Klasse                                                        | Bricks |
| ---------- | ------------------------------------------------------------- | -----: |
| `50201700` | Kaffee / Tee / Ersatzprodukte                                 |      1 |
| `50202200` | Alkoholische Getränke (inklusive der alkoholfreien Varianten) |     23 |
| `50202300` | Alkoholfreie Getränke - trinkfertig                           |     20 |
| `50202400` | Alkoholfreie Getränke - nicht trinkfertig                     |     14 |
| `50202500` | Getränke - Mischpackungen                                     |      1 |
| `50202600` | Kaffee/Kaffeeersatz                                           |     10 |
| `50202700` | Tee und Kräutertee                                            |     10 |

**`50220000` Getreide- / Hülsenfruchtprodukte**

| Code       | Klasse                                                    | Bricks |
| ---------- | --------------------------------------------------------- | -----: |
| `50221000` | Getreide / Mehl                                           |      7 |
| `50221200` | Bearbeitete Getreideprodukte                              |      7 |
| `50221300` | Getreide- / Korn- / Hülsenfruchtprodukte - Mischpackungen |      1 |

**`50230000` Lebensmittel / Getränke – Mischpackungen**

| Code       | Klasse                                   | Bricks |
| ---------- | ---------------------------------------- | -----: |
| `50230100` | Lebensmittel / Getränke – Mischpackungen |      2 |

**`50240000` Fleisch / Geflügel / sonstige Tiere**

| Code       | Klasse                                                                  | Bricks |
| ---------- | ----------------------------------------------------------------------- | -----: |
| `50240100` | Fleisch / Geflügel / sonstige Tiere - bearbeitet / verarbeitet          |     35 |
| `50240200` | Fleisch / Geflügel / sonstige Tiere - nicht bearbeitet / verarbeitet    |     35 |
| `50240300` | Würste (Fleisch / Geflügel / sonstige Tiere) - bearbeitet / verarbeitet |      8 |

**`50250000` Obst - nicht bearbeitet / verarbeitet (frisch)**

| Code       | Klasse                                                          | Bricks |
| ---------- | --------------------------------------------------------------- | -----: |
| `50250600` | Zitrusfrüchte                                                   |     22 |
| `50250700` | Bananen                                                         |      5 |
| `50250800` | Kernobst                                                        |      8 |
| `50250900` | Steinobst                                                       |     14 |
| `50251000` | Beeren / Kleinobst                                              |     24 |
| `50251100` | Ananas                                                          |      1 |
| `50251200` | Kiwis                                                           |      2 |
| `50251300` | Annonen                                                         |      5 |
| `50251400` | Avocados                                                        |      3 |
| `50251500` | Kakifrüchte                                                     |      2 |
| `50251600` | Passionsfrüchte                                                 |      5 |
| `50251700` | Papayas                                                         |      2 |
| `50251800` | Pitahayas                                                       |      2 |
| `50251900` | Sonstiges Obst                                                  |     20 |
| `50252000` | Obst - nicht bearbeitet / verarbeitet (frisch) - Mischpackungen |      1 |

**`50260000` Gemüse (ohne Blattgemüse) – nicht bearbeitet / verarbeitet (frisch)**

| Code       | Klasse                                                            | Bricks |
| ---------- | ----------------------------------------------------------------- | -----: |
| `50260100` | Wurzel- / Knollengemüse                                           |     32 |
| `50260200` | Zwiebelgemüse                                                     |      6 |
| `50260300` | Tomaten                                                           |      6 |
| `50260400` | Paprika                                                           |      6 |
| `50260500` | Sonstige Nachtschattengewächse                                    |      6 |
| `50260600` | Gurken                                                            |      3 |
| `50260700` | Kürbisse - essbare Schale                                         |      5 |
| `50260800` | Melonen                                                           |      8 |
| `50260900` | Kürbisse - ungenießbare Schale                                    |      2 |
| `50261000` | Sonstige Gemüse                                                   |      4 |
| `50261100` | Kohlgemüse                                                        |     25 |
| `50261300` | Kräuter                                                           |     41 |
| `50261400` | Bohnen (mit Hülsen)                                               |      9 |
| `50261500` | Erbsen (mit Hülsen)                                               |      6 |
| `50261600` | Stängelgemüse                                                     |     10 |
| `50261700` | Pilze                                                             |     12 |
| `50261800` | Gemüse - nicht bearbeitet / verarbeitet (frisch) - Mischpackungen |      1 |
| `50261900` | Mikrogemüse                                                       |      2 |
| `50262000` | Essbare Blumen                                                    |      1 |
| `50262100` | Gemüse aus dem Meer                                               |      5 |
| `50262200` | Kichererbsen                                                      |      1 |
| `50262300` | Sukkulente                                                        |      1 |
| `50262400` | Farnpflanzen                                                      |      3 |
| `50262500` | Sapote                                                            |      4 |
| `50262600` | Zuckerrohr                                                        |      1 |
| `50262700` | Seggen / Riedgras                                                 |      1 |

**`50270000` Obst - nicht bearbeitet / verarbeitet (tiefgefroren)**

| Code       | Klasse                                               | Bricks |
| ---------- | ---------------------------------------------------- | -----: |
| `50270100` | Obst - nicht bearbeitet / verarbeitet (tiefgefroren) |      1 |

**`50290000` Gemüse - nicht bearbeitet / verarbeitet (tiefgefroren)**

| Code       | Klasse                                                 | Bricks |
| ---------- | ------------------------------------------------------ | -----: |
| `50290100` | Gemüse - nicht bearbeitet / verarbeitet (tiefgefroren) |      1 |

**`50310000` Obst - nicht bearbeitet / verarbeitet (ohne Kühlung haltbar)**

| Code       | Klasse                                                       | Bricks |
| ---------- | ------------------------------------------------------------ | -----: |
| `50310100` | Obst - nicht bearbeitet / verarbeitet (ohne Kühlung haltbar) |      1 |

**`50320000` Gemüse - nicht bearbeitet / verarbeitet (ohne Kühlung haltbar)**

| Code       | Klasse                                                         | Bricks |
| ---------- | -------------------------------------------------------------- | -----: |
| `50320100` | Gemüse - nicht bearbeitet / verarbeitet (ohne Kühlung haltbar) |      1 |

**`50330000` Nüsse / Samen - nicht bearbeitet / verarbeitet (leicht verderblich)**

| Code       | Klasse                                                              | Bricks |
| ---------- | ------------------------------------------------------------------- | -----: |
| `50330100` | Nüsse / Samen - nicht bearbeitet / verarbeitet (leicht verderblich) |      1 |

**`50340000` Nüsse / Samen – nicht bearbeitet / verarbeitet (in der Schale)**

| Code       | Klasse                                                         | Bricks |
| ---------- | -------------------------------------------------------------- | -----: |
| `50340100` | Nüsse / Samen – nicht bearbeitet / verarbeitet (in der Schale) |      1 |

**`50350000` Blattgemüse - nicht bearbeitet / verarbeitet (frisch)**

| Code       | Klasse                                                                 | Bricks |
| ---------- | ---------------------------------------------------------------------- | -----: |
| `50350100` | Blätter der Wegwarte                                                   |      8 |
| `50350200` | Kopfsalat                                                              |      4 |
| `50350300` | Lose Blätter / Multiblattsalate                                        |      4 |
| `50350400` | Salatgrün in einzelnen Blättern                                        |      7 |
| `50350500` | Spinat (frisch)                                                        |      4 |
| `50350600` | Blattgemüse - nicht bearbeitet / verarbeitet (frisch) - Mischpackungen |      1 |
| `50350700` | Spargelsalat                                                           |      1 |

**`50360000` Frische Garnierung (Lebensmittel)**

| Code       | Klasse                            | Bricks |
| ---------- | --------------------------------- | -----: |
| `50360100` | Frische Dekoration (Lebensmittel) |      3 |

**`50370000` Obst/Gemüse Frisch & Fresh Cut**

| Code       | Klasse                                                             | Bricks |
| ---------- | ------------------------------------------------------------------ | -----: |
| `50370100` | Obst/Gemüse - Mischpackungen nicht verarbeitet/bearbeitet (frisch) |      1 |
| `50370200` | Obst/Gemüse - Mischpackungen - Fresh Cut                           |      1 |

**`50380000` Obst / Gemüse Fresh-Cut**

| Code       | Klasse             | Bricks |
| ---------- | ------------------ | -----: |
| `50380100` | Obst - Fresh Cut   |     15 |
| `50380200` | Gemüse - Fresh Cut |     33 |

**`50390000` Ersatzprodukte für Fleisch/Fisch/Meeresfrüchte**

| Code       | Klasse                           | Bricks |
| ---------- | -------------------------------- | -----: |
| `50390100` | Fleischersatz                    |      7 |
| `50390200` | Fischersatz                      |      7 |
| `50390300` | Ersatzprodukte für Meeresfrüchte |      7 |

**`50400000` Insekten (essbar)**

| Code       | Klasse                                                   | Bricks |
| ---------- | -------------------------------------------------------- | -----: |
| `50400100` | Insekten (essbar) – bearbeitet / verarbeitet             |     10 |
| `50400200` | Insekten (essbar) – nicht bearbeitet / nicht verarbeitet |     10 |

**`50410000` Essbare Produkte tierischen Ursprungs**

| Code       | Klasse                                                                 | Bricks |
| ---------- | ---------------------------------------------------------------------- | -----: |
| `50410100` | Essbare Produkte tierischen Ursprungs – bearbeitet / verarbeitet       |      2 |
| `50410200` | Essbare Produkte tierischen Ursprungs – nicht bearbeitet / verarbeitet |      1 |

## Sources

- [GS1 Germany, GPC Produktklassifikation](https://www.gs1-germany.de/standards/produktklassifikation-gpc/)
- [GPC Browser](https://gpc-browser.gs1.org/)
- [GPC Development & Implementation Guide 8.0 (PDF)](https://www.gs1-germany.de/fileadmin/gs1/fachpublikationen/GPC_Development_and_Implementation_Guide_8.0.pdf)
- [GPC Leitfaden zur Entwicklung & Einführung 8.0 (PDF)](https://www.gs1-germany.de/fileadmin/gs1/fachpublikationen/GPC_Leitfaden_zur_Entwicklung___Einf%C3%BChrung_8.0.pdf)
- [ECR, Warengruppenklassifikation](https://www.ecr.digital/book/demand-side-prozesse/warengruppenklassifikation/)
- [ECR, Global Product Classification](https://www.ecr.digital/book/gs1-standards/global-product-classification-gpc/)
- [GS1, GPC standard archive](https://ref.gs1.org/standards/gpc/archive)
