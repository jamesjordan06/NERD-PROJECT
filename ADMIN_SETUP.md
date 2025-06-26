# Admin Content Generation System Setup

## Overview
This guide will help you set up the admin-only AI content generation system for Interstellar Nerd.

## Prerequisites
- Next.js 15+ project with Supabase
- OpenAI API key
- Unsplash API key (optional, for images)

## Environment Variables
Add these to your `.env.local` file:

```env
# OpenAI API Key (required for content generation)
OPENAI_API_KEY=your_openai_api_key_here

# Unsplash API Key (optional, for better images)
UNSPLASH_ACCESS_KEY=your_unsplash_access_key_here
```

## Database Setup

### Option 1: Using Prisma (Recommended)
```bash
npx prisma migrate dev --name add-admin-content-system
```

### Option 2: Manual SQL (if Prisma fails)
1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Run the contents of `scripts/add-admin-content-system.sql`

## Making a User an Admin

### Option 1: Via Supabase Dashboard
1. Go to your Supabase dashboard
2. Navigate to Table Editor > profiles
3. Find your user and set `is_admin` to `true`

### Option 2: Via SQL
```sql
UPDATE profiles 
SET is_admin = TRUE 
WHERE user_id = 'your-user-id-here';
```

## Features

### 🔒 Admin Authentication
- Uses existing Supabase Auth
- Admin status checked via `is_admin` boolean in profiles table
- Protected routes at `/admin/*`
- Unauthorized page for non-admin users

### 🧠 AI Content Generation
- Category-based content generation
- Custom prompt override support
- 1500-2000 word articles
- SEO-optimized with meta titles/descriptions
- Automatic tag generation
- Image URL fetching (via Unsplash or placeholders)

### 📝 Content Management
- Draft/publish status
- Scheduled publishing
- Version history tracking
- Search and filtering
- Mobile-responsive dashboard

### 🚫 Duplicate Prevention
- Checks for similar topics in last 30 days
- Prevents duplicate content generation

## API Endpoints

### Admin Check
- `GET /api/check-admin` - Verify admin status

### Content Generation
- `POST /api/admin/generate-content` - Generate AI content

### Posts Management
- `GET /api/admin/posts` - List all posts
- `POST /api/admin/posts` - Create new post
- `PUT /api/admin/posts/[id]` - Update post
- `DELETE /api/admin/posts/[id]` - Delete post

### Statistics
- `GET /api/admin/stats` - Get dashboard statistics

## Usage

### 1. Access Admin Dashboard
Navigate to `/admin` in your browser. You must be logged in and have admin privileges.

### 2. Generate Content
1. Click "Generate Content" button
2. Select a category from the dropdown
3. Optionally add a custom prompt
4. Click "Generate Content"
5. Review the generated content
6. Save as draft or publish

### 3. Manage Posts
- View all posts in the dashboard
- Filter by category, status, or search terms
- Edit, preview, or delete posts
- View post statistics

## Security Features

- Row Level Security (RLS) enabled on all tables
- Admin-only access to content generation
- Session-based authentication
- Protected API endpoints
- Input validation and sanitization

## Customization

### Adding New Categories
Edit the `CATEGORIES` array in:
- `app/admin/generate/page.tsx`
- `app/api/admin/generate-content/route.ts`

### Modifying AI Prompts
Edit the prompt template in `app/api/admin/generate-content/route.ts`

### Styling
The system uses Tailwind CSS. Customize styles in the component files.

## Troubleshooting

### "Admin access required" error
- Ensure your user has `is_admin = true` in the profiles table
- Check that you're logged in with the correct account

### Content generation fails
- Verify your OpenAI API key is set correctly
- Check the browser console for detailed error messages
- Ensure you have sufficient OpenAI credits

### Database connection issues
- Verify your Supabase connection string
- Check that all required tables exist
- Ensure RLS policies are configured correctly

## Production Deployment

### Vercel
1. Add environment variables in Vercel dashboard
2. Deploy as usual - the system will work automatically

### Other Platforms
- Ensure all environment variables are set
- Run database migrations
- Verify admin user setup

## Support

For issues or questions:
1. Check the browser console for errors
2. Verify all environment variables are set
3. Ensure database tables are created correctly
4. Check admin user permissions

## Future Enhancements

- Two-factor authentication for admins
- Advanced content scheduling
- Bulk content generation
- Content analytics and insights
- Integration with external CMS
- Advanced image generation with DALL-E
- Content approval workflows 