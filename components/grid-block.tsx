"use client"

import type React from "react"

import { useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import type { Block, GridConfig } from "./grid-playground"
import { useState, useCallback, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

interface GridBlockProps {
  block: Block
  isSelected: boolean
  onSelect: (e: React.MouseEvent) => void
  onUpdateBlock: (id: string, updates: Partial<Block>) => void
  isDragging: boolean
  dropTransform?: { x: number; y: number }
  dragTransform?: { x: number; y: number } | null
  gridConfig: GridConfig
}

type ResizeCorner = "nw" | "ne" | "sw" | "se"

const ResizeHandle = ({
  corner,
  ...props
}: {
  corner: ResizeCorner
} & React.HTMLAttributes<HTMLDivElement>) => {
  const positionClasses = {
    nw: "top-0 left-0 cursor-nw-resize items-start justify-start",
    ne: "top-0 right-0 cursor-ne-resize items-start justify-end",
    sw: "bottom-0 left-0 cursor-sw-resize items-end justify-start",
    se: "bottom-0 right-0 cursor-se-resize items-end justify-end",
  }

  const iconRotation = {
    nw: "rotate-180",
    ne: "-rotate-90",
    sw: "rotate-90",
    se: "",
  }

  return (
    <div
      className={cn(
        "absolute w-10 h-10 md:w-6 md:h-6 flex p-1.5 select-none z-10",
        positionClasses[corner]
      )}
      style={{ touchAction: "none" }}
      {...props}
    >
      <svg
        className={cn("w-5 h-5 md:w-3 md:h-3 text-foreground", iconRotation[corner])}
        viewBox="0 0 16 16"
        fill="currentColor"
      >
        <path d="M14 14H12V12H14V14ZM14 10H12V8H14V10ZM10 14H8V12H10V14Z" />
      </svg>
    </div>
  )
}

export function GridBlock({
  block,
  isSelected,
  onSelect,
  onUpdateBlock,
  isDragging,
  dropTransform,
  dragTransform,
  gridConfig,
}: GridBlockProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: block.id,
  })

  const isResizingRef = useRef(false)
  const [isResizing, setIsResizing] = useState(false)
  const [tempResize, setTempResize] = useState<{ width: number; height: number; x: number; y: number } | null>(null)
  const resizeRef = useRef<{
    startX: number
    startY: number
    startColSpan: number
    startRowSpan: number
    startColStart: number
    startRowStart: number
    corner: ResizeCorner
    startWidth: number
    startHeight: number
    startOffsetX: number
    startOffsetY: number
  } | null>(null)

  const activeTransform = isDragging
    ? transform
    : dragTransform 
      ? { x: dragTransform.x, y: dragTransform.y, scaleX: 1, scaleY: 1 }
      : dropTransform
        ? { x: dropTransform.x, y: dropTransform.y, scaleX: 1, scaleY: 1 }
        : null

  const style = {
    gridColumn: `${block.colStart} / span ${block.colSpan}`,
    gridRow: `${block.rowStart} / span ${block.rowSpan}`,
    transform: activeTransform ? CSS.Translate.toString(activeTransform) : undefined,
    transition: dropTransform ? "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)" : "none",
    zIndex: isDragging || isSelected || isResizing ? 10 : 1,
  }

  const tempResizeStyle = tempResize
    ? {
        position: "absolute" as const,
        left: `${tempResize.x}px`,
        top: `${tempResize.y}px`,
        width: `${tempResize.width}px`,
        height: `${tempResize.height}px`,
        pointerEvents: "none" as const,
        zIndex: 20,
      }
    : undefined

  const startResize = useCallback(
    (clientX: number, clientY: number, corner: ResizeCorner) => {
      const gridElement = document.getElementById("grid-container")
      if (!gridElement) return

      const blockElement = document.querySelector(`[data-block-id="${block.id}"]`) as HTMLElement
      if (!blockElement) return

      const rect = blockElement.getBoundingClientRect()
      const containerRect = gridElement.getBoundingClientRect()

      isResizingRef.current = true
      setIsResizing(true)
      resizeRef.current = {
        startX: clientX,
        startY: clientY,
        startColSpan: block.colSpan,
        startRowSpan: block.rowSpan,
        startColStart: block.colStart,
        startRowStart: block.rowStart,
        corner,
        startWidth: rect.width,
        startHeight: rect.height,
        startOffsetX: rect.left - containerRect.left,
        startOffsetY: rect.top - containerRect.top,
      }

      setTempResize({
        width: rect.width,
        height: rect.height,
        x: rect.left - containerRect.left,
        y: rect.top - containerRect.top,
      })
    },
    [block.colSpan, block.rowSpan, block.colStart, block.rowStart, block.id],
  )

  const handleResizeMove = useCallback((clientX: number, clientY: number) => {
    if (!isResizingRef.current || !resizeRef.current) return

    const deltaX = clientX - resizeRef.current.startX
    const deltaY = clientY - resizeRef.current.startY

    let newWidth = resizeRef.current.startWidth
    let newHeight = resizeRef.current.startHeight
    let newX = resizeRef.current.startOffsetX
    let newY = resizeRef.current.startOffsetY

    const corner = resizeRef.current.corner

    // Handle horizontal resize based on corner
    if (corner === "ne" || corner === "se") {
      // Right side - increase width
      newWidth = Math.max(40, resizeRef.current.startWidth + deltaX)
    } else if (corner === "nw" || corner === "sw") {
      // Left side - move left and adjust width
      newWidth = Math.max(40, resizeRef.current.startWidth - deltaX)
      newX = resizeRef.current.startOffsetX + deltaX
    }

    // Handle vertical resize based on corner
    if (corner === "sw" || corner === "se") {
      // Bottom side - increase height
      newHeight = Math.max(40, resizeRef.current.startHeight + deltaY)
    } else if (corner === "nw" || corner === "ne") {
      // Top side - move up and adjust height
      newHeight = Math.max(40, resizeRef.current.startHeight - deltaY)
      newY = resizeRef.current.startOffsetY + deltaY
    }

    setTempResize({
      width: newWidth,
      height: newHeight,
      x: newX,
      y: newY,
    })
  }, [])

  const handleResizeEnd = useCallback(() => {
    if (!isResizingRef.current || !resizeRef.current || !tempResize) return

    const gridElement = document.getElementById("grid-container")
    if (!gridElement) return

    const cellWidth = gridElement.offsetWidth / gridConfig.columns
    const cellHeight = gridElement.offsetHeight / gridConfig.rows

    const corner = resizeRef.current.corner
    let newColStart = resizeRef.current.startColStart
    let newRowStart = resizeRef.current.startRowStart
    let newColSpan = Math.max(1, Math.round(tempResize.width / cellWidth))
    let newRowSpan = Math.max(1, Math.round(tempResize.height / cellHeight))

    // Adjust start position based on corner
    if (corner === "nw" || corner === "sw") {
      const newStartCol = Math.round(tempResize.x / cellWidth) + 1
      newColSpan = resizeRef.current.startColStart + resizeRef.current.startColSpan - newStartCol
      newColStart = Math.max(1, newStartCol)
      newColSpan = Math.max(1, newColSpan)
    }

    if (corner === "nw" || corner === "ne") {
      const newStartRow = Math.round(tempResize.y / cellHeight) + 1
      newRowSpan = resizeRef.current.startRowStart + resizeRef.current.startRowSpan - newStartRow
      newRowStart = Math.max(1, newStartRow)
      newRowSpan = Math.max(1, newRowSpan)
    }

    // Clamp to grid bounds
    newColSpan = Math.min(gridConfig.columns - newColStart + 1, newColSpan)
    newRowSpan = Math.min(gridConfig.rows - newRowStart + 1, newRowSpan)

    onUpdateBlock(block.id, {
      colStart: newColStart,
      rowStart: newRowStart,
      colSpan: newColSpan,
      rowSpan: newRowSpan,
    })

    isResizingRef.current = false
    setIsResizing(false)
    setTempResize(null)
    resizeRef.current = null
  }, [block.id, onUpdateBlock, gridConfig, tempResize])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizingRef.current) return
      e.preventDefault()
      handleResizeMove(e.clientX, e.clientY)
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!isResizingRef.current) return
      if (e.touches.length > 0) {
        e.preventDefault()
        handleResizeMove(e.touches[0].clientX, e.touches[0].clientY)
      }
    }

    const handleEnd = () => {
      if (isResizingRef.current) {
        handleResizeEnd()
      }
    }

    document.addEventListener("mousemove", handleMouseMove, { passive: false })
    document.addEventListener("touchmove", handleTouchMove, { passive: false })
    document.addEventListener("mouseup", handleEnd)
    document.addEventListener("touchend", handleEnd)
    document.addEventListener("touchcancel", handleEnd)

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("touchmove", handleTouchMove)
      document.removeEventListener("mouseup", handleEnd)
      document.removeEventListener("touchend", handleEnd)
      document.removeEventListener("touchcancel", handleEnd)
    }
  }, [handleResizeMove, handleResizeEnd])

  const createResizeHandler = (corner: ResizeCorner) => {
    return {
      onMouseDown: (e: React.MouseEvent) => {
        e.stopPropagation()
        e.preventDefault()
        startResize(e.clientX, e.clientY, corner)
      },
      onTouchStart: (e: React.TouchEvent) => {
        e.stopPropagation()
        e.preventDefault()
        if (e.touches.length > 0) {
          startResize(e.touches[0].clientX, e.touches[0].clientY, corner)
        }
      },
    }
  }

  return (
    <>
      <div
        ref={setNodeRef}
        data-block-id={block.id}
        {...attributes}
        {...listeners}
        style={{ ...style, touchAction: "none" }}
        className={cn(
          "relative rounded-md border-2 transition-all hover:shadow-md hover:ring-1 hover:ring-foreground select-none",
          block.color,
          isResizing ? "cursor-default opacity-40" : "cursor-grab active:cursor-grabbing",
          isSelected && "ring-2 hover:ring-2 ring-foreground ring-offset-2 ring-offset-background", 
          isDragging && "opacity-60 shadow-2xl scale-105"
        )}
        onClick={(e) => {
          e.stopPropagation()
          onSelect(e)
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center p-2 pointer-events-none">
          <div className="flex flex-col items-center gap-0.5 text-center">
            {block.colStart && (
              <>
                <code className="text-[9px] md:text-[10px] font-mono text-foreground/80 leading-tight">
                  col-start-{block.colStart}
                </code>
                <code className="text-[9px] md:text-[10px] font-mono text-foreground/80 leading-tight">
                  col-span-{block.colSpan}
                </code>
                <code className="text-[9px] md:text-[10px] font-mono text-foreground/80 leading-tight">
                  row-start-{block.rowStart}
                </code>
                <code className="text-[9px] md:text-[10px] font-mono text-foreground/80 leading-tight">
                  row-span-{block.rowSpan}
                </code>
              </>
            )}
          </div>
        </div>

        <ResizeHandle corner="nw" {...createResizeHandler("nw")} />
        <ResizeHandle corner="ne" {...createResizeHandler("ne")} />
        <ResizeHandle corner="sw" {...createResizeHandler("sw")} />
        <ResizeHandle corner="se" {...createResizeHandler("se")} />
      </div>

      {tempResize && (
        <div style={tempResizeStyle} className={`rounded-md border-2 border-dashed ${block.color} opacity-60`} />
      )}
    </>
  )
}
