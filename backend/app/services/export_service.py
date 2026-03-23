import csv
import io
import json
from fastapi import HTTPException
from fastapi.responses import StreamingResponse
from app.models.weather_record import WeatherRecord


def _to_dicts(records: list[WeatherRecord]) -> list[dict]:
    """Converte os registros do banco em dicionários simples."""
    return [
        {
            "id":             r.id,
            "location":       r.location_query,
            "city":           r.city,
            "country":        r.country,
            "latitude":       r.latitude,
            "longitude":      r.longitude,
            "date_from":      r.date_from,
            "date_to":        r.date_to,
            "notes":          r.notes or "",
            "created_at":     str(r.created_at),
        }
        for r in records
    ]


def export_json(records):
    data = json.dumps(_to_dicts(records), indent=2, ensure_ascii=False)
    return StreamingResponse(
        io.BytesIO(data.encode()),
        media_type="application/json",
        headers={"Content-Disposition": "attachment; filename=weather_records.json"},
    )


def export_csv(records):
    output = io.StringIO()
    dicts  = _to_dicts(records)
    if dicts:
        writer = csv.DictWriter(output, fieldnames=dicts[0].keys())
        writer.writeheader()
        writer.writerows(dicts)
    else:
        output.write("No records found")
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode()),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=weather_records.csv"},
    )


def export_xml(records):
    lines = ['<?xml version="1.0" encoding="UTF-8"?>', "<weather_records>"]
    for r in _to_dicts(records):
        lines.append("  <record>")
        for k, v in r.items():
            lines.append(f"    <{k}>{v}</{k}>")
        lines.append("  </record>")
    lines.append("</weather_records>")
    xml_str = "\n".join(lines)
    return StreamingResponse(
        io.BytesIO(xml_str.encode()),
        media_type="application/xml",
        headers={"Content-Disposition": "attachment; filename=weather_records.xml"},
    )


def export_markdown(records):
    dicts = _to_dicts(records)
    lines = ["# Weather Records\n"]
    if dicts:
        headers = list(dicts[0].keys())
        lines.append("| " + " | ".join(h.replace("_", " ").title() for h in headers) + " |")
        lines.append("| " + " | ".join(["---"] * len(headers)) + " |")
        for row in dicts:
            lines.append("| " + " | ".join(str(row[h]) for h in headers) + " |")
    else:
        lines.append("_Nenhum registro encontrado._")
    return StreamingResponse(
        io.BytesIO("\n".join(lines).encode()),
        media_type="text/markdown",
        headers={"Content-Disposition": "attachment; filename=weather_records.md"},
    )


def export_pdf(records):
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.lib import colors
        from reportlab.lib.styles import getSampleStyleSheet
        from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
    except ImportError:
        raise HTTPException(500, "reportlab não instalado")

    buf    = io.BytesIO()
    doc    = SimpleDocTemplate(buf, pagesize=A4, leftMargin=30, rightMargin=30)
    styles = getSampleStyleSheet()
    story  = [Paragraph("Weather Records", styles["Title"]), Spacer(1, 12)]

    dicts = _to_dicts(records)
    if dicts:
        headers = list(dicts[0].keys())
        rows    = [[h.replace("_", " ").title() for h in headers]]
        rows   += [[str(r[h]) for h in headers] for r in dicts]

        col_w = 535 / len(headers)
        table = Table(rows, colWidths=[col_w] * len(headers), repeatRows=1)
        table.setStyle(TableStyle([
            ("BACKGROUND",    (0, 0), (-1, 0),  colors.HexColor("#0f1740")),
            ("TEXTCOLOR",     (0, 0), (-1, 0),  colors.white),
            ("FONTSIZE",      (0, 0), (-1, 0),  8),
            ("FONTSIZE",      (0, 1), (-1, -1), 7),
            ("ROWBACKGROUNDS",(0, 1), (-1, -1), [colors.white, colors.HexColor("#f5f5f5")]),
            ("GRID",          (0, 0), (-1, -1), 0.25, colors.grey),
            ("VALIGN",        (0, 0), (-1, -1), "MIDDLE"),
            ("TOPPADDING",    (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ]))
        story.append(table)
    else:
        story.append(Paragraph("Nenhum registro encontrado.", styles["Normal"]))

    doc.build(story)
    buf.seek(0)
    return StreamingResponse(
        buf,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=weather_records.pdf"},
    )


def export_records(records, fmt: str) -> StreamingResponse:
    handlers = {
        "json":     export_json,
        "csv":      export_csv,
        "xml":      export_xml,
        "markdown": export_markdown,
        "pdf":      export_pdf,
    }
    handler = handlers.get(fmt)
    if not handler:
        raise HTTPException(400, f"Formato não suportado: {fmt}. Use: json, csv, xml, markdown, pdf")
    return handler(records)
