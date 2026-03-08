import * as React from "react"
import * as RechartsPrimitive from "recharts"
import { cn } from "@/lib/utils"


const THEMES = { light: "", dark: ".dark" } as const


export type ChartConfig = {
  [key: string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  )
}

/** Context to share config */
type ChartContextProps = { config: ChartConfig }
const ChartContext = React.createContext<ChartContextProps | null>(null)

/** Hook to access chart config */
function useChart() {
  const context = React.useContext(ChartContext)
  if (!context) throw new Error("useChart must be used inside <ChartContainer>")
  return context
}

/** Props for ChartContainer */
type ChartContainerProps = React.ComponentProps<"div"> & {
  config: ChartConfig
  children: React.ReactNode
}

/** Chart container with style provider */
export function ChartContainer({ id, className, children, config, ...props }: ChartContainerProps) {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        className={cn("flex aspect-video justify-center text-xs", className)}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
}

/** Inject CSS variables for chart colors based on theme */
function ChartStyle({ id, config }: { id: string; config: ChartConfig }) {
  const colorConfig = Object.entries(config).filter(([_, c]) => c.theme || c.color)
  if (!colorConfig.length) return null

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, conf]) => {
    const color = conf.theme?.[theme as keyof typeof conf.theme] || conf.color
    return color ? `  --color-${key}: ${color};` : ""
  })
  .join("\n")}
}
`)
          .join("\n"),
      }}
    />
  )
}

/** ChartTooltip wrapper (Recharts default) */
export const ChartTooltip = RechartsPrimitive.Tooltip

/** Tooltip content props (manual typing for TS safety) */
type ChartTooltipContentProps = React.HTMLAttributes<HTMLDivElement> & {
  active?: boolean
  payload?: any[]
  label?: string
  hideLabel?: boolean
  hideIndicator?: boolean
  indicator?: "line" | "dot" | "dashed"
  nameKey?: string
  labelKey?: string
}

/** Custom tooltip content */
export function ChartTooltipContent({
  active,
  payload,
  label,
  className,
  indicator = "dot",
  hideLabel = false,
  hideIndicator = false,
  nameKey,
}: ChartTooltipContentProps) {
  const { config } = useChart()
  if (!active || !payload?.length) return null

  return (
    <div className={cn("border-border/50 bg-background grid min-w-[8rem] items-start gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl", className)}>
      {!hideLabel && label && <div className="font-medium">{label}</div>}

      <div className="grid gap-1.5">
        {payload.map((item: any, index: number) => {
          const key = `${nameKey || item.name || item.dataKey || "value"}`
          const itemConfig = config[key]
          const indicatorColor = item.payload?.fill || item.color

          return (
            <div key={index} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {!hideIndicator && (
                  <div
                    className={cn("rounded-sm", {
                      "w-2 h-2": indicator === "dot",
                      "w-1 h-3": indicator === "line",
                      "w-3 border border-dashed": indicator === "dashed",
                    })}
                    style={{ backgroundColor: indicatorColor }}
                  />
                )}
                <span className="text-muted-foreground">{itemConfig?.label || item.name}</span>
              </div>

              {item.value && (
                <span className="font-mono font-medium">{Number(item.value).toLocaleString()}</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/** ChartLegend wrapper (Recharts default) */
export const ChartLegend = RechartsPrimitive.Legend

/** Custom legend content */
type ChartLegendContentProps = React.ComponentProps<"div"> & {
  payload?: any[]
  verticalAlign?: "top" | "bottom"
  hideIcon?: boolean
}

export function ChartLegendContent({ className, payload, verticalAlign = "bottom", hideIcon = false }: ChartLegendContentProps) {
  const { config } = useChart()
  if (!payload?.length) return null

  return (
    <div className={cn("flex items-center justify-center gap-4", verticalAlign === "top" ? "pb-3" : "pt-3", className)}>
      {payload.map((item, index) => {
        const key = `${item.dataKey || "value"}`
        const itemConfig = config[key]

        return (
          <div key={index} className="flex items-center gap-1.5">
            {!hideIcon && <div className="h-2 w-2 rounded-sm" style={{ backgroundColor: item.color }} />}
            <span>{itemConfig?.label || item.value}</span>
          </div>
        )
      })}
    </div>
  )
}