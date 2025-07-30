# Campaign Tracker v2.0

A comprehensive campaign management platform that streamlines marketing campaign naming conventions and cross-platform tracking. Built with Next.js 14, TypeScript, Supabase, and Tailwind CSS.

## 🚀 Features

### Core Functionality
- **Multi-Platform Campaign Management**: Support for Meta Ads, Google Ads, TikTok, DV360, LinkedIn, and Twitter
- **Automated ID Generation**: Platform-specific naming conventions and validation
- **Hierarchical Taxonomy System**: Flexible categorization with required/optional fields
- **Campaign Creation Wizard**: Multi-step guided workflow
- **Export Functionality**: CSV, JSON, and implementation guide generation
- **Role-Based Access Control**: Admin, manager, and user roles
- **Real-time Dashboard**: Campaign statistics and analytics

### Technical Features
- **Next.js 14** with App Router and TypeScript
- **Supabase** for authentication, database, and real-time features
- **Tailwind CSS** with shadcn/ui components
- **Zustand** for state management
- **File upload** and asset management
- **CSV/JSON export** with implementation guides
- **Responsive design** for mobile and desktop

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Git

## 🛠️ Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd campaign-tracker
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Set up the database

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `src/app/lib/supabase/schema.sql`
4. Run the SQL script to create all tables, indexes, and policies

### 5. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🗄️ Database Schema

The application uses the following main tables:

- **profiles**: User profiles extending Supabase auth
- **taxonomy_categories**: Campaign categorization system
- **taxonomy_values**: Individual taxonomy values
- **advertising_platforms**: Supported ad platforms with naming rules
- **campaigns**: Main campaign data with platform-specific IDs
- **campaign_assets**: File attachments for campaigns
- **platform_configurations**: Platform-specific settings
- **campaign_templates**: Reusable campaign templates

## 🎯 Usage

### Authentication
1. Sign up with your email and password
2. Verify your email (check spam folder)
3. Sign in to access the dashboard

### Creating Campaigns
1. Click "New Campaign" on the dashboard
2. Follow the 4-step wizard:
   - **Platform Selection**: Choose your advertising platform
   - **Basic Info**: Enter campaign name, objective, budget, etc.
   - **Taxonomy**: Categorize your campaign using the taxonomy system
   - **Review**: Review details and generated platform-specific ID

### Managing Taxonomy
1. Navigate to Taxonomy Management
2. Create categories (Platform, Industry, Objective, etc.)
3. Add values to each category
4. Mark categories as required for campaigns

### Exporting Campaigns
1. Click "Export" on the dashboard
2. Select campaigns to export
3. Choose format (CSV, JSON, or Implementation Guide)
4. Configure export options
5. Download the generated file

## 🔧 Configuration

### Platform Naming Conventions

Each platform has specific naming rules:

- **Meta Ads**: Lowercase with hyphens, 40 character limit
- **Google Ads**: Title case with spaces, 255 character limit
- **TikTok**: Lowercase with underscores, 512 character limit
- **DV360**: Title case with spaces, 100 character limit

### Taxonomy Categories

Default categories include:
- Platform (required)
- Industry (required)
- Objective (required)
- Channel (required)
- Audience (optional)
- Geographic (optional)
- Seasonal (optional)
- Product (optional)

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Environment Variables for Production

```env
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_supabase_anon_key
```

### Build Commands

```bash
npm run build
npm start
```

## 📁 Project Structure

```
campaign-tracker/
├── src/
│   ├── app/
│   │   ├── lib/
│   │   │   ├── supabase/
│   │   │   │   ├── client.ts
│   │   │   │   ├── queries.ts
│   │   │   │   └── schema.sql
│   │   │   └── utils.ts
│   │   ├── types/
│   │   │   └── database.ts
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── features/
│   │   │   └── campaign/
│   │   │       ├── wizard/
│   │   │       │   └── CampaignWizard.tsx
│   │   │       ├── taxonomy/
│   │   │       │   └── TaxonomyManager.tsx
│   │   │       └── export/
│   │   │           └── ExportManager.tsx
│   │   └── ui/
│   │       ├── button.tsx
│   │       └── input.tsx
│   └── context/
│       └── AuthProvider.tsx
├── public/
├── package.json
└── README.md
```

## 🔒 Security

- Row Level Security (RLS) enabled on all tables
- User authentication via Supabase Auth
- Role-based access control
- Input validation and sanitization
- Secure file upload handling

## 🧪 Testing

```bash
# Run linting
npm run lint

# Run type checking
npx tsc --noEmit
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support, email support@campaigntracker.com or create an issue in the repository.

## 🔄 Version History

### v2.0.0 (Current)
- Complete rewrite with Next.js 14
- Multi-step campaign wizard
- Advanced taxonomy management
- Export functionality
- Role-based access control
- Real-time dashboard

### v1.0.0
- Basic campaign management
- Simple taxonomy system
- CSV export

## 🎯 Roadmap

- [ ] Advanced analytics and reporting
- [ ] Campaign performance tracking
- [ ] Team collaboration features
- [ ] API integrations with ad platforms
- [ ] Mobile app
- [ ] Advanced filtering and search
- [ ] Campaign templates
- [ ] Bulk operations
- [ ] Automated reporting
- [ ] Multi-language support
