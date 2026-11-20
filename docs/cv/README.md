# Lebenslauf

`lebenslauf.html` ist die Vorlage für `frontend/public/media/lebenslauf.pdf` (A4, eine Seite).
Rote Stellen in `[eckigen Klammern]` sind Platzhalter: nur echte Angaben eintragen, nichts erfinden.
Die Inhalte stammen aus `frontend/src/data/` (Profil, Projekte).

PDF erzeugen (Git Bash, im Repo-Ordner):

```bash
CH="/c/Program Files/Google/Chrome/Application/chrome.exe"; root=$(pwd -W)
"$CH" --headless=new --disable-gpu --no-pdf-header-footer \
  --print-to-pdf="$root/frontend/public/media/lebenslauf.pdf" "file:///$root/docs/cv/lebenslauf.html"
```

Erst veröffentlichen, wenn keine Platzhalter mehr drin sind. Danach in
`frontend/src/data/profile.json` `cv.downloadHref` auf `/media/lebenslauf.pdf` setzen.
