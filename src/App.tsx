import { useState } from 'react'

function App() {

  const [input, setInput] = useState('')
  const [answer, setAnswer] = useState('')
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
          messages: [{ role: 'user', content: input }],
          temperature: 0.7,
          stream: false
        })
      })

      if (!response.ok) {
        throw new Error(`Сервер вернул ошибку ${response.status}`)
      }
      const data = await response.json()
      setAnswer(data.choices[0].message.content)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка')
    } finally {
      setLoading(false)
    }
  }
  return (
    <>
      <form onSubmit={submit}>
        <input type="text" value={input}
         onChange={(e) => setInput(e.target.value)}
        id="prompt" placeholder='Введите текст' />
        <button type="submit">{loading ? 'Генерация' : 'Отправить'}</button>
      </form>
      {error && <div>{error}</div>}
      {answer && <div>{answer}</div>}
    </>
  )
}

export default App
