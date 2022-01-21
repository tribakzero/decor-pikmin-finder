import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";

import '../styles/globals.css'
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import logo from "../public/logo.svg";

const queryClient = new QueryClient()

function MyApp({ Component, pageProps }) {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="p-2 min-h-screen flex-1 flex flex-col justify-center content-center">
        <Head>
          <title>Decor Pikmin Finder</title>
          <meta name="description" content="Find the Decor Pikmin you're missing" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <header className="flex flex-1 flex-grow-0 h-4">
          <Link href="/">
            <h1 className="m-0 px-6 leading-5 text-6xl cursor-pointer">
              <Image src={logo} width="100%" height="100%" alt="Welcome to Decor Pikmin Finder!" />
            </h1>
          </Link>
        </header>

        <main className="flex flex-1 items-center justify-center">
          <Component {...pageProps} />
        </main>

        <footer className="flex flex-grow-0 px-4 py-0 border-t-2 border-solid border-gray-50 justify-center content-center">
          <Link href="https://github.com/tribakzero/decor-pikmin-finder">
            <span className="flex justify-center content-center flex-grow hover:cursor-pointer">
              With love by tribak
            </span>
          </Link>
        </footer>
      </div>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
    )
}

export default MyApp
