"""Builds small PDFs with known properties. Used by the tests and by make_demo_pdfs.py."""
import shutil

from pypdf import PdfWriter

SIG_TEMPLATE = "\n%/ByteRange [0 0000000010 {a:010d} {b:010d}]\n"


def make_pdf(path, created="D:20240101120000Z", modified="D:20240101120000Z", producer="Acme PDF", creator=None):
    w = PdfWriter()
    w.add_blank_page(300, 300)
    meta = {"/Producer": producer, "/CreationDate": created, "/ModDate": modified}
    if creator:
        meta["/Creator"] = creator
    w.add_metadata(meta)
    with open(path, "wb") as f:
        w.write(f)
    return path


def make_incremental(src, dst):
    """Copy of src with a second save appended (dates unchanged): what a quiet edit looks like."""
    shutil.copy(src, dst)
    w = PdfWriter(fileobj=dst, incremental=True)
    w.add_metadata({"/Title": "edited after the fact"})
    w.write(dst)
    return dst


def make_signed_then_edited(src, dst, edit=True):
    """
    Fakes the ByteRange of a signature that covers the whole file, then (optionally) appends more data.
    It is NOT a cryptographic signature: it only exercises the 'edited after signing' check.
    """
    base = open(src, "rb").read()
    total = len(base) + len(SIG_TEMPLATE.format(a=0, b=0))
    marker = SIG_TEMPLATE.format(a=total - 20, b=20).encode()
    data = base + marker + (b"%edited after signing\n" if edit else b"")
    with open(dst, "wb") as f:
        f.write(data)
    return dst