import { FunctionComponent } from "react";

import { Link, LinkProps } from "react-router-dom";
import { pageToUrl } from '..';

export interface PageLinkProps<TProps extends ObjectMap<string> | {} = {}> extends Omit<LinkProps, 'to'> {
  to: FunctionComponent<TProps>;
  targetProps?: TProps;
}

export function PageLink<TProps extends ObjectMap<string>>(props: PageLinkProps<TProps>) {
  const { to, targetProps, ...linkProps } = props;
  return (
    <Link to={pageToUrl(to as any, targetProps)} {...linkProps} />
  );
}

export interface HrefLinkProps extends Omit<LinkProps, 'to'> {
  to: string;
}

export function HrefLink(props: HrefLinkProps) {
  const { to, ...linkProps } = props;
  return (
    <Link to={to} {...linkProps} />
  );
}


