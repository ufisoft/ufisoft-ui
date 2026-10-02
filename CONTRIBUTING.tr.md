# UfiSoft UI'a Katkı

[English](./CONTRIBUTING.md) · **Türkçe**

UfiSoft UI Kit'e katkı verdiğiniz için teşekkürler. Bu rehber bir component'in nasıl ekleneceğini veya değiştirileceğini ve "tamamlandı"nın ne anlama geldiğini açıklar.

## Başlamadan önce

- **Generic mi?** UI Kit domain logic içermez. Component yalnızca tek bir üründe anlamlıysa (ör. `OrderStatus`), o ürüne aittir.
- **Zaten var mı?** Yeni bir component yerine mevcut component'leri birleştirmeyi tercih edin (`Stack` + `Button`).
- **Yeni component'lerde önce API'yi tartışın:** kullanım senaryoları, önerilen prop'lar ve render edeceği native elementi içeren kısa bir issue açın.

## Component geliştirme akışı

1. **Klasörü oluşturun** `src/components/<isim>/` (kebab-case):

   | Dosya                | Amaç                            |
   | -------------------- | ------------------------------- |
   | `index.tsx`          | Implementation ve public tipler |
   | `<isim>.module.css`  | Stiller                         |
   | `<isim>.test.tsx`    | Davranış testleri               |
   | `<isim>.stories.tsx` | Story'ler                       |
   | `<isim>.mdx`         | Dokümantasyon sayfası           |

   `use-<isim>.ts`, `<isim>.types.ts` gibi dosyaları yalnızca açıkça fayda sağladığında ekleyin. Aynı component ailesinin parçaları (ör. `FormField`, `FormLabel`, `FormMessage`) tek bir klasörü paylaşır.

2. Aşağıdaki API kurallarına göre **implement edin**.
3. Yalnızca semantic token'larla **stil verin**.
4. Kullanıcının gördüğü davranış için **test yazın**.
5. **Story yazın**: default, variant'lar, boyutlar, state'ler, edge case'ler, erişilebilirlik.
6. MDX ile **dokümante edin** (şablon aşağıda).
7. Component'i ve public tiplerini `src/index.ts`'ten **export edin**.
8. **Changeset ekleyin**: `pnpm changeset`.
9. **Doğrulayın**: `pnpm lint && pnpm typecheck && pnpm test && pnpm build` çalıştırın ve Storybook _Accessibility_ panelini kontrol edin.

## API kuralları

- Native elementin prop'larını extend edin: `interface ButtonProps extends ComponentProps<'button'>`.
- `ref` normal bir prop'tur (React 19). Root elemente iletin; component elemente kendisi de erişecekse `useImperativeHandle` kullanın.
- `className`'i her zaman `clsx(styles.x, className)` ile birleştirin ve kalan prop'ları root'a spread edin.
- Boolean flag'ler (`primary`, `secondary`) yerine **union prop'lar** (`variant: 'primary' | 'secondary'`) tercih edin.
- Native davranışı koruyun: native `disabled`, `required`, `type`; controlled ve uncontrolled kullanımın ikisi de çalışmalı.
- Varsayılanlar güvenli olmalı: `Button` varsayılan olarak `type="button"`'dur.
- Event'leri niyete göre adlandırın: `onClose` + `onOpen` değil, `onOpenChange(open)`.
- Component kullanan tarafın elementini render etmeliyse (ör. router link'leri) `asChild` (Radix Slot) kullanın.
- Form kontrolleri bir `FormField`'a katılmak için `useFormField(props)` çağırır.
- Hook, context veya tarayıcı API'si kullanan modüllerin başına `'use client'` ekleyin.
- Domain isimleri, uygulamaya özel prop'lar, form kütüphanesi veya router bağımlılığı yok.

## Stil kuralları

- **Yalnızca semantic token'lar** (`--ufi-color-*`, `--ufi-space-*`, …). Hex değer yok; spacing, renk, radius, gölge veya font boyutu için ham `px` yok. Primitive token'lar (`--ufi-blue-600`) yalnızca `semantic.css` içindir.
  - İstisnalar: `0`, `--ufi-border-width` ile `1px` çizgiler, içsel geometri (ör. modal genişliği) ve yüzdeler.
- **Variant ve boyutlar yerel custom property'leri ayarlar** (`--_bg`, `--_height`), base kural bunları okur. Yeni bir variant eklemek base kuralı değiştirmemelidir.
- Rakamla başlayan veya JS reserved word olan class adlarına prefix verilir: `size-2xl`, `tone-default`.
- RTL uyumu için logical property'ler kullanın (`padding-inline`, `inline-size`).
- Her interaktif elementin görünür bir `:focus-visible` stili olmalıdır.
- Animasyonlar `prefers-reduced-motion`'a uyar. Transition'lar global olarak kapatılır; anlam taşıyan animasyonlar (ör. Spinner) durmak yerine yavaşlar.
- Component'lerde global CSS yok. `:global()` yalnızca scope'lanamayan bir etki için (ör. scroll kilidi).
- Component'lerde inline stil yok.

## Test kuralları

- **Rol ve erişilebilir isimle** sorgulayın (`getByRole('button', { name: 'Save' })`). `getByTestId` ve class adlarından kaçının.
- Klavye dahil `@testing-library/user-event` ile etkileşime geçin.
- Kullanıcının algıladığını doğrulayın: görünür metin, state (`toBeChecked`, `toBeDisabled`, `toBeInvalid`), erişilebilir isim ve açıklamalar, callback'ler.
- Internal state, hook veya CSS class'larını doğrulamayın.
- Kapsam: varsayılan davranış, klavye etkileşimi, disabled/loading state'leri, ARIA bağlantıları, `ref` iletimi.

## Dokümantasyon şablonu

Her `<isim>.mdx` dosyası şu bölümleri bu sırayla içerir:

```mdx
import { ArgTypes, Canvas, Meta } from '@storybook/addon-docs/blocks';
import * as Stories from './<isim>.stories';

<Meta of={Stories} />

# ComponentName

Tek cümle: ne yapar.

<Canvas of={Stories.Default} />

## When to use

## When not to use (alternatif component'i belirtin)

## Props (<ArgTypes of={Stories} /> + notlar)

## Variants / Sizes

## States

## Examples (gerçek kullanım kompozisyonları)

## Accessibility (semantik, klavye, ARIA, tuzaklar)

## Do / Don't (tablo)

## Related components
```

Storybook dokümanları İngilizce yazılır. Dokümantasyon yalnızca prop'ları değil, **neden ve ne zaman** kullanılacağını da açıklar.

## Definition of Done

Bir component değişikliği şu koşullarda tamamlanmış sayılır:

- [ ] Generic'tir ve domain logic içermez.
- [ ] API yukarıdaki kurallara uyar ve tipleriyle birlikte `src/index.ts`'ten export edilir.
- [ ] Stiller yalnızca semantic token kullanır; focus, hover, disabled ve diğer state'ler stillendirilmiştir.
- [ ] Yalnızca klavyeyle kullanılabilir ve Storybook Accessibility paneli ihlal göstermez.
- [ ] Testler davranışı kapsar ve geçer.
- [ ] Story'ler default, variant, boyut, state ve edge case'leri gösterir.
- [ ] MDX sayfası şablona uyar.
- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test` ve `pnpm build` başarılıdır.
- [ ] Değişikliği kullanan taraf için açıklayan bir changeset vardır.

## Versiyonlama ve release

[Semantic Versioning](https://semver.org/) kullanılır:

| Artış   | Ne zaman                                                                                                   |
| ------- | ---------------------------------------------------------------------------------------------------------- |
| `major` | Kırıcı değişiklik: kaldırılan/yeniden adlandırılan export veya prop, değişen varsayılan, kaldırılan token. |
| `minor` | Yeni component, prop, variant veya token — geriye uyumlu.                                                  |
| `patch` | API'yi değiştirmeyen hata veya görsel düzeltme.                                                            |

Versiyon `0.x` iken kırıcı değişiklikler `minor` artırır.

Release akışı (maintainer'lar):

```bash
pnpm changeset version   # versiyonu artır, CHANGELOG.md'yi yaz
# review, commit, merge
pnpm release             # build + GitHub Packages'a yayınla
```

## Commit'ler ve hook'lar

`pnpm install`, yalnızca staged dosyalarda ESLint ve Prettier çalıştıran bir **pre-commit hook** (simple-git-hooks + lint-staged) kurar; commit'ler hızlı kalır. Tip kontrolü ve testler hook'un parçası değildir; pull request açmadan önce (ve ileride CI'da) çalıştırın.

Hook eksikse `pnpm exec simple-git-hooks` çalıştırın.

Commit mesajlarını emir kipinde ve değişikliği anlatacak şekilde yazın: `Add indeterminate state to Checkbox`.
