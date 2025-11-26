import type { ButtonHTMLAttributes, FC, ReactNode } from "react";

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export const PrimaryButton: FC<PrimaryButtonProps> = ({
  children,
  ...props
}) => {
  return (
    <button className="primary-button" {...props}>
      <span>{children}</span>
      <span>→</span>
    </button>
  );
};
