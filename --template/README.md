
# JRK Labor Management App

This is a [Next.js](https://nextjs.org) application designed for managing labour, advances, daily work logs, and other related tasks for JRK Enterprises. It uses Prisma with PostgreSQL for database management and is intended for deployment on Vercel.

## Getting Started

These instructions assume you have Node.js, pnpm, and the Vercel CLI installed.

### 1. Clone the Repository (If you haven't already)
```bash
# If you're cloning from GitHub:
# git clone <your-repository-url>
# cd jrk-labor-management
```

### 2. Install Dependencies
Install project dependencies using pnpm:
```bash
pnpm install
```

### 3. Set Up Environment Variables

This project requires several environment variables to connect to Vercel services (Postgres, Blob, KV) and potentially Google AI services.

*   **Create a `.env.local` file** in the root of your project.
*   **For Vercel Services (Postgres, Blob, KV):**
    1.  Ensure your project is linked to a Vercel project (`vercel link`).
    2.  Ensure you have created and connected a Vercel Postgres database, a Vercel Blob store, and a Vercel KV store to your project via the Vercel dashboard.
    3.  Pull the environment variables from Vercel into your local file:
        ```bash
        vercel env pull .env.development.local
        ```
        This command will populate your `.env.development.local` file (or `.env.local` if you prefer that name, just ensure it's gitignored) with variables like `DATABASE_URL`, `BLOB_READ_WRITE_TOKEN`, `KV_URL`, `KV_REST_API_TOKEN`, etc.
*   **For Google AI (Genkit):**
    *   If using Google AI features, add your `GOOGLE_API_KEY` to the `.env.local` file:
        ```
        GOOGLE_API_KEY=your_google_api_key_here
        ```
*   **Ensure `.env.local` is in your `.gitignore` file.**

### 4. Set Up Prisma and Database

*   **Define Your Database Schema:**
    *   Edit the `prisma/schema.prisma` file to define your data models (e.g., `Labour`, `AdvancePayment`, `DailyLogEntry`, etc.).
*   **Run Database Migrations:**
    *   This will create the necessary tables in your Vercel Postgres database based on your `schema.prisma` file and generate the Prisma Client.
    ```bash
    npx prisma migrate dev --name init
    ```
    (Replace `init` with a more descriptive migration name if you prefer, e.g., `create_labour_tables`).
*   **Seed the Database (Optional):**
    *   If you have a seed script defined in `prisma/seed.ts` (or configured in `package.json`), you can populate your database with initial data:
    ```bash
    npx prisma db seed
    ```

### 5. Run the Development Server
Start the Next.js development server:
```bash
pnpm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Key Technologies Used

*   **Framework:** [Next.js](https://nextjs.org/) (with App Router)
*   **UI:** [React](https://react.dev/), [ShadCN UI](https://ui.shadcn.com/), [Tailwind CSS](https://tailwindcss.com/)
*   **Database ORM:** [Prisma](https://www.prisma.io/)
*   **Database:** [Vercel Postgres](https://vercel.com/storage/postgres)
*   **File Storage:** [Vercel Blob](https://vercel.com/storage/blob)
*   **Key-Value Storage:** [Vercel KV](https://vercel.com/storage/kv)
*   **AI Integration:** [Genkit](https://firebase.google.com/docs/genkit) (with Google AI)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **Fonts:** [Geist Font](https://vercel.com/font)

## Deployment

This application is configured for deployment on [Vercel](https://vercel.com/).

1.  Push your code to a Git repository (e.g., GitHub, GitLab).
2.  Connect your Git repository to a new Vercel project.
3.  Ensure all necessary environment variables (as mentioned in Step 3) are configured in your Vercel project settings (Project -> Settings -> Environment Variables).
4.  Vercel will automatically build and deploy your application upon pushes to the connected branch.

## Learn More

*   **Next.js Documentation:** [https://nextjs.org/docs](https://nextjs.org/docs)
*   **Prisma Documentation:** [https://www.prisma.io/docs](https://www.prisma.io/docs)
*   **Vercel Documentation:** [https://vercel.com/docs](https://vercel.com/docs)

