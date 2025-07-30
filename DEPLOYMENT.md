# Deployment Guide

This guide covers deploying the Campaign Tracker application to various platforms.

## Prerequisites

- Node.js 18+ installed
- Git repository set up
- Supabase project created
- Environment variables configured

## Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Database Setup

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy the contents of `src/app/lib/supabase/schema.sql`
4. Paste and execute the SQL script
5. Verify all tables are created in the Table Editor

## Deployment Options

### 1. Vercel (Recommended)

Vercel is the easiest platform for Next.js applications.

#### Steps:
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and sign up/login
3. Click "New Project"
4. Import your GitHub repository
5. Configure environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Click "Deploy"

#### Build Settings:
- Framework Preset: Next.js
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

### 2. Netlify

#### Steps:
1. Push your code to GitHub
2. Go to [netlify.com](https://netlify.com) and sign up/login
3. Click "New site from Git"
4. Choose GitHub and select your repository
5. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
6. Add environment variables in Site settings
7. Deploy

### 3. Railway

#### Steps:
1. Push your code to GitHub
2. Go to [railway.app](https://railway.app) and sign up/login
3. Click "New Project"
4. Choose "Deploy from GitHub repo"
5. Select your repository
6. Add environment variables
7. Deploy

### 4. DigitalOcean App Platform

#### Steps:
1. Push your code to GitHub
2. Go to DigitalOcean App Platform
3. Create a new app
4. Connect your GitHub repository
5. Configure as a Next.js app
6. Add environment variables
7. Deploy

### 5. AWS Amplify

#### Steps:
1. Push your code to GitHub
2. Go to AWS Amplify Console
3. Click "New app" > "Host web app"
4. Connect your GitHub repository
5. Configure build settings for Next.js
6. Add environment variables
7. Deploy

## Production Checklist

Before deploying to production, ensure:

- [ ] Environment variables are set correctly
- [ ] Database schema is deployed
- [ ] Supabase RLS policies are active
- [ ] Authentication is configured
- [ ] Custom domain is set up (optional)
- [ ] SSL certificate is active
- [ ] Error monitoring is configured
- [ ] Analytics are set up (optional)

## Post-Deployment

### 1. Verify Functionality
- Test user registration and login
- Create a test campaign
- Verify export functionality
- Check taxonomy management

### 2. Set Up Monitoring
- Configure error tracking (Sentry, LogRocket)
- Set up uptime monitoring
- Configure performance monitoring

### 3. Security Review
- Verify RLS policies are working
- Test authentication flows
- Check for security headers
- Validate input sanitization

## Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clear cache and reinstall dependencies
rm -rf node_modules .next
npm install
npm run build
```

#### Environment Variables
- Ensure all required variables are set
- Check for typos in variable names
- Verify Supabase credentials are correct

#### Database Connection
- Verify Supabase project is active
- Check RLS policies are enabled
- Ensure database schema is deployed

#### Authentication Issues
- Verify Supabase Auth is enabled
- Check email templates are configured
- Test email verification flow

### Performance Optimization

1. **Enable Caching**
   ```bash
   # Add to next.config.js
   module.exports = {
     experimental: {
       optimizeCss: true,
     },
   }
   ```

2. **Image Optimization**
   - Use Next.js Image component
   - Configure image domains in next.config.js

3. **Bundle Analysis**
   ```bash
   npm install --save-dev @next/bundle-analyzer
   ```

## Scaling Considerations

### Database
- Monitor Supabase usage limits
- Consider upgrading plan if needed
- Implement connection pooling

### Application
- Use CDN for static assets
- Implement caching strategies
- Monitor memory usage

### Monitoring
- Set up alerts for errors
- Monitor response times
- Track user engagement

## Backup Strategy

### Database
- Supabase provides automatic backups
- Consider manual exports for critical data
- Test restore procedures

### Application
- Use Git for version control
- Store environment variables securely
- Document deployment procedures

## Security Best Practices

1. **Environment Variables**
   - Never commit secrets to Git
   - Use different keys for dev/staging/prod
   - Rotate keys regularly

2. **Authentication**
   - Enable MFA for admin accounts
   - Use strong password policies
   - Implement session management

3. **Data Protection**
   - Encrypt sensitive data
   - Implement proper access controls
   - Regular security audits

## Support

For deployment issues:
1. Check the troubleshooting section
2. Review platform-specific documentation
3. Contact platform support
4. Create an issue in the repository

## Updates and Maintenance

### Regular Tasks
- Update dependencies monthly
- Monitor for security vulnerabilities
- Review and update documentation
- Test backup and restore procedures

### Version Updates
1. Test in staging environment
2. Plan maintenance window
3. Deploy during low-traffic periods
4. Monitor for issues post-deployment 