import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

interface GeneratedContent {
  title: string
  summary: string
  sections: {
    heading: string
    content: string
    keyPoints: string[]
  }[]
}

async function generateTopicContent(topic: string): Promise<GeneratedContent> {
  const zai = await ZAI.create()
  
  const systemPrompt = `You are a medical education expert specializing in creating comprehensive, accurate study materials for MBBS students. Your task is to research and provide detailed, factual information about medical topics.

Guidelines:
1. Provide accurate, evidence-based medical information
2. Structure content for easy understanding and exam preparation
3. Include clinical correlations and practical applications
4. Use clear, concise language appropriate for medical students
5. Include key definitions, pathophysiology, clinical features, and treatment approaches
6. Avoid speculation or unverified information`

  const userPrompt = `Create a comprehensive study guide for the topic: "${topic}"

Please provide a structured response with:
1. A clear title
2. A brief summary (2-3 sentences)
3. 4-6 detailed sections with headings, content, and key points
4. Focus on exam-relevant information

Format your response as JSON:
{
  "title": "...",
  "summary": "...",
  "sections": [
    {
      "heading": "...",
      "content": "detailed paragraph explaining the concept...",
      "keyPoints": ["point 1", "point 2", "point 3"]
    }
  ]
}

Ensure all information is medically accurate and relevant for MBBS exam preparation.`

  const completion = await zai.chat.completions.create({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.3,
    max_tokens: 3000
  })

  const responseText = completion.choices[0]?.message?.content || ''
  
  try {
    let jsonStr = responseText
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      jsonStr = jsonMatch[0]
    }
    return JSON.parse(jsonStr)
  } catch {
    return {
      title: topic,
      summary: 'A comprehensive overview of ' + topic,
      sections: [
        {
          heading: 'Overview',
          content: responseText.substring(0, 500),
          keyPoints: ['Key concepts covered in the study material']
        }
      ]
    }
  }
}

async function generateTopicImage(topic: string): Promise<string | null> {
  try {
    const zai = await ZAI.create()
    
    const imagePrompt = `Medical educational illustration of ${topic}, clean professional style, anatomically accurate, suitable for medical textbook, white background, educational diagram style, no text labels`
    
    const response = await zai.images.generations.create({
      prompt: imagePrompt,
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
    
    if (currentLine) {
      lines.push(currentLine)
    }
    
    return lines
  }
  
  const drawText = (text: string, fontSize: number, fontType: typeof font, color: { r: number; g: number; b: number } = { r: 0, g: 0, b: 0 }) => {
    const lines = wrapText(text, fontSize, contentWidth, fontType)
    lines.forEach((line) => {
      checkNewPage(lineHeight)
      currentPage.drawText(line, {
        x: margin,
        y: yPosition,
        size: fontSize,
        font: fontType,
        color: rgb(color.r, color.g, color.b)
      })
      yPosition -= lineHeight
    })
  }
  
  // Header with branding
  currentPage.drawRectangle({
    x: 0,
    y: pageHeight - 40,
    width: pageWidth,
    height: 40,
    color: rgb(0.2, 0.3, 0.5)
  })
  
  currentPage.drawText("Riyan's Dash - Medical Study Guide", {
    x: margin,
    y: pageHeight - 25,
    size: 12,
    font: boldFont,
    color: rgb(1, 1, 1)
  })
  
  yPosition = pageHeight - 70
  
  // Title
  drawText(content.title, 24, boldFont, { r: 0.2, g: 0.3, b: 0.5 })
  yPosition -= paragraphSpacing * 2
  
  // Decorative line
  currentPage.drawLine({
    start: { x: margin, y: yPosition },
    end: { x: pageWidth - margin, y: yPosition },
    thickness: 2,
    color: rgb(0.2, 0.3, 0.5)
  })
  yPosition -= paragraphSpacing * 2
  
  // Summary box
  checkNewPage(80)
  const summaryLines = wrapText(content.summary, 10, contentWidth - 20, font)
  const summaryBoxHeight = 30 + (summaryLines.length * 12)
  
  currentPage.drawRectangle({
    x: margin,
    y: yPosition - summaryBoxHeight,
    width: contentWidth,
    height: summaryBoxHeight,
    color: rgb(0.95, 0.97, 1)
  })
  
  currentPage.drawText("Summary:", {
    x: margin + 10,
    y: yPosition - 15,
    size: 12,
    font: boldFont,
    color: rgb(0.2, 0.3, 0.5)
  })
  
  summaryLines.forEach((line, idx) => {
    currentPage.drawText(line, {
      x: margin + 10,
      y: yPosition - 30 - (idx * 12),
      size: 10,
      font: font,
      color: rgb(0.3, 0.3, 0.3)
    })
  })
  
  yPosition -= summaryBoxHeight + paragraphSpacing * 2
  
  // Add image if available
  if (imageBase64) {
    try {
      const imageBytes = Buffer.from(imageBase64, 'base64')
      let image = null
      
      try {
        image = await pdfDoc.embedPng(imageBytes)
      } catch {
        try {
          image = await pdfDoc.embedJpg(imageBytes)
        } catch {
          console.log('Could not embed image')
        }
      }
      
      if (image) {
        const imageWidth = 250
        const imageHeight = 250
        const imageX = (pageWidth - imageWidth) / 2
        
        checkNewPage(imageHeight + 30)
        
        currentPage.drawRectangle({
          x: imageX - 5,
          y: yPosition - imageHeight - 5,
          width: imageWidth + 10,
          height: imageHeight + 10,
          color: rgb(0.9, 0.9, 0.9)
        })
        
        currentPage.drawImage(image, {
          x: imageX,
          y: yPosition - imageHeight,
          width: imageWidth,
          height: imageHeight
        })
        
        currentPage.drawText(`Illustration: ${content.title}`, {
          x: imageX,
          y: yPosition - imageHeight - 20,
          size: 9,
          font: font,
          color: rgb(0.5, 0.5, 0.5)
        })
        
        yPosition -= imageHeight + 40
      }
    } catch (error) {
      console.error('Error embedding image:', error)
    }
  }
  
  // Sections
  for (const section of content.sections) {
    checkNewPage(100)
    
    currentPage.drawRectangle({
      x: margin,
      y: yPosition - 5,
      width: 4,
      height: 18,
      color: rgb(0.2, 0.3, 0.5)
    })
    
    drawText(section.heading, 14, boldFont, { r: 0.15, g: 0.25, b: 0.45 })
    yPosition -= paragraphSpacing
    
    drawText(section.content, 11, font)
    yPosition -= paragraphSpacing
    
    if (section.keyPoints && section.keyPoints.length > 0) {
      checkNewPage(section.keyPoints.length * 20 + 30)
      
      currentPage.drawText("Key Points:", {
        x: margin + 10,
        y: yPosition,
        size: 10,
        font: boldFont,
        color: rgb(0.3, 0.4, 0.5)
      })
      yPosition -= lineHeight
      
      section.keyPoints.forEach(point => {
        checkNewPage(lineHeight + 5)
        
        currentPage.drawCircle({
          x: margin + 20,
          y: yPosition + 3,
          size: 3,
          color: rgb(0.2, 0.5, 0.3)
        })
        
        const pointLines = wrapText(point, 10, contentWidth - 40, font)
        pointLines.forEach((line, idx) => {
          currentPage.drawText(line, {
            x: margin + 30,
            y: yPosition - (idx * lineHeight),
            size: 10,
            font: font,
            color: rgb(0.3, 0.3, 0.3)
          })
        })
        yPosition -= pointLines.length * lineHeight + 3
      })
      
      yPosition -= paragraphSpacing
    }
    
    yPosition -= paragraphSpacing
  }
  
  // Footer
  const pages = pdfDoc.getPages()
  pages.forEach((page, index) => {
    page.drawText(`Page ${index + 1} of ${pages.length}`, {
      x: pageWidth - 100,
      y: 30,
      size: 9,
      font: font,
      color: rgb(0.5, 0.5, 0.5)
    })
    
    page.drawText("Generated by Riyan's Dash - Medical Exam Prep", {
      x: margin,
      y: 30,
      size: 8,
      font: font,
      color: rgb(0.6, 0.6, 0.6)
    })
  })
  
  return await pdfDoc.save()
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { topic } = body
    
    if (!topic || typeof topic !== 'string') {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      )
    }
    
    console.log('Generating content for topic:', topic)
    
    const content = await generateTopicContent(topic)
    console.log('Content generated successfully')
    
    const imageBase64 = await generateTopicImage(topic)
    console.log('Image generation completed')
    
    const pdfBytes = await createPDF(content, imageBase64)
    console.log('PDF created successfully')
    
    const pdfBase64 = Buffer.from(pdfBytes).toString('base64')
    
    return NextResponse.json({
      success: true,
      pdf: pdfBase64,
      filename: `${topic.replace(/[^a-zA-Z0-9]/g, '_')}_study_guide.pdf`,
      content: {
        title: content.title,
        summary: content.summary,
        sectionsCount: content.sections.length
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
