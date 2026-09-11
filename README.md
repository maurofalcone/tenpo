# Tenpo Gallery

App mobile (Expo + TypeScript) para explorar la colección Open Access del **Cleveland Museum of Art**: login simulado, galería con filtros y favoritos, deep links y share nativo.

La **UI está en español**; los textos de las obras (títulos, descripciones, metadata) vienen en **inglés** porque la API del museo no ofrece localización.

## Stack

- **Expo SDK 57** + Expo Router (tabs + stack de detalle / comparar)
- **NativeWind** (Tailwind)
- **TanStack Query** (`useInfiniteQuery` / `useQuery`)
- **Zod** + React Hook Form
- **AsyncStorage** (sesión, favoritos, preferencias, recientes, obra del día, onboarding)
- **expo-haptics**, **expo-file-system**, **expo-linking**, **expo-print**, **expo-sharing**
- **@react-native-community/netinfo** (banner offline en Favoritos)

## Requisitos

- Node **22** (recomendado: `nvm use 22`)
- npm
- Expo Go, simulador iOS y/o emulador Android

## Cómo correr el proyecto

```bash
nvm use 22
npm install --legacy-peer-deps
npm start
```

| Comando | Qué hace |
| --- | --- |
| `npm start` | Metro + QR |
| `npm run ios` / `android` | Simulador / emulador |
| `npm run typecheck` | TypeScript |
| `npm test` | Jest |
| `npm run ci` | Typecheck + tests |

## Login demo

Precompletado: **`demo@tenpo.com`** / **`tenpo123`**.

También sirve cualquier email válido + password ≥ 6. La sesión (access + refresh) vive en AsyncStorage; el access dura ~2 min para poder mostrar el refresh.

## Features

- **Auth** — login fake y sesión local.
- **Home** — obra del día, vistas recientemente y destacadas.
- **Colección** — listado paginado, filtros (sheet), orden y vista lista/cards.
- **Detalle** — Vista con detalles de la obra, ampliar a modal fullscreen con acciones como Imprimir / Compartir, favorito.
- **Favoritos** — mosaic, selección múltiple, comparar **2–4** obras (tabla), share y offline.
- **Comparar** — tabla lado a lado y preview de la imagen.
- **Onboarding** — slides introductorios (reset desde Perfil).
- **Perfil** — sesión, tema Claro/Auto/Oscuro y utilidades de demo.

## Guión rápido para la review

1. Login (`demo@tenpo.com` / `tenpo123`).
2. Onboarding → Home (obra del día, recientes, destacadas).
3. Colección → filtros + clasificación + búsqueda reciente.
4. Detalle → favorito, ampliar imagen → Imprimir / Compartir desde el modal.
5. Favoritos → long-press, seleccionar 2–4, comparar / share / eliminar.
6. Perfil → tema / reabrir onboarding.
7. Deep link: `xcrun simctl openurl booted "tenpo://artwork/94979"`.
8. `npm run ci`.

## Share y deep links

Scheme: `tenpo` (`app.json`).

```text
tenpo://artwork/{id}
```

Ejemplo: `tenpo://artwork/94979`. Sin sesión, se guarda la ruta y se abre tras el login. El share de favoritos manda un deep link **por obra**.

**Probar**

- App: detalle → ampliar → Compartir (o share desde Favoritos).
- Safari / Simulator: pegar `tenpo://artwork/94979`.
- Terminal iOS: `xcrun simctl openurl booted "tenpo://artwork/94979"`.
- Android: `adb shell am start -a android.intent.action.VIEW -d "tenpo://artwork/94979"`.

En Expo Go el link puede verse como `exp://…/--/artwork/{id}`. Los `tenpo://` custom rinden mejor en build nativo.

## API

[Cleveland Museum of Art Open Access API](https://openaccess-api.clevelandart.org/).

Params típicos: `has_image`, `title`, `artists`, `type`, `cc0`, `limit` / `skip`. Algunos filtros/orden se resuelven solo en el cliente.

## Estructura

Arquitectura por **feature** + capas técnicas. Las rutas de Expo Router en `app/` son reexports finos; la UI vive en `src/`.

```text
app/                         # Expo Router (login, tabs, detalle, compare…)
src/
  features/
    auth/ | home/ | artworks/ | favorites/ | onboarding/ | profile/
      screens/
      components/
        ComponentName/
          ComponentName.tsx
          ComponentName.types.ts
          ComponentName.utils.ts   # si aplica
          index.ts
  modules/                   # UI de dominio compartida (ej. FeaturedMosaic)
  hooks/<domain>/
  lib/<domain>/
  ui/                        # design system
  providers/
  theme/ | test/
```

**Convenciones**

- `screens/` = pantallas; `components/` = piezas usadas dentro de esas screens.
- Si un componente se usa en más de un feature → `modules/`.
- Types/utils del componente van junto a él (`.types.ts` / `.utils.ts`).
- Lógica de dominio (API helpers, storage, PDF, share) → `lib/<domain>/`.
- Helpers de color / tema compartidos → `theme/` (ej. `hexToRgba`).
- `ui/` es design system (incl. `ExpandImageButton`, `minimalStackHeaderOptions`).

## Testing

```bash
npm test
npm run ci
```

**Cobertura actual (Jest)**

- `ui/`: Button, Input, Text, TextLink, Icon, Spinner, Screen, Card, Modal (+ utils), EmptyState, ErrorView, Skeleton, HeaderIconButton, ExpandImageButton, HtmlContent, FadeHeaderBackground
- `theme/`: `hexToRgba`
- `lib/`: artwork (share, recents, filterHistory, filters, sort), html/museum, auth tokens, pendingHref
- Features: FavoriteButton, ShareArtworkButton, ExportArtworkPdfButton, ArtworkCard, ArtworkRow, ClassificationPickerList utils, CompareScreen utils
- Modules: FeaturedMosaic utils

**Future work**

- Unit/integration de screens y providers: Login, Home, Collection, Detail, Favorites, Compare UI, Profile, Onboarding, ArtworkFiltersModal (UI), ImagePreviewModal, hooks (`useCollection*`) y providers. Conviene cubrirlos con integration/e2e más que unitarios puros.
- E2E con **Detox** (build nativo / simulador; no corre sobre Expo Go).
- **i18n** (p. ej. `expo-localization` + i18next) para UI en ES/EN; los textos del museo seguirían en inglés por la API.
- **Splash screen** nativo con `expo-splash-screen` (branding mientras hidrata sesión / favoritos).
- Cache de imágenes con **`expo-image`** (placeholder, disk cache) y modo offline más amplio en Colección, no solo banner en Favoritos.

## Apariencia

En **Perfil**: Claro | Auto | Oscuro (persistido). Auto sigue el sistema.

## Scripts y CI

```bash
npm start | npm run ios | npm run android
npm run typecheck | npm test | npm run ci
```

Workflow `.github/workflows/ci.yml`: typecheck + tests en push/PR (sin deploy).
