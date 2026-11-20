# Steam: Wishlists

Stand: 20.11.2026. Die Wishlist-Zahl im Status ist noch nicht angebunden.

## Was ich gefunden habe

- Wishlist-Zahlen gibt es nicht über die öffentliche Steam Web API. Sie gehören zu den
  Verkaufs- und Finanzdaten eines Spiels.
- Für diese Daten gibt es das Interface `IPartnerFinancialsService`
  ([Valve-Doku](https://partner.steamgames.com/doc/webapi/IPartnerFinancialsService)). Es braucht
  einen **eigenen Key**: In Steamworks unter *Manage Groups* eine «Financial API Group» anlegen
  und dort den Web-API-Key erzeugen. Ein normaler Steam-Web-API-Key reicht nicht.
- Dass es über diese API Wishlist-Daten pro Tag gibt (neu, gelöscht, gekauft, Gesamtzahl),
  habe ich nur bei einem Drittanbieter gefunden
  ([FirstLook](https://docs.firstlook.gg/integrations/steam/)). Auf der Valve-Seite selbst
  habe ich keine Wishlist-Methode gesehen, dort stehen nur `GetChangedDatesForPartner` und `GetDetailedSales`.
- Die offizielle [Wishlist-Seite von Valve](https://partner.steamgames.com/doc/marketing/wishlist/reporting)
  beschreibt nur den Bericht in der Weboberfläche.

**Fazit:** Der genaue Endpunkt und die Form der Antwort sind nicht bestätigt. Darum gibt es
noch keinen Code dafür.

## Nächster Schritt (Silvan)

1. In Steamworks prüfen, ob du für Rigged to Riches eine Financial API Group anlegen darfst.
   Dafür braucht es die Rechte für die Finanzdaten.
2. Falls ja: Key erzeugen, **nicht** ins Repo legen. In der Valve-Doku nachsehen, welche Methode
   die Wishlist-Zahlen liefert.
3. Mit dem Key einmal von Hand abfragen und die Antwort ohne Key anschauen.

Danach baue ich `steam/`: einen Scheduler (z. B. alle 6 h), der das Ergebnis in die DB
oder den Cache schreibt. `/api/status` liest nur daraus und fragt Steam nie pro Request ab.
Den Key gibt es nur als Umgebungsvariable `STEAM_API_KEY`.

Geht das nicht, bleibt die Zahl ein Platzhalter. Von Hand nachgetragene Werte wären keine «Live-Zahl».
