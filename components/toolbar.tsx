"use client"

import type { Block, GridConfig } from "./grid-playground"
import { Plus, Trash2, Settings2, Shuffle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { EditBlock } from "./edit-block"

interface ToolbarProps {
  onAddBlock: () => void
  onClearAll: () => void
  onGenerate: () => void
  selectedBlocks: Block[]
  onUpdateBlock: (id: string, updates: Partial<Block>) => void
  onDeleteBlocks: (ids: string[]) => void
  gridConfig: GridConfig
}

export function Toolbar({
  onAddBlock,
  onClearAll,
  onGenerate,
  selectedBlocks,
  onUpdateBlock,
  onDeleteBlocks,
  gridConfig,
}: ToolbarProps) {
  const [showControls, setShowControls] = useState(false)

  const selectedBlock = selectedBlocks.length === 1 ? selectedBlocks[0] : null
  const isMultiSelect = selectedBlocks.length > 1

  const handleDelete = (id: string) => {
    onDeleteBlocks([id])
  }

  const commonProps = selectedBlock ? {
    selectedBlock,
    gridConfig,
    onUpdateBlock,
    onDeleteBlock: handleDelete,
    onClose: () => setShowControls(false),
  } : null

  return (
    <>
      <div className="border-b border-border px-4 py-3 md:px-6">
        <div className="flex items-center gap-2 md:gap-3">
          {/* Actions - always visible */}
          <Button onClick={onAddBlock} size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Block</span>
          </Button>
          <Button
            onClick={onClearAll}
            variant="outline"
            size="sm"
            className="gap-1.5 bg-transparent"
          >
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline">Clear</span>
          </Button>
          <Button
            onClick={onGenerate}
            variant="outline"
            size="sm"
            className="gap-1.5 bg-transparent"
          >
            <Shuffle className="h-4 w-4" />
            <span className="hidden sm:inline">Randomize</span>
          </Button>

          {selectedBlocks.length > 0 && (
            <div className="ml-auto flex items-center gap-2 md:gap-3">
              <Button
                onClick={() => setShowControls(true)}
                variant="secondary"
                size="sm"
                disabled={isMultiSelect}
                className="gap-1.5"
              >
                <Settings2 className="h-4 w-4" />
                <span className="hidden sm:inline">Edit</span>
              </Button>
              <Button
                onClick={() => onDeleteBlocks(selectedBlocks.map((b) => b.id))}
                variant="destructive"
                size="sm"
                className="gap-1.5"
              >
                <Trash2 className="h-4 w-4" />
                <span className="hidden sm:inline">Delete {isMultiSelect ? `(${selectedBlocks.length})` : ""}</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      {showControls && commonProps && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowControls(false)} />
          <EditBlock {...commonProps} />
        </>
      )}
    </>
  )
}

