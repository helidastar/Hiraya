import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html>
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Lobster&display=swap" rel="stylesheet" />
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
