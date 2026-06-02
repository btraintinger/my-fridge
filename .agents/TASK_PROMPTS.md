# My Fridge - Detaillierte Prompts für alle Tasks

**Stand:** Mai 2026 | **Status:** Ready for Implementation

---

## 📌 TASK 1: Multi-Scan-Modus Implementierung

**Titel:** Multi-Scan-Funktion mit Duplikat-Erkennung und visuellem Feedback

**Kurzbeschreibung:**
Implementiere einen neuen Scanner-Modus, der es Benutzern ermöglicht, mehrere Produkte hintereinander zu scannen. Gescannte Produkte sollten nicht erneut gescannt werden können, mit visuellem Feedback (grün) und Produktnamen-Anzeige. Fehler sollten als Popup oder inline angezeigt werden.

**Detaillierte Anforderungen:**

### User Flow:

1. Benutzer klickt auf "Multi-Scan" Button (neue Option neben "Scan" und "Manuell")
2. Scanner-Modal öffnet sich
3. Benutzer scannt Produkt → Barcode wird erkannt
4. Produkt wird zur Scan-Liste hinzugefügt (mit grünem Highlight/Check)
5. Produktname wird kurz angezeigt (Toast oder inline)
6. Benutzer kann weitere Produkte scannen
7. Duplikat-Scan: Produktname erscheint bereits gescannt (gelb/orange) statt erneut zu scannen
8. Benutzer klickt "Abgeschlossen" Button
9. Auf neuer Seite: Gescannte Produkte in kompakter Liste angezeigt

### Gescannte Produkte-Liste (nach "Abgeschlossen"):

- Layout: Kompakt, gridbasiert oder List
- Für jedes Produkt anzeigen:
    - Produkt-Thumbnail/Bild (klein)
    - Produktname
    - Nutri-Score Badge
    - Menge-Eingabefeld (Spinner oder Input)
    - Remove-Button (X)
    - Manuell hinzufügen Button
- Bottom: Kühlschrank-Auswahl (Select/Dropdown)
- Bottom: "Alle hinzufügen" Button

### Fehlerbehandlung:

- Barcode nicht erkannt → Toast-Notification "Produkt nicht gefunden"
- Duplikat-Scan → Toast "Produkt bereits gescannt"
- API-Fehler → Toast mit Retry-Option

### Tech-Details:

- State Management: Zustand für gescannte Produkte Track (deduplizieren nach Barcode)
- Visual Feedback: CSS-klasse für "gescanntes" Produkt
- Integration: `fetchProductByBarcode()` + `cacheProduct()`
- Duplikat-Check: Map/Set mit Barcodes

### Dateien zu modifizieren/erstellen:

- `app/scanner/page.tsx` - Multi-Scan Mode UI
- `components/ScannerModal.tsx` - Extended für Multi-Scan
- `components/ScannedProductsList.tsx` - NEU (kompakte Produktliste)
- `hooks/useMultiScan.ts` - NEU (State-Management)

### Akzeptanzkriterien:

- ✅ Mehrere Produkte können nacheinander gescannt werden
- ✅ Duplikate werden erkannt und können nicht erneut hinzugefügt werden
- ✅ Gescannte Produkte zeigen visuelles Feedback (grün)
- ✅ Produktname wird angezeigt
- ✅ Nach "Abgeschlossen" werden alle Produkte in kompakter Form angezeigt
- ✅ Benutzer kann Mengen ändern, Produkte entfernen, Kühlschrank wählen
- ✅ Fehler werden benutzerfreundlich angezeigt

---

## 📌 TASK 2: Expiration Date Input pro Produkt

**Titel:** Optionales Ablaufdatum für Produkte speichern

**Kurzbeschreibung:**
Ermögliche es Benutzern, für jedes Produkt ein optionales Ablaufdatum zu speichern. Dieses Feld ist optional und kann später beim Hinzufügen oder Editieren eines Produkts gesetzt werden.

**Detaillierte Anforderungen:**

### Funktionalität:

- Beim Hinzufügen eines Produkts (Single oder Multi-Scan): optionales Datumsfeld für Ablaufdatum
- Beim Editieren eines Produkts in der Fridge-Detailseite: Ablaufdatum editierbar
- Format: Date-Picker (wie bereits existiert)
- Speicherung: In Firestore `products` Collection mit `expirationDate` Feld

### UI-Lokationen:

1. Single-Scan: Nach Scan + Mengen-Eingabe → Datumsfeld vor "Hinzufügen"
2. Multi-Scan: In der kompakten Produktliste → Datumsfeld optional
3. Produkt-Detail (in Fridge): Ablaufdatum anzeigen + editierbar via Modal/Inline

### Datenbankschema:

```
products/{productId}/
  ...existing fields...
  expirationDate: timestamp (optional, nullable)
```

### Tech-Details:

- Component: `DatePicker.tsx` bereits vorhanden → reuse
- Firestore Update: `fridgeService.ts` - `addItemToFridge()` und `updateItemInFridge()`
- Optional: Default auf 7 oder 14 Tage setzen (user preference)

### Dateien zu modifizieren:

- `components/ScannerModal.tsx` - Datumsfeld hinzufügen
- `components/ManualProductModal.tsx` - Datumsfeld hinzufügen
- `components/fridge-details/ProductDetailModal.tsx` - Datumsfeld editierbar
- `lib/services/fridgeService.ts` - Ablaufdatum speichern/updaten
- `lib/types.ts` - Product-Type um `expirationDate` erweitern

### Akzeptanzkriterien:

- ✅ Ablaufdatum kann beim Hinzufügen optional gesetzt werden
- ✅ Ablaufdatum wird in Firestore gespeichert
- ✅ Ablaufdatum kann später editiert werden
- ✅ Ablaufdatum-Feld ist optional (nil erlaubt)
- ✅ Date-Picker funktioniert auf allen Geräten

---

## 📌 TASK 3: Expiration Notifications (3 Tage vor Ablauf)

**Titel:** Browser Notifications für auslaufende Produkte

**Kurzbeschreibung:**
Implementiere Benachrichtigungen, die Benutzer 3 Tage vor dem Ablaufdatum eines Produkts warnen. Notifications sollten via Browser Notification API oder In-App Toast gesendet werden.

**Detaillierte Anforderungen:**

### Notification Logik:

- Trigger: User öffnet App oder nach regelmäßigen Checks (z.B. stündlich im Background)
- Bedingung: `currentDate >= (expirationDate - 3 days)`
- Für jedes auslaufende Produkt 1 Notification

### Notification Types:

1. **Browser Notification** (wenn User genehmigt hat):
    - Title: "Produkt läuft bald ab"
    - Body: "Produkt XYZ in Kühlschrank 'Küche' läuft in 2 Tagen ab"
    - Action: Click → Navigiere zu Fridge-Details
2. **In-App Toast** (Fallback/Extra):
    - Alert Toast mit Product + Tage-Info

### Implementierung:

- Check durchführen:
    - Beim App-Load (AuthContext oder Main Layout)
    - Stündlich via Service Worker / setInterval
    - Optional: Firebase Cloud Functions (später)
- State: Bereits gezeigte Notifications tracken (localStorage) um Duplicates zu vermeiden
- User Consent: Notification Permission erfragen beim ersten Aufruf

### PWA Service Worker Integration:

- Background-Sync oder regelmäßiger Check im Service Worker
- Push Notifications (optional, später)

### Dateien zu modifizieren/erstellen:

- `lib/services/fridgeService.ts` - Funktion `checkExpiringProducts()`
- `app/layout.tsx` oder `components/Providers.tsx` - Notification-Check beim Load
- `public/sw.js` - Service Worker Background-Sync (optional)
- `hooks/useExpirationNotifications.ts` - NEU (Custom Hook)

### Akzeptanzkriterien:

- ✅ Notifications werden 3 Tage vor Ablauf gezeigt
- ✅ Duplikat-Notifications werden vermieden
- ✅ Browser Notifications funktionieren (mit Genehmigung)
- ✅ In-App Toast als Fallback funktioniert
- ✅ Click auf Notification navigiert zu Fridge-Details
- ✅ Funktioniert auf PWA und Web

---

## 📌 TASK 4: Shopping List - Abhaken-Funktion

**Titel:** Abhaken/Checkmark für Shopping List Items

**Kurzbeschreibung:**
Implementiere eine Abhaken-Funktion für Items in der Einkaufsliste. Abgehakte Items können gekennzeichnet werden (z.B. durchgestrichen, grau) und optional versteckt oder gelöscht werden.

**Detaillierte Anforderungen:**

### User Flow:

1. Benutzer navigiert zu Shopping List
2. Shopping List zeigt alle Items
3. Item hat Checkbox (Links oder Rechts)
4. Benutzer klickt Checkbox → Item wird als "abgehakt" markiert
5. Visuelles Feedback: Item wird durchgestrichen/grau (CSS)
6. Abgehakte Items können:
    - Am unteren Ende der Liste angezeigt werden (mit Trenner)
    - ODER versteckt werden (Toggle-Option)
    - ODER einzeln gelöscht werden (X-Button)

### Datenbankschema:

```
shoppingLists/{listId}/items/{itemId}/
  ...existing...
  completed: boolean (default: false)
  completedAt: timestamp (optional)
```

### UI:

- Toggle für "Abgeschlossene Items zeigen/verstecken" (Top der Liste)
- Checkbox neben jedem Item (vor Name)
- Abgehakte Items: strikethrough text, opacity reduziert
- Optional: Delete-Button (Trash-Icon) für abgehakte Items

### Tech-Details:

- State: Lokale State + Firestore Sync
- Component: `ShoppingListItem.tsx` - erweitern
- Service: `shoppingListService.ts` - Update Item Status

### Dateien zu modifizieren:

- `app/shopping-list/page.tsx` - Toggle für abgeschlossene Items
- `components/shopping-list/ShoppingListItem.tsx` - Checkbox + Styling
- `lib/services/shoppingListService.ts` - Update Item completion
- `lib/types.ts` - ShoppingListItem um `completed` Feld erweitern

### Akzeptanzkriterien:

- ✅ Items können abgehakt werden
- ✅ Visuelle Änderung: Durchgestrichen oder Grau
- ✅ Abgehakte Items können angezeigt/versteckt werden
- ✅ Status wird in Firestore gespeichert
- ✅ Funktioniert Multi-User (Sync)

---

## 📌 TASK 5: Verify Share & Invite System

**Titel:** Überprüfung und ggf. Vervollständigung des Share & Invite Systems

**Kurzbeschreibung:**
Überprüfe, ob das existierende Share & Invite System (für Kühlschränke und Einkaufslisten) vollständig funktioniert. Teste Email-Invites, Permissions, und Multi-User-Szenarien. Behebe Fehler oder ergänze fehlende Features.

**Detaillierte Anforderungen:**

### Test-Szenarien:

1. **Share Link generieren** (Kühlschrank):
    - User A teilt Kühlschrank mit Share-Button
    - Link/Email wird generiert
    - ✅ Funktioniert korrekt?

2. **Email Invite senden**:
    - User A sendet Email-Invite an User B (z.B. user@example.com)
    - ✅ Email wird versendet?
    - ✅ Link ist korrekt?
    - ✅ Invite ist gültig?

3. **Invite akzeptieren**:
    - User B öffnet Email-Link
    - User B wird aufgefordert, sich anzumelden/zu registrieren
    - Nach Login: User B hat Zugriff auf Kühlschrank
    - ✅ Funktioniert korrekt?

4. **Permissions / Rechte**:
    - Alle User haben gleiche Rechte (Lesen + Schreiben)
    - ✅ Implementiert?
    - Keine Rollen wie Owner, Editor, Viewer
    - ✅ Richtig?

5. **Shopping List Sharing**:
    - Shopping List ist an Kühlschrank gekoppelt
    - Wenn Kühlschrank geteilt wird, ist automatisch Shopping List geteilt
    - ✅ Funktioniert?

6. **Multi-User Real-time Sync**:
    - User A und User B sind im gleichen Kühlschrank
    - User A fügt Produkt hinzu → User B sieht es sofort
    - ✅ Funktioniert?

### Zu prüfen:

- Email-Versand (Firebase Extension oder 3rd-party Service?)
- Firestore Security Rules (nur berechtigte User sehen Daten)
- Share-Links (Struktur, Gültigkeit, Ablauf)
- Fehlerbehandlung (ungültige Links, Ablaufdatum)

### Dateien zu prüfen/modifizieren:

- `firestore.rules` - Share/Permission Rules
- `lib/services/fridgeService.ts` - Share-Funktionen
- `app/...` - Share-UI Components
- Backend/Cloud Functions (falls vorhanden) - Email-Versand

### Dokumentation:

- Notiere alle gefundenen Issues
- Dokumentiere die aktuellen Limits (z.B. max. User pro Kühlschrank)
- Erstelle Test-Report

### Akzeptanzkriterien:

- ✅ Share-Link funktioniert
- ✅ Email-Invite funktioniert
- ✅ Invite-Annahme funktioniert
- ✅ Multi-User Real-time Sync funktioniert
- ✅ Permissions sind korrekt (alle gleiche Rechte)
- ✅ Keine Fehler bei Edge Cases

---

## 📌 TASK 6: Browser & Device Testing & Fixes

**Titel:** Umfassendes Testing auf allen gängigen Geräten und Browsern

**Kurzbeschreibung:**
Teste die App systematisch auf allen gängigen Geräten und Browsern. Identifiziere Fehler, visuelle Probleme und Inkonsistenzen. Dokumentiere Ergebnisse und behebe kritische Issues.

**Detaillierte Anforderungen:**

### Test-Matrix:

**Desktop Browser:**

- Chrome / Chromium (neueste Version)
- Firefox (neueste Version)
- Safari (neueste Version)
- Edge (neueste Version)

**Mobile Browser:**

- Chrome Mobile (iOS & Android)
- Safari Mobile (iOS)
- Firefox Mobile (Android)
- Samsung Internet (Android)

**Geräte:**

- Desktop (1920x1080, 1366x768)
- Tablet (iPad, Android Tablet - 768x1024, 1024x768)
- Smartphone (iPhone 12/13/14, Android Flagship - 375x667, 720x1280)
- Diverse Screen-Sizes (Responsive)

### Test-Kategorien:

1. **Responsive Design**:
    - Layout bricht nicht
    - Text ist lesbar
    - Buttons sind klickbar
    - Bilder laden korrekt
    - Spacing korrekt auf allen Sizes

2. **Performance**:
    - Page Load Time < 3s
    - Interaktionen sind smooth (60 fps)
    - Keine Freezes oder Laggs

3. **Funktionalität**:
    - Scan funktioniert auf Mobil (Camera Permission)
    - Alle Button-Clicks funktionieren
    - Navigation funktioniert
    - Forms submitten korrekt

4. **Auth & Security**:
    - Login/Register funktioniert
    - Session hält
    - Logout funktioniert
    - Keine CORS-Fehler

5. **PWA Funktionalität**:
    - App kann installiert werden
    - Offline-Modus funktioniert
    - Push Notifications funktionieren (falls implementiert)

6. **CSS & Styling**:
    - Darkmode funktioniert auf allen Browser
    - Farben sind konsistent
    - Keine Rendering-Fehler
    - Keine Box-Shadows/Borders fehlerhaft

7. **Accessibility**:
    - Tab-Navigation funktioniert
    - Screen Reader freundlich
    - Kontrastfarben sind ausreichend

### Test-Protokoll:

```markdown
### Test Report - [Datum]

#### Chrome Desktop (1920x1080)

- Responsive Design: ✅ / ❌ Notes: ...
- Performance: ✅ / ❌ Notes: ...
- Funktionalität: ✅ / ❌ Notes: ...
- Auth: ✅ / ❌ Notes: ...
- PWA: ✅ / ❌ Notes: ...
- CSS/Styling: ✅ / ❌ Notes: ...
- Accessibility: ✅ / ❌ Notes: ...

#### Issues gefunden:

1. [Issue] - Severity: High/Medium/Low
2. ...

#### Fixes benötigt:

- [ ] Issue 1
- [ ] Issue 2
```

### Dateien zu prüfen/modifizieren:

- `app/globals.css` - Responsive Breakpoints
- `tailwind.config.ts` - Breakpoints, Dark Mode
- `components/` - alle Components auf Responsive getestet
- `next.config.ts` - Performance-Optimierungen

### Tools:

- Browser DevTools (Chrome, Firefox)
- Responsive Design Tester (BrowserStack, LambdaTest)
- Lighthouse (Chrome DevTools) für Performance

### Akzeptanzkriterien:

- ✅ Alle Geräte/Browser im Green
- ✅ Keine kritischen Fehler
- ✅ Responsive auf allen Sizes
- ✅ Performance acceptable (< 3s load)
- ✅ Alle Funktionen arbeiten cross-browser

---

## 📌 TASK 7: Offline/PWA/Cache Evaluation & Optimization

**Titel:** Evaluiere und verbessere Offline-Funktionalität, PWA und Caching-Strategien

**Kurzbeschreibung:**
Überprüfe die aktuelle PWA-Implementierung, Service Worker, Caching und Offline-Funktionalität. Evaluiere, ob ein lokaler DB-Dump sinnvoll ist und wie Produkte gecacht werden können. Optimiere die Strategien.

**Detaillierte Anforderungen:**

### Phase 1: Audit der aktuellen Implementierung

**Service Worker (public/sw.js):**

- ✅ Registriert? Cache-Strategien?
- Welche Assets werden gecacht?
- Welche API-Calls werden gecacht?
- Fehler-Handling im Service Worker?

**Manifest (public/manifest.json):**

- ✅ App-Name, Icons, Colors korrekt?
- ✅ PWA ist installierbar?
- ✅ Start URL korrekt?

**Product Caching:**

- ✅ `getCachedProduct()` / `cacheProduct()` funktioniert?
- Was wird aktuell gecacht (Produkte von OpenFoodFacts)?
- Wie lange ist Cache-TTL?
- Wie wird Cache invalidiert?

**Offline-Szenarien:**

- Was funktioniert ohne Internetverbindung?
- Was nicht?
- Fehlerbehandlung beim Offline-Gehen?

### Phase 2: DB-Dump Evaluation

**Frage:** Ist ein lokaler DB-Dump sinnvoll?

**Überlegungen:**

- Größe des Dumps (MB? GB?)
- Update-Häufigkeit (täglich? wöchentlich?)
- Use Case: Welche Produkte müssen offline verfügbar sein?
    - Option A: Alle gescannten Produkte (user-spezifisch)
    - Option B: Top N Produkte nach Kategorie
    - Option C: Nur wenn User offline ist (Lazy-Load)

**Empfehlung:**

- Probably: User-spezifischer Dump (nur die Produkte die der User gescannt hat)
- Mit Service Worker cachen + localStorage

### Phase 3: Implementierung / Optimierungen

**Verbesserte Service Worker Strategien:**

1. **Cache-First** (für statische Assets):
    - CSS, JS, Icons
2. **Stale-While-Revalidate** (für API Calls):
    - Produkt-Details: Zeige gecachte Version, aktualisiere im Hintergrund
3. **Network-First** (für Real-time Daten):
    - Fridge-Produkte, Shopping List (müssen immer aktuell sein)

4. **Network-Only** (für Auth):
    - Login, Register (immer Online erforderlich)

**Offline-Features:**

- Queue nicht gesendete Änderungen (IndexedDB)
- Sync when online (Periodic Background Sync API)
- Show Offline-Indicator in UI
- Provide limited functionality offline

**Dateien zu modifizieren/erstellen:**

- `public/sw.js` - Erweiterte Cache-Strategien
- `lib/services/productService.ts` - Offline-Cache-Management
- `lib/services/fridgeService.ts` - Offline Queue
- `components/ui/OfflineIndicator.tsx` - NEU (UI-Indicator)
- `app/layout.tsx` - Offline-Indicator integrieren
- `next.config.ts` - PWA Plugin konfigurieren

### Akzeptanzkriterien:

- ✅ PWA ist installierbar und funktioniert
- ✅ Service Worker funktioniert mit korrekten Cache-Strategien
- ✅ Produkte werden gecacht und sind offline verfügbar
- ✅ Änderungen werden offline gequeued + online gesync
- ✅ DB-Dump-Evaluation durchgeführt + Dokumentiert
- ✅ Offline-Indicator wird angezeigt
- ✅ Kein kritischer Fehler im Offline-Modus

---

## 📌 TASK 8: Systematische Bugsuche & Fehlerbehandlung

**Titel:** Comprehensive Bug Hunt und Error Handling Audit

**Kurzbeschreibung:**
Führe eine systematische Bugsuche durch. Teste alle Features, Edge Cases und Error-Szenarien. Identifiziere und dokumentiere Bugs. Behebe kritische und wichtige Bugs, für kleinere erstelle Issues.

**Detaillierte Anforderungen:**

### Bug-Kategorien zu prüfen:

1. **Scanner & Produkte**:
    - ❓ Was passiert, wenn Barcode nicht erkannt wird?
    - ❓ Was wenn OpenFoodFacts API nicht antwortet?
    - ❓ Duplikat-Scan-Handling?
    - ❓ Bild-Laden bei Produkten?
    - ❓ Nutri-Score ungültig oder fehlend?

2. **Fridge-Management**:
    - ❓ Produkt hinzufügen → fehlgeschlagen?
    - ❓ Produkt löschen → Seiteneffekte?
    - ❓ Menge editieren → wird gespeichert?
    - ❓ Multiple Fridges wechseln?
    - ❓ Fridge teilen → Sync-Issues?

3. **Shopping List**:
    - ❓ Item hinzufügen?
    - ❓ Item aus Fridge hinzufügen?
    - ❓ Item löschen?
    - ❓ Menge ändern?
    - ❓ Shared Shopping List Sync?

4. **Auth & User**:
    - ❓ Login-Flow ohne Fehler?
    - ❓ Register-Validierung?
    - ❓ Password-Reset?
    - ❓ Account-Deletion?
    - ❓ Session-Timeout?

5. **UI/UX**:
    - ❓ Modal-Schließen funktioniert?
    - ❓ Loading-States sichtbar?
    - ❓ Error-Messages hilfreich?
    - ❓ Buttons disabled while loading?
    - ❓ Form-Validierung hilfreich?

6. **Performance**:
    - ❓ List-Rendering bei vielen Produkten?
    - ❓ Image-Loading optimiert?
    - ❓ API-Calls debounced?

7. **Browser/Mobile**:
    - ❓ Camera-Permission-Handling?
    - ❓ Notification-Permission-Handling?
    - ❓ Keyboard auf Mobile?
    - ❓ Scroll-Verhalten?

### Bug-Report Format:

```markdown
### Bug: [Titel]

**Severity:** High / Medium / Low
**Environment:** Chrome, Desktop / Safari, iOS / ...
**Steps to Reproduce:**

1. ...
2. ...
3. ...

**Expected Result:**
...

**Actual Result:**
...

**Screenshots/Video:**
[Optional]

**Root Cause (wenn bekannt):**
...
```

### Bugs Tracker:

- Erstelle eine Issue-Liste / GitHub Issues
- Priorisiere nach Severity
- Behebe High-Severity Bugs sofort
- Medium/Low als TODO

### Dateien zu prüfen:

- Alle `app/*/page.tsx` Components
- Alle `components/` Components
- `lib/services/*` Service-Layer
- `hooks/` Custom Hooks
- Error Boundaries & Error Handling

### Akzeptanzkriterien:

- ✅ Systematische Bugsuche durchgeführt
- ✅ Minimum 30 Bug-Test-Cases durchlaufen
- ✅ Alle Bugs dokumentiert
- ✅ High-Severity Bugs behoben
- ✅ Error-Handling verbessert
- ✅ Bug-Report für nachfolgende Tasks vorhanden

---

## 📌 TASK 9: Database Cleanup & Konsistenzprüfung

**Titel:** Firestore Database bereinigen und auf Konsistenz prüfen

**Kurzbeschreibung:**
Bereinige die Firestore-Datenbank von orphaned oder ungültigen Daten. Überprüfe auf Konsistenzprobleme und Daten-Anomalien. Stelle eine stabile Datenbasis her.

**Detaillierte Anforderungen:**

### Cleanup-Szenarien:

1. **Orphaned Collections**:
    - Produkte ohne Fridge-Referenz
    - Shopping List Items ohne Shopping List
    - Fridges ohne Owner
    - Action: Identifizieren + Löschen

2. **Invalid Data**:
    - Produkte mit ungültigen Barcodes
    - Mengen < 0
    - Fehlende Pflichtfelder
    - Action: Reparieren oder Löschen

3. **Duplikate**:
    - Gleiche Produkte in Fridge (gleicher Barcode)
    - Action: Mergen oder Löschen

4. **Shared Fridges Konsistenz**:
    - User in `members` Array aber nicht in Auth?
    - Permissions nicht korrekt?
    - Action: Reparieren

5. **Größe & Performance**:
    - Welche Collections sind zu groß?
    - Gibt es Dokumente > 1 MB?
    - Action: Dokumentieren für Optimierung

### Konsistenz-Checks:

```
❓ Fridge-Struktur:
- Jeder Fridge hat mindestens 1 Owner
- members[] referenziert nur gültige User
- products[] Größe ist vernünftig

❓ Product-Struktur:
- Jedes Produkt hat Barcode
- Nutriments sind numerisch oder null
- expirationDate (falls vorhanden) ist valid
- quantity > 0

❓ Shopping List Struktur:
- Jede Liste hat parent Fridge
- Items referenzieren valide Produkte
- completed boolean ist gesetzt

❓ User-Daten:
- User existiert in Auth
- Profile-Daten sind vollständig
- Keine Duplikat-Einträge
```

### Implementierung:

**Firestore Admin SDK Script** (oder Cloud Function):

```typescript
// Pseudo-Code
async function cleanupDatabase() {
    // 1. Finde Orphaned Docs
    const orphanedProducts = await findOrphanedProducts()

    // 2. Validiere Daten
    const invalidDocs = await validateAllDocuments()

    // 3. Finde Duplikate
    const duplicates = await findDuplicates()

    // 4. Generiere Cleanup-Report
    // 5. (Optional) Autofix oder Manual Review?
}
```

**Dateien zu erstellen/modifizieren:**

- `scripts/cleanup-firestore.ts` - NEU (Cleanup Script)
- `scripts/validate-firestore.ts` - NEU (Validation Script)
- `lib/db-migrations/` - NEU (Migration Folder)
- Dokumentation: Cleanup-Report

### Durchführung:

1. **Backup** Firestore (Export)
2. Laufe Validation-Script (Read-Only)
3. Generiere Report
4. Laufe Cleanup-Script
5. Validiere nach Cleanup
6. Dokumentiere Ergebnisse

### Akzeptanzkriterien:

- ✅ Datenbank wurde bereinigt
- ✅ Orphaned Docs gelöscht
- ✅ Invalid Daten repariert
- ✅ Duplikate entfernt
- ✅ Konsistenz-Report erstellt
- ✅ Keine Fehler nach Cleanup

---

## 📌 TASK 10: Code Refactoring & Quality Audit

**Titel:** Umfassendes Refactoring und Code-Quality-Verbesserung

**Kurzbeschreibung:**
Überprüfe den gesamten Code auf Quality, Design Patterns, Duplikationen und Wartbarkeit. Refactorisiere nach Best Practices. Entferne ungenutzten Code. Schreibe hilfreiche Kommentare.

**Detaillierte Anforderungen:**

### Code-Review Kategorien:

1. **Design Patterns & Architecture**:
    - ❓ Wird Service Layer korrekt verwendet?
    - ❓ Custom Hooks sinnvoll?
    - ❓ Component Composition gut?
    - ❓ State Management (Zustand/Context) sinnvoll?
    - Refactor: Verbessere Pattern-Violations

2. **Duplikationen & DRY**:
    - ❓ Welcher Code ist dupliziert?
    - ❓ Können Komponenten/Funktionen zusammengefasst werden?
    - Refactor: Extract common logic in Utilities/Components

3. **Type Safety (TypeScript)**:
    - ❓ Gibt es `any` Types?
    - ❓ Sind alle Props/Params typisiert?
    - ❓ Sind Fehlertypen spezifisch?
    - Refactor: Strikte Types

4. **Error Handling**:
    - ❓ Sind Errors überall gecatcht?
    - ❓ User-freundliche Error-Messages?
    - ❓ Console.errors vermieden?
    - Refactor: Konsistentes Error-Handling

5. **Performance**:
    - ❓ Werden Re-renders minimiert?
    - ❓ Sind useMemo/useCallback sinnvoll?
    - ❓ Lazy-Loading wo nötig?
    - Refactor: Performance-Optimierungen

6. **Readability**:
    - ❓ Sind Funktionsnamen beschreibend?
    - ❓ Sind Variablennamen klar?
    - ❓ Ist Logik leicht nachvollziehbar?
    - Refactor: Bessere Namen, Inline-Kommentare

7. **Testing & Testability**:
    - ❓ Sind Funktionen testbar?
    - ❓ Gibt es Pure Functions?
    - ❓ Sind Seiteneffekte isoliert?
    - Refactor: Bessere Testability

### Refactoring-Fokus:

**Priority Areas:**

- `lib/services/` - Business Logic
- `hooks/` - Custom Hooks
- `components/` - React Components (Größe, Komplexität)
- `lib/utils.ts` - Utility Functions

**Zu suchen nach:**

- [ ] Unused imports
- [ ] Unused exports
- [ ] Unused variables
- [ ] Dead code paths
- [ ] TODO/FIXME comments
- [ ] Long functions (>100 lines?)
- [ ] Complex nested logic

### Code-Qualitäts-Regeln:

```typescript
// BAD - Zu allgemeiner Type
function processData(data: any) {}

// GOOD - Strikte Types
function processProduct(product: Product): void {}

// BAD - Duplizierter Code
const fridge1 = await getFridge(id1)
const fridge2 = await getFridge(id2)

// GOOD - Wiederverwendbar
const fridges = await Promise.all([getFridge(id1), getFridge(id2)])

// BAD - Keine Error-Handling
const product = await fetchProductByBarcode(barcode)

// GOOD - Error-Handling
try {
    const product = await fetchProductByBarcode(barcode)
} catch (error) {
    handleError(error)
}
```

### Kommentierung:

Schreibe Kommentare für:

- Complex Algorithmen
- Non-obvious Entscheidungen
- Workarounds (mit Begründung)
- Public API Functions (JSDoc)

```typescript
/**
 * Fetches a product by barcode from OpenFoodFacts API.
 * Falls back to cached product if API is unavailable.
 *
 * @param barcode - The EAN/UPC barcode
 * @returns Product data or null if not found
 * @throws Error if both API and cache fail
 */
export async function fetchProductByBarcode(barcode: string): Promise<Product | null> {
  ...
}
```

### Dateien zu prüfen/refaktorisieren:

- `lib/services/**/*.ts` - Alle Services
- `lib/utils.ts` - Utility-Funktionen
- `lib/firebase.ts` - Firebase-Setup
- `hooks/**/*.ts` - Alle Custom Hooks
- `components/**/*.tsx` - Alle Components

### ESLint & Prettier:

- Laufe `npm run lint:fix`
- Laufe `npm run format`
- Überprüfe auf verbleibende Warnungen

### Output:

- Refactoring-Bericht (Before/After Beispiele)
- Dokumentiere größere Umstrukturierungen
- Commit-Messages sollten klar sein

### Akzeptanzkriterien:

- ✅ Kein ungenutzter Code
- ✅ Konsistente Code-Stil
- ✅ Strikte TypeScript Types
- ✅ Bessere Error-Handling
- ✅ Design Patterns korrekt
- ✅ Hilfreiche Kommentare wo nötig
- ✅ Alle Tests passen noch

---

## 📌 TASK 11: Unit & Integration Tests

**Titel:** Umfangreiche Unit- und Integration-Tests implementieren

**Kurzbeschreibung:**
Erstelle Unit-Tests für Business Logic und Integration-Tests für komplexe Flows. Ziele: > 70% Code Coverage, besonders für kritische Funktionen (Auth, Fridge-Management, Shopping List).

**Detaillierte Anforderungen:**

### Test-Strategie:

**Unit Tests** (für einzelne Funktionen):

- Test Framework: Jest (oder Vitest)
- Location: `__tests__/` neben den Dateien
- Scope: `lib/services`, `lib/utils`, `hooks` (wo möglich)

**Integration Tests** (für komplexe Flows):

- Test die Interaktion zwischen Components + Services
- Beispiele: Scanner-Flow, Fridge-Sharing, Shopping List Update

**E2E Tests** (Optional, später):

- Playwright/Cypress
- Full User-Journeys

### Test-Kategorien:

1. **Auth Tests**:
    - ✅ Login mit Email/Password
    - ✅ Register neuer User
    - ✅ Password Reset
    - ✅ Google Sign-In (mocking)
    - ✅ Session Persistence

2. **Fridge Service Tests**:
    - ✅ `addItemToFridge()` - Produkt hinzufügen
    - ✅ `removeItemFromFridge()` - Produkt entfernen
    - ✅ `updateItemQuantity()` - Menge ändern
    - ✅ `shareFridge()` - Fridge teilen
    - ✅ `getFridgeProducts()` - Produkte abrufen
    - Edge Cases: Duplikate, Invalid Data

3. **Shopping List Tests**:
    - ✅ `addItemToShoppingList()` - Item hinzufügen
    - ✅ `removeItemFromShoppingList()` - Item entfernen
    - ✅ `toggleItemCompleted()` - Item abhaken
    - ✅ Multi-User Sync

4. **Product Service Tests**:
    - ✅ `cacheProduct()` - Cachen
    - ✅ `getCachedProduct()` - Aus Cache laden
    - ✅ `fetchProductByBarcode()` - API Call (mit Mock)
    - ✅ Cache Invalidation

5. **Utility Functions Tests**:
    - ✅ Validation Functions
    - ✅ Health Score Calculation
    - ✅ Nutri Score Parsing
    - ✅ Date/Time Functions

6. **Component Integration Tests**:
    - ✅ `ScannerModal` - Scanner-Flow
    - ✅ `FridgeCard` - Fridge-Anzeige
    - ✅ `ShoppingListItem` - Item-Interaktion

### Test-Setup:

**package.json Scripts:**

```json
{
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
}
```

**Jest Config (jest.config.js):**

```javascript
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom', // für React Components
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
    },
}
```

### Example Tests:

```typescript
// __tests__/lib/services/fridgeService.test.ts
import {
    addItemToFridge,
    removeItemFromFridge,
} from '@/lib/services/fridgeService'

describe('fridgeService', () => {
    describe('addItemToFridge', () => {
        it('should add a product to fridge', async () => {
            const product = { barcode: '123', name: 'Apple' }
            const result = await addItemToFridge('fridge-id', product, 1)
            expect(result).toBeDefined()
            expect(result.quantity).toBe(1)
        })

        it('should throw error if fridge not found', async () => {
            await expect(addItemToFridge('invalid-id', {}, 1)).rejects.toThrow()
        })
    })
})
```

### Dateien zu erstellen:

- `jest.config.js` - Jest Konfiguration
- `jest.setup.js` - Jest Setup
- `__tests__/lib/services/**/*.test.ts` - Service Tests
- `__tests__/lib/utils/**/*.test.ts` - Utility Tests
- `__tests__/hooks/**/*.test.ts` - Hook Tests
- `__tests__/components/**/*.test.tsx` - Component Tests

### Dependencies zu installieren:

```json
{
    "devDependencies": {
        "@testing-library/react": "^15.0.0",
        "@testing-library/jest-dom": "^6.0.0",
        "@types/jest": "^29.0.0",
        "jest": "^29.0.0",
        "jest-environment-jsdom": "^29.0.0",
        "ts-jest": "^29.0.0",
        "firebase-mock": "^0.3.0" // für Firebase Mocking
    }
}
```

### Coverage-Ziel:

- Minimum 70% Overall
- 90%+ für kritische Funktionen (Auth, Fridge, Shopping List)

### Reports:

- Laufe `npm run test:coverage`
- Generiere Coverage-Report
- Überprüfe Coverage-Gaps

### Akzeptanzkriterien:

- ✅ Minimum 50 Test-Cases geschrieben
- ✅ Coverage > 70%
- ✅ Alle kritischen Flows getestet
- ✅ Alle Tests grün
- ✅ Setup-Dokumentation vorhanden

---

## 📌 TASK 12: Dokumentation erstellen

**Titel:** Umfangreiche User- und Technische Dokumentation erstellen

**Kurzbeschreibung:**
Erstelle eine komplette Dokumentation der App für Nutzer (How-To Guide) und für Entwickler (Technische Dokumentation mit Architektur, API Docs, etc.).

**Detaillierte Anforderungen:**

### Dokumentations-Teile:

**1. README.md (Projekt-Überblick)**

- Was ist My Fridge?
- Hauptfeatures
- Technologie-Stack
- Getting Started (Development)
- Deployment-Instructions
- Contributing Guidelines
- License

**2. USER_GUIDE.md (Nutzer-Handbuch)**

Kapitel:

- **Getting Started**
    - Account erstellen
    - Login
    - First Fridge erstellen
    - Scanner einrichten (Permissions)

- **Fridge Management**
    - Produkt hinzufügen (Scanner/Manuell/Multi-Scan)
    - Produkt editieren
    - Menge ändern
    - Produkt entfernen
    - Fridge mit anderen teilen
    - Invite per Email

- **Shopping List**
    - Item hinzufügen
    - Item abhaken/löschen
    - Mit Fridge-Team teilen
    - Tipps für effizientes Einkaufen

- **Notifications**
    - Ablaufdatum-Warnungen aktivieren/deaktivieren
    - Notification Settings

- **Settings**
    - Persönliche Vorlieben (Dietary Preferences)
    - Theme (Light/Dark)
    - Account-Einstellungen
    - Password ändern
    - Account löschen

- **Troubleshooting**
    - Camera funktioniert nicht
    - Produkt nicht gefunden
    - Synchronisation-Probleme
    - Offline-Modus

**3. DEVELOPER_GUIDE.md (Technische Dokumentation)**

Kapitel:

- **Architecture**
    - High-Level System Architecture (Diagramm)
    - Tech Stack
    - Folder Structure
    - Data Flow

- **Database Schema**
    - Collections:
        - `users` - User Profile
        - `fridges` - Kühlschränke
        - `products` - Produkte in Fridges
        - `shoppingLists` - Einkaufslisten
        - `shoppingListItems` - Items in Lists
    - Für jede Collection:
        - Document Structure
        - Indexes
        - Security Rules
        - Beispiel-Daten

- **API Documentation**
    - Alle Service-Funktionen dokumentiert
    - Parameter, Return Types, Errors
    - Beispiele

- **Firebase Services**
    - Authentication Setup
    - Firestore Setup
    - Security Rules Erklärt
    - Environment Setup

- **Component Library**
    - Wichtige Components
    - Props dokumentiert
    - Usage Examples
    - Styling Patterns

- **Custom Hooks**
    - `useAuth` - Auth-Context
    - `useFridges` - Fridge-Management
    - etc.

- **State Management**
    - Zustand Stores
    - Context API Usage
    - Data Flow
    - State Updates

- **Services Layer**
    - `fridgeService.ts` - Alle Funktionen
    - `productService.ts`
    - `shoppingListService.ts`
    - `userService.ts`
    - Caching Strategy

- **Testing**
    - How to Run Tests
    - Test Structure
    - Coverage Goals
    - Adding New Tests

- **Deployment**
    - Build Process
    - Vercel Deployment
    - Environment Variables
    - Monitoring & Logs

- **Contributing**
    - Development Setup
    - Code Style Guidelines
    - Commit Message Format
    - Pull Request Process

**4. API.md (Service/Function Reference)**

````markdown
## fridgeService

### addItemToFridge(fridgeId, product, quantity)

Adds a product to a fridge.

**Parameters:**

- `fridgeId` (string): ID of the fridge
- `product` (Product): Product object
- `quantity` (number): Quantity to add

**Returns:** Promise<FridgeItem>

**Example:**

```typescript
const item = await addItemToFridge(
    'fridge-1',
    {
        barcode: '123',
        name: 'Apple',
        nutriScore: 'A',
    },
    5
)
```
````

**Errors:**

- `FridgeNotFoundError` - Fridge nicht gefunden
- `InvalidQuantityError` - Ungültige Menge

```

**5. ARCHITECTURE.md (System-Architektur)**

- Diagramm: User → Next.js → Firebase → Firestore
- Component Hierarchy
- Data Flow
- State Management Architecture
- Security & Authentication Flow
- Real-time Sync Mechanism

**6. Troubleshooting.md (Häufige Probleme)**

- Camera Permissions
- Network Issues
- Browser Kompatibilität
- PWA Installation
- Performance-Probleme

### Documentation Format:

- Markdown (.md)
- Mindestens 1 Diagramm (Mermaid/ASCII)
- Code-Beispiele in Codeblöcken
- Inhaltsverzeichnis mit Links
- Clear Struktur mit Headers

### Dateien zu erstellen:
- `README.md` - Projekt-Überblick
- `docs/USER_GUIDE.md` - Nutzer-Handbuch
- `docs/DEVELOPER_GUIDE.md` - Entwickler-Handbuch
- `docs/API.md` - API-Referenz
- `docs/ARCHITECTURE.md` - System-Architektur
- `docs/DATABASE.md` - Database Schema
- `docs/TROUBLESHOOTING.md` - Häufige Probleme

### Tools:
- Markdown Editor
- Mermaid für Diagramme
- VS Code for Writing

### Output:
- Docs sollten auf GitHub Pages gehostet werden (optional)
- PDF Export möglich (optional)

### Akzeptanzkriterien:
- ✅ README ist vollständig
- ✅ User Guide ist klar und ausführlich
- ✅ Developer Guide erklärt Architektur
- ✅ API.md dokumentiert alle wichtigen Funktionen
- ✅ Mindestens 1 Architektur-Diagramm
- ✅ Code-Beispiele überall vorhanden
- ✅ Inhaltsverzeichnis und Verlinkung funktioniert

---

## 📌 TASK 13: Nutri-Score Farben auf Analyse-Seite

**Titel:** Nutri-Score Farbe auf der Fridge-Analyse-Seite heller/sichtbarer machen

**Kurzbeschreibung:**
Die Nutri-Score Anzeige auf der Fridge-Analyse-Seite hat aktuell schwarze Farbe, die nicht sichtbar ist. Implementiere ein farbiges Badge-System mit den offiziellen Nutri-Score Farben (A=Grün, B=Gelb, C=Orange, D=Rot, E=Dunkelrot).

**Detaillierte Anforderungen:**

### Nutri-Score Farben (Offiziell):
```

A: #108c47 (Grün)
B: #9ace21 (Grün-Gelb)
C: #fcb514 (Gelb/Orange)
D: #ee8100 (Orange)
E: #e63e1b (Rot)

````

### Aktueller Zustand:
- ❓ Wo ist die Analyse-Seite? (`app/fridges/[id]/analysis/page.tsx`)
- ❓ Wie werden Nutri-Scores aktuell angezeigt?
- ❓ Warum sind sie schwarz?

### Zu implementieren:

1. **Nutri-Score Badge Component** (falls nicht vorhanden):
```typescript
interface NutriScoreBadgeProps {
  grade: 'A' | 'B' | 'C' | 'D' | 'E' | '-'
}

export function NutriScoreBadge({ grade }: NutriScoreBadgeProps) {
  const colors = {
    A: 'bg-green-600 text-white',
    B: 'bg-lime-500 text-white',
    C: 'bg-amber-500 text-white',
    D: 'bg-orange-600 text-white',
    E: 'bg-red-600 text-white',
    '-': 'bg-gray-400 text-white'
  }

  return (
    <span className={`px-3 py-1 rounded font-bold ${colors[grade]}`}>
      {grade}
    </span>
  )
}
````

2. **Analyse-Seite anpassen**:
    - Alle Nutri-Score Anzeigen → NutriScoreBadge verwenden
    - Helle Hintergründe für bessere Lesbarkeit
    - Dark Mode Unterstützung

3. **Styling Audit**:
    - Kontrast überprüfen (WCAG AA minimum)
    - Font-Size überprüfen
    - Padding/Spacing überprüfen

### Dateien zu modifizieren:

- `app/fridges/[id]/analysis/page.tsx` - Nutri-Score Anzeige
- `components/fridge-details/NutriScoreComponents.tsx` - Badge Component
- `components/fridge-details/HealthScoreRing.tsx` - ggf. anpassen
- `app/globals.css` - Farb-Variablen (optional)

### Akzeptanzkriterien:

- ✅ Nutri-Score ist auf Analyse-Seite sichtbar
- ✅ Farben entsprechen offiziellen Nutri-Score Farben
- ✅ Kontrast ist gut (WCAG AA)
- ✅ Dark Mode funktioniert
- ✅ Alle Nutri-Score Anzeigen sind konsistent

---

## 📌 TASK 14: Produkt-Darstellung - Liste + Kategorien + Sortierung

**Titel:** Produkt-Ansicht mit List-View und erweiterten Sortierungsoptionen

**Kurzbeschreibung:**
Die Fridge soll Produkte nicht nur nach Kategorien gruppiert anzeigen, sondern auch als flache Liste mit Sortierungs- und Suchfunktionen (ähnlich wie in der Shopping List).

**Detaillierte Anforderungen:**

### Ansichts-Modi:

1. **Grid/Kategorien-View** (aktuell):
    - Produkte gruppiert nach Kategorie
    - Kompakte Anzeige (Bilder + Namen)
    - Default-Ansicht

2. **List-View** (neu):
    - Flache Liste aller Produkte
    - Spalten: Bild | Name | Kategorie | Menge | Nutri-Score | Ablaufdatum | Aktionen
    - Inline-Editing möglich
    - Sortierbar nach jeder Spalte

### Sortier-Optionen:

- Alphabetisch (A-Z / Z-A)
- Nach Kategorie
- Nach Nutri-Score (A-E / E-A)
- Nach Menge (aufsteigend/absteigend)
- Nach Ablaufdatum (nächste zuerst)
- Nach Hinzufüg-Datum (neueste zuerst)

### Such-Funktion:

- Realtime-Suche nach Produktname
- Filter nach Kategorie
- Filter nach Nutri-Score
- Kombinierbare Filter

### UI-Kontrollen:

- Toggle-Button oben: "Kategorien | Liste"
- Search-Box
- Filter-Panel (collapsible)
- Sort-Selector (Dropdown)

### Dateien zu modifizieren/erstellen:

- `app/fridges/[id]/page.tsx` - View-Toggle
- `components/fridges/FridgeView.tsx` - NEU (List + Kategorie Toggle)
- `components/fridges/ProductListView.tsx` - NEU (List-View)
- `components/fridges/ProductGridView.tsx` - Bestehender Grid (refactor)
- `hooks/useFridgeProducts.ts` - NEU (Sorting + Filtering)

### Akzeptanzkriterien:

- ✅ Kategorien-View funktioniert (bestehend)
- ✅ List-View funktioniert
- ✅ Toggle zwischen Views
- ✅ Sortierung funktioniert
- ✅ Suche funktioniert
- ✅ Filter funktioniert
- ✅ Responsive auf allen Geräten

---

## 📌 TASK 15: Design Überarbeitung - Mobile-First & Darkmode

**Titel:** Umfassende Design-Überarbeitung mit Mobile-First Ansatz und Darkmode

**Kurzbeschreibung:**
Überarbeite das gesamte Design der App mit Fokus auf Mobile-First, Responsive Design und verbessertem Darkmode. Fixe Design-Fehler und Inkonsistenzen.

**Detaillierte Anforderungen:**

### Design-Audit durchführen:

1. **Mobile Responsiveness**:
    - ❓ Breakpoints: xs (320px), sm (640px), md (768px), lg (1024px), xl (1280px)
    - ❓ Font-Sizes: Lesbar auf Mobile?
    - ❓ Buttons: Mindestens 44px x 44px Touch-Target?
    - ❓ Spacing: Consistent Padding/Margin?
    - ❓ Images: Responsive?
    - ❓ Overflow: Horizontal Scroll vermieden?

2. **Darkmode Überprüfung**:
    - ❓ Alle Farben haben Dark-Gegenstücke?
    - ❓ Kontrast ist gut in Dark Mode?
    - ❓ Images/Icons sichtbar in Dark?
    - ❓ Transitions zwischen Light/Dark smooth?
    - ❓ Persistierung (localStorage)?

3. **Konsistenz**:
    - ❓ Farb-Palette konsistent?
    - ❓ Typography korrekt?
    - ❓ Button-Styles konsistent?
    - ❓ Form-Inputs konsistent?
    - ❓ Spacing-System konsistent?

4. **UX-Probleme**:
    - ❓ Clickable Elements deutlich?
    - ❓ States (hover, focus, active) klar?
    - ❓ Loading-States sichtbar?
    - ❓ Error-States rot/auffällig?
    - ❓ Success-States grün/positiv?

### Zu beheben:

- [ ] Mobile Breakpoints anpassen/testen
- [ ] Font-Sizes für Mobile optimieren
- [ ] Touch-Targets auf 44px erhöhen
- [ ] Darkmode vollständig testen
- [ ] Farbkontrast überprüfen (WCAG AA)
- [ ] Spacing konsistent machen
- [ ] Icons/Images responsive
- [ ] Form-Inputs stylen
- [ ] Button-Styles standardisieren
- [ ] State-Indicators verbessern

### Design-System standardisieren:

**Tailwind Config Review:**

```typescript
// tailwind.config.ts
export default {
    theme: {
        extend: {
            colors: {
                // App-Brands Colors
                primary: '#...',
                secondary: '#...',
                // Nutri-Scores
                nutriA: '#108c47',
                nutriB: '#9ace21',
                // etc.
            },
            spacing: {
                // Konsistente Abstände
                xs: '0.25rem',
                sm: '0.5rem',
                md: '1rem',
                lg: '1.5rem',
                xl: '2rem',
            },
            fontSize: {
                // Konsistente Font-Sizes
                xs: ['0.75rem', { lineHeight: '1rem' }],
                sm: ['0.875rem', { lineHeight: '1.25rem' }],
                base: ['1rem', { lineHeight: '1.5rem' }],
                lg: ['1.125rem', { lineHeight: '1.75rem' }],
                xl: ['1.25rem', { lineHeight: '1.75rem' }],
            },
        },
    },
}
```

### Dateien zu prüfen/modifizieren:

- `tailwind.config.ts` - Design-System
- `app/globals.css` - Global Styles
- Alle `components/` - Design Audit
- Alle `app/*/page.tsx` - Design Überprüfung

### Darkmode Setup überprüfen:

```typescript
// Check: Ist Darkmode korrekt konfiguriert?
// next.config.ts / tailwind.config.ts
// theme: 'dark' / 'class'

// Check: Wird dark class korrekt gesetzt?
// html.dark { ... }

// Check: Sind alle Elemente dunkel-modal:
// bg-white dark:bg-slate-900
// text-slate-900 dark:text-white
```

### Akzeptanzkriterien:

- ✅ Mobile Responsive (xs - xl Breakpoints)
- ✅ Touch-Targets mindestens 44px
- ✅ Darkmode vollständig funktionstüchtig
- ✅ Farbkontrast WCAG AA
- ✅ Konsistente Typography
- ✅ Konsistente Spacing
- ✅ Keine Design-Fehler sichtbar
- ✅ Alle Geräte sehen gut aus

---

## 📌 TASK 16: Persönliche Einstellungen - Dietary Preferences

**Titel:** Persönliche Einstellungen mit Dietary Preferences und Allergien

**Kurzbeschreibung:**
Ermögliche es Benutzern, persönliche Einstellungen zu speichern (Vegan, Vegetarisch, Diabetes, Halal, Allergien, etc.). Diese Daten können später für Warnungen und Info-Overlays genutzt werden.

**Detaillierte Anforderungen:**

### Einstellungen zu speichern:

```typescript
interface DietaryPreferences {
    vegan: boolean
    vegetarian: boolean
    glutenFree: boolean
    lactoseFree: boolean
    nutFree: boolean
    kosher: boolean
    halal: boolean
    diabetes: boolean
    allergies: string[] // Custom Allergies
}
```

### UI (Settings Page):

1. **Dietary Preferences Sektion**:
    - Checkboxes für: Vegan, Vegetarisch, etc.
    - Multi-Select für Allergien
    - Save-Button

2. **Allergien Management**:
    - List of saved Allergies
    - Add new Allergy Button
    - Remove Allergy Button
    - Search/Filter Allergies

### Integration:

1. **Speicherung**: Firestore `users/{userId}/preferences`

2. **Warnungen bei Produkten** (später implementieren):
    - Wenn Produkt nicht vegan ist + User ist vegan → ⚠️ Warning
    - Wenn Allergen enthalten + User hat Allergie → 🚨 Alert

3. **Shopping List Hinweise** (später):
    - Warnungen bei Items hinzufügen basierend auf Preferences

### Dateien zu modifizieren/erstellen:

- `app/settings/page.tsx` - Neue Sektion hinzufügen
- `components/settings/DietaryPreferencesForm.tsx` - NEU
- `lib/services/userService.ts` - Preferences speichern/laden
- `lib/types.ts` - DietaryPreferences Type
- `hooks/useUserPreferences.ts` - NEU (Custom Hook)

### Database Schema:

```
users/{userId}/preferences
  vegan: boolean
  vegetarian: boolean
  glutenFree: boolean
  lactoseFree: boolean
  nutFree: boolean
  kosher: boolean
  halal: boolean
  diabetes: boolean
  allergies: ['Peanut', 'Shellfish', ...]
  updatedAt: timestamp
```

### Akzeptanzkriterien:

- ✅ Preferences können gespeichert werden
- ✅ Preferences können bearbeitet werden
- ✅ Allergien können hinzugefügt/entfernt werden
- ✅ Daten werden in Firestore gespeichert
- ✅ Preferences werden auf allen Geräten synced
- ✅ UI ist benutzerfreundlich

---

## 📌 TASK 17: Health Score Implementation

**Titel:** Eigene Health Score Berechnung (ersetzt Nutri-Score in Stats)

**Kurzbeschreibung:**
Entwickle eine wissenschaftlich fundierte Health Score Berechnung, die den Nutri-Score in der Statistik-Seite ersetzt. Der Nutri-Score soll weiterhin in einzelnen Produkten angezeigt werden.

**Detaillierte Anforderungen:**

### Recherche zu Health Scores:

Wissenschaftliche Quellen zu prüfen:

1. **Harvard's Healthy Eating Plate**: Fokus auf Whole Grains, Protein, Healthy Fats
2. **Nutri-Score Alternative**: Additive Scoring basierend auf mehreren Faktoren
3. **NOVA Classification**: Ultra-Processed vs. Minimal Processing
4. **Trophology Score**: Komplexere Bewertung (zu komplex?)

**Empfohlener Ansatz:**
Kombinierte Score basierend auf:

- Nutri-Score (40% Gewichtung)
- Processing Level / NOVA (30%)
- Key Nutrients (Fiber, Protein, Omega-3) (20%)
- Empty Calories Penaltiy (Sugar, Salt) (10%)

### Health Score Formel:

```typescript
interface HealthScoreInput {
    nutriScore: 'A' | 'B' | 'C' | 'D' | 'E' | '-'
    processing: 'minimal' | 'processed' | 'ultra-processed'
    fiber: number | null // g pro 100g
    protein: number | null // g pro 100g
    sugar: number | null // g pro 100g
    salt: number | null // g pro 100g
    saturatedFat: number | null // g pro 100g
}

function calculateHealthScore(input: HealthScoreInput): number {
    // 0-100 Skala
    // 90+ = Excellent
    // 70-89 = Good
    // 50-69 = Average
    // < 50 = Poor

    let score = 50 // Baseline

    // Nutri-Score (40%)
    const nutriScores = { A: 100, B: 80, C: 60, D: 40, E: 20, '-': 50 }
    score += (nutriScores[input.nutriScore] - 50) * 0.4

    // Processing (30%)
    const processingScores = {
        minimal: 90,
        processed: 60,
        'ultra-processed': 20,
    }
    score += (processingScores[input.processing] - 50) * 0.3

    // Key Nutrients (20%)
    const nutritionBonus = calculateNutritionBonus(input)
    score += nutritionBonus * 0.2

    // Empty Calories Penalty (10%)
    const emptyCaloriesPenalty = calculateEmptyCaloriesPenalty(input)
    score -= emptyCaloriesPenalty * 0.1

    return Math.max(0, Math.min(100, Math.round(score)))
}

function calculateNutritionBonus(input: HealthScoreInput): number {
    let bonus = 0
    if (input.fiber && input.fiber >= 5) bonus += 20
    if (input.protein && input.protein >= 15) bonus += 20
    return bonus
}

function calculateEmptyCaloriesPenalty(input: HealthScoreInput): number {
    let penalty = 0
    if (input.sugar && input.sugar > 10) penalty += 20
    if (input.salt && input.salt > 2) penalty += 15
    if (input.saturatedFat && input.saturatedFat > 5) penalty += 15
    return penalty
}
```

### Visualisierung:

**Gauge Chart** (statt einfache Zahl):

```
      Excellent (90-100)
    /                  \
   /    Health Score     \
  |    HealthScore: 78    |
   \        Good         /
    \              (70-89)/
```

### Integration:

1. **Produkt-Level**:
    - Health Score berechnen beim Scannen (basierend auf Nutri-Score + Nutriments)
    - Speichern in `products` Collection
    - Anzeigen als Badge/Indicator

2. **Fridge-Statistics**:
    - Durchschnittlicher Health Score der Fridge
    - Distribution Graph (wie viele Produkte pro Score-Band)
    - Trends über Zeit

3. **Analytics/Dashboard**:
    - Fridge Health Score
    - Recommendations (z.B. "Add more high-fiber foods")

### Dateien zu erstellen/modifizieren:

- `lib/healthScore.ts` - NEU (Health Score Calculation)
- `components/HealthScoreVisualization.tsx` - NEU (Badge/Gauge)
- `app/fridges/[id]/analysis/page.tsx` - Health Score anzeigen
- `lib/services/productService.ts` - Health Score beim Cachen berechnen
- `lib/types.ts` - HealthScore Field hinzufügen

### Datenbank-Migration:

- Alte Produkte mit Health Score nachträglichberechnen (Script)
- Neue Produkte bekommen automatisch Score

### Akzeptanzkriterien:

- ✅ Health Score Formel implementiert
- ✅ Wissenschaftlich fundiert (Sources dokumentiert)
- ✅ Health Score wird berechnet und gespeichert
- ✅ Health Score wird in Stats angezeigt
- ✅ Nutri-Score wird weiterhin in Produkten angezeigt
- ✅ Visualisierung ist klar verständlich
- ✅ Durchschnittlicher Fridge-Score berechnet

---

## 📌 TASK 18: Statistics Erweiterung & Überarbeitung

**Titel:** Überarbeitete und erweiterte Statistik-Ansicht

**Kurzbeschreibung:**
Überarbeite die Statistik-Seite der Fridge mit erweiterten Metriken, besserer Visualisierung und neuen Features wie Trends, Vergleiche, und personalisierte Recommendations.

**Detaillierte Anforderungen:**

### Aktuelle Statistiken überprüfen:

- ❓ Was wird derzeit angezeigt?
- ❓ Welche Charts/Graphs sind vorhanden?
- ❓ Fehlende Metriken?

### Neue Statistiken zu implementieren:

1. **Health Overview**:
    - Durchschnittlicher Health Score
    - Health Score Distribution (Pie Chart)
    - Trend über Zeit (Line Chart)

2. **Produktmengen**:
    - Total Produkte in Fridge
    - Nach Kategorie (Bar Chart)
    - Nach Nutri-Score (Stacked Bar)
    - Nach Health Score (Stacked Bar)

3. **Nutri-Score Analyse**:
    - Distribution: Wie viele A/B/C/D/E?
    - Pie Chart
    - Empfehlung: Mehr A-Produkte hinzufügen

4. **Kategorien-Analyse**:
    - Top 5 Kategorien
    - Durchschnittlicher Score pro Kategorie
    - Fehlende Kategorien-Empfehlungen

5. **Ablaufdatum Analyse**:
    - % Produkte ablaufdatum eingeben
    - Produkte die bald ablaufen
    - Durchschnittliche "Lagerungsdauer"

6. **Zeitliche Trends** (Falls Historie gespeichert):
    - Health Score Trend
    - Produktmengen Trend
    - Einkaufsverhalten

7. **Recommendations**:
    - "Add more fruits & vegetables" (wenn zu wenig)
    - "Too much processed food" (wenn zu viel Ultra-Processed)
    - "Great variety in protein sources"
    - "Consider adding whole grains"

### Visualisierung Tools:

- **Chart Library**: Recharts oder Chart.js
- **Chart Types**: Line, Bar, Pie, Gauge

### Dateien zu modifizieren/erstellen:

- `app/fridges/[id]/analysis/page.tsx` - Überarbeitete Stats
- `components/fridge-details/HealthScoreRing.tsx` - Gauge Chart
- `lib/analytics.ts` - Analytics Funktionen (existiert?)
- `hooks/useAnalytics.ts` - NEU (Custom Hook für Stats)
- Chart Components in `components/charts/`

### Akzeptanzkriterien:

- ✅ Health Score Overview angezeigt
- ✅ Nutri-Score Distribution visualisiert
- ✅ Kategorien-Analyse vorhanden
- ✅ Recommendations generiert
- ✅ Charts sind responsive
- ✅ Charts sind interaktiv (Hover-Info)
- ✅ Mobile-freundlich

---

## 🎯 ZUSAMMENFASSUNG

| #   | Task                       | Priorität | Abhängigkeiten |
| --- | -------------------------- | --------- | -------------- |
| 1   | Multi-Scan-Modus           | 🔴 High   | -              |
| 2   | Expiration Date Input      | 🔴 High   | -              |
| 3   | Expiration Notifications   | 🟠 Medium | 2              |
| 4   | Shopping List Abhaken      | 🔴 High   | -              |
| 5   | Verify Share & Invite      | 🟠 Medium | -              |
| 6   | Browser/Device Testing     | 🟠 Medium | 1, 4           |
| 7   | Offline/PWA/Cache          | 🟡 Low    | -              |
| 8   | Bug Hunt                   | 🔴 High   | 1, 4, 6        |
| 9   | DB Cleanup                 | 🟠 Medium | -              |
| 10  | Refactoring & Quality      | 🟠 Medium | 8              |
| 11  | Unit & Integration Tests   | 🟡 Low    | 10             |
| 12  | Dokumentation              | 🟡 Low    | 10, 11         |
| 13  | Nutri-Score Farben         | 🟡 Low    | -              |
| 14  | Produkt-Liste + Sortierung | 🟠 Medium | -              |
| 15  | Design Überarbeitung       | 🟠 Medium | 13, 14         |
| 16  | Dietary Preferences        | 🟡 Low    | -              |
| 17  | Health Score               | 🟠 Medium | -              |
| 18  | Statistics Erweiterung     | 🟠 Medium | 17             |

---

## � NÄCHSTE SCHRITTE

**Empfohlene Reihenfolge (Abhängigkeiten beachten):**

### Phase 1: Core Features (High Priority)

1. Task 1 - Multi-Scan-Modus
2. Task 2 - Expiration Date Input
3. Task 4 - Shopping List Abhaken
4. Task 3 - Expiration Notifications (braucht Task 2)

### Phase 2: System & Infrastructure

5. Task 5 - Verify Share & Invite
6. Task 7 - Offline/PWA/Cache
7. Task 17 - Health Score Implementation

### Phase 3: Quality & Polish

8. Task 8 - Bug Hunt (parallel zu Phase 1-2)
9. Task 9 - DB Cleanup
10. Task 6 - Browser/Device Testing

### Phase 4: Code Quality & Docs

11. Task 10 - Refactoring & Quality (nach Task 8)
12. Task 11 - Unit & Integration Tests (nach Task 10)
13. Task 12 - Dokumentation (nach Task 10, 11)

### Phase 5: UX & Analytics

14. Task 13 - Nutri-Score Farben
15. Task 14 - Produkt-Liste + Sortierung
16. Task 15 - Design Überarbeitung (nach Task 13, 14)
17. Task 16 - Dietary Preferences
18. Task 18 - Statistics Erweiterung (nach Task 17)

---

Alle Prompts sind bereit für die Implementierung! 🚀
