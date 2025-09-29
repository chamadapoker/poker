"use client";

import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

// Exemplo de componentes que você pode criar usando as bibliotecas instaladas
export function MagicUIExamples() {
  return (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-bold text-center mb-8 bg-gradient-to-r from-red-600 to-blue-600 bg-clip-text text-transparent">
        Exemplos de UI Libraries
      </h2>
      
      {/* Magic UI Examples */}
      <Card className="bg-gradient-to-br from-red-50 to-blue-50 dark:from-red-950/20 dark:to-blue-950/20 border-red-200 dark:border-red-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-300">
            ✨ Magic UI Components
          </CardTitle>
          <CardDescription>
            Exemplos de componentes que você pode criar usando Magic UI
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:shadow-lg hover:scale-105 transition-all duration-300 group">
              <h3 className="font-semibold mb-2 text-red-600 dark:text-red-400 group-hover:text-red-700 dark:group-hover:text-red-300 transition-colors">
                Animated Cards
              </h3>
              <p className="text-sm text-muted-foreground">
                Cards com animações suaves e efeitos de hover
              </p>
            </div>
            <div className="p-4 border rounded-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:shadow-lg hover:scale-105 transition-all duration-300 group">
              <h3 className="font-semibold mb-2 text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                Gradient Buttons
              </h3>
              <p className="text-sm text-muted-foreground">
                Botões com gradientes e efeitos visuais
              </p>
            </div>
            <div className="p-4 border rounded-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:shadow-lg hover:scale-105 transition-all duration-300 group">
              <h3 className="font-semibold mb-2 text-red-600 dark:text-red-400 group-hover:text-red-700 dark:group-hover:text-red-300 transition-colors">
                Floating Elements
              </h3>
              <p className="text-sm text-muted-foreground">
                Elementos flutuantes com animações
              </p>
            </div>
            <div className="p-4 border rounded-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:shadow-lg hover:scale-105 transition-all duration-300 group">
              <h3 className="font-semibold mb-2 text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                Interactive Forms
              </h3>
              <p className="text-sm text-muted-foreground">
                Formulários interativos com validação visual
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Aceternity UI Examples */}
      <Card className="bg-gradient-to-br from-blue-50 to-red-50 dark:from-blue-950/20 dark:to-red-950/20 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
            🚀 Aceternity UI Components
          </CardTitle>
          <CardDescription>
            Exemplos de componentes que você pode criar usando Aceternity UI
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:shadow-lg hover:scale-105 transition-all duration-300 group">
              <h3 className="font-semibold mb-2 text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                Parallax Effects
              </h3>
              <p className="text-sm text-muted-foreground">
                Efeitos de parallax para scroll
              </p>
            </div>
            <div className="p-4 border rounded-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:shadow-lg hover:scale-105 transition-all duration-300 group">
              <h3 className="font-semibold mb-2 text-red-600 dark:text-red-400 group-hover:text-red-700 dark:group-hover:text-red-300 transition-colors">
                3D Transforms
              </h3>
              <p className="text-sm text-muted-foreground">
                Transformações 3D e rotações
              </p>
            </div>
            <div className="p-4 border rounded-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:shadow-lg hover:scale-105 transition-all duration-300 group">
              <h3 className="font-semibold mb-2 text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                Particle Systems
              </h3>
              <p className="text-sm text-muted-foreground">
                Sistemas de partículas interativos
              </p>
            </div>
            <div className="p-4 border rounded-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:shadow-lg hover:scale-105 transition-all duration-300 group">
              <h3 className="font-semibold mb-2 text-red-600 dark:text-red-400 group-hover:text-red-700 dark:group-hover:text-red-300 transition-colors">
                Morphing Shapes
              </h3>
              <p className="text-sm text-muted-foreground">
                Formas que se transformam
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Como usar as bibliotecas */}
      <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900/50 border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            🛠️ Como Usar as Bibliotecas
          </CardTitle>
          <CardDescription>
            Instruções para começar a usar Magic UI e Aceternity UI
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-semibold text-red-600 dark:text-red-400">Magic UI:</h4>
            <p className="text-sm text-muted-foreground">
              Use o CLI para adicionar componentes: <code className="bg-muted px-2 py-1 rounded">npx magicui-cli add [component-name]</code>
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-semibold text-blue-600 dark:text-blue-400">Aceternity UI:</h4>
            <p className="text-sm text-muted-foreground">
              Use o CLI para adicionar componentes: <code className="bg-muted px-2 py-1 rounded">npx aceternity-ui add [component-name]</code>
            </p>
          </div>

          <div className="pt-4">
            <Button className="w-full bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-700 hover:to-blue-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              Começar a Usar as Bibliotecas
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Status das bibliotecas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-medium text-green-700 dark:text-green-300">Aceternity UI</span>
              <Badge variant="secondary" className="ml-auto">Funcionando</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
              <span className="font-medium text-yellow-700 dark:text-yellow-300">Magic UI</span>
              <Badge variant="secondary" className="ml-auto">Configurando</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default MagicUIExamples;
