document.addEventListener('DOMContentLoaded', async () => {
    const baseUrl = 'https://61924d4daeab5c0017105f1a.mockapi.io/skaet/v1';
    let currentPage = 1;
    const limit = 12;
    let allNews = []; // Store all news for search
    const blogContainer = document.getElementById('blog-container');
    const searchInput = document.querySelector('.searchInputClass'); // Fix: use querySelector for class

    // Fetch paginated news (12 per page)
    async function fetchNews(page = 1) {
        const response = await fetch(`${baseUrl}/news?page=${page}&limit=${limit}`);
        const news = await response.json();
        displayNews(news); // Display default paginated news
    }

    // Fetch all news items (for search functionality) - only once
    async function fetchAllNews() {
        let page = 1;
        let fetchedAllNews = false;
        allNews = []; // Clear previous news array

        while (!fetchedAllNews) {
            const response = await fetch(`${baseUrl}/news?page=${page}&limit=${limit}`);
            const news = await response.json();

            if (news.length === 0) {
                fetchedAllNews = true; // Stop fetching when there are no more news
            } else {
                allNews = allNews.concat(news); // Append fetched news to allNews array
                page++;
            }
        }
    }

    // Display news on the page (with optional query filtering)
    function displayNews(news, query = '') {
        blogContainer.innerHTML = ''; // Clear previous news

        // Filter news based on the search query (if provided)
        const filteredNews = news.filter(article => 
            article.title.toLowerCase().includes(query.toLowerCase()) ||
            article.author.toLowerCase().includes(query.toLowerCase())
        );

        if (filteredNews.length === 0) {
            blogContainer.innerHTML = '<p>No news items found.</p>';
            return;
        }

        filteredNews.forEach(article => {
            const blogCard = document.createElement('div');
            blogCard.className = 'blog-card';
            blogCard.innerHTML = `
                <img src="${article.avatar}" alt="news image" onerror="this.src='https://via.placeholder.com/150?text=No+Image'">
                <h2>${article.title}</h2>
                <p>Author: ${article.author}</p>
            `;
            blogCard.addEventListener('click', () => {
                window.location.href = `news-detail.html?id=${article.id}`;
            });
            blogContainer.appendChild(blogCard);
        });
    }

    // Search functionality - Filter as the user types
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.trim();
        displayNews(allNews, query); // Filter through all fetched news immediately
    });

    // Pagination functionality (for default display of paginated news)
    const nextButton = document.getElementById('next');
    const prevButton = document.getElementById('prev');

    if (nextButton) {
        nextButton.addEventListener('click', () => {
            currentPage++;
            fetchNews(currentPage);
        });
    }

    if (prevButton) {
        prevButton.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                fetchNews(currentPage);
            }
        });
    }

    // Initial fetch for paginated news (12 items) and all news (for search)
    await fetchNews(currentPage);  // Fetch paginated news first
    await fetchAllNews();          // Fetch all news for search functionality
});
