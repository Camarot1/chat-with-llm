import { useState } from 'react'

interface History {
  question: string
  answer: string
}

function App() {

  const [input, setInput] = useState('')
  const [answer, setAnswer] = useState('')
  const [history, setHistory] = useState<History[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    if (!input) return
    setLoading(true)
    try {
      const response = await fetch('http://localhost:1234/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gemma-3-1b-it-glm-4.7-flash-heretic-uncensored-thinking_gguf', // тут мы указываем модель llm которую будем использовать. не забыть включить и сервер
          messages: [
            { role: 'system', content: 'Всегда отвечай только на русском языке, вне зависиомсти от языка на котором тебе задают вопрос. Если вопрос связан с программированием допускается написание кода на английском языке'},
            { role: 'user', content: input }],
          temperature: 0.7,
          stream: false
        })
      })

      if (!response.ok) {
        throw new Error(`Сервер вернул ошибку ${response.status}`)
      }
      const data = await response.json()
      const supAnswer = data.choices[0].message.content
      setAnswer(supAnswer)
      setHistory(prev => [...prev, { question: input, answer: supAnswer }])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка')
    } finally {
      setLoading(false)
    }
  }
  return (
    <>
      <form onSubmit={submit}>
        <textarea value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              e.currentTarget.form?.requestSubmit();
            }
          }}
          id="prompt" placeholder='Введите текст' />
        <button type="submit">{loading ? 'Генерация' : 'Отправить'}</button>
      </form>
      {error && <div>{error}</div>}
      {answer ? <div>{answer}</div> : <div> Текста еще нет</div>}
      <p>История</p>
      {history.map((item, index) => (
        <div key={index}>
          <p>Вопрос {index + 1}</p>
          <p className="question">Вопрос : {item.question}</p>
          <p className="answer">Ответ: {item.answer}</p>
        </div>
      ))}
    </>
  )
}

export default App
