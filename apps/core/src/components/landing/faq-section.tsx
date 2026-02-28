import { IconChevronDown } from '@tabler/icons-react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@workspace/ui/components/collapsible'
import { useState } from 'react'

const faqs = [
  {
    question: 'How long does it take to set up Yeko for my school?',
    answer: 'Most schools are fully operational within 5-7 days. Our onboarding team guides you through every step, from data import to staff training. You can start with basic features immediately and gradually enable advanced functionality.',
  },
  {
    question: 'Is my school\'s data secure?',
    answer: 'Absolutely. We use bank-level encryption, role-based access control, and host on a secure, global infrastructure. Your data is backed up daily and we\'re fully compliant with international data protection standards.',
  },
  {
    question: 'Can parents and teachers use Yeko on their phones?',
    answer: 'Yes! Yeko Teacher is optimized for mobile use, and Yeko Parent is a dedicated mobile app. Both work seamlessly on smartphones, even with limited internet connectivity.',
  },
  {
    question: 'Do you support multiple languages?',
    answer: 'Yes, Yeko supports both French and English, with automatic translation for parent-teacher communication. We\'re continuously adding more languages based on demand.',
  },
  {
    question: 'What happens to our data if we decide to leave?',
    answer: 'You own your data. You can export all your school data at any time in standard formats (CSV, PDF). There are no lock-in contracts or data retention fees.',
  },
  {
    question: 'Can Yeko integrate with our existing systems?',
    answer: 'Yes, our Enterprise plan includes custom integrations. We can connect with your existing accounting software, student information systems, and other tools through our API.',
  },
]

export function FAQSection() {
  const [openItems, setOpenItems] = useState<number[]>([])

  const toggleItem = (index: number) => {
    setOpenItems(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index],
    )
  }

  return (
    <section className="
      bg-muted/30 py-24
      sm:py-32
    "
    >
      <div className="
        mx-auto max-w-4xl px-6
        lg:px-8
      "
      >
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="
            text-foreground text-3xl font-bold tracking-tight
            sm:text-4xl
          "
          >
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground mt-4 text-lg">
            Everything you need to know about Yeko
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <Collapsible
              key={`faq-${faq.question.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`}
              open={openItems.includes(index)}
              onOpenChange={() => toggleItem(index)}
            >
              <div className="
                bg-background rounded-lg border-2 transition-all duration-300
                hover:shadow-md
              "
              >
                <CollapsibleTrigger className="
                  flex w-full items-center justify-between p-6 text-left
                "
                >
                  <span className="pr-8 text-lg font-semibold">{faq.question}</span>
                  <IconChevronDown
                    className={`
                      text-muted-foreground h-5 w-5 shrink-0
                      transition-transform duration-300
                      ${openItems.includes(index)
              ? `rotate-180`
              : ''
            }
                    `}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent className="px-6 pb-6">
                  <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                </CollapsibleContent>
              </div>
            </Collapsible>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground">
            Still have questions?
            {' '}
            <a
              href="/contact"
              className="
                text-primary font-medium
                hover:underline
              "
            >
              Contact our team
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}
