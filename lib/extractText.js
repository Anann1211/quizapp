function cleanText(raw) {
  if (!raw) return ''
  return raw
    // Xóa ký tự null và control characters (trừ newline, tab)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ' ')
    // Chuẩn hóa unicode dấu đặc biệt toán học → ASCII gần nhất
    .replace(/[\u2212]/g, '-')   // minus sign
    .replace(/[\u00D7]/g, 'x')   // multiplication
    .replace(/[\u00F7]/g, '/')   // division
    .replace(/[\u2264]/g, '<=')
    .replace(/[\u2265]/g, '>=')
    .replace(/[\u2260]/g, '!=')
    .replace(/[\u221E]/g, 'infinity')
    .replace(/[\u03B1-\u03C9]/g, m => m) // giữ nguyên ký tự Hy Lạp
    // Xóa ký tự không in được ngoài ASCII và Unicode cơ bản
    .replace(/[^\x09\x0A\x0D\x20-\x7E\u00A0-\uFFFF]/g, ' ')
    // Chuẩn hóa khoảng trắng thừa
    .replace(/[ \t]{3,}/g, '  ')
    // Chuẩn hóa dòng trống liên tiếp
    .replace(/\n{4,}/g, '\n\n\n')
    .trim()
}

export async function extractText(buffer, mimeType, filename) {
  const ext = filename?.split('.').pop()?.toLowerCase()

  if (mimeType === 'text/plain' || ext === 'txt') {
    return { text: cleanText(buffer.toString('utf-8')), imageBase64: null, mimeType: null }
  }

  if (mimeType === 'application/pdf' || ext === 'pdf') {
    try {
      const pdfParse = (await import('pdf-parse')).default
      const data = await pdfParse(buffer)
      return { text: cleanText(data.text), imageBase64: null, mimeType: null }
    } catch (e) {
      // Nếu pdf-parse thất bại (PDF scan/ảnh), fallback sang Vision
      return {
        text: 'Phân tích toàn bộ nội dung từ tài liệu PDF được cung cấp.',
        imageBase64: buffer.toString('base64'),
        mimeType: 'application/pdf'
      }
    }
  }

  if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || ext === 'docx') {
    const mammoth = await import('mammoth')
    const result = await mammoth.extractRawText({ buffer })
    return { text: cleanText(result.value), imageBase64: null, mimeType: null }
  }

  if (['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(mimeType) ||
      ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) {
    return {
      text: 'Phân tích toàn bộ nội dung từ hình ảnh tài liệu được cung cấp.',
      imageBase64: buffer.toString('base64'),
      mimeType
    }
  }

  if (ext === 'pptx' || mimeType?.includes('presentationml')) {
    return { text: '[Tài liệu PowerPoint]', imageBase64: null, mimeType: null }
  }

  return { text: cleanText(buffer.toString('utf-8')), imageBase64: null, mimeType: null }
}
