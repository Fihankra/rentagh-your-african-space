# Branded auth emails (Resend)

Supabase Auth still generates and validates every token — these steps only change
how the "confirm signup" and "reset password" emails look, and who sends them.
Both steps are Supabase Dashboard-only; there's no CLI/migration equivalent.

## 1. Verify a sending domain in Resend
In Resend → Domains, add a subdomain you control (e.g. `mail.rentagh.com`) and
add the DNS records Resend gives you. Wait for it to show "Verified".

## 2. Point Supabase's mailer at Resend (Custom SMTP)
Supabase Dashboard → Project Settings → Auth → **SMTP Settings** → enable custom
SMTP:
- Host: `smtp.resend.com`
- Port: `587`
- Username: `resend`
- Password: your Resend API key (the one already sitting in the old project's env)
- Sender email: an address on your verified domain, e.g. `notifications@mail.rentagh.com`
- Sender name: `RentaGh`

## 3. Paste in the branded templates
Supabase Dashboard → Authentication → **Email Templates**:
- "Confirm signup" → paste the contents of `confirm-signup.html`
- "Reset password" → paste the contents of `reset-password.html`

Both use Supabase's own `{{ .ConfirmationURL }}` placeholder — leave it as-is.

## 4. Update the logo URL
Both templates reference `https://rentagh.com/logo-icon.png`. Replace that host
with wherever the app is actually reachable (your Vercel preview URL, or the live
domain once it exists) before saving — email clients need an absolute, public
image URL.

## App-side env vars this also needs
Add to `.env` (and to Vercel/Cloudflare secrets):
- `RESEND_API_KEY` — used by `src/lib/notify.ts` for transactional notification
  emails (new enquiry, reply, listing published) — separate from the SMTP setup
  above, but the same Resend account/key.
- `RESEND_FROM_EMAIL` — e.g. `RentaGh <notifications@mail.rentagh.com>`
- `ARKESEL_API_KEY`, `ARKESEL_SENDER_ID` — SMS notifications via Arkesel.
