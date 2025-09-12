# Changelog

All notable changes to Image Studio will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.3] - 2025-09-10

### Added

- Asset store added
- History panel added
- Settings UI added
- Background removal tool added
- Tool reference guide added
- Azure Model Catalog added
- Features guide added
- Auto-sync feature added
- Image Filters, Enhancement, Upscaling, Inpainting, Outpainting, Generation, Editing added
- Stock Providers Store added
- Project Templates added
- Project Import/Export added

### Changed

- Configuration system

### Fixed

- Critical bug: `fabric: Error loading data:image/png;base64,undefined`
- Themeing issue.

## [1.0.1] - 2025-09-08

### Added

- Comprehensive error handling for image data processing
- User-friendly error messages for invalid image data
- Fallback mechanisms for edge cases
- Enhanced keyboard shortcut support with proper event handling
- Improved mouse wheel zoom functionality
- Context menu escape key handling improvements

### Fixed

- **Critical**: Image rendering error where DALL-E-3 model generates images successfully but fails to render with `fabric: Error loading data:image/png;base64,undefined`
- **Critical**: PreventDefault error in passive event listeners for keyboard shortcuts and zooming
- Backend validation to ensure b64_json exists before creating data URL
- Frontend validation for image data before rendering
- Canvas protection to prevent fabric.js from loading invalid image data
- Event listener configuration for non-passive event handling

### Changed

- Enhanced error handling throughout the application
- Improved user experience with graceful fallbacks
- Better console error management
- More robust image data validation

### Technical Improvements

- Added comprehensive validation for image data processing
- Implemented proper event listener configuration with `{ passive: false }` option
- Enhanced error logging and debugging capabilities
- Improved browser compatibility across Chrome, Firefox, Safari, and Edge

## Support

For questions about specific versions or migration issues:

- **Documentation**: Check the [Getting Started Guide](docs/getting-started.md)
- **Configuration**: See the [Configuration Guide](docs/configuration.md)
- **User Guide**: Complete [User Guide](docs/user-guide.md)
- **Issues**: Report issues on [GitHub](https://github.com/DrHazemAli/image-studio/issues)
- **Discussions**: Join discussions on [GitHub Discussions](https://github.com/DrHazemAli/image-studio/discussions)
- **LinkedIn**: Contact [LinkedIn](https://www.linkedin.com/in/drhazemali/)

---

**Legend:**

- `Added` for new features
- `Changed` for changes in existing functionality
- `Deprecated` for soon-to-be removed features
- `Removed` for now removed features
- `Fixed` for any bug fixes
- `Security` for vulnerability fixes
