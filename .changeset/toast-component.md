---
'@ufisoft/ui': minor
---

Add `ToastProvider` and `useToast`: short, temporary messages shown with `toast({ title, description, tone, duration, action })`, built on Radix Toast (new dependency `@radix-ui/react-toast`). While a `Modal` is open the page outside it is inert, so close the modal before showing a toast.
