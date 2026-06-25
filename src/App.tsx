import { useState, useRef } from 'react'
import heroImg from './assets/hero.png'
import './App.css'

const API_URL = '/api/subscribe'
const SUBMIT_COOLDOWN_MS = 5000

function sanitize(value: string): string {
  return value.replace(/<[^>]*>/g, '').replace(/[<>&"']/g, '').trim().slice(0, 200)
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)
}

function isValidName(name: string): boolean {
  return name.length >= 1 && name.length <= 100 && !/[<>{}/\\]/.test(name)
}

type Page = 'form' | 'success'

export default function App() {
  const [firstName, setFirstName] = useState('')
  const [email, setEmail] = useState('')
  const [newsletter, setNewsletter] = useState(false)
  const [honeypot, setHoneypot] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState<Page>('form')
  const lastSubmitAt = useRef(0)

  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (!isValidName(firstName.trim())) errs.firstName = 'Please enter a valid name.'
    if (!isValidEmail(email.trim())) errs.email = 'Please enter a valid email address.'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (honeypot) return

    const now = Date.now()
    if (now - lastSubmitAt.current < SUBMIT_COOLDOWN_MS) {
      setErrors({ general: 'Please wait a moment before submitting again.' })
      return
    }

    if (!validate()) return

    setLoading(true)
    lastSubmitAt.current = now

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: sanitize(firstName),
          email: sanitize(email),
          newsletter,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error((data as { message?: string }).message || 'Server error. Please try again.')
      }

      setPage('success')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      setErrors({ general: message })
    } finally {
      setLoading(false)
    }
  }

  if (page === 'success') {
    return (
      <main className="page">
        <div className="content">
          <header className="brand">
            <span className="brand-name">Study Key<sup>®</sup></span>
            <span className="brand-tagline">Learn &amp; Play Series</span>
          </header>

          <div className="success-icon">🎉</div>
          <h1>Check Your Email!</h1>
          <p className="success-highlight">Your FREE Preschool Activity Workbook is on its way.</p>
          <p className="body-text">
            We just sent your printable workbook to the email you provided.
            Please check your inbox in the next few minutes.
          </p>

          <div className="spam-notice">
            <strong>Can't find it?</strong>
            <span>Check your spam, junk, or promotions folder.</span>
          </div>

          <p className="body-text">
            While you wait, grab your Study Key® flashcards and get ready for hands-on learning fun! 🦕📚
          </p>

          <a href="https://studykey.com" className="btn">
            Back to Study Key<sup>®</sup>
          </a>

          <footer className="brand-footer">
            <span className="footer-name">Study Key<sup>®</sup> Learning Series</span>
            <span className="footer-sub">Thank you for learning with us!</span>
          </footer>
        </div>
      </main>
    )
  }

  return (
    <main className="page">
      <div className="content">
        <header className="brand">
          <span className="brand-name">Study Key<sup>®</sup></span>
          <span className="brand-tagline">Learn &amp; Play Series</span>
        </header>

        <h1>🎉 Claim Your Additional Preschool Activity Workbook!</h1>
        <p className="subtitle">
          Thank you for choosing Study Key® Toddler Flashcards! Enter your email below
          and we'll send your printable preschool workbook straight to your inbox.
        </p>

        <div className="hero-wrap">
          <img src={heroImg} alt="Preschool activity workbook preview" className="hero-img" />
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {/* Honeypot — invisible to users, filled by bots */}
          <div className="honeypot" aria-hidden="true">
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={e => setHoneypot(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="firstName">First Name</label>
            <input
              id="firstName"
              type="text"
              placeholder="Your child's name or yours"
              value={firstName}
              maxLength={100}
              autoComplete="given-name"
              onChange={e => setFirstName(e.target.value)}
              className={errors.firstName ? 'input-error' : ''}
              aria-describedby={errors.firstName ? 'err-firstName' : undefined}
            />
            {errors.firstName && <span id="err-firstName" className="field-error">{errors.firstName}</span>}
          </div>

          <div className="field">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              maxLength={200}
              autoComplete="email"
              onChange={e => setEmail(e.target.value)}
              className={errors.email ? 'input-error' : ''}
              aria-describedby={errors.email ? 'err-email' : undefined}
            />
            {errors.email && <span id="err-email" className="field-error">{errors.email}</span>}
          </div>

          <div className="field field-check">
            <label className="check-label">
              <input
                type="checkbox"
                checked={newsletter}
                onChange={e => setNewsletter(e.target.checked)}
              />
              <span>Yes, send me more free learning activities and parent tips.</span>
            </label>
          </div>

          {errors.general && (
            <div className="general-error" role="alert">{errors.general}</div>
          )}

          <button type="submit" className="btn btn-submit" disabled={loading}>
            {loading ? 'Sending…' : '🎁 Send My Toddlers Workbook'}
          </button>

          <p className="privacy">
            We respect your privacy. Your email will only be used to send your workbook
            and optional Study Key<sup>®</sup> learning resources.
          </p>
        </form>

        <footer className="brand-footer">
          <span className="footer-name">Study Key<sup>®</sup> Learning Series</span>
          <span className="footer-sub">Helping Little Minds Learn Through Play</span>
        </footer>
      </div>
    </main>
  )
}
