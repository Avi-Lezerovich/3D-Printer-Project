import React from 'react';
import '../styles/help.css';

const faqs = [
  {
    question: 'How do I start a new print?',
    answer: 'Navigate to the Control Panel, upload your G-code file using the file upload component, and then click the "Print" button.',
  },
  {
    question: 'How can I check the printer status?',
    answer: 'The Printer Dashboard on the Control Panel shows the current status, including temperature, progress, and connection status.',
  },
  {
    question: 'Where can I manage my projects?',
    answer: 'The Project Management page provides a Kanban board to track tasks, a budget tracker, and an inventory status overview.',
  },
];

interface FaqItemProps {
  faq: { question: string; answer: string };
  isOpen: boolean;
  onClick: () => void;
}

const FaqItem: React.FC<FaqItemProps> = ({ faq, isOpen, onClick }) => (
  <div className="faq-item">
    <button className="faq-question" onClick={onClick}>
      {faq.question}
      <span>{isOpen ? '-' : '+'}</span>
    </button>
    {isOpen && <div className="faq-answer">{faq.answer}</div>}
  </div>
);

export default function Help() {
  const [openFaq, setOpenFaq] = React.useState<number | null>(null);
  const [query, setQuery] = React.useState('');

  const filteredFaqs = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return faqs;
    return faqs.filter(f => f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q));
  }, [query]);

  const handleFaqClick = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="help-container">
      <h1>Help & Documentation</h1>
      <p>
        Welcome to the help section. Browse FAQs, search topics, or read full documentation.
      </p>

      <div className="help-actions">
        <div className="search">
          <input
            type="search"
            placeholder="Search help topics"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search help topics"
          />
        </div>
        <div className="doc-links" aria-label="Documentation links">
          <a className="btn btn-secondary" href="/docs/restoration_report.pdf" target="_blank" rel="noreferrer">Restoration Report (PDF)</a>
          <a className="btn btn-secondary" href="/docs/resume.pdf" target="_blank" rel="noreferrer">Resume (PDF)</a>
        </div>
      </div>

      <div className="faq-section">
        <h2>Frequently Asked Questions</h2>
        {filteredFaqs.length === 0 && <p>No results. Try a different search.</p>}
        {filteredFaqs.map((faq, index) => (
          <FaqItem
            key={index}
            faq={faq}
            isOpen={openFaq === index}
            onClick={() => handleFaqClick(index)}
          />
        ))}
      </div>
    </div>
  );
}
