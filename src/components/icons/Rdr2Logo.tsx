import { cn } from "@/lib/utils";

const Rdr2Logo = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 100 100"
    className={cn("h-10 w-10 text-primary", className)}
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g transform="translate(50,50) scale(1.2)">
      <path d="M0,-35 L10,-10 L35,-10 L15,10 L25,35 L0,20 L-25,35 L-15,10 L-35,-10 L-10,-10 Z"
            stroke="hsl(var(--accent))" strokeWidth="3" fill="none" />
      <text
        x="0"
        y="5"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="30"
        fontWeight="bold"
        className="fill-primary"
      >
        R
      </text>
    </g>
  </svg>
);

export default Rdr2Logo;
