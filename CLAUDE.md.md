# ☯️ Focus App — Projectbriefing

## Overzicht

Een mobile-first PWA voor Bica: een alleenstaande moeder met ADD die structuur nodig heeft zonder overweldiging. Geïnspireerd op Structuro.ai, maar met betere UX, exterbrain-koppeling, en zonder de bugs/beperkingen van het origineel.

**Hosting:** GitHub Pages (jesuisbicabi.github.io/focus-app) **Tech:** Single-file HTML/CSS/JS (zoals haar andere apps), localStorage voor lokale state **Data:** Koppeling met exterbrain-connector (Google Sheets via Apps Script) **Doelgroep:** Eén gebruiker (Bica), mobiel gebruik op Samsung A54/S25, Firefox browser

\---

## Kernfilosofie

* **Maximaal 3 taken per dag.** De rest bestaat even niet.
* **Eén ding tegelijk.** Geen overweldigende lijsten.
* **Drie momenten:** Dagstart → Focus → Dagafsluiting
* **Laagdrempelig.** Twee minuten om te starten, twee minuten om af te sluiten.
* **Past zich aan jou aan.** Sla een dag over, geen score, schoon scherm.

\---

## Connector-integratie (Exterbrain)

### Bestaande tools (via MCP connector "my connector"):

* `exterbrain\_opvragen` — Taken/notities ophalen uit het tweede brein
* `exterbrain\_toevoegen` — Taak/notitie toevoegen
* `exterbrain\_bijwerken` — Item markeren als afgerond, heropenen, etc.

### Hoe de app ze gebruikt:

* **Taken ophalen:** Bij het laden van de app worden taken opgehaald via de connector
* **Nieuwe taak:** Via de app aangemaakt → wordt via connector naar exterbrain gestuurd
* **Taak voltooien:** Via de app afgevinkt → wordt via connector bijgewerkt
* **Parkeergedachte → taak:** Kan omgezet worden naar een exterbrain-taak

### Belangrijk:

* `meteen\_goedkeuren` moet altijd op `False` staan (Bica reviewt eerst)
* Categorie exact overnemen van bestaande categorieën (check eerst!)
* De app is een FRONTEND die de connector aanroept — de connector is de bron van waarheid

### Bestaande categorieën in exterbrain:

Werk · Computer \& tech · Financiën · Fotografie · Joa · Huishouden · Persoonlijk · verzekering · films \& series

### Bestaande tijdsduur-opties:

5 min · 7,5 min · 15 min · 30 min · 1 uur · meer dan 1 uur

### Prioriteit → Energie mapping:

Het exterbrain heeft "prioriteit" (hoog/gemiddeld/laag), de focus-app werkt met "energie" (makkelijk/normaal/intensief). Dit zijn twee verschillende dingen. De app gebruikt de `tijdsduur` als primaire indicatie voor energie-inschatting:

* **Makkelijk** (🟢): 5 min, 7,5 min, 15 min
* **Normaal** (🔵): 30 min, 1 uur
* **Intensief** (🟣): meer dan 1 uur
* Bij het aanmaken van taken via de focus-app wordt het energie-niveau als tag opgeslagen in het notitie-veld van de exterbrain-taak (bijv. "\[makkelijk]")
* Taken zonder tijdsduur → standaard "normaal"

### Offline fallback:

* Als de connector niet bereikbaar is: taken lokaal opslaan in localStorage
* Bij volgende sync: lokale taken doorsturen naar connector
* Visuele indicator wanneer offline (subtiel, niet alarmerend)

\---

## Schermen \& Flow

### 0\. Bottom Navigation (altijd zichtbaar)

Vier tabs, iconen + labels:

|Tab|Icoon|Label|
|-|-|-|
|☀️|zon|Start|
|☑️|vinkje|Taken|
|💭|gedachtewolk|Brein|
|🌙|klok|Dagafsluiting|

Actieve tab: blauw/donker. Inactieve: grijs.

**Let op:** Focus/timer is GEEN eigen tab — die start je vanuit een taak (via de ▶️ knop of "Start focus"). Net als in Structuro.

\---

### 1\. DAGSTART (tab: Start)

#### Scherm 1a: Energiekeuze

* Begroeting op basis van tijd: "Goedemorgen", "Goedemiddag", "Goedenavond"
* Naam: "bi" (hardcoded of uit localStorage-instelling)
* Warme sfeerbol (concentrische cirkels, zacht oranje/geel — zoals Structuro's openingsscherm)
* Vraag: **"Hoe is je energie?"**
* Drie keuzes met batterij-iconen:

  * 🔋 **Laag** (leeg batterij)
  * 🔋 **Normaal** (half batterij)
  * 🔋 **Hoog** (vol batterij)
* \-Een veld om een korte notitie toe te voegen waardoor mijn energie-level op dat moment zo is

**ENERGIEMETING MEERDERE KEREN PER DAG:**

* Niet alleen bij dagstart, maar ook bij heropenen van de app na 2+ uur
* Sla elke meting op met tijdstip (localStorage: array van {tijd, niveau})
* Energielabel rechtsboven het hoofdscherm toont altijd het LAATSTE niveau
* Bij heropenen na 2+ uur: toon de energievraag opnieuw (zachtere versie, niet de hele dagstart-flow — alleen de energiekeuze, daarna door naar hoofdscherm)
* Minimaal 1x, maximaal \~3-4x per dag (bij elke heropening na 2+ uur)

#### Scherm 1b: Wie kiest de taken?

* Titel: **"Wie kiest je taken?"**
* Subtitel: "Laat de app voor je denken, of kies zelf?"
* Twee kaarten:

  * ✨ **App kiest** — "Past bij \[energieniveau]" (lichtblauw, geselecteerd bij laag)
  * 📋 **Ik kies zelf** — "Swipe per taak"
* Bij "App kiest": app selecteert automatisch max 3 taken uit exterbrain, afgestemd op energieniveau (makkelijke taken bij laag, intensieve bij hoog)
* Bij "Ik kies zelf": toon taken één voor één, swipe rechts = vandaag, links = niet vandaag

#### Scherm 1c: Hoofdscherm (na keuze)

* Begroeting + naam + energielabel rechts ("Laag"/"Normaal"/"Hoog")
* Dag + tijd
* Voortgang: "VANDAAG · 1 VAN 3" + blauwe voortgangsbalk + "0M VAN 15M"
* **Lichte taakkaart** (wit met subtiele schaduw, NIET donker):

  * 🟢 "Nu aan zet" + tijdsindicatie ("2 min · Kernfocus")
  * Taaknaam groot en bold
  * Microstappen-sectie (inklapbaar)
  * Groene "Start focus" button
  * Energie-kleur als subtiele accent (linkerborder of klein label)
* Onderaan: "Nieuwe taak toevoegen..." input

#### Als de 3 taken van vandaag klaar zijn:

* Groot groen vinkje ✅
* **"Alles gedaan voor nu."**
* Twee opties (niet pusherig, wel uitnodigend):

  * **"Ik wil nog een taak doen"** → kies een volgende taak uit je lijst (weer op basis van huidig energieniveau)
  * **"Klaar voor vandaag"** → terug naar hoofdscherm
* Er is geen limiet op hoeveel taken je kúnt doen — de 3 is het startpunt, niet het plafond
* Na elke extra taak komt dezelfde keuze terug

\---

### 2\. TAKEN (tab: Taken)

* Titel: **"Taken"**
* Subtitel: "Maximaal 3. De rest bestaat even niet."
* Sectie: "Geen taken gekozen voor vandaag" (als dagstart niet gedaan)
* Sectie: "Vandaag voltooid · X" met "tonen" link
* Sectie: **"Geparkeerde gedachten"** — max 10, met "Maak taak" en "Weg" per item
* Sectie: **"Alle open taken"** gegroepeerd op energie:

  * 🟢 MAKKELIJK (0)
  * 🔵 NORMAAL (0)
  * 🟣 INTENSIEF (0)
  * Per taak: naam (afgekapt), herhaling, stappen, tijd, knoppen: ▶️ bewerk 🗑️ ✅

#### Nieuwe taak toevoegen (bottom sheet / modal):

Stapsgewijze wizard — NIET de verwarrende Structuro zinsconstructie.

**Stap 1: Wat ga je doen?**

* Tekstveld met placeholder "Wat ga je doen?"
* "verder →"

**Stap 2: Energie — Hoeveel vraagt het?**

* Drie kaarten met batterij-iconen:

  * 🟢 **Makkelijk** — "Lage energie"
  * 🔵 **Normaal** — "Gewoon doen"
  * 🟣 **Intensief** — "Hele batterij"
* "← terug"

**Stap 3: Tijd — Hoe lang denk je?**

* Knoppen: 15 min / 30 min / 1 uur / 90 min
* "eigen" knop (gestippeld) → slider + getalveld (WERKEND, niet het Structuro-bug-veld)
* "← terug"

**Stap 4: Planning** Opgesplitst in nette secties (NIET de Structuro zinsconstructie):

**DAG:**

* Geen geplande tijd / Vandaag / Morgen / Kies datum (→ werkende datumpicker)

**DEADLINE:** (apart van dag!)

* Geen / Vandaag / Morgen / Kies datum

**HERHALING:** Snelkeuzes:

* Eenmalig / Dagelijks / Werkdagen / Wekelijks / Maandelijks

Volledig flexibel ("Eigen interval"):

* **Elke \[getal] \[eenheid]** — waar eenheid = dagen / weken / maanden
* Voorbeelden: elke 3 dagen, elke 2 weken, elke 6 maanden
* Werkend getalveld (number input, min=1, goed leegmaakbaar!)
* Optie: "na afvinken" (interval telt vanaf voltooiing) of "vast" (vaste kalenderdag)
* Bij wekelijks: kies dag(en) van de week (ma-zo, meerdere mogelijk)
* Bij maandelijks: kies dag van de maand (1-28) of "laatste dag"

**Stap 5: Microstappen**

* Vraag: **"In micro-stappen?"**
* Drie opties:

  * 🤖 **"Ja, stel voor"** — AI genereert microstappen (toekomstige feature, via Claude API)
  * ✍️ **"Zelf typen"** — handmatig stappen toevoegen
  * **"Nee, klaar"** — geen microstappen
* Bij zelf typen: invulveld + "+ stap toevoegen"
* Stappen met nummering, verwijder-knop (×)

**Stap 6: Bevestiging**

* Samenvatting van alles (als tags: "Taak naam", "Makkelijk", "30 min", "Vandaag", "Wekelijks")
* **"Taak opslaan →"** ← GROTE DUIDELIJKE OPSLAAN-KNOP
* "← terug"

Na opslaan:

* Groene vinkje animatie
* **"Toegevoegd."**
* "Taak staat klaar in je takenlijst."
* Toast onderaan bevestiging

\---

### 3\. BREIN (tab: Brein)

Dit is waar alle niet-taken leven: hersenspinsels, dingen om te onthouden, filmtips, technische notities, herinneringen. Alles wat je exterbrain nu als "notitie" opslaat.

* Titel: **"Brein"**
* Subtitel: "Alles wat je wilt onthouden"

#### Notities-lijst:

* Gegroepeerd op categorie (Computer \& tech, Fotografie, films \& series, Joa, Persoonlijk, Werk, etc.)
* Per notitie: korte preview + datum
* Tik om volledig te lezen
* Knoppen per notitie: ✏️ bewerk | 🗑️ verwijder | ☑️ maak taak (zet om naar taak)
* Zoekbalk bovenaan om te filteren

#### Nieuwe notitie toevoegen:

* Invulveld onderaan: "Iets onthouden..." + ➕
* Optioneel: categorie kiezen (of automatisch op basis van inhoud)
* Wordt via connector naar exterbrain gestuurd als type "notitie"

#### Parkeergedachten:

* Gedachten die tijdens een focus-sessie zijn geparkeerd verschijnen hier bovenaan
* Met opties: "Maak taak" | "Bewaar als notitie" | "Weg"
* Max 10 parkeergedachten

\---

### 4\. FOCUS (gestart vanuit een taak, geen eigen tab)

#### Scherm 3a: Focus-intro (na klik "Start focus")

* Lichte, rustige achtergrond (consistent met rest van app)
* Groot nummer (taaknummer)
* "NU AAN ZET"
* Taaknaam groot
* Sfeerwoord op basis van energie: "Rustig" (laag) / "Gestaag" (normaal) / "Vol gas" (hoog)
* Groene timer-cirkel met tijd (nog niet gestart)
* Microstappen-sectie (inklapbaar, als ze er zijn)
* Onderaan: "Nu niet" link + groene **"Start focus sessie"** knop

#### Scherm 3b: Focus actief (timer loopt)

* Lichte achtergrond (rustig, niet afleidend)
* "NU AAN ZET" + taaknaam + sfeerwoord
* **Groene cirkel-timer** met aftelling (MM:SS) en "VAN X MINUTEN"
* Cirkel animeert mee met de tijd (stroke-dashoffset)

**VERBETERING t.o.v. Structuro — Layout onderaan:**

De volgende elementen zijn GESCHEIDEN in duidelijke zones, niet over elkaar heen:

**Zone 1: Microstappen** (inklapbaar)

* Checkboxes met tekst, actieve stap gemarkeerd (paarse rand links)
* Afvinken pauzeert NIET automatisch de timer
* "Nieuwe stap toevoegen..." invulveld
* Voortgang: "0 van 4 klaar" met mini-balkjes

**Zone 2: Hoofdacties**

* Grote groene **"Voltooien ✓"** knop (volledige breedte)

**Zone 3: Timer-controls** (fixed aan onderkant, geen overlap)

* Drie knoppen naast elkaar: ⏸️ Pauze | ⏱️ +5 min | ⏹️ Stop
* Duidelijk gescheiden van microstappen

**Zone 4: Parkeergedachte** (altijd zichtbaar, eigen ruimte)

* ☆ Invulveld "Parkeer een gedachte" + blauwe "Bewaar" knop
* Opgeslagen gedachten gaan naar de "Geparkeerde gedachten" sectie in Taken-tab
* Max 10 parkeergedachten

Bij pauze: "GEPAUZEERD" label rechtsboven, Pauze-knop wordt "Hervat"

\---

### 5\. DAGAFSLUITING (tab: Dagafsluiting)

#### Scherm 4a: Overzicht

* "VANDAAG"
* **"Dit heb je gedaan."**
* Lijst van voltooide taken met tijdstip (groen vinkje)
* "verder →"

#### Scherm 4b: Gevoel

* "EN VANDAAG"
* **"Hoe voelt het?"**
* Drie sfeer-bollen:

  * 🩶 **Zwaar** (grijs)
  * 🩷 **Oké** (roze/rood)
  * 💚 **Trots** (groen)

#### Scherm 4c: Afsluiting

* Zachte sfeerbol (kleur op basis van keuze)
* **"De dag is voorbij."**
* "Vandaag voelde \[keuze]." (gekleurd woord)
* Een veld om een notitie van die dag toe te voegen

#### Scherm 4d: Klaar

* **"Dagafsluiting voltooid!"**
* "Ik ben trots op je! Rust goed uit. Tot morgen 💞"

\---

## Design Specificaties

### Kleuren

```css
:root {
  /\* Achtergronden \*/
  --bg-main: #F0F2F7;           /\* Lichtgrijs-blauw, Structuro-achtig \*/
  --bg-card: #FFFFFF;            /\* Witte kaarten \*/
  --bg-card-accent: #F7F9FC;    /\* Licht accent voor taakkaart/focus (zachtblauw-wit) \*/
  
  /\* Energie-kleuren \*/
  --energy-easy: #34C759;        /\* Groen - Makkelijk \*/
  --energy-normal: #3478F6;      /\* Blauw - Normaal \*/
  --energy-intense: #8B5CF6;     /\* Paars - Intensief \*/
  
  /\* Accentkleuren \*/
  --accent-green: #34C759;       /\* Voltooien, bevestigingen \*/
  --accent-blue: #3478F6;        /\* Links, actieve selectie \*/
  --accent-focus-green: #30D158; /\* Timer-cirkel \*/
  
  /\* Tekst \*/
  --text-primary: #1A2332;       /\* Hoofdtekst \*/
  --text-secondary: #8E8E93;     /\* Subtekst, labels \*/
  --text-on-dark: #FFFFFF;       /\* Tekst op donkere achtergrond \*/
  --text-label: #6B7280;         /\* VANDAAG, ENERGIE etc labels \*/
  
  /\* Gevoel-kleuren (dagafsluiting) \*/
  --feel-heavy: #FF6B9D;         /\* Zwaar - roze \*/
  --feel-ok: #9CA3AF;            /\* Oké - grijs \*/
  --feel-proud: #60A5FA;         /\* Trots - blauw \*/
}
```

### Typografie

* **Geen Inter, Roboto, Arial of system fonts**
* Gebruik een warme, toegankelijke combinatie
* Headings: een ronde, vriendelijke sans-serif (bijv. Nunito, Quicksand, of Outfit)
* Body: leesbaar en rustig
* Labels (VANDAAG, ENERGIE): letter-spacing: 0.15em, uppercase, klein, --text-label kleur

### Layout

* **Mobile-first**: max-width 480px, gecentreerd
* Kaarten: border-radius 16-20px, subtiele shadow
* Knoppen: border-radius 12-14px, min-height 48px (touch-friendly)
* Spacing: ruim, ademend, niet propvol
* Bottom nav: fixed, 60px hoog, witte achtergrond met subtiele top-border

### Animaties

* Pagina-overgangen: zachte fade of slide
* Timer-cirkel: vloeiende SVG stroke-dashoffset animatie
* Voltooien: satisfying vinkje-animatie (scale + fade)
* Energiekeuze: zachte pulse op de sfeerbol
* Parkeergedachte bewaard: korte slide-up bevestiging

\---

## Technische Architectuur

### Single HTML file

Alles in één bestand (zoals de projectbeheer-app):

* HTML structuur met sections per scherm (display:none/block voor navigatie)
* CSS variabelen bovenaan
* Vanilla JS onderaan

### State Management

localStorage voor:

* `focusapp\_energy` — gekozen energieniveau vandaag
* `focusapp\_today\_tasks` — geselecteerde taken voor vandaag (IDs)
* `focusapp\_completed` — voltooide taken vandaag (met tijdstip)
* `focusapp\_parked` — geparkeerde gedachten (array, max 10)
* `focusapp\_settings` — naam, voorkeuren
* `focusapp\_timer` — timer state (running/paused/stopped, remaining seconds)
* `focusapp\_feeling` — dagafsluiting gevoel
* `focusapp\_date` — datum van huidige sessie (reset bij nieuwe dag)

### Connector-aanroepen

De app draait als standalone HTML. Connector-aanroepen worden gedaan wanneer:

1. App opent → taken ophalen uit exterbrain
2. Nieuwe taak opslaan → toevoegen aan exterbrain
3. Taak voltooien → bijwerken in exterbrain
4. Parkeergedachte → taak → toevoegen aan exterbrain

**Implementatie:** De connector-calls worden via de Claude chat/connector gedaan, niet direct vanuit de HTML. De app slaat taken lokaal op en synchroniseert via de connector wanneer beschikbaar. Alternatief: directe Google Sheets API calls via Apps Script web app URL (zoals de voorraad-app).

### Timer

* JavaScript setInterval, elke seconde
* Bewaar state in localStorage (zodat bij page refresh de timer doorgaat)
* Visuele cirkel via SVG `stroke-dasharray` / `stroke-dashoffset`
* Audio/vibration alert bij einde (als browser het toestaat)

\---

## Verbeteringen t.o.v. Structuro

|Probleem Structuro|Onze oplossing|
|-|-|
|Donkere taakkaart (onnodig zwaar)|Lichte, rustige kaarten — consistent met hele app|
|Energiemeting alleen bij dagstart|Opnieuw meten bij heropenen na 2+ uur|
|Geen optie om op elk gewenst energie te meten|Button toevoegen om op elk gewenst energie te meten|
|Focus-scherm: knoppen over microstappen heen|Gescheiden zones met eigen ruimte|
|Microstap afvinken pauzeert timer automatisch|Timer loopt door, pauze is handmatig|
|Planning als verwarrende zinsconstructie|Losse secties: DAG / DEADLINE / HERHALING|
|Geen opslaan-knop bij taak aanmaken|Duidelijke "Taak opslaan →" knop als laatste stap|
|Geen maandelijkse herhaling|Toegevoegd|
|Geen zelf in te stellen herhaling|Zelf toe te voegen herhaling om op elke gewenste dag zelf in te stellen mogelijk maken|
|Getalveld "Elke X dagen" — 1 niet verwijderbaar|Werkend number input veld|
|Datumpicker werkt niet (in sommige browsers)|Native HTML date input als fallback|
|Taak aanmaken vanuit startscherm loopt vast|Consistent werkend vanuit elke plek|
|Microstappen-tekst afgekapt zonder tooltip|Volledige tekst zichtbaar of uitklapbaar|

\---

## Fasering

### Fase 1: Basis (eerste sessie Claude Code)

* \[ ] HTML/CSS structuur met alle schermen
* \[ ] Bottom navigation
* \[ ] Dagstart flow (energie → takenkeuze)
* \[ ] Taken-tab met lijst en nieuwe-taak-wizard
* \[ ] localStorage voor alle state
* \[ ] Responsive mobile design

### Fase 2: Focus \& Timer

* \[ ] Focus-sessie met werkende timer
* \[ ] Cirkel-animatie
* \[ ] Microstappen in focus-scherm
* \[ ] Parkeergedachte
* \[ ] Pauze/+5min/Stop knoppen (gescheiden layout!)

### Fase 3: Dagafsluiting \& Polish

* \[ ] Dagafsluiting flow
* \[ ] Animaties en overgangen
* \[ ] PWA manifest (installeerbaar op homescreen)
* \[ ] Service worker voor offline gebruik

### Fase 4: Exterbrain-koppeling

* \[ ] Taken ophalen via Apps Script web app URL
* \[ ] Taken opslaan/bijwerken via Apps Script
* \[ ] Sync-indicator
* \[ ] Offline queue

### Fase 5: AI-microstappen (optioneel, later)

* \[ ] Claude API call voor microstappen-suggesties
* \[ ] "Stel voor" knop in de wizard

\---

## Bestandslocatie

* Repository: `jesuisbicabi/focus-app`
* NAS project: `\\\\serverDS216\\Back-Up\\projecten\\focus-app\\`
* Live URL: `https://jesuisbicabi.github.io/focus-app/`

---

## Voortgang — samenvoegplan (bijgewerkt door Claude Code, 19 juli 2026)

Los van bovenstaande oorspronkelijke fasering loopt er een apart plan om focus-app, de inspreek-app (AI-agent) en Extern Brein samen te voegen. Opdracht gegeven via Claude-chat op 17 juli: fase 1 fix notitie→taak, fase 2 inspreken overzetten, fase 2b gedaan-archief, fase 3 inbox-stap eruit, fase 4 Extern Brein uitfaseren (pas na een week probleemloos draaien).

### Gedaan (getest en live, commits t/m `f69b57c`)

* **Fase 1 — notitie → taak**: ☑️ bij een notitie in de Brein-tab opent de taak-wizard vooringevuld; bij opslaan verdwijnt de notitie en wordt de categorie overgenomen als taak-categorie.
* **Taak → notitie (omgekeerd)**: nieuwe 📝-knop bij taken doet het spiegelbeeld — opent het categoriekeuzescherm met de taaknaam vooringevuld, taak wordt bij opslaan verwijderd en verschijnt als notitie.
* **Fase 2 — inspreken**: microfoonknop (🎙️) met spraak-naar-tekst + Claude-opmaak (verwijdert "eh"'s, haperingen, dubbele woorden), nu aanwezig in drie velden: "Iets onthouden" (Brein), de toelichting bij een energiemeting, en de dagnotitie bij Dagafsluiting. Gebruikt dezelfde Anthropic-sleutel als de bestaande AI-zoekfunctie (`eb_api_key`, in te stellen via ⚙️ bij Zoeken in Brein). **Werkt alleen in Chrome, niet in Firefox** (Web Speech API-beperking) — bevestigd werkend door de user zelf op haar telefoon.
* **Inklapbare energie-groepen in Taken-tab**: chevron bij elke groep-header, klapt in/uit, persistent in localStorage; taken binnen een groep nieuwste-eerst gesorteerd.
* **Groen icoon voor de Taken-tab** in de onderste navigatiebalk (eigen SVG i.p.v. de ☑️-emoji, die op de meeste toestellen grijs/wit rendert). Het ☑️-vinkje bij notities in Brein is bewust grijs gelaten — dat is het "nog geen taak"-signaal.
* **"Alles openen"/"Alles sluiten"** voor de categorieën in de Brein-tab, naast het bestaande per-categorie klikgedrag (dat blijft ongewijzigd).
* **Obsidian-koppeling voor de dagafsluiting-notitie**: schrijft energie/voltooide taken/dagnotitie naar het vitality-monitor-maandbestand in de `obsidian-vault`-repo (eigen GitHub-token, los van de Anthropic-sleutel). Let op: dit is een simpele/platte-tekst-koppeling — géén apart dagbestand per dag en géén Claude-opmaak zoals AI-agent dat wél doet voor het dagboek.

### Nog te doen / bekende openstaande punten

* **Fase 2b** (gedaan-archief: zoeken + per categorie), **fase 3** (inbox-stap eruit) en **fase 4** (Extern Brein uitfaseren) zijn nog niet gestart.
* **Inspreken via het Samsung Galaxy Watch (Wear OS)** — bewust geparkeerd op verzoek van de user. Wear OS heeft geen volwaardige browser, dus de huidige mic-knop werkt daar niet. Drie richtingen besproken (workaround via bestaande Wear OS-notitie-app / voice-routine naar de bestaande "connector"-Cloudflare-Worker / eigen native Wear OS-app), nog geen keuze gemaakt.
* De drie microfoonvelden zijn met een neptranscript en gemockte AI-respons getest (logica klopt, inclusief twee kleine bugs die zijn gefixt: blijven hangen van een knop bij wisselen tussen microfoons, en een placeholder die op "Aan het luisteren…" bleef staan). **Echte spraakherkenning is niet automatisch te testen** — dat heeft de user zelf gedaan voor de Brein-mic (werkt), de twee nieuwe velden (energie-toelichting, dagnotitie) zijn nog niet apart door haar bevestigd.
* Drie bestanden staan nog untracked in de werkmap en horen niet in git: `github_pat_11B5U37AY0EzxGZ6jg50C1_s.txt` (plaintext GitHub-token, wacht op revoke door de user) en twee gespreklogs (`10-07-26 Code gesprek.txt`, `10-07-26 Fable gesprek.txt`).
* Oudere openstaande punten uit `EERST-LEZEN-focus-app.md` (bv. de sync-bug rond het schrijven naar de Google Sheet) zijn in deze sessie niet opnieuw gecontroleerd — status daarvan is dus onbekend, niet per ongeluk als "opgelost" lezen.
