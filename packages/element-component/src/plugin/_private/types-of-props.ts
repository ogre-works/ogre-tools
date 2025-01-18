import React from 'react';

export type DataAttributes = {
  [key: `data-${string}`]: string | undefined;
};

export type AllHtmlAttributes = React.AllHTMLAttributes<HTMLElement>;

export type AllHtmlAttributesAndDataAttributes = AllHtmlAttributes &
  DataAttributes;
