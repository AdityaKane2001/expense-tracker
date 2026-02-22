'use client'
import { addExpense } from './actions';
import { useState } from 'react';

export default function Home() {
  const [status, setStatus] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Logic to show exactly which tab the app is targeting
  const getTargetSheet = (dateString: string) => {
    const [y, m, d] = dateString.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const month = dateObj.toLocaleDateString('en-US', { month: 'short' });
    return `${month}${y}`;
  };

  async function clientAction(formData: FormData) {
    setStatus('🚀 Sending to ' + getTargetSheet(selectedDate) + '...');
    const result = await addExpense(formData);
    if (result.success) {
      setStatus('✅ Added to ' + getTargetSheet(selectedDate));
      // Reset only the item and cost so you can log another for the same day/group
      const form = document.querySelector('form') as HTMLFormElement;
      form.reset();
    } else {
      setStatus('❌ Error: ' + result.error);
    }
  }

  return (
    <main className="max-w-md mx-auto p-6 pt-12 font-sans bg-gray-50 min-h-screen">
      <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Log Expense</h1>
          <p className="text-sm text-blue-600 font-medium">Targeting: {getTargetSheet(selectedDate)}</p>
        </header>
        
        <form action={clientAction} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Date</label>
            <input 
              name="date" 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border-b-2 border-gray-100 p-2 text-lg text-black focus:border-blue-500 outline-none transition bg-transparent" 
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Category</label>
            <select name="group" className="bg-gray-50 p-4 rounded-2xl text-black outline-none border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500 appearance-none">
              <option>Food</option>
              <option>Groceries</option>
              <option>Transport</option>
              <option>Restaurants</option>
              <option>Recurring</option>
              <option>Other</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Item Description</label>
            <input name="item" placeholder="What was it?" className="border-b-2 border-gray-100 p-2 text-lg text-black focus:border-blue-500 outline-none transition bg-transparent" required />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Amount</label>
            <div className="relative">
              <span className="absolute left-0 top-2 text-3xl font-bold text-gray-400">$</span>
              <input
                name="cost"
                type="number"
                step="0.01"
                inputMode="decimal" // This forces the number pad with a decimal point on iOS
                placeholder="0.00"
                className="pl-6 w-full text-4xl font-black border-b-2 border-gray-100 p-2 text-black focus:border-blue-500 outline-none transition bg-transparent"
                required
              />
            </div>
          </div>

          <button type="submit" className="mt-6 bg-black text-white p-5 rounded-2xl font-bold text-xl shadow-lg active:scale-[0.98] hover:bg-gray-800 transition-all">
            Save Expense
          </button>
          
          {status && (
            <div className="mt-4 p-3 rounded-xl bg-blue-50 text-blue-700 text-center text-sm font-semibold animate-in fade-in slide-in-from-bottom-2">
              {status}
            </div>
          )}
        </form>
      </div>
    </main>
  );
}
