import { nanoid } from "nanoid"
import type { Block, GridConfig } from "@/components/grid-playground"

export function generateLayout(config: GridConfig, colors: string[]): Block[] {
    const blocks: Block[] = []
    const matrix = Array(config.rows).fill(null).map(() => Array(config.columns).fill(false))

    // Define block sizes with weights (larger blocks first for better layout)
    const sizes = [
        { w: 4, h: 4, weight: 1 },
        { w: 3, h: 3, weight: 2 },
        { w: 2, h: 2, weight: 4 },
        { w: 2, h: 1, weight: 3 },
        { w: 1, h: 2, weight: 3 },
        { w: 1, h: 1, weight: 1 },
    ]

    const isPositionValid = (row: number, col: number, w: number, h: number) => {
        if (row + h > config.rows || col + w > config.columns) return false
        for (let r = row; r < row + h; r++) {
            for (let c = col; c < col + w; c++) {
                if (matrix[r][c]) return false
            }
        }
        return true
    }

    const placeBlock = (row: number, col: number, w: number, h: number) => {
        for (let r = row; r < row + h; r++) {
            for (let c = col; c < col + w; c++) {
                matrix[r][c] = true
            }
        }
        blocks.push({
            id: nanoid(),
            colStart: col + 1,
            colSpan: w,
            rowStart: row + 1,
            rowSpan: h,
            color: colors[Math.floor(Math.random() * colors.length)],
        })
    }

    let attempts = 0
    const maxAttempts = config.columns * config.rows * 2

    while (attempts < maxAttempts) {
        // Pick random spot
        const r = Math.floor(Math.random() * config.rows)
        const c = Math.floor(Math.random() * config.columns)

        if (matrix[r][c]) {
            attempts++
            continue
        }

        // Pick random size based on weights
        const weightedPool = sizes.flatMap(s => Array(s.weight).fill(s))
        const size = weightedPool[Math.floor(Math.random() * weightedPool.length)]

        if (isPositionValid(r, c, size.w, size.h)) {
            placeBlock(r, c, size.w, size.h)
        } else {
            // Fallback to smaller sizes if big one fits not
            if (isPositionValid(r, c, 1, 1) && Math.random() > 0.7) {
                placeBlock(r, c, 1, 1)
            }
        }
        attempts++
    }

    return blocks
}
