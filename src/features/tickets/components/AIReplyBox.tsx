import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from '@/lib/utils'
import { TiptapEditor } from '@/components/ui/tiptap-editor'
import { type TiptapContent } from '@/lib/tiptap'
import { Loader2, ChevronDown } from 'lucide-react'

const emptyTiptapContent: TiptapContent = {
  type: 'doc',
  content: []
}

interface AIReplyBoxProps {
  isGenerating: boolean
  onGenerateResponse: () => void
  onGenerateCustomResponse: (prompt: string) => void
  onGeneratePromptWithContext: (prompt: string) => void
  onEditResponse: (prompt: string) => void
  onEditResponseWithContext: (prompt: string) => void
  generatedContent: TiptapContent
  setGeneratedContent: (content: TiptapContent) => void
  onUseResponse: () => void
}

export function AIReplyBox({ 
  isGenerating, 
  onGenerateResponse, 
  onGenerateCustomResponse,
  onGeneratePromptWithContext,
  onEditResponse,
  onEditResponseWithContext,
  generatedContent,
  setGeneratedContent,
  onUseResponse 
}: AIReplyBoxProps) {
  const [promptContent, setPromptContent] = useState<TiptapContent>(emptyTiptapContent)

  const handlePromptChange = (content: TiptapContent) => {
    setPromptContent(content)
  }

  // Extract plain text from TipTap content for the API calls
  const getPromptText = () => {
    return promptContent.content
      .map(node => node.content?.map(child => child.text || '').join('') || '')
      .join('\n')
      .trim()
  }

  return (
    <div className="w-[36rem] border-r border-border/50 bg-background p-6 flex flex-col">
      <div className="flex items-center mb-4">
        <h2 className="text-lg font-semibold">AI Reply Assistant</h2>
      </div>
      
      <div className="flex-1 space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Custom Prompt</label>
          <TiptapEditor
            content={promptContent}
            onChange={handlePromptChange}
            placeholder="Enter a custom prompt to guide the AI response..."
            className="min-h-[100px] border-secondary dark:border-secondary-dark"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Generated Response</label>
          <TiptapEditor
            content={generatedContent}
            onChange={setGeneratedContent}
            placeholder={isGenerating ? "AI is generating a response..." : "Generated response will appear here. You can edit it after generation."}
            className="min-h-[300px] mb-2 border-secondary dark:border-secondary-dark"
          />
          <div className="flex justify-between items-center gap-2">
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                onClick={onGenerateResponse}
                disabled={isGenerating}
                className={cn(
                  "border-border/50 text-foreground",
                  "hover:bg-primary/10 hover:text-primary",
                  "focus:ring-primary",
                  "bg-background-alt",
                  isGenerating && "opacity-50"
                )}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Auto Generate Response'
                )}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    disabled={isGenerating || !getPromptText()}
                    className={cn(
                      "border-border/50 text-foreground",
                      "hover:bg-primary/10 hover:text-primary",
                      "focus:ring-primary",
                      "bg-background-alt",
                      (isGenerating || !getPromptText()) && "opacity-50"
                    )}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        Generate Response from Prompt
                        <ChevronDown className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem 
                    onClick={() => onGenerateCustomResponse(getPromptText())}
                    disabled={isGenerating || !getPromptText()}
                  >
                    Without Message Context
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onGeneratePromptWithContext(getPromptText())}
                    disabled={isGenerating || !getPromptText()}
                  >
                    With Message Context
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    disabled={isGenerating || !getPromptText() || !generatedContent.content.length}
                    className={cn(
                      "border-border/50 text-foreground",
                      "hover:bg-primary/10 hover:text-primary",
                      "focus:ring-primary",
                      "bg-background-alt",
                      (isGenerating || !getPromptText() || !generatedContent.content.length) && "opacity-50"
                    )}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        Edit Generated Response from Prompt
                        <ChevronDown className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem 
                    onClick={() => onEditResponse(getPromptText())}
                    disabled={isGenerating || !getPromptText() || !generatedContent.content.length}
                  >
                    Without Message Context
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onEditResponseWithContext(getPromptText())}
                    disabled={isGenerating || !getPromptText() || !generatedContent.content.length}
                  >
                    With Message Context
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 justify-end mt-4">
        <Button 
          onClick={onUseResponse}
          disabled={!generatedContent.content.length || isGenerating}
        >
          Use Response
        </Button>
      </div>
    </div>
  )
} 