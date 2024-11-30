document.addEventListener('DOMContentLoaded', () => {
    const textarea = document.querySelector('textarea[name="message"]');

    if (textarea) {
        textarea.addEventListener('input', (e) => {
            console.log('Typed:', e.target.value);
        });
    }
    
    console.log(textarea)
});