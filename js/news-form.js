document.addEventListener('DOMContentLoaded', () => {
    const baseUrl = 'https://61924d4daeab5c0017105f1a.mockapi.io/skaet/v1';
    let editMode = false;
    let editingNewsId = null;


    // Handle form submission for adding/updating news
    const newsForm = document.getElementById('news-form');

    if (newsForm) {
        newsForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Prevent the default form submission behavior
            
            const title = document.getElementById('news-title').value;
            const author = document.getElementById('news-author').value;
            const url = document.getElementById('news-url').value;
            const imageFile = document.getElementById('news-image').files[0]; // Get the uploaded image file
            
            const newsData = { title, author, url };

            if (!editMode) {
                // Add new news item
                addNewsItem(newsData, imageFile);
            } else {
                // Update existing news item
                updateNewsItem(editingNewsId, newsData, imageFile);
            }
        });
    }

    // Add a news item
    async function addNewsItem(newsData, imageFile) {
        try {
            const response = await fetch(`${baseUrl}/news`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newsData),
            });

            if (response.ok) {
                const addedNews = await response.json();
                alert('News item added successfully!');
                if (imageFile) {
                    await uploadImage(addedNews.id, imageFile);
                }
                saveNewsToLocalStorage(addedNews); // Save news to localStorage
                displayAddedNews(addedNews);
                newsForm.reset();
            } else {
                alert('Failed to add news item.');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    async function addNewsItem(newsData, imageFile) {
        try {
            const response = await fetch(`${baseUrl}/news`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newsData),
            }); 

            if (response.ok) {
                const addedNews = await response.json();
                alert('News item added successfully!');
                if (imageFile) {
                    await uploadImage(addedNews.id, imageFile);
                }
                saveNewsToLocalStorage(addedNews); // Save news to localStorage
                displayAddedNews(addedNews);
                newsForm.reset();
            } else {
                alert('Failed to add news item.');
            }
        } catch (error) {
            console.error('Error:', error);
        } 
    } 

    // Update existing news item and update DOM
    async function updateNewsItem(newsId, updatedNewsData, imageFile) {
        try {
            const response = await fetch(`${baseUrl}/news/${newsId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedNewsData),
            });

            if (response.ok) {
                const updatedNews = await response.json();
                alert('News updated successfully!');
                if (imageFile) {
                    await uploadImage(updatedNews.id, imageFile);
                }
                updateNewsInDOM(updatedNews);
                updateNewsInLocalStorage(updatedNews); // Update localStorage
                newsForm.reset();
                editMode = false;
                editingNewsId = null;
            } else {
                alert('Failed to update news.');
            }
        } catch (error) {
            console.error('Error updating news:', error);
        }
    }

    // Upload image for the news item
    async function uploadImage(newsId, imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);

        try {
            const response = await fetch(`${baseUrl}/news/${newsId}/images`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                alert('Failed to upload image.');
            }
        } catch (error) {
            console.error('Error uploading image:', error);
        }
    }

    // Function to display the added news item
    function displayAddedNews(news) {
        const newsContainer = document.getElementById('news-detail-container');
        
        const newsDiv = document.createElement('div');
        newsDiv.className = 'news-item';
        newsDiv.setAttribute('data-id', news.id);

        newsDiv.innerHTML = `
            <img src="${news.avatar || 'https://via.placeholder.com/150?text=No+Image'}" alt="news image" onerror="this.src='https://via.placeholder.com/250?text=No+Image'">
            <h3>${news.title}</h3>
            <p>By ${news.author}</p>
            <a href="${news.url}" target="_blank">Read more</a>
            <button class="edit-btn">Edit</button>
            <button class="delete-btn">Delete</button>
        `;

        newsContainer.appendChild(newsDiv);

        // Add Edit and Delete functionality
        newsDiv.querySelector('.edit-btn').addEventListener('click', () => handleEdit(news));
        newsDiv.querySelector('.delete-btn').addEventListener('click', () => deleteNewsById(news.id, newsDiv));
    }


    // Update the news item in the DOM after editing
    function updateNewsInDOM(updatedNews) {
        const newsDiv = document.querySelector(`.news-item[data-id="${updatedNews.id}"]`);
        if (newsDiv) {
            newsDiv.innerHTML = `
                <img src="${updatedNews.avatar || 'https://via.placeholder.com/150?text=No+Image'}" alt="news image" onerror="this.src='https://via.placeholder.com/250?text=No+Image'}">
                <h3>${updatedNews.title}</h3>
                <p>By ${updatedNews.author}</p>
                <a href="${updatedNews.url}" target="_blank">Read more</a>
                <button class="edit-btn">Edit</button>
                <button class="delete-btn">Delete</button>
            `;
            newsDiv.querySelector('.edit-btn').addEventListener('click', () => handleEdit(updatedNews));
            newsDiv.querySelector('.delete-btn').addEventListener('click', () => deleteNewsById(updatedNews.id, newsDiv));
        }
    }

    // Function to handle editing a news item
    function handleEdit(news) {
        document.getElementById('news-title').value = news.title;
        document.getElementById('news-author').value = news.author;
        document.getElementById('news-url').value = news.url;

        editMode = true;
        editingNewsId = news.id;
    }

    // Function to delete a news item
    function deleteNewsById(newsId, newsDiv) {
        fetch(`${baseUrl}/news/${newsId}`, {
            method: 'DELETE',
        })
        .then(response => {
            if (!response.ok) throw new Error('Error deleting news.');
            return response.json();
        })
        .then(() => {
            alert('News deleted successfully!');
            newsDiv.remove(); // Remove the news item from the DOM
            removeNewsFromLocalStorage(newsId); // Remove from localStorage
        })
        .catch(error => console.error('Error deleting news:', error));
    }

    // Save added news to localStorage
    function saveNewsToLocalStorage(news) {
        let newsArray = JSON.parse(localStorage.getItem('newsItems')) || [];
        newsArray.push(news);
        localStorage.setItem('newsItems', JSON.stringify(newsArray));
    }

    // Update news in localStorage after editing
    function updateNewsInLocalStorage(updatedNews) {
        let newsArray = JSON.parse(localStorage.getItem('newsItems')) || [];
        const index = newsArray.findIndex(item => item.id === updatedNews.id);
        if (index !== -1) {
            newsArray[index] = updatedNews;
            localStorage.setItem('newsItems', JSON.stringify(newsArray));
        }
    }

    // Remove news from localStorage
    function removeNewsFromLocalStorage(newsId) {
        let newsArray = JSON.parse(localStorage.getItem('newsItems')) || [];
        newsArray = newsArray.filter(item => item.id !== newsId);
        localStorage.setItem('newsItems', JSON.stringify(newsArray));
    }

    // Load news from localStorage on page load
    function loadNewsFromLocalStorage() {
        const newsArray = JSON.parse(localStorage.getItem('newsItems')) || [];
        newsArray.forEach(news => displayAddedNews(news));
    }

    // Load news items from localStorage on page load
    loadNewsFromLocalStorage();
});