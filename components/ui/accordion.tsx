import * as React from "react"

import { cn } from "@/lib/utils"

interface AccordionContextValue {
  open: boolean
  onToggle: () => void
}

const AccordionContext = React.createContext<AccordionContextValue | undefined>(
  undefined
)

const Accordion = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    defaultOpen?: boolean
  }
>(({ className, defaultOpen = false, children, ...props }, ref) => {
  const [open, setOpen] = React.useState(defaultOpen)

  return (
    <AccordionContext.Provider value={{ open, onToggle: () => setOpen(!open) }}>
      <div ref={ref} className={cn("w-full", className)} {...props}>
        {children}
      </div>
    </AccordionContext.Provider>
  )
})
Accordion.displayName = "Accordion"

const AccordionItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("border-b", className)} {...props} />
))
AccordionItem.displayName = "AccordionItem"

const AccordionTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
  const context = React.useContext(AccordionContext)
  if (!context) {
    throw new Error("AccordionTrigger must be used within Accordion")
  }

  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-90",
        className
      )}
      onClick={context.onToggle}
      data-state={context.open ? "open" : "closed"}
      {...props}
    >
      {children}
      <svg
        className="h-4 w-4 shrink-0 transition-transform duration-200"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m9 18 6-6-6-6" />
      </svg>
    </button>
  )
})
AccordionTrigger.displayName = "AccordionTrigger"

const AccordionContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const context = React.useContext(AccordionContext)
  if (!context) {
    throw new Error("AccordionContent must be used within Accordion")
  }

  return (
    <div
      ref={ref}
      className={cn(
        "overflow-hidden text-sm transition-all",
        context.open ? "animate-accordion-down" : "animate-accordion-up"
      )}
      {...props}
    >
      {context.open && (
        <div className={cn("pb-4 pt-0", className)}>{children}</div>
      )}
    </div>
  )
})
AccordionContent.displayName = "AccordionContent"

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }

