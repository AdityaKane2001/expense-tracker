'use server'
import { google } from 'googleapis';
import { revalidatePath } from 'next/cache';

export async function addExpense(formData: FormData) {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = process.env.GOOGLE_SHEET_ID!;
  const rawDate = formData.get('date') as string;

  const [year, month, day] = rawDate.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);

  // 1. Format for the Cell: "Feb 22"
  const cellDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  // 2. Format for the Sheet Name: "Feb2026" (Concatenated)
  const monthName = dateObj.toLocaleDateString('en-US', { month: 'short' });
  const sheetName = `${monthName}${year}`; 

  try {
    // 3. CHECK IF SHEET EXISTS / CREATE IF MISSING
    const doc = await sheets.spreadsheets.get({ spreadsheetId });
    const sheetExists = doc.data.sheets?.some(s => s.properties?.title === sheetName);

    if (!sheetExists) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [{ addSheet: { properties: { title: sheetName } } }],
        },
      });
      // Optional: Add headers to the new sheet
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!A1:D1`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [['Date', 'Category', 'Item', 'Cost']] },
      });
    }

    // 4. APPEND THE DATA
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A:D`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          cellDate,
          formData.get('group'),
          formData.get('item'),
          formData.get('cost')
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
