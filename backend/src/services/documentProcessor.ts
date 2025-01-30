import fs from 'fs/promises';
import pdf from 'pdf-parse';

export async function processDocument(filePath: string): Promise<string> {
    try {
        const fileExtension = filePath.split('.').pop()?.toLowerCase();
        let text = '';

        if (fileExtension === 'pdf') {
            const dataBuffer = await fs.readFile(filePath);
            const pdfData = await pdf(dataBuffer);
            text = pdfData.text;
        } else if (fileExtension === 'doc' || fileExtension === 'docx') {
            // For now, we'll just read the file as text
            // In a production environment, you'd want to use a proper Word document parser
            const buffer = await fs.readFile(filePath);
            text = buffer.toString('utf-8');
        } else {
            throw new Error('Unsupported file type');
        }

        // Clean up the text
        text = text
            .replace(/\r\n/g, '\n') // Normalize line endings
            .replace(/\n{3,}/g, '\n\n') // Remove excessive newlines
            .trim();

        return text;
    } catch (error) {
        console.error('Error processing document:', error);
        throw error;
    } finally {
        // Clean up the uploaded file
        try {
            await fs.unlink(filePath);
        } catch (error) {
            console.error('Error deleting file:', error);
        }
    }
} 