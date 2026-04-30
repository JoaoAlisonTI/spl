function Header() {
  return (
    <div className="p-6 flex flex-col items-center gap-2">
      <div className="icon-wrap">
        <svg viewBox="0 0 24 24">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </div>
    </div>
  );
}

export default Header;
