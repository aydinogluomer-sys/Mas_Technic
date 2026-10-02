import { forwardRef } from "react";
import {
  Link as RouterLink,
  NavLink as RouterNavLink,
  Navigate as RouterNavigate,
  type LinkProps,
  type NavigateProps,
  type NavLinkProps,
} from "react-router-dom";
import { localizeTo, useLocale } from "./hooks";

/* Drop-in replacements for the router's `Link`, `NavLink` and `Navigate` that
   keep the reader in the locale the URL names (L01). A component imports these
   from `@/i18n/LocaleLink` instead of `react-router-dom`; destinations stay
   authored as Turkish paths. Hooks: `@/i18n/hooks`. */

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link({ to, ...rest }, ref) {
  const locale = useLocale();
  return <RouterLink ref={ref} to={localizeTo(to, locale)} {...rest} />;
});

export const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(function NavLink({ to, ...rest }, ref) {
  const locale = useLocale();
  return <RouterNavLink ref={ref} to={localizeTo(to, locale)} {...rest} />;
});

export function Navigate({ to, ...rest }: NavigateProps) {
  const locale = useLocale();
  return <RouterNavigate to={localizeTo(to, locale)} {...rest} />;
}
