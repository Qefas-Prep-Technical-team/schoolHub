import React, { useState } from 'react';
import { View, StyleSheet, useColorScheme } from 'react-native';
import { WebView } from 'react-native-webview';

interface LaTeXRendererProps {
  content: string;
}

export default function LaTeXRenderer({ content }: LaTeXRendererProps) {
  const [webViewHeight, setWebViewHeight] = useState(0);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css" />
      <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js"></script>
      <script defer src="https://cdn.jsdelivr.net/npm/markdown-it@13.0.1/dist/markdown-it.min.js"></script>
      <script defer src="https://cdn.jsdelivr.net/npm/markdown-it-texmath@1.0.0/texmath.min.js"></script>
      <style>
        body {
          font-family: -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          font-size: 16px;
          color: ${isDark ? '#cbd5e1' : '#334155'};
          background-color: transparent;
          padding: 0;
          margin: 0;
          word-wrap: break-word;
        }
        img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin-top: 16px;
          margin-bottom: 16px;
        }
        ul, ol {
          padding-left: 20px;
        }
        p {
          margin-top: 0;
          margin-bottom: 12px;
          line-height: 1.6;
        }
      </style>
    </head>
    <body>
      <div id="content"></div>
      <script>
        document.addEventListener("DOMContentLoaded", function() {
          var tm = window.texmath.use(window.katex);
          var md = window.markdownit({ html: true, breaks: true }).use(tm, { engine: window.katex, delimiters: 'dollars' });
          var rawContent = decodeURIComponent("${encodeURIComponent(content || '')}");
          document.getElementById('content').innerHTML = md.render(rawContent);
          
          // Send the height back to React Native
          setTimeout(function() {
            window.ReactNativeWebView.postMessage(document.body.scrollHeight);
          }, 100);
        });
      </script>
    </body>
    </html>
  `;

  return (
    <View style={{ height: Math.max(webViewHeight, 20) }}>
      <WebView
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        style={{ backgroundColor: 'transparent' }}
        scrollEnabled={false}
        bounces={false}
        showsVerticalScrollIndicator={false}
        onMessage={(event) => {
          const height = Number(event.nativeEvent.data);
          if (height > 0) {
            setWebViewHeight(height + 10);
          }
        }}
        injectedJavaScript="window.ReactNativeWebView.postMessage(document.body.scrollHeight);"
      />
    </View>
  );
}
