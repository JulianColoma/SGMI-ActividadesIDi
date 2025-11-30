This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Debugging DB / API connectivity 🔧

If the `Proyectos` page doesn't show data, check the API and DB connection using the small helper script provided:

1. Make sure your dev server is running:

```bash
npm run dev
```

2. Run the API tester (defaults to http://localhost:3000):

```bash
node scripts/check_api_investigacion.js
# or pass a custom base URL
node scripts/check_api_investigacion.js http://localhost:3001
```

If the script returns HTTP 200 and JSON { success: true, data: [...] } your backend is reachable and the `app/proyectos/page.tsx` will successfully fetch the list of investigaciones (it uses `/api/investigacion`). If you see errors, check:

- Environment variables used by the server (POSTGRES_HOST, POSTGRES_USER, POSTGRES_DB, POSTGRES_PASSWORD, POSTGRES_PORT).
- That the Postgres container is running (if using Docker). Example:

```powershell
docker compose ps
docker compose logs postgres
```

Feel free to paste any error output here and I can help you troubleshoot the next step.
