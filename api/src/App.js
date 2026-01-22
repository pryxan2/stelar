import React, { useState } from 'react';
import { Sparkles, Moon, Scroll, RefreshCw, Wand2, Quote } from 'lucide-react';

const TAROT_DECK = [
  { name: "The Fool", emoji: "🃏" }, { name: "The Magician", emoji: "🪄" },
  { name: "The High Priestess", emoji: "🌙" }, { name: "The Empress", emoji: "🌿" },
  { name: "The Emperor", emoji: "👑" }, { name: "The Hierophant", emoji: "⛪" },
  { name: "The Lovers", emoji: "❤️" }, { name: "The Chariot", emoji: "⚔️" },
  { name: "Strength", emoji: "🦁" }, { name: "The Hermit", emoji: " Lantern" },
  { name: "Wheel of Fortune", emoji: "🎡" }, { name: "Justice", emoji: "⚖️" },
  { name: "The Hanged Man", emoji: "⏳" }, { name: "Death", emoji: "💀" },
  { name: "Temperance", emoji: "🍷" }, { name: "The Devil", emoji: "😈" },
  { name: "The Tower", emoji: "⚡" }, { name: "The Star", emoji: "⭐" },
  { name: "The Moon", emoji: "🌕" }, { name: "The Sun", emoji: "☀️" },
  { name: "Judgement", emoji: "🎺" }, { name: "The World", emoji: "🌍" }
];

const FormattedReading = ({ text }) => {
  if (!text) return null;
  const blocks = text.split('\n\n');
  return (
    <div className="space-y-6 animate-in fade-in duration-1000">
      {blocks.map((block, idx) => {
        const cleanBlock = block.replace(/[#*]/g, '').trim();
        if (idx === 0) return (
          <div key={idx} className="relative py-4 text-center">
            <Quote className="absolute -top-2 left-0 w-8 h-8 text-amber-900/40 -scale-x-100" />
            <p className="text-xl italic text-amber-200/90 font-serif leading-relaxed px-8">{cleanBlock}</p>
            <Quote className="absolute -bottom-2 right-0 w-8 h-8 text-amber-900/40" />
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-amber-700/50 to-transparent mx-auto mt-6" />
          </div>
        );
        const isAdvice = idx === blocks.length - 1;
        return (
          <div key={idx} className={isAdvice ? "mt-12 p-6 bg-amber-950/20 border border-amber-500/20 rounded-2xl" : ""}>
            {isAdvice && <h4 className="font-cinzel text-amber-500 text-sm tracking-[0.2em] mb-3 text-center uppercase">Наставление</h4>}
            <p className={`leading-relaxed ${isAdvice ? 'text-amber-100/80 text-center italic' : 'text-amber-100/80'}`}>{cleanBlock}</p>
          </div>
        );
      })}
    </div>
  );
};

export default function App() {
  const [step, setStep] = useState('welcome');
  const [selectedCards, setSelectedCards] = useState([]);
  const [reading, setReading] = useState("");
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState("");

  const drawCard = (card) => {
    if (selectedCards.length < 3 && !selectedCards.find(c => c.name === card.name)) {
      setSelectedCards([...selectedCards, card]);
    }
  };

  const generateReading = async () => {
    setLoading(true);
    setStep('reading');
    const cardNames = selectedCards.map(c => c.name).join(", ");
    try {
      const response = await fetch('/api/oracle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: `Вопрос: ${question}. Карты: ${cardNames}` })
      });
      const data = await response.json();
      setReading(data.answer);
    } catch (err) {
      setReading("Ошибка связи с миром духов. Попробуйте обновить страницу.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-amber-100 font-serif selection:bg-amber-900/30 overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-amber-600/10 blur-[150px] rounded-full animate-pulse" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-12">
        <header className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-slate-900 border border-amber-500/40 shadow-lg">
              <Moon className="w-10 h-10 text-amber-400" />
            </div>
          </div>
          <h1 className="text-5xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-400 to-amber-700 font-cinzel uppercase">Vox Stellarum</h1>
        </header>

        {step === 'welcome' && (
          <div className="bg-slate-900/40 backdrop-blur-md border border-amber-900/30 p-10 rounded-[2.5rem] animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Впишите свой вопрос в ткань мироздания..."
              className="w-full bg-transparent border-b border-amber-900/50 p-4 text-xl text-amber-100 focus:outline-none focus:border-amber-500 h-32 resize-none"
            />
            <button onClick={() => setStep('drawing')} className="mt-8 w-full py-5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-2xl transition-all font-cinzel tracking-widest uppercase">Начать Ритуал</button>
          </div>
        )}

        {step === 'drawing' && (
          <div className="space-y-12 animate-in fade-in duration-700">
            <div className="grid grid-cols-3 gap-4">
              {[0, 1, 2].map((i) => (
                <div key={i} className={`aspect-[2/3] rounded-2xl border-2 border-dashed flex items-center justify-center ${selectedCards[i] ? 'border-amber-500 bg-slate-900' : 'border-amber-900/30'}`}>
                  {selectedCards[i] ? <span className="text-5xl">{selectedCards[i].emoji}</span> : <Sparkles className="opacity-20" />}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {TAROT_DECK.map((card, idx) => (
                <button key={idx} disabled={selectedCards.length >= 3 || selectedCards.find(c => c.name === card.name)} onClick={() => drawCard(card)}
                  className="aspect-[2/3] bg-slate-900 border border-amber-900/40 rounded-lg hover:border-amber-400 disabled:opacity-0 transition-all transform hover:-translate-y-1" />
              ))}
            </div>
            {selectedCards.length === 3 && (
              <button onClick={generateReading} className="w-full py-5 border-2 border-amber-500 text-amber-400 font-cinzel rounded-full hover:bg-amber-500 hover:text-slate-950 transition-all">УЗНАТЬ ПРАВДУ</button>
            )}
          </div>
        )}

        {step === 'reading' && (
          <div className="bg-slate-900/60 backdrop-blur-2xl border border-amber-500/20 p-10 rounded-[3rem] min-h-[400px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                <div className="w-16 h-16 border-t-2 border-amber-500 rounded-full animate-spin mb-4" />
                <p className="font-cinzel text-amber-200 tracking-widest">Считывание Эфира...</p>
              </div>
            ) : (
              <>
                <div className="flex justify-center gap-4 mb-10">
                  {selectedCards.map((c, i) => <span key={i} className="text-4xl bg-slate-950 p-3 rounded-xl border border-amber-900/50">{c.emoji}</span>)}
                </div>
                <FormattedReading text={reading} />
                <button onClick={() => { setStep('welcome'); setSelectedCards([]); }} className="mt-12 w-full flex items-center justify-center gap-2 text-amber-600 hover:text-amber-400 font-cinzel text-xs tracking-widest uppercase">
                  <RefreshCw className="w-4 h-4" /> Новое Обращение
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=Lora:ital@0;1&display=swap');
        .font-cinzel { font-family: 'Cinzel', serif; }
        .font-serif { font-family: 'Lora', serif; }
      `}} />
    </div>
  );
}
