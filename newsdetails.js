document.addEventListener('DOMContentLoaded', () => {
    const baseUrl = 'https://61924d4daeab5c0017105f1a.mockapi.io/skaet/v1';
    let currentEditingCommentId = null;
    let currentSlide = 0;

    const urlParams = new URLSearchParams(window.location.search);
    const newsId = urlParams.get('id');

    if (newsId) {
        fetchNewsDetail(newsId);
    }

    async function fetchNewsDetail(newsId) {
        try {
            const newsResponse = await fetch(`${baseUrl}/news/${newsId}`);
            const news = await newsResponse.json();
            displayNewsDetail(news);

            const commentsResponse = await fetch(`${baseUrl}/news/${newsId}/comments`);
            const comments = await commentsResponse.json();

            if (Array.isArray(comments)) {
                displayComments(comments);
            } else {
                displayNoComments();
            }

            const imageResponse = await fetch(`${baseUrl}/news/${newsId}/images`);
            const images = await imageResponse.json();
            loadImages(images.map(img => img.url));
        } catch (error) {
            console.error('Error fetching news details:', error);
        }
    }

    function displayNewsDetail(news) {
        const newsDetails = document.getElementById('news-details');
        if (newsDetails) {
            newsDetails.innerHTML = `
                <img src="${news.avatar}" alt="news image" onerror="this.src='https://via.placeholder.com/300?text=No+Image'">
                <h1>${news.title}</h1>
                <p>Author: ${news.author}</p>
                <p>URL: <a href="${news.url}" target="_blank">${news.url}</a></p>
            `;
        }
    }

    function changeSlide(direction) {
        const slides = document.querySelectorAll('.slides img');
        if (slides.length === 0) return;

        currentSlide += direction;

        if (currentSlide < 0) {
            currentSlide = slides.length - 1;
        } else if (currentSlide >= slides.length) {
            currentSlide = 0;
        }

        const slidesContainer = document.querySelector('.slides');
        slidesContainer.style.transform = `translateX(-${currentSlide * 100}%)`;
    }

    function loadImages(images) {
        const slidesContainer = document.querySelector('.slides');
        slidesContainer.innerHTML = '';

        // Add default image if no images are provided
        if (images.length === 0) {
            const defaultImage = document.createElement('img');
            defaultImage.src = 'https://dummyimage.com/300x240/cccccc/000000&text=No+Image';
            defaultImage.alt = 'Default News Image';
            slidesContainer.appendChild(defaultImage);
            console.log('No images available. Displaying default image.');
        } else {
            images.forEach(image => {
                const imgElement = document.createElement('img');
                imgElement.src = image;
                imgElement.alt = 'News Image';
                slidesContainer.appendChild(imgElement);
            });
        }

        currentSlide = 0;
        changeSlide(0);
    }


    function displayComments(comments) {
        const commentsSection = document.getElementById('comments-section');
        commentsSection.innerHTML = ''; // Clear previous comments

        comments.forEach(comment => {
            const commentDiv = document.createElement('div');
            commentDiv.className = 'comment';
            commentDiv.id = `comment-${comment.id}`;
            commentDiv.innerHTML = `
                <p><strong>${comment.name}:</strong> ${comment.comment}</p>
                <button class="edit-comment-btn">Edit</button>
                <button class="delete-comment-btn">Delete</button>
            `;
            commentsSection.appendChild(commentDiv);

            // Handle Delete
            const deleteButton = commentDiv.querySelector('.delete-comment-btn');
            deleteButton.addEventListener('click', () => deleteComment(comment.id));

            // Handle Edit
            const editButton = commentDiv.querySelector('.edit-comment-btn');
            editButton.addEventListener('click', () => startEditComment(comment));
        });
    }

    function displayNoComments() {
        const commentsSection = document.getElementById('comments-section');
        if (commentsSection) {
            commentsSection.innerHTML = '<p>No comments available for this news article.</p>';
        }
    }

    const commentForm = document.getElementById('comment-form');
    if (commentForm) {
        commentForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = document.getElementById('comment-name').value;
            const content = document.getElementById('comment-content').value;

            if (!name || !content) {
                alert('Please fill in all fields.');
                return;
            }

            try {
                if (currentEditingCommentId) {
                    // Send PUT request to update the comment
                    const response = await fetch(`${baseUrl}/news/${newsId}/comments/${currentEditingCommentId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            name,
                            comment: content,
                        }),
                    });

                    if (response.ok) {
                        alert('Comment updated successfully!');
                        const updatedComment = await response.json();
                        updateCommentInDOM(updatedComment); // Update comment in DOM without refetching
                        currentEditingCommentId = null; // Reset the editing ID
                        commentForm.reset(); // Clear the form
                    } else {
                        alert('Failed to update comment.');
                    }
                } else {
                    // Send POST request to add the comment
                    const response = await fetch(`${baseUrl}/news/${newsId}/comments`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            name,
                            comment: content,
                        }),
                    });

                    if (response.ok) {
                        alert('Comment added successfully!');
                        const newComment = await response.json();
                        addCommentToDOM(newComment); // Add the new comment directly to the DOM
                        commentForm.reset(); // Clear form
                    } else {
                        alert('Failed to add comment.');
                    }
                }
            } catch (error) {
                console.error('Error adding/updating comment:', error);
            }
        });
    }

    // Delete comment from DOM and API
    async function deleteComment(commentId) {
        try {
            const response = await fetch(`${baseUrl}/news/${newsId}/comments/${commentId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                document.getElementById(`comment-${commentId}`).remove();
            }
        } catch (error) {
            console.error('Error deleting comment:', error);
        }
    }

    // Populate the form with comment data for editing
    function startEditComment(comment) {
        document.getElementById('comment-name').value = comment.name;
        document.getElementById('comment-content').value = comment.comment;
        currentEditingCommentId = comment.id;
    }

    // Add a new comment directly to the DOM
    function addCommentToDOM(comment) {
        const commentsSection = document.getElementById('comments-section');

        const commentDiv = document.createElement('div');
        commentDiv.className = 'comment';
        commentDiv.id = `comment-${comment.id}`;
        commentDiv.innerHTML = `
            <p><strong>${comment.name}:</strong> ${comment.comment}</p>
            <button class="edit-comment-btn">Edit</button>
            <button class="delete-comment-btn">Delete</button>
        `;
        commentsSection.appendChild(commentDiv);

        // Attach event listeners for edit and delete buttons
        const deleteButton = commentDiv.querySelector('.delete-comment-btn');
        deleteButton.addEventListener('click', () => deleteComment(comment.id));

        const editButton = commentDiv.querySelector('.edit-comment-btn');
        editButton.addEventListener('click', () => startEditComment(comment));
    }

    // Update an edited comment in the DOM
    function updateCommentInDOM(comment) {
        const commentDiv = document.getElementById(`comment-${comment.id}`);
        if (commentDiv) {
            commentDiv.innerHTML = `
                <p><strong>${comment.name}:</strong> ${comment.comment}</p>
                <button class="edit-comment-btn">Edit</button>
                <button class="delete-comment-btn">Delete</button>
            `;

            // Re-attach event listeners for the buttons
            const deleteButton = commentDiv.querySelector('.delete-comment-btn');
            deleteButton.addEventListener('click', () => deleteComment(comment.id));

            const editButton = commentDiv.querySelector('.edit-comment-btn');
            editButton.addEventListener('click', () => startEditComment(comment));
        }
    }
});
