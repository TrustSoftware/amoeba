# Amoeba

Amoeba is a voice-first playground for unfinished thoughts. This repository contains the first responsive web prototype based on the original visual mockups.

## What works

- Responsive landing, character-selection, and conversation screens
- Eight selectable conversational shapes
- Browser speech-to-text when `SpeechRecognition` is available
- Text input fallback in every flow
- Optional browser text-to-speech
- Local, rule-based demo responses with no API key or account
- Automatic GitHub Pages deployment from `main`

## Run locally

No build system is required.

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Deploy

The workflow at `.github/workflows/pages.yml` packages the static files and deploys them with GitHub's official Pages actions.

One repository setting must be enabled once:

1. Open **Settings -> Pages**.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.
3. Re-run the **Deploy Amoeba to GitHub Pages** workflow if the first run occurred before Pages was enabled.

The custom domain is declared as `amoeba.space`. Configure the domain's DNS for GitHub Pages, then add `amoeba.space` under **Settings -> Pages -> Custom domain** and enable HTTPS when GitHub makes the option available.

## Structure

```text
index.html                 App markup and accessible controls
styles.css                 Responsive visual system and animation
script.js                  Characters, navigation, voice input, and local demo logic
assets/favicon.svg         App icon
manifest.webmanifest       Installable web-app metadata
.github/workflows/pages.yml GitHub Pages deployment
```

## Production boundary

This version deliberately does not contain an AI API key. Connecting a real model requires a server-side or serverless endpoint so credentials never ship to the browser.

## Version

Current prototype: `0.1.0`
