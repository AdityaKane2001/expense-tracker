'use client'

import { useState, useRef, useEffect } from 'react'
import { useFormStatus } from 'react-dom'
import { addExpense, getRecentExpenses } from './actions'

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
  // Fix for UTC vs Local Time
  const getLocalDate = (offset = 0) => {
    const d = new Date()
    d.setDate(d.getDate() - offset)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}` // Always outputs YYYY-MM-DD
  }

  const [selectedDate, setSelectedDate] = useState(getLocalDate(0))
  const [message, setMessage] = useState('')
  const [history, setHistory] = useState<any[]>([])
  const formRef = useRef<HTMLFormElement>(null)

  // Target sheet calculation for the UI
  const getTargetSheet = () => {
    const [year, month] = selectedDate.split('-').map(Number)
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return `${monthNames[month - 1]}${year}`
  }

  // ASYNC HISTORY FETCHING
  // This runs on first load AND anytime the selectedDate changes
  const fetchHistory = async () => {
    const data = await getRecentExpenses(selectedDate)
    setHistory(data)
  }

  useEffect(() => {
    fetchHistory()
  }, [selectedDate])

  // SUBMIT HANDLER
  async function handleAction(formData: FormData) {
    const costValue = formData.get('cost') as string

    // Validate float amount
    if (!/^[0-9]*\.?[0-9]+$/.test(costValue)) {
      setMessage('❌ Error: Please enter a valid amount')
      setTimeout(() => setMessage(''), 3000)
      return
    }

    const result = await addExpense(formData)
    
    if (result?.success) {
      setMessage('✅ Saved to Google Sheets!')
      formRef.current?.reset() 
      setSelectedDate(getLocalDate(0)) // Reset to today
      fetchHistory() // Refresh history immediately
      setTimeout(() => setMessage(''), 3000)
    } else {
      setMessage('❌ Error: ' + (result?.error || 'Unknown error'))
    }
  }

  return (
    <main className="max-w-md mx-auto p-6 bg-white min-h-screen">
      <header className="mb-6 pt-4">
        <h1 className="text-3xl font-black text-black tracking-tight">New Expense</h1>
        <p className="text-blue-600 font-bold text-sm mt-1 bg-blue-50 inline-block px-3 py-1 rounded-full">
          Targeting: <span className="font-black">{getTargetSheet()}</span>
        </p>
      </header>
      
      <form ref={formRef} action={handleAction} className="flex flex-col gap-6">
        
        {/* 1. DATE SECTION + QUICK BUTTONS */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Date</label>
          <input 
            name="date" 
            type="date" 
            value={selectedDate} 
            onChange={(e) => setSelectedDate(e.target.value)} 
            className="w-full bg-gray-50 p-4 rounded-2xl text-black font-semibold outline-none ring-1 ring-gray-100 focus:ring-2 focus:ring-blue-500" 
          />
          {/* Quick Offset Buttons */}
          <div className="flex gap-2 mt-1">
            {[1, 2, 3].map((num) => (
              <button 
                key={num} 
                type="button" 
                onClick={() => setSelectedDate(getLocalDate(num))}
                className="text-xs bg-gray-100 px-4 py-2 rounded-full font-bold text-gray-500 active:bg-blue-100 active:text-blue-600 transition-colors"
              >
                -{num} Day{num > 1 ? 's' : ''}
              </button>
            ))}
          </div>
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

        <div className="mt-2 flex flex-col gap-2">
          <SubmitButton />
          
          {/* FIXED HEIGHT MESSAGE SLOT */}
          <div className="h-10 flex items-center justify-center">
            {message && (
              <div className={`px-4 py-2 w-full rounded-xl font-bold text-center transition-opacity duration-300 ${message.includes('✅') ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                {message}
              </div>
            )}
          </div>
        </div>

        {/* RECENT TRANSACTIONS WIDGET */}
        <div className="border-t border-gray-100 pt-6 pb-10">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
            Recent in {getTargetSheet()}
          </h2>
          {history.length === 0 ? (
            <p className="text-sm text-gray-400 italic">No expenses yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {history.map((row, i) => (
                <div key={i} className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl">
                  <div>
                    <p className="text-sm font-black text-black">{row[2]}</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{row[0]} • {row[1]}</p>
                  </div>
                  <p className="font-black text-lg text-black">${row[3]}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </form>
    </main>
  )
}
