'use client'

import { useState, useRef, useEffect } from 'react'
import { useFormStatus } from 'react-dom'
import { addExpense, getRecentExpenses } from './actions'

// --- PRESETS CONFIGURATION ---
const PRESETS = [
  { label: 'Whole Foods', category: 'Groceries', item: 'Whole Foods' },
  { label: 'Cava', category: 'Food', item: 'Cava' },
  { label: 'Coffee', category: 'Food', item: 'Coffee' },
  { label: 'Uber', category: 'Transport', item: 'Uber' },
]

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl text-lg shadow-lg active:scale-95 transition-all disabled:bg-zinc-300 dark:disabled:bg-zinc-800 disabled:text-zinc-500 flex items-center justify-center gap-3"
    >
      {pending ? (
        <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Saving...</span></>
      ) : ("Save Expense")}
    </button>
  )
}

export default function Page() {
  const getLocalDate = (offset = 0) => {
    const d = new Date()
    d.setDate(d.getDate() - offset)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // --- STATE MANAGEMENT ---
  const [selectedDate, setSelectedDate] = useState(getLocalDate(0))
  const [category, setCategory] = useState('Food')
  const [description, setDescription] = useState('')
  const [message, setMessage] = useState('')
  const [history, setHistory] = useState<any[]>([])
  
  const formRef = useRef<HTMLFormElement>(null)
  const amountRef = useRef<HTMLInputElement>(null) // Added to auto-focus amount

  const getTargetSheet = () => {
    const [year, month] = selectedDate.split('-').map(Number)
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return `${monthNames[month - 1]}${year}`
  }

  const fetchHistory = async () => {
    const data = await getRecentExpenses(selectedDate)
    setHistory(data)
  }

  useEffect(() => {
    fetchHistory()
  }, [selectedDate])

  // --- PRESET LOGIC ---
  const handlePresetClick = (presetCategory: string, presetItem: string) => {
    setCategory(presetCategory)
    setDescription(presetItem)
    // Optional UX magic: automatically jump to the amount input
    amountRef.current?.focus()
  }

  const getPresetColor = (cat: string) => {
    switch (cat) {
      case 'Groceries': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800/50'
      case 'Food': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800/50'
      case 'Transport': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800/50'
      default: return 'bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-zinc-300 border-gray-200 dark:border-zinc-700'
    }
  }

  async function handleAction(formData: FormData) {
    const costValue = formData.get('cost') as string

    if (!/^[0-9]*\.?[0-9]+$/.test(costValue)) {
      setMessage('❌ Error: Please enter a valid amount')
      setTimeout(() => setMessage(''), 3000)
      return
    }

    const result = await addExpense(formData)
    
    if (result?.success) {
      setMessage('✅ Saved to Google Sheets!')
      formRef.current?.reset() 
      setSelectedDate(getLocalDate(0)) 
      setCategory('Food')     // Reset state
      setDescription('')      // Reset state
      fetchHistory() 
      setTimeout(() => setMessage(''), 3000)
    } else {
      setMessage('❌ Error: ' + (result?.error || 'Unknown error'))
    }
  }

  return (
    <main className="min-h-screen bg-white dark:bg-zinc-950 transition-colors duration-200">
      <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-start">
        
        {/* LEFT COLUMN: The Form */}
        <div>
          <header className="mb-6 pt-4 lg:pt-10">
            <h1 className="text-3xl font-black text-black dark:text-white tracking-tight">New Expense</h1>
            <p className="text-blue-600 dark:text-blue-400 font-bold text-sm mt-2 bg-blue-50 dark:bg-blue-900/30 inline-block px-3 py-1 rounded-full">
              Targeting: <span className="font-black">{getTargetSheet()}</span>
            </p>
          </header>

          {/* --- PRESET BUTTONS ROW --- */}
          <div className="mb-8">
            <label className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest block mb-2">Quick Presets</label>
            {/* overflow-x-auto allows scrolling if you add a lot of presets! */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handlePresetClick(preset.category, preset.item)}
                  className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-bold border transition-transform active:scale-95 ${getPresetColor(preset.category)}`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
          
          <form ref={formRef} action={handleAction} className="flex flex-col gap-6">
            
            {/* 1. DATE */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest">Date</label>
              <input 
                name="date" type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} 
                className="w-full bg-gray-50 dark:bg-zinc-900 p-4 rounded-2xl text-black dark:text-white font-semibold outline-none ring-1 ring-gray-100 dark:ring-zinc-800 focus:ring-2 focus:ring-blue-500 dark:[color-scheme:dark]" 
              />
              <div className="flex gap-2 mt-1">
                {[1, 2, 3].map((num) => (
                  <button 
                    key={num} type="button" onClick={() => setSelectedDate(getLocalDate(num))}
                    className="text-xs bg-gray-100 dark:bg-zinc-800 px-4 py-2 rounded-full font-bold text-gray-500 dark:text-zinc-400 active:bg-blue-100 dark:active:bg-blue-900/50 active:text-blue-600 transition-colors"
                  >
                    -{num} Day{num > 1 ? 's' : ''}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. CATEGORY (Now Controlled) */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest">Category</label>
              <select 
                name="group" 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-gray-50 dark:bg-zinc-900 p-4 rounded-2xl text-black dark:text-white font-semibold outline-none ring-1 ring-gray-100 dark:ring-zinc-800 focus:ring-2 focus:ring-blue-500 appearance-none" 
                required
              >
                <option>Food</option>
                <option>Groceries</option>
                <option>Transport</option>
                <option>Restaurants</option>
                <option>Other</option>
              </select>
            </div>

            {/* 3. DESCRIPTION (Now Controlled) */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest">Description</label>
              <input 
                name="item" 
                type="text" 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What did you buy?" 
                className="w-full bg-gray-50 dark:bg-zinc-900 p-4 rounded-2xl text-black dark:text-white font-semibold outline-none ring-1 ring-gray-100 dark:ring-zinc-800 focus:ring-2 focus:ring-blue-500 placeholder:text-gray-300 dark:placeholder:text-zinc-600" 
                required 
              />
            </div>

            {/* 4. COST */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest">Amount</label>
              <div className="flex items-center gap-1 border-b-2 border-gray-100 dark:border-zinc-800 focus-within:border-blue-500 transition-all pb-1">
                <span className="text-4xl font-black text-black dark:text-white select-none">$</span>
                <input 
                  name="cost" 
                  type="text" 
                  ref={amountRef} // Tied to the preset jump logic
                  inputMode="decimal" 
                  placeholder="0.00" 
                  className="w-full text-4xl font-black text-black dark:text-white outline-none bg-transparent placeholder:text-gray-200 dark:placeholder:text-zinc-700" 
                  autoFocus 
                  required 
                />
              </div>
            </div>

            <div className="mt-2 flex flex-col gap-2">
              <SubmitButton />
              
              <div className="h-10 flex items-center justify-center">
                {message && (
                  <div className={`px-4 py-2 w-full rounded-xl font-bold text-center transition-opacity duration-300 ${message.includes('✅') ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20' : 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'}`}>
                    {message}
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* RIGHT COLUMN: History */}
        <div className="lg:sticky lg:top-12 border-t lg:border-t-0 lg:border-l border-gray-100 dark:border-zinc-800 pt-8 lg:pt-10 lg:pl-12 pb-10">
          <h2 className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest mb-6">
            Recent in {getTargetSheet()}
          </h2>
          {history.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-zinc-500 italic">No expenses yet.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {history.map((row, i) => (
                <div key={i} className="flex justify-between items-center bg-gray-50 dark:bg-zinc-900/50 p-4 rounded-2xl border border-transparent dark:border-zinc-800">
                  <div>
                    <p className="text-sm font-black text-black dark:text-white">{row[2]}</p>
                    <p className="text-[10px] text-gray-500 dark:text-zinc-400 font-bold uppercase tracking-wider">{row[0]} • {row[1]}</p>
                  </div>
                  <p className="font-black text-lg text-black dark:text-white">${row[3]}</p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  )
}
