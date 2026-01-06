# Quick Start - Automation Setup

## Run the Automation

Simply run:

```bash
node automate-full-setup.js
```

## What It Does

1. ✅ Opens browser automatically
2. ✅ Logs into GitHub and creates token
3. ✅ Logs into Vercel (you'll enter OTP)
4. ✅ Adds `GITHUB_TOKEN` to Vercel
5. ✅ Triggers redeploy

## When Prompted

**OTP Code:** Check your email (`koushik.tech2003@gmail.com`) for Vercel verification code

**Manual Token (if needed):** If token extraction fails, paste the token from browser (starts with `ghp_`)

## After Completion

1. Wait 1-2 minutes for Vercel to redeploy
2. Test by adding a brand in admin dashboard
3. Verify changes appear on live site
4. Delete `.github-token-temp.txt` file

## Troubleshooting

If automation fails:
- Browser stays open for manual completion
- See `AUTOMATION_USAGE.md` for detailed troubleshooting
- Manual setup instructions are in the error messages

## Files

- `automate-full-setup.js` - Main script (run this)
- `email-otp-handler.js` - OTP helper
- `validate-setup.js` - Validation script
- `AUTOMATION_USAGE.md` - Full documentation

