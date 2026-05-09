export async function extractText(buffer, mimeType, filename) {
  const ext = filename?.split('.').pop()?.toLowerCase()

  if (mimeType === 'text/plain' || ext === 'txt') {
    return { text: buffer.toString('utf-8'), imageBase64: null, mimeType: null }
  }

  if (mimeType === 'application/pdf' || ext === 'pdf') {
  return { 
    text: "Hãy phân tích toàn bộ file PDF này bao gồm cả văn bản, hình ảnh và sơ đồ.", 
    imageBase64: buffer.toString('base64'), 
    mimeType: 'application/pdf' 
  }
}

  if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || ext === 'docx') {
    const mammoth = await import('mammoth')
    const result = await mammoth.extractRawText({ buffer })
    return { text: result.value, imageBase64: null, mimeType: null }
  }

  if (['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(mimeType) ||
      ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) {
    return {
      text: 'Phân tích nội dung từ hình ảnh tài liệu được cung cấp.',
      imageBase64: buffer.toString('base64'),
      mimeType
    }
  }

  if (ext === 'pptx' || mimeType?.includes('presentationml')) {
    return { text: '[Tài liệu PowerPoint - Gemini sẽ phân tích cấu trúc và nội dung chính]', imageBase64: null, mimeType: null }
  }

  return { text: buffer.toString('utf-8'), imageBase64: null, mimeType: null }
}
