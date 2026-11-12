export const LogoMark = ({ className = "w-9 h-9" }) => (
  <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
    <path
      d="M24 4c2.4 3.2 5.6 5 5.6 9.2a5.6 5.6 0 0 1-11.2 0c0-1.8.7-3.3 1.8-4.7.4 1.4 1.2 2.3 2.5 2.7C22 8.6 22.6 6.2 24 4Z"
      fill="#FFC107"
    />
    <rect x="15.5" y="17" width="9" height="9" rx="2.5" transform="rotate(-45 20 21.5)" fill="#EA1D2C" />
    <rect x="23.5" y="25" width="9" height="9" rx="2.5" transform="rotate(-45 28 29.5)" fill="#EA1D2C" />
    <rect x="31.5" y="33" width="9" height="9" rx="2.5" transform="rotate(-45 36 37.5)" fill="#EA1D2C" />
    <path d="M6 42 34.5 13.5" stroke="#1A1A1A" strokeWidth="2.6" strokeLinecap="round" />
  </svg>
);

export const LogoFull = () => (
  <a href="#topo" data-testid="logo-link" className="flex items-center gap-2.5 group">
    <LogoMark />
    <span className="font-display font-black text-xl tracking-tight leading-none text-carvao">
      Espetinhos <span className="text-brasa">West</span>
    </span>
  </a>
);
