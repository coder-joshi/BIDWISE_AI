from pypdf import PdfReader

def analyze_pdf_metadata(file_path: str):
    """
    Extracts hidden metadata from a PDF to check for tampering.
    Returns a tuple: (status, explanation)
    """
    try:
        reader = PdfReader(file_path)
        meta = reader.metadata
        
        if not meta:
            return "warning", "No metadata found. Document might be scrubbed or generated poorly."

        creation_date = meta.get('/CreationDate', 'Unknown')
        mod_date = meta.get('/ModDate', 'Unknown')

        # Basic heuristic: If it was modified after creation, flag it.
        if creation_date != 'Unknown' and mod_date != 'Unknown' and creation_date != mod_date:
            return "warning", f"Metadata anomaly: Document modified after creation. (Created: {creation_date}, Modified: {mod_date})"
            
        return "valid", "Metadata consistent. No suspicious modification dates detected."
        
    except Exception as e:
        return "invalid", f"Failed to read PDF structure: {str(e)}"