const NAMESPACE = 'maxbanton.github.io';

/**
 * Increments a counter and optionally updates a DOM element with the new value.
 * @param {string} key - The counter key (e.g., 'homepage', 'resume_view')
 * @param {string|null} displayElementId - The ID of the element to display the count in (optional)
 */
function trackCount(key, displayElementId = null) {
    fetch(`https://counterapi.com/api/${NAMESPACE}/view/${key}`)
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            if (displayElementId) {
                const element = document.getElementById(displayElementId);
                if (element) {
                    element.innerText = data.value.toString().padStart(6, '0');
                }
            }
        })
        .catch(error => console.error('Error tracking count:', error));
}

/**
 * Fetches a counter value without incrementing it
 */
function getCount(key) {
    return fetch(`https://counterapi.com/api/${NAMESPACE}/view/${key}`)
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => data.value)
        .catch(error => {
            console.error('Error fetching count:', error);
            return 0;
        });
}

/**
 * Updates the download count display
 */
function updateDownloadCount(count) {
    const countElement = document.getElementById('pdf-download-count');
    if (countElement) {
        countElement.innerText = count;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;

    // Normalize path to detect current page
    const isHome = path === '/' || path.endsWith('index.html') || path.endsWith('.io/');
    const isResume = path.endsWith('resume.html');

    if (isHome) {
        trackCount('homepage', 'visitor-count');
    } else if (isResume) {
        // Track page view for resume (no display element)
        trackCount('resume_view');

        // Fetch and display current download count (without incrementing)
        getCount('resume_pdf_download').then(count => {
            updateDownloadCount(count);
        });

        // Track PDF download and update counter
        const pdfLink = document.querySelector('a[href$=".pdf"]');
        if (pdfLink) {
            pdfLink.addEventListener('click', () => {
                // Increment the counter
                fetch(`https://counterapi.com/api/${NAMESPACE}/view/resume_pdf_download`)
                    .then(response => response.json())
                    .then(data => {
                        // Update the displayed count
                        updateDownloadCount(data.value);
                    })
                    .catch(e => console.error('Error tracking download:', e));
            });
        }
    }
});
