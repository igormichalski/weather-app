import { useEffect, useState } from 'react'
import useStore from '../../store/useStore'
import { recordsApi } from '../../services/api'
import toast from 'react-hot-toast'

const FORMATS = ['json', 'csv', 'xml', 'markdown', 'pdf']

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

function EditModal({ record, onClose, onSaved }) {
  const { updateRecord } = useStore()
  const [form, setForm] = useState({
    location_query: record.location_query,
    date_from:      record.date_from,
    date_to:        record.date_to,
    notes:          record.notes || '',
  })
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (form.date_from > form.date_to) { toast.error('Start date must be before end date'); return }
    setSaving(true)
    try {
      await updateRecord(record.id, form)
      toast.success('Record updated!')
      onSaved(); onClose()
    } catch (err) {
      toast.error(err.message)
    } finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
      <div className="glass-strong rounded-2xl p-6 w-full max-w-md fade-up">
        <h3 className="section-title mb-5">Edit Record #{record.id}</h3>
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs text-night-400 font-display uppercase tracking-wider mb-1.5 block">Location</label>
            <input className="input-field" value={form.location_query} onChange={e => set('location_query', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-night-400 font-display uppercase tracking-wider mb-1.5 block">From</label>
              <input type="date" className="input-field" value={form.date_from} onChange={e => set('date_from', e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-night-400 font-display uppercase tracking-wider mb-1.5 block">To</label>
              <input type="date" className="input-field" value={form.date_to} onChange={e => set('date_to', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-xs text-night-400 font-display uppercase tracking-wider mb-1.5 block">Notes</label>
            <textarea className="input-field resize-none" rows={3} value={form.notes} onChange={e => set('notes', e.target.value)} />
          </div>
        </div>
        <div className="flex gap-3 mt-6 justify-end">
          <button onClick={onClose} className="btn-ghost">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
            {saving && <span className="w-4 h-4 border-2 border-night-900 border-t-transparent rounded-full animate-spin" />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}

export default function RecordsTable() {
  const { records, recordsLoading, recordsError, fetchRecords, deleteRecord } = useStore()
  const [editTarget, setEditTarget] = useState(null)
  const [search, setSearch]         = useState('')
  const [exporting, setExporting]   = useState(null)

  useEffect(() => { fetchRecords() }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this record?')) return
    try { await deleteRecord(id); toast.success('Deleted!') }
    catch (err) { toast.error(err.message) }
  }

  const handleExport = async (fmt) => {
    setExporting(fmt)
    try {
      const { data } = await recordsApi.export(fmt, search ? { city: search } : {})
      downloadBlob(data, `weather_records.${fmt === 'markdown' ? 'md' : fmt}`)
      toast.success(`Exported as ${fmt.toUpperCase()}`)
    } catch { toast.error('Export failed') }
    finally { setExporting(null) }
  }

  const filtered = search
    ? records.filter(r => r.city.toLowerCase().includes(search.toLowerCase()))
    : records

  return (
    <div className="flex flex-col gap-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <input className="input-field max-w-xs" placeholder="Filter by city…"
          value={search} onChange={e => setSearch(e.target.value)} />
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-night-500">Export:</span>
          {FORMATS.map(fmt => (
            <button key={fmt} onClick={() => handleExport(fmt)} disabled={!!exporting}
              className="btn-ghost text-xs py-1 px-3 uppercase tracking-widest font-mono">
              {exporting === fmt
                ? <span className="w-3 h-3 border border-aurora-cyan border-t-transparent rounded-full animate-spin inline-block" />
                : fmt}
            </button>
          ))}
        </div>
      </div>

      {/* States */}
      {recordsLoading && <p className="text-night-400 text-sm text-center py-8">Loading records…</p>}
      {recordsError   && <p className="text-red-400 text-sm text-center py-8">{recordsError}</p>}
      {!recordsLoading && !recordsError && filtered.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-night-400 text-sm">No records yet. Search for a location and save it!</p>
        </div>
      )}

      {/* Table */}
      {filtered.length > 0 && (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {['#', 'Location', 'City', 'Date Range', 'Notes', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-display text-night-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.id} className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors">
                    <td className="px-4 py-3 text-night-500 font-mono text-xs">{r.id}</td>
                    <td className="px-4 py-3 text-night-300 max-w-[140px] truncate">{r.location_query}</td>
                    <td className="px-4 py-3 text-white font-medium">
                      {r.city} <span className="text-night-500 text-xs">{r.country}</span>
                    </td>
                    <td className="px-4 py-3 text-night-300 whitespace-nowrap font-mono text-xs">
                      {r.date_from} → {r.date_to}
                    </td>
                    <td className="px-4 py-3 text-night-400 max-w-[160px] truncate">{r.notes || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => setEditTarget(r)} className="btn-ghost text-xs py-1 px-2.5">Edit</button>
                        <button onClick={() => handleDelete(r.id)} className="btn-danger text-xs py-1 px-2.5">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {editTarget && (
        <EditModal record={editTarget} onClose={() => setEditTarget(null)} onSaved={fetchRecords} />
      )}
    </div>
  )
}
