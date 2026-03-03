import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

export const maxDuration = 60 // Set max duration for Vercel

interface GeneratedContent {
  title: string
  summary: string
  sections: {
    heading: string
    content: string
    keyPoints: string[]
  }[]
}

// Sanitize text for PDF (remove special characters not supported by standard fonts)
function sanitizeForPdf(text: string): string {
  return text
    .replace(/→/g, '->')
    .replace(/←/g, '<-')
    .replace(/↑/g, '^')
    .replace(/↓/g, 'v')
    .replace(/✓/g, '[x]')
    .replace(/✗/g, '[ ]')
    .replace(/•/g, '-')
    .replace(/°/g, ' deg')
    .replace(/±/g, '+/-')
    .replace(/×/g, 'x')
    .replace(/÷/g, '/')
    .replace(/α/g, 'alpha')
    .replace(/β/g, 'beta')
    .replace(/γ/g, 'gamma')
    .replace(/δ/g, 'delta')
    .replace(/μ/g, 'mu')
    .replace(/[^\x00-\x7F]/g, '') // Remove any remaining non-ASCII characters
}

function sanitizeContent(content: GeneratedContent): GeneratedContent {
  return {
    title: sanitizeForPdf(content.title),
    summary: sanitizeForPdf(content.summary),
    sections: content.sections.map(section => ({
      heading: sanitizeForPdf(section.heading),
      content: sanitizeForPdf(section.content),
      keyPoints: section.keyPoints.map(point => sanitizeForPdf(point))
    }))
  }
}

async function generateTopicContent(topic: string): Promise<GeneratedContent> {
  const zai = await ZAI.create()
  
  const userPrompt = `Create a concise study guide for: "${topic}"

Return ONLY valid JSON (no markdown, no code blocks):
{
  "title": "Topic Title",
  "summary": "2-3 sentence overview",
  "sections": [
    {
      "heading": "Section Name",
      "content": "Brief explanation paragraph",
      "keyPoints": ["point 1", "point 2", "point 3"]
    }
  ]
}

Include 3-4 sections maximum. Focus on exam-relevant facts. Use only ASCII characters (no arrows, greek letters, or special symbols).`

  try {
    const completion = await zai.chat.completions.create({
      messages: [
        { 
          role: 'system', 
          content: 'You are a medical education expert. Return only valid JSON. No markdown, no explanations. Use only ASCII characters - replace arrows with ->, greek letters with names (alpha, beta), etc.' 
        },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 2000
    })

    const responseText = completion.choices[0]?.message?.content || ''
    console.log('AI Response length:', responseText.length)
    
    // Parse JSON - handle potential markdown code blocks
    let jsonStr = responseText
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      jsonStr = jsonMatch[0]
    }
    
    const parsed = JSON.parse(jsonStr)
    // Sanitize content for PDF
    return sanitizeContent(parsed)
  } catch (error) {
    console.error('Content generation error:', error)
    // Return a simple fallback
    return {
      title: topic,
      summary: `A comprehensive overview of ${topic} for medical students.`,
      sections: [
        {
          heading: 'Overview',
          content: `${topic} is an important topic in medical education. Understanding its key concepts is essential for exam preparation.`,
          keyPoints: ['Important for exams', 'Requires understanding of pathophysiology', 'Clinical correlations are key']
        }
      ]
    }
  }
}

async function generateTopicImage(topic: string): Promise<string | null> {
  try {
    const zai = await ZAI.create()
    
    const response = await zai.images.generations.create({
      prompt: `Medical diagram of ${topic}, educational illustration, clean professional style, anatomically accurate, white background, no text`,
      size: '1024x1024'
    })

    return response.data[0]?.base64 || null
  } catch (error) {
    console.error('Image generation error:', error)
    return null
  }
}

async function createPDF(content: GeneratedContent, imageBase64: string | null): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()
  
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  
  const pageWidth = 612
  const pageHeight = 792
  const margin = 50
  const contentWidth = pageWidth - 2 * margin
  
  let currentPage = pdfDoc.addPage([pageWidth, pageHeight])
  let yPosition = pageHeight - margin
  const lineHeight = 14
  const paragraphSpacing = 10
  
  const checkNewPage = (requiredSpace: number) => {
    if (yPosition - requiredSpace < margin) {
      currentPage = pdfDoc.addPage([pageWidth, pageHeight])
      yPosition = pageHeight - margin
      return true
    }
    return false
  }
  
  const wrapText = (text: string, fontSize: number, maxWidth: number, textFont: typeof font): string[] => {
    const words = text.split(' ')
    const lines: string[] = []
    let currentLine = ''
    
    words.forEach(word => {
      const testLine = currentLine ? `${currentLine} ${word}` : word
      const width = textFont.widthOfTextAtSize(testLine, fontSize)
      
      if (width > maxWidth && currentLine) {
        lines.push(currentLine)
        currentLine = word
      } else {
        currentLine = testLine
      }
    })
    
    if (currentLine) lines.push(currentLine)
    return lines
  }
  
  const drawText = (text: string, fontSize: number, textFont: typeof font, color = { r: 0, g: 0, b: 0 }) => {
    const lines = wrapText(text, fontSize, contentWidth, textFont)
    lines.forEach((line) => {
      checkNewPage(lineHeight)
      currentPage.drawText(line, {
        x: margin,
        y: yPosition,
        size: fontSize,
        font: textFont,
        color: rgb(color.r, color.g, color.b)
      })
      yPosition -= lineHeight
    })
  }
  
  // Header
  currentPage.drawRectangle({
    x: 0, y: pageHeight - 40, width: pageWidth, height: 40,
    color: rgb(0.2, 0.3, 0.5)
  })
  currentPage.drawText("Riyan's Dash - Medical Study Guide", {
    x: margin, y: pageHeight - 25, size: 12, font: boldFont, color: rgb(1, 1, 1)
  })
  
  yPosition = pageHeight - 70
  
  // Title
  drawText(content.title, 24, boldFont, { r: 0.2, g: 0.3, b: 0.5 })
  yPosition -= paragraphSpacing * 2
  
  // Summary box
  checkNewPage(80)
  const summaryLines = wrapText(content.summary, 10, contentWidth - 20, font)
  const summaryBoxHeight = 30 + (summaryLines.length * 12)
  
  currentPage.drawRectangle({
    x: margin, y: yPosition - summaryBoxHeight, width: contentWidth, height: summaryBoxHeight,
    color: rgb(0.95, 0.97, 1)
  })
  currentPage.drawText("Summary:", {
    x: margin + 10, y: yPosition - 15, size: 12, font: boldFont, color: rgb(0.2, 0.3, 0.5)
  })
  summaryLines.forEach((line, idx) => {
    currentPage.drawText(line, {
      x: margin + 10, y: yPosition - 30 - (idx * 12), size: 10, font: font, color: rgb(0.3, 0.3, 0.3)
    })
  })
  yPosition -= summaryBoxHeight + paragraphSpacing * 2
  
  // Image
  if (imageBase64) {
    try {
      const imageBytes = Buffer.from(imageBase64, 'base64')
      let image = null
      
      try { image = await pdfDoc.embedPng(imageBytes) } 
      catch { 
        try { image = await pdfDoc.embedJpg(imageBytes) } 
        catch { } 
      }
      
      if (image) {
        const imageWidth = 200
        const imageHeight = 200
        const imageX = (pageWidth - imageWidth) / 2
        
        checkNewPage(imageHeight + 30)
        currentPage.drawImage(image, {
          x: imageX, y: yPosition - imageHeight, width: imageWidth, height: imageHeight
        })
        currentPage.drawText(`Illustration: ${content.title}`, {
          x: imageX, y: yPosition - imageHeight - 15, size: 9, font: font, color: rgb(0.5, 0.5, 0.5)
        })
        yPosition -= imageHeight + 30
      }
    } catch (error) {
      console.error('Error embedding image:', error)
    }
  }
  
  // Sections
  for (const section of content.sections) {
    checkNewPage(100)
    
    currentPage.drawRectangle({
      x: margin, y: yPosition - 5, width: 4, height: 18, color: rgb(0.2, 0.3, 0.5)
    })
    drawText(section.heading, 14, boldFont, { r: 0.15, g: 0.25, b: 0.45 })
    yPosition -= paragraphSpacing
    
    drawText(section.content, 11, font)
    yPosition -= paragraphSpacing
    
    // Key points
    if (section.keyPoints?.length > 0) {
      checkNewPage(section.keyPoints.length * 20 + 30)
      currentPage.drawText("Key Points:", {
        x: margin + 10, y: yPosition, size: 10, font: boldFont, color: rgb(0.3, 0.4, 0.5)
      })
      yPosition -= lineHeight
      
      section.keyPoints.forEach(point => {
        checkNewPage(lineHeight + 5)
        currentPage.drawCircle({
          x: margin + 20, y: yPosition + 3, size: 3, color: rgb(0.2, 0.5, 0.3)
        })
        const pointLines = wrapText(point, 10, contentWidth - 40, font)
        pointLines.forEach((line, idx) => {
          currentPage.drawText(line, {
            x: margin + 30, y: yPosition - (idx * lineHeight), size: 10, font: font, color: rgb(0.3, 0.3, 0.3)
          })
        })
        yPosition -= pointLines.length * lineHeight + 3
      })
    }
    yPosition -= paragraphSpacing * 2
  }
  
  // Footer
  const pages = pdfDoc.getPages()
  pages.forEach((page, index) => {
    page.drawText(`Page ${index + 1} of ${pages.length}`, {
      x: pageWidth - 100, y: 30, size: 9, font: font, color: rgb(0.5, 0.5, 0.5)
    })
    page.drawText("Generated by Riyan's Dash", {
      x: margin, y: 30, size: 8, font: font, color: rgb(0.6, 0.6, 0.6)
    })
  })
  
  return await pdfDoc.save()
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { topic, skipImage } = body
    
    if (!topic || typeof topic !== 'string') {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 })
    }
    
    console.log('Generating content for:', topic)
    
    // Generate content
    const content = await generateTopicContent(topic)
    console.log('Content generated:', content.title)
    
    // Generate image (can be skipped for faster testing)
    let imageBase64: string | null = null
    if (skipImage !== true) {
      imageBase64 = await generateTopicImage(topic)
      console.log('Image generated:', !!imageBase64)
    }
    
    // Create PDF
    const pdfBytes = await createPDF(content, imageBase64)
    console.log('PDF created, size:', pdfBytes.length)
    
    const pdfBase64 = Buffer.from(pdfBytes).toString('base64')
    
    return NextResponse.json({
      success: true,
      pdf: pdfBase64,
      filename: `${topic.replace(/[^a-zA-Z0-9]/g, '_')}_study_guide.pdf`,
      content: {
        title: content.title,
        summary: content.summary,
        sectionsCount: content.sections.length,
        hasImage: !!imageBase64
      }
    })
    
  } catch (error) {
    console.error('PDF generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
