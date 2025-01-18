export type Namespace = '$';
export const NAMESPACE: Namespace = '$' as const;

export const isNamespaced = ([propName]: [string, any]) =>
  propName.startsWith(NAMESPACE);
