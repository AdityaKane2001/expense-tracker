"use server";

import { google } from "googleapis";

export async function addExpense(formData: FormData) {
  const date = formData.get("date") as string; // e.g., "2026-04-01"
  const category = formData.get("category") as string;
  const amount = formData.get("amount") as string;
  const item = formData.get("item") as string;

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY!),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    // Formatting the date to MM/DD/YYYY if it's coming from a standard HTML date input (YYYY-MM-DD)
    const [year, month, day] = date.split("-");
    const formattedDate = `${parseInt(month)}/${parseInt(day)}/${year}`;

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: "Sheet1!A:E",
      // CRITICAL: This must be 'USER_ENTERED' to avoid the apostrophe
      valueInputOption: "USER_ENTERED", 
      requestBody: {
        values: [[formattedDate, category, amount, item]],
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error adding expense:", error);
    return { success: false };
  }
}
