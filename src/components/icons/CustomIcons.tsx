import React from "react";

// Base icon component for consistency with Lucide icons
interface IconProps extends React.SVGProps<SVGSVGElement> {
  color?: string;
  size?: number | string;
  strokeWidth?: number;
}

const IconWrapper = ({
  children,
  color = "currentColor",
  size = 24,
  strokeWidth = 2,
  ...props
}: IconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {children}
    </svg>
  );
};

export const Parking = (props: IconProps) => (
  <IconWrapper {...props}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M9 17V7h4a3 3 0 0 1 0 6H9" />
  </IconWrapper>
);

export const Gym = (props: IconProps) => (
  <IconWrapper {...props}>
    <path d="M6 7v10" />
    <path d="M18 7v10" />
    <path d="M8 7h8" />
    <path d="M8 17h8" />
    <path d="M4 14h2" />
    <path d="M4 10h2" />
    <path d="M18 10h2" />
    <path d="M18 14h2" />
  </IconWrapper>
);

export const Garden = (props: IconProps) => (
  <IconWrapper {...props}>
    <path d="M12 19V5" />
    <path d="M7 10c0-4 7-4 7 0" />
    <path d="M12 19c-3 0-6-3-6-8 0 5 3 8 6 8z" />
    <path d="M12 19c3 0 6-3 6-8 0 5-3 8-6 8z" />
  </IconWrapper>
);

export const Pool = (props: IconProps) => (
  <IconWrapper {...props}>
    <path d="M2 12h20" />
    <path d="M2 16h20" />
    <path d="M6 8V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4" />
    <path d="M8 12v-2a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <path d="M18 20v-4" />
    <path d="M6 20v-4" />
    <path d="M10 20a2 2 0 1 0 4 0" />
  </IconWrapper>
);

export const Security = (props: IconProps) => (
  <IconWrapper {...props}>
    <path d="M12 2s8 2 8 10v3.111c0 .491.213.966.591 1.286l.8.64a2 2 0 0 1 0 3.127L20.6 20.8a2 2 0 0 1-2.6 0l-.8-.64a1.79 1.79 0 0 0-2.247 0l-.8.64a2 2 0 0 1-2.6 0l-.8-.64a1.79 1.79 0 0 0-2.247 0l-.8.64a2 2 0 0 1-2.6 0l-.8-.64A1.79 1.79 0 0 1 4 15.111V12c0-8 8-10 8-10Z" />
    <path d="m9 12 2 2 4-4" />
  </IconWrapper>
);

export const Elevator = (props: IconProps) => (
  <IconWrapper {...props}>
    <rect x="4" y="2" width="16" height="20" rx="2" />
    <path d="m8 8 4-4 4 4" />
    <path d="m8 16 4 4 4-4" />
    <path d="M12 10v4" />
  </IconWrapper>
);