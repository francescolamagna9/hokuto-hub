const PHASES = [
  {
    id: 1, title: 'Brief & Setup',
    groups: [
      {
        name: 'Documento Brief',
        items: [
          { id: 'b1', text: 'Ricevere e leggere il Project Bible completo', tags: ['critico'] },
          { id: 'b2', text: 'Caricare il brief nell\'app e verificare i dati estratti', tags: [] },
          { id: 'b3', text: 'Verificare dominio e DNS configurati correttamente', tags: ['critico'] },
          { id: 'b4', text: 'Creare account cliente su WordPress', tags: [] },
          { id: 'b5', text: 'Installare WordPress e impostare lingua italiana', tags: [] },
          { id: 'b6', text: 'Configurare permalink: /%postname%/', tags: ['seo'] },
          { id: 'b7', text: 'Disabilitare commenti di default', tags: [] },
          { id: 'b8', text: 'Impostare fuso orario Europa/Roma', tags: [] },
        ]
      }
    ]
  },
  {
    id: 2, title: 'Template & WordPress',
    groups: [
      {
        name: 'Template & Design',
        items: [
          { id: 't1', text: 'Acquistare o scaricare il template da Envato/Themeforest', tags: ['critico'] },
          { id: 't2', text: 'Installare il template e il child theme', tags: [] },
          { id: 't3', text: 'Importare demo del template come base', tags: [] },
          { id: 't4', text: 'Eliminare pagine demo non necessarie', tags: [] },
          { id: 't5', text: 'Installare plugin richiesti dal template', tags: ['warn'] },
        ]
      },
      {
        name: 'Impostazioni WordPress',
        items: [
          { id: 'wp1', text: 'Installare Yoast SEO o Rank Math', tags: ['seo'] },
          { id: 'wp2', text: 'Installare Contact Form 7', tags: [] },
          { id: 'wp3', text: 'Installare plugin GDPR/Cookie', tags: ['critico'] },
          { id: 'wp4', text: 'Configurare backup automatico', tags: ['warn'] },
          { id: 'wp5', text: 'Impostare WP Mail SMTP', tags: ['critico'] },
          { id: 'wp6', text: 'Disabilitare plugin non usati', tags: [] },
        ]
      }
    ]
  },
  {
    id: 3, title: 'Stile Globale',
    groups: [
      {
        name: 'Colori & Tipografia',
        items: [
          { id: 's1', text: 'Impostare palette colori dal brief nel customizer', tags: ['critico'] },
          { id: 's2', text: 'Caricare i font del brand (Google Fonts o upload)', tags: [] },
          { id: 's3', text: 'Impostare dimensioni e pesi tipografici per H1-H6', tags: [] },
          { id: 's4', text: 'Verificare contrasto colori per accessibilità', tags: ['warn'] },
          { id: 's5', text: 'Impostare colori link e hover states globali', tags: [] },
          { id: 's6', text: 'Definire bottoni primari e secondari con stile brand', tags: [] },
        ]
      },
      {
        name: 'Header',
        items: [
          { id: 'h1', text: 'Caricare logo (SVG o PNG @2x)', tags: ['critico'] },
          { id: 'h2', text: 'Configurare menu principale', tags: [] },
          { id: 'h3', text: 'Aggiungere CTA header (es. telefono o "Contattaci")', tags: [] },
          { id: 'h4', text: 'Verificare header sticky e comportamento scroll', tags: ['warn'] },
          { id: 'h5', text: 'Configurare header mobile/hamburger', tags: [] },
        ]
      }
    ]
  },
  {
    id: 4, title: 'Costruzione Pagine',
    groups: [
      {
        name: 'Home',
        items: [
          { id: 'p1', text: 'Hero section con headline, sottotitolo e CTA principale', tags: ['critico'] },
          { id: 'p2', text: 'Sezione servizi/prodotti in anteprima', tags: [] },
          { id: 'p3', text: 'Sezione "Chi siamo" sintetica', tags: [] },
          { id: 'p4', text: 'Sezione testimonianze/recensioni', tags: [] },
          { id: 'p5', text: 'Sezione CTA finale con contatto', tags: [] },
          { id: 'p6', text: 'Ottimizzare immagini hero (WebP, dimensioni corrette)', tags: ['seo'] },
        ]
      },
      {
        name: 'Pagine Interne',
        items: [
          { id: 'pi1', text: 'Creare pagina Chi Siamo con storia e valori', tags: [] },
          { id: 'pi2', text: 'Creare pagina Contatti con indirizzo e mappa', tags: [] },
          { id: 'pi3', text: 'Creare tutte le pagine definite nel brief', tags: ['critico'] },
          { id: 'pi4', text: 'Aggiungere breadcrumb a tutte le pagine interne', tags: ['seo'] },
        ]
      },
      {
        name: 'Pagine Servizi',
        items: [
          { id: 'ps1', text: 'Creare pagina per ogni servizio del brief', tags: ['critico'] },
          { id: 'ps2', text: 'Ogni pagina servizio: hero, descrizione, benefici, CTA', tags: [] },
          { id: 'ps3', text: 'Verificare keyword nella struttura di ogni pagina', tags: ['seo'] },
          { id: 'ps4', text: 'Collegare pagine servizi tra loro (internal linking)', tags: ['seo'] },
        ]
      }
    ]
  },
  {
    id: 5, title: 'Copy & SEO',
    groups: [
      {
        name: 'Copywriting',
        items: [
          { id: 'c1', text: 'Inserire tutti i testi forniti dal cliente', tags: [] },
          { id: 'c2', text: 'Verificare tono e registro corrispondenti al brief', tags: ['warn'] },
          { id: 'c3', text: 'Revisionare headline di tutte le sezioni hero', tags: [] },
          { id: 'c4', text: 'Verificare CTA: testi chiari e azionabili', tags: [] },
        ]
      },
      {
        name: 'SEO On-Page',
        items: [
          { id: 'seo1', text: 'Impostare title tag per ogni pagina (max 60 char)', tags: ['seo', 'critico'] },
          { id: 'seo2', text: 'Scrivere meta description per ogni pagina (max 155 char)', tags: ['seo', 'critico'] },
          { id: 'seo3', text: 'Verificare H1 unico per pagina con keyword principale', tags: ['seo'] },
          { id: 'seo4', text: 'Impostare alt text a tutte le immagini', tags: ['seo'] },
          { id: 'seo5', text: 'Creare e verificare sitemap XML', tags: ['seo'] },
          { id: 'seo6', text: 'Configurare robots.txt', tags: ['seo'] },
          { id: 'seo7', text: 'Installare schema markup (LocalBusiness se pertinente)', tags: ['seo'] },
          { id: 'seo8', text: 'Verificare canonical URL impostate correttamente', tags: ['seo'] },
        ]
      }
    ]
  },
  {
    id: 6, title: 'Link & Navigazione',
    groups: [
      {
        name: 'Menu & Nav',
        items: [
          { id: 'n1', text: 'Verificare tutti i link del menu principale funzionanti', tags: ['critico'] },
          { id: 'n2', text: 'Configurare menu footer', tags: [] },
          { id: 'n3', text: 'Verificare che non ci siano link rotti (404)', tags: ['critico'] },
          { id: 'n4', text: 'Aggiungere link "Torna su" nelle pagine lunghe', tags: [] },
        ]
      },
      {
        name: 'CTA Telefono Email Mappa',
        items: [
          { id: 'cta1', text: 'Link telefono con formato +39XXXXXXXXXX (tel:)', tags: ['critico'] },
          { id: 'cta2', text: 'Link email funzionante (mailto:)', tags: ['critico'] },
          { id: 'cta3', text: 'Google Maps embed o link diretto corretto', tags: [] },
          { id: 'cta4', text: 'Verificare click-to-call su mobile', tags: ['warn'] },
        ]
      }
    ]
  },
  {
    id: 7, title: 'Form di Contatto',
    groups: [
      {
        name: 'Configurazione CF7',
        items: [
          { id: 'f1', text: 'Creare form con campi: nome, email, telefono, messaggio', tags: [] },
          { id: 'f2', text: 'Configurare email destinatario (email cliente)', tags: ['critico'] },
          { id: 'f3', text: 'Configurare email mittente (noreply@dominio)', tags: [] },
          { id: 'f4', text: 'Aggiungere checkbox consenso GDPR', tags: ['critico'] },
          { id: 'f5', text: 'Configurare anti-spam (reCAPTCHA o Flamingo)', tags: ['warn'] },
          { id: 'f6', text: 'Personalizzare messaggio di successo', tags: [] },
        ]
      },
      {
        name: 'Test Invio',
        items: [
          { id: 'ft1', text: 'Inviare form di test e verificare ricezione email', tags: ['critico'] },
          { id: 'ft2', text: 'Verificare email non finisce in spam', tags: ['warn'] },
          { id: 'ft3', text: 'Testare validazione campi (campo vuoto, email errata)', tags: [] },
          { id: 'ft4', text: 'Verificare comportamento su mobile', tags: [] },
        ]
      }
    ]
  },
  {
    id: 8, title: 'Footer & Legale',
    groups: [
      {
        name: 'Contenuto Footer',
        items: [
          { id: 'fo1', text: 'Logo nel footer (versione light se necessario)', tags: [] },
          { id: 'fo2', text: 'Ragione sociale, P.IVA, indirizzo', tags: ['critico'] },
          { id: 'fo3', text: 'Link social media', tags: [] },
          { id: 'fo4', text: 'Link menu footer (Privacy, Cookie, Contatti)', tags: ['critico'] },
          { id: 'fo5', text: 'Copyright con anno corrente', tags: [] },
        ]
      },
      {
        name: 'Pagine Legali',
        items: [
          { id: 'leg1', text: 'Creare pagina Privacy Policy completa', tags: ['critico'] },
          { id: 'leg2', text: 'Creare pagina Cookie Policy', tags: ['critico'] },
          { id: 'leg3', text: 'Configurare banner cookie (iubenda o similar)', tags: ['critico'] },
          { id: 'leg4', text: 'Verificare titolare trattamento dati nella privacy', tags: ['critico'] },
        ]
      }
    ]
  },
  {
    id: 9, title: 'Responsive',
    groups: [
      {
        name: 'Tablet',
        items: [
          { id: 'r1', text: 'Verificare layout a 768px (iPad)', tags: [] },
          { id: 'r2', text: 'Verificare menu tablet funzionante', tags: [] },
          { id: 'r3', text: 'Immagini non tagliate o distorte su tablet', tags: [] },
          { id: 'r4', text: 'Form leggibile e usabile su tablet', tags: [] },
        ]
      },
      {
        name: 'Mobile',
        items: [
          { id: 'm1', text: 'Verificare layout a 375px (iPhone SE) e 390px (iPhone 14)', tags: ['critico'] },
          { id: 'm2', text: 'Menu hamburger funzionante e chiusura corretta', tags: ['critico'] },
          { id: 'm3', text: 'Font leggibili senza zoom su mobile', tags: ['warn'] },
          { id: 'm4', text: 'CTA abbastanza grandi per touch (min 44px)', tags: ['warn'] },
          { id: 'm5', text: 'Nessun overflow orizzontale su mobile', tags: ['critico'] },
          { id: 'm6', text: 'Velocità di caricamento mobile < 3s', tags: ['seo', 'warn'] },
          { id: 'm7', text: 'Test su dispositivo fisico reale', tags: ['critico'] },
        ]
      }
    ]
  },
  {
    id: 10, title: 'Pre-Consegna',
    groups: [
      {
        name: 'Checklist Finale',
        items: [
          { id: 'fin1', text: 'Rimuovere tutti i contenuti demo/placeholder', tags: ['critico'] },
          { id: 'fin2', text: 'Disabilitare maintenance mode / coming soon', tags: ['critico'] },
          { id: 'fin3', text: 'Verificare Google Search Console connessa', tags: ['seo'] },
          { id: 'fin4', text: 'Inviare sitemap a Google Search Console', tags: ['seo'] },
          { id: 'fin5', text: 'Collegare Google Analytics / GA4', tags: [] },
          { id: 'fin6', text: 'Testare sito su Chrome, Firefox, Safari', tags: ['warn'] },
          { id: 'fin7', text: 'Verificare velocità con PageSpeed Insights (>70)', tags: ['seo', 'warn'] },
          { id: 'fin8', text: 'Backup completo pre-consegna', tags: ['critico'] },
          { id: 'fin9', text: 'Consegnare credenziali WP Admin al cliente', tags: ['critico'] },
          { id: 'fin10', text: 'Inviare report finale al cliente', tags: [] },
        ]
      }
    ]
  }
];
