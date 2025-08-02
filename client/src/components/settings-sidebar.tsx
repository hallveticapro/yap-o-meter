import { useState } from "react";
import { X, ChevronDown, Sparkles, Waves, Circle, Settings as SettingsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { VoiceMeterSettings } from "@/pages/voice-meter";

interface SettingsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  settings: VoiceMeterSettings;
  onSettingsChange: (settings: Partial<VoiceMeterSettings>) => void;
  onCalibrate: () => void;
  isCalibrating: boolean;
}

const themeGroups = [
  {
    name: "General",
    themes: [
      { id: "balls", name: "Bouncing Balls", icon: Circle, emoji: "⚪", color: "text-cyan-400", description: "Colorful balls that bounce with volume" },
      { id: "faces", name: "Emojis", icon: Sparkles, emoji: "😊", color: "text-yellow-400", description: "Fun emojis bouncing around" },
      { id: "stars", name: "Stars", icon: Sparkles, emoji: "⭐", color: "text-purple-400", description: "Twinkling stars that dance to sound" },
      { id: "hearts", name: "Hearts", icon: Sparkles, emoji: "❤️", color: "text-pink-400", description: "Loving hearts bouncing with joy" },
      { id: "geometric", name: "Geometric Shapes", icon: Circle, emoji: "🔵", color: "text-green-400", description: "Various geometric shapes in motion" },
    ]
  },
  {
    name: "School",
    themes: [
      { id: "science", name: "Science Lab", icon: Sparkles, emoji: "🧪", color: "text-blue-400", description: "Science emojis for STEM learning" },
      { id: "math", name: "Math Class", icon: Sparkles, emoji: "🔢", color: "text-orange-400", description: "Math symbols and numbers" },
      { id: "reading", name: "Reading Time", icon: Sparkles, emoji: "📚", color: "text-indigo-400", description: "Books, pencils, and library learning" },
    ]
  },
  {
    name: "Seasons",
    themes: [
      { id: "spring", name: "Spring Garden", icon: Sparkles, emoji: "🌸", color: "text-green-500", description: "Flowers and spring elements" },
      { id: "summer", name: "Summer Beach", icon: Sparkles, emoji: "☀️", color: "text-orange-500", description: "Sun, waves, and summer fun" },
      { id: "autumn", name: "Autumn Leaves", icon: Sparkles, emoji: "🍂", color: "text-amber-600", description: "Fall leaves and harvest themes" },
      { id: "winter", name: "Winter Wonderland", icon: Sparkles, emoji: "❄️", color: "text-blue-300", description: "Snowflakes and winter magic" },
    ]
  }
];

export default function SettingsSidebar({ 
  isOpen, 
  onClose, 
  settings, 
  onSettingsChange,
  onCalibrate,
  isCalibrating 
}: SettingsSidebarProps) {
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    theme: false,
    threshold: false,
    alerts: false,
    calibration: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleThemeChange = (themeId: string) => {
    onSettingsChange({ theme: themeId });
  };

  const handleThresholdChange = (value: number[]) => {
    onSettingsChange({ threshold: value[0] });
  };

  const handleSensitivityChange = (value: number[]) => {
    onSettingsChange({ sensitivity: value[0] });
  };

  const handleAlertVolumeChange = (value: number[]) => {
    onSettingsChange({ alertVolume: value[0] });
  };

  return (
    <div className={`sidebar-slide fixed top-0 right-0 w-80 h-full z-30 ${isOpen ? 'open' : ''}`}>
      <div className="glass-morphism h-full p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Yap-o-Meter</h2>
            <p className="text-xs text-slate-400">Settings</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="glass-button rounded-lg p-2 text-white hover:text-red-400"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Theme Selection */}
        <div className="mb-6">
          <Collapsible open={openSections.theme} onOpenChange={() => toggleSection('theme')}>
            <CollapsibleTrigger className="w-full flex items-center justify-between p-3 glass-button rounded-xl text-white hover:bg-white/25 transition-all">
              <span className="font-medium">Visual Theme</span>
              <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${openSections.theme ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <div className="p-2 space-y-4">
                {themeGroups.map((group, groupIndex) => (
                  <div key={group.name} className={groupIndex > 0 ? "border-t border-slate-600/30 pt-4" : ""}>
                    <h4 className="text-sm font-semibold text-slate-300 mb-2 px-2">{group.name}</h4>
                    <div className="space-y-2">
                      {group.themes.map((theme) => (
                        <div 
                          key={theme.id}
                          className={`p-3 rounded-xl cursor-pointer transition-all ${
                            settings.theme === theme.id ? 'bg-cyan-500/30 border border-cyan-400' : 'glass-button hover:bg-white/25'
                          }`}
                          onClick={() => handleThemeChange(theme.id)}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="text-lg">{theme.emoji}</div>
                            <div>
                              <div className="font-medium text-white text-sm">{theme.name}</div>
                              <div className="text-xs text-slate-300">{theme.description}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Volume Threshold Section */}
        <div className="mb-6">
          <Collapsible open={openSections.threshold} onOpenChange={() => toggleSection('threshold')}>
            <CollapsibleTrigger className="w-full flex items-center justify-between p-3 glass-button rounded-xl text-white hover:bg-white/25 transition-all">
              <span className="font-medium">Volume Threshold</span>
              <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${openSections.threshold ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <div className="p-2 space-y-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-2">Threshold Level</label>
                  <Slider
                    value={[settings.threshold]}
                    onValueChange={handleThresholdChange}
                    max={100}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-slate-400 mt-1">
                    <span>Quiet</span>
                    <span>{settings.threshold}%</span>
                    <span>Loud</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">Show Threshold Line</span>
                  <Switch
                    checked={settings.showThreshold}
                    onCheckedChange={(checked) => onSettingsChange({ showThreshold: checked })}
                  />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Audio Alerts Section */}
        <div className="mb-6">
          <Collapsible open={openSections.alerts} onOpenChange={() => toggleSection('alerts')}>
            <CollapsibleTrigger className="w-full flex items-center justify-between p-3 glass-button rounded-xl text-white hover:bg-white/25 transition-all">
              <span className="font-medium">Audio Alerts</span>
              <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${openSections.alerts ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <div className="p-2 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">Enable Alerts</span>
                  <Switch
                    checked={settings.enableAlerts}
                    onCheckedChange={(checked) => onSettingsChange({ enableAlerts: checked })}
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-slate-300 mb-2">Alert Sound</label>
                  <Select value={settings.alertSound} onValueChange={(value) => onSettingsChange({ alertSound: value })}>
                    <SelectTrigger className="w-full bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="shush">Whisper "Shhh"</SelectItem>
                      <SelectItem value="ding">Ding Ding Ding</SelectItem>
                      <SelectItem value="chime">Soft Chime</SelectItem>
                      <SelectItem value="bell">Bell Ring</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm text-slate-300 mb-2">Alert Volume</label>
                  <Slider
                    value={[settings.alertVolume]}
                    onValueChange={handleAlertVolumeChange}
                    max={100}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Calibration Section */}
        <div className="mb-6">
          <Collapsible open={openSections.calibration} onOpenChange={() => toggleSection('calibration')}>
            <CollapsibleTrigger className="w-full flex items-center justify-between p-3 glass-button rounded-xl text-white hover:bg-white/25 transition-all">
              <span className="font-medium">Microphone Settings</span>
              <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${openSections.calibration ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <div className="p-2 space-y-3">
                <div>
                  <label className="block text-sm text-slate-300 mb-2">Sensitivity</label>
                  <Slider
                    value={[settings.sensitivity]}
                    onValueChange={handleSensitivityChange}
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-slate-400 mt-1">
                    <span>Low</span>
                    <span>High</span>
                  </div>
                </div>
                
                <Button
                  onClick={onCalibrate}
                  disabled={isCalibrating}
                  className="w-full glass-button rounded-lg py-2 px-4 text-white hover:bg-white/25 transition-all"
                >
                  <SettingsIcon className="w-4 h-4 mr-2" />
                  {isCalibrating ? 'Calibrating...' : 'Calibrate Microphone'}
                </Button>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Copyright Information */}
        <div className="mt-auto pt-6 border-t border-slate-600/30">
          <div className="text-center text-xs text-slate-400 space-y-2">
            <p>© 2025 Yap-o-Meter</p>
            <p>Made for educators with love ❤️</p>
            <p className="text-slate-500">Created by Andrew Hall using Replit</p>
            
            {/* Social Media Links */}
            <div className="flex justify-center gap-3 pt-2">
              {/* GitHub */}
              <a 
                href="https://github.com/hallveticapro/yap-o-meter" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white transition-colors duration-200 glass-button rounded-lg p-2"
                title="View source code on GitHub"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                </svg>
              </a>

              {/* Threads */}
              <a 
                href="https://www.threads.net/@hallveticapro" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white transition-colors duration-200 glass-button rounded-lg p-2"
                title="Follow @hallveticapro on Threads"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 192 192">
                  <path d="M141.537 88.9883C140.71 88.5919 139.87 88.2104 139.019 87.8451C137.537 60.5382 122.616 44.905 97.5619 44.745C97.4484 44.7443 97.3355 44.7443 97.222 44.7443C82.2364 44.7443 69.7731 51.1409 62.102 62.7807L75.881 72.2328C81.6116 63.5383 90.6052 61.6848 97.35 61.6848C97.3933 61.6848 97.4358 61.6848 97.4358 61.6848C105.689 61.746 118.331 63.7199 123.422 77.7956C118.853 76.498 113.546 75.40 107.394 75.40C96.1931 75.40 89.9544 79.0297 89.9544 79.0297C89.9544 79.0297 86.6343 80.9101 86.6343 86.3018C86.6343 91.6936 89.9544 93.574 89.9544 93.574C89.9544 93.574 96.1931 97.2037 107.394 97.2037C118.595 97.2037 124.834 93.574 124.834 93.574C124.834 93.574 128.154 91.6936 128.154 86.3018C128.154 85.0351 127.827 83.9841 127.827 83.9841L141.537 88.9883Z"/>
                  <path d="M96.8826 147.644C113.132 147.644 126.089 134.687 126.089 118.438C126.089 102.188 113.132 89.2314 96.8826 89.2314C80.6332 89.2314 67.6766 102.188 67.6766 118.438C67.6766 134.687 80.6332 147.644 96.8826 147.644ZM96.8826 103.864C105.016 103.864 111.456 110.305 111.456 118.438C111.456 126.571 105.016 133.011 96.8826 133.011C88.7494 133.011 82.3096 126.571 82.3096 118.438C82.3096 110.305 88.7494 103.864 96.8826 103.864Z"/>
                  <path fillRule="evenodd" clipRule="evenodd" d="M48.854 0C21.839 0 0 21.839 0 48.854V143.146C0 170.161 21.839 192 48.854 192H143.146C170.161 192 192 170.161 192 143.146V48.854C192 21.839 170.161 0 143.146 0H48.854ZM25.708 48.854C25.708 36.0532 36.0532 25.708 48.854 25.708H143.146C155.947 25.708 166.292 36.0532 166.292 48.854V143.146C166.292 155.947 155.947 166.292 143.146 166.292H48.854C36.0532 166.292 25.708 155.947 25.708 143.146V48.854Z"/>
                </svg>
              </a>

              {/* Instagram */}
              <a 
                href="https://www.instagram.com/hallveticapro" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white transition-colors duration-200 glass-button rounded-lg p-2"
                title="Follow @hallveticapro on Instagram"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>

              {/* TikTok */}
              <a 
                href="https://www.tiktok.com/@hallveticapro" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white transition-colors duration-200 glass-button rounded-lg p-2"
                title="Follow @hallveticapro on TikTok"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-.88-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1.04-.1z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
