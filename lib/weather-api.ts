// API de Previsão do Tempo - OpenWeatherMap
// Coordenadas de Santa Maria, RS, Brasil: -29.6868, -53.8149

const WEATHER_API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || "demo_key"
const SANTA_MARIA_COORDS = {
  lat: -29.6868,
  lon: -53.8149
}

export interface WeatherData {
  current: {
    temperature: number
    maxTemp: number
    minTemp: number
    condition: string
    humidity: number
    wind: number
    windDirection: string
    rainProbability: number
    uvIndex: number
    sunrise: string
    sunset: string
    pressure: number
    feelsLike: number
    visibility: number
  }
  forecast: Array<{
    day: string
    date: string
    temperature: number
    maxTemp: number
    minTemp: number
    condition: string
    icon: string
    rainProbability: number
    wind: number
    humidity: number
    pressure: number
  }>
}

export async function fetchWeatherData(): Promise<WeatherData> {
  try {
    // Se não houver API key ou for demo_key, retorna dados simulados
    if (!WEATHER_API_KEY || WEATHER_API_KEY === "demo_key" || WEATHER_API_KEY === "your_api_key_here") {
      console.log("🌤️ Usando dados simulados - API key não configurada ou inválida")
      return getMockWeatherData()
    }

    console.log("🌤️ Tentando conectar com OpenWeatherMap API...")
    console.log("📍 Coordenadas:", SANTA_MARIA_COORDS)
    console.log("🔑 API Key:", WEATHER_API_KEY.substring(0, 8) + "...")

    // Busca dados atuais
    const currentResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${SANTA_MARIA_COORDS.lat}&lon=${SANTA_MARIA_COORDS.lon}&appid=${WEATHER_API_KEY}&units=metric&lang=pt_br`
    )

    // Busca previsão de 5 dias
    const forecastResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${SANTA_MARIA_COORDS.lat}&lon=${SANTA_MARIA_COORDS.lon}&appid=${WEATHER_API_KEY}&units=metric&lang=pt_br`
    )

    // Verifica se as respostas foram bem-sucedidas
    if (!currentResponse.ok) {
      const errorText = await currentResponse.text()
      console.error(`❌ Erro na API atual: ${currentResponse.status} - ${errorText}`)
      
      if (currentResponse.status === 401) {
        console.log("🔑 API key não autorizada - usando dados simulados")
        return getMockWeatherData()
      }
      
      throw new Error(`Erro na API atual: ${currentResponse.status}`)
    }

    if (!forecastResponse.ok) {
      const errorText = await forecastResponse.text()
      console.error(`❌ Erro na API de previsão: ${forecastResponse.status} - ${errorText}`)
      
      if (forecastResponse.status === 401) {
        console.log("🔑 API key não autorizada - usando dados simulados")
        return getMockWeatherData()
      }
      
      throw new Error(`Erro na API de previsão: ${forecastResponse.status}`)
    }

    const currentData = await currentResponse.json()
    const forecastData = await forecastResponse.json()

    console.log("✅ Dados reais carregados com sucesso da API OpenWeatherMap!")
    console.log("🌡️ Temperatura atual:", currentData.main.temp, "°C")
    console.log("🌤️ Condição:", currentData.weather[0].description)
    console.log("📍 Localização:", currentData.name || "Santa Maria, RS")

    // Processa dados atuais
    const current = {
      temperature: Math.round(currentData.main.temp),
      maxTemp: Math.round(currentData.main.temp_max),
      minTemp: Math.round(currentData.main.temp_min),
      condition: getWeatherCondition(currentData.weather[0].main, currentData.weather[0].description),
      humidity: currentData.main.humidity,
      wind: Math.round(currentData.wind.speed * 3.6), // Converte m/s para km/h
      windDirection: getWindDirection(currentData.wind.deg),
      rainProbability: currentData.rain ? Math.round(currentData.rain['1h'] * 100) : 0,
      uvIndex: 0, // OpenWeatherMap não fornece UV gratuito
      sunrise: new Date(currentData.sys.sunrise * 1000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      sunset: new Date(currentData.sys.sunset * 1000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      pressure: Math.round(currentData.main.pressure),
      feelsLike: Math.round(currentData.main.feels_like),
      visibility: Math.round(currentData.visibility / 1000) // Converte metros para km
    }

    // Processa previsão de 5 dias
    const dailyForecasts = forecastData.list.filter((item: any, index: number) => index % 8 === 0).slice(0, 5)
    
    // Gerar dias dinamicamente baseado na data atual
    const getDayName = (date: Date, index: number) => {
      if (index === 0) return 'Hoje'
      if (index === 1) return 'Amanhã'
      
      const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
      return dayNames[date.getDay()]
    }
    
    const days = dailyForecasts.map((item: any, index: number) => {
      const date = new Date(item.dt * 1000)
      return getDayName(date, index)
    })
    
    const forecast = dailyForecasts.map((item: any, index: number) => {
      const date = new Date(item.dt * 1000)
      const formattedDate = date.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit' 
      })
      
      return {
        day: days[index],
        date: formattedDate,
        temperature: Math.round(item.main.temp),
        maxTemp: Math.round(item.main.temp_max),
        minTemp: Math.round(item.main.temp_min),
        condition: getWeatherCondition(item.weather[0].main, item.weather[0].description),
        icon: getWeatherIcon(item.weather[0].main),
        rainProbability: item.pop ? Math.round(item.pop * 100) : 0,
        wind: Math.round(item.wind.speed * 3.6),
        humidity: item.main.humidity,
        pressure: Math.round(item.main.pressure)
      }
    })

    console.log("📅 Previsão de 5 dias processada com sucesso!")
    return { current, forecast }

  } catch (error) {
    console.error('❌ Erro ao buscar dados meteorológicos:', error)
    console.log('🔄 Retornando dados simulados devido ao erro')
    return getMockWeatherData()
  }
}

function getWeatherCondition(main: string, description: string): string {
  const conditions: { [key: string]: string } = {
    'Clear': 'Ensolarado',
    'Clouds': 'Nublado',
    'Rain': 'Chuvoso',
    'Drizzle': 'Chuvisco',
    'Thunderstorm': 'Tempestade',
    'Snow': 'Nevando',
    'Mist': 'Neblina',
    'Fog': 'Neblina',
    'Haze': 'Neblina',
    'Smoke': 'Neblina',
    'Dust': 'Poeira',
    'Sand': 'Areia',
    'Ash': 'Cinzas',
    'Squall': 'Rajada',
    'Tornado': 'Tornado'
  }
  
  return conditions[main] || description || 'Variável'
}

function getWeatherIcon(main: string): string {
  const icons: { [key: string]: string } = {
    'Clear': 'sun',
    'Clouds': 'cloud',
    'Rain': 'rain',
    'Drizzle': 'rain',
    'Thunderstorm': 'lightning',
    'Snow': 'cloud',
    'Mist': 'cloud',
    'Fog': 'cloud',
    'Haze': 'cloud',
    'Smoke': 'cloud',
    'Dust': 'cloud',
    'Sand': 'cloud',
    'Ash': 'cloud',
    'Squall': 'wind',
    'Tornado': 'wind'
  }
  
  return icons[main] || 'cloud'
}

function getWindDirection(degrees: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  const index = Math.round(degrees / 45) % 8
  return directions[index]
}

function getMockWeatherData(): WeatherData {
  // Gerar dias dinamicamente baseado na data atual
  const getDayName = (date: Date, index: number) => {
    if (index === 0) return 'Hoje'
    if (index === 1) return 'Amanhã'
    
    const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
    return dayNames[date.getDay()]
  }

  const generateForecast = () => {
    const forecast = []
    const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
    
    for (let i = 0; i < 5; i++) {
      const date = new Date()
      date.setDate(date.getDate() + i)
      
      const dayName = i === 0 ? 'Hoje' : i === 1 ? 'Amanhã' : dayNames[date.getDay()]
      
      forecast.push({
        day: dayName,
        date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        temperature: 22 - i * 2,
        maxTemp: 26 - i * 2,
        minTemp: 16 - i * 2,
        condition: i === 0 ? "Ensolarado" : i === 1 ? "Nublado" : i === 2 ? "Chuvoso" : "Nublado",
        icon: i === 0 ? "sun" : i === 1 ? "cloud" : i === 2 ? "rain" : "cloud",
        rainProbability: i === 0 ? 10 : i === 1 ? 30 : i === 2 ? 80 : 40,
        wind: 15 + i * 3,
        humidity: 65 + i * 5,
        pressure: 1013 - i * 2
      })
    }
    
    return forecast
  }

  return {
    current: {
      temperature: 22,
      maxTemp: 26,
      minTemp: 16,
      condition: "Ensolarado",
      humidity: 65,
      wind: 15,
      windDirection: "SE",
      rainProbability: 10,
      uvIndex: 6,
      sunrise: "06:45",
      sunset: "18:30",
      pressure: 1013,
      feelsLike: 24,
      visibility: 10
    },
    forecast: generateForecast()
  }
}
