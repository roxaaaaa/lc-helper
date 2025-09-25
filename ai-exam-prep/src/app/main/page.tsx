"use client";
import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "next/navigation";

const SUBJECTS = [
  { label: "Agriculture", value: "agriculture" },
  { label: "Business", value: "business" },
];
const LEVELS = [
  { label: "Higher Level", value: "higher" },
  { label: "Ordinary Level", value: "ordinary" },
];

export default function MainPage() {
  const { logout } = useAuth();
  const router = useRouter();
  const [subject, setSubject] = useState(SUBJECTS[0].value);
  const [level, setLevel] = useState(LEVELS[0].value);
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<string[] | null>(null);
  const [dark, setDark] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      logout();
      router.push('/landing');
    } catch (error) {
      console.error('Logout error:', error);
      logout();
      router.push('/landing');
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setQuestions(null);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/ai/generate_questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          topic_name: topic,
          subject: subject,
          level: level
        }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Failed to fetch questions");
      }
      const data = await response.json();
      // Split questions by line breaks or numbers if formatted as a single string
      let questionsArr: string[] = [];
      if (typeof data.questions === "string") {
        // Split by numbered questions and preserve the numbering
        const questionMatches = data.questions.match(/\d+\.\s*([\s\S]*?)(?=\n\s*\d+\.|$)/g);
        if (questionMatches) {
          questionsArr = questionMatches.map((match: string) => {
            // Extract the question content (remove the number and clean up)
            const content = match.replace(/^\d+\.\s*/, '').trim();
            return content;
          }).filter((q: string) => q.length > 0);
        } else {
          // Fallback: split by numbered questions (e.g., 1., 2., 3.)
          questionsArr = data.questions
            .split(/\n?\d+\. /)
            .map((q: string) => q.trim())
            .filter((q: string) => q.length > 0);
        }
      } else if (Array.isArray(data.questions)) {
        questionsArr = data.questions;
      }
      setQuestions(questionsArr);
    } catch (err: any) {
      console.error("Error generating questions:", err);
      setQuestions([`Error: ${err.message}`]);
    } finally {
      setLoading(false);
    }
  };

  // Toggle dark mode by adding/removing 'dark' class on <html>
  const toggleDark = () => {
    setDark((d) => {
      const newDark = !d;
      if (typeof window !== "undefined") {
        document.documentElement.classList.toggle("dark", newDark);
      }
      return newDark;
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground transition-colors duration-300 px-4">
      <div className="absolute top-4 right-4 flex gap-2">
        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded bg-red-600 text-white font-semibold hover:bg-red-700 transition"
          type="button"
        >
          Logout
        </button>
        <button
          aria-label="Toggle dark mode"
          className="p-2 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-black shadow hover:scale-105 transition"
          onClick={toggleDark}
        >
          {dark ? (
            <span role="img" aria-label="Light mode">🌞</span>
          ) : (
            <span role="img" aria-label="Dark mode">🌙</span>
          )}
        </button>
      </div>
      <div className="max-w-lg w-full flex flex-col gap-8 items-center">
        <header className="text-center mt-8 mb-4">
          <h1 className="text-4xl font-bold mb-2 tracking-tight">AI Exam Prep</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">Generate Leaving Cert exam-style questions for any topic.</p>
        </header>
        {!questions ? (
          <form
            onSubmit={handleGenerate}
            className="w-full flex flex-col gap-6 bg-gray-100 dark:bg-gray-800 rounded-xl shadow-lg p-6"
          >
            <div className="flex gap-4">
              <select
                className="flex-1 rounded border px-3 py-2 bg-gray-100 dark:bg-gray-800 text-black dark:text-black"
                value={subject}
                onChange={e => setSubject(e.target.value)}
              >
                {SUBJECTS.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
              <select
                className="flex-1 rounded border px-3 py-2 bg-gray-100 dark:bg-gray-800 text-black dark:text-black"
                value={level}
                onChange={e => setLevel(e.target.value)}
              >
                {LEVELS.map(l => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </select>
            </div>
            <input
              className="rounded border px-3 py-2 bg-gray-100 dark:bg-gray-800 text-black dark:text-black"
              type="text"
              placeholder="Enter a topic (e.g., 'Photosynthesis', 'Calculus')"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              required
            />
            <button
              type="submit"
              className="w-full py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-60"
              disabled={loading || !topic.trim()}
            >
              {loading ? "Generating..." : "Generate Questions"}
            </button>
          </form>
        ) : (
          <div className="w-full flex flex-col gap-6 bg-gray-100 dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-2 text-black dark:text-black">Your Questions</h2>
            <ol className="list-decimal list-inside space-y-4">
              {questions.map((q, i) => (
                <li key={i} className="text-lg text-black dark:text-black">{q}</li>
              ))}
            </ol>
            <button
              className="mt-6 w-full py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              onClick={() => setQuestions(null)}
            >
              Try Another Topic
            </button>
          </div>
        )}
      </div>
      <footer className="mt-12 mb-4 text-xs text-gray-400">&copy; {new Date().getFullYear()} AI Exam Prep</footer>
    </div>
  );
} 