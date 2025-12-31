# 🚀 Deploy DCK Tools to Vercel

## Quick Start (3 steps)

### 1. Install Vercel CLI (optional, or use web UI)

```bash
npm i -g vercel
```

### 2. Deploy via Web UI (Recommended)

**A. Go to Vercel Dashboard:**

- Visit <https://vercel.com/new>
- Sign in with GitHub

**B. Import Repository:**

- Click "Import Git Repository"
- Select your main project repository (e.g., `dck-tools`)
- Click "Import"

**C. Configure Project:**

- **Framework Preset:** Vite
- **Root Directory:** `./` (keep default)
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

**D. Environment Variables:**
Click "Environment Variables" and add:

```
VITE_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
VITE_API_URL=https://your-backend-api.com
VITE_WS_URL=wss://your-backend-api.com
VITE_NETWORK=mainnet-beta
```

**E. Deploy:**

- Click "Deploy"
- Wait 2-3 minutes for build
- Your app will be live at `https://your-project.vercel.app`

---

### 3. Deploy via CLI (Alternative)

```bash
# Login to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### App loads but shows blank screen

- Check browser console for errors
- Verify environment variables are set in Vercel
- Check if RPC URL is accessible

### Routes return 404

- Verify `vercel.json` rewrites are configured
- Check that `outputDirectory` is set to `dist`

### WebSocket connection fails

- Ensure `VITE_WS_URL` uses `wss://` (not `ws://`)
- Check CORS settings on backend API
- Verify WebSocket server is running

---

## 🎯 Production Checklist

Before deploying to production:

- [ ] Environment variables set in Vercel
- [ ] RPC URL points to mainnet (not devnet)
- [ ] Backend API is deployed and accessible
- [ ] WebSocket server is running
- [ ] CORS configured for your Vercel domain
- [ ] Custom domain configured (optional)
- [ ] Analytics/monitoring enabled (optional)

---

## 📦 Build Output

After successful build:
```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── [other hashed assets]
└── sounds/
    └── [audio files]
```

Vercel will serve this automatically with:

- Gzip/Brotli compressionn
- Global CDN
- Automatic HTTPS
- Zero-downtime deployments

---

## 🔄 Continuous Deployment

Vercel automatically deploys on every push:

- **main branch** → Production (`your-project.vercel.app`)
- **Other branches** → Preview (`your-project-git-branch.vercel.app`)
- **Pull Requests** → Preview with unique URL

---

## 🌐 Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain (e.g., `dcktools.com`)
3. Update DNS records as instructed
4. Wait for DNS propagation (~5-10 minutes)
5. HTTPS certificate auto-generated

---

## 📊 Monitoring

View deployment metrics:

- **Vercel Dashboard** → Analytics
- **Real User Monitoring** (RUM)
- **Build logs** for each deployment
- **Function logs** (if using serverless)

---

## 🚨 Emergency Rollback

If deployment breaks:

1. Go to Deployments tab
2. Find last working deployment
3. Click "..." → "Promote to Production"
4. Instant rollback (no rebuild needed)

---

## 💡 Pro Tips

1. **Preview Deployments:** Test on preview URL before promoting to production
2. **Environment Variables:** Use different values for preview vs production
3. **Build Cache:** Vercel caches `node_modules` for faster builds
4. **Analytics:** Enable Vercel Analytics for user insights
5. **Edge Functions:** Consider using Vercel Edge for API routes

---

## 📞 Support

- **Vercel Docs:** <https://vercel.com/docs>
- **Vite Docs:** <https://vitejs.dev/guide/>
- **DCK Tools Issues:** GitHub repository issues tab

---

## Ready to Deploy!

Your DCK Tools app is now ready for deployment! 🎨✨
