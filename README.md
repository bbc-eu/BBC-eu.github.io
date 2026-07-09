# BBC EU NEWS

A premium, serverless news portal built with vanilla HTML5, CSS3, and JavaScript. 

## Project Architecture
Because this is built without a backend or a framework (perfect for GitHub Pages), articles are stored as static `.json` files. 

* `index.html` - Homepage view.
* `article.html` - Dynamic article view (renders content based on `?id=X` URL parameter).
* `style.css` - Custom styling with CSS variables for Light/Dark mode.
* `script.js` - Handles DOM manipulation, JSON fetching, theme toggling, and UI logic.
* `/posts/` - Directory containing your "database".

## How to Add a New Article

1.  **Create the Article File:** Create a new file in the `/posts/` folder named `your-article-id.json`. Use the exact schema found in `article1.json`. 
    * *HTML Content:* The `fullArticle` field accepts raw HTML (like `<p>`, `<h2>`, `<strong>`) so you can format your text exactly how you want.
    * *Media:* You can link external images, or place photos/MP4s in an `/images/` or `/videos/` folder and link them relatively (e.g., `"featuredImage": "../images/news-photo.jpg"`).
    * *YouTube:* Add the embed URL to `"youtubeEmbed"` (e.g., `https://www.youtube.com/embed/XXXXXX`).

2.  **Update the Index:** Open `/posts/posts.json`. This file acts as the directory so the homepage knows what to load. Add an object for your new article at the top of the array:
    ```json
    {
        "id": "your-article-id",
        "title": "Your Headline",
        "description": "Short excerpt for the homepage.",
        "category": "Politics",
        "author": "John Doe",
        "publishDate": "2024-05-22",
        "thumbnail": "path/to/image.jpg"
    }
    ```

## Adding Extra Static Pages
For pages like About, Contact, or Privacy Policy, duplicate `index.html`, remove the `<main>` content, and replace it with your static HTML (e.g., `<div class="container"><h1>About Us</h1>...</div>`). Ensure you save the file with the exact name referenced in the footer links (e.g., `about.html`).

## Hosting on GitHub Pages
1. Push all files to a GitHub repository.
2. Go to Repo Settings > Pages.
3. Select the `main` branch and hit Save.
4. Your dynamic news site will be live in minutes. No build steps required.
