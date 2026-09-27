import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html>
      <Head>
        {/* The Hiraya logo as the tab icon */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icon-32.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#7A5AE4" />
      </Head>
      <body>
        {/* Apply the saved theme before the page paints, so dark mode never
            flashes light. Without a saved choice, follow the device. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var d=localStorage.getItem('darkMode');if(d==='true'||(d===null&&matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark')}catch(e){}`,
          }}
        />
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
