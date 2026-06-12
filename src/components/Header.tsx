type HeaderProps = {
  onProposeSpot: () => void
}

export function Header({ onProposeSpot }: HeaderProps) {
  return (
    <header className="site-header">
      <div className="site-header-brand">
        <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="" className="site-logo" width={32} height={32} />
        <span className="site-title">Calisthenics 19</span>
      </div>

      <button type="button" className="header-cta" onClick={onProposeSpot}>
        Proposer un spot
      </button>
    </header>
  )
}