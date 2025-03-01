"use client"
import { interpolate } from "flubber"
import {
    animate,
    motion,
    MotionValue,
    useMotionValue,
    useTransform,
} from "motion/react"
import { useEffect, useState } from "react"

type Props = {
  paths: string[]
  colors: string[]
  index: number
  size?: number
}

const getIndex = (_: string, index: number) => index

/**
 *
 * @param progress - value between 0 and 1
 * @param paths - list of paths
 * @returns - a motion transform that interpolates between the paths
 */
function useFlubber(progress: MotionValue<number>, paths: string[]) {
    return useTransform(progress, paths.map(getIndex), paths, {
        mixer: (a, b) => interpolate(a, b, { maxSegmentLength: 0.1 }),
    })
}


export default function MorphingIcon({ paths, colors, index, size = 20 }: Props) {
    const progress = useMotionValue(index)
    const fill = useTransform(progress, paths.map(getIndex), colors)
    const path = useFlubber(progress, paths)

    useEffect(() => {
        const animation = animate(progress, index, {
            duration: 0.1,
            ease: "easeInOut",
        })

        return () => animation.stop()
    }, [index, progress])

    return (
        <svg width={size} height={size}>
            <g>
                <motion.path fill={fill} d={path} />
            </g>
        </svg>
    )
}
