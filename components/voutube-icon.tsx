export function VouTubeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="90"
      height="20"
      viewBox="0 0 90 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="1"
        y="1"
        width="26"
        height="18"
        rx="5"
        fill="#FF0000"
      />
      <path
        d="M10 5L18 10L10 15V5Z"
        fill="white"
        transform="translate(-1, 0)"
      />
      <text
        x="32"
        y="15"
        fill="currentColor"
        className="text-base font-bold"
      >
        VouTube
      </text>
    </svg>
  )
} 