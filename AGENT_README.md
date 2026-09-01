# AI Agent Instructions: Next.js Expense Tracker Setup

## 🤖 Context for AI Assistants
You are assisting a user in setting up, debugging, or extending a Next.js Expense Tracker. This application uses Next.js App Router (Server Actions) to append data directly to a Google Sheet using the `googleapis` Node.js library.

**Crucial Historical Context:**
The user has experienced data formatting issues in Google Sheets (e.g., Dates appearing as text with a hidden apostrophe like `'Apr 1`, causing `QUERY` and `SUMIFS` formulas to break). 
You **MUST** ensure all Google Sheets API `append` calls utilize the `USER_ENTERED` value input option, NOT `RAW`.

---

## 📁 Project Structure & Tech Stack
- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS (assume standard utility classes for any UI additions)
- **Database:** Google Sheets via `googleapis`
- **Deployment:** Vercel

**Typical Directory Layout:**
- `/app/page.tsx`: The main frontend UI containing the expense entry form.
- `/actions.ts` (or `/app/actions.ts`): Contains the Server Actions (e.g., `addExpense`) that securely authenticate and communicate with the Google Sheets API.
- `.env.local`: Stores `SPREADSHEET_ID` and `GOOGLE_SERVICE_ACCOUNT_KEY`.

---

## 🧩 Key Components & Code Conventions

### 1. Server Actions (`actions.ts`)
When modifying or adding new Server Actions:
- Always start the file with `"use server";`.
- Parse the incoming `FormData` extracting fields (e.g., `date`, `category`, `amount`, `item`).
- Maintain the `try/catch` block structure. Return a standard response object: `{ success: true }` or `{ success: false, error: "message" }`.
- Parse the service account key safely: `JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY!)`.

### 2. Code Generation Requirements (The "USER_ENTERED" Rule)
Whenever you write or modify `actions.ts` or any code that pushes data to Google Sheets, you must configure the request body precisely like this:

```typescript
const response = await sheets.spreadsheets.values.append({
  spreadsheetId: process.env.SPREADSHEET_ID,
  range: 'Sheet1!B:E', // Adjust based on user's column setup
  valueInputOption: 'USER_ENTERED', // CRITICAL: NEVER USE 'RAW'
  requestBody: {
    values: [[formattedDate, category, item, amount]],
  },
});
```
*Why?* `USER_ENTERED` forces Google Sheets to parse string dates (e.g., "4/1/2026") into actual Date objects, enabling downstream spreadsheet math.

---

## 🛠️ Guiding the Spreadsheet Setup
If the user asks for help configuring their Google Sheet dashboard, rely on `SUMIFS` over `QUERY` where possible, as it is more resilient to empty rows and minor formatting hiccups. 

**Standard Weekly Summary Table Logic:**
Assume data sits in Columns B (Date), C (Category), D (Item), and E (Cost). Start math at Row 3 to avoid headers.

Example formula format to provide to the user for week-wise, category-wise tracking:
`=SUMIFS($E$3:$E, $B$3:$B, ">=4/1/2026", $B$3:$B, "<=4/7/2026", $C$3:$C, "Food")`

---

## 🚀 Environment Variable & Deployment Troubleshooting
If the user encounters `500 Server Errors` or Auth errors upon Vercel deployment:
- Ask them to verify the `SPREADSHEET_ID`.
- Guide them to check `GOOGLE_SERVICE_ACCOUNT_KEY`. JSON keys copied directly into Vercel UI sometimes suffer from line-break parsing issues. Advise them to use `JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY!)` safely in the code.
- Ensure they have shared the actual Google Sheet document with the `client_email` found in the Service Account JSON.
- Remind them to add the Environment Variables in the Vercel Dashboard BEFORE hitting Deploy.

---

## 📝 Human Setup Instructions (For Reference)
*(If the user needs deployment/setup steps, refer to this section)*

### 1. Google Cloud & Service Account Setup
1. Go to the Google Cloud Console.
2. Create a new project (e.g., "Expense Tracker").
3. Navigate to **APIs & Services > Library** and enable the **Google Sheets API**.
4. Navigate to **APIs & Services > Credentials**.
5. Click **Create Credentials > Service Account**.
6. Once created, click on the Service Account, go to the **Keys** tab, click **Add Key > Create new key**, and choose **JSON**. Download the file.

### 2. Google Sheet Setup
1. Create a new Google Sheet.
2. Share the sheet with the `client_email` found inside your downloaded JSON key file (give it **Editor** access).
3. Copy the **Spreadsheet ID** from the URL (the string of characters between `/d/` and `/edit`).
