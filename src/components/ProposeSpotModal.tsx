import { useState } from 'react'

type ProposeSpotModalProps = {
  onClose: () => void
}

const EQUIPMENT_OPTIONS = [
  'Barres de traction',
  'Barres parallèles',
  'Barres à dips',
  'Barres de suspension',
  'Anneaux',
  'Échelle horizontale',
  'Pont de singe',
  'Banc abdos',
  'Espalier',
  'Modules fitness',
  'Modules parkour',
  'Modules cross-training',
  'Sac de frappe',
  'Poids',
  'Pneu fonctionnel',
  'Fontaine',
  'Accessible PMR',
]

const CONTACT_EMAIL = 'ton@email.com' // ← remplace ici

export function ProposeSpotModal({ onClose }: ProposeSpotModalProps) {
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [coords, setCoords] = useState('')
  const [equipment, setEquipment] = useState<string[]>([])
  const [note, setNote] = useState('')
  const [locating, setLocating] = useState(false)

  const toggleEquipment = (item: string) => {
    setEquipment((current) =>
      current.includes(item) ? current.filter((e) => e !== item) : [...current, item],
    )
  }

  const handleGeolocate = () => {
    if (!navigator.geolocation) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords(`${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`)
        setLocating(false)
      },
      () => setLocating(false),
      { enableHighAccuracy: true },
    )
  }

  const handleSubmit = () => {
    const lines = [
      `Nom du spot : ${name || '(non renseigné)'}`,
      `Adresse : ${address || '(non renseignée)'}`,
      `Coordonnées GPS : ${coords || '(non renseignées)'}`,
      coords ? `Google Maps : https://maps.google.com/?q=${coords.replace(' ', '')}` : '',
      ``,
      `Équipements :`,
      equipment.length > 0 ? equipment.map((e) => `  - ${e}`).join('\n') : '  (non renseignés)',
      ``,
      `Notes : ${note || '(aucune)'}`,
      ``,
      `---`,
      `Tu peux joindre une ou plusieurs photos à ce mail.`,
    ]
      .filter((l) => l !== null)
      .join('\n')

    const subject = encodeURIComponent(`[SW Paris] Nouveau spot : ${name || 'sans nom'}`)
    const body = encodeURIComponent(lines)
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`
  }

  const canSubmit = name.trim().length > 0 || address.trim().length > 0

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <strong>Proposer un spot</strong>
          <button type="button" className="sheet-close" onClick={onClose} aria-label="Fermer">
            ✕
          </button>
        </div>

        <div className="modal-body">
          {/* Nom */}
          <div className="form-field">
            <label className="form-label" htmlFor="spot-name">
              Nom du lieu
            </label>
            <input
              id="spot-name"
              type="text"
              className="form-input"
              placeholder="Ex : Jardin de Belleville"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Adresse */}
          <div className="form-field">
            <label className="form-label" htmlFor="spot-address">
              Adresse
            </label>
            <input
              id="spot-address"
              type="text"
              className="form-input"
              placeholder="Ex : 47 Rue des Couronnes, 75020"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          {/* GPS */}
          <div className="form-field">
            <label className="form-label" htmlFor="spot-coords">
              Coordonnées GPS
            </label>
            <div className="form-input-row">
              <input
                id="spot-coords"
                type="text"
                className="form-input"
                placeholder="48.123456, 2.123456"
                value={coords}
                onChange={(e) => setCoords(e.target.value)}
              />
              <button
                type="button"
                className="form-geo-btn"
                onClick={handleGeolocate}
                disabled={locating}
                title="Utiliser ma position actuelle"
              >
                {locating ? '…' : '📍'}
              </button>
            </div>
            <p className="form-hint">
              Tape les coordonnées ou clique 📍 pour utiliser ta position actuelle (sois sur place).
            </p>
          </div>

          {/* Équipements */}
          <div className="form-field">
            <p className="form-label">Équipements présents</p>
            <div className="equipment-badges" style={{ marginTop: 6 }}>
              {EQUIPMENT_OPTIONS.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`equipment-badge equipment-badge--toggle${equipment.includes(item) ? ' equipment-badge--active' : ''}`}
                  onClick={() => toggleEquipment(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Note */}
          <div className="form-field">
            <label className="form-label" htmlFor="spot-note">
              Notes (optionnel)
            </label>
            <textarea
              id="spot-note"
              className="form-input form-textarea"
              placeholder="Affluence, éclairage, accès, état du matériel…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
          </div>

          <p className="form-hint form-hint--photo">
            📎 Après envoi, tu pourras joindre des photos directement dans ton application mail.
          </p>
        </div>

        <div className="modal-footer">
          <button type="button" className="modal-btn-cancel" onClick={onClose}>
            Annuler
          </button>
          <button
            type="button"
            className="modal-btn-submit"
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            Ouvrir dans mon mail →
          </button>
        </div>
      </div>
    </div>
  )
}