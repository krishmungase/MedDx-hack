// Lightweight, zero-dep "Save as PDF" helper.
//
// We open a clean new window with the prescription rendered as plain HTML +
// print styles, then call window.print(). The browser handles the rest —
// users can save as PDF, send to AirPrint, etc. Same result as a real PDF
// for a hackathon, without bundling jsPDF/puppeteer.

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

const renderMedicationsTable = (meds) => {
  if (!meds?.length) return ''
  return `
    <table class="meds">
      <thead>
        <tr>
          <th>Medication</th>
          <th>Dose</th>
          <th>Frequency</th>
          <th>Duration</th>
          <th>Notes</th>
        </tr>
      </thead>
      <tbody>
        ${meds
          .map(
            (m) => `
          <tr>
            <td><strong>${esc(m.name)}</strong></td>
            <td>${esc(m.dose)}</td>
            <td>${esc(m.frequency)}</td>
            <td>${esc(m.duration)}</td>
            <td>${esc(m.notes)}</td>
          </tr>`
          )
          .join('')}
      </tbody>
    </table>`
}

const renderAdvice = (advice) => {
  if (!advice?.length) return ''
  return `
    <section>
      <h3>Advice</h3>
      <ul>${advice.map((a) => `<li>${esc(a)}</li>`).join('')}</ul>
    </section>`
}

const renderRawFallback = (prescription) => {
  const raw =
    typeof prescription === 'string'
      ? prescription
      : prescription?.rawText || ''
  if (!raw) return ''
  return `<section><h3>Doctor's note</h3><pre>${esc(raw)}</pre></section>`
}

const buildHTML = ({
  prescription,
  doctorName,
  doctorSpecialty,
  patientName,
  date,
  notes,
}) => {
  const structured = prescription && typeof prescription === 'object'
  const meds = structured ? prescription.medications || [] : []
  const advice = structured ? prescription.advice || [] : []
  const followUp = structured ? prescription.followUp || '' : ''
  const summary = structured ? prescription.plainLanguageSummary || '' : ''
  const language = structured ? prescription.language || 'en' : 'en'

  return `<!DOCTYPE html>
<html lang="${language}">
<head>
<meta charset="utf-8" />
<title>Prescription · ${esc(patientName || 'Patient')}</title>
<style>
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  body {
    font-family: 'Google Sans', system-ui, -apple-system, Segoe UI, sans-serif;
    color: #1a1f2e;
    margin: 0;
    padding: 40px;
    background: #fffaf0;
  }
  .sheet {
    max-width: 720px;
    margin: 0 auto;
    background: #fff;
    border: 1px solid #e5e1d7;
    border-radius: 12px;
    padding: 40px;
  }
  header.top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 2px solid #4f46e5;
    padding-bottom: 16px;
    margin-bottom: 24px;
  }
  .brand {
    font-size: 28px;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: #4f46e5;
    margin: 0;
  }
  .brand-dot { color: #6366f1; }
  .eyebrow {
    text-transform: uppercase;
    letter-spacing: 0.16em;
    font-size: 10px;
    color: #6b7280;
    margin-top: 4px;
  }
  .meta {
    text-align: right;
    font-size: 12px;
    color: #4b5563;
    line-height: 1.6;
  }
  .meta strong { color: #1a1f2e; }
  .patient {
    background: #f7f2e7;
    border: 1px solid #e5e1d7;
    border-radius: 10px;
    padding: 12px 16px;
    display: flex;
    justify-content: space-between;
    margin-bottom: 24px;
    font-size: 13px;
  }
  .patient .label {
    text-transform: uppercase;
    letter-spacing: 0.14em;
    font-size: 10px;
    color: #6b7280;
  }
  h2 {
    font-size: 18px;
    margin: 28px 0 12px;
    color: #4f46e5;
  }
  h3 {
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    color: #6b7280;
    margin: 20px 0 8px;
  }
  section { margin-bottom: 16px; }
  .summary {
    background: #ecf5ec;
    border: 1px solid #b3d4c1;
    border-radius: 10px;
    padding: 14px 18px;
    font-size: 14px;
    line-height: 1.6;
    margin-bottom: 24px;
  }
  table.meds {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
    margin-bottom: 12px;
  }
  table.meds th {
    text-align: left;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    font-size: 10px;
    color: #6b7280;
    border-bottom: 1px solid #e5e1d7;
    padding: 8px 6px;
  }
  table.meds td {
    border-bottom: 1px dashed #e5e1d7;
    padding: 10px 6px;
    vertical-align: top;
  }
  ul { margin: 0; padding-left: 18px; font-size: 13px; line-height: 1.7; }
  pre {
    background: #f3eee2;
    padding: 12px 14px;
    border-radius: 8px;
    font-size: 12px;
    white-space: pre-wrap;
    word-break: break-word;
    margin: 0;
  }
  .followup {
    border-left: 3px solid #4f46e5;
    padding: 8px 14px;
    background: #f7f2e7;
    font-size: 13px;
    margin: 16px 0;
  }
  .signature {
    margin-top: 36px;
    padding-top: 16px;
    border-top: 1px dashed #e5e1d7;
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: #4b5563;
  }
  .disclaimer {
    margin-top: 20px;
    background: #fff8e6;
    border: 1px solid #f1d899;
    border-radius: 8px;
    padding: 10px 14px;
    font-size: 11px;
    color: #6b4d00;
    line-height: 1.5;
  }
  @media print {
    body { background: #fff; padding: 0; }
    .sheet { border: 0; padding: 24px; }
  }
</style>
</head>
<body>
  <div class="sheet">
    <header class="top">
      <div>
        <h1 class="brand">MedDx<span class="brand-dot">.</span></h1>
        <p class="eyebrow">Prescription</p>
      </div>
      <div class="meta">
        <div><strong>Dr ${esc(doctorName || 'Doctor')}</strong></div>
        ${doctorSpecialty ? `<div>${esc(doctorSpecialty)}</div>` : ''}
        <div>${esc(date || new Date().toLocaleString())}</div>
      </div>
    </header>

    <div class="patient">
      <div>
        <div class="label">Patient</div>
        <div><strong>${esc(patientName || '—')}</strong></div>
      </div>
      <div style="text-align:right">
        <div class="label">Consult mode</div>
        <div>Video consult</div>
      </div>
    </div>

    ${
      summary
        ? `<div class="summary"><strong>In plain language:</strong><br/>${esc(summary)}</div>`
        : ''
    }

    ${notes ? `<section><h3>Doctor's notes</h3><pre>${esc(notes)}</pre></section>` : ''}

    ${meds.length ? '<h2>Medications</h2>' : ''}
    ${renderMedicationsTable(meds)}
    ${renderAdvice(advice)}
    ${followUp ? `<div class="followup"><strong>Follow-up:</strong> ${esc(followUp)}</div>` : ''}
    ${!structured ? renderRawFallback(prescription) : ''}

    <div class="signature">
      <div>
        <div>_________________________</div>
        <div style="margin-top:4px">Dr ${esc(doctorName || 'Doctor')}${doctorSpecialty ? ' · ' + esc(doctorSpecialty) : ''}</div>
      </div>
      <div>
        <div>Issued via MedDx</div>
      </div>
    </div>

    <p class="disclaimer">
      This prescription was reviewed and approved by a licensed doctor on a
      MedDx video consult. AI was used to format the doctor's notes; it did
      not prescribe or diagnose. Keep this document for your records.
    </p>
  </div>
  <script>
    window.addEventListener('load', () => {
      setTimeout(() => { window.focus(); window.print(); }, 100)
    })
  </script>
</body>
</html>`
}

const printPrescription = (params) => {
  const html = buildHTML(params)
  const win = window.open('', '_blank', 'width=820,height=1000')
  if (!win) {
    alert('Please allow pop-ups to download the prescription.')
    return
  }
  win.document.open()
  win.document.write(html)
  win.document.close()
}

export default printPrescription
