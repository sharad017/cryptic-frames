# Deploying cryptic.frames to Vercel (Free, 5 minutes)

## Step 1 — Push to GitHub
1. Go to github.com → New repository → name it `cryptic-frames` → Create
2. In your project folder, open terminal:
```
git init
git add .
git commit -m "initial"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/cryptic-frames.git
git push -u origin main
```

## Step 2 — Deploy on Vercel
1. Go to vercel.com → Sign up with GitHub (free)
2. Click "Add New Project"
3. Import your `cryptic-frames` repo
4. Click Deploy — done in 60 seconds
5. Your site is live at `cryptic-frames.vercel.app`

## Step 3 — Custom domain (optional)
In Vercel dashboard → your project → Settings → Domains
Add `crypticframes.com` or whatever domain you buy (Namecheap ~$10/year)

## Step 4 — Enable real contact form
1. Go to web3forms.com
2. Enter your email → get a free Access Key
3. Open `app/components/ContactForm.tsx`
4. Replace `YOUR_WEB3FORMS_KEY` with your key
5. Push to GitHub → Vercel auto-deploys

## Notes
- Every time you push to GitHub, Vercel auto-deploys your changes
- Images in public/ are included in deployment — keep file sizes reasonable
- Free Vercel plan supports unlimited personal projects
