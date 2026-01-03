"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import type { Block } from "./grid-playground"

interface SelectionBox {
  startX: number
  startY: number
  currentX: number
  currentY: number
}

interface SelectionContextType {
  selectionBox: SelectionBox | null
}

const SelectionContext = createContext<SelectionContextType | null>(null)

export function useSelection() {
  const context = useContext(SelectionContext)
  if (!context) {
    throw new Error("useSelection must be used within a GridSelectionArea")
  }
  return context
}

interface GridSelectionAreaProps {
  children: ReactNode
  blocks: Block[]
  selectedBlockIds: string[]
  setSelectedBlockIds: (ids: string[] | ((prev: string[]) => string[])) => void
  className?: string
}

export function GridSelectionArea({
  children,
  blocks,
  selectedBlockIds,
  setSelectedBlockIds,
  className,
}: GridSelectionAreaProps) {
  const [isSelecting, setIsSelecting] = useState(false)
  const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null)

  const handlePointerDown = (e: React.PointerEvent) => {
    // Only start selection if clicking on the background (not a block or resize handle)
    if ((e.target as HTMLElement).closest("[data-block-id]")) return

    const gridElement = document.getElementById("grid-container")
    if (!gridElement) return

    const gridRect = gridElement.getBoundingClientRect()
    const x = e.clientX - gridRect.left
    const y = e.clientY - gridRect.top

    setIsSelecting(true)
    setSelectionBox({ startX: x, startY: y, currentX: x, currentY: y })
    if (!e.shiftKey && !e.metaKey && !e.ctrlKey) {
      setSelectedBlockIds([])
    }
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isSelecting || !selectionBox) return

    const gridElement = document.getElementById("grid-container")
    if (!gridElement) return

    const gridRect = gridElement.getBoundingClientRect()
    const x = e.clientX - gridRect.left
    const y = e.clientY - gridRect.top

    setSelectionBox((prev) => (prev ? { ...prev, currentX: x, currentY: y } : null))
  }

  const handlePointerUp = () => {
    if (isSelecting && selectionBox) {
      const gridElement = document.getElementById("grid-container")
      if (gridElement) {
        // Normalize selection box rectangle
        const x1 = Math.min(selectionBox.startX, selectionBox.currentX)
        const y1 = Math.min(selectionBox.startY, selectionBox.currentY)
        const x2 = Math.max(selectionBox.startX, selectionBox.currentX)
        const y2 = Math.max(selectionBox.startY, selectionBox.currentY)

        // Find intersecting blocks
        const newSelectedIds = blocks
          .filter((block) => {
            const blockElement = document.querySelector(`[data-block-id="${block.id}"]`)
            if (!blockElement) return false

            // Get block position relative to grid
            const blockRect = blockElement.getBoundingClientRect()
            const gridRect = gridElement.getBoundingClientRect()

            const blockLeft = blockRect.left - gridRect.left
            const blockTop = blockRect.top - gridRect.top
            const blockRight = blockLeft + blockRect.width
            const blockBottom = blockTop + blockRect.height

            // Check intersection
            return x1 < blockRight && x2 > blockLeft && y1 < blockBottom && y2 > blockTop
          })
          .map((b) => b.id)

        setSelectedBlockIds((prev) => Array.from(new Set([...prev, ...newSelectedIds])))
      }
    }
    setIsSelecting(false)
    setSelectionBox(null)
  }

  const handlePointerLeave = () => {
    if (isSelecting) {
      setIsSelecting(false)
      setSelectionBox(null)
    }
  }

  return (
    <SelectionContext.Provider value={{ selectionBox }}>
      <div
        className={className}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
      >
        {children}
      </div>
    </SelectionContext.Provider>
  )
}

export function GridSelectionBox() {
  const { selectionBox } = useSelection()

  if (!selectionBox) return null

  return (
    <div
      className="absolute border bg-primary/20 border-primary pointer-events-none z-50"
      style={{
        left: Math.min(selectionBox.startX, selectionBox.currentX),
        top: Math.min(selectionBox.startY, selectionBox.currentY),
        width: Math.abs(selectionBox.currentX - selectionBox.startX),
        height: Math.abs(selectionBox.currentY - selectionBox.startY),
      }}
    />
  )
}
