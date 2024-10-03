# Crew Generator

Crew Generator is a powerful tool that helps you create your own crew without any programming knowledge. This project is divided into two main components:
- **Frontend** (React with Next.js)
- **Backend** (Python with FastAPI)

Both components work together to offer a seamless crew generation experience.

## Features

- No programming knowledge required
- Easy setup for both frontend and backend
- Uses Supabase for authentication and database
- Integrates with multiple APIs (OpenAI, Serper, CoinMarketCap)

## Prerequisites

Before running the project locally, ensure you have the following installed:
- Node.js (for frontend)
- Python 3.8+ (for backend)
- Supabase account and API keys
- API keys for OpenAI, Serper, and CoinMarketCap

## Getting Started

To run this project locally, follow these steps:

### 1. Clone the repository

```bash
git clone https://github.com/aibtcdev/crew-generator.git
```

### 2. Setup the Frontend

Navigate to the frontend-crew directory and install the dependencies:

```bash
cd frontend-crew
npm install
```

#### Environment Variables

You need to add environment variables in the frontend-crew directory. Create a `.env.local` file with the following:

```
NEXT_PUBLIC_SUPABASE_URL=https://helloworld.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

### 3. Setup the Backend

Navigate to the backend directory, create and activate a virtual environment, and install the required packages:

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

#### Environment Variables

In the backend directory, create a `.env` file and add the following environment variables:

```
OPENAI_API_KEY="sk-proj-I-your api key here"
SERPER_API_KEY="your-serper-api-key"
SUPABASE_URL=https://hellowowld.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
CMC_API_KEY='cmc-api-key'
```

### 4. Run the Backend Server

After setting up the backend, start the FastAPI server:

```bash
uvicorn main:app --reload
```

This will start the backend server on `http://127.0.0.1:8000`.

### 5. Run the Frontend

Once the backend is running, start the frontend development server:

```bash
npm run dev
```

This will start the frontend on `http://localhost:3000`.

## Usage

1. Open your browser and go to `http://localhost:3000`.
2. Use the UI to generate your crew without needing any programming knowledge.
3. Ensure both frontend and backend servers are running for full functionality.

## Contribution

We welcome contributions to improve this project. To contribute:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature`).
3. Commit your changes (`git commit -m 'Add new feature'`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Open a pull request.


Happy coding!
