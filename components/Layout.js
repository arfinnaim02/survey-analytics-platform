import Head from 'next/head';

export default function Layout({ title, children }) {
  return (
    <>
      <Head>
        <title>{title ? `${title} | Survey Platform` : 'Survey Platform'}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className="min-h-screen bg-background text-text font-sans">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6">
          {children}
        </div>
      </main>
    </>
  );
}