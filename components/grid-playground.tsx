"use client"

import { useState, useCallback, useReducer } from "react"
import {
  DndContext,
  type DragEndEvent,
  type DragStartEvent,
  type DragMoveEvent,
  useSensor,
  useSensors,
  MouseSensor,
  TouchSensor,
} from "@dnd-kit/core"
import { generateLayout } from "@/lib/layout-generator"
import { GridOverlay } from "./grid-overlay"
import { GridBlock } from "./grid-block"
import { GridHeader } from "./grid-header"
import { GridSelectionArea, GridSelectionBox } from "./grid-selection-area"
import { Toolbar } from "./toolbar"
import { CodePanel } from "./code-panel"
import { GridSettings } from "./grid-settings"
import { nanoid } from "nanoid"
import { usePersistentState } from "@/hooks/use-persistent-state"

export interface Block {
  id: string
  colStart: number
  colSpan: number
  rowStart: number
  rowSpan: number
  color: string
}

export interface GridConfig {
  columns: number
  rows: number
  gutter: number // gap in Tailwind scale (0, 1, 2, 3, 4, 5, 6, 8, 10, 12)
}

const COLORS = [
  "bg-blue-500/20 border-blue-500/50",
  "bg-emerald-500/20 border-emerald-500/50",
  "bg-amber-500/20 border-amber-500/50",
  "bg-rose-500/20 border-rose-500/50",
  "bg-violet-500/20 border-violet-500/50",
  "bg-cyan-500/20 border-cyan-500/50",
]

type PanelState = {
  showCode: boolean
  showSettings: boolean
}

type PanelAction = { type: "TOGGLE_CODE" } | { type: "TOGGLE_SETTINGS" } | { type: "CLOSE_ALL" }

function panelReducer(state: PanelState, action: PanelAction): PanelState {
  switch (action.type) {
    case "TOGGLE_CODE":
      return {
        showCode: !state.showCode,
        showSettings: false,
      }
    case "TOGGLE_SETTINGS":
      return {
        showSettings: !state.showSettings,
        showCode: false,
      }
    case "CLOSE_ALL":
      return {
        showCode: false,
        showSettings: false,
      }
    default:
      return state
  }
}

export function GridPlayground() {
  const [gridConfig, setGridConfig] = usePersistentState<GridConfig>("gridConfig", {
    columns: 12,
    rows: 6,
    gutter: 0,
  })

  const [blocks, setBlocks] = usePersistentState<Block[]>("gridBlocks", [
    { id: "1", colStart: 1, colSpan: 3, rowStart: 1, rowSpan: 2, color: COLORS[0] },
    { id: "2", colStart: 5, colSpan: 4, rowStart: 3, rowSpan: 3, color: COLORS[1] },
  ])
  const [selectedBlockIds, setSelectedBlockIds] = useState<string[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [dragDelta, setDragDelta] = useState<{ x: number; y: number } | null>(null)
  
  const [{ showCode, showSettings }, dispatchPanel] = useReducer(panelReducer, {
    showCode: false,
    showSettings: true,
  })

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 5, // Reduced from 10 for faster response
    },
  })

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 100, // Reduced from 150 for faster response
      tolerance: 5,
    },
  })

  const sensors = useSensors(mouseSensor, touchSensor)

  const addBlock = useCallback(() => {
    // Default size for new blocks
    const newColSpan = 2
    const newRowSpan = 2

    // Helper to check if a specific position overlaps with any existing block
    const checkOverlap = (col: number, row: number, colSpan: number, rowSpan: number) => {
      // Check if out of bounds
      if (col + colSpan - 1 > gridConfig.columns || row + rowSpan - 1 > gridConfig.rows) {
        return true
      }

      return blocks.some((block) => {
        const xOverlap = Math.max(col, block.colStart) <= Math.min(col + colSpan - 1, block.colStart + block.colSpan - 1)
        const yOverlap = Math.max(row, block.rowStart) <= Math.min(row + rowSpan - 1, block.rowStart + block.rowSpan - 1)
        return xOverlap && yOverlap
      })
    }

    // Find first available position
    let foundPos = null
    // Iterate row by row, then col by col
    for (let r = 1; r <= gridConfig.rows; r++) {
      for (let c = 1; c <= gridConfig.columns; c++) {
        if (!checkOverlap(c, r, newColSpan, newRowSpan)) {
          foundPos = { col: c, row: r }
          break
        }
      }
      if (foundPos) break
    }

    if (!foundPos) {
      foundPos = { col: 1, row: 1 }
    }

    const newBlock: Block = {
      id: nanoid(),
      colStart: foundPos.col,
      colSpan: newColSpan,
      rowStart: foundPos.row,
      rowSpan: newRowSpan,
      color: COLORS[blocks.length % COLORS.length],
    }
    setBlocks((prev) => [...prev, newBlock])
    setSelectedBlockIds([newBlock.id])
  }, [blocks, gridConfig])

  const deleteBlock = useCallback((ids: string[]) => {
    setBlocks((prev) => prev.filter((b) => !ids.includes(b.id)))
    setSelectedBlockIds((prev) => prev.filter((id) => !ids.includes(id)))
  }, [])

  const updateBlock = useCallback(
    (id: string, updates: Partial<Block>) => {
      setBlocks((prev) =>
        prev.map((b) => {
          if (b.id !== id) return b
          const updated = { ...b, ...updates }
          // Clamp values to grid bounds
          updated.colStart = Math.max(1, Math.min(gridConfig.columns, updated.colStart))
          updated.rowStart = Math.max(1, Math.min(gridConfig.rows, updated.rowStart))
          updated.colSpan = Math.max(1, Math.min(gridConfig.columns - updated.colStart + 1, updated.colSpan))
          updated.rowSpan = Math.max(1, Math.min(gridConfig.rows - updated.rowStart + 1, updated.rowSpan))
          return updated
        }),
      )
    },
    [gridConfig],
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
    if (!selectedBlockIds.includes(event.active.id as string)) {
      setSelectedBlockIds([event.active.id as string])
    }
  }

  const handleDragMove = (event: DragMoveEvent) => {
    setDragDelta(event.delta)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { delta } = event

    const gridElement = document.getElementById("grid-container")
    if (!gridElement) return

    const cellWidth = gridElement.offsetWidth / gridConfig.columns
    const cellHeight = gridElement.offsetHeight / gridConfig.rows

    const colDelta = Math.round(delta.x / cellWidth)
    const rowDelta = Math.round(delta.y / cellHeight)

    // Apply delta to ALL selected blocks
    setBlocks((prevBlocks) => {
       const newBlocks = [...prevBlocks]
       
       selectedBlockIds.forEach(id => {
         const blockIndex = newBlocks.findIndex(b => b.id === id)
         if (blockIndex === -1) return
         
         const block = newBlocks[blockIndex]
         const newColStart = Math.max(1, Math.min(gridConfig.columns - block.colSpan + 1, block.colStart + colDelta))
         const newRowStart = Math.max(1, Math.min(gridConfig.rows - block.rowSpan + 1, block.rowStart + rowDelta))
         
         newBlocks[blockIndex] = {
           ...block,
           colStart: newColStart,
           rowStart: newRowStart
         }
       })
       
       return newBlocks
    })
    
    setActiveId(null)
    setDragDelta(null)
  }

  const clearAll = useCallback(() => {
    setBlocks([])
    setSelectedBlockIds([])
  }, [])

  const handleGenerate = useCallback(() => {
    const newBlocks = generateLayout(gridConfig, COLORS)
    setBlocks(newBlocks)
    setSelectedBlockIds([])
  }, [gridConfig])

  const getGutterClass = (gutter: number) => {
    const gutterMap: Record<number, string> = {
      0: "gap-0",
      1: "gap-1",
      2: "gap-2",
      3: "gap-3",
      4: "gap-4",
      5: "gap-5",
      6: "gap-6",
      8: "gap-8",
      10: "gap-10",
      12: "gap-12",
    }
    return gutterMap[gutter] || "gap-0"
  }


  return (
    <div className="flex flex-col h-screen bg-background">
      <GridHeader
        gridConfig={gridConfig}
        showSettings={showSettings}
        showCode={showCode}
        onToggleSettings={() => dispatchPanel({ type: "TOGGLE_SETTINGS" })}
        onToggleCode={() => dispatchPanel({ type: "TOGGLE_CODE" })}
      />

      <div className="flex flex-1 overflow-hidden relative">
        <div className="flex-1 flex flex-col overflow-hidden">
          <Toolbar
            onAddBlock={addBlock}
            onClearAll={clearAll}
            onGenerate={handleGenerate}
            selectedBlocks={blocks.filter((b) => selectedBlockIds.includes(b.id))}
            onUpdateBlock={updateBlock}
            onDeleteBlocks={(ids) => deleteBlock(ids)}
            gridConfig={gridConfig}
          />

          <GridSelectionArea
            className="flex-1 p-3 md:p-6 flex items-center justify-center overflow-hidden" 
            blocks={blocks}
            selectedBlockIds={selectedBlockIds}
            setSelectedBlockIds={setSelectedBlockIds}
          >
            <DndContext sensors={sensors} onDragStart={handleDragStart} onDragMove={handleDragMove} onDragEnd={handleDragEnd}>
              <div
                id="grid-container"
                className="relative bg-card rounded-lg border border-border shadow-sm mx-auto"
                style={{
                  aspectRatio: `${gridConfig.columns} / ${gridConfig.rows}`,
                  height: "min(100%, 100vw)", // Fallback relative sizing
                  width: "auto",
                  maxHeight: "100%",
                  maxWidth: "100%",
                }}
              >
                <GridOverlay config={gridConfig} />
                <div
                  className={`absolute inset-0 p-px ${getGutterClass(gridConfig.gutter)}`}
                  style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${gridConfig.columns}, 1fr)`,
                    gridTemplateRows: `repeat(${gridConfig.rows}, 1fr)`,
                  }}
                >
                  {blocks.map((block) => (
                    <GridBlock
                      key={block.id}
                      block={block}
                      isSelected={selectedBlockIds.includes(block.id)}
                      onSelect={(e) => {
                        if (e.shiftKey || e.metaKey || e.ctrlKey) {
                          if (selectedBlockIds.includes(block.id)) {
                            setSelectedBlockIds(prev => prev.filter(id => id !== block.id))
                          } else {
                            setSelectedBlockIds(prev => [...prev, block.id])
                          }
                        } else {
                          setSelectedBlockIds([block.id])
                        }
                      }}
                      onUpdateBlock={updateBlock}
                      isDragging={activeId === block.id}
                      dragTransform={
                        selectedBlockIds.includes(block.id) && 
                        activeId && 
                        selectedBlockIds.includes(activeId) && 
                        activeId !== block.id 
                          ? dragDelta 
                          : null
                      }
                      gridConfig={gridConfig}
                    />
                  ))}
                  <GridSelectionBox />
                </div>
              </div>
            </DndContext>
          </GridSelectionArea>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <>
            <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => dispatchPanel({ type: "CLOSE_ALL" })} />
            <GridSettings config={gridConfig} onConfigChange={setGridConfig} onClose={() => dispatchPanel({ type: "CLOSE_ALL" })} />
          </>
        )}

        {/* Code Panel */}
        {showCode && (
          <>
            <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => dispatchPanel({ type: "CLOSE_ALL" })} />
            <CodePanel
              blocks={blocks}
              onClose={() => dispatchPanel({ type: "CLOSE_ALL" })}
              gridConfig={gridConfig}
            />
          </>
        )}
      </div>
    </div>
  )
}
