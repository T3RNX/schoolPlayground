// "use client"

// import React from "react"

// import { useState, useEffect, useRef } from "react"
// import { Button } from "@/components/ui/button"
// import { Textarea } from "@/components/ui/textarea"
// import { Card } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
// import {
//   Check,
//   AlertCircle,
//   FileText,
//   Zap,
//   Info,
//   HelpCircle,
//   CheckCircle,
//   Copy,
//   RotateCcw,
//   BookOpen,
//   Sparkles,
//   Lightbulb,
//   Pencil,
//   Wand2,
//   ArrowRight,
// } from "lucide-react"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// // Types for grammar issues
// type IssueType = "grammar" | "spelling" | "punctuation" | "style" | "vocabulary"

// type IssueCategory = {
//   name: string
//   description: string
//   icon: React.ElementType
//   color: string
// }

// type Issue = {
//   id: string
//   type: IssueType
//   text: string
//   startIndex: number
//   endIndex: number
//   suggestions: string[]
//   explanation: string
// }

// // Sample text for demonstration
// const sampleTexts = [
//   "I have went to the store yesterday and buyed some milk. Its very important to check you're grammar.",
//   "The company announced they're new policy. Their going to implement it next month. Its going to effect everyone.",
//   "The students was very happy with they're grades. The teacher gived them good feedback.",
//   "She dont like apples, she prefer oranges instead. Me and him are going to the park later.",
// ]

// // Issue categories with styling
// const issueCategories: Record<IssueType, IssueCategory> = {
//   grammar: {
//     name: "Grammar",
//     description: "Issues with grammar rules like subject-verb agreement",
//     icon: BookOpen,
//     color: "text-red-500 bg-red-100 dark:bg-red-900/30",
//   },
//   spelling: {
//     name: "Spelling",
//     description: "Misspelled words",
//     icon: Pencil,
//     color: "text-orange-500 bg-orange-100 dark:bg-orange-900/30",
//   },
//   punctuation: {
//     name: "Punctuation",
//     description: "Missing or incorrect punctuation",
//     icon: AlertCircle,
//     color: "text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30",
//   },
//   style: {
//     name: "Style",
//     description: "Suggestions to improve clarity and readability",
//     icon: Sparkles,
//     color: "text-blue-500 bg-blue-100 dark:bg-blue-900/30",
//   },
//   vocabulary: {
//     name: "Vocabulary",
//     description: "Word choice improvements",
//     icon: Lightbulb,
//     color: "text-purple-500 bg-purple-100 dark:bg-purple-900/30",
//   },
// }

// // Common grammar and spelling errors for demonstration
// const commonErrors = [
//   {
//     pattern: /\bhave\s+went\b/gi,
//     replacement: "have gone",
//     type: "grammar",
//     explanation: "Use 'have gone' instead of 'have went'. After 'have', use the past participle form of the verb.",
//   },
//   {
//     pattern: /\bbuyed\b/gi,
//     replacement: "bought",
//     type: "spelling",
//     explanation: "'Bought' is the correct past tense of 'buy'.",
//   },
//   {
//     pattern: /\bits\b(?=\s+(?:very|important|going|a|the|my|your|his|her|their))/gi,
//     replacement: "it's",
//     type: "grammar",
//     explanation: "Use 'it's' (contraction of 'it is') instead of 'its' (possessive).",
//   },
//   {
//     pattern: /\byou're\b(?=\s+(?:grammar|spelling|writing|book|pen|desk))/gi,
//     replacement: "your",
//     type: "grammar",
//     explanation: "Use 'your' (possessive) instead of 'you're' (contraction of 'you are').",
//   },
//   {
//     pattern: /\bthey're\b(?=\s+(?:new|old|big|small|good|bad|policy|book|car))/gi,
//     replacement: "their",
//     type: "grammar",
//     explanation: "Use 'their' (possessive) instead of 'they're' (contraction of 'they are').",
//   },
//   {
//     pattern: /\btheir\b(?=\s+(?:going|trying|working|studying))/gi,
//     replacement: "they're",
//     type: "grammar",
//     explanation: "Use 'they're' (contraction of 'they are') instead of 'their' (possessive).",
//   },
//   {
//     pattern: /\beffect\b(?=\s+(?:everyone|somebody|people|us|them))/gi,
//     replacement: "affect",
//     type: "vocabulary",
//     explanation:
//       "'Affect' is usually a verb meaning 'to influence', while 'effect' is usually a noun meaning 'result'.",
//   },
//   {
//     pattern: /\bwas\b(?=\s+(?:very|really|extremely|quite)\s+(?:happy|sad|angry|excited|nervous)\s+with)/gi,
//     replacement: "were",
//     type: "grammar",
//     explanation: "Use 'were' with plural subjects.",
//   },
//   {
//     pattern: /\bgived\b/gi,
//     replacement: "gave",
//     type: "spelling",
//     explanation: "'Gave' is the correct past tense of 'give'.",
//   },
//   {
//     pattern: /\bdont\b/gi,
//     replacement: "don't",
//     type: "punctuation",
//     explanation: "Use the apostrophe in contractions like 'don't' (do not).",
//   },
//   {
//     pattern: /\bshe\s+prefer\b/gi,
//     replacement: "she prefers",
//     type: "grammar",
//     explanation: "Use 'prefers' with third-person singular subjects (he/she/it).",
//   },
//   {
//     pattern: /\bMe\s+and\s+(?:him|her|them)\b/gi,
//     replacement: "He/She/They and I",
//     type: "style",
//     explanation:
//       "Put the other person first and use the subject pronoun 'I' instead of 'me' when it's the subject of a sentence.",
//   },
//   {
//     pattern: /(?<=[.!?])\s+[a-z]/g,
//     replacement: (match: string) => match.toUpperCase(),
//     type: "punctuation",
//     explanation: "Capitalize the first letter of a sentence.",
//   },
//   { pattern: /\s+,/g, replacement: ",", type: "punctuation", explanation: "Don't put a space before a comma." },
//   { pattern: /,(?!\s)/g, replacement: ", ", type: "punctuation", explanation: "Put a space after a comma." },
// ]

// // Style suggestions for demonstration
// const styleSuggestions = [
//   {
//     pattern: /\bvery\s+(?:good|bad|big|small|happy|sad|angry|important|difficult|easy)/gi,
//     type: "style",
//     getReplacements: (match: string) => {
//       const word = match.split(/\s+/)[1].toLowerCase()
//       const alternatives: Record<string, string[]> = {
//         good: ["excellent", "outstanding", "superb"],
//         bad: ["terrible", "awful", "poor"],
//         big: ["large", "enormous", "substantial"],
//         small: ["tiny", "minute", "compact"],
//         happy: ["delighted", "thrilled", "ecstatic"],
//         sad: ["depressed", "miserable", "gloomy"],
//         angry: ["furious", "enraged", "livid"],
//         important: ["crucial", "essential", "vital"],
//         difficult: ["challenging", "demanding", "arduous"],
//         easy: ["simple", "straightforward", "effortless"],
//       }
//       return alternatives[word] || [word]
//     },
//     explanation: "Consider using more specific and impactful adjectives instead of 'very + adjective'.",
//   },
// ]

// // Vocabulary enhancements for demonstration
// const vocabularyEnhancements = [
//   {
//     pattern: /\bsaid\b/gi,
//     type: "vocabulary",
//     getReplacements: () => ["stated", "mentioned", "noted", "explained", "expressed"],
//     explanation: "Consider using more descriptive alternatives to 'said' to add variety to your writing.",
//   },
//   {
//     pattern: /\bgood\b/gi,
//     type: "vocabulary",
//     getReplacements: () => ["excellent", "superb", "outstanding", "remarkable", "exceptional"],
//     explanation: "Consider using more specific and impactful alternatives to 'good'.",
//   },
//   {
//     pattern: /\bbad\b/gi,
//     type: "vocabulary",
//     getReplacements: () => ["poor", "terrible", "awful", "subpar", "inadequate"],
//     explanation: "Consider using more specific and impactful alternatives to 'bad'.",
//   },
//   {
//     pattern: /\bnice\b/gi,
//     type: "vocabulary",
//     getReplacements: () => ["pleasant", "delightful", "charming", "agreeable", "lovely"],
//     explanation: "Consider using more specific and impactful alternatives to 'nice'.",
//   },
// ]

// export function GrammarChecker() {
//   const [text, setText] = useState("")
//   const [issues, setIssues] = useState<Issue[]>([])
//   const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null)
//   const [stats, setStats] = useState({ wordCount: 0, sentenceCount: 0, readabilityScore: 0 })
//   const [copied, setCopied] = useState(false)
//   const [isClient, setIsClient] = useState(false)
//   const [showSuccess, setShowSuccess] = useState(false)
//   const [lastAction, setLastAction] = useState<string | null>(null)
//   const [activeTab, setActiveTab] = useState<string>("issues")
//   const textareaRef = useRef<HTMLTextAreaElement>(null)

//   useEffect(() => {
//     setIsClient(true)
//   }, [])

//   useEffect(() => {
//     if (text) {
//       analyzeText(text)
//     } else {
//       setIssues([])
//       setStats({ wordCount: 0, sentenceCount: 0, readabilityScore: 0 })
//     }
//   }, [text])

//   const analyzeText = (content: string) => {
//     // Calculate basic stats
//     const words = content.trim() ? content.trim().split(/\s+/).length : 0
//     const sentences = content.split(/[.!?]+/).filter((s) => s.trim().length > 0).length

//     // Simple readability score (higher is better, max 100)
//     const avgWordsPerSentence = sentences > 0 ? words / sentences : 0
//     const readabilityScore = Math.max(0, Math.min(100, 100 - Math.abs(avgWordsPerSentence - 15) * 3))

//     setStats({
//       wordCount: words,
//       sentenceCount: sentences,
//       readabilityScore: Math.round(readabilityScore),
//     })

//     // Find issues
//     const newIssues: Issue[] = []
//     let issueId = 1

//     // Check for common errors
//     commonErrors.forEach((error) => {
//       let match
//       while ((match = error.pattern.exec(content)) !== null) {
//         const startIndex = match.index
//         const endIndex = startIndex + match[0].length
//         const text = match[0]

//         const replacement = typeof error.replacement === "function" ? error.replacement(text) : error.replacement

//         newIssues.push({
//           id: `issue-${issueId++}`,
//           type: error.type as IssueType,
//           text,
//           startIndex,
//           endIndex,
//           suggestions: [replacement],
//           explanation: error.explanation,
//         })
//       }
//     })

//     // Check for style suggestions
//     styleSuggestions.forEach((suggestion) => {
//       let match
//       while ((match = suggestion.pattern.exec(content)) !== null) {
//         const startIndex = match.index
//         const endIndex = startIndex + match[0].length
//         const text = match[0]

//         newIssues.push({
//           id: `issue-${issueId++}`,
//           type: suggestion.type as IssueType,
//           text,
//           startIndex,
//           endIndex,
//           suggestions: suggestion.getReplacements(text),
//           explanation: suggestion.explanation,
//         })
//       }
//     })

//     // Check for vocabulary enhancements
//     vocabularyEnhancements.forEach((enhancement) => {
//       let match
//       while ((match = enhancement.pattern.exec(content)) !== null) {
//         const startIndex = match.index
//         const endIndex = startIndex + match[0].length
//         const text = match[0]

//         newIssues.push({
//           id: `issue-${issueId++}`,
//           type: enhancement.type as IssueType,
//           text,
//           startIndex,
//           endIndex,
//           suggestions: enhancement.getReplacements(),
//           explanation: enhancement.explanation,
//         })
//       }
//     })

//     // Sort issues by their position in the text
//     newIssues.sort((a, b) => a.startIndex - b.startIndex)
//     setIssues(newIssues)
//     setSelectedIssue(null)
//   }

//   const loadSampleText = () => {
//     // Use a more secure random selection if available, otherwise fall back to Math.random
//     let index
//     if (isClient && window.crypto && window.crypto.getRandomValues) {
//       const array = new Uint32Array(1)
//       window.crypto.getRandomValues(array)
//       index = array[0] % sampleTexts.length
//     } else {
//       index = Math.floor(Math.random() * sampleTexts.length)
//     }

//     const randomText = sampleTexts[index]
//     setText(randomText)
//     setLastAction("Loaded sample text")
//     showActionFeedback()
//   }

//   const showActionFeedback = () => {
//     setShowSuccess(true)
//     setTimeout(() => {
//       setShowSuccess(false)
//       setLastAction(null)
//     }, 2000)
//   }

//   const copyFormattedText = async () => {
//     if (!isClient) return

//     try {
//       if (navigator.clipboard) {
//         await navigator.clipboard.writeText(text)
//         setCopied(true)
//         setLastAction("Text copied to clipboard")
//         showActionFeedback()
//         setTimeout(() => setCopied(false), 2000)
//       }
//     } catch (err) {
//       console.error("Failed to copy text: ", err)
//     }
//   }

//   const reset = () => {
//     setText("")
//     setIssues([])
//     setSelectedIssue(null)
//     setLastAction("Text cleared")
//     showActionFeedback()
//   }

//   const applySuggestion = (issue: Issue, suggestion: string) => {
//     const before = text.substring(0, issue.startIndex)
//     const after = text.substring(issue.endIndex)
//     const newText = before + suggestion + after
//     setText(newText)
//     setLastAction(`Applied suggestion: "${suggestion}"`)
//     showActionFeedback()
//   }

//   const selectIssue = (issue: Issue) => {
//     setSelectedIssue(issue)
//     setActiveTab("issues")

//     // Focus and select the text in the textarea
//     if (textareaRef.current) {
//       textareaRef.current.focus()
//       textareaRef.current.setSelectionRange(issue.startIndex, issue.endIndex)
//     }
//   }

//   const getIssuesByType = (type: IssueType) => {
//     return issues.filter((issue) => issue.type === type)
//   }

//   const renderHighlightedText = () => {
//     if (!text.trim()) {
//       return (
//         <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
//           <FileText className="h-12 w-12 mb-2 opacity-50" />
//           <p className="text-sm">No text entered yet</p>
//           <p className="text-xs">Type or paste text above to get started</p>
//         </div>
//       )
//     }

//     if (issues.length === 0) {
//       return (
//         <div className="flex flex-col items-center justify-center py-4">
//           <CheckCircle className="h-8 w-8 mb-2 text-green-500" />
//           <span className="text-muted-foreground text-sm mb-1">No issues found</span>
//           <span className="text-xs text-muted-foreground">Your text looks great!</span>
//         </div>
//       )
//     }

//     // Sort issues by their position in the text to avoid overlap issues
//     const sortedIssues = [...issues].sort((a, b) => a.startIndex - b.startIndex)

//     const parts = []
//     let lastIndex = 0

//     sortedIssues.forEach((issue, index) => {
//       if (issue.startIndex > lastIndex) {
//         parts.push(
//           <span key={`text-${index}`} className="text-foreground whitespace-pre-wrap">
//             {text.slice(lastIndex, issue.startIndex)}
//           </span>,
//         )
//       }

//       const isSelected = selectedIssue?.id === issue.id
//       const category = issueCategories[issue.type]

//       parts.push(
//         <span
//           key={`issue-${issue.id}`}
//           role="button"
//           tabIndex={0}
//           className={`cursor-pointer px-0.5 py-0.5 rounded-sm border-b-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
//             isSelected
//               ? `bg-${category.color.split(" ")[1]} border-${category.color.split(" ")[0]} font-medium`
//               : `border-${category.color.split(" ")[0]} hover:bg-${category.color.split(" ")[1]}/30`
//           }`}
//           onClick={() => selectIssue(issue)}
//           onKeyDown={(e) => {
//             if (e.key === "Enter" || e.key === " ") {
//               e.preventDefault()
//               selectIssue(issue)
//             }
//           }}
//           title={`${category.name} issue: ${issue.explanation}`}
//           aria-label={`${category.name} issue: ${issue.text}. Press Enter to view suggestions.`}
//         >
//           {issue.text}
//         </span>,
//       )

//       lastIndex = issue.endIndex
//     })

//     if (lastIndex < text.length) {
//       parts.push(
//         <span key="text-end" className="text-foreground whitespace-pre-wrap">
//           {text.slice(lastIndex)}
//         </span>,
//       )
//     }

//     return parts
//   }

//   const getReadabilityLevel = () => {
//     if (stats.readabilityScore >= 90) return { label: "Excellent", color: "text-green-500" }
//     if (stats.readabilityScore >= 80) return { label: "Very Good", color: "text-green-400" }
//     if (stats.readabilityScore >= 70) return { label: "Good", color: "text-blue-500" }
//     if (stats.readabilityScore >= 60) return { label: "Fair", color: "text-yellow-500" }
//     if (stats.readabilityScore >= 50) return { label: "Poor", color: "text-orange-500" }
//     return { label: "Needs Improvement", color: "text-red-500" }
//   }

//   const readabilityLevel = getReadabilityLevel()

//   return (
//     <TooltipProvider>
//       <Card className="p-6 border-2 border-border/60 dark:border-border/80 shadow-lg dark:shadow-xl">
//         <div className="mb-6">
//           <div className="bg-purple-200 dark:bg-purple-900/40 p-4 rounded-lg border-2 border-purple-300 dark:border-purple-600 flex items-center justify-between">
//             <div className="flex items-start gap-3">
//               <div className="rounded-full p-2 bg-purple-500 text-white self-center">
//                 <Wand2 className="h-5 w-5" />
//               </div>
//               <div>
//                 <h2 className="text-xl font-semibold text-purple-950 dark:text-white">Grammar Checker</h2>
//                 <p className="text-sm text-purple-900 dark:text-purple-100">
//                   Check your text for grammar, spelling, punctuation, and style issues.
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {showSuccess && lastAction && (
//           <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-md text-green-800 dark:text-green-200 flex items-center gap-2 animate-in slide-in-from-top-2">
//             <CheckCircle className="h-4 w-4" />
//             <span className="text-sm">{lastAction}</span>
//           </div>
//         )}

//         <div className="flex flex-col gap-6">
//           <div className="flex flex-row flex-wrap items-center gap-2">
//             <div className="flex items-center gap-2">
//               <Info className="h-5 w-5 text-muted-foreground" />
//               <span className="font-medium">Grammar & Style Checker</span>
//               <Tooltip>
//                 <TooltipTrigger asChild>
//                   <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
//                 </TooltipTrigger>
//                 <TooltipContent className="max-w-xs">
//                   <p>
//                     This tool checks your text for grammar, spelling, punctuation, and style issues. Click on
//                     highlighted issues to see suggestions.
//                   </p>
//                 </TooltipContent>
//               </Tooltip>
//             </div>
//           </div>

//           <div>
//             <div className="flex items-center justify-between mb-2">
//               <label htmlFor="text-input" className="block text-sm font-medium items-center gap-1">
//                 Enter or paste your text:
//                 <Tooltip>
//                   <TooltipTrigger asChild>
//                     <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
//                   </TooltipTrigger>
//                   <TooltipContent>
//                     <p>Paste or type text to check for grammar and style issues</p>
//                   </TooltipContent>
//                 </Tooltip>
//               </label>
//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={loadSampleText}
//                 className="text-xs hover:bg-muted/50 transition-colors"
//               >
//                 <Zap className="h-3 w-3 mr-1" />
//                 Load Sample
//               </Button>
//             </div>
//             <Textarea
//               id="text-input"
//               ref={textareaRef}
//               value={text}
//               onChange={(e) => setText(e.target.value)}
//               placeholder="Type or paste text to check for grammar, spelling, and style issues..."
//               className="min-h-[150px] text-base resize-y transition-all focus:ring-2 focus:ring-purple-500"
//             />
//             <div className="flex items-center justify-between mt-2">
//               <p className="text-xs text-muted-foreground">
//                 Type or paste your text above. Issues will be highlighted in the preview below.
//               </p>
//               {text.length > 0 && (
//                 <Button
//                   variant="ghost"
//                   size="sm"
//                   onClick={reset}
//                   className="text-xs text-muted-foreground hover:text-foreground"
//                 >
//                   Clear
//                 </Button>
//               )}
//             </div>
//           </div>

//           <div className="flex items-center gap-2 flex-wrap">
//             <Badge variant="outline" className="flex items-center gap-1">
//               <FileText className="h-3 w-3" />
//               {stats.wordCount} words
//             </Badge>
//             <Badge variant="outline" className="flex items-center gap-1">
//               <Info className="h-3 w-3" />
//               {stats.sentenceCount} sentences
//             </Badge>
//             <Tooltip>
//               <TooltipTrigger asChild>
//                 <Badge variant="outline" className={`flex items-center gap-1 ${readabilityLevel.color}`}>
//                   <Sparkles className="h-3 w-3" />
//                   Readability: {readabilityLevel.label} ({stats.readabilityScore}/100)
//                 </Badge>
//               </TooltipTrigger>
//               <TooltipContent>
//                 <p>Based on sentence length and structure. Higher scores indicate better readability.</p>
//               </TooltipContent>
//             </Tooltip>
//             <span className="text-sm text-muted-foreground ml-auto">
//               {issues.length} {issues.length === 1 ? "issue" : "issues"} found
//             </span>
//           </div>

//           <Tabs defaultValue="preview" className="w-full" onValueChange={setActiveTab} value={activeTab}>
//             <TabsList className="grid grid-cols-2 mb-4">
//               <TabsTrigger value="preview" className="flex items-center gap-2">
//                 <FileText className="h-4 w-4" />
//                 Text Preview
//               </TabsTrigger>
//               <TabsTrigger value="issues" className="flex items-center gap-2">
//                 <AlertCircle className="h-4 w-4" />
//                 Issues {issues.length > 0 && `(${issues.length})`}
//               </TabsTrigger>
//             </TabsList>

//             <TabsContent value="preview" className="space-y-4">
//               <div className="p-6 bg-card border-2 border-border/60 dark:border-border/80 rounded-lg min-h-[120px] text-base leading-relaxed shadow-sm transition-all hover:shadow-md">
//                 {renderHighlightedText()}
//               </div>

//               {issues.length > 0 && (
//                 <div className="mt-4 p-4 bg-secondary/50 border-2 border-secondary-foreground/20 dark:border-secondary-foreground/30 rounded-lg">
//                   <p className="text-sm text-secondary-foreground font-medium mb-2 flex items-center gap-2">
//                     <Info className="h-4 w-4" />
//                     How to use:
//                   </p>
//                   <ul className="text-sm text-secondary-foreground/80 space-y-1">
//                     <li>• Click on any highlighted issue to see suggestions</li>
//                     <li>• Different colors represent different types of issues:</li>
//                     <div className="grid grid-cols-2 gap-2 mt-2">
//                       {Object.entries(issueCategories).map(([type, category]) => (
//                         <div key={type} className="flex items-center gap-2">
//                           <span className={`px-2 py-0.5 rounded text-xs font-medium ${category.color}`}>
//                             {React.createElement(category.icon, { className: "h-3 w-3 inline-block mr-1" })}
//                             {category.name}
//                           </span>
//                         </div>
//                       ))}
//                     </div>
//                   </ul>
//                 </div>
//               )}
//             </TabsContent>

//             <TabsContent value="issues" className="space-y-4">
//               {issues.length === 0 ? (
//                 <div className="flex flex-col items-center justify-center py-8 text-muted-foreground border border-border/30 dark:border-border/50 rounded-lg bg-muted/20">
//                   <CheckCircle className="h-12 w-12 mb-4 text-green-500" />
//                   <p className="text-lg font-medium mb-2">No issues found</p>
//                   <p className="text-sm">Your text looks great! No grammar, spelling, or style issues detected.</p>
//                 </div>
//               ) : (
//                 <div className="space-y-4">
//                   {selectedIssue ? (
//                     <div className="p-4 border-2 border-border/60 dark:border-border/80 rounded-lg">
//                       <div className="flex items-center justify-between mb-4">
//                         <div className="flex items-center gap-2">
//                           <span
//                             className={`px-2 py-1 rounded text-xs font-medium ${issueCategories[selectedIssue.type].color}`}
//                           >
//                             {React.createElement(issueCategories[selectedIssue.type].icon, { className: "h-3 w-3 inline-block mr-1" })}
//                             {issueCategories[selectedIssue.type].name}
//                           </span>
//                           <h3 className="font-medium">Issue with: "{selectedIssue.text}"</h3>
//                         </div>
//                         <Button variant="ghost" size="sm" onClick={() => setSelectedIssue(null)} className="text-xs">
//                           Back to all issues
//                         </Button>
//                       </div>

//                       <div className="mb-4 p-3 bg-muted/30 rounded-lg">
//                         <p className="text-sm">{selectedIssue.explanation}</p>
//                       </div>

//                       <div className="space-y-2">
//                         <h4 className="text-sm font-medium">Suggestions:</h4>
//                         <div className="flex flex-wrap gap-2">
//                           {selectedIssue.suggestions.map((suggestion, i) => (
//                             <Button
//                               key={i}
//                               variant="outline"
//                               size="sm"
//                               onClick={() => applySuggestion(selectedIssue, suggestion)}
//                               className="flex items-center gap-1 hover:bg-muted/50 transition-colors"
//                             >
//                               <ArrowRight className="h-3 w-3" />
//                               {suggestion}
//                             </Button>
//                           ))}
//                         </div>
//                       </div>
//                     </div>
//                   ) : (
//                     <div className="space-y-4">
//                       {Object.entries(issueCategories).map(([type, category]) => {
//                         const typeIssues = getIssuesByType(type as IssueType)
//                         if (typeIssues.length === 0) return null

//                         return (
//                           <div key={type} className="space-y-2">
//                             <h3
//                               className={`text-sm font-medium flex items-center gap-2 ${category.color.split(" ")[0]}`}
//                             >
//                               {React.createElement(category.icon, { className: "h-4 w-4" })}
//                               {category.name} Issues ({typeIssues.length})
//                             </h3>
//                             <div className="space-y-2">
//                               {typeIssues.map((issue) => (
//                                 <div
//                                   key={issue.id}
//                                   className="p-3 bg-muted/30 border border-border/40 dark:border-border/60 rounded-lg hover:bg-muted/40 transition-colors cursor-pointer"
//                                   onClick={() => selectIssue(issue)}
//                                   role="button"
//                                   tabIndex={0}
//                                   onKeyDown={(e) => {
//                                     if (e.key === "Enter" || e.key === " ") {
//                                       e.preventDefault()
//                                       selectIssue(issue)
//                                     }
//                                   }}
//                                 >
//                                   <div className="flex items-center justify-between">
//                                     <p className="font-medium">"{issue.text}"</p>
//                                     <Badge variant="outline" className="text-xs">
//                                       {issue.suggestions.length}{" "}
//                                       {issue.suggestions.length === 1 ? "suggestion" : "suggestions"}
//                                     </Badge>
//                                   </div>
//                                   <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{issue.explanation}</p>
//                                 </div>
//                               ))}
//                             </div>
//                           </div>
//                         )
//                       })}
//                     </div>
//                   )}
//                 </div>
//               )}
//             </TabsContent>
//           </Tabs>

//           <div className="grid grid-cols-2 gap-4">
//             <Tooltip>
//               <TooltipTrigger asChild>
//                 <Button
//                   onClick={copyFormattedText}
//                   variant="outline"
//                   className="flex items-center justify-center hover:bg-muted/50 transition-colors"
//                 >
//                   {copied ? (
//                     <>
//                       <Check className="h-4 w-4 mr-2" />
//                       Copied!
//                     </>
//                   ) : (
//                     <>
//                       <Copy className="h-4 w-4 mr-2" />
//                       Copy Text
//                     </>
//                   )}
//                 </Button>
//               </TooltipTrigger>
//               <TooltipContent>
//                 <p>Copy the current text to clipboard</p>
//               </TooltipContent>
//             </Tooltip>

//             <Tooltip>
//               <TooltipTrigger asChild>
//                 <Button
//                   variant="ghost"
//                   onClick={reset}
//                   className="text-muted-foreground flex items-center justify-center hover:text-foreground hover:bg-muted/50 transition-colors"
//                 >
//                   <RotateCcw className="h-4 w-4 mr-2" />
//                   Clear Text
//                 </Button>
//               </TooltipTrigger>
//               <TooltipContent>
//                 <p>Clear the current text</p>
//               </TooltipContent>
//             </Tooltip>
//           </div>
//         </div>
//       </Card>
//     </TooltipProvider>
//   )
// }
