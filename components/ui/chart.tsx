"use client"

import * as React from "react"
import { VictoryBar, VictoryChart, VictoryAxis, VictoryTheme, VictoryLine, VictoryPie, VictoryTooltip } from "victory"

import { cn } from "@/lib/utils"

const Chart = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    type: "bar" | "line" | "pie"
    data: any[]
    x?: string
    y?: string
    title?: string
    description?: string
  }
>(({ className, type, data, x, y, title, description, ...props }, ref) => {
  const ChartComponent = React.useMemo(() => {
    switch (type) {
      case "bar":
        return (
          <VictoryBar
            data={data}
            x={x}
            y={y}
            labels={({ datum }) => `${datum[y!]}`}
            labelComponent={<VictoryTooltip />}
          />
        )
      case "line":
        return (
          <VictoryLine
            data={data}
            x={x}
            y={y}
            labels={({ datum }) => `${datum[y!]}`}
            labelComponent={<VictoryTooltip />}
          />
        )
      case "pie":
        return (
          <VictoryPie
            data={data}
            x={x}
            y={y}
            labels={({ datum }) => `${datum[x!]}: ${datum[y!]}`}
            labelComponent={<VictoryTooltip />}
            colorScale="qualitative"
          />
        )
      default:
        return null
    }
  }, [type, data, x, y])

  if (!ChartComponent) {
    return <div className={cn("flex items-center justify-center h-48", className)}>Invalid chart type</div>
  }

  return (
    <div ref={ref} className={cn("w-full h-full", className)} {...props}>
      {title && <h3 className="text-lg font-semibold text-center mb-2">{title}</h3>}
      {description && <p className="text-sm text-muted-foreground text-center mb-4">{description}</p>}
      <VictoryChart
        theme={VictoryTheme.material}
        domainPadding={type === "bar" ? 20 : 0}
        height={type === "pie" ? 300 : 200}
        width={type === "pie" ? 300 : 350}
      >
        {type !== "pie" && <VictoryAxis tickFormat={(tick) => tick} />}
        {type !== "pie" && <VictoryAxis dependentAxis tickFormat={(tick) => tick} />}
        {ChartComponent}
      </VictoryChart>
    </div>
  )
})

Chart.displayName = "Chart"

export { Chart }
