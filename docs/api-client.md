**Overview**

# API Client

<!-- Placeholder -->

#### `graphql-env.d.ts`

Our thoughts on adding the `graphql-env.d.ts` file to your `.gitignore` vary depending on if you are working in the monorepo vs. a scaffolded project:

- In the monorepo, it should be ignored, because we don't want that file committed to the monorepo accidentally
- In created projects, we don't ignore it, because we assume you might want to share it with other members of your team (e.g., if you're an agency all working on a single storefront and want to make sure you're using the same types)
