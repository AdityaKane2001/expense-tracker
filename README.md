# Next.js Expense Tracker (Google Sheets Backend)

A lightweight, robust expense tracking application built with Next.js that uses a Google Spreadsheet as its database. This allows for real-time tracking, custom Google Sheets formulas, and easy data management.

## Features
- Fast and responsive UI built with Next.js and React.
- Server Actions for secure API calls to Google Sheets.
- Real-time data syncing to your spreadsheet.
- Week-wise expense summarization via Sheets formulas.

---

## 🛠️ Setup Instructions

### 1. Google Cloud & Service Account Setup
To allow this app to talk to your Google Sheet, you need a Service Account.
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (e.g., "Expense Tracker").
3. Navigate to **APIs & Services > Library** and enable the **Google Sheets API**.
4. Navigate to **APIs & Services > Credentials**.
5. Click **Create Credentials > Service Account**. Name it and skip the optional permissions.
6. Once created, click on the Service Account, go to the **Keys** tab, click **Add Key > Create new key**, and choose **JSON**. 
7. Download the file. You will need this for your environment variables.

### 2. Google Sheet Setup
1. Create a new Google Sheet.
2. Share the sheet with the `client_email` found inside your downloaded JSON key file (give it **Editor** access).
3. Set up your headers. Based on standard configuration, leave Column A blank, and set up your headers in Row 1 starting at Column B:
   - **B1**: `Date`
   - **C1**: `Category`
   - **D1**: `Item`
   - **E1**: `Cost`
4. Copy the **Spreadsheet ID** from the URL. It is the long string of characters between `/d/` and `/edit`.

### 3. Environment Variables
Create a `.env.local` file in the root of your project and add the following:

```env
# The exact ID from your Google Sheet URL
SPREADSHEET_ID="your-spreadsheet-id-here"

# The entire contents of your downloaded JSON key, compressed into a single line, or stringified.
# Make sure to maintain the formatting if using Vercel.
GOOGLE_SERVICE_ACCOUNT_KEY='{ "type": "service_account", "project_id": "...", ... }'
```

### 4. Running Locally
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:3000` and test adding an expense!

---

## 🚀 Vercel Deployment

1. Push your code to a GitHub repository.
2. Go to [Vercel](https://vercel.com/) and create a new project, importing your GitHub repo.
3. During the setup phase, expand the **Environment Variables** section.
4. Add `SPREADSHEET_ID`.
5. Add `GOOGLE_SERVICE_ACCOUNT_KEY`. 
   - *Note:* Vercel handles JSON strings differently sometimes. Ensure you paste the exact, unformatted JSON string, or ensure it's properly escaped if you run into deployment auth errors.
6. Click **Deploy**.
