import "@/styles/globals.css";

import Head from "next/head";
import { createStore } from "redux";
import { createWrapper } from "next-redux-wrapper";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { CacheProvider } from "@emotion/react";

import { store, persistor } from "../src/redux/store";
import reducer from "@/src/redux/reducer";
import createEmotionCache from "../src/createEmotionCache";

const makeStore = (context) => createStore(reducer);
const wrapper = createWrapper(makeStore, { debug: false });
const clientSideEmotionCache = createEmotionCache();

function MyApp(props) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <CacheProvider value={emotionCache}>
          <Head>
            <meta
              name="viewport"
              content="initial-scale=1, width=device-width"
            />
            <title>Viewer</title>
            <link rel="manifest" href="/manifest.json" />
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link
              href="https://db.onlinewebfonts.com/c/05e476e067ffef74ca5686f229c40a63?family=PingFang+SC+Regular"
              rel="stylesheet"
            />
            <link
              rel="preconnect"
              href="https://fonts.gstatic.com"
              crossorigin
            />
            <link
              href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800&display=swap"
              rel="stylesheet"
            />
          </Head>

          <Component {...pageProps} />
        </CacheProvider>
      </PersistGate>
    </Provider>
  );
}

export default wrapper.withRedux(MyApp);