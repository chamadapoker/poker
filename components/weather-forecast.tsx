"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Cloud, Sun, CloudRain } from "lucide-react"
import { useEffect, useState } from "react"

function WeatherForecast() {
  const [weather, setWeather] = useState({
    city: "Santa Maria",
    temperature: "25°C",
    condition: "Ensolarado",
    icon: <Sun className="h-8 w-8 text-yellow-500" />,
  })

  useEffect(() => {
    // Simula a busca de dados meteorológicos
    const conditions = [
      { condition: "Ensolarado", icon: <Sun className="h-8 w-8 text-yellow-500" /> },
      { condition: "Nublado", icon: <Cloud className="h-8 w-8 text-gray-500" /> },
      { condition: "Chuvoso", icon: <CloudRain className="h-8 w-8 text-blue-500" /> },
    ]
    const randomCondition = conditions[Math.floor(Math.random() * conditions.length)]
    setWeather((prev) => ({ ...prev, ...randomCondition }))
  }, [])

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Previsão do Tempo</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {weather.icon}
          <div>
            <p className="text-2xl font-bold">{weather.temperature}</p>
            <p className="text-sm text-muted-foreground">{weather.condition}</p>
          </div>
        </div>
        <p className="text-lg font-medium">{weather.city}</p>
      </CardContent>
    </Card>
  )
}

export { WeatherForecast }
export default WeatherForecast
