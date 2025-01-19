export type Namespace = '$';
export const NAMESPACE: Namespace = '$' as const;

export const isNamespaced = ([key]: [string, any]) => key.startsWith(NAMESPACE);
