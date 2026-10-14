Commonplace.

Learning by doing.

Commonplace is a small, frontend-only social space built around privacy, choice, and real conversations. It is a practice project made with plain HTML, CSS, and JavaScript: no backend, no database, and no APIs. Everything you see is handled in the browser with local storage.

Features
Community feed: write and share short posts (up to 500 characters) with a live character counter
Feed filter: switch between everyone's posts and only your own
Chronological order: posts are shown in time order, with no engagement ranking or recommendation model
Local profile: edit your display name and bio, and see your post count
Demo login and sign-up: create a profile that is saved only in your browser
Privacy room: a plain-language page explaining how data is handled, with a button to clear all local data
About page: the idea behind the project, the tech stack, and the developer
Responsive layout: sidebar navigation on desktop and a mobile header on smaller screens
Tracking-free: no analytics scripts, ad pixels, external fonts, or third-party APIs

Pages
Page	File	Description
Home / Feed	index.html	Post composer and community feed
My profile	pages/profile.html	Profile card, bio editing, and your posts
Privacy room	pages/privacy.html	How data works, plus clear-data controls
About us	pages/about.html	Project concept, build notes, and developer info
Log in	pages/login.html	Demo login (password is not checked or stored)
Sign up	pages/signup.html	Create a local demo profile
Tech Stack
HTML for structure
CSS for the visual system
JavaScript for interactions
Local storage for demo state
Project Structure
commonplace/
├── index.html
├── pages/
│   ├── about.html
│   ├── login.html
│   ├── privacy.html
│   ├── profile.html
│   └── signup.html
├── src/
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── main.js
└── assets/
    └── img/
        └── mark.svg
Getting Started

No build step or installation is needed.

Clone the repository:
bash
   git clone https://github.com/<your-username>/<your-repo-name>.git
Open the project folder.
Open index.html in your browser, or use a local server such as the VS Code Live Server extension.
How Data Works

This project has no server, so all demo data (posts, profile details, and the saved session) lives in your browser's local storage. You can remove it at any time from the Privacy room using the Clear local data button, or by clearing your site data in the browser.

Important Note

This is a practice project, not a secure production service. Local storage is not encrypted and can be read by scripts running on the same origin. Please do not enter real passwords or sensitive information. A real privacy-first platform would also need security review, secure authentication, clear data policies, and careful hosting.

Author

Hannah Dennisse Aque Built with HTML, CSS, and JavaScript.

There's a million things I haven't done, but just you wait.
