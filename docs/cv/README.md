# Lebenslauf

`lebenslauf.html` ist die Quelle für `frontend/public/media/lebenslauf.pdf` (A4, eine Seite) und
die Vorschau `frontend/public/media/lebenslauf.webp`. Nur echte Angaben eintragen, nichts erfinden.
Die Projekttexte stammen aus `frontend/src/data/` (Profil, Projekte).

Nach einer Änderung neu erzeugen (Git Bash, im Repo-Ordner, Python mit Pillow für die Vorschau):

```bash
CH="/c/Program Files/Google/Chrome/Application/chrome.exe"; root=$(pwd -W)
"$CH" --headless=new --disable-gpu --no-pdf-header-footer   --print-to-pdf="$root/frontend/public/media/lebenslauf.pdf" "file:///$root/docs/cv/lebenslauf.html"
"$CH" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=2 --window-size=794,1123   --screenshot="$root/cv.png" "file:///$root/docs/cv/lebenslauf.html"
python -c "from PIL import Image; Image.open('cv.png').convert('RGB').save('frontend/public/media/lebenslauf.webp', 'WEBP', quality=82)"
rm cv.png
```

Die Telefonnummer steht im öffentlichen PDF. Soll sie nicht online sein, die Zeile im Kopf
entfernen und neu erzeugen.
