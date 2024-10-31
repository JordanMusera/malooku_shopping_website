// app/redux-provider-wrapper.tsx (Client Component)
"use client"; // This file is a Client Component

import { Provider } from "react-redux";
import store from "@/store/store";

export default function ReduxProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Provider store={store}>{children}</Provider>;
}
