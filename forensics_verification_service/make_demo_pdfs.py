"""
Creates demo PDFs for the metadata endpoint in ./samples/ :
  astranet_clean.pdf       no anomalies  -> status "valid"
  shivalik_tampered.pdf    modified a year after creation, editing tool in Producer, and edited after
                           a (simulated) signature -> status "warning" with several findings
Run once:  python make_demo_pdfs.py
"""
import os
import tempfile

import pdf_fixtures as fx

os.makedirs("samples", exist_ok=True)
fx.make_pdf("samples/astranet_clean.pdf", producer="Microsoft Word", creator="Microsoft Word")

with tempfile.TemporaryDirectory() as tmp:
    base = fx.make_pdf(os.path.join(tmp, "base.pdf"), created="D:20230311100000+05'30'",
                       modified="D:20240915143000+05'30'", producer="Adobe Photoshop", creator="Microsoft Word")
    fx.make_signed_then_edited(base, "samples/shivalik_tampered.pdf", edit=True)
print("Created samples/astranet_clean.pdf and samples/shivalik_tampered.pdf")