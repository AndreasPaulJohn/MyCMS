import { ClassicEditor as ClassicEditorBase } from '@ckeditor/ckeditor5-editor-classic';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Bold, Italic } from '@ckeditor/ckeditor5-basic-styles';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { Link } from '@ckeditor/ckeditor5-link';
import { List } from '@ckeditor/ckeditor5-list';
import { Image, ImageUpload } from '@ckeditor/ckeditor5-image';
import { CodeBlock } from '@ckeditor/ckeditor5-code-block';
import { HtmlEmbed } from '@ckeditor/ckeditor5-html-embed';

// Erstellen einer benutzerdefinierten Editor-Konfiguration
const ClassicEditor = ClassicEditorBase.create({
    plugins: [
        Essentials,
        Bold,
        Italic,
        Paragraph,
        Heading,
        Link,
        List,
        Image,
        ImageUpload,
        CodeBlock,
        HtmlEmbed
    ],
    toolbar: {
        items: [
            'heading',
            '|',
            'bold',
            'italic',
            'link',
            'bulletedList',
            'numberedList',
            '|',
            'indent',
            'outdent',
            '|',
            'imageUpload',
            'blockQuote',
            'insertTable',
            'mediaEmbed',
            'undo',
            'redo'
        ]
    },
    language: 'de'
});

const editorConfiguration = {
    // Die Toolbar-Konfiguration bleibt bestehen
    toolbar: {
        items: [
            'heading',
            '|',
            'bold',
            'italic',
            'link',
            'bulletedList',
            'numberedList',
            '|',
            'indent',
            'outdent',
            '|',
            'imageUpload',
            'blockQuote',
            'insertTable',
            'mediaEmbed',
            'undo',
            'redo'
        ]
    },
    language: 'de'
};

export { ClassicEditor, editorConfiguration };