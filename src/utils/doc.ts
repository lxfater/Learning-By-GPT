import { Document, Header, Packer, Paragraph, Tab, TextRun } from "docx";
import { saveAs } from 'file-saver';


export const createStory = (title:string, story: string, close: string, translation: string, words:string[], question:string[]) => {
    const children = [];
    children.push();
    function createParagraph(text: string, title: string) {
        return [ new Paragraph({
            spacing: {
                after: 5,
                before: 10,
            },
            children: [
                new TextRun({
                    text: `${title}: `, 
                    bold: true,
                }),
            ],
    
        }),new Paragraph({
            spacing: {
                after: 10,
                before: 5,
            },
            children: [

                new TextRun(text),
            ],
        })]
    }
    function createParagraphs(texts: string[], title: string) {
        return  [ new Paragraph({
            spacing: {
                after: 5,
                before: 10,
            },
            children: [
                new TextRun({
                    text: `${title}: `, 
                    bold: true,
                }),
            ],
    
        }), ...texts.map((text) => {
            return new Paragraph({
                spacing: {
                    after: 10,
                    before: 5,
                },
                children: [

                    new TextRun(text),
                ],
            })
        })]
    }
    children.push(...createParagraph(story, 'Story'));
    if(close) {
        children.push(...createParagraph(close, 'Close'));
    }
    if(question.length > 0) {
        children.push(...createParagraphs(question,'Question'));
    }
    if(translation) {
        children.push(...createParagraph(translation,'Translation'));
    }
    if(words.length > 0) {
        children.push(...createParagraphs(words,'Words'));
    }
    const doc = new Document({
        sections: [ 
            {
                children,
            }  
        ],
    });
    
    return Packer.toBlob(doc).then((blob) => {
        saveAs(blob, `${title}.docx`);
    })
}