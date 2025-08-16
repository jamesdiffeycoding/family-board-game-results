import { Link as ReactRouterLink } from "react-router-dom";
import { cn } from "../utils/cn";

type LinkProps = React.ComponentProps<typeof ReactRouterLink> & {
  variant?: "default" | "small" | "nav";
};

export default function JLink({
  variant = "default",
  className,
  ...props
}: LinkProps) {
  const baseClasses =
    "inline-block rounded transition-colors bg-blue-100 hover:bg-blue-200";
  const variantClasses = {
    default: "px-4 py-2",
    small: "",
    nav: "",
  };

  return (
    <ReactRouterLink
      className={cn(baseClasses, variantClasses[variant], className)}
      {...props}
    />
  );
}
