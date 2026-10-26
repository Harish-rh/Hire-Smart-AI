import os
import io
import logging
import pypdf
import docx

logger = logging.getLogger(__name__)

ALLOWED_RESUME_EXTENSIONS = {'.pdf', '.docx'}
MAX_RESUME_FILE_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB limit

class ResumeExtractionError(Exception):
    """Custom exception raised when resume text extraction fails."""
    pass


def validate_resume_file(uploaded_file):
    """
    Validates uploaded file size and extension.
    Raises ResumeExtractionError if invalid.
    """
    if not uploaded_file:
        raise ResumeExtractionError("No file provided.")

    filename = uploaded_file.name
    ext = os.path.splitext(filename)[1].lower()

    if ext not in ALLOWED_RESUME_EXTENSIONS:
        raise ResumeExtractionError(
            f"Unsupported file format '{ext}'. Only PDF and DOCX files are supported."
        )

    if uploaded_file.size > MAX_RESUME_FILE_SIZE_BYTES:
        max_mb = MAX_RESUME_FILE_SIZE_BYTES / (1024 * 1024)
        raise ResumeExtractionError(
            f"File exceeds maximum allowed size of {max_mb:.0f} MB."
        )

    if uploaded_file.size == 0:
        raise ResumeExtractionError("The uploaded file is empty (0 bytes).")

    return ext


def extract_text_from_resume(uploaded_file):
    """
    Extracts selectable text from a PDF or DOCX file using pure Python libraries.
    Returns cleaned string of text.
    """
    ext = validate_resume_file(uploaded_file)
    extracted_text = ""

    try:
        # Seek to beginning in case file has been read
        uploaded_file.seek(0)
        file_bytes = io.BytesIO(uploaded_file.read())

        if ext == '.pdf':
            reader = pypdf.PdfReader(file_bytes)
            num_pages = len(reader.pages)
            if num_pages == 0:
                raise ResumeExtractionError("The PDF document contains no pages.")

            page_texts = []
            for i, page in enumerate(reader.pages):
                text = page.extract_text()
                if text:
                    page_texts.append(text.strip())

            extracted_text = "\n\n".join(page_texts).strip()

        elif ext == '.docx':
            doc = docx.Document(file_bytes)
            paragraphs = [p.text.strip() for p in doc.paragraphs if p.text.strip()]
            
            # Also extract text from tables if any
            for table in doc.tables:
                for row in table.rows:
                    row_text = " | ".join(cell.text.strip() for cell in row.cells if cell.text.strip())
                    if row_text:
                        paragraphs.append(row_text)

            extracted_text = "\n".join(paragraphs).strip()

        # Reset pointer after reading
        uploaded_file.seek(0)

        if not extracted_text:
            return "[No selectable text could be extracted. The document may contain scanned image pages without OCR.]"

        return extracted_text

    except (pypdf.errors.PdfReadError, Exception) as e:
        logger.error(f"Failed to extract text from resume '{uploaded_file.name}': {str(e)}")
        raise ResumeExtractionError(f"Document parsing error: {str(e)}")
