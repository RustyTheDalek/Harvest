# GitHub Pages Deployment Guide

This project is set up to automatically deploy to GitHub Pages when you push to the `main` or `master` branch.

## Initial Setup

1. **Update the base path in `vite.config.js`**:
   - If your GitHub repository name is NOT "Harvest", change the `base` path:
   ```js
   base: process.env.NODE_ENV === 'production' ? '/YourRepoName/' : '/',
   ```

2. **Enable GitHub Pages in your repository**:
   - Go to your repository on GitHub
   - Click **Settings** → **Pages**
   - Under **Source**, select **GitHub Actions** (not "Deploy from a branch")
   - Save the settings

3. **Push your code**:
   ```bash
   git add .
   git commit -m "Setup GitHub Pages deployment"
   git push origin main
   ```

## Automatic Deployment

Once set up, the GitHub Actions workflow will:
- Automatically build your app when you push to `main` or `master`
- Deploy the built files to GitHub Pages
- Your site will be available at: `https://yourusername.github.io/Harvest/`

## Manual Deployment

If you want to deploy manually:

1. Build the project:
   ```bash
   npm run build
   ```

2. The built files will be in the `dist` folder

3. You can preview the build locally:
   ```bash
   npm run preview
   ```

## Troubleshooting

- **404 errors**: Make sure the `base` path in `vite.config.js` matches your repository name
- **Build fails**: Check the Actions tab in GitHub to see the error logs
- **Site not updating**: Wait a few minutes for GitHub Pages to update (can take 1-5 minutes)

