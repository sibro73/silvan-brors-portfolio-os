# Vorschaubild und Icons

Die Bilder in `frontend/public/` entstehen aus diesen HTML-Vorlagen, mit headless Chrome:

| Datei | Vorlage | Grösse |
|---|---|---|
| `og-image.png` | `og-card.html` | 1200 × 630 (Vorschau beim Teilen) |
| `apple-touch-icon.png` | `icon-apple.html` | 180 × 180 |
| `favicon-32.png` | `icon.html` | 32 × 32, transparent |

`favicon.svg` ist das Original und wird nicht erzeugt.

Neu erzeugen (Git Bash, im Repo-Ordner, nach `npm install` im Frontend wegen der Schrift):

```bash
CH="/c/Program Files/Google/Chrome/Application/chrome.exe"; root=$(pwd -W)
shot() { "$CH" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 "$@"; }
shot --window-size=1200,630 --virtual-time-budget=2000 --screenshot="$root/frontend/public/og-image.png" "file:///$root/docs/og/og-card.html"
shot --window-size=180,180 --screenshot="$root/frontend/public/apple-touch-icon.png" "file:///$root/docs/og/icon-apple.html"
shot --window-size=32,32 --default-background-color=00000000 --screenshot="$root/frontend/public/favicon-32.png" "file:///$root/docs/og/icon.html"
```

Die Icon-Vorlagen arbeiten mit festen Pixeln, weil headless Chrome eine minimale Fenstergrösse
hat und den Screenshot oben links ausschneidet.

LinkedIn speichert Vorschauen zwischen. Nach einer Änderung kann man die Seite im
[Post Inspector](https://www.linkedin.com/post-inspector/) neu laden lassen.
