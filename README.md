# TasteBuds - Cooking Social Media Recipe App

TasteBuds is a social media platform for food enthusiasts to share, discover, and interact with recipes. Users can post recipes, like and comment on posts, and search for recipes or users.

## Features
- **Dynamic Feed**: View posts from users you follow.
- **Recipe Upload**: Upload recipes with images, descriptions, and ingredients.
- **Search**: Search for recipes or users.
- **Authentication**: Secure login and signup.
- **Filters**: Sort recipes by cuisine type or dietary preferences.

## Technologies
- **Frontend**: React, Node.js
- **Backend**: Python (Django)
- **Database**: PostgreSQL or MongoDB
- **Version Control**: Git, GitHub

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- Python (v3.8 or higher)
- PostgreSQL or MongoDB

### Setting up the App
1. Clone the repository:
   ```bash
   git clone https://github.com/jamesjb21/CS35L-group-project.git
2. Create a virtual environment:
   ```bash
   python -m venv <environment_name>
   source <environment_name>/bin/activate *for linux/macos
   <environment_name>\Scripts\activate *for windows

   deactivate *deactivate environment
3. install backend packages
   ```bash
   cd backend
   pip install -U -r requirements.txt
4. install front packages 
   ```bash
   cd ..
   cd frontend
   npm install
5. Activate backend
   ```bash
   cd backend
   python manage.py makemigrations
   python manage.py migrate
   python manage.py runserver
6. Activate frontend
   ```bash
   cd frontend
   npm run dev
