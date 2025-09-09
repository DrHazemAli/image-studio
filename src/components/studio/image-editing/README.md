# Image Editing Components

Professional-grade image editing interface with Canva-style sliding panels, real-time preview, and comprehensive adjustment controls.

## 🎨 Features

- **Sliding Panels**: Modern, right-sliding panels with smooth animations
- **Real-time Preview**: Instant visual feedback with debounced updates (60fps)
- **Image Filters**: Quick filter presets and manual adjustments
- **Color Adjustments**: Professional-grade color correction tools
- **Performance Optimized**: Efficient Fabric.js integration with minimal re-renders
- **Accessibility**: Full keyboard navigation and screen reader support
- **Dark Mode**: Complete dark theme support
- **Mobile Responsive**: Touch-friendly controls and responsive layout

## 📦 Components

### Panels

#### `SlidingPanel`

Base sliding panel component with consistent behavior and styling.

```tsx
import { SlidingPanel } from "@/components/studio/image-editing";

<SlidingPanel
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Panel Title"
  icon={<Icon />}
  width="lg" // sm | md | lg | xl
  actions={<Button>Apply</Button>}
>
  <div>Panel content</div>
</SlidingPanel>;
```

#### `ImageFiltersPanel`

Complete image filters interface with presets and manual controls.

```tsx
import { ImageFiltersPanel } from "@/components/studio/image-editing";

<ImageFiltersPanel
  isOpen={isFiltersOpen}
  onClose={() => setIsFiltersOpen(false)}
  fabricCanvas={fabricCanvas}
  selectedImage={selectedImage}
  onApplyFilters={(adjustments) => {
    // Apply final adjustments
    console.log("Applied filters:", adjustments);
  }}
  onResetFilters={() => {
    // Reset to original
    console.log("Filters reset");
  }}
/>;
```

#### `ColorAdjustmentsPanel`

Professional color adjustment tools with presets and before/after preview.

```tsx
import { ColorAdjustmentsPanel } from "@/components/studio/image-editing";

<ColorAdjustmentsPanel
  isOpen={isAdjustmentsOpen}
  onClose={() => setIsAdjustmentsOpen(false)}
  fabricCanvas={fabricCanvas}
  selectedImage={selectedImage}
  onApplyAdjustments={(adjustments) => {
    // Apply final adjustments
    console.log("Applied adjustments:", adjustments);
  }}
  onResetAdjustments={() => {
    // Reset to original
    console.log("Adjustments reset");
  }}
/>;
```

### Controls

#### `AdjustmentSlider`

Professional slider control with text input, reset, and tooltips.

```tsx
import { AdjustmentSlider } from "@/components/studio/image-editing";

<AdjustmentSlider
  label="Brightness"
  value={brightness}
  onChange={setBrightness}
  min={-100}
  max={100}
  defaultValue={0}
  unit="%"
  color="orange"
  description="Adjust overall image brightness"
  showReset={true}
  formatValue={(value) => `${value > 0 ? "+" : ""}${value}%`}
/>;
```

#### `ImagePreview`

Real-time image preview with before/after toggle.

```tsx
import { ImagePreview } from "@/components/studio/image-editing";

<ImagePreview
  fabricCanvas={fabricCanvas}
  selectedImage={selectedImage}
  adjustments={currentAdjustments}
  showBeforeAfter={true}
  onToggleBeforeAfter={() => setShowBefore(!showBefore)}
/>;
```

### Hooks

#### `useRealTimePreview`

Performance-optimized hook for real-time image adjustments.

```tsx
import {
  useRealTimePreview,
  DEFAULT_ADJUSTMENTS,
  ImageAdjustments,
} from "@/components/studio/image-editing";

const {
  isProcessing,
  applyAdjustments,
  resetAdjustments,
  getCurrentAdjustments,
} = useRealTimePreview(fabricCanvas, selectedImage, {
  debounceMs: 16, // 60fps
  showProcessingIndicator: true,
  onError: (error) => console.error(error),
});

// Apply adjustments
const handleAdjustmentChange = (key: keyof ImageAdjustments, value: number) => {
  const newAdjustments = { ...currentAdjustments, [key]: value };
  applyAdjustments(newAdjustments, false); // false = debounced
};
```

## 🚀 Integration Example

### Adding to Floating Image Toolbar

```tsx
// In your floating image toolbar component
import {
  ImageFiltersPanel,
  ColorAdjustmentsPanel,
  ImageAdjustments,
} from "@/components/studio/image-editing";

export const FloatingImageToolbar = ({
  fabricCanvas,
  selectedObjects,
  onApplyFilters,
  onApplyAdjustments,
}) => {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isAdjustmentsOpen, setIsAdjustmentsOpen] = useState(false);

  const tools = [
    {
      id: "filters",
      name: "Filters",
      icon: MixerHorizontalIcon,
      tooltip: "Apply image filters and presets",
      action: () => setIsFiltersOpen(true),
    },
    {
      id: "adjustments",
      name: "Adjustments",
      icon: ColorWheelIcon,
      tooltip: "Professional color and lighting adjustments",
      action: () => setIsAdjustmentsOpen(true),
    },
  ];

  return (
    <>
      {/* Your existing toolbar UI */}

      <ImageFiltersPanel
        isOpen={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
        fabricCanvas={fabricCanvas}
        selectedImage={selectedObjects[0] || null}
        onApplyFilters={onApplyFilters}
      />

      <ColorAdjustmentsPanel
        isOpen={isAdjustmentsOpen}
        onClose={() => setIsAdjustmentsOpen(false)}
        fabricCanvas={fabricCanvas}
        selectedImage={selectedObjects[0] || null}
        onApplyAdjustments={onApplyAdjustments}
      />
    </>
  );
};
```

## 🎛️ Adjustment Types

### Basic Adjustments

- **Brightness** (-100 to 100): Overall lightness
- **Contrast** (-100 to 100): Difference between light and dark areas
- **Saturation** (-100 to 100): Color intensity
- **Hue** (-180 to 180): Color spectrum shift
- **Blur** (0 to 20): Blur effect in pixels

### Color Adjustments

- **Temperature** (-100 to 100): Warm/cool color balance
- **Tint** (-100 to 100): Green/magenta color balance
- **Vibrance** (-100 to 100): Smart saturation (protects skin tones)
- **Exposure** (-200 to 200): Overall brightness in stops

### Light Adjustments

- **Highlights** (-100 to 100): Brightest areas
- **Shadows** (-100 to 100): Darkest areas
- **Whites** (-100 to 100): Pure white areas
- **Blacks** (-100 to 100): Pure black areas

### Detail Adjustments

- **Sharpness** (0 to 100): Edge definition
- **Clarity** (-100 to 100): Midtone contrast
- **Denoise** (0 to 100): Noise reduction

### Effects

- **Sepia** (0 to 100): Sepia tone effect
- **Grayscale** (0 to 100): Black and white conversion
- **Vignette** (0 to 100): Dark edge effect
- **Opacity** (0 to 100): Transparency

## 🎨 Filter Presets

### Built-in Presets

- **Original**: No filters applied
- **Bright**: Increased brightness and contrast
- **Dramatic**: High contrast with deep shadows
- **Vintage**: Warm sepia tones
- **B&W**: High contrast black and white
- **Cinematic**: Film-like color grading

### Color Adjustment Presets

- **Auto Enhance**: Automatic color correction
- **Portrait**: Optimized for skin tones
- **Landscape**: Enhanced colors and clarity
- **Fix Exposure**: Correct over/under exposed images
- **Moody**: Dark, atmospheric look

## 🎯 Performance Notes

- **Real-time Updates**: Uses 16ms debounce for smooth 60fps performance
- **Efficient Rendering**: Only re-renders when necessary
- **Memory Optimized**: Cleans up on component unmount
- **CSS Filters**: Uses browser-native CSS filters for best performance
- **Progressive Enhancement**: Graceful degradation on older browsers

## 🎨 Styling

### CSS Classes Available

```css
/* Custom scrollbar for panels */
.image-editing-panel::-webkit-scrollbar {
  width: 8px;
}

/* Slider track styling */
input[type="range"]::-webkit-slider-track {
  background: #e5e7eb;
  border-radius: 4px;
}

/* Focus states */
input[type="range"]:focus::-webkit-slider-thumb {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
}
```

### Customization

All components accept `className` props for custom styling and fully support Tailwind CSS classes.

## 🔧 TypeScript Support

Full TypeScript support with comprehensive type definitions:

```tsx
import type {
  ImageAdjustments,
  PreviewConfig,
  SlidingPanelProps,
  AdjustmentSliderProps,
  ImagePreviewProps,
} from "@/components/studio/image-editing";
```

## 📱 Browser Support

- Chrome 88+
- Firefox 84+
- Safari 14+
- Edge 88+

## 🤝 Contributing

When extending these components:

1. **Follow existing patterns** for consistency
2. **Add TypeScript types** for all new props
3. **Include accessibility attributes** (ARIA labels, keyboard navigation)
4. **Test on mobile devices** for touch interactions
5. **Update documentation** for new features

## 📄 License

Part of the Azure GenAI Image project - see main project license.
