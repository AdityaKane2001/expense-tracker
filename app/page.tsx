'use client'

import { useState, useRef } from 'react'
import { useFormStatus } from 'react-dom'
import { addExpense } from './actions'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl text-lg shadow-lg active:scale-95 transition-all disabled:bg-gray-400 flex items-center justify-center gap-3"
    >
      {pending ? (
        <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Saving...</span></>
      ) : ("Save Expense")}
    </button>
  )
}

export default function Page() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [message, setMessage] = useState('')
  const formRef = useRef<HTMLFormElement>(null)

  const getTargetSheet = () => {
    const [year, month] = selectedDate.split('-').map(Number)
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return `${monthNames[month - 1]}${year}`
  }

  async function handleAction(formData: FormData) {
    const result = await addExpense(formData)
    
    if (result?.success) {
      setMessage('✅ Saved to Google Sheets!')
      formRef.current?.reset() // Clears the form for the next entry
      // Reset the date back to today after clearing
      setSelectedDate(new Date().toISOString().split('T')[0]) 
      
      // Hide the message after 3 seconds
      setTimeout(() => setMessage(''), 3000)
    } else {
      setMessage('❌ Error: ' + (result?.error || 'Unknown error'))
    }
  }

  return (
    <main className="max-w-md mx-auto p-6 bg-white min-h-screen flex flex-col">
      <header className="mb-8 pt-4">
        <h1 className="text-3xl font-black text-black tracking-tight">New Expense</h1>
        <p className="text-blue-600 font-bold text-sm mt-1 bg-blue-50 inline-block px-3 py-1 rounded-full">
          Targeting: <span className="font-black">{getTargetSheet()}</span>
        </p>
      </header>
      
      <form ref={formRef} action={handleAction} className="flex flex-col gap-6">
        {/* Success/Error Message */}
        {message && (
          <div className={`p-4 rounded-xl font-bold text-center animate-bounce ${message.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message}
          </div>
        )}

        {/* 1. DATE */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Date</label>
          <input name="date" type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full bg-gray-50 p-4 rounded-2xl text-black font-semibold outline-none ring-1 ring-gray-100 focus:ring-2 focus:ring-blue-500" />
        </div>

        {/* 2. CATEGORY */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Category</label>
          <select name="group" className="w-full bg-gray-50 p-4 rounded-2xl text-black font-semibold outline-none ring-1 ring-gray-100 focus:ring-2 focus:ring-blue-500 appearance-none" required>
            <option>Food</option>
            <option>Groceries</option>
            <option>Transport</option>
            <option>Restaurants</option>
            <option>Other</option>
          </select>
        </div>

        {/* 3. DESCRIPTION */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Description</label>
          <input name="item" type="text" placeholder="What did you buy?" className="w-full bg-gray-50 p-4 rounded-2xl text-black font-semibold outline-none ring-1 ring-gray-100 focus:ring-2 focus:ring-blue-500" required />
        </div>

        {/* 4. COST */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Amount</label>
          <div className="flex items-center gap-1 border-b-2 border-gray-100 focus-within:border-blue-500 transition-all pb-1">
            <span className="text-4xl font-black text-black select-none">$</span>
            <input name="cost" type="text" inputMode="decimal" placeholder="0.00" className="w-full text-4xl font-black text-black outline-none bg-transparent placeholder:text-gray-200" required />
          </div>
        </div>

        <div className="mt-4">
          <SubmitButton />
        </div>
      </form>
    </main>
  )
}
