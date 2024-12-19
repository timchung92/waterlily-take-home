import { createContext, useContext, ReactNode } from 'react';

type GenericContextProps<T> = T | undefined;

export function createGenericContext<T>() {
  const context = createContext<GenericContextProps<T>>(undefined);

  const useGenericContext = () => {
    const ctx = useContext(context);
    if (ctx === undefined) {
      throw new Error('useGenericContext must be used within a provider');
    }
    return ctx;
  };

  const GenericContextProvider = ({
    children,
    value,
  }: {
    children: ReactNode;
    value: T;
  }) => {
    return <context.Provider value={value}>{children}</context.Provider>;
  };

  return [GenericContextProvider, useGenericContext] as const;
}
