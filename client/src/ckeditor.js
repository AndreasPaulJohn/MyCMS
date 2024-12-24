import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

const editorConfiguration = {
    toolbar: {
        items: [
            'heading',
            '|',
            'bold',
            'italic',
            '|',
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
            '|',
            'undo',
            'redo'
        ],
        shouldNotGroupWhenFull: true
    },
    language: 'de'
};

export { ClassicEditor, editorConfiguration };