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

The workflow at `.github/workflows/pages.yml` validates the static source, packages it, and deploys it with GitHub's official Pages actions.

One repository setting must be enabled once:

1. Open **Settings -> Pages**.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.
3. Re-run the **Deploy Amoeba to GitHub Pages** workflow if the first run occurred before Pages was enabled.

### Custom domain: ameoba.space

The intended public URL is **https://ameoba.space/** (note the spelling). The default project URL is https://trustsoftware.github.io/amoeba/.

1. In the TrustSoftware account's **Settings -> Pages**, add `ameoba.space` under verified domains. Add the exact TXT record GitHub generates at your DNS provider, then click **Verify**. Keep that TXT record.
2. In this repository's **Settings -> Pages**, use **GitHub Actions** as the publishing source, then save **ameoba.space** as the custom domain before pointing DNS at GitHub.
3. At the authoritative DNS provider, configure:

   | Type | Host | Value |
   | --- | --- | --- |
   | A | @ | 185.199.108.153 |
   | A | @ | 185.199.109.153 |
   | A | @ | 185.199.110.153 |
   | A | @ | 185.199.111.153 |
   | CNAME | www | trustsoftware.github.io |

   Replace conflicting website records for these hosts; preserve email and unrelated DNS records. If existing apex AAAA records point elsewhere, remove them or replace them with GitHub Pages' documented IPv6 addresses. The `www` target must not include `/amoeba/`.
4. Check that the latest **Deploy Amoeba to GitHub Pages** run succeeds. If needed, run it manually after enabling Pages.
5. Wait for GitHub's DNS check and HTTPS certificate, then enable **Enforce HTTPS**. Confirm that https://ameoba.space/ loads and https://www.ameoba.space/ redirects to it.

DNS changes may take up to 24 hours. Certificate provisioning can take up to an hour after correct configuration.

This repository uses a custom Actions workflow: GitHub ignores repository `CNAME` files for this publishing method. Adding that file does not configure the custom domain; the Pages setting above is required.

References: [Manage a custom domain](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site), [Verify domain ownership](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages), [HTTPS troubleshooting](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/troubleshooting-custom-domains-and-github-pages).

## Structure

```text
index.html                  App markup and accessible controls
styles.css                  Responsive visual system and animation
script.js                   Characters, navigation, voice input, and local demo logic
assets/favicon.svg          App icon
manifest.webmanifest        Installable web-app metadata
.github/workflows/pages.yml GitHub Pages deployment
```

## Production boundary

This version deliberately does not contain an AI API key. Connecting a real model requires a server-side or serverless endpoint so credentials never ship to the browser.

## Version

Current prototype: `0.1.0`
