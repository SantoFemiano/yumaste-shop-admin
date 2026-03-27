# 🛠️ Yumaste Admin Shop

[![Angular](https://img.shields.io/badge/Angular-21-DD0031?logo=angular)](https://angular.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-7952B3?logo=bootstrap)](https://getbootstrap.com/)
[![Chart.js](https://img.shields.io/badge/Chart.js-4.5-FF6384?logo=chartdotjs)](https://www.chartjs.org/)

Pannello di amministrazione della piattaforma **Yumaste** — una SPA Angular riservata agli amministratori per la gestione completa di box, ingredienti, fornitori, magazzini, sconti, clienti e ordini.

> 🔗 Si interfaccia con il backend REST [yumaste-backend](https://github.com/SantoFemiano/yumaste-backend) tramite chiamate HTTP autenticate con JWT, gestite da un **HTTP Interceptor** Angular.

---

## 📋 Indice

- [Panoramica](#-panoramica)
- [Stack Tecnologico](#-stack-tecnologico)
- [Struttura del Progetto](#-struttura-del-progetto)
- [Componenti e Routing](#-componenti-e-routing)
- [Modelli TypeScript](#-modelli-typescript)
- [Sicurezza](#-sicurezza)
- [Servizi](#-servizi)
- [Configurazione](#-configurazione)
- [Avvio del Progetto](#-avvio-del-progetto)
- [Build di Produzione](#-build-di-produzione)

---

## 📖 Panoramica

Yumaste Admin Shop è il pannello di controllo back-office della piattaforma. Accessibile solo agli amministratori autenticati, permette di:

- Visualizzare la **dashboard** con statistiche e grafici (Chart.js)
- Gestire il **catalogo box** (CRUD completo)
- Gestire **ingredienti** con valori nutrizionali e allergeni
- Assegnare **ingredienti alle box** con quantità
- Gestire **fornitori** e **magazzini**
- Configurare **sconti** generali e sconti su singole box
- Visualizzare e gestire **clienti** e i loro indirizzi
- Monitorare gli **ordini** dei clienti
- Ispezionare i **carrelli** degli utenti

---

## 🛠️ Stack Tecnologico

| Tecnologia | Versione | Scopo |
|---|---|---|
| Angular | 21 | Framework SPA principale |
| TypeScript | 5.9 | Tipizzazione statica |
| RxJS | 7.8 | Programmazione reattiva / HTTP |
| Angular Router | 21 | Routing con Auth Guard |
| Angular Forms | 21 | Reactive & Template Forms |
| Angular HttpClient | 21 | Client HTTP + Interceptor JWT |
| Bootstrap | 5.3 | Styling e componenti UI |
| Chart.js | 4.5 | Grafici statistici nella Dashboard |
| Prettier | 3.x | Formattazione codice |
| Vitest | 4.x | Test unitari |
| Angular CLI | 21.2 | Toolchain build/serve/test |

---

## 🏗️ Struttura del Progetto

```
src/
├── main.ts                          # Entry point Angular
├── index.html                       # HTML root
├── styles.css                       # Stili globali
└── app/
    ├── app.ts                       # Root component
    ├── app.html                     # Template root (router-outlet)
    ├── app.routes.ts                # Definizione rotte e Auth Guard
    ├── app.config.ts                # Configurazione app (providers, interceptor)
    ├── components/                  # Componenti Angular (uno per sezione)
    │   ├── dashboard/               # Dashboard con statistiche e grafici
    │   ├── login/                   # Pagina di login admin
    │   ├── register/                # Pagina di registrazione admin
    │   ├── box/                     # Gestione box alimentari
    │   ├── ingredienti/             # Gestione ingredienti
    │   ├── add-ingrediente-box/     # Aggiunta ingredienti a una box
    │   ├── fornitori/               # Gestione fornitori
    │   ├── magazzini/               # Gestione magazzini
    │   ├── sconti/                  # Gestione sconti generali
    │   ├── sconti-box/              # Gestione sconti su box
    │   ├── clienti/                 # Anagrafica clienti
    │   ├── ordini-clienti/          # Monitoraggio ordini
    │   ├── carrello/                # Ispezione carrelli utenti
    │   └── navbar/                  # Barra di navigazione laterale
    ├── services/
    │   ├── admin.ts                 # Tutti i metodi HTTP verso /api/admin
    │   └── auth.ts                  # Login, logout, gestione token
    ├── models/
    │   ├── admin-models.ts          # Interfacce TypeScript del dominio
    │   └── auth.ts                  # Modelli autenticazione (LoginRequest, ecc.)
    ├── guards/
    │   └── auth-guard.ts            # CanActivate: protegge le rotte admin
    └── interceptors/
        └── auth-interceptor.ts      # Aggiunge automaticamente il JWT a ogni request
```

---

## 🗺️ Componenti e Routing

Il routing è definito in `app.routes.ts` con protezione tramite **`authGuard`** su tutte le rotte amministrative:

| Path | Componente | Auth Guard | Descrizione |
|---|---|---|---|
| `/login` | `LoginComponent` | ❌ | Login amministratore |
| `/register` | `RegisterComponent` | ❌ | Registrazione admin |
| `/dashboard` | `DashboardComponent` | ❌ | Dashboard con grafici |
| `/box` | `BoxComponent` | ✅ | CRUD box alimentari |
| `/ingredienti` | `IngredientiComponent` | ✅ | CRUD ingredienti |
| `/ingrediente-box` | `AddIngredienteBoxComponent` | ✅ | Associa ingredienti a box |
| `/fornitori` | `FornitoriComponent` | ✅ | CRUD fornitori |
| `/magazzini` | `MagazziniComponent` | ✅ | CRUD magazzini |
| `/sconti` | `ScontiComponent` | ✅ | Gestione sconti generali |
| `/sconti-box` | `ScontiBoxComponent` | ✅ | Sconti su singole box |
| `/clienti` | `ClientiComponent` | ✅ | Anagrafica clienti |
| `/ordini-clienti` | `OrdiniClientiComponent` | ✅ | Ordini dei clienti |
| `/carrello` | `CarrelloComponent` | ✅ | Carrelli degli utenti |
| `/` | Redirect | - | Reindirizza a `/login` |

---

## 🧩 Modelli TypeScript

Tutte le interfacce del dominio sono definite in `src/app/models/admin-models.ts`:

| Interfaccia | Descrizione |
|---|---|
| `Box` | Box alimentare con EAN, prezzi, sconti, porzioni |
| `Ingrediente` | Ingrediente con EAN, fornitore, valori nutrizionali e allergeni |
| `ValoriNutrizionali` | Macronutrienti: proteine, carboidrati, grassi, calorie, ecc. |
| `Allergene` | Allergene con ID e nome |
| `Fornitore` | Fornitore con P.IVA e indirizzo completo |
| `Magazzino` | Magazzino con indirizzo |
| `IngredienteMagazzinoRequest` | Richiesta carico ingrediente in magazzino (lotto, data) |
| `IngredienteMagazzinoResponse` | Risposta stock con dettagli |
| `Sconto` | Sconto con valore, date validità e stato attivo |
| `Cliente` | Cliente con CF, email e lista indirizzi |
| `Indirizzo` | Indirizzo di spedizione cliente |
| `Carrello` | Carrello con totali e lista items |
| `Oggetti_carrello` | Singola riga carrello (box, quantità, prezzi) |
| `AddIngredienteToBoxRequest` | Payload per aggiungere un ingrediente a una box |
| `PageResponse<T>` | Wrapper paginazione (content, totalElements, totalPages) |

---

## 🔐 Sicurezza

### Auth Guard
Il file `auth-guard.ts` implementa `CanActivate` e blocca l'accesso alle rotte protette se l'utente non è autenticato, reindirizzando al `/login`. [cite:25]

### HTTP Interceptor
`auth-interceptor.ts` è un **HttpInterceptor** funzionale (Angular 21) che aggiunge automaticamente l'header JWT a **ogni chiamata HTTP** uscente verso il backend, senza dover gestire il token manualmente in ogni servizio. [cite:29]

```typescript
// Il token viene letto dal localStorage e iniettato automaticamente
Authorization: Bearer <jwt_token>
```

### Flusso di autenticazione
```
Admin                          Backend
  |                               |
  |-- POST /api/auth/login ------->|
  |<-- { "token": "eyJ..." } ------|
  |   (salvato in localStorage)   |
  |                               |
  |-- GET /api/admin/box --------->|
  |   [Interceptor aggiunge JWT]  |
  |<-- 200 OK [ ...box ] ---------|
```

---

## ⚙️ Servizi

### `AdminService` (`services/admin.ts`)
Contiene tutti i metodi HTTP verso gli endpoint `/api/admin/*`:
- CRUD su Box, Ingredienti, Fornitori, Magazzini
- Gestione Sconti e ScontiBox
- Lettura Clienti, Ordini, Carrelli
- Carico ingredienti in magazzino

### `AuthService` (`services/auth.ts`)
Gestisce:
- **Login** con chiamata a `/api/auth/login`
- **Logout** con rimozione del token dal `localStorage`
- **Verifica** dello stato di autenticazione

---

## ⚙️ Configurazione

L'URL del backend è configurato direttamente nei servizi Angular. Assicurarsi che il backend [yumaste-backend](https://github.com/SantoFemiano/yumaste-backend) sia avviato sulla porta corretta prima di usare l'admin panel.

L'applicazione Angular serve di default sulla porta **4200** (`ng serve`).

---

## 🚀 Avvio del Progetto

### Prerequisiti

- Node.js 18+
- npm 11+
- Angular CLI 21 (`npm install -g @angular/cli`)
- Backend [yumaste-backend](https://github.com/SantoFemiano/yumaste-backend) in esecuzione

### 1. Clona il repository

```bash
git clone https://github.com/SantoFemiano/yumasteadminshop.git
cd yumasteadminshop
```

### 2. Installa le dipendenze

```bash
npm install
```

### 3. Avvia il server di sviluppo

```bash
npm start
# oppure
ng serve
```

L'admin panel sarà disponibile su: `http://localhost:4200`

---

## 📦 Build di Produzione

```bash
npm run build
# oppure
ng build
```

I file ottimizzati vengono generati nella cartella `dist/yumasteadminshop/`.

---

## 📐 Comandi Disponibili

| Comando | Descrizione |
|---|---|
| `npm start` | Avvia il dev server su `localhost:4200` |
| `npm run build` | Build di produzione ottimizzata |
| `npm run watch` | Build in modalità watch (sviluppo) |
| `npm test` | Esegue i test unitari con Vitest |
| `ng generate component nome` | Genera un nuovo componente Angular |

---

## 👤 Autore

**Santo Femiano**
- GitHub: [@SantoFemiano](https://github.com/SantoFemiano)

---

*Readme generato con ❤️ per il progetto Yumaste*
