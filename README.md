# Travfin - Smart Travel Expense Manager 🧳💸

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Project Description

### Problem Statement
Travelers often struggle with tracking shared expenses and finding cost-effective travel options. Manual expense splitting leads to errors and disputes, while planning budget-friendly trips requires significant research effort.

### Solution
Travfin combines:
- **Expense Tracking**: Splitwise-like expense management with auto-splitting
- **AI Travel Assistant**: Chatbot suggesting budget routes/accommodations
- **Financial Analytics**: Real-time spending insights during trips

### Key Features
- Multi-user expense splitting (equal/percentage/custom)
- Travel cost optimization chatbot
- Interactive trip dashboard
- Cross-platform synchronization

### Tech Stack
| Component       | Technologies                          |
|-----------------|---------------------------------------|
| **Frontend**    | React, Redux, Chatbot UI Kit          |
| **Backend**     | Node.js, Express, MongoDB             |
| **AI Service**  | Python NLP, TensorFlow (Dialogflow)   |
| **Testing**     | Jest, React Testing Library, Supertest|

## Installation Steps

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- Python 3.8+ (for chatbot NLP)

1. **Clone Repository**
   ```bash
   git clone https://github.com/yourusername/travfin.git
   cd travfin

2. **Backend**
cd .\travfin_backend\
npm install

3. **Frontend** 
cd .\travfin_frontend
npm install

4. **Setup Env**
PORT=Port number
URL=your_mongodb_connection_url
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET_KEY=your_jwt_refresh-secret_key
EMAIL_USER=your_emailid
EMAIL_PASSWORD=your_email_password
CLIENT_URL=your_frontend_url
GROQ_API_KEY=your_groq_api_key
FLASK_SECRET_KEY=your_flask_secret_key


5. **Start Development Servers**

# Terminal 1 - Backend
cd .\travfin_backend\
npm run dev  # Starts on port 3500

# Terminal 2 - Frontend 
cd .\travfin_frontend
npm start    # Starts on port 3000







