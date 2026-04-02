'use server'

import { google } from 'googleapis';
import { revalidatePath } from 'next/cache';

// Reusable auth setup
const getSheetsClient = () => {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

// 1. FETCH RECENT EXPENSES
export async function getRecentExpenses(dateString: string) {
  try {
    const sheets = getSheetsClient();
    const spreadsheetId = process.env.GOOGLE_SHEET_ID!;
    
    // Parse the requested date to find the correct sheet
    const [year, month] = dateString.split('-').map(Number);
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const sheetName = `${monthNames[month - 1]}${year}`;

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:D`,
    });

    const rows = response.data.values || [];
    if (rows.length <= 1) return []; // Ignore headers

    // Grab the last 5 entries and reverse them (newest first)
    return rows.slice(1).slice(-5).reverse();
  } catch (error) {
    // If the sheet doesn't exist yet (e.g., first day of a new month), return empty
    return [];
  }
}

// 2. ADD NEW EXPENSE
export async function addExpense(formData: FormData) {
  const sheets = getSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEET_ID!;
  const rawDate = formData.get('date') as string;

  const [year, month, day] = rawDate.split('-').map(Number);
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  // 1. REMOVE THE APOSTROPHE HERE
  const cellDate = `${monthNames[month - 1]} ${day}`;
  const sheetName = `${monthNames[month - 1]}${year}`; 

  try {
    const doc = await sheets.spreadsheets.get({ spreadsheetId });
    const sheetExists = doc.data.sheets?.some(s => s.properties?.title === sheetName);

    // ... (sheet creation logic stays the same) ...

    // 2. CHANGE TO 'RAW' HERE
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A:D`,
      valueInputOption: 'RAW', // <-- Changed from USER_ENTERED
      requestBody: {
        values: [[
          cellDate,
          formData.get('group'),
          formData.get('item'),
          Number(formData.get('cost')) // RAW mode will keep this as a true number!
        ]],
      },
    });

    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error('Error:', error);
    return { success: false, error: error.message };
  }
}
