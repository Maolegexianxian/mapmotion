/**
 * English (US) Language Pack
 * Contains all translatable text in the application
 */
export const enUS = {
  // Common text
  common: {
    appName: 'MapMotion',
    appDescription: 'Web Map Animation Tool',
    loading: 'Loading...',
    saving: 'Saving...',
    saved: 'Saved',
    error: 'Error',
    success: 'Success',
    warning: 'Warning',
    info: 'Info',
    confirm: 'Confirm',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    copy: 'Copy',
    paste: 'Paste',
    cut: 'Cut',
    undo: 'Undo',
    redo: 'Redo',
    save: 'Save',
    saveAs: 'Save As',
    export: 'Export',
    import: 'Import',
    preview: 'Preview',
    play: 'Play',
    pause: 'Pause',
    stop: 'Stop',
    reset: 'Reset',
    close: 'Close',
    open: 'Open',
    new: 'New',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    settings: 'Settings',
    help: 'Help',
    about: 'About',
    yes: 'Yes',
    no: 'No',
    ok: 'OK',
    apply: 'Apply',
    clear: 'Clear',
    selectAll: 'Select All',
    deselectAll: 'Deselect All',
    more: 'More',
    less: 'Less',
    expand: 'Expand',
    collapse: 'Collapse',
    refresh: 'Refresh',
    retry: 'Retry',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    finish: 'Finish',
    skip: 'Skip',
    required: 'Required',
    optional: 'Optional',
    default: 'Default',
    custom: 'Custom',
    none: 'None',
    all: 'All',
    enabled: 'Enabled',
    disabled: 'Disabled',
    on: 'On',
    off: 'Off',
  },

  // Navigation
  nav: {
    home: 'Home',
    editor: 'Editor',
    projects: 'My Projects',
    templates: 'Templates',
    settings: 'Settings',
    help: 'Help',
    logout: 'Logout',
    login: 'Login',
    signup: 'Sign Up',
  },

  // Home page
  home: {
    hero: {
      title: 'Create Professional Map Animations Easily',
      subtitle: 'No After Effects experience needed. Create stunning map animation videos in minutes.',
      cta: 'Start Creating',
      secondary: 'Browse Templates',
    },
    features: {
      title: 'Powerful Features, Simple Operation',
      mapStyles: {
        title: 'Rich Map Styles',
        description: 'Multiple beautiful map styles with custom theme support',
      },
      routeAnimation: {
        title: 'Route Animation',
        description: 'Auto-generate routes with smooth camera following',
      },
      labels: {
        title: 'Smart Labels',
        description: 'Auto collision avoidance with multiple label templates',
      },
      export: {
        title: 'High Quality Export',
        description: 'Support 1080P/4K video export, transparent PNG sequences',
      },
    },
  },

  // Editor
  editor: {
    // Tools
    tools: {
      select: 'Select',
      pan: 'Pan',
      point: 'Point',
      line: 'Line',
      polygon: 'Polygon',
      label: 'Label',
    },
    // Actions
    actions: {
      undo: 'Undo',
      redo: 'Redo',
      zoomIn: 'Zoom In',
      zoomOut: 'Zoom Out',
      fitView: 'Fit View',
    },
    // View
    view: {
      grid: 'Grid',
      rulers: 'Rulers',
      snap: 'Snap',
    },
    // Playback
    playback: {
      play: 'Play',
      pause: 'Pause',
      stop: 'Stop',
      loop: 'Loop',
    },
    // Toolbar
    toolbar: {
      newProject: 'New Project',
      openProject: 'Open Project',
      saveProject: 'Save Project',
      exportVideo: 'Export Video',
      undo: 'Undo',
      redo: 'Redo',
      zoomIn: 'Zoom In',
      zoomOut: 'Zoom Out',
      fitView: 'Fit View',
      resetView: 'Reset View',
    },
    // Panels
    panels: {
      layers: 'Layers',
      properties: 'Properties',
      timeline: 'Timeline',
      styles: 'Styles',
      assets: 'Assets',
    },
    // Layers
    layers: {
      addLayer: 'Add Layer',
      removeLayer: 'Remove Layer',
      duplicateLayer: 'Duplicate Layer',
      renameLayer: 'Rename Layer',
      lockLayer: 'Lock Layer',
      unlockLayer: 'Unlock Layer',
      showLayer: 'Show Layer',
      hideLayer: 'Hide Layer',
      layerTypes: {
        camera: 'Camera',
        path: 'Path',
        label: 'Label',
        marker: 'Marker',
        polygon: 'Polygon',
        heatmap: 'Heatmap',
        terrain: 'Terrain',
        building: 'Building',
      },
    },
    // Timeline
    timeline: {
      addItem: 'Add Item',
      removeItem: 'Remove Item',
      duration: 'Duration',
      startTime: 'Start Time',
      endTime: 'End Time',
      easing: 'Easing',
      playhead: 'Playhead',
      zoom: 'Zoom',
      snap: 'Snap',
      loop: 'Loop',
    },
    // Properties panel
    properties: {
      position: 'Position',
      rotation: 'Rotation',
      scale: 'Scale',
      opacity: 'Opacity',
      color: 'Color',
      size: 'Size',
      font: 'Font',
      text: 'Text',
      icon: 'Icon',
      animation: 'Animation',
    },
    // Styles
    styles: {
      baseMap: 'Base Map Style',
      theme: 'Theme',
      colors: 'Colors',
      fonts: 'Fonts',
      customStyle: 'Custom Style',
      saveStyle: 'Save Style',
      loadStyle: 'Load Style',
    },
    // Export
    export: {
      title: 'Export Settings',
      format: 'Format',
      resolution: 'Resolution',
      frameRate: 'Frame Rate',
      quality: 'Quality',
      startExport: 'Start Export',
      cancelExport: 'Cancel Export',
      progress: 'Export Progress',
      complete: 'Export Complete',
      failed: 'Export Failed',
      downloadFile: 'Download File',
      presets: {
        social1080p: 'Social Media 1080p',
        vertical9x16: 'Vertical 9:16',
        highQuality4k: 'High Quality 4K',
        pngSequence: 'PNG Sequence',
        transparent: 'Transparent Background',
      },
    },
    // Search
    search: {
      placeholder: 'Search places...',
      noResults: 'No results found',
      searching: 'Searching...',
      recentSearches: 'Recent Searches',
      clearHistory: 'Clear History',
    },
    // Route
    route: {
      title: 'Route Settings',
      origin: 'Origin',
      destination: 'Destination',
      waypoints: 'Waypoints',
      addWaypoint: 'Add Waypoint',
      removeWaypoint: 'Remove Waypoint',
      travelMode: 'Travel Mode',
      modes: {
        driving: 'Driving',
        walking: 'Walking',
        cycling: 'Cycling',
        flight: 'Flight',
        greatCircle: 'Great Circle',
      },
      generateRoute: 'Generate Route',
      clearRoute: 'Clear Route',
    },
    // Camera
    camera: {
      title: 'Camera Settings',
      presets: {
        dollyIn: 'Dolly In',
        dollyOut: 'Dolly Out',
        panLeft: 'Pan Left',
        panRight: 'Pan Right',
        orbit: 'Orbit',
        tilt: 'Tilt',
        zoom: 'Zoom',
        flyTo: 'Fly To',
        followPath: 'Follow Path',
      },
      settings: {
        duration: 'Duration',
        easing: 'Easing',
        strength: 'Strength',
        pitch: 'Pitch',
        bearing: 'Bearing',
        zoom: 'Zoom Level',
      },
    },
    // Label
    label: {
      title: 'Label Settings',
      templates: {
        city: 'City Label',
        poi: 'POI Label',
        annotation: 'Annotation',
        callout: 'Callout',
      },
      settings: {
        text: 'Text Content',
        fontSize: 'Font Size',
        fontWeight: 'Font Weight',
        textColor: 'Text Color',
        backgroundColor: 'Background Color',
        borderColor: 'Border Color',
        padding: 'Padding',
        borderRadius: 'Border Radius',
        showIcon: 'Show Icon',
        iconPosition: 'Icon Position',
      },
      collision: {
        title: 'Collision Detection',
        enabled: 'Enable Avoidance',
        priority: 'Priority',
        allowOverlap: 'Allow Overlap',
      },
    },
    // Data
    data: {
      title: 'Data Import',
      import: 'Import Data',
      supportedFormats: 'Supported formats: CSV, TSV, GeoJSON',
      fieldMapping: 'Field Mapping',
      preview: 'Data Preview',
      rows: 'rows',
      columns: 'columns',
      invalidData: 'Invalid data format',
      mapping: {
        name: 'Name Field',
        latitude: 'Latitude Field',
        longitude: 'Longitude Field',
        value: 'Value Field',
      },
      visualization: {
        title: 'Visualization Settings',
        type: 'Visualization Type',
        types: {
          point: 'Points',
          heatmap: 'Heatmap',
          cluster: 'Cluster',
          line: 'Lines',
          polygon: 'Polygons',
        },
        colorScale: 'Color Scale',
        sizeScale: 'Size Scale',
        minValue: 'Min Value',
        maxValue: 'Max Value',
      },
    },
  },

  // Project
  project: {
    title: 'Project',
    newProject: 'New Project',
    openProject: 'Open Project',
    saveProject: 'Save Project',
    deleteProject: 'Delete Project',
    duplicateProject: 'Duplicate Project',
    shareProject: 'Share Project',
    projectName: 'Project Name',
    lastModified: 'Last Modified',
    created: 'Created',
    untitled: 'Untitled Project',
    confirmDelete: 'Are you sure you want to delete this project? This action cannot be undone.',
    autoSaved: 'Auto Saved',
    version: 'Version',
    snapshot: 'Snapshot',
    createSnapshot: 'Create Snapshot',
    restoreSnapshot: 'Restore Snapshot',
  },

  // Template
  template: {
    title: 'Templates',
    browse: 'Browse Templates',
    useTemplate: 'Use Template',
    previewTemplate: 'Preview Template',
    categories: {
      all: 'All',
      route: 'Route Animation',
      city: 'City Introduction',
      event: 'Event Tracking',
      data: 'Data Visualization',
      brand: 'Brand Promotion',
    },
  },

  // Settings
  settings: {
    title: 'Settings',
    general: {
      title: 'General',
      language: 'Language',
      theme: 'Theme',
      themes: {
        light: 'Light',
        dark: 'Dark',
        system: 'System',
      },
    },
    editor: {
      title: 'Editor Settings',
      autoSave: 'Auto Save',
      autoSaveInterval: 'Auto Save Interval',
      snapToGrid: 'Snap to Grid',
      showRulers: 'Show Rulers',
      defaultDuration: 'Default Duration',
    },
    export: {
      title: 'Export Settings',
      defaultFormat: 'Default Format',
      defaultResolution: 'Default Resolution',
      includeWatermark: 'Include Watermark',
      includeAttribution: 'Include Attribution',
    },
    shortcuts: {
      title: 'Shortcuts',
      customize: 'Customize Shortcuts',
      reset: 'Reset to Default',
    },
    account: {
      title: 'Account',
      profile: 'Profile',
      email: 'Email',
      password: 'Password',
      changePassword: 'Change Password',
      deleteAccount: 'Delete Account',
    },
  },

  // Error messages
  errors: {
    generic: 'Something went wrong, please try again',
    network: 'Network connection failed, please check your connection',
    notFound: 'Resource not found',
    unauthorized: 'Unauthorized access',
    forbidden: 'Permission denied',
    validation: 'Invalid input data',
    fileTooBig: 'File too large',
    invalidFormat: 'Format not supported',
    exportFailed: 'Export failed',
    saveFailed: 'Save failed',
    loadFailed: 'Load failed',
    searchFailed: 'Search failed',
    routeFailed: 'Route generation failed',
  },

  // Success messages
  success: {
    saved: 'Saved successfully',
    exported: 'Exported successfully',
    deleted: 'Deleted successfully',
    copied: 'Copied successfully',
    imported: 'Imported successfully',
    updated: 'Updated successfully',
  },

  // Confirm dialogs
  confirm: {
    unsavedChanges: {
      title: 'Unsaved Changes',
      message: 'You have unsaved changes. Are you sure you want to leave?',
      save: 'Save and Leave',
      discard: 'Discard Changes',
      cancel: 'Cancel',
    },
    deleteItem: {
      title: 'Confirm Delete',
      message: 'Are you sure you want to delete this item? This action cannot be undone.',
    },
  },

  // Time units
  time: {
    seconds: 'seconds',
    minutes: 'minutes',
    hours: 'hours',
    days: 'days',
    milliseconds: 'milliseconds',
    fps: 'fps',
  },

  // Units
  units: {
    pixels: 'pixels',
    percent: 'percent',
    degrees: 'degrees',
    meters: 'meters',
    kilometers: 'kilometers',
  },
} as const;
