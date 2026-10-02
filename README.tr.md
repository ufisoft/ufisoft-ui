# UfiSoft UI

[English](./README.md) · **Türkçe**

`@ufisoft/ui`, UfiSoft ürünlerinin (UfiSoft CMS, UfiSoft Frontend ve gelecekteki uygulamalar) ortak React component kütüphanesidir.

```tsx
import '@ufisoft/ui/styles.css';
import { Button, FormField, FormLabel, Input, Modal } from '@ufisoft/ui';
```

## Neden var?

Her UfiSoft ürünü aynı butonlara, form kontrollerine ve overlay'lere ihtiyaç duyar. Bunları bir kez geliştirmek şunları sağlar:

- **Tutarlılık** — design token'larla yönetilen, ürünler arası tek bir görsel dil.
- **Yerleşik erişilebilirlik** — klavye desteği, focus yönetimi ve ARIA bağlantıları bir kez çözülür.
- **Bağımsızlık** — ağır bir UI framework'üne (MUI, Ant Design, Chakra…), form kütüphanesine veya router'a bağımlılık yoktur.

Kütüphane **yalnızca generic UI primitive'leri** içerir. `ProductCard`, `OrderStatus`, `UserManagement` gibi domain component'leri uygulamalara aittir ve bu primitive'lerle oluşturulur.

## Teknoloji stack'i

| Alan                 | Seçim                                                             |
| -------------------- | ----------------------------------------------------------------- |
| Dil                  | TypeScript (strict)                                               |
| UI                   | React 19                                                          |
| Stil                 | CSS Modules + CSS custom properties (design token'lar)            |
| Build                | Vite (library mode, ESM, modül bazlı çıktı)                       |
| Doküman & geliştirme | Storybook (MDX dokümanları + accessibility addon)                 |
| Test                 | Vitest + React Testing Library + jsdom                            |
| Kalite               | ESLint (jsx-a11y dahil) + Prettier + simple-git-hooks/lint-staged |
| Release              | Changesets (Semantic Versioning) → GitHub Packages                |
| Paket yöneticisi     | pnpm                                                              |

Runtime dependency'ler bilinçli olarak minimumdur: `clsx` (class birleştirme) ve `@radix-ui/react-slot` (`asChild` pattern'i).

## Geliştirme ortamı kurulumu

Gereksinimler: **Node.js ≥ 22** ve **pnpm** (sürüm `package.json` → `packageManager` alanında sabitlenmiştir; `corepack enable` ile otomatik kullanılır).

```bash
pnpm install       # git pre-commit hook'unu da kurar
pnpm storybook     # http://localhost:6006
```

## Komutlar

| Komut                  | Ne yapar                                                                  |
| ---------------------- | ------------------------------------------------------------------------- |
| `pnpm storybook`       | Storybook'u başlatır — ana geliştirme ortamı.                             |
| `pnpm test`            | Unit testleri bir kez çalıştırır.                                         |
| `pnpm test:watch`      | Testleri watch modunda çalıştırır.                                        |
| `pnpm lint`            | Tüm dosyaları lint eder (ESLint).                                         |
| `pnpm typecheck`       | Tip kontrolü yapar (`tsc --noEmit`).                                      |
| `pnpm format`          | Tüm dosyaları formatlar (Prettier). `format:check` yalnızca kontrol eder. |
| `pnpm build`           | Kütüphaneyi `dist/` içine build eder.                                     |
| `pnpm build-storybook` | Statik Storybook'u `storybook-static/` içine build eder.                  |
| `pnpm changeset`       | Bir sonraki release için değişikliği tanımlar.                            |
| `pnpm release`         | Build alır ve bekleyen release'leri yayınlar (maintainer'lar).            |

## Proje yapısı

```text
ufisoft-ui/
├── .changeset/              Changesets ayarları ve bekleyen release notları
├── .storybook/              Storybook ayarları
├── src/
│   ├── components/
│   │   └── button/
│   │       ├── index.tsx            implementation (public export'lar)
│   │       ├── button.module.css    stiller (yalnızca semantic token'lar)
│   │       ├── button.test.tsx      davranış testleri
│   │       ├── button.stories.tsx   story'ler: state, variant, edge case
│   │       └── button.mdx           dokümantasyon sayfası
│   ├── tokens/
│   │   ├── primitives.css   ham değerler (--ufi-blue-600, --ufi-space-4)
│   │   ├── semantic.css     roller       (--ufi-color-action-primary-bg, --ufi-space-md)
│   │   └── index.ts         JS tarafı token'lar (breakpoint'ler, tipler)
│   ├── styles/              global CSS: token + reset + base (→ dist/styles.css)
│   ├── docs/                Storybook sayfaları: Introduction, Tokens
│   ├── test/setup.ts        test ortamı kurulumu
│   └── index.ts             public API — desteklenen tek giriş noktası
└── dist/                    build çıktısı (git'e girmez)
```

Component klasörleri düzdür; kategoriler (Foundations, Actions, Forms, Feedback, Overlay) yalnızca Storybook başlıklarında bulunur. Gerçekten gerektiğinde klasöre `use-*.ts` veya `*.types.ts` gibi ek dosyalar eklenebilir.

### Mevcut component'ler

| Kategori    | Component'ler                                                                                   |
| ----------- | ----------------------------------------------------------------------------------------------- |
| Foundations | `Heading`, `Text`, `Label`, `Stack`                                                             |
| Actions     | `Button`, `IconButton`                                                                          |
| Forms       | `FormField`, `FormLabel`, `FormDescription`, `FormMessage`, `useFormField`, `Input`, `Checkbox` |
| Feedback    | `Alert`, `Spinner`                                                                              |
| Overlay     | `Modal`                                                                                         |

## Mimari prensipler

- **Generic, domain'e özel değil.** Business logic yok. `Button` CMS hakkında hiçbir şey bilmez.
- **Önce native.** Component'ler native elementi render eder, tüm prop'larını kabul eder ve `ref`'i iletir (React 19 ref-as-prop). Yeniden yazmak yerine platform davranışı tercih edilir — `Modal` native bir `<dialog>`, `Checkbox` gerçek bir `<input type="checkbox">`'tır.
- **Varsayılan olarak erişilebilir.** Semantic HTML, klavye desteği, görünür focus, doğru ARIA. Sonradan eklenen bir özellik değil.
- **Değer değil, token.** Primitive → semantic → component. Component'ler yalnızca semantic token kullanır; tema, semantic katmanı override eder.
- **Composable, küçük API'ler.** `label`, `error`, `hint` prop'ları olan bir `Input` yerine `FormField` + `Input`. Boolean flag'ler yerine union tipler (`variant`, `size`).
- **Genişletmeye açık.** Variant'lar yerel CSS custom property'leri ayarlar; yeni bir variant base kuralı değiştirmez. `className` her zaman birleştirilir. `asChild` ve `useFormField` kullanan tarafın kendi elementlerini getirmesine izin verir.
- **Bağımlılık zorunluluğu yok.** Form kütüphanesi, router veya ikon seti gerekmez.
- **Erken abstraction yok.** Factory, service katmanı veya component'e özel mimari yok. Yeni dosya veya abstraction ikinci gerçek kullanım durumu ortaya çıktığında eklenir.

### Dependency'ler

Eklemeden önce sorun: _Bu, kendimiz çözmememiz gereken gerçek bir problemi çözüyor mu?_ Zor problemler için (konumlandırma, tarih seçici, virtualization, drag & drop, rich text) olgun kütüphaneler kullanılabilir. Temel olarak bir UI framework'ü kullanılmaz.

## Storybook

Storybook hem geliştirme ortamı hem de dokümantasyon sitesidir. Her component için:

- **Story'ler** (`*.stories.tsx`) — default, variant'lar, boyutlar, state'ler, edge case'ler, erişilebilirlik örnekleri.
- **Doküman sayfası** (`*.mdx`) — ne yapar, ne zaman kullanılır / kullanılmaz, props, variant'lar, state'ler, erişilebilirlik, örnekler, do / don't, ilgili component'ler.

Accessibility addon her story'de axe çalıştırır; ihlaller _Accessibility_ panelinde görünür.

## Test

Testler implementation'ı değil **kullanıcının gördüğü davranışı** tanımlar: rol ve erişilebilir isimle sorgula, `user-event` ile etkileşime geç, kullanıcının algılayacağı sonucu doğrula.

```tsx
await user.click(screen.getByRole('button', { name: 'Save' }));
expect(onSave).toHaveBeenCalledOnce();
```

jsdom `<dialog>`'u desteklemez; `src/test/setup.ts` minimal bir shim ekler. Gerçek dialog davranışı (focus, Escape, top layer) Storybook'ta doğrulanır.

## Build

`pnpm build` şu çıktıyı üretir:

```text
dist/
├── index.js, index.d.ts     public giriş noktası
├── components/**            kaynak modül başına bir ES modülü + .d.ts (tree-shake edilebilir)
└── styles.css               token'lar, reset, base ve tüm component stilleri
```

- **Yalnızca ESM**, `sideEffects` CSS ile sınırlı, React peer dependency.
- Hook kullanan modüller React Server Components (Next.js) için `'use client'` direktifini korur.
- Base stiller düşük öncelikli cascade layer'larda (`ufi-reset`, `ufi-base`) bulunur; uygulama CSS'i specificity savaşı olmadan kazanır.

## Paketi kullanmak (GitHub Packages)

`@ufisoft/ui` **private**'tır ve GitHub Packages'a yayınlanır; `ufisoft` GitHub organizasyonu üyeleri kurabilir.

1. `read:packages` yetkisine sahip bir GitHub personal access token (classic) oluşturun.
2. Kullanan projede bir `.npmrc` ekleyin (token'ın kendisini asla commit etmeyin):

   ```ini
   @ufisoft:registry=https://npm.pkg.github.com
   //npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
   ```

3. Token'ı shell'de veya CI'da `GITHUB_TOKEN` olarak tanımlayın, ardından:

   ```bash
   pnpm add @ufisoft/ui
   ```

4. Stylesheet'i uygulamanın kökünde bir kez import edin: `import '@ufisoft/ui/styles.css';`

Yalnızca `src/index.ts` export'ları public API'dir. Deep import'lar ve üretilen class adları (`ufi-button-x1y2z`) internal'dır ve herhangi bir release'te değişebilir; özelleştirme `className` ve semantic token'larla yapılır.

## Yayınlama

Versiyonlama Changesets ile **Semantic Versioning**'e uyar:

1. Kullanan tarafı etkileyen her değişiklik bir changeset içerir (`pnpm changeset`).
2. Bir maintainer `pnpm changeset version` çalıştırır — versiyonu artırır ve `CHANGELOG.md`'yi yazar.
3. Review ve merge sonrası `write:packages` yetkili token'a sahip bir maintainer `pnpm release` çalıştırır.

`publishConfig.registry` GitHub Packages'ı gösterir ve `access` değeri `restricted`'dır; paket yanlışlıkla public npm registry'ye yayınlanamaz. Lisans `UNLICENSED`'dır (proprietary).

Proje, bu akışın ileride değişiklik gerektirmeden GitHub Actions'a taşınabileceği şekilde yapılandırılmıştır.

## Katkı

Component geliştirme akışı, Definition of Done ve kurallar için [CONTRIBUTING.tr.md](./CONTRIBUTING.tr.md) dosyasına bakın.
