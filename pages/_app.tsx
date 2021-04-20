// eslint-disable-next-line
import '../styles/globals.css'
import theme from '../styles/theme'
import '@fontsource/inter/700.css'
import '@fontsource/inter/400.css'
import Head from 'next/head'

import { ChakraProvider } from '@chakra-ui/react'

import * as Sentry from '@sentry/react'
import { Integrations } from '@sentry/tracing'

Sentry.init({
  dsn: 'https://ff771404287542638b24e14b8de8edff@o573965.ingest.sentry.io/5724646',
  environment: process.env.NODE_ENV,
  integrations: [new Integrations.BrowserTracing()],
  tracesSampleRate: 1.0,
})

const title = 'My Covid Story | Every number has a story'
const description = 'Every covid number has a story which deserves to be shared'
const previewImage = 'https://www.mycovidstory.ca/img/landingpage-v2.jpg'

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="icon" href="/favicon.ico" />

        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={previewImage} />

        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={previewImage} />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <ChakraProvider theme={theme}>
        <Component {...pageProps} />
      </ChakraProvider>
    </>
  )
}

export default MyApp
