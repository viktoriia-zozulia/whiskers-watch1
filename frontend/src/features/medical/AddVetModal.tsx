import { useState } from 'react'
import { usePet } from '../../hooks/usePet'
import { inputSm } from '../../shared/lib/styles'
import { Modal, ModalActions } from '../../shared/ui/Modal'

export function AddVetModal({ onClose }: { onClose: () => void }) {
  const { createVet } = usePet()
  const [clinic, setClinic] = useState('')
  const [doc_name, setDocName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true)
    const v = await createVet({ clinic: clinic.trim(), doc_name: doc_name.trim() || undefined, phone: phone.trim() || undefined })
    setLoading(false)
    if (v) onClose()
  }

  return (
    <Modal title="Контакт ветеринара" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Клініка *</label>
          <input value={clinic} onChange={e => setClinic(e.target.value)} required placeholder="Ветклініка «Лапа»" className={inputSm} />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Лікар</label>
          <input value={doc_name} onChange={e => setDocName(e.target.value)} placeholder="Др. Іван Петренко" className={inputSm} />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Телефон</label>
          <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+380 50 123 45 67" className={inputSm} />
        </div>
        <ModalActions onCancel={onClose} loading={loading} disabled={!clinic.trim()} />
      </form>
    </Modal>
  )
}
