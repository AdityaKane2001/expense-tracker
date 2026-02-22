'use client'

import { useFormStatus } from 'react-dom'
import { addExpense } from './actions'

// 1. The Spinning Button Component
function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl text-lg shadow-lg active:scale-95 transition-all disabled:bg-gray-400 flex items-center justify-center gap-3"
    >
      {pending ? (
        <>
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <span>Saving...</span>
        </>
      ) : (
        "Save Expense"
      )}
    </button>
  )
}

// 2. The Full Page Component
export default function Page() {

  async function handleAction(formData: FormData) {
    await addExpense(formData);
    // This function returns nothing (void), which makes the form happy
  }

  return (
    <main className="max-w-md mx-auto p-6 bg-white min-h-screen">
      <header className="mb-10">
        <h1 className="text-3xl font-black text-black tracking-tight">New Expense</h1>
        <p className="text-gray-400 font-medium">Log your spending instantly.</p>
      </header>
      
      <form action={handleAction} className="flex flex-col gap-8">
        
        {/* AMOUNT SECTION */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Amount</label>
          <div className="flex items-center gap-1 border-b-2 border-gray-100 focus-within:border-blue-500 transition-all pb-1">
            <span className="text-4xl font-black text-black select-none">$</span>
            <input 
              name="cost" 
              type="text" 
              inputMode="decimal" 
              placeholder="0.00" 
              className="w-full text-4xl font-black text-black outline-none bg-transparent placeholder:text-gray-200" 
              required 
            />
          </div>
        </div>

        {/* CATEGORY SECTION */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Category</label>
          <select 
            name="group" 
            className="w-full bg-gray-50 p-4 rounded-2xl text-black font-semibold outline-none border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-blue-500 appearance-none"
            required
          >
            <option>Food</option>
            <option>Groceries</option>
            <option>Transport</option>
            <option>Restaurants</option>
            <option>Other</option>
          </select>
        </div>

        {/* DESCRIPTION SECTION */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Description</label>
          <input 
            name="item" 
            type="text" 
            placeholder="What did you buy?" 
            className="w-full bg-gray-50 p-4 rounded-2xl text-black font-semibold outline-none border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-blue-500"
            required 
          />
        </div>

        {/* DATE SECTION (Hidden, defaults to today) */}
        <input type="hidden" name="date" value={new Date().toISOString().split('T')[0]} />

        {/* THE SPINNING BUTTON */}
        <div className="mt-4">
          <SubmitButton />
        </div>
      </form>
    </main>
  )
}
