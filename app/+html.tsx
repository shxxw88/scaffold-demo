import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: `
          html, body {
            height: 100%;
            margin: 0;
            padding: 0;
            background-color: #111111;
            display: flex;
            justify-content: center;
            align-items: center;
            overflow: hidden;
          }

          #root {
            width: 390px;
            height: 844px;
            overflow: hidden;
            border-radius: 40px;
            box-shadow: 0 30px 80px rgba(0, 0, 0, 0.6);
            position: relative;
          }

          @media (max-width: 500px) {
            #root {
              width: 100%;
              height: 100%;
              border-radius: 0;
              box-shadow: none;
            }
          }
        `}} />
      </head>
      <body>{children}</body>
    </html>
  );
}