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

const themes = [
  { id: "balls", name: "Bouncing Balls", icon: Circle, color: "text-cyan-400", description: "Colorful balls that bounce with volume" },
  { id: "faces", name: "Emojis", icon: Sparkles, color: "text-yellow-400", description: "Fun emojis bouncing around" },
  { id: "stars", name: "Stars", icon: Sparkles, color: "text-purple-400", description: "Twinkling stars that dance to sound" },
  { id: "hearts", name: "Hearts", icon: Sparkles, color: "text-pink-400", description: "Loving hearts bouncing with joy" },
  { id: "geometric", name: "Geometric Shapes", icon: Circle, color: "text-green-400", description: "Various geometric shapes in motion" },
  { id: "science", name: "Science Lab", icon: Sparkles, color: "text-blue-400", description: "Science emojis for STEM learning" },
  { id: "math", name: "Math Class", icon: Sparkles, color: "text-orange-400", description: "Math symbols and numbers" },
  { id: "spring", name: "Spring Garden", icon: Sparkles, color: "text-green-500", description: "Flowers and spring elements" },
  { id: "summer", name: "Summer Beach", icon: Sparkles, color: "text-orange-500", description: "Sun, waves, and summer fun" },
  { id: "autumn", name: "Autumn Leaves", icon: Sparkles, color: "text-amber-600", description: "Fall leaves and harvest themes" },
  { id: "winter", name: "Winter Wonderland", icon: Sparkles, color: "text-blue-300", description: "Snowflakes and winter magic" },
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
          <h2 className="text-xl font-bold text-white">Settings</h2>
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
              <div className="p-2 space-y-3">
                <div 
                  className={`p-3 rounded-xl cursor-pointer transition-all ${
                    settings.theme === 'balls' ? 'bg-cyan-500/30 border border-cyan-400' : 'glass-button hover:bg-white/25'
                  }`}
                  onClick={() => handleThemeChange('balls')}
                >
                  <div className="flex items-center space-x-3">
                    <Circle className="w-5 h-5 text-cyan-400" />
                    <div>
                      <div className="font-medium text-white">Bouncing Balls</div>
                      <div className="text-xs text-slate-300">Colorful balls that bounce with volume</div>
                    </div>
                  </div>
                </div>
                
                <div 
                  className={`p-3 rounded-xl cursor-pointer transition-all ${
                    settings.theme === 'faces' ? 'bg-cyan-500/30 border border-cyan-400' : 'glass-button hover:bg-white/25'
                  }`}
                  onClick={() => handleThemeChange('faces')}
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-yellow-400 text-xl">😊</div>
                    <div>
                      <div className="font-medium text-white">Emojis</div>
                      <div className="text-xs text-slate-300">Fun emojis that react to sound</div>
                    </div>
                  </div>
                </div>
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
      </div>
    </div>
  );
}
