# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

### Development

```bash
# Install dependencies (using pnpm)
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Run production server
pnpm start

# Run linting
pnpm lint
```

### Git Workflow

This project uses semantic-release with gitmoji. Commit messages should follow the pattern:

- 🎨 `:art:` - Improve structure/format
- ✨ `:sparkles:` - New feature
- 🐛 `:bug:` - Bug fix
- 🔧 `:wrench:` - Configuration changes
- ♻️ `:recycle:` - Refactor code
- 🔒 `:lock:` - Security fixes
- 🗑️ `:wastebasket:` - Remove code/files

## Architecture Overview

### Core Application Flow

1. **Authentication**: Users authenticate via Google OAuth through Supabase Auth
2. **Dream Creation**: Users input dream fragments → AI generates story + images → Saved to Supabase
3. **Dream Library**: Personal and public dream collections with social features
4. **Analytics**: Track dream patterns, emotions, and usage statistics

### Key Technical Decisions

#### State Management

- **Server State**: TanStack Query (React Query) for all API calls with optimistic updates
- **Form State**: React Hook Form for complex forms
- **Auth State**: Supabase Auth hooks and AuthContext provider

#### Data Fetching Patterns

- Use React Query hooks in `hooks/` directory (e.g., `useDreams`, `useUserProfile`)
- Mutations follow optimistic update pattern with cache invalidation
- All Supabase queries use the client from `utils/supabase/client`

#### Component Structure

- **Page Components**: In `app/` directory using Next.js App Router
- **Shared Components**: In `components/` directory
- **UI Primitives**: In `components/ui/` (shadcn/ui components)
- **Providers**: In `components/providers/` for context and global state

#### Styling Architecture

- Tailwind CSS with custom Oneiri theme configuration
- CSS variables for theme colors (dark/light mode)
- Component-specific styles use Tailwind classes
- Global styles in `app/globals.css`

### Important Patterns

#### Protected Routes

```typescript
// Use AuthGuard component for protected pages
<AuthGuard>
  <YourProtectedComponent />
</AuthGuard>
```

#### API Calls

```typescript
// Always use React Query hooks for data fetching
const { data, isLoading, error } = useDreams();

// For mutations
const { mutate } = useCreateDream({
  onSuccess: () => {
    // Handle success
  },
});
```

#### Type Safety

- All database types are generated in `types/database.types.ts`
- Custom types in `types/dreams.ts`, `types/analysis.ts`, etc.
- Always use proper TypeScript types, avoid `any`

### Database Considerations

- Row-level security is enabled on all tables
- Soft deletion pattern used for user data (`deleted_at` field)
- API usage tracked in `api_usage_logs` table
- Dream stories stored as JSON for flexibility

### AI Integration

- Gemini 2.0 Flash for text generation (stories)
- Gemini 2.0 Flash Preview for image generation
- Edge functions handle AI API calls to avoid exposing keys
- Rate limiting and usage tracking implemented

### Performance Optimizations

- Image optimization disabled for AI-generated images
- React Query caching reduces unnecessary API calls
- Lazy loading for dream images
- Suspense boundaries for better loading states

### Security Notes

- Never expose API keys in client code
- All sensitive operations go through Supabase Edge Functions
- Authentication required for all user-specific operations
- Input validation on both client and server
