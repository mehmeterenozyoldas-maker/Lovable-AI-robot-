import React, { useState } from 'react';
import { 
  Printer, 
  X, 
  Info, 
  Smartphone, 
  Gamepad2, 
  Cpu, 
  Scissors, 
  Wrench, 
  ChevronRight, 
  Check, 
  Layers, 
  Sparkles 
} from 'lucide-react';

interface PaperTemplateProps {
  onClose: () => void;
}

type ModelType = 'iphone-se' | 'bezel-less' | 'arcade' | 'robot';
type BlueprintStyle = 'draft' | 'blueprint' | 'print';

export function PaperTemplate({ onClose }: PaperTemplateProps) {
  const [selectedModel, setSelectedModel] = useState<ModelType>('iphone-se');
  const [blueprintStyle, setBlueprintStyle] = useState<BlueprintStyle>('blueprint');
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);
  const [hoveredDescription, setHoveredDescription] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'steps' | 'materials' | 'tips'>('steps');

  // Handle setting part description on hover
  const handlePartHover = (partName: string, desc: string) => {
    setHoveredPart(partName);
    setHoveredDescription(desc);
  };

  const handlePartLeave = () => {
    setHoveredPart(null);
    setHoveredDescription(null);
  };

  // Content for each model
  const modelSpecs = {
    'iphone-se': {
      title: "iPhone SE (4.7-inch) Sleeve",
      icon: <Smartphone className="w-5 h-5" />,
      description: "A precision-engineered paper enclosure specifically tailored to match the classic form factor of the iPhone SE (2nd/3rd gen), iPhone 8, 7, and 6s. Fits thick-bezel screens perfectly.",
      targetDevices: "iPhone SE (2020, 2022), iPhone 8, 7, 6, 6s",
      dimensions: "138.4 mm x 67.3 mm x 7.3 mm",
      features: [
        "Circular Touch ID Home Button alignment guide",
        "Horizontal speaker grill & front-camera bezel cutouts",
        "Symmetrical top/bottom border spacing",
        "Charging/cable access port on bottom flap"
      ],
      steps: [
        "Cut Out Outline: Use scissors to cut along the outer thick SOLID black lines.",
        "Aperture Cuts: Use a precision craft knife to cut out the inner display rectangle and the circular front-camera hole.",
        "Score Dashed Lines: Lightly score all DOTTED / DASHED fold lines with a ruler and dry pen to ensure clean folds.",
        "Fold the Frame: Fold the sides backward to create a 3D rectangular sleeve.",
        "Glue the Joints: Apply glue or double-sided tape to the designated 'GLUE JOINT' flaps and seal.",
        "Insert & Align: Slide your phone in from the top. The screen and camera will align perfectly with the cutouts."
      ]
    },
    'bezel-less': {
      title: "Universal Bezel-Less Sleeve",
      icon: <Smartphone className="w-5 h-5 text-purple-400" />,
      description: "A modernized envelope featuring edge-to-edge display clearance to fit modern notch, punch-hole, and Dynamic Island devices without obscuring the active camera sensors.",
      targetDevices: "iPhone 13/14/15/16 (Pro/Base), Galaxy S22/S23/S24, Pixel 7/8/9",
      dimensions: "147.5 mm x 71.5 mm x 7.8 mm (Stretch-fit)",
      features: [
        "Maximum screen-to-body viewport window",
        "Dynamic Island / top camera pill cut guide",
        "Curved display-corner bezel matches",
        "Extra-wide bottom connector slot"
      ],
      steps: [
        "Cut Border lines: Excise the outer perimeter using standard paper craft scissors.",
        "Screen and Island: Carefully slice the large screen viewport and choose either the pill cutout (Dynamic Island) or notch guide.",
        "Score Folds: Use a stylus or blunt edge to score the fold lines along the sides.",
        "Crease & Shape: Wrap the side folds around to construct a tight protective casing.",
        "Secure Seams: Apply adhesive tape along the vertical glue flap and assemble.",
        "Slide phone in: Drop your device in and ensure the camera lens has a clean line of sight through the island aperture."
      ]
    },
    'arcade': {
      title: "Retro 3D Arcade Cabinet",
      icon: <Gamepad2 className="w-5 h-5 text-red-400" />,
      description: "An advanced, self-supporting 3D desktop stand that transforms your phone into a retro arcade machine terminal. The phone slides diagonally in from the top, serving as the arcade screen.",
      targetDevices: "Universal fits up to 6.7\" devices (slanted dock)",
      dimensions: "155 mm x 95 mm x 110 mm (3D Assembled)",
      features: [
        "Nostalgic dual arcade wing silhouettes",
        "Integrated joystick & action button printed graphics",
        "Interlocking tabs for glueless structural assembly",
        "Kitten-ears visual accessory header"
      ],
      steps: [
        "Cut All Pieces: Cut out Left Wing, Right Wing, and the central folding strip very carefully.",
        "Prepare Slots: Use an exacto knife to slice the thin vertical slots on the Side Wings (marked in red).",
        "Accordion Fold: Fold the central structural strip in an accordion-style along the dashed guides.",
        "Slot Assembly: Insert the tabs on the central strip into the corresponding slots of the Left and Right Wings.",
        "Fold the Controller: Lock the joystick deck and coin gate panels forward.",
        "Dock Phone: Slide your smartphone down into the slanted bed. Enjoy your retro mini terminal!"
      ]
    },
    'robot': {
      title: "Antonio's Robot Butler Stand",
      icon: <Cpu className="w-5 h-5 text-[#00ffcc]" />,
      description: "A functional sci-fi robot desk frame. Supports your smartphone at an ergonomic 45-degree angle, decorated with motherboard-themed visual traces, folding grip claws, and robust stability struts.",
      targetDevices: "Universal (supports portrait or landscape docking)",
      dimensions: "140 mm x 90 mm x 95 mm (3D Assembled)",
      features: [
        "Folding visual clamping claws to prevent sliding",
        "Printed printed-circuit-board (PCB) tracks design",
        "Fold-out A-frame rear leg stabilization strut",
        "Integrated cable-routing guides on base feet"
      ],
      steps: [
        "Frame Extraction: Cut along the outer boundary of the robot plate, leg struts, and arm clamps.",
        "Arm Pre-Crease: Carefully fold the left and right 'grabbing' paws forward.",
        "Rear Strut Fold: Score and fold the rear triangular stand flap backwards by 45 degrees.",
        "Assemble Footlip: Fold the bottom lip forward to act as the primary safety barrier for your device.",
        "Reinforce Strut: Tape or glue the A-frame stabilizer to the back of the robot's chest.",
        "Mount Companion: Place your phone onto the plate. The robot arms hold it safely on your desk!"
      ]
    }
  };

  const materials = [
    { name: "Heavy Cardstock", detail: "A4 or Letter size (180-240 gsm is highly recommended for stable 3D stands)." },
    { name: "Precision Craft Knife / Scissors", detail: "Essential for tight cuts, circular holes, and the display screen bezel." },
    { name: "Ruler & Scoring Tool", detail: "An empty pen or plastic stylus to pre-crease lines before folding." },
    { name: "Adhesive Tape or Glue", detail: "Double-sided tape strips or standard white craft glue for joints." }
  ];

  const assemblyTips = [
    { title: "Score Before Folding", text: "Never fold cardboard directly. Always use a ruler and score the dashed lines first. This gives clean, sharp, professional machine-like corners." },
    { title: "Camera Line-Of-Sight", text: "Ensure the camera and sensor aperture holes are cut slightly wider than needed to avoid obstructing the Paper Pet's computer vision." },
    { title: "Cable Management", text: "Feed your charging cable through the access ports before locking the phone in, preventing wear and tear on the paper joints." },
    { title: "Glue Setting Time", text: "If using liquid craft glue, use paper clips or binder clips to hold the tabs together for 2 minutes while the glue dries." }
  ];

  return (
    <div className="absolute inset-0 bg-[#0c0f12] text-white z-50 overflow-auto flex flex-col font-sans print:bg-white print:text-black">
      {/* HEADER SECTION - Hiddon on Print */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center p-6 border-b border-zinc-800 bg-[#12161a] print:hidden gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-[#00ffcc]" />
            <h2 className="text-2xl font-black tracking-widest text-[#00ffcc] uppercase">PAPER BLUEPRINT STUDIO</h2>
          </div>
          <p className="text-zinc-400 text-xs mt-1">Select, preview, and print highly accurate structural enclosures for your spatial companion.</p>
        </div>
        
        {/* Actions Bar */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Blueprint Style Toggle */}
          <div className="flex items-center bg-zinc-900 border border-zinc-800 p-1 rounded-sm text-xs">
            <button 
              onClick={() => setBlueprintStyle('blueprint')}
              className={`px-3 py-1.5 font-bold uppercase tracking-wider rounded-sm transition-all ${blueprintStyle === 'blueprint' ? 'bg-[#00ffcc] text-black shadow-sm' : 'text-zinc-400 hover:text-white'}`}
            >
              Classic Blue
            </button>
            <button 
              onClick={() => setBlueprintStyle('draft')}
              className={`px-3 py-1.5 font-bold uppercase tracking-wider rounded-sm transition-all ${blueprintStyle === 'draft' ? 'bg-[#00ffcc] text-black shadow-sm' : 'text-zinc-400 hover:text-white'}`}
            >
              Draft Paper
            </button>
            <button 
              onClick={() => setBlueprintStyle('print')}
              className={`px-3 py-1.5 font-bold uppercase tracking-wider rounded-sm transition-all ${blueprintStyle === 'print' ? 'bg-[#00ffcc] text-black shadow-sm' : 'text-zinc-400 hover:text-white'}`}
            >
              Crisp Outline
            </button>
          </div>

          <button 
            onClick={() => window.print()} 
            className="flex items-center space-x-2 px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-[#00ffcc] border border-[#00ffcc]/30 hover:border-[#00ffcc] transition-all font-bold uppercase tracking-widest text-xs rounded-sm cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Enclosure</span>
          </button>

          <button 
            onClick={onClose} 
            className="flex items-center space-x-1 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white transition-all font-bold uppercase tracking-widest text-xs rounded-sm cursor-pointer ml-auto lg:ml-0"
          >
            <X className="w-4 h-4" />
            <span>Close</span>
          </button>
        </div>
      </div>

      {/* CORE CONTENT LAYOUT */}
      <div className="flex-1 flex flex-col lg:flex-row print:flex-row overflow-hidden bg-[#0a0d10] print:bg-white print:overflow-visible">
        
        {/* LEFT PANEL: CONFIGURATION, SPECS & INSTRUCTIONS (Hidden on Print) */}
        <div className="w-full lg:w-[400px] border-r border-zinc-800 flex flex-col bg-[#111519] overflow-y-auto print:hidden shrink-0">
          
          {/* MODEL SELECTION BOX */}
          <div className="p-5 border-b border-zinc-800">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">1. Select Housing Model</h3>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(modelSpecs) as ModelType[]).map((mId) => (
                <button
                  key={mId}
                  onClick={() => {
                    setSelectedModel(mId);
                    handlePartLeave();
                  }}
                  className={`flex items-center space-x-2 p-3 text-left border rounded-sm transition-all text-xs cursor-pointer ${selectedModel === mId ? 'border-[#00ffcc] bg-[#00ffcc]/5 text-white' : 'border-zinc-800 bg-zinc-900/50 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200'}`}
                >
                  <div className={`p-1.5 rounded-sm bg-zinc-900 ${selectedModel === mId ? 'text-[#00ffcc] border border-[#00ffcc]/20' : 'text-zinc-400'}`}>
                    {modelSpecs[mId].icon}
                  </div>
                  <div className="truncate">
                    <p className="font-bold tracking-wide uppercase leading-tight">{mId.replace('-', ' ')}</p>
                    <p className="text-[9px] opacity-60 truncate">
                      {mId === 'iphone-se' ? 'Perfect Classic Fit' : mId === 'bezel-less' ? 'Universal Fit' : mId === 'arcade' ? '3D Cabin Stand' : 'Mech Desk Frame'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* CHOSEN MODEL METADATA */}
          <div className="p-5 border-b border-zinc-800 bg-zinc-950/40">
            <div className="flex items-center space-x-2 text-[#00ffcc]">
              {modelSpecs[selectedModel].icon}
              <h4 className="font-bold text-sm uppercase tracking-wide">{modelSpecs[selectedModel].title}</h4>
            </div>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">{modelSpecs[selectedModel].description}</p>
            
            <div className="mt-4 space-y-1.5 border-t border-zinc-800/60 pt-3 text-[11px]">
              <div className="flex justify-between">
                <span className="text-zinc-500 uppercase tracking-wider font-semibold">Targets:</span>
                <span className="text-zinc-300 font-medium truncate max-w-[200px]">{modelSpecs[selectedModel].targetDevices}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 uppercase tracking-wider font-semibold">DIMS (EST):</span>
                <span className="text-zinc-300 font-medium">{modelSpecs[selectedModel].dimensions}</span>
              </div>
            </div>
          </div>

          {/* INTERACTIVE WORKSHOP GUIDE tabs */}
          <div className="flex border-b border-zinc-800 text-xs">
            <button 
              onClick={() => setActiveTab('steps')}
              className={`flex-1 py-3 text-center font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${activeTab === 'steps' ? 'border-[#00ffcc] text-[#00ffcc] bg-[#00ffcc]/5' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
            >
              Steps
            </button>
            <button 
              onClick={() => setActiveTab('materials')}
              className={`flex-1 py-3 text-center font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${activeTab === 'materials' ? 'border-[#00ffcc] text-[#00ffcc] bg-[#00ffcc]/5' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
            >
              Materials
            </button>
            <button 
              onClick={() => setActiveTab('tips')}
              className={`flex-1 py-3 text-center font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${activeTab === 'tips' ? 'border-[#00ffcc] text-[#00ffcc] bg-[#00ffcc]/5' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
            >
              Pro Tips
            </button>
          </div>

          {/* TAB CONTENTS */}
          <div className="flex-1 p-5 overflow-y-auto">
            
            {/* STEPS TAB */}
            {activeTab === 'steps' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-zinc-400 mb-2">
                  <Scissors className="w-4 h-4 text-[#00ffcc]" />
                  <span className="text-[10px] font-bold tracking-widest uppercase">Assembly Sequence</span>
                </div>
                {modelSpecs[selectedModel].steps.map((step, idx) => {
                  const [title, body] = step.split(': ');
                  return (
                    <div key={idx} className="flex gap-3 text-xs group">
                      <div className="w-5 h-5 rounded-full bg-zinc-800 text-[#00ffcc] flex items-center justify-center font-bold text-[10px] shrink-0 border border-zinc-700 group-hover:border-[#00ffcc]/50 transition-all">
                        {idx + 1}
                      </div>
                      <div className="space-y-0.5">
                        <p className="font-bold text-zinc-200 group-hover:text-[#00ffcc] transition-all uppercase tracking-wide text-[10px]">{title}</p>
                        <p className="text-zinc-400 leading-relaxed text-[11px]">{body}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* MATERIALS TAB */}
            {activeTab === 'materials' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-zinc-400 mb-2">
                  <Wrench className="w-4 h-4 text-[#00ffcc]" />
                  <span className="text-[10px] font-bold tracking-widest uppercase">Sourcing List</span>
                </div>
                {materials.map((item, idx) => (
                  <div key={idx} className="p-3 bg-zinc-950/40 border border-zinc-800/60 rounded-sm">
                    <div className="flex items-center space-x-2">
                      <Check className="w-3.5 h-3.5 text-[#00ffcc]" />
                      <p className="font-bold text-zinc-200 uppercase text-[10px] tracking-wide">{item.name}</p>
                    </div>
                    <p className="text-zinc-400 text-[11px] mt-1 leading-relaxed pl-5">{item.detail}</p>
                  </div>
                ))}
              </div>
            )}

            {/* TIPS TAB */}
            {activeTab === 'tips' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-zinc-400 mb-2">
                  <Info className="w-4 h-4 text-[#00ffcc]" />
                  <span className="text-[10px] font-bold tracking-widest uppercase">Expert Origami Advice</span>
                </div>
                {assemblyTips.map((tip, idx) => (
                  <div key={idx} className="space-y-1">
                    <p className="font-bold text-zinc-200 text-[10px] uppercase tracking-wide flex items-center space-x-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00ffcc]" />
                      <span>{tip.title}</span>
                    </p>
                    <p className="text-zinc-400 text-[11px] leading-relaxed pl-3">{tip.text}</p>
                  </div>
                ))}
              </div>
            )}

          </div>

          {/* FOOTER */}
          <div className="p-4 border-t border-zinc-800 text-center text-[9px] text-zinc-500">
            Designed for standard Letter or A4 print scales at 100%.
          </div>
        </div>

        {/* RIGHT PANEL: SVG BLUEPRINT VIEWER */}
        <div className="flex-1 flex flex-col h-full overflow-hidden print:w-full print:h-auto print:overflow-visible relative">
          
          {/* THE CANVAS */}
          <div className={`flex-1 flex items-center justify-center p-4 overflow-auto relative transition-colors duration-300 print:p-0 print:bg-white ${
            blueprintStyle === 'blueprint' 
              ? 'bg-[#14202c] text-[#a4daff]' 
              : blueprintStyle === 'draft' 
                ? 'bg-[#f4ebe1] text-[#70523d]' 
                : 'bg-zinc-100 text-black print:bg-white print:text-black'
          }`}>
            
            {/* Floating Style Label (Hidden on Print) */}
            <div className="absolute top-4 left-4 flex items-center space-x-1.5 px-2.5 py-1 bg-black/40 text-[10px] font-bold tracking-widest uppercase rounded-sm print:hidden">
              <span className={`w-2 h-2 rounded-full ${blueprintStyle === 'blueprint' ? 'bg-sky-400' : blueprintStyle === 'draft' ? 'bg-amber-600' : 'bg-zinc-600'}`} />
              <span>{blueprintStyle} scale</span>
            </div>

            {/* BLUEPRINT GRID BACKGROUND */}
            {(blueprintStyle === 'blueprint' || blueprintStyle === 'draft') && (
              <div className="absolute inset-0 pointer-events-none opacity-40">
                <svg width="100%" height="100%">
                  <defs>
                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
              </div>
            )}

            {/* DYNAMIC BLUEPRINT SVG GENERATION */}
            <div className="w-full max-w-2xl max-h-[90%] flex items-center justify-center print:max-h-full print:max-w-full print:p-0">
              {selectedModel === 'iphone-se' && (
                <svg viewBox="0 0 900 900" className="w-full h-auto stroke-current fill-none transition-all duration-300" strokeWidth="1.5">
                  <g className="print:text-black">
                    <text x="450" y="50" textAnchor="middle" className="text-xl font-black fill-current stroke-none tracking-widest uppercase">CLASSIC 16:9 SMARTPHONE CHASSIS</text>
                    <text x="450" y="75" textAnchor="middle" className="text-xs font-mono fill-current stroke-none tracking-wider opacity-60">— Multi-layer iPhone SE / 8 / 7 Structural Blueprint —</text>

                    {/* Folds (Dashed Lines) */}
                    <g strokeDasharray="6,6" strokeWidth="1.5" className="opacity-80">
                      {/* Vertical folds */}
                      <line x1="260" y1="180" x2="260" y2="680" />
                      <line x1="300" y1="180" x2="300" y2="680" />
                      <line x1="560" y1="180" x2="560" y2="680" />
                      <line x1="600" y1="180" x2="600" y2="680" />
                      
                      {/* Horizontal fold flaps */}
                      <line x1="120" y1="180" x2="260" y2="180" />
                      <line x1="300" y1="180" x2="560" y2="180" />
                      <line x1="300" y1="680" x2="560" y2="680" />
                      <line x1="300" y1="720" x2="560" y2="720" />
                    </g>

                    {/* Cuts & Boundaries (Solid Lines) */}
                    {/* BACK FLAP (With Structural Ribs) */}
                    <g 
                      className="transition-colors hover:fill-current/5 cursor-pointer"
                      onMouseEnter={() => handlePartHover("Reinforced Back Cover", "The main back plate. Features internal diagonal structural ribs to prevent bowing and support the phone's weight.")}
                      onMouseLeave={handlePartLeave}
                    >
                      <rect x="120" y="180" width="140" height="500" rx="4" />
                      <path d="M 120 180 L 80 200 L 80 660 L 120 680 Z" />
                      
                      {/* Structural Ribs */}
                      <g className="stroke-current opacity-30" strokeDasharray="2,2">
                        <line x1="130" y1="200" x2="250" y2="300" />
                        <line x1="130" y1="300" x2="250" y2="400" />
                        <line x1="130" y1="400" x2="250" y2="500" />
                        <line x1="130" y1="500" x2="250" y2="600" />
                        <line x1="130" y1="600" x2="250" y2="660" />
                      </g>
                      
                      {/* Rear Camera Cutout */}
                      <rect x="200" y="200" width="45" height="25" rx="12" className="stroke-[2] hover:stroke-red-500" />
                      <circle cx="215" cy="212" r="6" />
                      <circle cx="235" cy="212" r="3" />
                      <text x="222" y="195" textAnchor="middle" className="text-[6px] font-bold">REAR CAMERA HOLE</text>
                    </g>
                    
                    {/* LEFT SPINE SIDE */}
                    <g 
                      className="transition-colors hover:fill-current/5 cursor-pointer"
                      onMouseEnter={() => handlePartHover("Left Side Frame", "Provides structural thickness. Contains punch-holes for the volume rockers and mute switch.")}
                      onMouseLeave={handlePartLeave}
                    >
                      <rect x="260" y="180" width="40" height="500" />
                      {/* Mute / Volume Buttons */}
                      <rect x="275" y="240" width="10" height="20" rx="2" className="stroke-red-500/50" />
                      <circle cx="280" cy="285" r="5" className="stroke-red-500/50" />
                      <circle cx="280" cy="315" r="5" className="stroke-red-500/50" />
                      <text x="280" y="340" textAnchor="middle" transform="rotate(-90 280 340)" className="text-[8px] opacity-60 font-bold">VOLUME / MUTE PORT</text>
                    </g>

                    {/* FRONT FLAP */}
                    <g 
                      className="transition-colors hover:fill-current/5 cursor-pointer"
                      onMouseEnter={() => handlePartHover("Precision Front Shield", "The primary display panel. Houses exact guides for the classic 16:9 screen, Touch ID, and front sensors.")}
                      onMouseLeave={handlePartLeave}
                    >
                      <rect x="300" y="180" width="260" height="500" rx="4" />
                      
                      {/* SCREEN VIEWPORT CUTOUT */}
                      <rect 
                        x="320" y="250" width="220" height="360" rx="2"
                        className="stroke-[2.5] hover:fill-[#00ffcc]/10 hover:stroke-[#00ffcc] transition-all cursor-pointer"
                      />
                      
                      {/* IPHONE SE SPEAKER APERTURE & CAMERA */}
                      <rect x="405" y="215" width="50" height="6" rx="3" className="stroke-[2] hover:fill-red-500/20" />
                      <circle cx="380" cy="218" r="5" className="stroke-[2] hover:fill-red-500/20" />
                      <circle cx="430" cy="205" r="3" className="stroke-current opacity-50" />
                      
                      {/* TOUCH ID CIRCULAR BEZEL */}
                      <circle 
                        cx="430" cy="645" r="18" strokeDasharray="3,3"
                        className="hover:fill-current/10"
                      />
                      <circle cx="430" cy="645" r="14" className="opacity-30" />
                    </g>

                    {/* RIGHT SPINE SIDE */}
                    <g 
                      className="transition-colors hover:fill-current/5 cursor-pointer"
                      onMouseEnter={() => handlePartHover("Right Side Frame", "Right chassis boundary. Contains the power button cutout guide.")}
                      onMouseLeave={handlePartLeave}
                    >
                      <rect x="560" y="180" width="40" height="500" />
                      <rect x="575" y="280" width="10" height="35" rx="3" className="stroke-red-500/50" />
                      <text x="580" y="340" textAnchor="middle" transform="rotate(90 580 340)" className="text-[8px] opacity-60 font-bold">POWER BUTTON</text>
                    </g>

                    {/* GLUE FLAP */}
                    <path 
                      d="M 600 180 L 650 210 L 650 650 L 600 680 Z"
                      className="transition-colors hover:fill-current/10 cursor-pointer"
                      onMouseEnter={() => handlePartHover("Master Glue Strip", "Apply double-sided tape or strong glue here, then wrap it behind the BACK FLAP to permanently lock the 3D shape.")}
                      onMouseLeave={handlePartLeave}
                    />

                    {/* BOTTOM DOCKING FLAP WITH USB ACCESS */}
                    <g 
                      className="transition-colors hover:fill-current/5 cursor-pointer"
                      onMouseEnter={() => handlePartHover("Base Speaker & Port Plate", "Secures the bottom. Contains precise cutouts for the stereo speakers and Lightning / USB port.")}
                      onMouseLeave={handlePartLeave}
                    >
                      <path d="M 300 680 L 300 720 L 560 720 L 560 680 Z" />
                      {/* Port Hole */}
                      <rect x="400" y="692" width="60" height="16" rx="6" />
                      {/* Speaker Grills */}
                      <circle cx="340" cy="700" r="3" />
                      <circle cx="350" cy="700" r="3" />
                      <circle cx="360" cy="700" r="3" />
                      <circle cx="370" cy="700" r="3" />
                      <circle cx="490" cy="700" r="3" />
                      <circle cx="500" cy="700" r="3" />
                      <circle cx="510" cy="700" r="3" />
                      <circle cx="520" cy="700" r="3" />
                    </g>

                    {/* Top Dust Caps & Headphone Jack (SE 1st Gen) */}
                    <g 
                      className="transition-colors hover:fill-current/5 cursor-pointer"
                      onMouseEnter={() => handlePartHover("Top Dust Cover", "Seals the top edge. Features a retro 3.5mm headphone jack cutout indicator.")}
                      onMouseLeave={handlePartLeave}
                    >
                      <path d="M 300 180 L 300 140 L 560 140 L 560 180 Z" />
                      <circle cx="340" cy="160" r="6" className="stroke-red-500/50" />
                      <text x="340" y="130" textAnchor="middle" className="text-[6px] font-bold">3.5mm JACK</text>
                      
                      {/* Corner Tabs */}
                      <path d="M 260 180 L 260 140 L 300 140 L 300 180 Z" className="opacity-30" />
                      <path d="M 560 180 L 560 140 L 600 140 L 600 180 Z" className="opacity-30" />
                    </g>

                    {/* Text Annotations inside Blueprint */}
                    <g className="fill-current stroke-none font-bold text-[10px] opacity-75 font-mono">
                      <text x="190" y="440" textAnchor="middle" className="text-sm">BACK PANEL</text>
                      <text x="430" y="440" textAnchor="middle" className="text-sm">DISPLAY VIEWPORT</text>
                      <text x="430" y="380" textAnchor="middle" className="text-[10px] tracking-widest fill-red-500 font-black">EXCISE SCREEN WINDOW</text>
                      <text x="430" y="240" textAnchor="middle" className="text-[8px] fill-red-500 font-bold">FACETIME CAMERA & EARPIECE</text>
                      <text x="430" y="620" textAnchor="middle" className="text-[8px] opacity-60">TOUCH ID / HOME BUTTON</text>
                      <text x="625" y="440" textAnchor="middle" transform="rotate(90, 625, 440)">STRUCTURAL ADHESIVE TAB</text>
                      <text x="430" y="740" textAnchor="middle" className="text-[8px]">LIGHTNING / USB-C PORT</text>
                    </g>
                  </g>
                </svg>
              )}

              {selectedModel === 'bezel-less' && (
                <svg viewBox="0 0 900 900" className="w-full h-auto stroke-current fill-none transition-all duration-300" strokeWidth="1.5">
                  <g className="print:text-black">
                    <text x="450" y="50" textAnchor="middle" className="text-xl font-black fill-current stroke-none tracking-widest uppercase">BEZEL-LESS WRAPAROUND HOUSING</text>
                    <text x="450" y="75" textAnchor="middle" className="text-xs font-mono fill-current stroke-none tracking-wider opacity-60">— Advanced 360° Sleeve Construction Guide —</text>

                    {/* Dashed Folds */}
                    <g strokeDasharray="6,6" strokeWidth="1.5" className="opacity-80">
                      <line x1="280" y1="180" x2="280" y2="720" />
                      <line x1="320" y1="180" x2="320" y2="720" />
                      <line x1="620" y1="180" x2="620" y2="720" />
                      <line x1="660" y1="180" x2="660" y2="720" />
                      
                      <line x1="100" y1="180" x2="280" y2="180" />
                      <line x1="320" y1="180" x2="620" y2="180" />
                      
                      <line x1="320" y1="720" x2="620" y2="720" />
                      <line x1="320" y1="760" x2="620" y2="760" />

                      <line x1="150" y1="180" x2="150" y2="720" />
                    </g>

                    {/* Main Back Panel */}
                    <g 
                      className="transition-colors hover:fill-current/5 cursor-pointer"
                      onMouseEnter={() => handlePartHover("Main Structural Back", "Heavy-duty back panel supporting the inner skeleton. Paste to cardboard for extra rigidity.")}
                      onMouseLeave={handlePartLeave}
                    >
                      <rect x="150" y="180" width="130" height="540" />
                      <path d="M 150 180 L 100 200 L 100 700 L 150 720 Z" />
                      {/* Inner shock absorber lines */}
                      <path d="M 170 200 L 260 200 L 260 700 L 170 700 Z" className="stroke-current opacity-30" strokeDasharray="2,2" />
                      <text x="215" y="450" textAnchor="middle" transform="rotate(-90 215 450)" className="text-[10px] fill-current stroke-none font-bold opacity-60">CORRUGATED SHOCK ABSORBER</text>
                    </g>

                    {/* Front Face / Screen Plate */}
                    <g 
                      className="transition-colors hover:fill-current/5 cursor-pointer"
                      onMouseEnter={() => handlePartHover("Edge-to-Edge Screen Plate", "Front-facing sleeve. Features precise corners for maximum screen-to-body ratio viewing.")}
                      onMouseLeave={handlePartLeave}
                    >
                      <rect x="320" y="180" width="300" height="540" rx="4" />
                      {/* Viewport Cutout */}
                      <rect x="335" y="195" width="270" height="510" rx="28" className="stroke-[2.5] hover:fill-[#00ffcc]/10 hover:stroke-[#00ffcc] transition-all" />
                      <text x="470" y="450" textAnchor="middle" className="text-[12px] fill-current stroke-none font-black opacity-30 tracking-widest">BEZEL-LESS VIEWPORT</text>
                    </g>

                    {/* Left & Right Spines (Frame depth) */}
                    <rect x="280" y="180" width="40" height="540" className="hover:fill-current/5 transition-colors" />
                    <rect x="620" y="180" width="40" height="540" className="hover:fill-current/5 transition-colors" />
                    <text x="300" y="450" textAnchor="middle" transform="rotate(-90 300 450)" className="text-[8px] fill-current stroke-none font-bold opacity-60">LEFT EDGE (40mm THICK)</text>
                    <text x="640" y="450" textAnchor="middle" transform="rotate(90 640 450)" className="text-[8px] fill-current stroke-none font-bold opacity-60">RIGHT EDGE (40mm THICK)</text>

                    {/* Dynamic Island Notch Cutout */}
                    <rect 
                      x="425" y="210" width="90" height="24" rx="12"
                      className="stroke-[2] hover:fill-red-500/10 cursor-pointer"
                      onMouseEnter={() => handlePartHover("Dynamic Island / Notch Gap", "CRITICAL SENSOR GAP: Remove this dynamic island pill cutout so the FaceID/front camera has unobstructed depth monitoring.")}
                      onMouseLeave={handlePartLeave}
                    />
                    <line x1="515" y1="222" x2="550" y2="222" stroke="red" strokeDasharray="2,2" />
                    <text x="555" y="225" className="text-[8px] fill-red-500 stroke-none font-bold">REMOVE FOR CAMERAS</text>

                    {/* Top Corner Bumpers */}
                    <g 
                      className="transition-colors hover:fill-current/10 cursor-pointer"
                      onMouseEnter={() => handlePartHover("Corner Bumpers", "Fold these over the top corners to lock the phone vertically and provide drop protection.")}
                      onMouseLeave={handlePartLeave}
                    >
                      <path d="M 320 180 L 320 120 L 360 120 L 360 180 Z" />
                      <path d="M 580 180 L 580 120 L 620 120 L 620 180 Z" />
                      <text x="340" y="150" textAnchor="middle" className="text-[8px] fill-current stroke-none font-bold">FLAP A</text>
                      <text x="600" y="150" textAnchor="middle" className="text-[8px] fill-current stroke-none font-bold">FLAP B</text>
                    </g>

                    {/* Bottom Flap & Charger Port */}
                    <path 
                      d="M 320 720 L 320 760 L 620 760 L 620 720 Z"
                      className="hover:fill-current/5 cursor-pointer transition-colors"
                      onMouseEnter={() => handlePartHover("Bottom Chassis Wrap", "Wraps around the bottom of the device, sealing the housing structure.")}
                      onMouseLeave={handlePartLeave}
                    />
                    {/* Charger Hole */}
                    <rect x="420" y="730" width="100" height="20" rx="4" />
                    <text x="470" y="744" textAnchor="middle" className="text-[8px] fill-current stroke-none font-bold">USB/LIGHTNING PORT</text>

                    {/* Master Glue Flap */}
                    <path 
                      d="M 660 180 L 710 210 L 710 690 L 660 720 Z"
                      className="hover:fill-current/10 cursor-pointer"
                      onMouseEnter={() => handlePartHover("Master Glue Flap", "Connects the entire continuous shell together. Apply strong double-sided tape here.")}
                      onMouseLeave={handlePartLeave}
                    />
                    <text x="685" y="450" textAnchor="middle" transform="rotate(90 685 450)" className="text-[10px] fill-current stroke-none font-bold opacity-60">APPLY ADHESIVE HERE</text>
                  </g>
                </svg>
              )}

              {selectedModel === 'arcade' && (
                <svg viewBox="0 0 900 900" className="w-full h-auto stroke-current fill-none transition-all duration-300" strokeWidth="1.5">
                  <g className="print:text-black">
                    <text x="450" y="40" textAnchor="middle" className="text-xl font-black fill-current stroke-none tracking-widest uppercase">RETRO ARCADE CABINET BLUEPRINT</text>
                    <text x="450" y="65" textAnchor="middle" className="text-xs font-mono fill-current stroke-none tracking-wider opacity-60">— Advanced 3D Papercraft Assembly Guide —</text>

                    {/* LEFT WING PROFILE */}
                    <g 
                      className="transition-all hover:fill-current/5 cursor-pointer"
                      onMouseEnter={() => handlePartHover("Left Wing Profile", "The signature left arcade cabinet wall. Detailed with coin-op mechanical styling and anchor slots.")}
                      onMouseLeave={handlePartLeave}
                    >
                      <path d="M 60 120 L 220 120 L 220 170 L 260 170 L 260 270 L 190 350 L 190 620 L 60 620 Z" />
                      {/* Anchor Slots on side wing */}
                      <line x1="80" y1="150" x2="80" y2="230" stroke="red" strokeWidth="3" />
                      <line x1="160" y1="380" x2="160" y2="450" stroke="red" strokeWidth="3" />
                      <line x1="120" y1="520" x2="120" y2="590" stroke="red" strokeWidth="3" />
                      {/* Decals */}
                      <path d="M 80 270 L 120 270 L 120 310" strokeDasharray="2,2" className="opacity-30" />
                      <circle cx="210" cy="580" r="10" className="opacity-40" />
                      <circle cx="210" cy="580" r="4" className="opacity-40" />
                      <text x="130" y="450" textAnchor="middle" transform="rotate(-90 130 450)" className="text-[10px] fill-current stroke-none font-bold opacity-50">L-CABINET WALL</text>
                    </g>

                    {/* RIGHT WING PROFILE */}
                    <g 
                      className="transition-all hover:fill-current/5 cursor-pointer"
                      onMouseEnter={() => handlePartHover("Right Wing Profile", "Symmetrical right arcade enclosure piece. Slot cuts match the left wing.")}
                      onMouseLeave={handlePartLeave}
                    >
                      <path d="M 840 120 L 680 120 L 680 170 L 640 170 L 640 270 L 710 350 L 710 620 L 840 620 Z" />
                      <line x1="820" y1="150" x2="820" y2="230" stroke="red" strokeWidth="3" />
                      <line x1="740" y1="380" x2="740" y2="450" stroke="red" strokeWidth="3" />
                      <line x1="780" y1="520" x2="780" y2="590" stroke="red" strokeWidth="3" />
                      <path d="M 820 270 L 780 270 L 780 310" strokeDasharray="2,2" className="opacity-30" />
                      <circle cx="690" cy="580" r="10" className="opacity-40" />
                      <circle cx="690" cy="580" r="4" className="opacity-40" />
                      <text x="770" y="450" textAnchor="middle" transform="rotate(90 770 450)" className="text-[10px] fill-current stroke-none font-bold opacity-50">R-CABINET WALL</text>
                    </g>

                    {/* MAIN SPINE STRIP (FOLDABLE) */}
                    <g 
                      className="transition-all hover:fill-current/5 cursor-pointer"
                      onMouseEnter={() => handlePartHover("Central Console Strip", "Long central sheet containing folding blocks for the Marquee header, the screen cradle, joystick shelf, and coin box.")}
                      onMouseLeave={handlePartLeave}
                    >
                      {/* Spine boundary */}
                      <rect x="290" y="120" width="360" height="650" rx="2" />
                      
                      {/* Spine folds */}
                      <g strokeDasharray="5,5">
                        <line x1="290" y1="210" x2="650" y2="210" />
                        <line x1="290" y1="310" x2="650" y2="310" />
                        <line x1="290" y1="520" x2="650" y2="520" />
                        <line x1="290" y1="620" x2="650" y2="620" />
                      </g>

                      {/* Header Marquee Text */}
                      <text x="470" y="170" textAnchor="middle" className="text-xl fill-current stroke-none font-black opacity-30 tracking-widest uppercase">INSERT COIN</text>

                      {/* Screen viewing window cutout */}
                      <rect 
                        x="330" y="340" width="280" height="150" rx="8"
                        className="stroke-[2.5] hover:fill-[#00ffcc]/10 hover:stroke-[#00ffcc] transition-all"
                        onMouseEnter={(e) => {
                          e.stopPropagation();
                          handlePartHover("Arcade Display Aperture", "SCREEN HOLE: Cut this window out so your phone screen peeks out from the interior diagonal holster.");
                        }}
                      />
                      <text x="470" y="420" textAnchor="middle" className="text-[12px] fill-red-500 stroke-none font-black opacity-80 tracking-widest">CUT DISPLAY WINDOW</text>

                      {/* Joypad & Coin Door Decals */}
                      {/* Joystick Base */}
                      <g className="fill-current stroke-none opacity-60">
                        <circle cx="360" cy="570" r="14" />
                        <line x1="360" y1="550" x2="360" y2="590" stroke="currentColor" strokeWidth="3" />
                        <line x1="340" y1="570" x2="380" y2="570" stroke="currentColor" strokeWidth="3" />
                        
                        <circle cx="510" cy="570" r="10" fill="red" />
                        <circle cx="545" cy="570" r="10" fill="red" />
                        <circle cx="580" cy="570" r="10" fill="red" />
                        <text x="545" y="595" textAnchor="middle" className="text-[8px] font-bold">A B C</text>
                      </g>
                      
                      {/* Coin box */}
                      <g className="stroke-current opacity-80" strokeWidth="1.5">
                        <rect x="420" y="660" width="100" height="90" rx="4" />
                        <rect x="435" y="670" width="25" height="40" rx="2" />
                        <rect x="480" y="670" width="25" height="40" rx="2" />
                        <line x1="447" y1="680" x2="447" y2="695" strokeWidth="2" stroke="red" />
                        <line x1="492" y1="680" x2="492" y2="695" strokeWidth="2" stroke="red" />
                        <text x="470" y="735" textAnchor="middle" className="text-[10px] fill-current stroke-none font-bold">25¢ COIN RETURN</text>
                      </g>
                    </g>

                    {/* Decorative Accessory: Cat Ears */}
                    <g 
                      className="transition-all hover:fill-current/5 cursor-pointer"
                      onMouseEnter={() => handlePartHover("Visual Cat Ears Accessory", "Decorative cat ears! Cut these out and glue them on top of your cabinet marquee header.")}
                      onMouseLeave={handlePartLeave}
                    >
                      <path d="M 330 850 L 380 770 L 430 850 Z" />
                      <line x1="330" y1="850" x2="430" y2="850" strokeDasharray="3,3" />
                      <path d="M 510 850 L 560 770 L 610 850 Z" />
                      <line x1="510" y1="850" x2="610" y2="850" strokeDasharray="3,3" />
                    </g>

                    {/* AR TRACKING MARKER */}
                    <g 
                      className="transition-all hover:fill-current/5 cursor-pointer"
                      onMouseEnter={() => handlePartHover("AR Hologram Marker", "Print this marker and place it in front of the arcade cabinet. Scan it using the 'AR Mode' in the app to project a 3D hologram!")}
                      onMouseLeave={handlePartLeave}
                      transform="translate(700, 700)"
                    >
                      <rect x="0" y="0" width="120" height="120" className="fill-current stroke-none" />
                      <rect x="15" y="15" width="90" height="90" className="fill-white stroke-none" />
                      <rect x="30" y="30" width="60" height="60" className="fill-current stroke-none" />
                      <path d="M 45 75 L 45 45 L 75 45 L 75 60 L 60 60 L 60 75 Z" className="fill-white stroke-none" />
                      <text x="60" y="140" textAnchor="middle" className="text-[12px] fill-current stroke-none font-black tracking-widest">AR TARGET</text>
                      <line x1="-10" y1="0" x2="130" y2="0" strokeDasharray="3,3" />
                      <line x1="120" y1="-10" x2="120" y2="130" strokeDasharray="3,3" />
                      <line x1="130" y1="120" x2="-10" y2="120" strokeDasharray="3,3" />
                      <line x1="0" y1="130" x2="0" y2="-10" strokeDasharray="3,3" />
                    </g>

                    {/* Wedge Block (Internal Support) */}
                    <g 
                      className="transition-all hover:fill-current/5 cursor-pointer"
                      onMouseEnter={() => handlePartHover("Internal Phone Holster Support", "Fold this wedge and glue it inside the cabinet. It rests behind the phone to hold it at a perfect viewing angle.")}
                      onMouseLeave={handlePartLeave}
                    >
                      <rect x="100" y="680" width="180" height="150" />
                      <line x1="100" y1="730" x2="280" y2="730" strokeDasharray="4,4" />
                      <line x1="100" y1="780" x2="280" y2="780" strokeDasharray="4,4" />
                      <text x="190" y="705" textAnchor="middle" className="text-[10px] fill-current stroke-none font-bold opacity-60">INTERNAL SUPPORT</text>
                    </g>

                  </g>
                </svg>
              )}

              {selectedModel === 'robot' && (
                <svg viewBox="0 0 900 900" className="w-full h-auto stroke-current fill-none transition-all duration-300" strokeWidth="1.5">
                  <g className="print:text-black">
                    <text x="450" y="40" textAnchor="middle" className="text-xl font-black fill-current stroke-none tracking-widest uppercase">ROBOT MECH-SUIT DOCK BLUEPRINT</text>
                    <text x="450" y="65" textAnchor="middle" className="text-xs font-mono fill-current stroke-none tracking-wider opacity-60">— Advanced Articulated Cybernetic Frame —</text>

                    {/* MAIN ROBOT BOARD PLATE */}
                    <g 
                      className="transition-all hover:fill-current/5 cursor-pointer"
                      onMouseEnter={() => handlePartHover("Mech Core Chassis", "The massive central body holding your phone. Detailed with hydraulic tubing and heat-sink grills.")}
                      onMouseLeave={handlePartLeave}
                    >
                      {/* Backplate contour */}
                      <path d="M 280 180 L 340 100 L 560 100 L 620 180 L 620 540 L 560 620 L 340 620 L 280 540 Z" />
                      
                      {/* Inner phone cavity outline */}
                      <rect x="320" y="160" width="260" height="420" rx="8" className="stroke-current opacity-30" strokeDasharray="3,3" />
                      
                      {/* Fold line for arm clamps */}
                      <line x1="280" y1="300" x2="280" y2="440" strokeDasharray="4,4" />
                      <line x1="620" y1="300" x2="620" y2="440" strokeDasharray="4,4" />

                      {/* Decorative robot face/chest details */}
                      <g className="stroke-current opacity-40" strokeWidth="1.5">
                        <circle cx="410" cy="140" r="18" />
                        <circle cx="490" cy="140" r="18" />
                        <rect x="420" y="180" width="60" height="12" rx="4" />
                        {/* Heat sink grills */}
                        <line x1="330" y1="580" x2="400" y2="580" />
                        <line x1="330" y1="590" x2="400" y2="590" />
                        <line x1="330" y1="600" x2="400" y2="600" />
                        
                        <line x1="500" y1="580" x2="570" y2="580" />
                        <line x1="500" y1="590" x2="570" y2="590" />
                        <line x1="500" y1="600" x2="570" y2="600" />
                        
                        {/* Printed tracks (PCB decoration) */}
                        <path d="M 320 220 L 370 220 L 390 240 L 390 300" strokeWidth="2" />
                        <circle cx="390" cy="300" r="5" fill="currentColor" />
                        <path d="M 580 220 L 530 220 L 510 240 L 510 300" strokeWidth="2" />
                        <circle cx="510" cy="300" r="5" fill="currentColor" />
                      </g>
                    </g>

                    {/* ARTICULATING GRIPPING ARMS */}
                    <g 
                      className="transition-all hover:fill-current/5 cursor-pointer"
                      onMouseEnter={() => handlePartHover("Hydraulic Gripper Arms", "Fold these horizontal appendages forward at the joints. They wrap around the phone, mimicking robot claws.")}
                      onMouseLeave={handlePartLeave}
                    >
                      {/* Left Arm */}
                      <path d="M 280 300 L 150 320 L 150 420 L 280 440 Z" />
                      <line x1="230" y1="310" x2="230" y2="430" strokeDasharray="3,3" />
                      <line x1="180" y1="316" x2="180" y2="424" strokeDasharray="3,3" />
                      <circle cx="190" cy="370" r="10" className="opacity-40" />
                      
                      {/* Right Arm */}
                      <path d="M 620 300 L 750 320 L 750 420 L 620 440 Z" />
                      <line x1="670" y1="310" x2="670" y2="430" strokeDasharray="3,3" />
                      <line x1="720" y1="316" x2="720" y2="424" strokeDasharray="3,3" />
                      <circle cx="710" cy="370" r="10" className="opacity-40" />
                    </g>

                    {/* REAR TRIANGULAR A-FRAME (HYDRAULIC STRUT) */}
                    <g 
                      className="transition-all hover:fill-current/5 cursor-pointer"
                      onMouseEnter={() => handlePartHover("Hydraulic Support Strut", "Fold this massive reinforced leg backward. Features printed hydraulic cylinders for extra mechanical flair.")}
                      onMouseLeave={handlePartLeave}
                    >
                      <path d="M 340 620 L 340 820 L 400 860 L 500 860 L 560 820 L 560 620 Z" />
                      <line x1="340" y1="670" x2="560" y2="670" strokeDasharray="5,5" />
                      <line x1="340" y1="760" x2="560" y2="760" strokeDasharray="5,5" />
                      
                      {/* Hydraulic Pistons Decal */}
                      <g className="stroke-current opacity-40">
                        <rect x="420" y="690" width="20" height="50" rx="3" />
                        <rect x="425" y="740" width="10" height="30" />
                        <rect x="460" y="690" width="20" height="50" rx="3" />
                        <rect x="465" y="740" width="10" height="30" />
                      </g>
                    </g>

                    {/* BASE DOCK TRAY */}
                    <g 
                      className="transition-all hover:fill-current/5 cursor-pointer"
                      onMouseEnter={() => handlePartHover("Base Dock Tray", "A small platform extending from the bottom to catch the phone securely.")}
                      onMouseLeave={handlePartLeave}
                    >
                      <path d="M 380 620 L 380 660 L 520 660 L 520 620 Z" />
                      <line x1="380" y1="640" x2="520" y2="640" strokeDasharray="2,2" />
                      <text x="450" y="655" textAnchor="middle" className="text-[8px] fill-current stroke-none font-bold opacity-70">FOLD UP TRAY</text>
                    </g>

                    {/* AR TRACKING MARKER */}
                    <g 
                      className="transition-all hover:fill-current/5 cursor-pointer"
                      onMouseEnter={() => handlePartHover("AR Hologram Marker", "Print this marker and place it in front of the robot. Scan it using the 'AR Mode' in the app to project a 3D hologram!")}
                      onMouseLeave={handlePartLeave}
                      transform="translate(80, 720)"
                    >
                      <rect x="0" y="0" width="120" height="120" className="fill-current stroke-none" />
                      <rect x="15" y="15" width="90" height="90" className="fill-white stroke-none" />
                      <rect x="30" y="30" width="60" height="60" className="fill-current stroke-none" />
                      <path d="M 45 75 L 45 45 L 75 45 L 75 60 L 60 60 L 60 75 Z" className="fill-white stroke-none" />
                      <text x="60" y="140" textAnchor="middle" className="text-[12px] fill-current stroke-none font-black tracking-widest">AR TARGET</text>
                      <line x1="-10" y1="0" x2="130" y2="0" strokeDasharray="3,3" />
                      <line x1="120" y1="-10" x2="120" y2="130" strokeDasharray="3,3" />
                      <line x1="130" y1="120" x2="-10" y2="120" strokeDasharray="3,3" />
                      <line x1="0" y1="130" x2="0" y2="-10" strokeDasharray="3,3" />
                    </g>

                    {/* Labels */}
                    <g className="fill-current stroke-none font-bold text-[10px] opacity-75 font-mono">
                      <text x="450" y="280" textAnchor="middle" className="text-sm">MECH CORE CHASSIS</text>
                      <text x="450" y="380" textAnchor="middle" className="text-[10px] opacity-50 tracking-widest">PLACE PHONE HERE</text>
                      <text x="120" y="375" textAnchor="middle" transform="rotate(-90 120 375)" className="text-[8px]">L-HYDRAULIC CLAW</text>
                      <text x="780" y="375" textAnchor="middle" transform="rotate(90 780 375)" className="text-[8px]">R-HYDRAULIC CLAW</text>
                      <text x="450" y="800" textAnchor="middle">REAR STRUT LEG (A-FRAME)</text>
                      <text x="450" y="125" textAnchor="middle" className="text-[8px] opacity-55">OPTIC SENSORS</text>
                    </g>
                  </g>
                </svg>
              )}
            </div>

          </div>

          {/* HOVER DETAILS PANEL (Hidden on Print) */}
          <div className="p-4 border-t border-zinc-800 bg-[#0f1216] flex flex-col justify-center min-h-[70px] shrink-0 print:hidden space-y-3">
            <div className="flex items-start space-x-3 max-w-3xl">
              <div className="p-2 rounded-sm bg-[#00ffcc]/10 text-[#00ffcc] mt-0.5">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-black tracking-widest text-zinc-400 uppercase">Interactive Part Inspector</p>
                {hoveredPart ? (
                  <p className="text-xs text-white mt-0.5">
                    <strong className="text-[#00ffcc] uppercase font-bold tracking-wide">{hoveredPart}:</strong> {hoveredDescription}
                  </p>
                ) : (
                  <p className="text-xs text-zinc-500 mt-0.5 italic">Hover over any blueprint component to inspect cutting instructions, folding directions, and functional descriptions.</p>
                )}
              </div>
            </div>
            
            <div className="flex flex-col space-y-1 pl-11 text-xs text-zinc-400 font-mono">
              <p className="text-[#00ffcc] font-bold uppercase tracking-widest text-[10px]">Hardware Integration Guide (Web Serial)</p>
              <p>You can connect Antonio to real-world hardware (like an ESP32 or Arduino) via USB.</p>
              <p>The Web App streams JSON at 115200 baud: <span className="text-[#00ffcc]">{"{ x: 10, y: 5, pan: 105, tilt: 97, speaking: true, asleep: false, theme: 'cyan' }"}</span></p>
              <p>1. Connect a Servo to ESP32 Pin 2 and use the <span className="text-white">pan</span> angle (0-180°) to rotate the base.</p>
              <p>2. Connect a Servo to ESP32 Pin 4 and use the <span className="text-white">tilt</span> angle (0-180°) to tilt the phone.</p>
              <p>3. Add RGB LED Strips (WS2812B) to react to the <span className="text-white">theme</span> and <span className="text-white">speaking</span> state.</p>
            </div>
          </div>

        </div>

      </div>

      {/* CUSTOM CSS FOR PRINT HANDLING */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          /* Hide standard screen workspace */
          body * {
            visibility: hidden;
            background: transparent !important;
          }
          /* Only target the Blueprint SVG canvas */
          .print\\:w-full, .print\\:w-full * {
            visibility: visible;
          }
          .print\\:w-full {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            height: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
          }
          svg {
            width: 95% !important;
            max-width: 100% !important;
            height: auto !important;
            stroke: #000000 !important;
            color: #000000 !important;
            fill: none !important;
          }
          text {
            fill: #000000 !important;
            stroke: none !important;
          }
          /* Ensure color guide line is black/red on print */
          line[stroke="red"] {
            stroke: #ff0000 !important;
            stroke-width: 2.5px !important;
          }
        }
      `}} />
    </div>
  );
}
