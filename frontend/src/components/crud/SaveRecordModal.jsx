import { useState } from 'react'
import useStore from '../../store/useStore'
import toast from 'react-hot-toast'

export default function SaveRecordModal({ onClose }) {
  const { weather, currentDateFrom, currentDateTo, createRecord } = useStore()
  const today = new Date().toISOString().slice(0, 10)

  const [form, setForm] = useState({
    location_query: weather?.current?.city || '',
    date_from:      currentDateFrom || today,
    date_to:        currentDateTo   || today,
    notes:          '',
  })
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!form.location_query.trim()) { toast.error('Location is required'); return }
    if (form.date_from > form.date_to) { toast.error('Start date must be before end date'); return }
    setSaving(true)
    try {
      await createRecord(form)
      toast.success('Record saved!')
      onClose()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
      <div className="glass-strong rounded-2xl p-6 w-full max-w-md fade-up">
        <h3 className="section-title mb-5">Save Weather Record</h3>

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs text-night-400 font-display uppercase tracking-wider mb-1.5 block">Location</label>
            <input className="input-field" value={form.location_query}
              onChange={e => set('location_query', e.target.value)}
              placeholder="City, ZIP, or coordinates" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-night-400 font-display uppercase tracking-wider mb-1.5 block">From</label>
              <input type="date" className="input-field" value={form.date_from}
                onChange={e => set('date_from', e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-night-400 font-display uppercase tracking-wider mb-1.5 block">To</label>
              <input type="date" className="input-field" value={form.date_to}
                onChange={e => set('date_to', e.target.value)} />
            </div>
          </div>

          {/* Info sobre o período */}
          {currentDateFrom && currentDateTo ? (
            <p className="text-xs text-aurora-cyan font-body">
              📅 Period from your search pre-filled — you can adjust if needed.
            </p>
          ) : (
            <p className="text-xs text-night-500 font-body">
              No date range was used in this search. Dates default to today.
            </p>
          )}

          <div>
            <label className="text-xs text-night-400 font-display uppercase tracking-wider mb-1.5 block">
              Notes <span className="text-night-600">(optional)</span>
            </label>
            <textarea className="input-field resize-none" rows={3} value={form.notes}
              onChange={e => set('notes', e.target.value)}
              placeholder="Trip notes, reminders…" />
          </div>
        </div>

        <div className="flex gap-3 mt-6 justify-end">
          <button onClick={onClose} className="btn-ghost">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
            {saving && <span className="w-4 h-4 border-2 border-night-900 border-t-transparent rounded-full animate-spin" />}
            Save Record
          </button>
        </div>
      </div>
    </div>
  )
}
