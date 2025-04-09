document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const fileInput = document.getElementById('fileInput');
    const dropArea = document.getElementById('dropArea');
    const inputFormat = document.getElementById('inputFormat');
    const outputFormat = document.getElementById('outputFormat');
    const swapBtn = document.getElementById('swapBtn');
    const convertBtn = document.getElementById('convertBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const progressContainer = document.getElementById('progressContainer');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const fileInfo = document.getElementById('fileInfo');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');
    const outputOptions = document.getElementById('outputOptions');
    
    let selectedFile = null;
    let convertedFile = null;
    
    // Supported conversions
    const supportedConversions = {
        pdf: ['docx', 'pptx', 'txt', 'rtf'],
        docx: ['pdf', 'txt', 'rtf'],
        pptx: ['pdf', 'docx'],
        txt: ['pdf', 'docx', 'rtf'],
        rtf: ['pdf', 'docx', 'txt']
    };
    
    // File drag and drop
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });
    
    function highlight() {
        dropArea.classList.add('highlight');
    }
    
    function unhighlight() {
        dropArea.classList.remove('highlight');
    }
    
    dropArea.addEventListener('drop', handleDrop, false);
    fileInput.addEventListener('change', handleFiles);
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles({ target: { files } });
    }
    
    function handleFiles(e) {
        const files = e.target.files;
        if (files.length) {
            selectedFile = files[0];
            updateFileInfo(selectedFile);
            updateFormatOptions(selectedFile.name);
            convertBtn.disabled = false;
        }
    }
    
    function updateFileInfo(file) {
        fileInfo.classList.remove('hidden');
        fileName.textContent = file.name;
        fileSize.textContent = formatFileSize(file.size);
    }
    
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    function updateFormatOptions(filename) {
        if (inputFormat.value === 'auto') {
            const extension = filename.split('.').pop().toLowerCase();
            const formatMap = {
                'pdf': 'pdf',
                'docx': 'docx',
                'doc': 'docx',
                'pptx': 'pptx',
                'ppt': 'pptx',
                'txt': 'txt',
                'rtf': 'rtf'
            };
            
            if (formatMap[extension]) {
                // Temporarily disable the event listener to prevent infinite loop
                inputFormat.removeEventListener('change', handleInputFormatChange);
                inputFormat.value = formatMap[extension];
                inputFormat.addEventListener('change', handleInputFormatChange);
                updateOutputOptions();
            }
        }
    }
    
    function handleInputFormatChange() {
        updateOutputOptions();
    }
    
    inputFormat.addEventListener('change', handleInputFormatChange);
    
    function updateOutputOptions() {
        const inputType = inputFormat.value;
        
        // Clear existing options
        outputOptions.innerHTML = '';
        outputOptions.classList.add('hidden');
        
        if (inputType === 'auto' || !supportedConversions[inputType]) {
            return;
        }
        
        // Enable only supported output formats
        Array.from(outputFormat.options).forEach(option => {
            option.disabled = !supportedConversions[inputType].includes(option.value);
        });
        
        // Select first enabled option
        for (let i = 0; i < outputFormat.options.length; i++) {
            if (!outputFormat.options[i].disabled) {
                outputFormat.selectedIndex = i;
                break;
            }
        }
        
        // Add format-specific options
        if (outputFormat.value === 'pdf') {
            outputOptions.classList.remove('hidden');
            outputOptions.innerHTML = `
                <label>
                    <input type="checkbox" id="preserveLayout" checked>
                    Preserve original layout
                </label>
                <label>
                    <input type="checkbox" id="optimizePdf">
                    Optimize for web
                </label>
            `;
        } else if (outputFormat.value === 'docx') {
            outputOptions.classList.remove('hidden');
            outputOptions.innerHTML = `
                <label>
                    <input type="checkbox" id="preserveFormatting" checked>
                    Preserve formatting
                </label>
            `;
        }
    }
    
    outputFormat.addEventListener('change', updateOutputOptions);
    
    // Swap conversion direction
    swapBtn.addEventListener('click', function() {
        const temp = inputFormat.value;
        inputFormat.value = outputFormat.value;
        outputFormat.value = temp;
        updateOutputOptions();
    });
    
    // Convert file
    convertBtn.addEventListener('click', convertFile);
    
    function convertFile() {
        if (!selectedFile) return;
        
        // Simulate conversion process (in a real app, you'd use a conversion library/API)
        progressContainer.classList.remove('hidden');
        convertBtn.disabled = true;
        
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 10;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                conversionComplete();
            }
            updateProgress(progress);
        }, 300);
    }
    
    function updateProgress(percent) {
        progressBar.style.width = percent + '%';
        progressText.textContent = Math.round(percent) + '%';
    }
    
    function conversionComplete() {
        // In a real app, you'd have the actual converted file here
        // For demo purposes, we'll just simulate it
        const filename = selectedFile.name.split('.').slice(0, -1).join('.') + '.' + outputFormat.value;
        convertedFile = new File([selectedFile], filename, { type: 'application/octet-stream' });
        
        downloadBtn.classList.remove('hidden');
        downloadBtn.disabled = false;
    }
    
    // Download converted file
    downloadBtn.addEventListener('click', function() {
        if (!convertedFile) return;
        
        const url = URL.createObjectURL(convertedFile);
        const a = document.createElement('a');
        a.href = url;
        a.download = convertedFile.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
    
    // Initialize
    updateOutputOptions();
});